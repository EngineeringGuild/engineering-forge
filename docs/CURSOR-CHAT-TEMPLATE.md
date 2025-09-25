# 🤖 Template de Chat Cursor - Engineering Forge

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: 🚀 **ATIVO**

---

## 🎯 **Instruções de Uso**

Este template DEVE ser usado no início de **TODOS** os chats do Cursor para o projeto Engineering Forge. Ele garante que o Cursor siga a metodologia estabelecida e mantenha a sincronização do projeto.

### **Como Usar**
1. **Copie** este template
2. **Cole** no início de cada novo chat
3. **Preencha** as informações específicas da tarefa
4. **Execute** os comandos obrigatórios
5. **Siga** o fluxo de trabalho definido

---

## 📋 **Template de Inicialização**

```markdown
# [TASK-XXX] Título da Tarefa

## 📋 Informações da Tarefa
- **ID**: TASK-XXX
- **Domínio**: [education | gaming | blockchain | user-management | marketplace | analytics | development]
- **Versão**: [V1.0 | V2.0 | V3.0 | V4.0]
- **Prioridade**: [High | Medium | Low]
- **Responsável**: Cursor AI
- **Data de Início**: [DD/MM/YYYY]
- **Prazo**: [DD/MM/YYYY]

## 🎯 Objetivo
[Descrição clara e específica do objetivo da tarefa]

## 📚 Referências Obrigatórias
- **Metodologia**: [CURSOR-METHODOLOGY.md](CURSOR-METHODOLOGY.md)
- **Comandos**: [CURSOR-COMMANDS.md](CURSOR-COMMANDS.md)
- **Dashboard**: [PROGRESS-DASHBOARD.md](PROGRESS-DASHBOARD.md)
- **Domínio**: [DOMAINS/[domain]/README.md](DOMAINS/[domain]/README.md)
- **Versão**: [VERSIONS/[version]/README.md](VERSIONS/[version]/README.md)

## ✅ Checklist de Inicialização
- [ ] Li a metodologia Cursor
- [ ] Consultei o dashboard de progresso
- [ ] Verifiquei o domínio relevante
- [ ] Confirmei a versão do produto
- [ ] Entendi o objetivo da tarefa
- [ ] Executei comandos obrigatórios

## 🔍 Análise da Tarefa

### **Contexto Atual**
- **Status do Projeto**: [Status atual]
- **Progresso Geral**: [X]%
- **Dependências**: [Lista de dependências]
- **Bloqueios**: [Lista de bloqueios]

### **Especificações Técnicas**
- **Arquivos Afetados**: [Lista de arquivos]
- **Mudanças Necessárias**: [Lista de mudanças]
- **Testes Requeridos**: [Lista de testes]
- **Documentação a Atualizar**: [Lista de documentos]

### **Plano de Implementação**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]
4. [Passo 4]

## 🛠️ Implementação

### **Código Implementado**
[Implementar o código seguindo os padrões estabelecidos]

### **Testes Criados**
[Criar testes unitários e de integração]

### **Documentação Atualizada**
[Atualizar documentação relevante]

## ✅ Finalização

### **Tarefa Concluída**
- [ ] Código implementado
- [ ] Testes criados e passando
- [ ] Documentação atualizada
- [ ] Dashboard atualizado
- [ ] Consistência verificada

### **Próximos Passos**
- [Próximo passo 1]
- [Próximo passo 2]
- [Próximo passo 3]

### **Sincronização**
- [ ] PROGRESS-DASHBOARD.md atualizado
- [ ] Documentação do domínio atualizada
- [ ] Versão do produto atualizada
- [ ] Templates atualizados se necessário
```

---

## 🚀 **Comandos Obrigatórios de Inicialização**

### **Sempre Executar no Início**
```bash
@ai read-methodology
@ai check-status
@ai read-domain [domain]
@ai read-version [version]
```

### **Exemplo de Execução**
```bash
@ai read-methodology
@ai check-status
@ai read-domain education
@ai read-version v1.0-prototype
```

---

## 📊 **Comandos de Implementação**

### **Para Implementar Código**
```bash
@ai implement [domain] [feature]
@ai create-component [domain] [component]
@ai create-service [domain] [service]
@ai create-tests [component]
```

### **Para Atualizar Documentação**
```bash
@ai update-docs [section]
@ai update-dashboard [task-id] [status]
@ai sync-domain [domain]
@ai check-consistency [scope]
```

---

## 🔄 **Comandos de Finalização**

### **Para Finalizar Tarefa**
```bash
@ai complete-task [task-id] [notes]
@ai sync-all
@ai check-consistency all
@ai update-metrics [metric] [value]
```

---

## 📝 **Exemplos de Uso**

### **Exemplo 1: Tarefa de Educação**
```markdown
# [TASK-EDU-001] Sistema de Lições Interativas

## 📋 Informações da Tarefa
- **ID**: TASK-EDU-001
- **Domínio**: education
- **Versão**: V1.0
- **Prioridade**: High
- **Responsável**: Cursor AI
- **Data de Início**: 20/01/2025
- **Prazo**: 25/01/2025

## 🎯 Objetivo
Implementar sistema completo de lições interativas para o domínio educacional da V1.0

## 📚 Referências Obrigatórias
- **Metodologia**: [CURSOR-METHODOLOGY.md](CURSOR-METHODOLOGY.md)
- **Comandos**: [CURSOR-COMMANDS.md](CURSOR-COMMANDS.md)
- **Dashboard**: [PROGRESS-DASHBOARD.md](PROGRESS-DASHBOARD.md)
- **Domínio**: [DOMAINS/education/README.md](DOMAINS/education/README.md)
- **Versão**: [VERSIONS/v1.0-prototype/README.md](VERSIONS/v1.0-prototype/README.md)

## ✅ Checklist de Inicialização
- [x] Li a metodologia Cursor
- [x] Consultei o dashboard de progresso
- [x] Verifiquei o domínio relevante
- [x] Confirmei a versão do produto
- [x] Entendi o objetivo da tarefa
- [x] Executei comandos obrigatórios

## 🔍 Análise da Tarefa

### **Contexto Atual**
- **Status do Projeto**: V1.0 em desenvolvimento
- **Progresso Geral**: 15%
- **Dependências**: Sistema de autenticação, banco de dados
- **Bloqueios**: Nenhum

### **Especificações Técnicas**
- **Arquivos Afetados**: 
  - src/components/Education/LessonCard.tsx
  - src/services/educationService.ts
  - src/types/education.types.ts
- **Mudanças Necessárias**: 
  - Criar componente LessonCard
  - Implementar serviço de lições
  - Criar tipos TypeScript
- **Testes Requeridos**: 
  - Testes unitários do componente
  - Testes de integração do serviço
- **Documentação a Atualizar**: 
  - DOMAINS/education/README.md
  - PROGRESS-DASHBOARD.md

### **Plano de Implementação**
1. Criar tipos TypeScript para lições
2. Implementar serviço de lições
3. Criar componente LessonCard
4. Criar testes unitários
5. Atualizar documentação

## 🛠️ Implementação
[Implementação detalhada...]

## ✅ Finalização
[Finalização e sincronização...]
```

### **Exemplo 2: Tarefa de Jogos**
```markdown
# [TASK-GAME-001] Interface de Construção 2D

## 📋 Informações da Tarefa
- **ID**: TASK-GAME-001
- **Domínio**: gaming
- **Versão**: V1.0
- **Prioridade**: High
- **Responsável**: Cursor AI
- **Data de Início**: 22/01/2025
- **Prazo**: 28/01/2025

## 🎯 Objetivo
Implementar interface de construção 2D para o domínio de jogos da V1.0

## 📚 Referências Obrigatórias
- **Metodologia**: [CURSOR-METHODOLOGY.md](CURSOR-METHODOLOGY.md)
- **Comandos**: [CURSOR-COMMANDS.md](CURSOR-COMMANDS.md)
- **Dashboard**: [PROGRESS-DASHBOARD.md](PROGRESS-DASHBOARD.md)
- **Domínio**: [DOMAINS/gaming/README.md](DOMAINS/gaming/README.md)
- **Versão**: [VERSIONS/v1.0-prototype/README.md](VERSIONS/v1.0-prototype/README.md)

## ✅ Checklist de Inicialização
- [x] Li a metodologia Cursor
- [x] Consultei o dashboard de progresso
- [x] Verifiquei o domínio relevante
- [x] Confirmei a versão do produto
- [x] Entendi o objetivo da tarefa
- [x] Executei comandos obrigatórios

## 🔍 Análise da Tarefa
[Análise detalhada...]

## 🛠️ Implementação
[Implementação detalhada...]

## ✅ Finalização
[Finalização e sincronização...]
```

---

## 🚨 **Regras Obrigatórias**

### **🔴 REGRA 1: Sempre Usar Este Template**
- **NUNCA** iniciar um chat sem este template
- **SEMPRE** preencher todas as seções obrigatórias
- **SEMPRE** executar os comandos obrigatórios

### **🔴 REGRA 2: Seguir a Metodologia**
- **SEMPRE** ler a metodologia Cursor
- **SEMPRE** consultar o dashboard de progresso
- **SEMPRE** verificar o domínio relevante
- **SEMPRE** confirmar a versão do produto

### **🔴 REGRA 3: Manter Sincronização**
- **SEMPRE** atualizar o dashboard após cada ação
- **SEMPRE** sincronizar com o domínio relevante
- **SEMPRE** verificar consistência
- **SEMPRE** atualizar documentação

### **🔴 REGRA 4: Usar Comandos Padronizados**
- **SEMPRE** usar os comandos definidos
- **SEMPRE** seguir os padrões estabelecidos
- **SEMPRE** manter consistência
- **SEMPRE** documentar mudanças

---

## 📞 **Suporte e Recursos**

### **Documentação de Referência**
- **Metodologia**: [CURSOR-METHODOLOGY.md](CURSOR-METHODOLOGY.md)
- **Comandos**: [CURSOR-COMMANDS.md](CURSOR-COMMANDS.md)
- **Dashboard**: [PROGRESS-DASHBOARD.md](PROGRESS-DASHBOARD.md)
- **Domínios**: [DOMAINS/README.md](DOMAINS/README.md)
- **Versões**: [VERSIONS/README.md](VERSIONS/README.md)

### **Comandos de Ajuda**
```bash
@ai help methodology
@ai help commands
@ai help [command]
```

---

## 🔄 **Atualizações do Template**

### **Versão 1.0 (Janeiro 2025)**
- Criação do template inicial
- Definição de estrutura obrigatória
- Estabelecimento de comandos
- Criação de exemplos

### **Próximas Versões**
- Melhorias baseadas em feedback
- Novos comandos e seções
- Otimizações de fluxo
- Integração com novas ferramentas

---

*Este template é atualizado regularmente. Última atualização: Janeiro 2025*

**Status**: 🟢 **ATIVO** | **Versão**: 1.0 | **Próxima Revisão**: Fevereiro 2025
