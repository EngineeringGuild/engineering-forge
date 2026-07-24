---
idea: IDEA-010
doc: 03_DECISIONS
version: 0.4.0
standard: GUILD-DOC-STANDARD@0.2.0
status: draft
updated: 2026-07-24
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Decisões (append-only)

| ID | Data | Decisão | Contexto/Consequência |
|---|---|---|---|
| DEC-010-001 | 2026-06-10 | Adotar GUILD-DOC-STANDARD@0.1.0 | Estrutura docs/ padronizada |
| DEC-010-002 | 2026-06-10 | Slot IDEA-010 = Engineering Forge | Resolvida a duplicação anterior (010 era "projeto money" = 006) |
| DEC-010-003 | 2026-07-19 | Conceito de produto = **"A Forja"**: aprendiz forja artefatos de engenharia funcionais, testados por simulação real, organizados em "packs" por disciplina; primeiro pack = Estruturas (pontes) | Síntese entre a ambição do GDD 2025 (simulação física, progressão), a identidade "forja" dos mockups originais, e o escopo enxuto exigido pelo L1. Substitui as três visões incompatíveis anteriores (universidade blockchain / ferreiro literal / clicker genérico). **Proposto por sessão de agente — pendente de validação por Caio.** |
| DEC-010-004 | 2026-07-19 | Reescrever do zero em `game/` (Vite+React+TS+Zustand, client-side, sem backend); arquivar `engineering-forge-v1` e `engineering-forge-docs` em `legacy/`; descartar blockchain/NFT/MongoDB do escopo do MVP | Fecha a decisão pendente desde o L1 (reformar vs. reescrever). O código legado era um clicker sem relação com a visão de produto e uma camada MongoDB nunca conectada à UI; reescrever é mais barato que desacoplar. Blockchain permanece como possível diferencial futuro, não MVP. |
| DEC-010-005 | 2026-07-19 | Tier GOX = **T1 (Standard)** | Produto do portfólio com potencial de ir a público/funil, não mission-critical. Requer charter + gate de qualidade antes de "Operational" (GOX `01_GRADED_TIERS.md`). |
| DEC-010-006 | 2026-07-19 | UI do jogo em **inglês**, com estrutura de strings pronta para i18n (PT-BR depois); docs continuam em PT-BR | Produto vendável globalmente desde o início; docs seguem o padrão do repo (PT-BR conforme precedente local, embora o CLAUDE.md da hub DEC-001-008 padronize inglês para docs da Guild — conflito a esclarecer com Caio; docs de produto seguindo o precedente do próprio IDEA-010). |
| DEC-010-007 | 2026-07-19 | Credencial MongoDB Atlas hardcoded encontrada em `legacy/engineering-forge-v1` (4 arquivos) foi **removida do código-fonte** e substituída por leitura de variável de ambiente | **Ação pendente e urgente para Caio (HITL):** a credencial já esteve exposta em texto plano num repositório público e permanece no histórico do git — rotacionar a senha/usuário no MongoDB Atlas imediatamente, independentemente da remoção do código. Ver `06_OPERATIONS.md` §Segurança. |
| DEC-010-008 | 2026-07-22 | Segundo pack — **Circuitos** — jogável: tutorial + 2 níveis, motor de análise nodal (`game/src/physics/circuit.ts`) reaproveitando o solver de álgebra linear da treliça | Prova o modelo "packs por disciplina" da DEC-010-003 com um segundo domínio de simulação real (Lei de Ohm/Kirchhoff). Navegação reestruturada: `/` agora é seleção de pack, `/structures` e `/circuits` cada um com sua lista de níveis. Bug de design pego só ao jogar no browser (não pelo type-check): um resistor queimava a si mesmo no nível "Higher Voltage" — corrigido subindo seu rating de potência; ver `02_ARCHITECTURE.md`. |
| DEC-010-009 | 2026-07-24 | Aprofunda os dois packs: material **cable** (tração-only, falha imediata em compressão) + nível 4 "The Tower" em Estruturas; nível 3 "Splitting the Load" (resistores em paralelo) em Circuitos | Trabalho autônomo durante período sem supervisão direta do Caio — decisões de conteúdo/design tomadas por critério próprio, seguindo o padrão de rigor já estabelecido (topologia da torre verificada computacionalmente com o próprio solver antes de fixar números; ambos os níveis jogados ponta a ponta no browser antes de commit). Achado operacional relevante durante esta sessão: o job `deploy` do GitHub Actions falha desde o merge da PR #1 (`404 Project not found` no Cloudflare Pages) — ver `06_OPERATIONS.md`, ação pendente e urgente para Caio antes de qualquer deploy real. |
