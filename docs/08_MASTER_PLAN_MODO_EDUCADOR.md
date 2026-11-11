---
idea: IDEA-010
doc: 08_MASTER_PLAN_MODO_EDUCADOR
version: 1.0.0
standard: GUILD-DOC-STANDARD@0.2.0
status: approved
updated: 2026-11-11
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Master Plan: Modo Educador & Academia Pedagógica da Forja
### The Educator Academy & Curriculum Authoring Engine
**Arquitetura Versionada e Modular para Ensino Estruturado de Engenharia e Física**

---

## 1. Visão Estratégica & Fundamentação Pedagógica

O **Modo Educador** é o coração da transformação do *Engineering Forge* de um jogo casual de quebra-cabeças físicos em uma **plataforma padrão de ensino de engenharia para escolas fundamentais, técnicas e universidades**.

### 1.1 Alinhamento com Marcos Curriculares Internacionais
- **BNCC (Brasil - Ensino Fundamental II e Médio):**
  - *EM13CNT101 / EM13CNT102:* Análise e previsão de movimentos e deformações a partir de leis de Newton, estática dos corpos rígidos e conservação de energia.
  - *EM13CNT301:* Construção de modelos físicos e circuitos eletroeletrônicos para investigação de potência dissipada (Efeito Joule).
- **NGSS (EUA - Next Generation Science Standards):**
  - *MS-ETS1 / HS-ETS1 Engineering Design:* Definição de critérios e restrições, priorização de soluções ótimas de custo-benefício e testes iterativos de falha sob carga.
- **ABET (Higher Education Engineering Accreditation):**
  - *Student Outcome 1 & 2:* Capacidade de identificar, formular e resolver problemas complexos de engenharia aplicando princípios de ciências e matemática; projetar sistemas dentro de restrições realistas (econômicas, de segurança e fabricação).

### 1.2 Taxonomia de Bloom Adaptada para Engenharia Física
```
┌────────────────────────────────────────────────────────────────────────┐
│                        NÍVEL 6: CRIAR (INVENTAR)                       │
│    Projetar uma ponte ou circuito do zero sem modelo de partida        │
├────────────────────────────────────────────────────────────────────────┤
│                       NÍVEL 5: AVALIAR (AUDITAR)                       │
│    Comparar duas topologias na Bancada de Testes e justificar o SF     │
├────────────────────────────────────────────────────────────────────────┤
│                      NÍVEL 4: ANALISAR (DECOMPOR)                      │
│    Identificar qual elemento iniciou o colapso estrutural (Heatmap)    │
├────────────────────────────────────────────────────────────────────────┤
│                      NÍVEL 3: APLICAR (CALCULAR)                       │
│    Dimensionar a resistência para limitar a corrente a 0.25A           │
├────────────────────────────────────────────────────────────────────────┤
│                     NÍVEL 2: COMPREENDER (EXPLICAR)                    │
│    Explicar por que cabos suportam tração mas afrouxam em compressão   │
├────────────────────────────────────────────────────────────────────────┤
│                      NÍVEL 1: RECORDAR (DEFINIR)                       │
│    Identificar apoios de 1º gênero (rolete) vs 2º gênero (pino fixo)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Arquitetura Modular do Modo Educador

O sistema é construído sobre 5 módulos desacoplados com contratos estritos de dados em TypeScript:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      MÓDULO E5: LIVE CLASSROOM                         │
│  Projeção em tempo real · Comparador de Soluções · Leaderboard Anon    │
├────────────────────────────────────────────────────────────────────────┤
│                    MÓDULO E4: PEDAGOGICAL ANALYTICS                    │
│  Taxas de Aprovação · Matriz de Falhas Recorrentes · Heatmap de Turma  │
├────────────────────────────────────────────────────────────────────────┤
│                 MÓDULO E3: CLASSROOM & PACKAGING ENGINE                │
│  Deep Links (URL Hash) · Pacotes .forge-class · Gestão de Turmas       │
├────────────────────────────────────────────────────────────────────────┤
│                  MÓDULO E2: ANALYTICAL RUBRIC & SOLVER                 │
│  Gabarito Determinístico · Curva de Pareto (Custo vs SF) · Solução Ot. │
├────────────────────────────────────────────────────────────────────────┤
│                   MÓDULO E1: TRACK & LEVEL AUTHORING                   │
│  Editor Visual de Desafios · Restrição de Inventário · Enunciados      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Especificação Detalhada das Fases de Implementação

### 🎓 Fase E1 — Track & Level Authoring Studio (Editor de Desafios)
**Objetivo:** Permitir que o professor desenhe desafios customizados ou altere parâmetros de desafios existentes sem tocar em código.

**Recursos Técnicos:**
1. **Configuração de Condições de Contorno:**
   - Adicionar ou fixar nós de ancoragem (apoios de pino fixo ou rolete móvel).
   - Posicionamento de tabuleiros obrigatórios, vãos livres ($L \in [4\text{m}, 60\text{m}]$) e pilares proibidos de construção.
   - Seleção da carga móvel: massa do trem/veículo ($M \in [100\text{kg}, 50.000\text{kg}]$) e velocidade de travessia.
2. **Restritor Estrito de Inventário (Scaffolding Pedagógico):**
   - Habilitar/desabilitar materiais permitidos (ex: forçar o uso de cabos para ensinar tração, proibir aço para forçar o uso de madeira tratada).
   - Bloqueio de componentes específicos em Circuitos (ex: disponibilizar apenas resistores de $10\Omega$ e $47\Omega$ para forçar associações mistas).
   - Teto de orçamento rígido (`budgetLimit`) ou cota máxima de peças (`maxPartsLimit`).
3. **Editor de Metadados Didáticos:**
   - Título da lição, enunciado explicativo, dica pedagógica contextual (habilitável após $N$ tentativas falhas).
   - Habilidades BNCC/NGSS associadas e tags de conceito (ex: `#lei-de-hooke`, `#divisor-de-tensao`).

**Esquema de Dados TypeScript:**
```typescript
export interface EducatorLevelDef {
  id: string;
  schemaVersion: 'forge-educator/1.0';
  author: {
    teacherName: string;
    institution?: string;
    createdAt: string;
  };
  metadata: {
    title: string;
    description: string;
    learningObjectives: string[];
    curriculumCodes: string[]; // ex: ["EM13CNT102", "HS-ETS1-2"]
    difficultyGrade: 'middle-school' | 'high-school' | 'undergraduate';
    pedagogicalHint?: string;
    revealHintAfterAttempts?: number;
  };
  discipline: 'structures' | 'circuits' | 'machines' | 'mechatronics';
  canvasBounds: { width: number; height: number };
  fixedGeometry: {
    anchors: Array<{ x: number; y: number; kind: 'fixed' | 'roller' }>;
    deck?: { leftX: number; rightX: number; y: number };
    powerSource?: { positiveNode: [number, number]; voltage: number };
  };
  constraints: {
    budget: number;
    maxMembers?: number;
    allowedMaterials: string[]; // ['wood', 'steel', 'cable', 'strut']
    safetyFactorMinimum: number; // ex: 1.5
  };
}
```

---

### 📐 Fase E2 — Analytical Rubric & Gabarito Automático
**Objetivo:** Gerar automaticamente o gabarito analítico e a fronteira de eficiência para a atividade criada pelo professor.

**Recursos Técnicos:**
1. **Otimizador Algorítmico de Gabarito:**
   - Solver heurístico baseado em treliças padrão (Pratt, Howe, Warren, K-Truss) ou circuitos simplificados que calcula a solução teoricamente ótima para as restrições fornecidas.
   - Cálculo da **Fronteira de Pareto**:
     $$\min \text{Custo}(x) \quad \text{sujeito a} \quad \sigma_i \le \sigma_{\text{adm}}, \quad \forall i \in \text{Membros}$$
2. **Relatório de Gabarito para o Professor:**
   - Visualização da solução ótima com indicação de tração/compressão e margem de segurança.
   - Estimativa do nível de dificuldade computacional (índice de sensibilidade estática).
   - Exportação de gabarito para impressão/PDF para o professor com memorial de cálculo.

---

### 📦 Fase E3 — Classroom Management & Assignment Packaging
**Objetivo:** Distribuição de atividades para os alunos de forma instantânea e sem atrito, funcionando tanto 100% offline via URL/arquivo quanto integrado à nuvem.

**Recursos Técnicos:**
1. **Compressão & Deep Linking (Zero-Backend First):**
   - Serialização de trilhas completas em strings compactas codificadas via LZ-String / Base64 seguro para URL (`https://forge.guildeng.com/classroom#track=...`).
   - O aluno abre o link no navegador e o pacote didático é carregado instantaneamente sem necessidade de login prévio.
2. **Exportação de Arquivo `.forge-class`:**
   - Arquivo JSON assinado criptograficamente contendo metadados, níveis e gabaritos.
   - Suporte a importação em massa via arrastar-e-soltar (Drag-and-Drop) no navegador.
3. **Gerenciador de Turmas no Cliente (Local Classroom Store):**
   - Cadastro de turmas locais (ex: "Física 2º Ano A", "Mecânica dos Sólidos 2026.2").
   - Atribuição de trilhas de aprendizado sequenciais com desbloqueio controlado pelo professor.

---

### 📊 Fase E4 — Student Analytics, Heatmap de Dificuldade & Diagnostics
**Objetivo:** Permitir ao professor diagnosticar em quais conceitos físicos os alunos estão tropeçando antes da prova teórica.

**Recursos Técnicos:**
1. **Telemetria de Erros Recorrentes (Failure Fingerprinting):**
   - Agrupamento das causas de falha mais comuns na turma:
     - *82% Flambagem de barras sob compressão excessiva.*
     - *64% Curto-circuito por ausência de resistor limitador.*
     - *45% Estol gravitacional por motor subdimensionado na rampa.*
2. **Heatmap de Colapso Estrutural Acumulado:**
   - Sobreposição visual no canvas mostrando em vermelho quais nós e membros romperam com maior frequência entre todas as submissões dos estudantes.
3. **Métricas de Engajamento e Eficiência:**
   - Tempo médio de resolução por desafio.
   - Histograma de custo de projeto (alunos que resolveram com orçamento enxuto vs alunos que superdimensionaram).

---

### 📽️ Fase E5 — Live Classroom Projection Mode (Desafio ao Vivo)
**Objetivo:** Dinamizar a aula presencial ou remota com um painel interativo para o projetor da sala de aula.

**Recursos Técnicos:**
1. **Comparador Duplo Side-by-Side:**
   - O professor projeta a tela e seleciona a solução do Aluno A e do Aluno B.
   - Disparo sincronizado da simulação física em 60 FPS com os dois veículos atravessando simultaneamente.
   - Destaque visual das diferenças de deformação elástica e uso de materiais.
2. **Leaderboard Anônimo ("Engenheiro do Mês"):**
   - Ranking por eficiência de massa e custo utilizando apelidos de engenheiros históricos (ex: *Ada Lovelace, Nikola Tesla, Gustave Eiffel, Santos Dumont*).
   - Estimula competição sadia sem expor alunos com dificuldades.
