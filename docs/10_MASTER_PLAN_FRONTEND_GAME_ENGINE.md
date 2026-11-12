---
idea: IDEA-010
doc: 10_MASTER_PLAN_FRONTEND_GAME_ENGINE
version: 2.0.0
standard: GUILD-DOC-STANDARD@0.2.0
status: approved
updated: 2026-11-11
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Master Plan: Arquitetura de Frontend de Jogos, UX/UI Diegética & Economia de Jogo
### High-Performance Versioned Frontend Architecture, Atomic Design & Canvas Optimization
**Da Interface Web Básica ao Centro de Comando Industrial da Forja de Engenharia (Game Studio Workflow)**

---

## 1. Visão de Produto & Game UX: O Fim da "Interface Cinza Utilitária"

O jogador não deve sentir que está usando um software acadêmico árido ou um formulário web; ele deve se sentir no comando de um **Laboratório Industrial Cyber-Físico de Alta Precisão**:
- **Estética Visual Diegética:** Chapas metálicas escovadas, rebites de titânio, telas CRT/VFD com scanlines sutis de monitoramento, iluminação de LED âmbar e laranja de forja (`#ff6a2c`), instrumentos com ponteiros analógicos e indicadores em matriz de pontos.
- **Sensação Tátil (Juice & Microinterações):**
  - Cliques mecânicos com feedback de áudio sintetizado em frequências ressonantes (Web Audio API microswitches).
  - Hover states com ruído sutil de indução eletromagnética e glow volumétrico.
  - Animações fluidas de transição usando curvas cúbicas de amortecimento físico (*spring physics / cubic-bezier(0.16, 1, 0.3, 1)*).
- **Gamificação e Economia Profunda:**
  - O jogador gerencia recursos, desbloqueia novas ligas metálicas e componentes através de uma **Árvore Tecnológica (Tech Tree)** e prepara seus protótipos na **Garagem do Inventor**.

---

## 2. Arquitetura de Frontend em Camadas de Jogo (Game UI Layers)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAMADA 5: METAGAME SHELL                        │
│   Garagem do Inventor · Tech Tree · Loja de Peças · Conquistas / XP    │
├────────────────────────────────────────────────────────────────────────┤
│                      CAMADA 4: DIEGETIC HUD & MODALS                   │
│   Multímetro · Osciloscópio · Instrumentos de Painel · Relatório BOM   │
├────────────────────────────────────────────────────────────────────────┤
│                     CAMADA 3: SPATIAL CANVAS WORKSPACE                 │
│   SVG / Canvas 2D · Grid Magnético · Heatmap FEA · Partículas Dinâmicas│
├────────────────────────────────────────────────────────────────────────┤
│                    CAMADA 2: STATE & ECONOMY REPOSITORIES              │
│   Zustand Slices com Persistência Híbrida (Memory + Local + Cloud Sync)│
├────────────────────────────────────────────────────────────────────────┤
│                   CAMADA 1: DESIGN SYSTEM CORE TOKENS                  │
│   Atomic Design Tokens · Som Procedural Web Audio · Shaders/Filtros    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Arquitetura de Frontend Versionada de Alto Desempenho (Game Studio Workflow)

Para sustentar simulações de física em 60 FPS com milhares de nós e partículas simultâneas sem engasgos de lixo de memória (GC pauses) ou travamento da main thread, a arquitetura do frontend adota padrões estritos de estúdio profissional:

### 3.1 Gerenciamento de Estado Escalável: Zustand Slices com Seletores Seletivos
1. **Desacoplamento por Domínio Físico & Metagame:**
   - `gameStore.ts`: Estado estático de estruturas e histórico de Undo/Redo.
   - `circuitStore.ts`: Estado topológico de circuitos elétricos DC e nós.
   - `vehicleStore.ts`: Trem de força, chassi e telemetria newtoniana.
   - `forgeEconomyStore.ts`: Moedas da Forja ($\mathcal{F}\$$, RP, Sucata, XP), patentes e nós da Árvore Tecnológica.
   - `educatorStore.ts`: Trilhas didáticas, turmas locais e pacotes `.forge-class`.
2. **Seletores Granulares de Renderização:**
   - Proibido consumo de store global direto em componentes de alta frequência de atualização (ex: relógio de simulação ou medidores HUD).
   - Uso obrigatório de seletores granulares com comparação rasa (`useShallow`) para evitar re-renderizações desnecessárias em 60 FPS:
     ```ts
     const { currentSpeed, engineRpm } = useVehicleStore(
       useShallow((s) => ({ currentSpeed: s.currentSpeed, engineRpm: s.engineRpm }))
     );
     ```

### 3.2 Design System Industrial: Metodologia Atomic Design
A hierarquia de componentes da interface da Forja segue o padrão Atomic Design estrito:
1. **Átomos (Atoms) em `game/src/components/atoms/` & `atomic/`:**
   - `Button.tsx`: Botão primário/secundário/accent com token `.industrial-panel` e acionamento sonoro tátil (`soundFx.ts`).
   - `Input.tsx`: Campo de entrada numérico/texto industrial com indicador de unidades (kN, MPa, V, Ω, kg) e estado de erro.
   - `Badge.tsx`: Selos e estampas técnicas (`asme`, `crypto`, `accent`, `success`, `warning`, `danger`) com LED pulsante opcional.
   - `LedIndicator.tsx`: LEDs indicadores de status (Verde nominal, Âmbar alerta, Vermelho colapso, Ciano telemetria).
   - `SevenSegmentDisplay.tsx`: Visores numéricos digitais com fonte monospace tabular e cores customizáveis.
2. **Moléculas (Molecules) em `game/src/components/molecules/`:**
   - `StressMeter.tsx`: Mini-medidores analógicos de tensão / compressão com fator de segurança.
   - `MaterialPicker.tsx`: Seletor de materiais com indicação de módulo elástico ($E$) e custo.
   - `IndustrialSlider.tsx`: Sliders táteis de ajuste paramétrico e sensibilidade.
   - `GaugeMeter.tsx`: Manômetro analógico rotativo com deflexão angular de $-120^\circ$ a $+120^\circ$, zonas de perigo e readout digital.
   - `PhysicsPresets.tsx` & `physicsPresetConstants.ts`: Seletor de ambientes gravitacionais ('Earth' $9.81\,\text{m/s}^2$, 'Moon' $1.62\,\text{m/s}^2$, 'Deep Space' $0.00\,\text{m/s}^2$).
   - `CollisionToggle.tsx`: Interruptor diegético para alternar a visualização de limites e caixas de colisão física (`showCollisions`).
   - `SimulationTimer.tsx`: Cronômetro analítico determinístico que calcula o tempo decorrido da simulação ($t = \text{currentStepIndex} \times \Delta t$) com precisão tabular industrial.
   - `SimulationConsole.tsx` & `simulationConsoleTypes.ts`: Console terminal de rolagem de eventos físicos em tempo real (colisões, forças de impacto, picos de tensão, cinemática).
3. **Organismos (Organisms) em `game/src/components/organisms/`:**
   - `GameLoop.tsx`: Loop de simulação com acumulador de passo fixo (*fixed-timestep*) desacoplado da taxa de renderização visual.
   - `PhysicsMetrics.tsx`: Painel de telemetria temporal, gravidade e aceleração com `PhysicsPresets`, controles integrados e terminal `SimulationConsole` expansível.
   - `PhysicsControls.tsx`: Deck de comando de simulação (Play/Pause, Reset, Passo +1 $\Delta t$ e seletor de velocidade $0.25\times \dots 2\times$).
   - `PhysicsStatusBar.tsx`: Barra horizontal de status físico atuando como container com LED de simulação ativa, gravidade, escala e cronômetro.
   - `TelemetryHudOrganism.tsx`: HUD analítico em tempo real com leitura de deformação e integridade.
   - `TechTreeOrganism.tsx`: Árvore de pesquisa não-linear modular com saldo da carteira da guilda e desbloqueio de patentes.
   - `PatentMarketplaceOrganism.tsx`: Bolsa comunitária de patentes de blueprints e royalties.
   - `BuildModePhysicsHUD.tsx`: Telemetria estática em tempo de construção (CoG, massa, reações de apoio).
   - `DigitalMultimeter.tsx` & `TroubleshootingLab.tsx`: Instrumentação de bancada laboratorial.
   - `GlobalNavBar.tsx`: Barra de navegação global em todas as telas com atalhos de corredores disciplinares e saldos da carteira.
   - `PlayLevelHeaderNav.tsx`: Cabeçalho de navegação contextual entre níveis com breadcrumbs, seletor de níveis e botões de retorno.
4. **Templates & Telas (Templates & Pages):**
   - Espaço de trabalho de construção de pontes (`StructuresPlayLevel.tsx`).
   - Espaço de trabalho de circuitos elétricos (`CircuitsPlayLevel.tsx`).
   - Pista de teste de máquinas e veículos (`VehiclesPlayLevel.tsx`).
   - Centro de Comando da Forja (`PackSelect.tsx`).
   - Terminal da Academia do Educador (`EducatorAcademyPage.tsx`).

### 3.3 Otimização de Performance para Canvas de Alta Complexidade
1. **Estratégia de Renderização em Múltiplas Camadas (Multi-Layer Canvas):**
   - *Camada 0 (Fundo Estático):* Terreno, leito de rio, pilares e apoios fixos — desenhados **uma única vez** em canvas estático fora da tela (Offscreen Canvas / Bitmap caching).
   - *Camada 1 (Estrutura Dinâmica):* Barras, deformações elásticas e heatmap de tensão — redesenhados apenas quando ocorrem alterações de esforço.
   - *Camada 2 (Efeitos de Partículas & Faíscas):* Sistema de partículas autônomo com buffer circular pré-alocado (Zero-Allocation Loop).
2. **Prevenção de Garbage Collection (GC) e Alocação Zero:**
   - Vetores de cálculo e matrizes de transformação são reutilizados via objetos de trabalho alocados estaticamente (`reusableVectorA`, `scratchMatrix`).
   - Partículas mortas são recicladas via *Object Pooling*, evitando instanciações com `new` durante o loop de animação `requestAnimationFrame`.
3. **Agendamento de Alta Resolução:**
   - Separação entre a taxa de atualização física (passo de tempo fixo de $\Delta t = 1/60\text{ s}$) e a interpolação visual do canvas para evitar artefatos de jitter.

---

## 4. Sistema Econômico da Forja (Game Economy & Tokenomics)

### 4.1 Os Quatro Recursos da Forja
1. **Créditos da Forja ($\mathcal{F}\$):** Moeda operacional obtida ao resolver contratos e níveis respeitando as restrições orçamentárias. Usada para fabricar protótipos e comprar peças standard.
2. **Sucata de Aço & Ligas Nobres (Scrap & Alloys):** Matéria-prima física acumulada por reciclagem de testes e bônus de eficiência.
3. **Pontos de Pesquisa (P&D / RP - Research Points):** Concedidos ao atingir fatores de segurança ótimos ($SF \in [1.2, 1.8]$) e resolver níveis no modo difícil. Usados exclusivamente na Árvore Tecnológica.
4. **Reputação de Engenheiro (XP):** Nível de senioridade do jogador (*Apprentice $\to$ Journeyman $\to$ Specialist $\to$ Chief Engineer*), determinando acesso a contratos de maior complexidade.

### 4.2 O Core Loop de Retenção
```
       ┌───────────────────────────────┐
       │     RECEBER CONTRATO          │
       │  (Vão de Ponte / Circuito)   │
       └──────────────┬────────────────┘
                      │
                      ▼
       ┌───────────────────────────────┐
       │     FASE DE PROJETO (BUILD)   │
       │  Consome Orçamento do Nível   │
       └──────────────┬────────────────┘
                      │
                      ▼
       ┌───────────────────────────────┐
       │     TESTE FÍSICO NO TEMPO     │
       │    Deformação / Faísca / 60FPS│
       └──────────────┬────────────────┘
                      │
            ┌─────────┴─────────┐
            │                   │
         [FALHA]            [SUCESSO]
            │                   │
            ▼                   ▼
    Falha Didática      Recompensa:
    (Heatmap / Dica)    - Estrelas (1 a 3)
    Sem Perda Punitiva  - Créditos residuais
            │           - Pontos de P&D (RP)
            │                   │
            └─────────┬─────────┘
                      │
                      ▼
       ┌───────────────────────────────┐
       │  GARAGEM & ÁRVORE TECNOLÓGICA │
       │  Desbloquear Novas Ligas,     │
       │  Motores Brushless & Diodos   │
       └───────────────────────────────┘
```

---

## 5. Próximas Etapas e Entregas (Onda 6 — Fase 12.4)
- **Lote 12.4 (`TSK-ECO-04`):** Sistema de Patentes Comunitárias e Royalties de Blueprints entre Engenheiros da Guilda.
  - Registro de projetos com autor original, taxa de licenciamento em Créditos $\mathcal{F}\$ e histórico de comissões passivas para inventores.
