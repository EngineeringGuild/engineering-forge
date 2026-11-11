---
idea: IDEA-010
doc: 10_MASTER_PLAN_FRONTEND_GAME_ENGINE
version: 1.0.0
standard: GUILD-DOC-STANDARD@0.2.0
status: approved
updated: 2026-11-11
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Master Plan: Arquitetura de Frontend de Jogos, UX/UI Diegética & Economia de Jogo
### High-Complexity Game Frontend, Tactile Industrial UI & Game Economics
**Da Interface Web Básica ao Centro de Comando Industrial da Forja de Engenharia**

---

## 1. Visão de Produto & Game UX: O Fim da "Interface Cinza Utilitária"

O jogador não deve sentir que está usando um software acadêmico árido ou um formulário web; ele deve se sentir no comando de um **Laboratório Industrial Cyber-Físico de Alta Precisão**:
- **Estética Visual Diegética:** Chapas metálicas escovadas, rebites de titânio, telas CRT/VFD com scanlines sutis de monitoramento, iluminação de LED âmbar e laranja de forja (`#ff6a2c`), instrumentos com ponteiros analógicos e indicadores em matriz de pontos.
- **Sensação Tátil (Juice & Microinterações):**
  - Cliques mecânicos com feedback de áudio sintetizado em frequências ressonantes.
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
│   Zustand Stores com Persistência Híbrida (Memory + Local + Cloud Sync)│
├────────────────────────────────────────────────────────────────────────┤
│                   CAMADA 1: DESIGN SYSTEM CORE TOKENS                  │
│   Industrial Theme Tokens · Som Procedural Web Audio · Shaders/Filtros │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Sistema Econômico da Forja (Game Economy & Tokenomics)

### 3.1 Os Quatro Recursos da Forja
1. **Créditos da Forja ($\mathcal{F}\$):** Moeda operacional obtida ao resolver contratos e níveis respeitando as restrições orçamentárias. Usada para fabricar protótipos e comprar peças standard.
2. **Sucata de Aço & Ligas Nobres (Scrap & Alloys):** Matéria-prima física acumulada por reciclagem de testes e bônus de eficiência.
3. **Pontos de Pesquisa (P&D / RP - Research Points):** Concedidos ao atingir fatores de segurança ótimos ($SF \in [1.2, 1.8]$) e resolver níveis no modo difícil. Usados exclusivamente na Árvore Tecnológica.
4. **Reputação de Engenheiro (XP):** Nível de senioridade do jogador (*Apprentice $\to$ Journeyman $\to$ Specialist $\to$ Chief Engineer*), determinando acesso a contratos de maior complexidade.

### 3.2 O Core Loop de Retenção
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

## 4. Fases de Execução do Frontend & UX

### 💎 Fase F-1 — Redesign Cyber-Industrial & Microinterações Táteis
**Objetivo:** Transformação imediata da aparência e sonoridade de toda a plataforma existente.
- **Implementação do Design System Industrial:**
  - Painéis com acabamento chanfrado e contornos de precisão aeroespacial (`border-border/80`, gradientes metálicos sutis `from-surface-1 to-surface-2`).
  - Efeito sutil de display CRT retro-futurista nas telas de instrumentação e cabeçalhos.
  - Indicadores de status luminosos (LEDs pulsantes verdes para nominal, âmbar para tensão, vermelho para sobrecarga).
- **Sonoplastia Tátil de Interface:**
  - Cliques mecânicos de microswitch ao alternar ferramentas, abas e níveis.
  - Hover hum de baixa frequência ao passar o cursor sobre nós de treliça e componentes elétricos.
- **Responsividade e Grid de Níveis:**
  - Visualização em cards industriais com mini-gráficos de estresse e percentual de maestria.

### 🏎️ Fase F-2 — A Garagem do Inventor & Customização Veicular
**Objetivo:** Interface dedicada para testes de montagem de veículos e personalização de chassis.
- Inspeção 2D detalhada de chassi, trem de força, distribuição de massa e centro de gravidade (CoG).
- Bancada de ajuste dinâmico de calibração de suspensão e pneus (coeficiente de atrito $\mu$).

### 🧬 Fase F-3 — Árvore Tecnológica & Loja de Componentes
**Objetivo:** Progressão não linear estilo RPG técnico.
- Grafo visual interativo de tecnologias com nós interligados:
  - *Ramo Estrutural:* Madeira $\to$ Aço Estrutural ASTM A36 $\to$ Cabos de Aço Trançado $\to$ Titânio Ti-6Al-4V $\to$ Compósitos de Fibra de Carbono.
  - *Ramo Eletroeletrônico:* Lâmpada Incandescente $\to$ Resistor Cerâmico $\to$ Diodo Semicondutor $\to$ Transistor MOSFET $\to$ Portas Lógicas TTL.
  - *Ramo de Trem de Força:* Motor DC com Escovas $\to$ Redutor de Engrenagens Planetárias $\to$ Motor Brushless de Alto Torque $\to$ Turbina Turbo-Híbrida.

### ⌨️ Fase F-4 — Acessibilidade Espacial no Canvas (Fechando a Lacuna da Fase 4f)
**Objetivo:** Permitir a construção e conexão completa de nós no canvas SVG via teclado e leitores de tela.
- Navegação espacial em grade magnética via teclas `Tab` e setas direcionais (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`).
- Teclas de atalho industriais: `Space` para fixar nó, `Enter` para conectar membro, `Delete/Backspace` para remover, `M` para ciclar materiais.
- Anúncios de acessibilidade via `aria-live="polite"` detalhando a coordenada e conexão atual.
