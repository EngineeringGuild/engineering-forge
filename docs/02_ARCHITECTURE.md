---
idea: IDEA-010
doc: 02_ARCHITECTURE
version: 0.4.0
standard: GUILD-DOC-STANDARD@0.2.0
status: draft
updated: 2026-07-24
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
5. **Material tração-only (`cable`):** cabos só puxam, nunca empurram. Em vez de resolver o
   problema não-linear real (um cabo em compressão fica frouxo, o que exigiria re-resolver o
   sistema iterativamente), a falha é tratada como um corte direto: força axial negativa
   (compressão) em um material `tensionOnly` = falha imediata, independente da magnitude — a mesma
   filosofia de simplificação documentada da flambagem não-modelada. Verificado por teste unitário
   (`truss.test.ts`) tanto no caso "cabo em tração, ok" quanto "cabo em compressão, falha mesmo com
   carga mínima".
6. **Verificar topologias complexas com o próprio solver, não só na cabeça:** o nível "The Tower"
   (torre + 5 linhas até o tabuleiro) tem uma distribuição de tração/compressão não-óbvia à mão —
   foi descoberta rodando o solver já validado num script exploratório antes de fixar os materiais
   do nível, revelando que as duas linhas até os pontos carregados ficam em tração (boas para
   cabo) mas as duas linhas até as ancoragens ficam em **compressão** (precisam de aço) — o
   oposto do que a intuição "toda diagonal de uma torre é um estai em tração" sugeriria.

## Motor de física — análise nodal de circuitos DC

Segundo pack, mesma ideia (`game/src/physics/circuit.ts`): a matriz de condutância montada aqui é
**a mesma estrutura matemática** da matriz de rigidez da treliça (um Laplaciano de grafo ponderado)
— só muda para 1 grau de liberdade por nó (tensão) em vez de 2 (x,y), e reaproveita o mesmo
`physics/linalg.ts` (eliminação gaussiana) para resolver o sistema linear.

1. **Modelo:** nós (terminais da bateria com tensão fixa, ou juntas livres) e conexões de dois nós
   (fio/resistor/carga), cada uma com resistência e potência máxima antes de queimar.
2. **Solver:** análise nodal (Lei de Kirchhoff das Correntes) — monta a matriz de condutância,
   fixa os terminais +/− da bateria, resolve as tensões dos nós livres. Um nó (ou ilha de nós) sem
   caminho até nenhum terminal deixa o sistema singular → "circuito aberto", antes mesmo de calcular
   corrente — mesmo tratamento que a treliça dá a um mecanismo instável.
3. **Verificação de falha:** potência dissipada (`I² × R`) de cada componente vs. sua capacidade;
   componente que excede queima. A carga dada (lâmpada) tem também um piso de potência — abaixo
   dele, "fraca demais" (sem queimar, mas não cumpre o objetivo).
4. **Lição de design:** o primeiro rascunho do nível "Higher Voltage" media só a potência da
   lâmpada e deixava passar uma solução que queimava o **resistor** (14,2 W contra um limite de
   10 W) — só apareceu jogando de ponta a ponta no browser, não no type-check. Corrigido subindo o
   rating do resistor grande; mantido aqui como lembrete de que os testes automatizados verificam a
   matemática do solver, não os números de cada nível — isso exige jogar.

Este par de solvers é a peça de maior valor de reuso: os packs futuros (Máquinas, Código) trocam o
motor de simulação mas reaproveitam o resto da arquitetura (editor de canvas SVG, progressão,
seleção de pack, UI).

## Dados de nível

Níveis são dados estáticos versionados em `game/src/content/levels/*.ts` (Estruturas) e
`game/src/content/circuitLevels/*.ts` (Circuitos) — não precisam de backend. Um "pack" é uma pasta
de níveis + o motor de simulação correspondente + uma rota própria (`/structures`, `/circuits`) a
partir da tela de seleção de pack (`/`).

## Deploy (ver `06_OPERATIONS.md`)

Vite build estático → **Cloudflare Pages** (`docs/project-setup-guide.md`, DEC-001-032) —
não é SSR, não precisa de Workers/OpenNext. Subdomínio alvo: `forge.guildeng.com`.

## Integração com o ecossistema Guild

Sem integração de dados com BOSS no MVP (produto standalone, sem conta de usuário). Se o funil
provar valor, o passo natural é: (a) botão de saída para os outros produtos da Guild, (b)
`.boss/app.manifest.yaml` para aparecer no hub (`docs/GUILD_APP_CONNECT_STANDARD.md`, DEC-001-028) —
não implementado agora para não sobre-construir antes de validar o loop.
