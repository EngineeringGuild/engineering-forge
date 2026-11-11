---
idea: IDEA-010
doc: 02_ARCHITECTURE
version: 1.0.0
standard: GUILD-DOC-STANDARD@0.2.0
status: approved
updated: 2026-11-10
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Arquitetura Completa do Engineering Forge ("A Forja do Engenheiro")

## 1. Visão Geral & Filosofia de Engenharia

O **Engineering Forge** é uma plataforma educacional e simulador de engenharia multi-física de alta fidelidade, operando **100% client-side** (zero servidor, zero banco de dados externo, R$0 de custo operacional de infraestrutura).

Toda a física do jogo é fundamentada em normas industriais e equações governantes reais (ASME Section III/VIII, AISC 360-16 LRFD, IEEE Std 141, ISO 80000-3, IEC 61131-3, modelo de atrito de Coulomb e formulações de Pacejka). Não há "valores mágicos" ou números inventados: as cotas de materiais e componentes são rastreadas, versionadas e exportáveis no padrão `Dim()` do **Engineering Guild Dimension Register**.

---

## 2. Diagrama de Arquitetura em 4 Camadas

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAMADA 4: METAGAME & UX                         │
│  - Zustand Stores: Game, Circuit, Vehicle, Mechatronics, Progression   │
│  - Seletores de Dificuldade (Easy, Medium, Hard) & Modificadores       │
│  - Sistema de Conquistas (Achievements Trophy Shelf & Toast Banners)   │
│  - Gerador de Relatórios Técnicos & BOM (ASME / IEEE / ISO)            │
│  - Gerenciador de Blueprints (Import/Export Base64 JSON)               │
│  - Pilha de Desfazer/Refazer (Undo/Redo History Stack - Ctrl+Z/Y)      │
│  - Instrumentos Virtuais: Multímetro Digital (DMM) & Osciloscópio (DSO)│
├────────────────────────────────────────────────────────────────────────┤
│                   CAMADA 3: VISUALIZAÇÃO & RUNTIME                     │
│  - SVG Canvas Dinâmico: Treliças, Circuitos, Pista de Veículos         │
│  - Canvas de Mecatrônica: Ponte Levadiça, Contrapeso, Guincho & Lógica │
│  - Sistema de Partículas (Canvas 2D): Faíscas elétricas & pó de fratura│
│  - Heatmap FEA de Tensão Estrutural: Gradiente verde → amarelo → rubro │
│  - Overlay de Debug: Vetores de força, colchetes e polígonos de colisão│
│  - HUD de Física em Tempo Real no Build Mode (Massa, CoG, Tensão Peak) │
│  - Motor de Áudio Procedural (Web Audio API sintetizado nativo)        │
├────────────────────────────────────────────────────────────────────────┤
│                 CAMADA 2: MOTORES DE FÍSICA NO TEMPO                   │
│  - Solver de Treliças 2D: Rigidez Direta (Direct Stiffness Method, FEA)│
│  - Transit Load Dinâmico: Deflexão elástica e colapso progressivo      │
│  - Solver Nodal de Circuitos DC: Matriz de Condutância (Laplaciano)    │
│  - Cinemática de Máquinas: Equações de Newton, atrito Coulomb & rampa  │
│  - Motor de Mecatrônica: Portas lógicas (AND/OR/NOT/XOR), relés e torque│
│  - Bancada de Materiais: Euler-Bernoulli, flambagem Euler, Joule, drag │
├────────────────────────────────────────────────────────────────────────┤
│                   CAMADA 1: MODELO DE DADOS & SCHEMAS                  │
│  - Catálogo de Materiais (Madeira, Aço, Cabo, Strut, Titânio, Carbono) │
│  - Catálogo Elétrico (Fios, Resistores 5Ω/15Ω, Lâmpadas, Fontes 3-48V) │
│  - Catálogo Mecânico (Motores Light/Heavy/Turbo, Chassis, Pneus)       │
│  - Catálogo de Mecatrônica (Guinchos DC, Sensores de Fim de Curso)     │
│  - Níveis Declarativos Versionados (Structures, Circuits, Machines,    │
│    Mechatronics, Troubleshooting Puzzles)                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detalhamento dos Motores de Física (Camada 2)

### 3.1. Estruturas & Treliças (`physics/truss.ts`, `physics/trussDynamic.ts`)
- **Método da Rigidez Direta:** Cada junta é tratada como pino bi-dimensional (2 graus de liberdade, $u_x, u_y$). Monta a matriz global de rigidez $[K]$ combinando matrizes de elementos $[k_e]$:
  $$[k_e] = \frac{EA}{L} \begin{bmatrix} c^2 & cs & -c^2 & -cs \\ cs & s^2 & -cs & -s^2 \\ -c^2 & -cs & c^2 & cs \\ -cs & -s^2 & cs & s^2 \end{bmatrix}$$
- **Solver Linear:** `physics/linalg.ts` resolve $[K]\{u\} = \{F\}$ por eliminação gaussiana com pivoteamento parcial. Singularidade detectada indica mecanismo instável.
- **Modos de Material Especiais:**
  - `cable`: Tração-only. Se a força axial for negativa (compressão), falha estrutural imediata.
  - `strut`: Compressão-only. Se a força axial for positiva (tração), falha estrutural imediata.
- **Deformação Dinâmica e Carga Móvel (`trussDynamic.ts`):** O trem de carga $P$ atravessa o tabuleiro em passos temporais contínuos $\Delta t$. Em cada nó, a deflexão elástica $\delta = u_y$ é calculada; se qualquer barra ultrapassar a tensão admissível $\sigma_{adm}$, ocorre fratura e o colapso subsequente se propaga em tempo real com dispersão de partículas.

### 3.2. Circuitos Elétricos DC (`physics/circuit.ts`)
- **Análise Nodal:** A matriz de condutância $[G]$ possui a mesma estrutura topológica (Laplaciano de grafo ponderado) da treliça, com 1 grau de liberdade por nó (tensão $V$).
  $$\sum_{j} G_{ij} (V_i - V_j) = I_i$$
- **Cálculo de Potência & Queima:** Para cada ramo, $I = (V_A - V_B)/R$ e $P = I^2 R$. Se $P > P_{max}$, o componente queima (burnout) com faíscas audíveis e visuais.
- **Mapeamento de Tensões Nodais:** Exporta mapa de potenciais $\{ \text{nodeId} \to V_i \}$ alimentando pontas de prova do Multímetro Digital (DMM).

### 3.3. Máquinas & Cinemática de Veículos (`physics/vehicle.ts`)
- **2ª Lei de Newton & Teto de Tração de Coulomb:**
  $$F_{trac} = \min(F_{motor}, \mu \cdot m \cdot g \cos\theta)$$
  $$a = \frac{F_{trac} - m \cdot g \sin\theta}{m}$$
- **Velocidade Final & Fenômeno de Estol:** Se a componente da gravidade $m g \sin\theta \ge F_{trac}$, a aceleração é nula e o veículo entra em estado de estol (`stalled`).
- **Janela de Velocidade:** Níveis suportam piso mínimo (`targetSpeed`) e teto máximo (`maxSpeed`).

### 3.4. Mecatrônica & Fusão de Sistemas (`physics/mechatronics.ts`)
- **Lógica Digital Combinacional:** Avaliador de redes lógicas booleanas com portas `AND`, `OR`, `NOT`, `XOR` e `BUFFER`.
- **Acoplamento Eletromecânico de Guinchos:**
  - Resistência de enrolamento $R_w = V_{rated} / I_{stall}$.
  - Força contra-eletromotriz $V_{emf} = \omega_{motor} \cdot K_e$.
  - Corrente de armadura $I = (V_{applied} - V_{emf}) / R_w$.
  - Torque mecânico e tração no cabo: $T_{winch} = I \cdot K_t \cdot \text{Ratio} / r_{drum}$.
- **Cinemática de Pontes Levadiças (Bascule Bridge):**
  - Integração angular considerando momento de inércia do vão $I_{deck} = \frac{1}{3} m L^2$, contrapeso $I_{cw} = m_{cw} (L/4)^2$, amortecimento de mancais e desligamento automático via chave de fim de curso (`LimitSwitch`) e relé eletromecânico.

---

## 4. Metagame, UI & Ferramentas do Engenheiro (Camada 4)

### 4.1. Seletor de Dificuldade Física (`state/difficultyStore.ts`, `components/DifficultySelector.tsx`)
Permite calibrar as condições físicas por nível ou globalmente:
- **Easy (Apprentice):** $0.8\times$ gravidade, $+25\%$ limite de tensão estrutural, $+25\%$ tolerância de queima térmica.
- **Medium (Standard):** $1.0\times$ gravidade nominal, $100\%$ limites ASME/IEEE.
- **Hard (Hardcore):** $1.15\times$ gravidade, $-15\%$ margem de tensão admissível, $-10\%$ tolerância de queima. Concede bônus de pontuação $1.4\times$ e desbloqueia a conquista "Hardcore Engineer".

### 4.2. Sistema de Conquistas & Milestones (`state/achievementStore.ts`, `components/AchievementsModal.tsx`)
- Rastreador reativo de marcos (Primeira Ponte, Mestre Eletricista, Quebra-Recordes, Intertravamento Seguro, etc.).
- Banner deslizante flutuante (`AchievementBanner.tsx`) com som de fanfarra e premiação de Pontos de Experiência de Engenharia (XP).
- Estante de Troféus acessível pela tela inicial e headers.

### 4.3. Rastreamento Unificado de Progresso (`state/ProgressManager.ts`, `state/gameProgressionStore.ts`)
- Persistência desacoplada em `localStorage` para todas as 4 disciplinas:
  - `engineering-forge-progress` (Estruturas)
  - `engineering-forge-circuits-progress` (Circuitos)
  - `engineering-forge-vehicles-progress` (Máquinas)
  - `engineering-forge-mechatronics-progress` (Mecatrônica)
  - `engineering-forge-achievements` (Conquistas)
  - `engineering-forge-difficulty` (Dificuldade)
- API limpa com métodos: `getCompletedLevels(packId)`, `isLevelCompleted(packId, levelId)`, `getStarsForLevel(packId, levelId)`, e `recordLevelCompletion(...)`.

### 4.4. Instrumentação de Laboratório Virtual
- **Multímetro Digital (`DigitalMultimeter.tsx`):** Medições reais de tensão $V$, corrente $A$, resistência $\Omega$ e teste de continuidade com bip sonoro e pontas vermelha (+) e preta (-).
- **Osciloscópio de Armazenamento Digital (`LabOscilloscope.tsx`):** Visualização em tempo real de forma de onda dual-channel (tensão, deflexão, esforço %, aceleração) com timebase ajustável, triggers e função freeze/pause.
- **Gerador de Relatórios Técnicos & BOM (`TechnicalSpecReportModal.tsx`):** Emissão de relatórios técnicos certificados ASME/IEEE/ISO com tabela detalhada de Lista de Materiais (BOM), custos unitários e exportação para clipboard.

---

## 5. Garantia de Qualidade & Testes Automatizados

O repositório possui uma suíte rigorosa de verificação contínua:
- **34 arquivos de teste unitário (`vitest`)**, totalizando **203 testes passando** sem mockings artificiais de física.
- **Validação Estrita de Tipos (`tsc --noEmit`)**: Nenhuma supressão cega (`any`, `ts-ignore`), tipagem estrita ativada.
- **Linter Zero Warnings (`biome/eslint`)**: 0 erros e 0 avisos em todos os 149 arquivos do projeto.
- **Deploy Estático**: Preparado para Cloudflare Pages / Vercel via `npm run build`.
