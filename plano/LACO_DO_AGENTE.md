# Laço do agente neste repositório

Mensagem permanente (padrão Backlog Mestre v2, TXT-439-GUILD, 2026-11-16). Vale para todo agente que
trabalha aqui. A lista é **gerada**: nunca edite `BACKLOG_MESTRE.csv` nem `BACKLOG_POR_AGENTE.md`.

```
python3 tools/backlog_mestre.py proxima <agente>              # o que você pode pegar, na ordem
python3 tools/backlog_mestre.py reservar <tarefa> <agente>    # recusa o que você não pode
# leia a coluna `aceite` da tarefa em plano/BACKLOG_MESTRE.csv; faça; confira o aceite você mesmo
python3 tools/backlog_mestre.py entregar <tarefa> <agente> --pr N
python3 tools/backlog_mestre.py proxima <agente>              # antes de pegar outra, veja se há pré-revisão para você
```

- Agentes, competências e limites: `plano/BACKLOG/COMPETENCIAS.yaml`. O que conta como pronto: `plano/BACKLOG/TIPOS.yaml` mais o aceite próprio da tarefa.
- Você nunca revisa a própria entrega. Quem aceita é quem dá o veredito do tipo; o estado `FEITO` no plano só muda depois do aceite.
- Dúvida não para o trabalho: abra um arquivo `plano/FILA_DE_DUVIDAS/Q-<AAAA-MM-DD>-<assunto>.yaml` (`id`, `estado: ABERTA`, `pergunta`, `trava: [<tarefa>]`, `caso_de_trabalho:`) e pegue a próxima.
- Reserva vale 72 h. Para aos 95 % da cota e libera o que não terminou: `liberar <tarefa> <agente> --nota "..."`.
- Regras de trabalho do programa: `docs/guild-standards/MANUAL_DO_EXECUTOR.md` quando a cópia dos padrões estiver aqui; até lá, no hub em `docs/guild/programa-eco/MANUAL_DO_EXECUTOR.md`.

Quem coordena (o PM): `python3 tools/backlog_mestre.py saude` ao abrir a sessão; `aceitar` ou `devolver` cada entrega pré-revisada; trabalho novo entra no `plano/BACKLOG/COMPLEMENTO.yaml` no mesmo dia.
