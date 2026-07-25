---
idea: IDEA-010
doc: 04_ROADMAP
version: 0.9.0
standard: GUILD-DOC-STANDARD@0.2.0
status: draft
updated: 2026-07-25
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Roadmap

> Regra do PMO: escala para produção (marketing ativo, domínio custom, IDEA-000 queue) só quando
> a fila do ENG-124 autorizar. Desenvolvimento do MVP em si não depende dessa fila.

| Fase | Objetivo | Pack/Escopo | Status |
|---|---|---|---|
| 0 | Inventário do código + decisão reformar/relançar | — | ✅ concluído (DEC-010-004) |
| 1 | MVP jogável: tutorial + 3 níveis, motor de física de treliças, deploy público | Estruturas (pontes) | ✅ concluído |
| 2 | Segundo pack (Circuitos) prova o modelo "packs por disciplina" | Circuitos | ✅ concluído (DEC-010-008) |
| 3 | Expandir packs existentes: nível "The Tower" (cabo tração-only) em Estruturas, nível "Splitting the Load" (resistores em paralelo) em Circuitos | Estruturas, Circuitos | ✅ concluído |
| 4 | Terceiro pack (Máquinas/Veículos) — reaproveita ideias de física do GDD original | Máquinas | ✅ fundação concluída (DEC-010-010) |
| 4c | Endurecer pra produção: cobertura de teste na camada de scoring/custo (antes só os solvers de física tinham teste dedicado) | Estruturas, Circuitos, Máquinas | ✅ concluído (DEC-010-012) |
| 4d | Endurecer pra produção: checagem de layout em viewport estreito (mobile), até então só verificado em desktop | Estruturas, Circuitos, Máquinas | ✅ concluído (DEC-010-013) |
| 4e | Máquinas nível 2: mecanismo de inclinação/rampa + novo estado de falha "estolado" | Máquinas | ✅ concluído (DEC-010-014) |
| 5 | Deploy público real (`forge.guildeng.com`) + avaliar conta de usuário / integração BOSS / monetização | — | **bloqueado** — projeto Cloudflare Pages não existe na conta, ver `06_OPERATIONS.md` §Segurança/Deploy |

## Fase 1 — Estruturas (concluída)

1. Motor de física de treliças (nós, membros, solver estático via método da rigidez direta,
   verificação de falha) — `game/src/physics/truss.ts`, testado contra caso calculado à mão.
2. Editor de canvas SVG: colocar nós, conectar membros, escolher material.
3. Tutorial + 3 níveis com dificuldade crescente (vão maior, apoio a mais, dois eixos de carga).
4. Loop de progressão local (`localStorage`): níveis completos, estrelas, desbloqueio sequencial.
5. Workflow de deploy (`deploy-cloudflare.yml`) — deploy real em `forge.guildeng.com` pendente
   (ver Fase 5, requer config no dashboard Cloudflare fora do repo).

## Fase 2 — Circuitos (concluída)

1. Motor de análise nodal (`game/src/physics/circuit.ts`), reaproveitando `physics/linalg.ts`.
2. Reestruturação de navegação: `/` = seleção de pack, `/structures` e `/circuits` cada um com
   sua lista de níveis e página de jogo.
3. Tutorial ("First Spark") + 2 níveis ("Two Bulbs", "Higher Voltage") jogados e validados
   ponta a ponta no browser (não só testes unitários — ver nota em `02_ARCHITECTURE.md` sobre o
   bug do resistor que só apareceu jogando).
4. Componentes: fio, dois resistores, lâmpada (carga dada/grátis) — `physics/components.ts`.

## Fase 3 — aprofundar os dois packs (concluída)

1. **Estruturas — "The Tower":** novo material `cable` (tração-only — falha imediatamente se
   ficar em compressão, sem precisar de resolução não-linear; ver `materials.ts`/`truss.ts`).
   Nível 4 é uma ponte estaiada (torre + 5 linhas até o tabuleiro): duas ficam em tração real
   (boas candidatas a cabo, mais barato) e duas ficam em compressão (precisam de aço rígido) —
   a topologia foi verificada computacionalmente com o próprio solver antes de fixar os números,
   não só calculada à mão (ver `02_ARCHITECTURE.md`).
2. **Circuitos — "Splitting the Load":** nível 3 exige combinar dois resistores **em paralelo**
   pra atingir uma resistência intermediária, já que só o resistor grande sozinho deixa a lâmpada
   fraca demais. Ensina a técnica de combinação em paralelo diretamente (distinta da Fase 2, que
   já cobria múltiplas cargas em paralelo, não múltiplos resistores).
3. Ambos os níveis jogados e validados ponta a ponta no browser antes de commit.

## Fase 4 — fundação do pack Máquinas (concluída, escopo enxuto)

1. **Motor de física** (`physics/vehicle.ts`): corrida em linha reta a partir do repouso —
   2ª lei de Newton (a=F/m) + cinemática (v²=2as) pra velocidade final, com um teto de tração
   (atrito de Coulomb, F≤μmg) — motor com força maior que o grip dos pneus só faz o pneu
   patinar, não acelera mais rápido. Simplificação documentada: força do motor é constante
   (não modela curva de potência real).
2. **Interação diferente dos outros dois packs:** não é canvas espacial — é um "loadout"
   (escolher 1 motor + 1 chassi entre opções), mais parecido com escolher peças que desenhar
   uma estrutura. Decisão deliberada: forçar o metáfora de canvas nessa mecânica seria
   artificial.
3. Tutorial ("First Drive") jogado ponta a ponta no browser: motor pequeno sozinho não atinge
   a meta de velocidade ("Too slow"), motor grande + chassi leve atinge com 3 estrelas.
4. Mais níveis (que exercitem o teto de tração de verdade, não só a fundação) ficam para a
   próxima iteração — escopo desta fase foi deliberadamente enxuto (uma fundação + um nível,
   como as Fases 1 e 2 também começaram).

## Fase 4b — Máquinas exercita o teto de tração (concluída)

1. Novo motor **Turbo Engine** (8000N, caro) — forte o bastante pra saturar o limite de tração
   do chassi leve (6272N a μ=0.8) mas não o do chassi pesado (9408N).
2. Nível 1 ("Full Throttle"): só o turbo atinge a meta de 35 m/s (motor pequeno e grande falham
   nos dois chassis); jogado e validado ponta a ponta no browser nos três casos relevantes
   (motor grande falha, turbo+leve passa com nota de tração ativa, turbo+pesado passa sem a nota).
3. **Achado matemático (provado por álgebra antes de tentar forçar um "gotcha" artificial):**
   neste modelo, o chassi leve **nunca** perde pro pesado em velocidade final — quando limitado
   por tração, a aceleração de qualquer chassi converge pro mesmo teto `μg`, e o chassi leve
   sempre alcança esse teto com um motor mais barato. Não existe cenário de "o pesado ganha por
   causa do grip" dentro de 2 chassis fixos e 1 valor de atrito — a lição real e honesta que o
   nível ensina é "depois do teto de tração, motor mais forte é dinheiro jogado fora", não uma
   inversão de chassi. Preferível descartar a ideia inicial (uma pegadinha que a física não
   sustentava) a forçar números artificiais só pra criar uma reviravolta.

## Fase 4c — cobertura de teste na camada de scoring (concluída)

Até aqui, só os motores de física (`truss.ts`, `circuit.ts`, `vehicle.ts`) tinham teste unitário
dedicado — a camada que transforma um nível + a construção do jogador num modelo pro solver, e
que pontua o resultado em estrelas (`game/build.ts`, `game/circuitBuild.ts`,
`game/vehicleBuild.ts`), não tinha nenhum. Adicionados `build.test.ts`, `circuitBuild.test.ts`,
`vehicleBuild.test.ts` — 17 testes cobrindo: montagem do modelo (membros do tabuleiro/carga dada
sempre usam o material/componente correto independente do que estiver salvo neles), cálculo de
comprimento/custo (só conta peças construídas pelo jogador, tabuleiro/carga são grátis), e a
lógica de estrelas (0 estrelas se não passou ou estourou orçamento — mesmo que a checagem
estrutural/de velocidade tenha passado — 3/2/1 conforme a razão custo/orçamento). Um erro real foi
pego escrevendo estes testes: a primeira versão do teste de integração de `runVehicleTest` afirmava
que um combo passaria, mas o orçamento da fixture usada era baixo demais pro custo real do combo —
corrigido antes de commitar, mesmo padrão de rigor "verificar antes de confiar" aplicado ao próprio
código de teste, não só ao conteúdo do jogo.

## Fase 4d — checagem de layout mobile (concluída)

Até aqui o jogo só tinha sido verificado em viewports de desktop. Testado num viewport de
375×667 (iPhone SE, o mais estreito comum) nos 7 fluxos principais (seleção de pack, seleção de
nível e tela de jogo de cada um dos 3 packs) medindo `document.documentElement.scrollWidth` vs
`clientWidth` — não só assumindo que as classes responsivas do Tailwind funcionavam. Achado:
qualquer nível com 3 materiais desbloqueados na `Toolbar` (compartilhada por Estruturas e
Circuitos) estourava a largura da tela (ex.: tutorial de Circuitos, 448px; nível 4 de Estruturas
"The Tower", 419px, ambos contra um viewport de 375px) — a linha de botões de material nunca
quebrava linha porque faltava `flex-wrap` no contêiner interno, mesmo o contêiner externo já
permitindo quebra. Corrigido com uma única classe em `Toolbar.tsx`; revalidado nos mesmos 7
fluxos + nos dois níveis de 3 materiais, sem overflow em nenhum. Máquinas usa um grid
`grid-cols-2` (não a `Toolbar`) e nunca teve o problema, já que colunas de grid dividem a
largura do contêiner automaticamente. Ver `03_DECISIONS.md` DEC-010-013.

## Fase 4e — Máquinas nível 2, mecanismo de inclinação (concluída)

Máquinas era o pack mais atrasado em conteúdo (só o tutorial + 1 nível, contra 4-5 níveis dos
outros dois). Nível 2 ("Uphill Battle") introduz um mecanismo genuinamente novo, não só uma
reparametrização do nível 1: rampa de 15° (`inclineDegrees` em `VehicleLevelDef`, opcional,
default 0 = comportamento antigo inalterado — coberto por teste). Numa rampa, o teto de tração
encolhe por `cos θ` (menos peso pressiona a roda) e a gravidade ao longo da rampa (`mg sin θ`)
subtrai direto da força que sobra pra acelerar — se essa componente vencer, o veículo **estola**
(não sai do lugar), um estado de falha novo que as pistas planas nunca produziam. Verificado por
álgebra e depois por script numérico antes de fixar os números do nível: das 6 combinações
motor×chassi, só turbo+leve atinge a meta de 27 m/s (28,4 m/s); pequeno em qualquer chassi e
grande+pesado estolam; grande+leve e turbo+pesado se movem mas ficam abaixo da meta (13,9 e 25,7
m/s). O teorema da Fase 4b ("chassi leve nunca perde pro pesado") foi generalizado e testado
também pra rampa — continua valendo. Jogado ponta a ponta no browser nas 5 combinações relevantes,
todos os números batendo com o cálculo prévio, antes de commitar. Ver `03_DECISIONS.md`
DEC-010-014, `02_ARCHITECTURE.md` §Máquinas.

Linear: issues a criar sob o projeto IDEA-010 quando o roadmap for revisado por Caio.
