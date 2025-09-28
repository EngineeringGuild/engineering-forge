# 🤖 Comandos Cursor - Engineering Forge

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: 🚀 **ATIVO**

---

## 🎯 **Visão Geral**

Este documento define todos os **comandos específicos** que o Cursor deve usar
ao trabalhar no projeto Engineering Forge. Cada comando tem uma função
específica e deve ser usado seguindo a metodologia estabelecida.

### **Objetivo**

Padronizar e automatizar o trabalho do Cursor no projeto, garantindo
consistência e qualidade.

### **Uso**

Sempre referenciar este documento no início de cada chat e usar os comandos
apropriados para cada situação.

---

## 📋 **Comandos de Inicialização**

### **@ai init-task [TASK-ID]**

**Descrição**: Inicializa uma nova tarefa seguindo a metodologia **Uso**:
`@ai init-task TASK-001` **Ação**:

- Lê a metodologia Cursor
- Consulta o dashboard de progresso
- Verifica o domínio relevante
- Cria estrutura inicial da tarefa

### **@ai read-methodology**

**Descrição**: Lê a metodologia Cursor obrigatória **Uso**:
`@ai read-methodology` **Ação**: Lê e aplica todas as regras da metodologia

### **@ai check-status**

**Descrição**: Verifica o status atual do projeto **Uso**: `@ai check-status`
**Ação**:

- Lê o PROGRESS-DASHBOARD.md
- Verifica progresso geral
- Identifica tarefas ativas
- Lista bloqueios

---

## 🏢 **Comandos de Domínio**

### **@ai read-domain [DOMAIN]**

**Descrição**: Lê a documentação de um domínio específico **Uso**:
`@ai read-domain education` **Domínios**: education, gaming, blockchain,
user-management, marketplace, analytics, development **Ação**: Lê e aplica as
especificações do domínio

### **@ai update-domain [DOMAIN] [FIELD] [VALUE]**

**Descrição**: Atualiza um campo específico de um domínio **Uso**:
`@ai update-domain education progress 25` **Ação**: Atualiza o campo e
sincroniza com o dashboard

### **@ai list-domain-tasks [DOMAIN]**

**Descrição**: Lista todas as tarefas de um domínio **Uso**:
`@ai list-domain-tasks education` **Ação**: Lista tarefas ativas, concluídas e
planejadas

---

## 🚀 **Comandos de Versão**

### **@ai read-version [VERSION]**

**Descrição**: Lê a documentação de uma versão específica **Uso**:
`@ai read-version v1.0-prototype` **Versões**: v1.0-prototype, v2.0-mvp-web,
v3.0-3d-web, v4.0-vr **Ação**: Lê e aplica as especificações da versão

### **@ai update-version [VERSION] [FIELD] [VALUE]**

**Descrição**: Atualiza um campo específico de uma versão **Uso**:
`@ai update-version v1.0-prototype progress 20` **Ação**: Atualiza o campo e
sincroniza com o dashboard

### **@ai list-version-features [VERSION]**

**Descrição**: Lista todas as features de uma versão **Uso**:
`@ai list-version-features v1.0-prototype` **Ação**: Lista features
implementadas, em desenvolvimento e planejadas

---

## 🛠️ **Comandos de Implementação**

### **@ai implement [DOMAIN] [FEATURE]**

**Descrição**: Implementa uma feature específica de um domínio **Uso**:
`@ai implement education lesson-system` **Ação**:

- Cria/atualiza código
- Cria testes
- Atualiza documentação
- Sincroniza com dashboard

### **@ai create-component [DOMAIN] [COMPONENT]**

**Descrição**: Cria um novo componente React **Uso**:
`@ai create-component education LessonCard` **Ação**:

- Cria componente TypeScript
- Cria testes unitários
- Cria tipos TypeScript
- Atualiza documentação

### **@ai create-service [DOMAIN] [SERVICE]**

**Descrição**: Cria um novo serviço de domínio **Uso**:
`@ai create-service education CurriculumService` **Ação**:

- Cria serviço TypeScript
- Cria testes unitários
- Cria tipos TypeScript
- Atualiza documentação

### **@ai create-api [DOMAIN] [ENDPOINT]**

**Descrição**: Cria um novo endpoint de API **Uso**:
`@ai create-api education /courses` **Ação**:

- Cria controller
- Cria service
- Cria testes
- Atualiza documentação

---

## 🧪 **Comandos de Testes**

### **@ai create-tests [COMPONENT]**

**Descrição**: Cria testes para um componente específico **Uso**:
`@ai create-tests LessonCard` **Ação**:

- Cria testes unitários
- Cria testes de integração
- Cria testes E2E se necessário
- Atualiza documentação

### **@ai run-tests [SCOPE]**

**Descrição**: Executa testes em um escopo específico **Uso**:
`@ai run-tests education` **Escopos**: all, domain, component, service, api
**Ação**: Executa testes e reporta resultados

### **@ai test-coverage [SCOPE]**

**Descrição**: Verifica cobertura de testes **Uso**:
`@ai test-coverage education` **Ação**:

- Executa testes
- Calcula cobertura
- Reporta métricas
- Sugere melhorias

---

## 📚 **Comandos de Documentação**

### **@ai update-docs [SECTION]**

**Descrição**: Atualiza uma seção específica da documentação **Uso**:
`@ai update-docs education` **Seções**: domain, version, technical, business,
guides **Ação**:

- Atualiza documentação
- Verifica consistência
- Sincroniza com dashboard
- Valida links

### **@ai create-doc [TYPE] [NAME]**

**Descrição**: Cria um novo documento **Uso**: `@ai create-doc domain education`
**Tipos**: domain, version, technical, business, guide, template **Ação**:

- Cria documento usando template
- Preenche informações básicas
- Sincroniza com estrutura
- Atualiza índices

### **@ai validate-docs [SECTION]**

**Descrição**: Valida uma seção da documentação **Uso**:
`@ai validate-docs education` **Ação**:

- Verifica consistência
- Valida links
- Verifica formatação
- Reporta problemas

---

## 📊 **Comandos de Dashboard**

### **@ai update-dashboard [TASK-ID] [STATUS]**

**Descrição**: Atualiza o status de uma tarefa no dashboard **Uso**:
`@ai update-dashboard TASK-001 completed` **Status**: created, planned,
in-progress, testing, completed, blocked, cancelled **Ação**:

- Atualiza status da tarefa
- Recalcula métricas
- Atualiza progresso
- Sincroniza com domínios

### **@ai update-progress [DOMAIN] [PERCENTAGE]**

**Descrição**: Atualiza o progresso de um domínio **Uso**:
`@ai update-progress education 25` **Ação**:

- Atualiza progresso do domínio
- Recalcula progresso geral
- Atualiza métricas
- Sincroniza com versões

### **@ai update-metrics [METRIC] [VALUE]**

**Descrição**: Atualiza uma métrica específica **Uso**:
`@ai update-metrics velocity 5` **Métricas**: velocity, coverage, bugs,
performance **Ação**:

- Atualiza métrica
- Recalcula tendências
- Atualiza dashboard
- Sincroniza com relatórios

---

## 🔄 **Comandos de Sincronização**

### **@ai sync-all**

**Descrição**: Sincroniza toda a documentação **Uso**: `@ai sync-all` **Ação**:

- Atualiza dashboard
- Sincroniza domínios
- Sincroniza versões
- Verifica consistência

### **@ai sync-domain [DOMAIN]**

**Descrição**: Sincroniza um domínio específico **Uso**:
`@ai sync-domain education` **Ação**:

- Atualiza documentação do domínio
- Sincroniza com dashboard
- Verifica consistência
- Atualiza métricas

### **@ai sync-version [VERSION]**

**Descrição**: Sincroniza uma versão específica **Uso**:
`@ai sync-version v1.0-prototype` **Ação**:

- Atualiza documentação da versão
- Sincroniza com dashboard
- Verifica consistência
- Atualiza métricas

### **@ai check-consistency [SCOPE]**

**Descrição**: Verifica consistência em um escopo específico **Uso**:
`@ai check-consistency education` **Escopos**: all, domain, version, technical,
business **Ação**:

- Verifica consistência
- Identifica problemas
- Sugere correções
- Reporta status

---

## 📋 **Comandos de Tarefas**

### **@ai create-task [DOMAIN] [TITLE] [DESCRIPTION]**

**Descrição**: Cria uma nova tarefa **Uso**:
`@ai create-task education "Sistema de Lições" "Implementar sistema completo de lições interativas"`
**Ação**:

- Cria tarefa usando template
- Atribui ID único
- Define domínio e versão
- Atualiza dashboard

### **@ai update-task [TASK-ID] [FIELD] [VALUE]**

**Descrição**: Atualiza um campo específico de uma tarefa **Uso**:
`@ai update-task TASK-001 status in-progress` **Campos**: status, priority,
assignee, description, progress **Ação**:

- Atualiza campo da tarefa
- Sincroniza com dashboard
- Verifica consistência
- Atualiza métricas

### **@ai complete-task [TASK-ID] [NOTES]**

**Descrição**: Marca uma tarefa como concluída **Uso**:
`@ai complete-task TASK-001 "Implementação concluída com sucesso"` **Ação**:

- Marca tarefa como concluída
- Adiciona notas
- Atualiza progresso
- Sincroniza com dashboard

### **@ai list-tasks [FILTER]**

**Descrição**: Lista tarefas com filtro específico **Uso**:
`@ai list-tasks education` **Filtros**: domain, version, status, priority,
assignee **Ação**:

- Lista tarefas filtradas
- Mostra status
- Calcula métricas
- Sugere próximas ações

### **@ai sync-all-versions**

**Descrição**: Sincroniza todas as versões com o master **Uso**:
`@ai sync-all-versions` **Ação**:

- Sincroniza V1.0, V2.0, V3.0, V4.0
- Atualiza dependências
- Verifica consistência
- Atualiza métricas

### **@ai sync-version [VERSION]**

**Descrição**: Sincroniza uma versão específica **Uso**: `@ai sync-version V1.0`
**Ação**:

- Sincroniza versão específica
- Atualiza dependências
- Verifica consistência
- Atualiza métricas

### **@ai validate-dependencies**

**Descrição**: Valida dependências entre tarefas **Uso**:
`@ai validate-dependencies` **Ação**:

- Verifica dependências
- Identifica conflitos
- Sugere resoluções
- Atualiza documentação

### **@ai sync-educational-version [VERSION]**

**Descrição**: Sincroniza versão educacional específica **Uso**:
`@ai sync-educational-version V1.0` **Ação**:

- Sincroniza versão educacional específica
- Atualiza dependências educacionais
- Verifica consistência educacional
- Atualiza métricas educacionais

### **@ai sync-educational-gaming [VERSION]**

**Descrição**: Sincroniza sistema educacional com jogos **Uso**:
`@ai sync-educational-gaming V1.0` **Ação**:

- Sincroniza integração educacional-jogos
- Atualiza dependências cruzadas
- Verifica consistência de integração
- Atualiza métricas de integração

### **@ai validate-educational-dependencies**

**Descrição**: Valida dependências educacionais **Uso**:
`@ai validate-educational-dependencies` **Ação**:

- Verifica dependências educacionais
- Identifica conflitos educacionais
- Sugere resoluções educacionais
- Atualiza documentação educacional

### **@ai update-educational-metrics**

**Descrição**: Atualiza métricas educacionais **Uso**:
`@ai update-educational-metrics` **Ação**:

- Atualiza métricas educacionais
- Recalcula tendências educacionais
- Atualiza dashboard educacional
- Sincroniza com sistema master

---

## 🚀 **Comandos de Sprint**

### **@ai create-sprint [NAME] [START-DATE] [END-DATE]**

**Descrição**: Cria um novo sprint **Uso**:
`@ai create-sprint "Sprint 1 - Fundação" "2025-01-15" "2025-01-29"` **Ação**:

- Cria sprint usando template
- Define datas
- Calcula story points
- Atualiza dashboard

### **@ai plan-sprint [SPRINT-ID] [TASK-IDS]**

**Descrição**: Planeja um sprint com tarefas específicas **Uso**:
`@ai plan-sprint SPRINT-001 "TASK-001,TASK-002,TASK-003"` **Ação**:

- Adiciona tarefas ao sprint
- Calcula story points
- Verifica dependências
- Atualiza dashboard

### **@ai update-sprint [SPRINT-ID] [FIELD] [VALUE]**

**Descrição**: Atualiza um campo específico de um sprint **Uso**:
`@ai update-sprint SPRINT-001 progress 60` **Campos**: progress, velocity,
burndown, status **Ação**:

- Atualiza campo do sprint
- Recalcula métricas
- Atualiza dashboard
- Sincroniza com tarefas

### **@ai complete-sprint [SPRINT-ID] [NOTES]**

**Descrição**: Marca um sprint como concluído **Uso**:
`@ai complete-sprint SPRINT-001 "Sprint concluído com sucesso"` **Ação**:

- Marca sprint como concluído
- Calcula métricas finais
- Atualiza dashboard
- Prepara próximo sprint

---

## 🔍 **Comandos de Análise**

### **@ai analyze-code [FILE]**

**Descrição**: Analisa um arquivo de código **Uso**:
`@ai analyze-code src/components/Education/LessonCard.tsx` **Ação**:

- Analisa código
- Identifica problemas
- Sugere melhorias
- Verifica padrões

### **@ai analyze-docs [SECTION]**

**Descrição**: Analisa uma seção da documentação **Uso**:
`@ai analyze-docs education` **Ação**:

- Analisa documentação
- Identifica inconsistências
- Sugere melhorias
- Verifica completude

### **@ai analyze-performance [SCOPE]**

**Descrição**: Analisa performance de um escopo específico **Uso**:
`@ai analyze-performance education` **Ação**:

- Analisa performance
- Identifica gargalos
- Sugere otimizações
- Reporta métricas

---

## 🚨 **Comandos de Emergência**

### **@ai fix-critical [ISSUE]**

**Descrição**: Corrige um problema crítico **Uso**:
`@ai fix-critical "Build failing"` **Ação**:

- Identifica problema
- Implementa correção
- Testa solução
- Atualiza documentação

### **@ai rollback [VERSION]**

**Descrição**: Faz rollback para uma versão anterior **Uso**:
`@ai rollback v1.0.1` **Ação**:

- Identifica versão
- Executa rollback
- Verifica integridade
- Atualiza documentação

### **@ai emergency-sync**

**Descrição**: Sincronização de emergência **Uso**: `@ai emergency-sync`
**Ação**:

- Força sincronização completa
- Corrige inconsistências
- Atualiza todos os documentos
- Verifica integridade

---

## 📞 **Comandos de Ajuda**

### **@ai help [COMMAND]**

**Descrição**: Mostra ajuda para um comando específico **Uso**:
`@ai help implement` **Ação**: Mostra documentação detalhada do comando

### **@ai help methodology**

**Descrição**: Mostra ajuda sobre a metodologia **Uso**: `@ai help methodology`
**Ação**: Mostra resumo da metodologia Cursor

### **@ai help commands**

**Descrição**: Lista todos os comandos disponíveis **Uso**: `@ai help commands`
**Ação**: Lista todos os comandos com descrições

---

## 🎯 **Exemplos de Uso**

### **Exemplo 1: Inicializar Nova Tarefa**

```bash
@ai init-task TASK-001
@ai read-domain education
@ai read-version v1.0-prototype
@ai create-task education "Sistema de Lições" "Implementar sistema completo de lições interativas"
```

### **Exemplo 2: Implementar Feature**

```bash
@ai implement education lesson-system
@ai create-component education LessonCard
@ai create-tests LessonCard
@ai update-docs education
@ai update-dashboard TASK-001 completed
```

### **Exemplo 3: Sincronizar Projeto**

```bash
@ai sync-all
@ai check-consistency all
@ai update-metrics velocity 5
@ai update-progress education 25
```

---

## 🔄 **Atualizações dos Comandos**

### **Versão 1.0 (Janeiro 2025)**

- Criação dos comandos iniciais
- Definição de categorias
- Estabelecimento de padrões
- Criação de exemplos

### **Próximas Versões**

- Novos comandos baseados em necessidades
- Melhorias nos comandos existentes
- Integração com novas ferramentas
- Otimizações de performance

---

_Este documento é atualizado regularmente. Última atualização: Janeiro 2025_

**Status**: 🟢 **ATIVO** | **Versão**: 1.0 | **Próxima Revisão**: Fevereiro 2025
