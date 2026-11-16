#!/usr/bin/env python3
"""Backlog mestre dos agentes, v2 — copia para os repositorios da Guild (adaptacao Guild 1).

ORIGEM: EngineeringGuild/parque-uranio, tools/backlog_mestre.py (main 19eedd1dc, PR #1281), padrao TXT-439-GUILD.
O QUE MUDOU NA COPIA (e so isto; nomes de coluna iguais aos do reator):
  a. H_REL e PLANO_REL apontam para plano/ e plano/TAREFAS.yaml (esquema guild-plano/2).
  b. carregar() le plano/TAREFAS.yaml no lugar do BLUEPRINT_TAREFAS.csv: tipo vem declarado na tarefa; dono vem de
     COMPETENCIAS.yaml (dono_por_secao, dono_por_alcance), porque o plano da Guild nao nomeia agente; horas vem do
     esforco (P, M, G -> horas_por_esforco); folga e calculada aqui pelo caminho critico local; o aceite proprio e o
     pronto_quando + a verificacao da tarefa. Tarefa FEITO ou CANCELADO nao entra (o blueprint do reator so lista abertas).
  c. Decisoes: as do proprio plano e as da copia docs/guild-standards/ESTADO_DA_GUILD.yaml. Decisao citada e nao
     encontrada conta como ABERTA (a v1 do reator escondia tarefa pelo erro contrario).
  d. Dependencia de tarefa de outro repositorio: fechada so se a copia ESTADO_DA_GUILD.yaml a listar em
     tarefas_fechadas; senao conta como aberta e a tarefa fica BLOQUEADA. Unica linha mudada em montar().
     A copia e versionada (nada depende de outro repositorio estar clonado ao lado): a saida e a mesma em qualquer maquina.
  e. SQLite padrao em ~/.cache/guild-backlog/<repositorio>.db.

Texto original do reator, valido para o resto:

O QUE E
-------
UMA lista com tudo que falta, gerada de fontes versionadas, para cada agente pegar sozinho a proxima tarefa da sua
competencia, entregar, ser pre-revisado por outro agente e seguir. Nada e digitado na saida.

FONTES (somente leitura)
  handoffs/BLUEPRINT/BLUEPRINT_TAREFAS.csv   tarefas abertas do plano macro (gerado por tools/blueprint.py)
  handoffs/BACKLOG/COMPLEMENTO.yaml          tarefas que ainda nao tem id no plano (somem quando `absorvida_por` e preenchido)
  handoffs/BACKLOG/TIPOS.yaml                tipo de trabalho -> aceite, evidencia, quem pre-revisa, quem da veredito
  handoffs/BACKLOG/COMPETENCIAS.yaml         agente -> tipos que entrega, prepara e revisa; limite em curso; regras de tipo
  handoffs/RESERVAS/<tarefa>__<agente>.yaml  estado de cada tarefa pega (um arquivo por tarefa e agente: sem conflito de merge)
  handoffs/FILA_DE_DUVIDAS/*.yaml            duvida ABERTA que trava a tarefa (so trava de verdade sem caso de trabalho autorizado)
  PLANO_DE_FINALIZACAO.yaml (decisoes)       DC ainda ABERTA

O QUE MUDOU DA v1 (defeitos corrigidos)
  1. A v1 escondia 48 tarefas como "decisao do Caio" porque lia o campo `dc` do plano, que e a decisao que GOVERNA a
     tarefa (58 de 59 ja DECIDIDAS). Agora so trava DC ABERTA ou duvida ABERTA sem caso de trabalho autorizado.
  2. O aceite era a mesma frase nas 200 linhas. Agora vem do TIPO da tarefa (e do campo proprio, no complemento).
  3. "Competencia" ficava a juizo do agente. Agora esta declarada e a reserva recusa o que o agente nao pode pegar.
  4. A reserva nao tinha estado, validade nem limite. Agora tem (RESERVADA, ENTREGUE, EM_REVISAO, DEVOLVIDA, ACEITA,
     LIBERADA), recusa segunda reserva no mesmo papel e respeita o limite em curso do agente.
  5. So o CTO revisava. Agora ha fila de PRE-REVISAO por outro agente (autor nunca revisa a propria entrega).
  6. Trabalho fora do plano macro (padrao das fotos, indices) ficava em texto de MSG. Agora entra pelo COMPLEMENTO; quando
     a tarefa ganha id no plano, `absorvida_por` a tira da lista e quem dependia dela passa a depender do id novo.
  7. `--checar` regravava os arquivos. Agora nao escreve nada.
  8. A ordem era so a folga. Agora desempata por quantas tarefas a tarefa destrava.

PAPEIS DE UM AGENTE NUMA TAREFA
  DONO     entrega a tarefa inteira (PR rascunho + RETORNO).
  PREPARA  entrega o preparo de uma tarefa de outro dono: PREPARO-<agente>-<tarefa>.md (entradas, roteiro, caso de fumaca,
           lista de cotas ou fontes). Nunca o veredito.
  REVISA   pre-revisao da entrega de outro: REVISAO-<agente>-<tarefa>.md, item a item do aceite do tipo.

USO
  python3 tools/backlog_mestre.py                              regrava BACKLOG_MESTRE.csv e BACKLOG_POR_AGENTE.md
  python3 tools/backlog_mestre.py --checar                     compara sem escrever (sai 1 se vencido, 2 se a fonte tem erro)
  python3 tools/backlog_mestre.py proxima <agente> [--horas H] as proximas tarefas que o agente pode pegar
  python3 tools/backlog_mestre.py reservar <tarefa> <agente> [--papel DONO|PREPARA|REVISA]
  python3 tools/backlog_mestre.py entregar <tarefa> <agente> --pr N
  python3 tools/backlog_mestre.py liberar <tarefa> <agente> [--nota "..."]
  python3 tools/backlog_mestre.py aceitar|devolver <tarefa> <agente> [--nota "..."]      (so o CTO)
  python3 tools/backlog_mestre.py saude                        reservas vencidas, limites, fontes incompletas (nao grava)
  python3 tools/backlog_mestre.py db [caminho]                 SQLite para consulta, FORA do git (padrao ~/.cache/parque-uranio/backlog.db)
CONCEPT — SEM VALOR DE LICENCIAMENTO — SEM ALEGACAO DE SEGURANCA.
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import io
import re
import sqlite3
import subprocess
import sys
from pathlib import Path

import yaml

RAIZ = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
H_REL = "plano"
PLANO_REL = "plano/TAREFAS.yaml"
ESTADO_GUILD_REL = "docs/guild-standards/ESTADO_DA_GUILD.yaml"   # copia gerada no hub: decisoes e tarefas fechadas do programa
FECHADAS = ("FEITO", "CANCELADO")
# tipo do plano guild-plano/2 -> tipo do backlog (TIPOS.yaml)
TIPO_DO_PLANO = {"doc": "DOCUMENTO", "pesquisa": "PESQUISA", "codigo": "CODIGO", "teste": "TESTE", "infra": "INFRA", "decisao": "DECISAO"}
COLUNAS = ["prioridade", "tarefa", "origem", "onda", "lote", "tipo", "tipo_origem", "tamanho", "horas", "folga_h", "destrava",
           "estado", "estado_plano", "bloqueada_por", "trava_de_decisao", "dono", "prepara", "revisa", "reserva", "pr",
           "titulo", "aceite", "veredito", "referencia"]
ESTADOS_ABERTOS = ("RESERVADA", "ENTREGUE", "EM_REVISAO", "DEVOLVIDA")
FOLGA_DA_PRIORIDADE = {"A": 0.0, "B": 24.0, "C": 72.0}
SEM_FOLGA = 9999.0


class ErroDeFonte(Exception):
    pass


def _yaml(p: Path):
    return yaml.safe_load(p.read_text(encoding="utf-8")) or {}


def _lista(v) -> list[str]:
    if not v:
        return []
    if isinstance(v, (list, tuple)):
        return [str(x) for x in v if str(x)]
    return [x for x in re.split(r"[|,; ]+", str(v)) if x]


def _tarefas_do_plano(p: Path) -> list[dict]:
    d = _yaml(p)
    return [dict(t, _secao=str(se["id"])) for fa in d.get("fases") or [] for se in fa.get("secoes") or [] for t in se.get("tarefas") or []]


def _folga_local(abertas: dict[str, dict], horas: dict[str, float]) -> dict[str, float]:
    """Caminho critico so com as tarefas abertas deste repositorio; folga em horas."""
    ordem, visto = [], set()
    def topo(i):
        if i in visto: return
        visto.add(i)
        for d in abertas[i]["depende_de"] or []:
            if d in abertas: topo(d)
        ordem.append(i)
    for i in sorted(abertas): topo(i)
    cedo = {}
    for i in ordem:
        ini = max((cedo[d] for d in abertas[i]["depende_de"] or [] if d in abertas), default=0.0)
        cedo[i] = ini + horas[i]
    total = max(cedo.values(), default=0.0)
    filhos = {i: [j for j in abertas if i in (abertas[j]["depende_de"] or [])] for i in abertas}
    tarde = {}
    for i in reversed(ordem):
        tarde[i] = min((tarde[f] - horas[f] for f in filhos[i]), default=total)
    return {i: round(tarde[i] - cedo[i], 1) for i in abertas}


def carregar(raiz: Path = RAIZ) -> dict:
    h = raiz / H_REL
    tipos = _yaml(h / "BACKLOG/TIPOS.yaml")["tipos"]
    comp = _yaml(h / "BACKLOG/COMPETENCIAS.yaml")
    todas = _tarefas_do_plano(raiz / PLANO_REL)
    abertas = {t["id"]: t for t in todas if t.get("estado") not in FECHADAS}
    hpe = comp.get("horas_por_esforco") or {"P": 2, "M": 6, "G": 12}
    horas = {i: float(hpe.get(t.get("esforco"), 0) or 0) for i, t in abertas.items()}
    folga = _folga_local(abertas, horas)
    por_secao, por_alcance = comp.get("dono_por_secao") or {}, comp.get("dono_por_alcance") or {}
    declarados = dict(comp.get("tipos_declarados") or {})
    # dependencias de outro repositorio: fechadas so se a copia do estado da Guild disser
    estado_guild = _yaml(raiz / ESTADO_GUILD_REL) if (raiz / ESTADO_GUILD_REL).exists() else {}
    fechadas_fora = set(estado_guild.get("tarefas_fechadas") or [])
    locais = {x["id"] for x in todas}
    externas_abertas = {d for t in abertas.values() for d in t.get("depende_de") or []
                        if d not in locais and d not in fechadas_fora}
    plano = []
    for i, t in abertas.items():
        dono = por_secao.get(t["_secao"]) or por_alcance.get(t.get("alcance")) or ""
        if t.get("tipo") == "decisao" and comp.get("dono_de_decisao"):
            dono = comp["dono_de_decisao"]
        declarados.setdefault(i, TIPO_DO_PLANO.get(str(t.get("tipo", "")), str(t.get("tipo", "")).upper()))
        dec = t.get("decisao") or []
        dec = [dec] if isinstance(dec, str) else dec
        estado_plano = t.get("estado", "A_FAZER")
        plano.append({"tarefa": i, "estado": estado_plano, "lote": t["_secao"], "h": f"{horas[i]:g}",
                      "folga_h": f"{folga[i]:g}", "dono": dono, "apoio": "", "ajuda_proposta": "",
                      "depende_de": "|".join(t.get("depende_de") or []), "decisao": "|".join(dec),
                      "titulo": t.get("titulo", ""),
                      "evidencia_no_plano": t.get("evidencia", ""), "prs_abertas": "",
                      "_aceite": f"pronto quando: {t.get('pronto_quando', '')} / verificacao: {t.get('verificacao', '')}"})
    comp["tipos_declarados"] = declarados
    compl = _yaml(h / "BACKLOG/COMPLEMENTO.yaml").get("tarefas") or []
    reservas = []
    for p in sorted((h / "RESERVAS").glob("*__*.yaml")) if (h / "RESERVAS").exists() else []:
        r = _yaml(p)
        t, a = p.stem.split("__", 1)
        r.setdefault("tarefa", t), r.setdefault("agente", a)
        r.setdefault("papel", "DONO")
        r.setdefault("estado", "ENTREGUE" if str(r.get("pr") or "").strip() else "RESERVADA")
        reservas.append(r)
    duvidas = [_yaml(p) for p in sorted((h / "FILA_DE_DUVIDAS").glob("Q-*.yaml"))] if (h / "FILA_DE_DUVIDAS").exists() else []
    dcs = {}
    for fonte in (estado_guild, _yaml(raiz / PLANO_REL)):
        for d in (fonte.get("decisoes") or []):
            if isinstance(d, dict) and d.get("id"):
                dcs[str(d["id"])] = str(d.get("estado") or "")
    for x in plano:   # decisao citada e nao encontrada conta como aberta
        for d in _lista(x["decisao"]):
            dcs.setdefault(d, "ABERTA (nao encontrada)")
    return {"tipos": tipos, "comp": comp, "plano": plano, "compl": compl, "reservas": reservas, "duvidas": duvidas, "dcs": dcs,
            "externas_abertas": externas_abertas}


def _tipo_por_regra(titulo: str, dono: str, comp: dict) -> tuple[str, str]:
    """Tipo de uma tarefa do plano que nao declara tipo. A regra pelo titulo e indicio; a regra pelo dono e so palpite."""
    for r in comp.get("regras_de_tipo") or []:
        if "se_titulo" in r and re.search(r["se_titulo"], titulo, flags=re.I):
            return r["tipo"], "REGRA_TITULO"
        if "se_dono" in r and r["se_dono"] == dono:
            return r["tipo"], "REGRA_DONO"
    return "DOCUMENTO", "REGRA_DONO"


def montar(f: dict) -> tuple[list[dict], list[str]]:
    tipos, comp, erros = f["tipos"], f["comp"], []
    agentes = comp["agentes"]
    ativos = [a for a, c in agentes.items() if c.get("ativo")]
    declarados = comp.get("tipos_declarados") or {}
    tarefas: dict[str, dict] = {}
    for x in f["plano"]:
        tid = x["tarefa"]
        tipo = declarados.get(tid)
        por_regra, origem_regra = _tipo_por_regra(x["titulo"], x["dono"], comp)
        tarefas[tid] = {
            "tarefa": tid, "origem": "PLANO", "onda": "W" + ".".join(tid.split("-")[0].lstrip("T").split(".")[:2]),
            "lote": x["lote"] if x["lote"] not in ("", "-") else "", "titulo": x["titulo"][:300],
            "tipo": tipo or por_regra, "tipo_origem": "DECLARADO" if tipo else origem_regra, "so_o_dono": False,
            "horas": x["h"], "folga": float(x["folga_h"]) if x["folga_h"] else SEM_FOLGA,
            "deps": _lista(x["depende_de"]), "dcs": _lista(x["decisao"]), "duvida": "", "estado_plano": x["estado"],
            "dono": x["dono"], "apoio": [a for a in _lista(x["apoio"]) + _lista(x["ajuda_proposta"])],
            "aceite_proprio": x.get("_aceite", ""), "referencia": x["evidencia_no_plano"][:200], "prs_abertas": x["prs_abertas"],
        }
    apelido = {str(x.get("id")): str(x.get("absorvida_por")).strip() for x in f["compl"] if str(x.get("absorvida_por") or "").strip()}
    for x in f["compl"]:
        faltam = [c for c in ("id", "titulo", "tipo", "dono", "horas", "prioridade", "aceite", "origem") if not str(x.get(c) or "").strip()]
        if faltam:
            erros.append(f"COMPLEMENTO {x.get('id', '?')}: falta {', '.join(faltam)}")
            continue
        if str(x.get("absorvida_por") or "").strip():
            continue
        tid = str(x["id"])
        if tid in tarefas:
            erros.append(f"COMPLEMENTO {tid}: id repetido")
            continue
        if x["prioridade"] not in FOLGA_DA_PRIORIDADE:
            erros.append(f"COMPLEMENTO {tid}: prioridade {x['prioridade']!r} fora de A, B, C")
            continue
        tarefas[tid] = {
            "tarefa": tid, "origem": "COMPLEMENTO", "onda": tid.split("-")[0], "lote": "", "titulo": str(x["titulo"])[:300],
            "tipo": x["tipo"], "tipo_origem": "DECLARADO", "so_o_dono": bool(x.get("so_o_dono")), "horas": str(x["horas"]),
            "folga": FOLGA_DA_PRIORIDADE[x["prioridade"]],
            "deps": [apelido.get(d, d) for d in _lista(x.get("depende_de"))], "dcs": [], "duvida": str(x.get("decisao") or ""),
            "estado_plano": "FALTA",
            "dono": x["dono"], "apoio": _lista(x.get("apoio")), "aceite_proprio": str(x["aceite"]),
            "referencia": str(x["origem"])[:200], "prs_abertas": "",
        }
    # dependencias, destrava e travas de decisao
    dependentes: dict[str, set[str]] = {t: set() for t in tarefas}
    for t in tarefas.values():
        if t["tipo"] not in tipos:
            erros.append(f"{t['tarefa']}: tipo {t['tipo']!r} nao existe em TIPOS.yaml")
        if t["dono"] not in agentes and t["dono"] != "caio":
            erros.append(f"{t['tarefa']}: dono {t['dono']!r} nao existe em COMPETENCIAS.yaml")
        for d in t["deps"]:
            if d in dependentes:
                dependentes[d].add(t["tarefa"])
            elif d.startswith("PF-"):
                erros.append(f"{t['tarefa']}: depende de {d}, que nao existe no complemento")

    def alcance(tid: str) -> int:
        visto, pilha = set(), [tid]
        while pilha:
            for n in dependentes.get(pilha.pop(), ()):
                if n not in visto:
                    visto.add(n), pilha.append(n)
        return len(visto)

    duras: dict[str, list[str]] = {}
    brandas: dict[str, list[str]] = {}
    por_id = {str(q.get("id")): q for q in f["duvidas"]}
    for q in f["duvidas"]:
        if str(q.get("estado")) != "ABERTA":
            continue
        caso = q.get("caso_de_trabalho")
        alvo = brandas if isinstance(caso, dict) and caso.get("autorizado") else duras
        for t in _lista(q.get("trava")):
            alvo.setdefault(t, []).append(str(q["id"]))
    reservas = [r for r in f["reservas"] if r["estado"] != "LIBERADA"]
    saida = []
    for t in tarefas.values():
        tid = t["tarefa"]
        bloq = [d for d in t["deps"] if d in tarefas or d in f.get("externas_abertas", ())]   # Guild: (d)
        travas = [d for d in t["dcs"] if f["dcs"].get(d, "").upper().startswith("ABERT")] + duras.get(tid, [])
        if t["duvida"]:
            q = por_id.get(t["duvida"])
            if q is None:
                erros.append(f"{tid}: duvida {t['duvida']!r} nao existe na fila")
            elif str(q.get("estado")) == "ABERTA" and not (isinstance(q.get("caso_de_trabalho"), dict) and q["caso_de_trabalho"].get("autorizado")):
                travas.append(t["duvida"])
        minhas = [r for r in reservas if r["tarefa"] == tid]
        do_dono = [r for r in minhas if r["papel"] == "DONO"]
        if do_dono and do_dono[0]["estado"] in ESTADOS_ABERTOS + ("ACEITA",):
            estado = do_dono[0]["estado"]
        elif travas:
            estado = "DECISAO"
        elif bloq:
            estado = "BLOQUEADA"
        elif t["prs_abertas"]:
            estado = "EM_PR_SEM_RESERVA"
        else:
            estado = "LIVRE_COM_CASO_DE_TRABALHO" if brandas.get(tid) else "LIVRE"
        tipo = tipos.get(t["tipo"], {})
        prepara = [a for a in t["apoio"] if a in ativos and a != t["dono"]]
        # preparo por competencia: so em tarefa do CTO, so com tipo confiavel (declarado ou regra pelo titulo) e se a tarefa deixar
        if t["dono"] == "claude-cto" and t["tipo_origem"] != "REGRA_DONO" and not t["so_o_dono"]:
            prepara += [a for a in ativos if a != t["dono"] and a not in prepara and t["tipo"] in (agentes[a].get("prepara") or [])]
        if t["so_o_dono"]:
            prepara = []
        revisa = [a for a in tipo.get("pre_revisao", []) if a in ativos and a != t["dono"] and t["tipo"] in (agentes[a].get("revisa") or [])]
        try:
            h = float(t["horas"])
            tamanho = "P" if h <= 2 else "M" if h <= 8 else "G"
        except ValueError:
            h, tamanho = None, "?"
        aceite = "; ".join(tipo.get("aceite", [])) + (f" || PROPRIO: {t['aceite_proprio']}" if t["aceite_proprio"] else "")
        saida.append({
            "tarefa": tid, "origem": t["origem"], "onda": t["onda"], "lote": t["lote"], "tipo": t["tipo"], "tipo_origem": t["tipo_origem"],
            "tamanho": tamanho, "horas": t["horas"], "folga_h": "" if t["folga"] == SEM_FOLGA else f"{t['folga']:g}",
            "destrava": alcance(tid), "estado": estado, "estado_plano": t["estado_plano"], "bloqueada_por": "|".join(bloq),
            "trava_de_decisao": "|".join(travas + [f"({b})" for b in brandas.get(tid, [])]), "dono": t["dono"],
            "prepara": "|".join(prepara), "revisa": "|".join(revisa),
            "reserva": "|".join(f"{r['agente']}:{r['papel']}:{r['estado']}" for r in minhas),
            "pr": "|".join(dict.fromkeys([str(r.get("pr") or "") for r in minhas if str(r.get("pr") or "").strip()] + _lista(t["prs_abertas"]))),
            "titulo": t["titulo"], "aceite": aceite, "veredito": tipo.get("veredito", ""), "referencia": t["referencia"],
            "_folga": t["folga"], "_h": h if h is not None else 999.0,
        })
    saida.sort(key=lambda r: (r["_folga"], -r["destrava"], r["_h"], r["tarefa"]))
    for i, r in enumerate(saida, 1):
        r["prioridade"] = i
    return saida, erros


def livres_para(saida: list[dict], f: dict, agente: str) -> dict[str, list[dict]]:
    c = f["comp"]["agentes"].get(agente) or {}
    meus = [r for r in f["reservas"] if r["agente"] == agente and r["estado"] in ESTADOS_ABERTOS]
    ocupadas = {(r["tarefa"], r["papel"]) for r in f["reservas"] if r["estado"] in ESTADOS_ABERTOS + ("ACEITA",)}
    livre = ("LIVRE", "LIVRE_COM_CASO_DE_TRABALHO")
    dono = [r for r in saida if r["dono"] == agente and r["estado"] in livre and (r["tarefa"], "DONO") not in ocupadas]
    prep = [r for r in saida if agente in r["prepara"].split("|") and r["estado"] in livre + ("BLOQUEADA",)
            and not any(k[0] == r["tarefa"] and k[1] in ("DONO", "PREPARA") for k in ocupadas)]
    rev = [r for r in saida if agente in r["revisa"].split("|") and r["estado"] in ("ENTREGUE", "EM_PR_SEM_RESERVA")
           and (r["tarefa"], "REVISA") not in ocupadas]
    return {"em_curso": meus, "dono": dono, "prepara": prep, "revisa": rev,
            "limite": c.get("limite_em_curso", 0), "abertas": sum(1 for r in meus if r["papel"] != "REVISA")}


def texto_csv(saida: list[dict]) -> str:
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=COLUNAS, delimiter=";", quoting=csv.QUOTE_ALL, lineterminator="\n")
    w.writeheader()
    w.writerows({c: r[c] for c in COLUNAS} for r in saida)
    return buf.getvalue()


def texto_md(saida: list[dict], f: dict) -> str:
    from collections import Counter
    est = Counter(r["estado"] for r in saida)
    md = ["# Backlog por agente (gerado por tools/backlog_mestre.py v2)", "",
          "`SEM VALOR REAL ATÉ O PORTÃO N3 (DEC-001-026)`", "",
          "Ordem = folga do caminho crítico; no empate, quantas tarefas a tarefa destrava; depois a menor. "
          "Como usar: `python3 tools/backlog_mestre.py proxima <agente>` e depois `reservar`. "
          "O aceite de cada tarefa está na coluna `aceite` do `BACKLOG_MESTRE.csv` (vem do tipo).", "",
          f"**{len(saida)} tarefas abertas:** " + ", ".join(f"{k} {v}" for k, v in sorted(est.items())) + ".", ""]
    for a, c in f["comp"]["agentes"].items():
        if not c.get("ativo"):
            md += [f"## {a} — inativo", "", c.get("papel", ""), ""]
            continue
        v = livres_para(saida, f, a)
        md += [f"## {a}", "", f"{c.get('papel', '')}. Limite em curso: {v['limite']}.", ""]
        for titulo, chave, papel in (("Entregar como DONO", "dono", "DONO"), ("Preparar para o dono", "prepara", "PREPARA"),
                                     ("Pré-revisar entrega de outro agente", "revisa", "REVISA")):
            lin = v[chave]
            md += [f"### {titulo} — {len(lin)}", ""]
            if not lin:
                md += ["Nenhuma agora.", ""]
                continue
            md += ["| # | tarefa | tipo | tam. | h | destrava | estado | título |", "|---|---|---|---|---|---|---|---|"]
            for r in lin[:40]:
                md.append(f"| {r['prioridade']} | {r['tarefa']} | {r['tipo']} | {r['tamanho']} | {r['horas'] or '—'} | {r['destrava']} | "
                          f"{r['estado']} | {r['titulo'][:105].replace('|', '/')} |")
            if len(lin) > 40:
                md.append(f"| … | mais {len(lin) - 40} no CSV | | | | | | |")
            md.append("")
    return "\n".join(md) + "\n"


def _arq_reserva(raiz: Path, t: str, a: str) -> Path:
    return raiz / H_REL / "RESERVAS" / f"{t}__{a}.yaml"


def _gravar_reserva(raiz: Path, r: dict) -> Path:
    p = _arq_reserva(raiz, r["tarefa"], r["agente"])
    p.parent.mkdir(exist_ok=True)
    ordem = ["tarefa", "agente", "papel", "estado", "desde", "atualizada", "pr", "nota"]
    p.write_text(yaml.safe_dump({k: r.get(k, "") for k in ordem}, allow_unicode=True, sort_keys=False), encoding="utf-8")
    return p


def reservar(raiz: Path, t: str, a: str, papel: str | None, agora: dt.datetime) -> str:
    f = carregar(raiz)
    saida, erros = montar(f)
    if erros:
        raise SystemExit("fonte com erro: " + "; ".join(erros))
    linha = next((r for r in saida if r["tarefa"] == t), None)
    c = f["comp"]["agentes"].get(a)
    if linha is None:
        raise SystemExit(f"{t}: nao esta no backlog (fechada, absorvida ou id errado)")
    if not c or not c.get("ativo"):
        raise SystemExit(f"{a}: agente inexistente ou inativo em COMPETENCIAS.yaml")
    v = livres_para(saida, f, a)
    papel = papel or ("DONO" if linha["dono"] == a else "PREPARA" if a in linha["prepara"].split("|") else "REVISA")
    lista = {"DONO": v["dono"], "PREPARA": v["prepara"], "REVISA": v["revisa"]}[papel]
    retro = papel == "DONO" and linha["estado"] == "EM_PR_SEM_RESERVA" and linha["dono"] == a   # reserva retroativa de entrega ja feita
    if linha not in lista and not retro:
        raise SystemExit(f"{t}: {a} nao pode pegar como {papel} agora (estado {linha['estado']}; dono {linha['dono']}; "
                         f"trava {linha['trava_de_decisao'] or linha['bloqueada_por'] or 'ja reservada ou fora da competencia'})")
    if papel != "REVISA" and not retro and v["abertas"] >= v["limite"]:
        raise SystemExit(f"{a}: limite em curso atingido ({v['abertas']} de {v['limite']}); entregue ou libere uma antes")
    p = _gravar_reserva(raiz, {"tarefa": t, "agente": a, "papel": papel, "estado": "RESERVADA",
                               "desde": agora.isoformat(timespec="minutes"), "atualizada": agora.isoformat(timespec="minutes")})
    return f"{p.relative_to(raiz)} -> RESERVADA como {papel}"


def mudar(raiz: Path, t: str, a: str, acao: str, agora: dt.datetime, pr: str = "", nota: str = "") -> str:
    p = _arq_reserva(raiz, t, a)
    if not p.exists():
        raise SystemExit(f"nao ha reserva de {t} por {a}")
    r = _yaml(p)
    r.setdefault("papel", "DONO"), r.setdefault("estado", "RESERVADA")
    de = r["estado"]
    para = {"entregar": "ENTREGUE", "liberar": "LIBERADA", "aceitar": "ACEITA", "devolver": "DEVOLVIDA"}[acao]
    permitido = {"entregar": ("RESERVADA", "DEVOLVIDA"), "liberar": ESTADOS_ABERTOS, "aceitar": ("ENTREGUE", "EM_REVISAO"),
                 "devolver": ("ENTREGUE", "EM_REVISAO")}[acao]
    if de not in permitido:
        raise SystemExit(f"{t}/{a}: nao se pode {acao} a partir de {de}")
    if acao == "entregar" and not pr:
        raise SystemExit("entregar pede --pr N")
    r.update(estado=para, atualizada=agora.isoformat(timespec="minutes"))
    if pr:
        r["pr"] = pr
    if nota:
        r["nota"] = nota
    _gravar_reserva(raiz, r)
    return f"{t}/{a}: {de} -> {para}"


def saude(raiz: Path, agora: dt.datetime) -> list[str]:
    f = carregar(raiz)
    saida, erros = montar(f)
    L = ["# Saúde do backlog", ""]
    L += ["## Erros de fonte", ""] + ([f"- {e}" for e in erros] or ["nenhum"]) + [""]
    val = float(f["comp"].get("validade_da_reserva_h", 72))
    venc = []
    for r in f["reservas"]:
        if r["estado"] != "RESERVADA":
            continue
        try:
            idade = (agora - dt.datetime.fromisoformat(str(r.get("desde")))).total_seconds() / 3600
        except (TypeError, ValueError):
            idade = None
        if idade is None or idade > val:
            venc.append(f"- {r['tarefa']} por {r['agente']}: {'sem data' if idade is None else f'{idade:.0f} h'} sem entrega (validade {val:.0f} h): o CTO libera")
    L += ["## Reservas vencidas", ""] + (venc or ["nenhuma"]) + [""]
    L += ["## Em curso × limite", "", "| agente | em curso | limite | livres como dono | para preparar | para revisar |", "|---|---|---|---|---|---|"]
    for a, c in f["comp"]["agentes"].items():
        if c.get("ativo"):
            v = livres_para(saida, f, a)
            L.append(f"| {a} | {v['abertas']} | {v['limite']} | {len(v['dono'])} | {len(v['prepara'])} | {len(v['revisa'])} |")
    abertas = {r["tarefa"] for r in saida}
    orfas_abs = [f"{x['id']}->{x['absorvida_por']}" for x in f["compl"]
                 if str(x.get("absorvida_por") or "").strip() and str(x["absorvida_por"]).strip() not in abertas]
    sem_h = [r["tarefa"] for r in saida if r["tamanho"] == "?"]
    fora = [r["tarefa"] for r in saida if r["dono"] in f["comp"]["agentes"]
            and r["tipo"] not in (f["comp"]["agentes"][r["dono"]].get("dono") or [])]
    orfa = [r["tarefa"] for r in saida if r["estado"] == "EM_PR_SEM_RESERVA"]
    from collections import Counter
    cto = sum(1 for r in saida if r["dono"] == "claude-cto")
    L += ["", "## Dados que faltam", "",
          f"- sem horas: {len(sem_h)} ({', '.join(sem_h[:12])}{'…' if len(sem_h) > 12 else ''})",
          f"- tipo por regra (não declarado): {sum(1 for r in saida if r['tipo_origem'] != 'DECLARADO')} de {len(saida)}, das quais "
          f"{sum(1 for r in saida if r['tipo_origem'] == 'REGRA_DONO')} só pelo dono (palpite)",
          f"- dono fora da competência declarada para o tipo: {len(fora)} ({', '.join(fora[:12])}{'…' if len(fora) > 12 else ''})",
          f"- complemento absorvido por tarefa que não está aberta no plano (ainda não entrou na main ou já fechou): {len(orfas_abs)} "
          f"({', '.join(orfas_abs[:14])}{'…' if len(orfas_abs) > 14 else ''})",
          f"- com PR aberta e sem reserva: {len(orfa)} ({', '.join(orfa[:12])}{'…' if len(orfa) > 12 else ''})",
          f"- tarefas do CTO: {cto} de {len(saida)} ({100 * cto / max(len(saida), 1):.0f} %); com preparo possível por outro agente: "
          f"{sum(1 for r in saida if r['dono'] == 'claude-cto' and r['prepara'])}",
          "- estados: " + ", ".join(f"{k} {v}" for k, v in sorted(Counter(r["estado"] for r in saida).items()))]
    return L


def gravar_db(raiz: Path, destino: Path) -> str:
    f = carregar(raiz)
    saida, _ = montar(f)
    destino.parent.mkdir(parents=True, exist_ok=True)
    if destino.exists():
        destino.unlink()
    con = sqlite3.connect(destino)
    con.execute("create table tarefas (" + ", ".join(f'"{c}" text' for c in COLUNAS) + ")")
    con.executemany("insert into tarefas values (" + ",".join("?" * len(COLUNAS)) + ")", [[str(r[c]) for c in COLUNAS] for r in saida])
    con.execute("create table papeis (tarefa text, agente text, papel text)")
    con.execute("create table dependencias (tarefa text, depende_de text)")
    con.execute("create table reservas (tarefa text, agente text, papel text, estado text, desde text, pr text)")
    for r in saida:
        con.execute("insert into papeis values (?,?,?)", (r["tarefa"], r["dono"], "DONO"))
        con.executemany("insert into papeis values (?,?,?)", [(r["tarefa"], a, "PREPARA") for a in _lista(r["prepara"])])
        con.executemany("insert into papeis values (?,?,?)", [(r["tarefa"], a, "REVISA") for a in _lista(r["revisa"])])
        con.executemany("insert into dependencias values (?,?)", [(r["tarefa"], d) for d in _lista(r["bloqueada_por"])])
    con.executemany("insert into reservas values (?,?,?,?,?,?)",
                    [(r["tarefa"], r["agente"], r["papel"], r["estado"], str(r.get("desde") or ""), str(r.get("pr") or "")) for r in f["reservas"]])
    con.commit(), con.close()
    return f"{destino} ({len(saida)} tarefas)"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Backlog mestre v2")
    ap.add_argument("acao", nargs="?", default="gerar",
                    choices=["gerar", "proxima", "reservar", "entregar", "liberar", "aceitar", "devolver", "saude", "db"])
    ap.add_argument("a1", nargs="?")
    ap.add_argument("a2", nargs="?")
    ap.add_argument("--checar", action="store_true")
    ap.add_argument("--papel", choices=["DONO", "PREPARA", "REVISA"])
    ap.add_argument("--pr", default="")
    ap.add_argument("--nota", default="")
    ap.add_argument("--horas", type=float)
    ap.add_argument("--repo", type=Path, default=RAIZ)
    ap.add_argument("--agora")
    a = ap.parse_args(argv)
    agora = dt.datetime.fromisoformat(a.agora) if a.agora else dt.datetime.now().astimezone()
    h = a.repo / H_REL
    if a.acao == "reservar":
        print(reservar(a.repo, a.a1, a.a2, a.papel, agora))
    elif a.acao in ("entregar", "liberar", "aceitar", "devolver"):
        print(mudar(a.repo, a.a1, a.a2, a.acao, agora, a.pr, a.nota))
    elif a.acao == "saude":
        print("\n".join(saude(a.repo, agora)))
        return 0
    elif a.acao == "db":
        print(gravar_db(a.repo, Path(a.a1) if a.a1 else Path.home() / ".cache/guild-backlog" / f"{a.repo.name}.db"))
        return 0
    f = carregar(a.repo)
    saida, erros = montar(f)
    if erros:
        print("FONTE COM ERRO:\n- " + "\n- ".join(erros), file=sys.stderr)
        return 2
    if a.acao == "proxima":
        v = livres_para(saida, f, a.a1)
        print(f"{a.a1}: em curso {v['abertas']} de {v['limite']}")
        for nome, chave in (("DONO", "dono"), ("PREPARA", "prepara"), ("REVISA", "revisa")):
            lin = [r for r in v[chave] if a.horas is None or r["_h"] <= a.horas][:5]
            for r in lin:
                print(f"  {nome:8s} #{r['prioridade']:<4d} {r['tarefa']:9s} {r['tipo']:10s} {r['horas'] or '?':>5s} h  destrava {r['destrava']:<3d} {r['titulo'][:90]}")
        return 0
    csv_novo, md_novo = texto_csv(saida), texto_md(saida, f)
    p_csv, p_md = h / "BACKLOG_MESTRE.csv", h / "BACKLOG_POR_AGENTE.md"
    if a.checar:
        em_dia = p_csv.exists() and p_md.exists() and p_csv.read_text(encoding="utf-8") == csv_novo and p_md.read_text(encoding="utf-8") == md_novo
        print("backlog mestre: em dia" if em_dia else "backlog mestre: VENCIDO (rode python3 tools/backlog_mestre.py e commite)")
        return 0 if em_dia else 1
    p_csv.write_text(csv_novo, encoding="utf-8")
    p_md.write_text(md_novo, encoding="utf-8")
    from collections import Counter
    print(f"{len(saida)} tarefas; " + ", ".join(f"{k} {v}" for k, v in sorted(Counter(r['estado'] for r in saida).items())))
    return 0


if __name__ == "__main__":
    sys.exit(main())
