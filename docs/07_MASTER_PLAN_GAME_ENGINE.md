---
idea: IDEA-010
doc: 07_MASTER_PLAN_GAME_ENGINE
version: 2.0.0
standard: GUILD-DOC-STANDARD@0.2.0
status: approved
updated: 2026-11-11
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Master Plan & Arquitetura Versionada: "A Forja do Engenheiro"
### De Ferramenta Estática a Jogo Vivo — Transformando Crianças em Engenheiros
**Documento Mestre Integrador (Game Engine, Metagame, Educação, Manufatura e Frontend)**

---

## 1. Missão Pedagógica & Game Design

O objetivo supremo do **Engineering Forge** é despertar a vocação de engenharia em jovens e crianças através de **intuição física tangível, causalidade visual contínua e falha espetacular e instrutiva**.

### O Ciclo Didático da Forja (Bloom's Taxonomy Adaptada):
1. **Experimentação Lúdica (Piso Baixo):** Qualquer criança de 8 anos conecta 3 barras ou 2 fios e clica em "Play" em menos de 10 segundos.
2. **Tempo Dinâmico (A Física no Tempo):** A simulação não é resolvida num corte estático instantâneo; o teste ocorre em tempo contínuo (60 FPS) — o veículo entra na ponte, a estrutura flexiona, os elétrons fluem pelo filamento, os pneus patinam se a tração estourar.
3. **Causalidade Transparente na Falha (Juicy Disaster):** O colapso é divertido e educativo. O jogador vê exatamente qual barra atingiu a capacidade máxima e rompeu, provocando o colapso subsequente.
4. **Otimização & Maestria (Teto Infinito):** Estrelas e eficiência econômica incentivam a redução de peso, busca por materiais nobres e topologias ótimas.

---

## 2. Mapa dos Planos Especializados Integrados

O Master Plan coordena quatro planos arquiteturais especializados:

| Código | Plano Especializado | Foco Técnico |
|---|---|---|
| **DOC-08** | [Modo Educador & Academia Pedagógica](08_MASTER_PLAN_MODO_EDUCADOR.md) | Criação de trilhas, restrição de inventário, gabaritos automáticos, gestão de turmas e BNCC/NGSS. |
| **DOC-09** | [CAD Real & Digital Twin NFT](09_MASTER_PLAN_CAD_MANUFATURA_E_NFT.md) | Geração paramétrica de STL (impressão 3D), DXF (corte laser) e minting on-chain de veículos certificados (Proof-of-Engineering). |
| **DOC-10** | [Frontend Game UX/UI & Economia](10_MASTER_PLAN_FRONTEND_GAME_ENGINE.md) | Estética diegética industrial, áudio tátil, árvore tecnológica, garagem e acessibilidade no canvas. |
| **DOC-11** | [Backend & Sincronização em Nuvem](11_MASTER_PLAN_BACKEND_SYNC.md) | Arquitetura Local-First, sincronização edge para turmas, telemetria de sala de aula e anti-cheat. |

---

## 3. Roteiro Global de Versões Evolutivas (v1.0 a v6.0)

```
┌────────────────────────────────────────────────────────────────────────┐
│  v1.0 — "The Living Physics" (✅ Concluída)                           │
│  Partículas · FEA Heatmap · Dinâmica 60 FPS · Web Audio Procedural     │
├────────────────────────────────────────────────────────────────────────┤
│  v2.0 — "The Tinkerer's Workshop & Sandbox" (✅ Concluída)             │
│  Sandbox Livre · Multímetro (DMM) · Osciloscópio (DSO) · Relatório BOM │
├────────────────────────────────────────────────────────────────────────┤
│  v3.0 — "Mechatronics Fusion & Systems Engineering" (✅ Concluída)     │
│  Portas Lógicas · Guinchos DC · Pontes Levadiças · Dificuldade · XP    │
├────────────────────────────────────────────────────────────────────────┤
│  v4.0 — "The Tactile Cyber-Forge & Game Polish" (🚀 Em Execução)       │
│  Redesign Industrial Diegético · Microinterações Táteis · HUD Premium  │
├────────────────────────────────────────────────────────────────────────┤
│  v5.0 — "The Educator Academy & Physical Manufacturing" (📋 Planejado) │
│  Editor de Trilhas Didáticas · Gabarito Analítico · Exportador STL/DXF │
├────────────────────────────────────────────────────────────────────────┤
│  v6.0 — "The Global Guild & Web3 Digital Twin" (📋 Planejado)          │
│  Cloud Classrooms · Minting NFT de Veículos Homologados · Tech Tree    │
└────────────────────────────────────────────────────────────────────────┘
```

### 🚀 Versão 1.0 — "The Living Physics" (✅ Concluída)
- **Carga Móvel e Deformação Dinâmica (Estruturas):** Veículo atravessando o tabuleiro em tempo real; deflexão elástica visível; rompimento catastrófico animado da barra mais solicitada com partículas de fragmentos (`physics/trussDynamic.ts`).
- **Fluxo Visual de Elétrons (Circuitos):** Partículas luminosas percorrendo fios com velocidade proporcional à corrente $I$; chave faca (knife switch) animada; aquecimento incandescente da lâmpada; curto-circuito com faíscas (`physics/circuit.ts`).
- **Pista de Testes Animada (Máquinas):** Arrancada contínua com rodas girando, velocímetro dinâmico, fumaça de patinagem de pneus quando o torque satura o atrito $\mu m g$, e animação de subida de rampa (`physics/vehicle.ts`).
- **Sonoplastia Procedural Nativa (Web Audio API):** Síntese pura sem assets pesados — estalo de tensão, rompimento estrutural, zumbido elétrico de 60Hz, faísca, ronco de motor, relé eletromecânico, chave fim de curso e fanfarra de vitória (`audio/soundFx.ts`).

### ⚡ Versão 2.0 — "The Tinkerer's Workshop & Sandbox" (✅ Concluída)
- **Oficina Sandbox Livre (`components/SandboxWorkspace.tsx`):** Vão ajustável de 8m a 32m com carga de até 120kN, protoboard com barramento DC de 3V a 48V, e pista veicular configurável (-15° a +30°, carga até 1000kg).
- **Instrumentação Analítica (Modo Raio-X):** Multímetro digital virtual (`DigitalMultimeter.tsx`) com 4 modos e pontas móveis; Osciloscópio digital (`LabOscilloscope.tsx`) com formas de onda em tempo real; diagrama de corpo livre com vetores de força e heatmap FEA de tensão.
- **Laboratório de Engenharia Reversa (`components/TroubleshootingLab.tsx`):** 3 quebra-cabeças interativos de falha física (flambagem, curto-circuito, estol em rampa).
- **Blueprints Compartilháveis & Relatórios BOM:** Exportação de estruturas e circuitos em strings Base64 / JSON (`BlueprintManager.ts`) e emissão de folha técnica industrial (`TechnicalSpecReportModal.tsx`).

### 🔬 Versão 3.0 — "Mechatronics Fusion & Systems Engineering" (✅ Concluída)
- **Desafios Interdisciplinares:** Ponte levadiça acionada por guincho elétrico DC e circuito de controle com relé e chave fim de curso (`components/MechatronicsCanvas.tsx`, `pages/MechatronicsPlayLevel.tsx`).
- **Pack de Automação & Lógica:** Portas lógicas digitais táteis (`AND`, `OR`, `NOT`, `XOR`, `BUFFER`) para intertravamento de segurança de tráfego.
- **Seletor de Dificuldade Física & Conquistas:** Calibração de gravidade e resistência de materiais (Easy/Medium/Hard) e Estante de Troféus com pontuação de XP (`state/achievementStore.ts`).

### 🎨 Versão 4.0 — "The Tactile Cyber-Forge & Game Polish" (🚀 Em Execução)
- **Design System Industrial Diegético:** Estética de centro de comando aeroespacial/industrial, CRT overlays, painéis de metal escovado, LEDs e microinterações de precisão.
- **Áudio Tátil Integrado:** Cliques de microswitch em botões, hum eletromagnético em seleções e ambientação acústica industrial.
- **Acessibilidade Espacial no Canvas (Fase F-4):** Navegação por teclado nos editores SVG e foco assistivo para leitores de tela.

### 🎓 Versão 5.0 — "The Educator Academy & Physical Manufacturing" (📋 Planejado)
- **Modo Educador Completo (Fases E1 a E5):** Editor visual de trilhas pedagógicas, restrição de inventário, cálculo de gabarito e distribuição por URL compacta.
- **Exportação CAD para Manufatura Real (Fases M1 e M2):** Geração de `.STL` para impressão 3D de nós e juntas, planificação de barras para corte a laser `.DXF/.SVG` (ISO 2768-m).

### 🌐 Versão 6.0 — "The Global Guild & Web3 Digital Twin" (📋 Planejado)
- **Web3 Vehicle NFT Minting (Fases M3 e M4):** Homologação física com prova criptográfica on-chain e especificação técnica imutável do veículo.
- **Cloud Classrooms & Backend Sync (Fases B1 a B4):** Salas de aula em nuvem, telemetria agregada para professores e leaderboard global.
- **Árvore Tecnológica & Economia da Forja (Fase F-3):** Sistema de P&D, materiais nobres e progressão de carreira de engenheiro.
