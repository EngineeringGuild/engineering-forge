---
idea: IDEA-010
doc: 01_VISION
version: 0.5.0
standard: GUILD-DOC-STANDARD@0.2.0
status: draft
updated: 2026-07-24
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Visão — Engineering Forge

## O pitch

**Você é um aprendiz numa forja de engenharia. Cada nível pede um artefato funcional — uma ponte,
um circuito, uma máquina — e você não passa de fase impressionando um juiz: você passa porque a
física concorda com você.** Sem sorte, sem "quase". A treliça aguenta o caminhão ou desaba. O
circuito acende a lâmpada ou queima o fusível.

Isso é o que diferencia Engineering Forge de um quiz gamificado: o jogador constrói, testa contra
uma simulação real (não uma checklist de múltipla escolha), vê a estrutura ceder ou brilhar, e
itera. É o gênero consagrado por jogos como *Bridge Constructor* / *Poly Bridge* / *West Point
Bridge Designer*, aplicado à identidade e ao propósito educacional da Guild.

## Conceito: "A Forja" (DEC-010-003)

Um único mundo — a forja — que se expande por **disciplinas de engenharia como "packs" de
conteúdo**, cada um com sua própria mecânica de simulação:

| Pack | Mecânica | Status |
|---|---|---|
| **Estruturas** (pontes, torres) | Estática de treliças 2D — método da rigidez direta, tensão/compressão real | **MVP — jogável** (tutorial + 4 níveis) |
| **Circuitos** | Análise nodal (Lei de Ohm/Kirchhoff), capacidade de potência por componente | **MVP — jogável** (tutorial + 3 níveis) |
| **Máquinas/Veículos** | 2ª lei de Newton + cinemática + teto de tração (atrito) | **MVP — jogável** (tutorial, escopo enxuto) |
| Algoritmos/Código | Desafios de lógica e complexidade | proposto, fase 5 |

Cada pack usa a mesma moldura de progressão (aprendiz → oficial → mestre-ferreiro) e o mesmo
loop de jogo (ver abaixo), mudando apenas o motor de simulação e o vocabulário de peças.

## Loop de jogo (o mesmo em todo pack)

1. **Briefing** — o nível define o desafio (vão + carga, fonte + carga elétrica, ou meta de
   desempenho) e o orçamento.
2. **Forjar** — o jogador monta a solução: em Estruturas/Circuitos, colocando nós e conectando
   membros/componentes num canvas espacial; em Máquinas, escolhendo peças de um catálogo
   ("loadout") — nem todo pack precisa da mesma metáfora de interação, só do mesmo rigor de física.
3. **Testar** — o motor de física resolve o modelo (equilíbrio estático da treliça, tensões/
   correntes do circuito, ou cinemática do veículo) sob a carga real; peças sobrecarregadas ou
   metas não atingidas falham visualmente/textualmente.
4. **Resultado** — passa/falha + até 3 estrelas por eficiência de custo.
5. **Progressão** — próximo nível libera desafios maiores/mais complexos.

**Pack Estruturas:** membros de treliça (madeira/aço/cabo), a treliça aguenta o caminhão ou desaba.
**Pack Circuitos:** fios/resistores entre a bateria e uma carga (lâmpada dada, grátis) — a lâmpada
acende dentro da faixa de potência segura, ou queima por excesso de corrente, ou fica fraca demais
por excesso de resistência em série; um circuito sem caminho fechado é detectado como "aberto".
**Pack Máquinas:** escolher motor + chassi para um veículo atingir uma velocidade-alvo numa corrida
reta — a 2ª lei de Newton e um teto de tração (atrito dos pneus) decidem se chega lá.

## Público e papel no portfólio

Estudantes e profissionais de engenharia/tech curiosos por aprendizado prático; audiência ampla de
"jogo casual com física de verdade" (apelo tipo Poly Bridge, não nichado). **Mini-fábrica edu:**
funil de audiência para os demais produtos da Guild (mesmo papel definido em 2026-06-10). O MVP
**não tem monetização** — validar o loop e a retenção primeiro; ver `05_MARKETING.md`.

## De onde viemos (histórico, arquivado em `docs/archive/2025-blockchain-university-vision/`)

Existiam três visões incompatíveis antes desta reforma:

1. **GDD/TDD 2025** — "Game University": universidade de engenharia com currículo completo,
   montagem de carros com física, credenciais como NFT Solana, freemium $9.99/mês. **Aproveitamos:**
   a ideia de simulação física real por trás de cada desafio, e a progressão por maestria/disciplina.
   **Descartamos:** blockchain/NFT, backend de microsserviços, MongoDB, escopo de currículo completo
   — tudo incompatível com um MVP client-side de custo zero (DEC-010-004).
2. **Mockups "ferreiro"** (`docs/archive/.../assets/DOMAINS` na visão antiga) — bigorna, martelo,
   temperatura, minério. **Aproveitamos:** a identidade visual e narrativa "forja" que dá nome ao
   produto. **Descartamos:** o jogo literal de forjar metal — não ensina engenharia por si só.
3. **Código real (`legacy/engineering-forge-v1`)** — um clicker genérico sem relação com nenhuma das
   duas visões acima, mais uma camada MongoDB/Mongoose nunca conectada à UI. Arquivado; ver
   DEC-010-004.

## Critérios de sucesso (MVP)

- Um jogador consegue completar o tutorial de cada pack sem explicação externa (self-explanatory UX).
- A simulação é **honesta**: nenhuma estrutura/circuito "aprovado" pela física real do jogo falharia
  por um motivo que o jogador não consiga entender olhando o feedback visual (cor de tensão/potência).
- Deploy público em `forge.guildeng.com` (Cloudflare Pages, custo R$0) jogável em desktop e mobile
  web.
- Green gates: install · lint · type-check · test · build (AOA v3 §3.3 / DEC-001-012).

## Não-objetivos (MVP)

- Sem backend, sem conta de usuário, sem persistência em nuvem — progresso em `localStorage`.
- Sem blockchain/NFT nesta fase (pode voltar como diferencial *depois* de tração comprovada).
- Sem os packs de Máquinas/Código ainda — provados o modelo "packs por disciplina" com dois.
- Sem monetização no MVP.

## Tier GOX (DEC-010-005)

**T1 — Standard.** Produto do portfólio com potencial de ir a público (funil), mas não
mission-critical. Requer: charter (este doc + `03_DECISIONS.md`), plano leve, gate de qualidade
(lint/type-check/test/build) antes de qualquer claim de "Operational".
