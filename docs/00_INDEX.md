---
idea: IDEA-010
doc: 00_INDEX
version: 0.3.0
standard: GUILD-DOC-STANDARD@0.2.0
status: draft
updated: 2026-07-22
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# IDEA-010 — Engineering Forge · Índice de documentação

**A Forja.** Um jogo de engenharia de verdade: você forja artefatos funcionais — pontes, circuitos,
máquinas — e a física decide se aguentam. Ver `01_VISION.md` para o pitch completo.

| Doc | Conteúdo | Status |
|---|---|---|
| [01_VISION](01_VISION.md) | O que é, conceito "A Forja", público, critérios de sucesso | draft |
| [02_ARCHITECTURE](02_ARCHITECTURE.md) | Stack do `game/`, motor de física, dados, integrações | draft |
| [03_DECISIONS](03_DECISIONS.md) | Registro DEC append-only | draft |
| [04_ROADMAP](04_ROADMAP.md) | Fases ↔ Linear, packs de conteúdo | draft |
| [05_MARKETING](05_MARKETING.md) | Posicionamento, funil, aquisição | draft |
| [06_OPERATIONS](06_OPERATIONS.md) | Deploy, ambientes, custos, KPIs | draft |

## Onde as coisas estão

- **Jogo (ativo):** `game/` — Vite + React + TS, client-side, sem backend. Dois packs jogáveis:
  Estruturas (`/structures`) e Circuitos (`/circuits`), a partir da seleção de pack em `/`.
- **Legado (arquivado, não desenvolver aqui):** `legacy/engineering-forge-v1` (protótipo clicker +
  camada MongoDB nunca conectada) e `legacy/engineering-forge-docs` (site de docs em 5 idiomas).
- **Visão 2025 arquivada (não é o roadmap atual):** `docs/archive/2025-blockchain-university-vision/`
  — GDD/TDD originais (universidade de engenharia + NFTs Solana), specs técnicas de 12k+ linhas,
  mockups do conceito "ferreiro". Preservado por histórico (regra "add, don't delete"); ver
  `01_VISION.md` §"De onde viemos" para o que foi aproveitado.

Memória viva: `memory-AI/projects/idea-010-engineering-forge-L1.md` · Padrão:
`Engineering-Guild/docs/GUILD_DOC_STANDARD.md`

⚠️ **Pendente de validação por Caio (HITL):** o pivô de conceito (DEC-010-003/004), o tier GOX
(DEC-010-005) e a rotação da credencial MongoDB exposta (DEC-010-007) foram propostos e já
implementados em sessões de agente, mas continuam com `status: draft` até confirmação explícita.
