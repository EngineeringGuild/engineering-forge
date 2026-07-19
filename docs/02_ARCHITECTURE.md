---
idea: IDEA-010
doc: 02_ARCHITECTURE
version: 0.2.0
standard: GUILD-DOC-STANDARD@0.2.0
status: draft
updated: 2026-07-19
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Arquitetura

## Stack (DEC-010-004)

100% client-side, sem servidor, sem banco de dados — postura R$0 (`docs/guild/LAUNCH_DAY_RUNBOOK.md`
da hub, DEC-001-034).

- **App:** `game/` — Vite + React 19 + TypeScript.
- **Estado:** Zustand (progresso, nível atual, editor da treliça).
- **Persistência:** `localStorage` (progresso, níveis completos, melhores estrelas). Sem conta,
  sem sync — se o jogador trocar de dispositivo, recomeça. Aceitável para o MVP; revisitar se/quando
  houver conta de usuário compartilhada com outros produtos da Guild.
- **Render do jogo:** SVG (canvas de construção da treliça — nós, membros, cores de tensão).
- **Estilo:** Tailwind CSS + tokens do GDS (`@guild/design-tokens`, skin `engineering` — ver
  `docs/guild/design-system/`). Tipografia Space Grotesk (display) / Inter (UI) / JetBrains Mono
  (dados numéricos de simulação).
- **i18n:** estrutura de strings preparada para PT-BR desde o MVP; UI lançada em inglês
  (DEC-010-006) — produto vendável globalmente, coerente com o público-alvo do gênero.

## Motor de física — estática de treliças 2D

Núcleo do jogo, isolado de UI e testável (`game/src/physics/`):

1. **Modelo:** nós (posições fixas = apoios/ancoragens; posições do jogador = juntas construídas) e
   membros (conexões de dois nós, tratados como barras de duas forças — hipótese padrão de treliça
   ideal, pino nas juntas).
2. **Solver:** método dos nós — monta o sistema de equilíbrio (ΣFx=0, ΣFy=0 por nó livre + reações
   nos apoios) e resolve por eliminação linear. Estrutura com graus de liberdade não resolvidos
   (mecanismo) falha como "instável" antes mesmo de aplicar carga.
3. **Verificação de falha:** força axial de cada membro vs. capacidade (`área da seção × tensão
   admissível do material`); membro que excede capacidade rompe. Cores: verde (folga), amarelo
   (>70% da capacidade), vermelho (rompido).
4. **Custo:** cada membro tem custo = `comprimento × preço do material por unidade`; pontuação de
   estrelas cruza aprovação estrutural com eficiência de orçamento.

Este solver é a peça de maior valor de reuso: os packs futuros (Circuitos, Máquinas) trocam o
motor de simulação mas reaproveitam o resto da arquitetura (editor de canvas, progressão, UI).

## Dados de nível

Níveis são dados estáticos versionados em `game/src/content/levels/*.ts` (não precisam de backend):
vão, posição dos apoios, carga a aplicar, orçamento, materiais liberados. Um "pack" é uma pasta de
níveis + o motor de simulação correspondente.

## Deploy (ver `06_OPERATIONS.md`)

Vite build estático → **Cloudflare Pages** (`docs/project-setup-guide.md`, DEC-001-032) —
não é SSR, não precisa de Workers/OpenNext. Subdomínio alvo: `forge.guildeng.com`.

## Integração com o ecossistema Guild

Sem integração de dados com BOSS no MVP (produto standalone, sem conta de usuário). Se o funil
provar valor, o passo natural é: (a) botão de saída para os outros produtos da Guild, (b)
`.boss/app.manifest.yaml` para aparecer no hub (`docs/GUILD_APP_CONNECT_STANDARD.md`, DEC-001-028) —
não implementado agora para não sobre-construir antes de validar o loop.
