---
idea: IDEA-010
doc: 07_MASTER_PLAN_GAME_ENGINE
version: 1.0.0
standard: GUILD-DOC-STANDARD@0.2.0
status: approved
updated: 2026-11-04
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Master Plan & Arquitetura Versionada: "A Forja do Engenheiro"
### De Ferramenta Estática a Jogo Vivo — Transformando Crianças em Engenheiros

## 1. Missão Pedagógica & Game Design

O objetivo supremo do **Engineering Forge** é despertar a vocação de engenharia em jovens e crianças através de **intuição física tangível, causalidade visual contínua e falha espetacular e instrutiva**.

### O Ciclo Didático da Forja (Bloom's Taxonomy Adaptada):
1. **Experimentação Lúdica (Piso Baixo):** Qualquer criança de 8 anos conecta 3 barras ou 2 fios e clica em "Play" em menos de 10 segundos.
2. **Tempo Dinâmico (A Física no Tempo):** A simulação não é resolvida num corte estático instantâneo; o teste ocorre em tempo contínuo (60 FPS) — o veículo entra na ponte, a estrutura flexiona, os elétrons fluem pelo filamento, os pneus patinam se a tração estourar.
3. **Causalidade Transparente na Falha (Juicy Disaster):** O colapso é divertido e educativo. O jogador vê exatamente qual barra atingiu a capacidade máxima e rompeu, provocando o colapso subsequente.
4. **Otimização & Maestria (Teto Infinito):** Estrelas e eficiência econômica incentivam a redução de peso, busca por materiais nobres e topologias ótimas.

---

## 2. Arquitetura de Software em 4 Camadas

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAMADA 4: METAGAME & UX                         │
│   React 19 · HUD Lúdica · Áudio Sintético Web Audio · Progressão       │
├────────────────────────────────────────────────────────────────────────┤
│                   CAMADA 3: VISUALIZAÇÃO DINÂMICA                      │
│   SVG / Canvas 2D Animado · Shaders de Elétrons · Partículas de Ruptura│
├────────────────────────────────────────────────────────────────────────┤
│                 CAMADA 2: MOTORES DE FÍSICA NO TEMPO                   │
│   Passo Temporal Δt · Carga Móvel (Truss) · Fluxo Nodal (Circuitos)    │
│   Cinemática Newtoniana Contínua (Veículos)                            │
├────────────────────────────────────────────────────────────────────────┤
│                   CAMADA 1: MODELO DE DADOS & SCHEMAS                  │
│   Níveis Declarativos · Materiais · Componentes · Blueprints JSON      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Roteiro de Versões Evolutivas

### 🚀 Versão 1.0 — "The Living Physics" (Em Execução)
- **Carga Móvel e Deformação Dinâmica (Estruturas):** Veículo atravessando o tabuleiro em tempo real; deflexão elástica visível; rompimento catastrófico animado da barra mais solicitada com partículas de fragmentos.
- **Fluxo Visual de Elétrons (Circuitos):** Partículas luminosas percorrendo fios com velocidade proporcional à corrente $I$; chave faca (knife switch) animada; aquecimento incandescente da lâmpada; curto-circuito com faíscas.
- **Pista de Testes Animada (Máquinas):** Arrancada contínua com rodas girando, velocímetro dinâmico, fumaça de patinagem de pneus quando o torque satura o atrito $\mu m g$, e animação de subida de rampa.
- **Sonoplastia Procedural Nativa (Web Audio API):** Síntese pura sem assets pesados — estalo de tensão, rompimento estrutural, zumbido elétrico de 60Hz, faísca, ronco de motor e fanfarra de vitória.

### ⚡ Versão 2.0 — "The Tinkerer's Workshop & Sandbox"
- **Oficina Sandbox Livre:** Vão infinito, protoboard livre e pista plana sem limites de orçamento.
- **Instrumentação Analítica (Modo Raio-X):** Multímetro virtual para arrastar pontas de prova; diagrama de corpo livre com setas de vetores de força nos nós.
- **Blueprints Compartilháveis:** Exportação de estruturas e circuitos em strings Base64 / links de compartilhamento.

### 🔬 Versão 3.0 — "Mechatronics Fusion"
- **Desafios Interdisciplinares:** Ponte levadiça acionada por motor elétrico e circuito de segurança com chave fim de curso.
- **Veículo Elétrico em Ponte Treliçada:** Cálculo de peso do veículo vs. capacidade da ponte com recarga solar.
- **Pack de Automação:** Portas lógicas táteis (AND, OR, NOT) e engrenagens mecânicas.

### 🌐 Versão 4.0 — "The Guild Engineering Academy"
- **Desafios Semanais Globais:** Níveis procedurais com histogramas de custo/eficiência mundiais.
- **Modo Educador / Sala de Aula:** Criação de trilhas didáticas personalizadas para escolas.
- **Exportação CAD/3D Real:** Exportar nós de pontes para `.STL` (impressão 3D) ou corte a laser.
