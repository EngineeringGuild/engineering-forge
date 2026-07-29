---
idea: IDEA-010
doc: 02_ARCHITECTURE
version: 0.11.0
standard: GUILD-DOC-STANDARD@0.2.0
status: draft
updated: 2026-07-29
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
7. **Material compressão-only (`strut`), o espelho do cabo:** um escoramento apoiado num encaixe,
   não fixado nas pontas — só empurra, nunca puxa. Mesma filosofia de simplificação do `cable`
   (falha imediata e direta em vez de re-resolver um problema não-linear), só invertida: força
   axial positiva (tração) num material `compressionOnly` = falha imediata, independente da
   magnitude. Introduzido junto com o nível 5 "The King Post" (viga com um pontalete vertical
   acima do ponto de carga): verificado rodando o solver antes de fixar os materiais, confirmando
   que as duas pernas inclinadas até as ancoragens ficam em **compressão** (boas para strut) e o
   pontalete vertical até o ponto de carga fica em **tração** (bom para cabo) — os papéis exatamente
   opostos das linhas de "The Tower". Verificado por teste unitário (`truss.test.ts`) tanto no caso
   "strut em compressão, ok" quanto "strut em tração, falha mesmo com carga mínima" — o par de
   testes espelha exatamente os do cabo.

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
5. **Cargas em série vs. em paralelo:** até o nível 3, toda lâmpada dada era ou a única carga do
   circuito, ou uma de várias em ramos **independentes** (cada uma com tensão de fonte inteira
   sobre si, ramo próprio de volta à bateria — nível 1 "Two Bulbs"). O nível 4 ("One Path, Two
   Bulbs") introduz o caso oposto: duas lâmpadas no **mesmo caminho de corrente**, uma depois da
   outra — a mesma corrente atravessa as duas, e suas resistências se somam nesse caminho (3+3=6Ω),
   ao contrário do caso paralelo onde cada carga via a tensão cheia da fonte. Resistor pequeno
   (5Ω), que funcionava no tutorial pra uma lâmpada só, agora estoura as duas por excesso de
   corrente — resistor grande (15Ω) é o que mantém ambas na faixa segura. Verificado por script
   numérico antes de fixar sourceVoltage/valores (ver DEC-010-016), depois jogado ponta a ponta no
   browser confirmando queima com resistor pequeno e "acende" com 3 estrelas usando o grande.
6. **Restrição real da UI: sem aresta duplicada entre o mesmo par de nós.** `circuitStore.ts`
   (`addEdge`) recusa uma segunda conexão entre dois nós já ligados — então dois resistores nunca
   ficam literalmente em paralelo puro (`R1‖R2` direto). Na prática, "colocar dois resistores em
   paralelo" sempre significa: criar um nó extra (joint) e rotear um segundo caminho até ele, o que
   soma um segmento de fio em série a esse ramo. Isso mudou o cálculo de resistência equivalente
   real do nível 5 ("Two Paths, One Bulb") — a primeira tentativa (calculada como `R1‖R2` puro, sem
   contar o fio extra do roteamento nem o fio do caminho de retorno até o terra) deixava a lâmpada
   fraca demais; só apareceu rodando o solver de verdade com a topologia exatamente como o jogador
   precisaria construí-la, não com a fórmula idealizada. Nível 5: nem o resistor pequeno nem o
   grande sozinho energizam a lâmpada o suficiente (ambos fracos demais) — o jogador precisa
   necessariamente de dois caminhos em paralelo; dois resistores pequenos é a solução mais barata
   (3 estrelas), misturar os dois valores também funciona, só custa mais.

Este par de solvers reaproveita o mesmo núcleo de álgebra linear (`physics/linalg.ts`).

## Motor de física — cinemática de veículos (Máquinas)

Terceiro pack (`game/src/physics/vehicle.ts`), **sem álgebra linear** — uma corrida em linha reta
a partir do repouso é fechada com fórmulas diretas, não um sistema a resolver:

1. **Modelo:** motor (força constante, N — simplificação de uma curva de potência real) + chassi
   (massa, kg). Sem canvas espacial: o jogador escolhe as duas peças de um catálogo ("loadout"),
   não desenha nada — decisão deliberada de não forçar a metáfora de construção num pack que não
   precisa dela.
2. **Teto de tração:** força efetiva nas rodas = `min(força do motor, μ × massa × g)` (atrito de
   Coulomb) — um motor mais forte que o grip dos pneus só faz a roda patinar, não acelera mais.
3. **Resultado:** aceleração = força efetiva / massa; velocidade final = `√(2 × aceleração ×
   distância)` (cinemática de MRUV, u=0). Meta de velocidade mínima define passa/falha, custo do
   motor+chassi cruza com orçamento pra estrelas — mesmo padrão dos outros dois packs.
4. **Inclinação (`inclineDegrees`, opcional, default 0 = plano):** numa rampa, o peso normal (e por
   isso o teto de tração) encolhe por `cos θ`, e a componente da gravidade ao longo da rampa
   (`massa × g × sin θ`) subtrai direto da força líquida de tração. Se essa componente vencer, a
   aceleração fica ≤ 0 e o veículo **estola** (`stalled`) em vez de rastejar — velocidade final
   travada em 0, não uma raiz de número negativo. Generaliza o teorema já provado da Fase 4b ("o
   chassi leve nunca perde pro pesado"): o chassi que o motor consegue saturar primeiro nunca é
   superado pelo que ainda não saturou — testado explicitamente em `vehicle.test.ts` pra rampa,
   não só pra plano.
5. **Carga dada (`payloadMass`, opcional, default 0 = nenhuma):** primeira vez que Máquinas tem um
   elemento **dado/fixo** que o jogador precisa acomodar, não escolher — mesmo padrão do tabuleiro
   com carga em Estruturas e da lâmpada em Circuitos, aplicado aqui à massa em vez de um elemento
   espacial/elétrico. A massa da carga soma direto à massa do chassi, tanto pro teto de tração
   quanto pra F=ma — um combo motor+chassi que vencia uma distância facilmente sem carga pode
   falhar com ela a bordo, mesmo em pista plana (sem envolver o teto de tração nem a inclinação,
   que já têm suas próprias lições nos níveis anteriores).
6. **Janela de velocidade (`maxSpeed`, opcional):** até aqui, todo nível só definia um **piso** de
   velocidade (`targetSpeed`) — rápido demais nunca foi punido, só caro demais. `maxSpeed` (quando
   definido) impõe também um **teto**: passar dele falha o nível tanto quanto ficar abaixo do piso.
   Isso é uma dimensão de falha genuinamente nova (nenhum dos três packs tinha "rápido/forte
   demais" como motivo de reprovação até agora, só de custo) e uma versão mais forte da lição do
   teto de tração: aqui o motor mais forte não é só dinheiro desperdiçado, é a escolha **errada**.
   `scoreVehicleAttempt` (`game/vehicleBuild.ts`) trata a janela como `[targetSpeed, maxSpeed ??
   Infinity]`, ambos os limites inclusivos — omitir `maxSpeed` preserva o comportamento de todo
   nível anterior (só piso, sem teto).

Não compartilha o solver linear dos outros dois packs (não há sistema de equações aqui), mas segue
o mesmo padrão de rigor: motor de física isolado e testável, `vehicle.test.ts` verifica a fórmula
de cinemática, o teto de tração e o comportamento em rampa separadamente antes de qualquer nível
ser jogado.

## Dados de nível

Níveis são dados estáticos versionados em `game/src/content/levels/*.ts` (Estruturas),
`game/src/content/circuitLevels/*.ts` (Circuitos) e `game/src/content/vehicleLevels/*.ts`
(Máquinas) — não precisam de backend. Um "pack" é uma pasta de níveis + o motor de simulação
correspondente + uma rota própria (`/structures`, `/circuits`, `/machines`) a partir da tela de
seleção de pack (`/`).

## Deploy (ver `06_OPERATIONS.md`)

Vite build estático → **Cloudflare Pages** (`docs/project-setup-guide.md`, DEC-001-032) —
não é SSR, não precisa de Workers/OpenNext. Subdomínio alvo: `forge.guildeng.com`.

## Integração com o ecossistema Guild

Sem integração de dados com BOSS no MVP (produto standalone, sem conta de usuário). Se o funil
provar valor, o passo natural é: (a) botão de saída para os outros produtos da Guild, (b)
`.boss/app.manifest.yaml` para aparecer no hub (`docs/GUILD_APP_CONNECT_STANDARD.md`, DEC-001-028) —
não implementado agora para não sobre-construir antes de validar o loop.
