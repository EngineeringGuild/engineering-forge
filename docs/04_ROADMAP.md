---
idea: IDEA-010
doc: 04_ROADMAP
version: 0.2.0
standard: GUILD-DOC-STANDARD@0.2.0
status: draft
updated: 2026-07-19
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Roadmap

> Regra do PMO: escala para produção (marketing ativo, domínio custom, IDEA-000 queue) só quando
> a fila do ENG-124 autorizar. Desenvolvimento do MVP em si não depende dessa fila.

| Fase | Objetivo | Pack/Escopo | Status |
|---|---|---|---|
| 0 | Inventário do código + decisão reformar/relançar | — | ✅ concluído (DEC-010-004) |
| 1 | MVP jogável: tutorial + 3 níveis, motor de física de treliças, deploy público | Estruturas (pontes) | **em execução** |
| 2 | Expandir pack Estruturas (mais níveis, tipos de apoio, cargas móveis) | Estruturas | planejado |
| 3 | Segundo pack (Circuitos) prova o modelo "packs por disciplina" | Circuitos | proposto |
| 4 | Terceiro pack (Máquinas/Veículos) — reaproveita ideias de física do GDD original | Máquinas | proposto |
| 5 | Avaliar conta de usuário / integração BOSS / monetização | — | condicionado a tração da Fase 1-2 |

## Fase 1 — detalhamento (esta sessão)

1. Motor de física de treliças (nós, membros, solver estático, verificação de falha).
2. Editor de canvas SVG: colocar nós, conectar membros, escolher material.
3. Tutorial + 3 níveis com dificuldade crescente (vão maior, apoio a mais, carga móvel).
4. Loop de progressão local (`localStorage`): níveis completos, estrelas, desbloqueio sequencial.
5. Deploy: Cloudflare Pages, `forge.guildeng.com` (ver `06_OPERATIONS.md`).

Linear: issues a criar sob o projeto IDEA-010 quando a Fase 1 for revisada por Caio.
