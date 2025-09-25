# 🤖 Sistema Cursor - Engineering Forge

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: 🚀 **ATIVO**

---

## 🎯 **Visão Geral**

Este documento é o **PONTO DE ENTRADA PRINCIPAL** para o sistema Cursor do projeto Engineering Forge. Ele contém todas as regras, metodologia, comandos e templates necessários para o Cursor trabalhar de forma padronizada e sincronizada.

### **Objetivo**
Garantir que o Cursor trabalhe de forma **metodológica**, **sincronizada** e **padronizada** em todas as tarefas do projeto.

### **⚠️ ATENÇÃO**
**ESTE É O DOCUMENTO PRINCIPAL QUE O CURSOR DEVE LER PRIMEIRO**

---

## 📚 **Documentos do Sistema Cursor**

### **1. 🚨 [CURSOR-RULES.md](CURSOR-RULES.md) - REGRAS OBRIGATÓRIAS**
**Status**: 🚨 **OBRIGATÓRIO**
**Conteúdo**: Regras críticas, importantes e de qualidade que o Cursor DEVE seguir
**Uso**: Leitura obrigatória antes de qualquer ação

### **2. 🤖 [CURSOR-METHODOLOGY.md](CURSOR-METHODOLOGY.md) - METODOLOGIA**
**Status**: 🚀 **ATIVO**
**Conteúdo**: Metodologia completa de trabalho do Cursor
**Uso**: Guia de como trabalhar no projeto

### **3. 📋 [CURSOR-COMMANDS.md](CURSOR-COMMANDS.md) - COMANDOS**
**Status**: 🚀 **ATIVO**
**Conteúdo**: Todos os comandos específicos que o Cursor deve usar
**Uso**: Referência de comandos padronizados

### **4. 📝 [CURSOR-CHAT-TEMPLATE.md](CURSOR-CHAT-TEMPLATE.md) - TEMPLATE DE CHAT**
**Status**: 🚀 **ATIVO**
**Conteúdo**: Template obrigatório para inicialização de chats
**Uso**: Template para todos os chats do Cursor

## 🚨 **Arquivos .cursorrules (NATIVOS DO CURSOR)**

### **1. 🚨 [.cursorrules](../.cursorrules) - REGRAS GERAIS**
**Status**: 🚨 **OBRIGATÓRIO**
**Conteúdo**: Regras nativas do Cursor para todo o projeto
**Uso**: **AUTOMÁTICO** - Cursor lê automaticamente

### **2. 🚨 [docs/.cursorrules](.cursorrules) - REGRAS DE DOCUMENTAÇÃO**
**Status**: 🚨 **OBRIGATÓRIO**
**Conteúdo**: Regras específicas para documentação
**Uso**: **AUTOMÁTICO** - Cursor lê automaticamente

### **3. 🚨 [engineering-forge-v1/.cursorrules](../engineering-forge-v1/.cursorrules) - REGRAS V1.0**
**Status**: 🚨 **OBRIGATÓRIO**
**Conteúdo**: Regras específicas para desenvolvimento V1.0
**Uso**: **AUTOMÁTICO** - Cursor lê automaticamente

---

## 🚨 **FLUXO OBRIGATÓRIO**

### **Passo 1: Leitura Obrigatória**
```bash
# SEMPRE ler estes documentos na ordem:
1. .cursorrules (REGRAS NATIVAS - AUTOMÁTICO)
2. CURSOR-SYSTEM.md (SISTEMA PRINCIPAL)
3. CURSOR-RULES.md (REGRAS OBRIGATÓRIAS)
4. CURSOR-METHODOLOGY.md (METODOLOGIA)
5. CURSOR-COMMANDS.md (COMANDOS)
6. CURSOR-CHAT-TEMPLATE.md (TEMPLATE DE CHAT)
```

### **Passo 2: Inicialização de Chat**
```markdown
# Usar o template em CURSOR-CHAT-TEMPLATE.md
# Preencher todas as seções obrigatórias
# Executar comandos obrigatórios
```

### **Passo 3: Comandos Obrigatórios**
```bash
@ai read-methodology
@ai check-status
@ai read-domain [domain]
@ai read-version [version]
```

### **Passo 4: Implementação**
```bash
@ai implement [domain] [feature]
@ai create-tests [component]
@ai update-docs [section]
@ai update-dashboard [task-id] [status]
```

### **Passo 5: Finalização**
```bash
@ai complete-task [task-id] [notes]
@ai sync-all
@ai check-consistency all
```

---

## 📋 **CHECKLIST OBRIGATÓRIO**

### **Antes de Iniciar Qualquer Chat**
- [ ] Li `CURSOR-RULES.md` (REGRAS OBRIGATÓRIAS)
- [ ] Li `CURSOR-METHODOLOGY.md` (METODOLOGIA)
- [ ] Li `CURSOR-COMMANDS.md` (COMANDOS)
- [ ] Li `CURSOR-CHAT-TEMPLATE.md` (TEMPLATE DE CHAT)
- [ ] Entendi todas as regras obrigatórias

### **No Início de Cada Chat**
- [ ] Usei o template de chat obrigatório
- [ ] Executei `@ai read-methodology`
- [ ] Executei `@ai check-status`
- [ ] Executei `@ai read-domain [domain]`
- [ ] Executei `@ai read-version [version]`

### **Durante a Implementação**
- [ ] Usei apenas comandos padronizados
- [ ] Segui padrões de código definidos
- [ ] Criei testes para todo código
- [ ] Atualizei documentação relevante
- [ ] Mantive sincronização com dashboard

### **Ao Finalizar Tarefa**
- [ ] Executei `@ai complete-task [task-id] [notes]`
- [ ] Executei `@ai sync-all`
- [ ] Executei `@ai check-consistency all`
- [ ] Executei `@ai update-metrics [metric] [value]`
- [ ] Verifiquei que tudo está sincronizado

---

## 🎯 **EXEMPLO DE USO CORRETO**

### **1. Inicialização de Chat**
```markdown
# [TASK-001] Configurar MongoDB Atlas

## 📋 Informações da Tarefa
- **ID**: TASK-001
- **Domínio**: development
- **Versão**: V1.0
- **Prioridade**: High
- **Responsável**: Cursor AI

## 🎯 Objetivo
Configurar MongoDB Atlas com conexão e modelos básicos

## 📚 Referências Obrigatórias
- **Metodologia**: [CURSOR-METHODOLOGY.md](CURSOR-METHODOLOGY.md)
- **Comandos**: [CURSOR-COMMANDS.md](CURSOR-COMMANDS.md)
- **Dashboard**: [PROGRESS-DASHBOARD.md](PROGRESS-DASHBOARD.md)
- **Domínio**: [DOMAINS/development/README.md](DOMAINS/development/README.md)
- **Versão**: [VERSIONS/v1.0-prototype/README.md](VERSIONS/v1.0-prototype/README.md)

## ✅ Checklist de Inicialização
- [x] Li a metodologia Cursor
- [x] Consultei o dashboard de progresso
- [x] Verifiquei o domínio relevante
- [x] Confirmei a versão do produto
- [x] Entendi o objetivo da tarefa
- [x] Executei comandos obrigatórios
```

### **2. Comandos de Inicialização**
```bash
@ai read-methodology
@ai check-status
@ai read-domain development
@ai read-version v1.0-prototype
```

### **3. Implementação**
```bash
@ai implement development database-setup
@ai create-service development DatabaseService
@ai create-tests DatabaseService
@ai update-docs development
@ai update-dashboard TASK-001 in-progress
```

### **4. Finalização**
```bash
@ai complete-task TASK-001 "MongoDB Atlas configurado com sucesso"
@ai sync-all
@ai check-consistency all
@ai update-metrics velocity 5
```

---

## 🚨 **REGRAS CRÍTICAS (NÃO NEGOCIÁVEIS)**

### **🔴 REGRA 1: SEMPRE USAR TEMPLATE DE CHAT**
- **O QUE**: Usar o template em `CURSOR-CHAT-TEMPLATE.md`
- **QUANDO**: Sempre, sem exceção
- **PUNIÇÃO**: Chat será considerado inválido

### **🔴 REGRA 2: SEMPRE LER METODOLOGIA**
- **O QUE**: Ler `CURSOR-METHODOLOGY.md`
- **QUANDO**: No início de cada chat
- **PUNIÇÃO**: Ações serão consideradas inválidas

### **🔴 REGRA 3: SEMPRE CONSULTAR DASHBOARD**
- **O QUE**: Consultar `PROGRESS-DASHBOARD.md`
- **QUANDO**: No início de cada chat
- **PUNIÇÃO**: Trabalho será considerado desatualizado

### **🔴 REGRA 4: SEMPRE VERIFICAR DOMÍNIO**
- **O QUE**: Verificar o domínio relevante
- **QUANDO**: Antes de implementar qualquer feature
- **PUNIÇÃO**: Implementação será considerada inconsistente

### **🔴 REGRA 5: SEMPRE CONFIRMAR VERSÃO**
- **O QUE**: Confirmar a versão do produto
- **QUANDO**: Antes de implementar qualquer feature
- **PUNIÇÃO**: Implementação será considerada incorreta

---

## 🟡 **REGRAS IMPORTANTES (OBRIGATÓRIAS)**

### **🟡 REGRA 6: SEMPRE USAR COMANDOS PADRONIZADOS**
- **O QUE**: Usar apenas os comandos definidos
- **QUANDO**: Sempre
- **PUNIÇÃO**: Comandos serão considerados inválidos

### **🟡 REGRA 7: SEMPRE ATUALIZAR DASHBOARD**
- **O QUE**: Atualizar dashboard após cada ação
- **QUANDO**: Após cada mudança
- **PUNIÇÃO**: Progresso será considerado desatualizado

### **🟡 REGRA 8: SEMPRE SINCRONIZAR DOMÍNIO**
- **O QUE**: Sincronizar com o domínio relevante
- **QUANDO**: Após cada implementação
- **PUNIÇÃO**: Domínio será considerado inconsistente

### **🟡 REGRA 9: SEMPRE VERIFICAR CONSISTÊNCIA**
- **O QUE**: Verificar consistência entre domínios
- **QUANDO**: Após cada mudança
- **PUNIÇÃO**: Projeto será considerado inconsistente

### **🟡 REGRA 10: SEMPRE ATUALIZAR DOCUMENTAÇÃO**
- **O QUE**: Atualizar documentação relevante
- **QUANDO**: Após cada implementação
- **PUNIÇÃO**: Documentação será considerada desatualizada

---

## 🟢 **REGRAS DE QUALIDADE (OBRIGATÓRIAS)**

### **🟢 REGRA 11: SEMPRE CRIAR TESTES**
- **O QUE**: Criar testes para todo código
- **QUANDO**: Após cada implementação
- **PUNIÇÃO**: Código será considerado incompleto

### **🟢 REGRA 12: SEMPRE SEGUIR PADRÕES DE CÓDIGO**
- **O QUE**: Seguir padrões definidos
- **QUANDO**: Sempre
- **PUNIÇÃO**: Código será considerado de baixa qualidade

### **🟢 REGRA 13: SEMPRE USAR TEMPLATES**
- **O QUE**: Usar templates definidos
- **QUANDO**: Ao criar novos documentos
- **PUNIÇÃO**: Documentos serão considerados inconsistentes

### **🟢 REGRA 14: SEMPRE VALIDAR IMPLEMENTAÇÃO**
- **O QUE**: Validar implementação antes de finalizar
- **QUANDO**: Antes de marcar tarefa como concluída
- **PUNIÇÃO**: Implementação será considerada inválida

### **🟢 REGRA 15: SEMPRE DOCUMENTAR MUDANÇAS**
- **O QUE**: Documentar todas as mudanças
- **QUANDO**: Após cada implementação
- **PUNIÇÃO**: Mudanças serão consideradas não documentadas

---

## 📊 **COMANDOS PRINCIPAIS**

### **Comandos de Inicialização**
```bash
@ai read-methodology
@ai check-status
@ai read-domain [domain]
@ai read-version [version]
```

### **Comandos de Implementação**
```bash
@ai implement [domain] [feature]
@ai create-component [domain] [component]
@ai create-service [domain] [service]
@ai create-tests [component]
```

### **Comandos de Sincronização**
```bash
@ai update-dashboard [task-id] [status]
@ai sync-domain [domain]
@ai check-consistency [scope]
@ai update-docs [section]
```

### **Comandos de Finalização**
```bash
@ai complete-task [task-id] [notes]
@ai sync-all
@ai check-consistency all
@ai update-metrics [metric] [value]
```

---

## 🎯 **DOMÍNIOS DISPONÍVEIS**

- **education**: Sistema educacional
- **gaming**: Mecânicas de jogo
- **blockchain**: Integração Solana
- **user-management**: Gestão de usuários
- **marketplace**: Sistema de compra/venda
- **analytics**: Métricas e relatórios
- **development**: Desenvolvimento geral

---

## 🚀 **VERSÕES DISPONÍVEIS**

- **v1.0-prototype**: Protótipo 2D
- **v2.0-mvp-web**: MVP Web
- **v3.0-3d-web**: 3D Web
- **v4.0-vr**: VR Experience

---

## 📞 **Suporte e Recursos**

### **Documentação de Referência**
- **Sistema Cursor**: [CURSOR-SYSTEM.md](CURSOR-SYSTEM.md) (este documento)
- **Regras**: [CURSOR-RULES.md](CURSOR-RULES.md)
- **Metodologia**: [CURSOR-METHODOLOGY.md](CURSOR-METHODOLOGY.md)
- **Comandos**: [CURSOR-COMMANDS.md](CURSOR-COMMANDS.md)
- **Template de Chat**: [CURSOR-CHAT-TEMPLATE.md](CURSOR-CHAT-TEMPLATE.md)

### **Comandos de Ajuda**
```bash
@ai help methodology
@ai help commands
@ai help rules
@ai help [command]
```

---

## ⚠️ **LEMBRE-SE**

### **ESTAS REGRAS SÃO OBRIGATÓRIAS**
- **NÃO** é permitido ignorar
- **NÃO** é permitido fazer exceções
- **NÃO** é permitido trabalhar sem seguir
- **SIM** é obrigatório seguir todas

### **SEGUIR ESTAS REGRAS GARANTE**
- **Qualidade** do código
- **Consistência** do projeto
- **Sincronização** da documentação
- **Sucesso** do desenvolvimento

---

## 🔄 **Atualizações do Sistema**

### **Versão 1.0 (Janeiro 2025)**
- Criação do sistema inicial
- Definição de regras obrigatórias
- Estabelecimento de metodologia
- Criação de comandos e templates

### **Próximas Versões**
- Melhorias baseadas em feedback
- Novos comandos e regras
- Otimizações de fluxo
- Integração com novas ferramentas

---

*Este documento é atualizado regularmente. Última atualização: Janeiro 2025*

**Status**: 🚀 **ATIVO** | **Versão**: 1.0 | **Próxima Revisão**: Fevereiro 2025
