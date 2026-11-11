---
idea: IDEA-010
doc: 12_MASTER_TASK_TRACKER
version: 1.0.0
standard: GUILD-DOC-STANDARD@0.2.0
status: active
updated: 2026-11-11
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Master Task Tracker: Engineering Forge
### Matriz de Rastreabilidade Operacional — Fases, Seções, Lotes e Ondas
**Status Atual: 211 Testes Unitários e de Integração / 0 Falhas / 0 Warnings**

---

## 1. Estrutura de Coordenação por Ondas (Waves)

```
┌────────────────────────────────────────────────────────────────────────┐
│  ONDA 0 (HISTÓRICO): FUNDAÇÃO MULTIDISCIPLINAR (FASES 0 A 4)           │
│  [✅ 100% CONCLUÍDO & HOMOLOGADO]                                      │
├────────────────────────────────────────────────────────────────────────┤
│  ONDA 1 (CONCLUÍDA): FÍSICA VIVA, LAB E MECATRÔNICA (FASES 5 A 7)      │
│  [✅ 100% CONCLUÍDO & HOMOLOGADO — 211 TESTES]                         │
├────────────────────────────────────────────────────────────────────────┤
│  ONDA 2 (ATIVA): FRONTEND POLISH & DIEGETIC UI (FASE 8)                │
│  [🚀 EM EXECUÇÃO — Refinamento visual, sonoplastia tátil e estética]   │
├────────────────────────────────────────────────────────────────────────┤
│  ONDA 3 (PLANEJADA): MODO EDUCADOR & ACADEMIA DE TURMAS (FASE 9)       │
│  [📋 ESPECIFICADO EM DOC-08 — Authoring, Rubricas e Deep Links]        │
├────────────────────────────────────────────────────────────────────────┤
│  ONDA 4 (PLANEJADA): CAD REAL & DIGITAL TWIN NFT (FASE 10)             │
│  [📋 ESPECIFICADO EM DOC-09 — Exportador STL/DXF e Minting On-Chain]   │
├────────────────────────────────────────────────────────────────────────┤
│  ONDA 5 (PLANEJADA): LOCAL-FIRST BACKEND & SYNC CLOUD (FASE 11)        │
│  [📋 ESPECIFICADO EM DOC-11 — API Edge, Telemetria e Leaderboard]      │
├────────────────────────────────────────────────────────────────────────┤
│  ONDA 6 (PLANEJADA): TECH TREE & ECONOMIA DA FORJA (FASE 12)           │
│  [📋 ESPECIFICADO EM DOC-10 — P&D, Garagem e Ligas de Engenharia]      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Registro de Entregas Homologadas (Ondas 0 e 1)

### ✅ Fase 0 a 4 — Fundação Multidisciplinar (Estruturas, Circuitos e Máquinas)
| ID Tarefa | Lote / Seção | Descrição Técnica | Homologação |
|---|---|---|:---:|
| `TSK-F0-01` | Lote 0.1 | Inventário e refatoração da arquitetura limpa (DEC-010-004) | ✅ PASS |
| `TSK-F1-01` | Lote 1.1 | Solver estático matricial de rigidez direta (DSM) em `truss.ts` | ✅ PASS |
| `TSK-F1-02` | Lote 1.2 | Editor de nós e barras em SVG com grid magnético e materiais | ✅ PASS |
| `TSK-F2-01` | Lote 2.1 | Solver nodal de condutâncias Laplaciana para circuitos DC em `circuit.ts` | ✅ PASS |
| `TSK-F2-02` | Lote 2.2 | Editor de circuitos com fontes ideais, fios, resistores e lâmpada | ✅ PASS |
| `TSK-F3-01` | Lote 3.1 | Implementação do material `cable` (tração-only, falha em compressão) | ✅ PASS |
| `TSK-F3-02` | Lote 3.2 | Desafios de associação de resistores em paralelo | ✅ PASS |
| `TSK-F4-01` | Lote 4.1 | Cinemática newtoniana de veículos ($F=ma$) e limite de atrito de Coulomb ($\mu mg$) | ✅ PASS |
| `TSK-F4-02` | Lote 4.2 | Mecanismo de inclinação de pista (rampas com $\cos\theta$ e $\sin\theta$) e estol | ✅ PASS |
| `TSK-F4-03` | Lote 4.3 | Carga útil fixa (`payloadMass`) e janela de velocidade controlada (`maxSpeed`) | ✅ PASS |
| `TSK-F4-04` | Lote 4.4 | Material `strut` (escoras de compressão-only, falha imediata em tração) | ✅ PASS |

### ✅ Fase 5 — "The Living Physics" & Metagame Refinement
| ID Tarefa | Lote / Seção | Descrição Técnica | Homologação |
|---|---|---|:---:|
| `TSK-F5-01` | Lote 5.1 | Sistema de partículas em canvas (faíscas incandescentes e pó de fratura) | ✅ PASS |
| `TSK-F5-02` | Lote 5.2 | Overlay contínuo de Heatmap FEA de tensão axial (verde $\to$ âmbar $\to$ vermelho) | ✅ PASS |
| `TSK-F5-03` | Lote 5.3 | Pilha de Desfazer/Refazer (Undo/Redo) com atalhos de teclado `Ctrl+Z` / `Ctrl+Y` | ✅ PASS |
| `TSK-F5-04` | Lote 5.4 | Slider de escala temporal de simulação contínua (0.25x a 2.0x) | ✅ PASS |
| `TSK-F5-05` | Lote 5.5 | HUD de dinâmica em tempo real no Build Mode (CoG, massa, tensão e SF) | ✅ PASS |
| `TSK-F5-06` | Lote 5.6 | Motor de síntese sonora nativo procedural Web Audio (`soundFx.ts`) | ✅ PASS |

### ✅ Fase 6 — "The Tinkerer's Workshop & Virtual Laboratory"
| ID Tarefa | Lote / Seção | Descrição Técnica | Homologação |
|---|---|---|:---:|
| `TSK-F6-01` | Lote 6.1 | Sandbox paramétrico livre para Estruturas, Circuitos e Veículos | ✅ PASS |
| `TSK-F6-02` | Lote 6.2 | Multímetro Digital Virtual (DMM) com 4 grandezas e pontas de teste móveis | ✅ PASS |
| `TSK-F6-03` | Lote 6.3 | Osciloscópio Digital Virtual (DSO) dual-channel com ajuste de timebase e freeze | ✅ PASS |
| `TSK-F6-04` | Lote 6.4 | Laboratório de Troubleshooting (Engenharia Reversa) com injeção de falhas | ✅ PASS |
| `TSK-F6-05` | Lote 6.5 | Emissor de Relatórios Técnicos e Lista de Materiais (BOM) ASME/IEEE/ISO | ✅ PASS |
| `TSK-F6-06` | Lote 6.6 | Bancada de Ensaios Físicos de Materiais (Euler-Bernoulli, Pacejka, Joule) | ✅ PASS |

### ✅ Fase 7 — "Mechatronics Fusion & Systems Engineering"
| ID Tarefa | Lote / Seção | Descrição Técnica | Homologação |
|---|---|---|:---:|
| `TSK-F7-01` | Lote 7.1 | Solver mecatrônico acoplado: guinchos elétricos DC e pontes levadiças basculantes | ✅ PASS |
| `TSK-F7-02` | Lote 7.2 | Lógica digital combinacional com portas `AND`, `OR`, `NOT`, `XOR`, `BUFFER` | ✅ PASS |
| `TSK-F7-03` | Lote 7.3 | Componentes de intertravamento: relés de isolamento e chaves fim de curso | ✅ PASS |
| `TSK-F7-04` | Lote 7.4 | Três desafios de mecatrônica integrados com validação física de sistemas | ✅ PASS |
| `TSK-F7-05` | Lote 7.5 | Seletor de Dificuldade Física calibrado (Easy / Medium / Hard) | ✅ PASS |
| `TSK-F7-06` | Lote 7.6 | Sistema de Conquistas (Trophy Shelf) com 12 marcos reais e pontos de XP | ✅ PASS |
| `TSK-F7-07` | Lote 7.7 | Rastreamento unificado de progresso e persistência centralizada em LocalStorage | ✅ PASS |

---

## 3. Matriz de Tarefas Planejadas & em Execução (Ondas 2 a 6)

### 🚀 ONDA 2: FASE 8 — Frontend Game Polish, Tactile UI & Diegetic Shell

#### Lote 8.1: Design System Industrial & Microinterações Táteis (Fase F-1) — ✅ CONCLUÍDO & HOMOLOGADO
- [x] `TSK-UI-01`: Especificação dos tokens visuais aeroespaciais/industriais e painéis chanfrados.
- [x] `TSK-UI-02`: Redesign do Hub de Seleção de Disciplinas (`PackSelect.tsx`) com cards industriais diegéticos, status LEDs e telemetria de maestria.
- [x] `TSK-UI-03`: Implementação de sons táteis de navegação e microswitches em botões e abas no motor `soundFx.ts`.
- [x] `TSK-UI-04`: Redesign da barra de navegação global e cabeçalhos com indicador de nível de engenheiro e componente `ForgeDivisionHeader`.
- [x] `TSK-UI-05`: Implementação de classes de display CRT/VFD com scanlines sutis e LEDs luminosos para instrumentação.
- [x] `TSK-UI-06`: Testes unitários para utilitários de áudio tátil e componentes redesenhados.

#### Lote 8.2: Acessibilidade Espacial no Canvas SVG (Fase F-4) — ✅ CONCLUÍDO & HOMOLOGADO
- [x] `TSK-UI-07`: Navegação por teclado (`Tab`, Setas) entre nós no canvas de Estruturas e Circuitos (`BridgeCanvas.tsx`).
- [x] `TSK-UI-08`: Ações de teclado para fixar nós (`Space`), criar barras (`Enter`) e deletar (`Del`).
- [x] `TSK-UI-09`: Região `aria-live` e retícula visual ativa informando coordenadas atuais e conexões para leitores de tela.

---

### 🚀 ONDA 3: FASE 9 — Modo Educador & Academia Pedagógica (DOC-08)

#### Lote 9.1: Authoring Studio de Trilhas & Desafios (Fase E1) — ✅ CONCLUÍDO & HOMOLOGADO
- [x] `TSK-EDU-01`: Interface visual do Editor de Níveis para professores (`EducatorAcademyPage.tsx`).
- [x] `TSK-EDU-02`: Restritor de inventário pedagógico (materiais permitidos, teto de peças, orçamento rígido).
- [x] `TSK-EDU-03`: Formulário de metadados didáticos (objetivos pedagógicos, códigos BNCC/NGSS, dicas graduais).

#### Lote 9.2: Gabarito Analítico & Rubrica Automática (Fase E2)
- [ ] `TSK-EDU-04`: Otimizador computacional de topologias para cálculo da fronteira de Pareto (custo ótimo vs SF).
- [ ] `TSK-EDU-05`: Emissor de folha de gabarito técnico do professor com memória de cálculo em PDF/Print.

#### Lote 9.3: Empacotamento de Atividades & Turmas (Fase E3) — ✅ CONCLUÍDO & HOMOLOGADO
- [x] `TSK-EDU-06`: Serializador/deserializador de trilhas didáticas completas em URL Hash compacta (`educatorPackaging.ts`).
- [x] `TSK-EDU-07`: Exportador e importador de arquivos `.forge-class` com assinatura de integridade.
- [x] `TSK-EDU-08`: Gerenciador de turmas local com atribuição de desafios sequenciais (`educatorStore.ts`).

#### Lote 9.4: Telemetria Pedagógica & Projeção ao Vivo (Fases E4 e E5)
- [ ] `TSK-EDU-09`: Detector de erros conceituais recorrentes da turma (flambagem, curto-circuito, estol).
- [ ] `TSK-EDU-10`: Heatmap de colapso coletivo sobreposto ao canvas do professor.
- [ ] `TSK-EDU-11`: Painel de projeção para sala de aula com simulação side-by-side de duas soluções e ranking anônimo.

---

### 🚀 ONDA 4: FASE 10 — CAD Real & Digital Twin NFT (DOC-09)

#### Lote 10.1: Pipeline de Fabricação Digital CAD/CAM (Fases M1 e M2) — ✅ CONCLUÍDO & HOMOLOGADO
- [x] `TSK-CAD-01`: Gerador paramétrico de conectores de treliça 3D em malha binária `.stl` no navegador (`stlGenerator.ts`).
- [x] `TSK-CAD-02`: Seletor de modo de junta (encaixe tubular socket vs chapa parafusada gusset plate para M3/M4 DIN 912).
- [x] `TSK-CAD-03`: Calibrador de folga de impressão FDM/SLA (tolerância de $0.15\text{mm}$ a $0.45\text{mm}$).
- [x] `TSK-CAD-04`: Exportador vetorial `.dxf` (AutoCAD R12) e `.svg` (1:1 calibrado) com algoritmo de nesting 2D em pranchas (`dxfExporter.ts`, `CadExportModal.tsx`).

#### Lote 10.2: Web3 Vehicle NFT Minting & Proof of Engineering (Fases M3 e M4)
- [ ] `TSK-NFT-01`: Oráculo de homologação: assinatura criptográfica de aprovação em teste físico nominal.
- [ ] `TSK-NFT-02`: Gerador de metadados on-chain (ERC-721 / Metaplex) com telemetria física real do veículo.
- [ ] `TSK-NFT-03`: Renderizador de Digital Twin vetorial SVG e empacotamento GLB 3D.
- [ ] `TSK-NFT-04`: Interface de conexão com carteiras e cunhagem do Certificado Técnico de Homologação.

---

### 📋 ONDA 5: FASE 11 — Backend, Sync Local-First & Salas de Nuvem (DOC-11)
- [ ] `TSK-BCK-01`: Camada de persistência local unificada em IndexedDB com suporte a sincronização assíncrona.
- [ ] `TSK-BCK-02`: API Serverless de Turmas (Cloudflare Workers / Node) para compartilhamento em nuvem.
- [ ] `TSK-BCK-03`: Ingestão de eventos de telemetria de alta performance para consolidação de métricas da turma.
- [ ] `TSK-BCK-04`: Validador anti-cheat no servidor com re-execução determinística da simulação de física.

---

### 📋 ONDA 6: FASE 12 — Economia da Forja, Garagem & Tech Tree (DOC-10)
- [ ] `TSK-ECO-01`: Sistema monetário da Forja (Créditos $\mathcal{F}\$, Sucata de Aço, Pontos de P&D e XP de Engenheiro).
- [ ] `TSK-ECO-02`: Interface interativa da Árvore Tecnológica com desbloqueio de materiais e peças avançadas.
- [ ] `TSK-ECO-03`: Garagem do Inventor com customização de chassis, rodas, trem de força e centro de massa.
- [ ] `TSK-ECO-04`: Sistema de patentes e royalties de blueprints entre jogadores da guilda.
