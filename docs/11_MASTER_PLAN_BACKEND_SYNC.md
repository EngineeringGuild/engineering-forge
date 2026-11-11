---
idea: IDEA-010
doc: 11_MASTER_PLAN_BACKEND_SYNC
version: 1.0.0
standard: GUILD-DOC-STANDARD@0.2.0
status: approved
updated: 2026-11-11
linear: https://linear.app/engineering-guild/project/idea-010-engineering-forge-jogo-educacional-4f3eb9ffca14
---

# Master Plan: Backend, Sincronização em Nuvem & Serviços de Turma
### Distributed Architecture, Local-First Sync, Cloud Classrooms & Telemetry Engine
**Arquitetura Robusta para Operação Híbrida (Offline-First $\to$ Cloud Edge)**

---

## 1. Princípio Fundamental: "Offline-First, Cloud-Enhanced"

O *Engineering Forge* nasceu como um motor puramente client-side sem dependência de servidor externo. Para preservar a confiabilidade em salas de aula com conexão instável de internet, o backend adota a arquitetura **Local-First**:
1. **O jogo funciona 100% sem internet:** Toda a simulação física, validação de níveis, salvamento local de progresso (`localStorage` + `IndexedDB`) e geração de links de atividade funcionam no navegador.
2. **A nuvem adiciona superpoderes:**
   - Sincronização de progresso entre dispositivos.
   - Painel do professor com agregação em tempo real dos resultados da turma.
   - Leaderboard global com verificação criptográfica anti-cheat.
   - Persistência e compartilhamento de blueprints comunitários.

---

## 2. Topologia do Sistema de Backend

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENTES FORGE (REACT SPA)                      │
│   Aluno (Navegador/Chromebook)  │  Professor (Projetor/Dashboard)      │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                API GATEWAY & EDGE WORKERS (CLOUDFLARE)                 │
│  - Roteamento HTTP REST / WebSockets                                   │
│  - Validação de Esquema Zod                                            │
│  - Autenticação JWT (Professores e Alunos com SSO Google/Edu)          │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
        ┌───────────┴───────────┐        ┌───────────┴───────────┐
        ▼                       ▼        ▼                       ▼
┌───────────────┐       ┌───────────────┐┌───────────────┐┌──────────────┐
│  RELACIONAL   │       │  OBJECT STORE ││  TIME-SERIES  ││ WEBSOCKETS   │
│  Postgres /   │       │  R2 / S3      ││  ClickHouse / ││ Durable      │
│  Cloud SQL /  │       │  Blueprints,  ││  Telemetry    ││ Objects      │
│  D1 (Turmas,  │       │  Modelos STL, ││  Erros de     ││ Salas ao     │
│  Contas, XP)  │       │  Gabaritos    ││  Alunos, FEA  ││ Vivo         │
└───────────────┘       └───────────────┘└───────────────┘└──────────────┘
```

---

## 3. Especificação dos Módulos de Backend

### 🌐 Módulo B1 — Serviços de Autenticação & Gestão de Turmas
- **Identidade Híbrida:**
  - Login anônimo com persistência via token de sessão local para estudantes menores de idade (conformidade com LGPD, COPPA e GDPR).
  - Login federado OAuth 2.0 (Google Classroom / Microsoft Education) para professores.
- **Entidades do Banco de Dados:**
  - `Organization` (Escola / Universidade).
  - `Classroom` (Turma, código de acesso de 6 caracteres alfanuméricos ex: `FORGE-9A`).
  - `Assignment` (Trilha de atividades atribuída com data limite e restrições).
  - `Submission` (Projeto entregue pelo aluno com hash do blueprint, custo, tempo de resolução e estrelas obtidas).

### ⚡ Módulo B2 — Motor de Telemetria e Ingestão de Métricas
- **Endpoint de Ingestão de Alta Vazão (`POST /api/telemetry/event`):**
  - Eventos de colapso estrutural, queima de componente, conclusão de nível e tempo de tentativa.
  - Agregação assíncrona para gerar o mapa de calor de dificuldades e falhas frequentes em cada desafio.

### 🛡️ Módulo B3 — Verificador Anti-Cheat & Assinatura de Soluções
- Para competições e rankings oficiais:
  - O cliente envia a definição geométrica do blueprint do aluno.
  - Um worker Node.js/Wasm executa o mesmo solver matricial no servidor (`physics/truss.ts`) e compara o resultado numérico.
  - Se o tempo e custo conferirem com margem de tolerância $< 10^{-5}$, a solução é assinada e homologada para o leaderboard.

---

## 4. Fases de Execução do Backend

| Fase | Título | Entregáveis Técnicos |
|---|---|---|
| **B1** | Schema & Storage Local-First | Unificação de dados em IndexedDB local com sincronizador offline e resolução de conflitos CRDT/Last-Write-Wins. |
| **B2** | Edge Classroom API | API Serverless (Cloudflare Workers / Node) para criação de turmas, submissão de tarefas e autenticação. |
| **B3** | Telemetria do Educador | Pipeline de agregação de falhas com visualização em tempo real no dashboard do professor. |
| **B4** | Leaderboard & Verificador | Validador de soluções determinístico no servidor e ranking público global com oráculo de homologação. |
