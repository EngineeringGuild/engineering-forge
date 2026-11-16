"""Teste de tools/backlog_mestre.py (cópia Guild do modelo do parque-uranio, PR #1281).

Os oito casos do modelo, com o plano no formato guild-plano/2, mais dois da adaptação:
dependência de outro repositório e decisão citada que não existe.
"""
import datetime as dt
import importlib.util
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parents[1]
FERR = str(RAIZ / "tools/backlog_mestre.py")
spec = importlib.util.spec_from_file_location("backlog_mestre", FERR)
bm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bm)
AGORA = dt.datetime(2026, 11, 16, 12, 0, tzinfo=dt.timezone.utc)
EXECUTOR = "gemini-aistudio"


def tarefa(i, titulo, tipo="codigo", alcance="repo", esforco="M", deps=(), dec=None):
    t = {"id": i, "titulo": titulo, "como": "x", "pronto_quando": "y", "verificacao": "z", "evidencia": "e.md",
         "tipo": tipo, "alcance": alcance, "esforco": esforco, "depende_de": list(deps), "estado": "A_FAZER"}
    if dec:
        t["decisao"] = dec
    return t


def repo_de_mentira(tmp: Path, compl=None, duvidas=(), extra=()):
    h = tmp / bm.H_REL
    (h / "BACKLOG").mkdir(parents=True), (h / "RESERVAS").mkdir(), (h / "FILA_DE_DUVIDAS").mkdir()
    tarefas = [tarefa("TST-1.1-01", "portão de teste", dec="D-01"),
               tarefa("TST-1.1-02", "ficha de sistema", tipo="doc", deps=["TST-1.1-01"]),
               tarefa("TST-1.1-03", "prancha", tipo="doc", dec="D-02"),
               tarefa("TST-1.1-04", "integração", alcance="entre_repos"),
               tarefa("TST-1.1-05", "fontes", tipo="pesquisa"),
               tarefa("TST-1.1-06", "gerador x"), tarefa("TST-1.1-07", "script y"), tarefa("TST-1.1-08", "patch z"),
               tarefa("TST-1.1-09", "catraca w")] + list(extra)
    plano = {"esquema": "guild-plano/2", "sigla": "TST", "decisoes": [{"id": "D-01", "estado": "DECIDIDA"}, {"id": "D-02", "estado": "ABERTA"}],
             "fases": [{"id": 1, "nome": "f", "secoes": [{"id": "1.1", "nome": "s", "tarefas": tarefas}]}]}
    (tmp / bm.PLANO_REL).write_text(yaml.safe_dump(plano, allow_unicode=True), encoding="utf-8")
    for nome in ("TIPOS.yaml", "COMPETENCIAS.yaml"):
        (h / "BACKLOG" / nome).write_text((RAIZ / bm.H_REL / "BACKLOG" / nome).read_text(encoding="utf-8"), encoding="utf-8")
    c = yaml.safe_load((h / "BACKLOG/COMPETENCIAS.yaml").read_text(encoding="utf-8"))
    c["dono_por_secao"] = {}
    c["agentes"][EXECUTOR]["ativo"] = True      # o teste é da ferramenta, não do elenco do repositório (no hub o AI Studio está inativo)
    c["dono_por_alcance"] = {"repo": EXECUTOR, "entre_repos": "executor-programa", "infra": "executor-programa"}
    (h / "BACKLOG/COMPETENCIAS.yaml").write_text(yaml.safe_dump(c, allow_unicode=True), encoding="utf-8")
    (h / "BACKLOG/COMPLEMENTO.yaml").write_text(yaml.safe_dump({"tarefas": compl or []}, allow_unicode=True), encoding="utf-8")
    for q in duvidas:
        (h / "FILA_DE_DUVIDAS" / f"{q['id']}.yaml").write_text(yaml.safe_dump(q, allow_unicode=True), encoding="utf-8")
    return tmp


def por_id(tmp):
    saida, erros = bm.montar(bm.carregar(tmp))
    return {r["tarefa"]: r for r in saida}, erros


class Backlog(unittest.TestCase):
    def test_decisao_decidida_nao_trava_e_aberta_trava(self):
        with tempfile.TemporaryDirectory() as d:
            t, erros = por_id(repo_de_mentira(Path(d)))
            self.assertEqual(erros, [])
            self.assertEqual(t["TST-1.1-01"]["estado"], "LIVRE")
            self.assertEqual(t["TST-1.1-03"]["estado"], "DECISAO")
            self.assertEqual(t["TST-1.1-02"]["estado"], "BLOQUEADA")
            self.assertEqual(t["TST-1.1-01"]["destrava"], 1)

    def test_duvida_dura_trava_e_caso_de_trabalho_libera(self):
        dura = {"id": "Q-1", "estado": "ABERTA", "trava": ["TST-1.1-05"], "caso_de_trabalho": None}
        branda = {"id": "Q-2", "estado": "ABERTA", "trava": ["TST-1.1-06"], "caso_de_trabalho": {"texto": "x", "autorizado": True}}
        with tempfile.TemporaryDirectory() as d:
            t, _ = por_id(repo_de_mentira(Path(d), duvidas=(dura, branda)))
            self.assertEqual(t["TST-1.1-05"]["estado"], "DECISAO")
            self.assertEqual(t["TST-1.1-06"]["estado"], "LIVRE_COM_CASO_DE_TRABALHO")

    def test_tipo_declarado_aceite_proprio_e_papeis(self):
        with tempfile.TemporaryDirectory() as d:
            t, _ = por_id(repo_de_mentira(Path(d)))
            self.assertEqual((t["TST-1.1-01"]["tipo"], t["TST-1.1-01"]["tipo_origem"]), ("CODIGO", "DECLARADO"))
            self.assertIn("saída gravada", t["TST-1.1-01"]["aceite"])
            self.assertIn("PROPRIO: pronto quando: y", t["TST-1.1-01"]["aceite"])
            self.assertEqual(t["TST-1.1-01"]["dono"], EXECUTOR)
            self.assertEqual(t["TST-1.1-04"]["dono"], "executor-programa")       # o dono sai do alcance, não do plano
            self.assertEqual(t["TST-1.1-01"]["revisa"], "claude-cto")
            self.assertEqual(t["TST-1.1-01"]["veredito"], "claude-cto")

    def test_ciclo_de_reserva(self):
        with tempfile.TemporaryDirectory() as d:
            tmp = repo_de_mentira(Path(d))
            self.assertIn("RESERVADA como DONO", bm.reservar(tmp, "TST-1.1-01", EXECUTOR, None, AGORA))
            with self.assertRaises(SystemExit):
                bm.reservar(tmp, "TST-1.1-01", EXECUTOR, None, AGORA)               # já reservada
            with self.assertRaises(SystemExit):
                bm.reservar(tmp, "TST-1.1-02", EXECUTOR, None, AGORA)               # bloqueada
            with self.assertRaises(SystemExit):
                bm.reservar(tmp, "TST-1.1-03", EXECUTOR, None, AGORA)               # decisão aberta
            with self.assertRaises(SystemExit):
                bm.reservar(tmp, "TST-1.1-04", EXECUTOR, "DONO", AGORA)             # não é o dono
            with self.assertRaises(SystemExit):
                bm.mudar(tmp, "TST-1.1-01", EXECUTOR, "entregar", AGORA)            # sem --pr
            self.assertIn("ENTREGUE", bm.mudar(tmp, "TST-1.1-01", EXECUTOR, "entregar", AGORA, pr="#9"))
            t, _ = por_id(tmp)
            self.assertEqual(t["TST-1.1-01"]["estado"], "ENTREGUE")
            self.assertEqual(t["TST-1.1-02"]["estado"], "BLOQUEADA")               # entregue não é aceita
            f = bm.carregar(tmp)
            saida, _ = bm.montar(f)
            self.assertIn("TST-1.1-01", [r["tarefa"] for r in bm.livres_para(saida, f, "claude-cto")["revisa"]])
            self.assertNotIn("TST-1.1-01", [r["tarefa"] for r in bm.livres_para(saida, f, EXECUTOR)["revisa"]])  # autor não revisa
            self.assertIn("ACEITA", bm.mudar(tmp, "TST-1.1-01", EXECUTOR, "aceitar", AGORA))
            with self.assertRaises(SystemExit):
                bm.mudar(tmp, "TST-1.1-01", EXECUTOR, "liberar", AGORA)             # aceita não se libera

    def test_limite_em_curso_e_liberar(self):
        with tempfile.TemporaryDirectory() as d:
            tmp = repo_de_mentira(Path(d))
            limite = yaml.safe_load((tmp / bm.H_REL / "BACKLOG/COMPETENCIAS.yaml").read_text())["agentes"][EXECUTOR]["limite_em_curso"]
            livres = ["TST-1.1-01", "TST-1.1-06", "TST-1.1-07", "TST-1.1-08", "TST-1.1-09"]
            for t in livres[:limite]:
                bm.reservar(tmp, t, EXECUTOR, None, AGORA)
            with self.assertRaises(SystemExit):
                bm.reservar(tmp, livres[limite], EXECUTOR, None, AGORA)             # passou do limite
            bm.mudar(tmp, livres[limite - 1], EXECUTOR, "liberar", AGORA, nota="sem cota")
            self.assertIn("RESERVADA", bm.reservar(tmp, livres[limite], EXECUTOR, None, AGORA))
            t, _ = por_id(tmp)
            self.assertEqual(t[livres[limite - 1]]["estado"], "LIVRE")

    def test_reserva_vencida_aparece_na_saude(self):
        with tempfile.TemporaryDirectory() as d:
            tmp = repo_de_mentira(Path(d))
            bm.reservar(tmp, "TST-1.1-01", EXECUTOR, None, AGORA - dt.timedelta(hours=100))
            self.assertIn(f"TST-1.1-01 por {EXECUTOR}", "\n".join(bm.saude(tmp, AGORA)))

    def test_complemento_absorvida_some_e_erro_de_fonte(self):
        base = {"id": "TSTC-01", "titulo": "x", "tipo": "DOCUMENTO", "dono": EXECUTOR, "horas": 2, "prioridade": "A",
                "aceite": "y", "origem": "issue #1", "depende_de": [], "absorvida_por": ""}
        with tempfile.TemporaryDirectory() as d:
            t, erros = por_id(repo_de_mentira(Path(d), compl=[base, dict(base, id="TSTC-02", absorvida_por="TST-1.1-01")]))
            self.assertIn("TSTC-01", t), self.assertNotIn("TSTC-02", t), self.assertEqual(erros, [])
            self.assertIn("PROPRIO: y", t["TSTC-01"]["aceite"])
        with tempfile.TemporaryDirectory() as d:
            t, erros = por_id(repo_de_mentira(Path(d), compl=[dict(base, absorvida_por="TST-1.1-01"), dict(base, id="TSTC-09", depende_de=["TSTC-01"])]))
            self.assertEqual(erros, []), self.assertEqual(t["TSTC-09"]["bloqueada_por"], "TST-1.1-01")
        with tempfile.TemporaryDirectory() as d:
            _, erros = por_id(repo_de_mentira(Path(d), compl=[dict(base, tipo="INVENTADO"), dict(base, id="TSTC-03", aceite="")]))
            self.assertEqual(len(erros), 2)

    def test_dependencia_de_outro_repositorio_e_decisao_desconhecida(self):
        extra = [tarefa("TST-1.1-10", "espera a economia", deps=["ECO-9.9-01"]), tarefa("TST-1.1-11", "decisão que não existe", dec="D-99")]
        with tempfile.TemporaryDirectory() as d:
            t, erros = por_id(repo_de_mentira(Path(d), extra=extra))
            self.assertEqual(erros, [])
            self.assertEqual(t["TST-1.1-10"]["estado"], "BLOQUEADA")              # o plano vizinho não está ao lado: conta como aberta
            self.assertEqual(t["TST-1.1-10"]["bloqueada_por"], "ECO-9.9-01")
            self.assertEqual(t["TST-1.1-11"]["estado"], "DECISAO")                # decisão não encontrada conta como aberta

    def test_checar_nao_escreve_e_backlog_real_em_dia(self):
        p = RAIZ / bm.H_REL / "BACKLOG_MESTRE.csv"
        antes = p.stat().st_mtime_ns
        r = subprocess.run([sys.executable, FERR, "--checar"], capture_output=True, text=True, cwd=RAIZ)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertEqual(p.stat().st_mtime_ns, antes)
        saida, erros = bm.montar(bm.carregar(RAIZ))
        self.assertEqual(erros, [])
        self.assertTrue(all(r["aceite"] for r in saida))


if __name__ == "__main__":
    unittest.main()
