---
idea: IDEA-010
doc: 04_ROADMAP
version: 0.14.0
standard: GUILD-DOC-STANDARD@0.2.0
status: draft
updated: 2026-07-28
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
| 4f | Endurecer pra produção: passe de acessibilidade no chrome da UI (contraste, semântica de diálogo, `sr-only` em estado bloqueado/estrelas) — canvas SVG (posicionar/conectar nós por teclado) explicitamente **fora de escopo**, registrado como lacuna futura | Estruturas, Circuitos, Máquinas | ✅ concluído (DEC-010-015) — canvas keyboard-nav **não implementado**, ver nota abaixo |
| 4g | Circuitos nível 4: primeira topologia com duas cargas em série (mesmo caminho de corrente), não em ramos independentes | Circuitos | ✅ concluído (DEC-010-016) |
| 4h | Máquinas nível 3: mecanismo de carga dada (`payloadMass`) — primeiro elemento dado/fixo do pack, mesmo padrão do tabuleiro/lâmpada dos outros dois | Máquinas | ✅ concluído (DEC-010-017) |
| 4i | Estruturas nível 5 "The King Post": material compressão-only (`strut`), espelho do cabo tração-only | Estruturas | ✅ concluído (DEC-010-018) |
| 4j | Máquinas nível 4 "The Sweet Spot": mecanismo de janela de velocidade (`maxSpeed`) — primeira vez que "rápido demais" reprova, não só "devagar/caro demais" | Máquinas | ✅ concluído (DEC-010-019) |
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

## Fase 4f — passe de acessibilidade no chrome da UI (concluída, com lacuna registrada)

Escopo deliberadamente limitado ao "chrome" da interface (botões, textos, cores, semântica de
diálogo) — não ao canvas de construção em si:

1. **Contraste:** o token `--fg-subtle` (usado só em `text-xs`/`text-sm` — dica de custo por
   peça, rodapé de instruções, notas de tração) só batia ~3,8-4,1:1 contra os fundos escuros do
   skin, abaixo do 4,5:1 exigido pelo WCAG AA pra texto normal. Verificado por cálculo de
   luminância relativa (fórmula WCAG, script), não só visualmente; subiu pra `#788393` (4,5-4,9:1
   contra `bg`/`surface-1`).
2. **Diálogos de resultado:** os três overlays (`ResultOverlay`, `CircuitResultOverlay`,
   `VehicleResultOverlay`) ganharam `role="dialog"` + `aria-modal="true"` + `aria-labelledby` +
   foco automático no heading ao montar — um usuário de leitor de tela agora é avisado do
   resultado assim que ele aparece, não só quem enxerga a animação/cor.
3. **Estrelas e estado bloqueado:** consolidados dois componentes até então triplicados
   (`Stars`, usado pelos 3 overlays; `LevelSelectList`, usado pelas 3 telas de seleção de nível) —
   a duplicação era exatamente o motivo pelo qual a correção de acessibilidade precisava ser
   feita 3x; virou 1x. `Stars` ganhou `role="img"` + `aria-label` ("3 out of 3 stars"); itens de
   nível bloqueados ganharam texto `sr-only` ("locked") — antes o único sinal de bloqueio era o
   emoji 🔒, puramente decorativo pra quem não enxerga a tela.
4. **Foco de teclado:** verificado no browser (Playwright) que o outline padrão do navegador já
   é visível contra o fundo escuro do skin — não precisou de estilo customizado.
5. **Lacuna explicitamente fora de escopo, não esquecida:** navegação por teclado no canvas SVG
   (posicionar um nó, conectar dois nós, remover um membro — hoje só via clique/toque do mouse)
   é um problema de design de interação bem maior e diferente — exigiria repensar o modelo de
   interação inteiro do editor de treliça/circuito, não uma correção pontual. Registrado aqui
   como trabalho futuro real, não como um item esquecido silenciosamente.

Ver `03_DECISIONS.md` DEC-010-015.

## Fase 4g — Circuitos nível 4, cargas em série (concluída)

Até o nível 3, toda lâmpada dada num nível era ou a única carga do circuito (tutorial, nível 2,
nível 3), ou uma de várias em **ramos independentes**, cada uma com a tensão cheia da fonte sobre
si e seu próprio resistor (nível 1 "Two Bulbs"). O nível 4 ("One Path, Two Bulbs") introduz uma
terceira topologia, nunca usada antes: duas lâmpadas no **mesmo caminho de corrente**, uma depois
da outra. A mesma corrente atravessa as duas, e suas resistências se somam nesse caminho único
(3+3=6Ω) — bem diferente do caso paralelo. Verificado por script numérico antes de fixar
`sourceVoltage` (15V) e a topologia: o resistor pequeno (5Ω), que funcionava sozinho pra uma
lâmpada no tutorial, agora estoura as duas (5,58 W contra o limite de 4 W cada) — quebra
deliberadamente o hábito adquirido nos níveis anteriores, forçando o jogador a perceber que a
resistência combinada das duas cargas mudou a conta. O resistor grande (15Ω) mantém ambas na
faixa segura (1,53 W). Descoberta emergente aceita como válida (não um bug a esconder): dois
resistores pequenos em série (10Ω) também passam e saem mais baratos, já que o custo escala só
com o comprimento total construído, não com o número de segmentos — o mesmo espírito de "mais de
uma solução física válida" já visto no nível 3 de Estruturas ("The Long Crossing"). Jogado ponta a
ponta no browser confirmando queima com o resistor pequeno e "It lights up!" com 3 estrelas
($32 de $60) usando o grande. Ver `03_DECISIONS.md` DEC-010-016, `02_ARCHITECTURE.md` §Circuitos.

## Fase 4h — Máquinas nível 3, carga dada (concluída)

Depois que Circuitos alcançou Estruturas (5 níveis cada, Fase 4g), Máquinas voltou a ser o pack
mais atrasado (só 3 níveis). Nível 3 ("Delivery Run") introduz o primeiro elemento **dado/fixo**
que Máquinas já teve — até aqui, motor e chassi eram 100% escolha do jogador, sem nada equivalente
ao tabuleiro-com-carga de Estruturas ou à lâmpada de Circuitos. `payloadMass` (opcional, default 0)
representa uma carga fixa de 400kg que o jogador não escolhe, só acomoda: soma direto à massa do
chassi tanto pro teto de tração quanto pra F=ma. Verificado por script numérico antes de fixar os
números, numa pista **plana** (sem inclinação) pra isolar a lição só na massa, sem misturar com o
teto de tração (já ensinado no nível 1) ou a inclinação (nível 2): motor grande + chassi leve, que
vencia a mesma distância facilmente sem carga (~27,4 m/s), cai pra ~22,4 m/s com a carga a bordo —
nenhum combo neste nível chega a ser limitado por tração (o teto com a carga somada, ~9,4kN, fica
bem acima da força de qualquer motor do catálogo). Só motor turbo + chassi leve atinge a meta de
32 m/s (36,5 m/s); turbo + chassi pesado chega perto mas fica abaixo (31,6 m/s). Jogado ponta a
ponta no browser nas 4 combinações relevantes, todos os números batendo com o cálculo prévio. Ver
`03_DECISIONS.md` DEC-010-017, `02_ARCHITECTURE.md` §Máquinas.

## Fase 4i — Estruturas nível 5, material compressão-only (concluída)

Novo material **`strut`**: o espelho exato do `cable` (DEC-010-009) — em vez de tração-only, é
**compressão-only** (um escoramento apoiado num encaixe, não fixado nas pontas, então só empurra,
nunca puxa). Mesma filosofia de simplificação (falha imediata e direta em vez de re-resolver um
problema não-linear), só invertida: força axial positiva (tração) num material `compressionOnly`
= falha imediata, independente da magnitude. Nível 5 ("The King Post") usa uma topologia clássica
de engenharia real — uma viga com um pontalete vertical acima do ponto de carga e duas pernas
inclinadas até as ancoragens — verificada rodando o próprio solver antes de fixar materiais/
números, mesmo processo do "The Tower" (DEC-010-009): as duas pernas ficam em **compressão**
(-33.333N cada, boas para `strut`) e o pontalete vertical fica em **tração** (+40.000N, bom pra
`cable`) — os papéis exatamente opostos das linhas de "The Tower", um contraste didático
deliberado que fecha o par cabo/strut como conceitos complementares. Solução correta custa $64 de
$110 (3 estrelas); testado também trocando os materiais de propósito (cabo nas pernas, strut no
pontalete) confirmando que cada material falha na direção errada com sua própria mensagem
distinta na UI (`ResultOverlay.tsx` ganhou um branch de mensagem específico pra `pulledApart`,
espelhando o já existente pra `wentSlack`). Ver `03_DECISIONS.md` DEC-010-018,
`02_ARCHITECTURE.md` §Estruturas.

## Fase 4j — Máquinas nível 4, janela de velocidade (concluída)

Até aqui, todo nível de Máquinas (e dos outros dois packs) só definia um **piso** — rápido demais
nunca reprovava, só custava mais caro. Nível 4 ("The Sweet Spot") introduz `maxSpeed` (opcional):
quando definido, ultrapassar esse teto reprova o nível tanto quanto ficar abaixo do piso — a
primeira dimensão de falha "forte/rápido demais" em qualquer um dos três packs, e uma versão mais
forte da lição do teto de tração (aqui o motor mais forte não é só dinheiro desperdiçado, é a
escolha errada). Verificado por script numérico antes de fixar os números: das 6 combinações
motor×chassi em pista plana de 100m, só motor grande + chassi pesado cai dentro da janela [20,25]
m/s (22,36 m/s) — motor pequeno fica abaixo do piso em ambos os chassis (19,4 e 15,8 m/s), motor
grande+chassi leve (27,4 m/s) e motor turbo em qualquer chassi (36,5 e 39,6 m/s) ultrapassam o
teto. `maxSpeed` omitido preserva o comportamento de todo nível anterior (só piso, sem teto) —
coberto por teste. Jogado ponta a ponta no browser nas 4 combinações relevantes (devagar demais,
dentro da janela com 3 estrelas, duas variações "rápido demais" cada com sua própria mensagem),
todos os números batendo com o cálculo prévio. Ver `03_DECISIONS.md` DEC-010-019,
`02_ARCHITECTURE.md` §Máquinas.

Linear: issues a criar sob o projeto IDEA-010 quando o roadmap for revisado por Caio.
