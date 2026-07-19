# 🚨 Regras Obrigatórias Cursor - Engineering Forge

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: 🚨 **OBRIGATÓRIO**

---

## 🎯 **Visão Geral**

Este documento define as **REGRAS OBRIGATÓRIAS** que o Cursor DEVE seguir ao trabalhar no projeto Engineering Forge. Estas regras são **NÃO NEGOCIÁVEIS** e devem ser aplicadas em **TODAS** as interações.

### **⚠️ ATENÇÃO**
- **NÃO** é permitido ignorar estas regras
- **NÃO** é permitido fazer exceções
- **NÃO** é permitido trabalhar sem seguir a metodologia
- **SIM** é obrigatório seguir todas as regras

---

## 🔴 **REGRAS CRÍTICAS (NÃO NEGOCIÁVEIS)**

### **🔴 REGRA 1: SEMPRE USAR TEMPLATE DE CHAT**
**O QUE**: Usar o template em `CURSOR-CHAT-TEMPLATE.md` no início de TODOS os chats
**QUANDO**: Sempre, sem exceção
**COMO**: Copiar e colar o template, preencher todas as seções
**PUNIÇÃO**: Chat será considerado inválido se não seguir

### **🔴 REGRA 2: SEMPRE LER METODOLOGIA**
**O QUE**: Ler `CURSOR-METHODOLOGY.md` antes de qualquer ação
**QUANDO**: No início de cada chat
**COMO**: Executar `@ai read-methodology`
**PUNIÇÃO**: Ações serão consideradas inválidas se não seguir

### **🔴 REGRA 3: SEMPRE CONSULTAR DASHBOARD**
**O QUE**: Consultar `PROGRESS-DASHBOARD.md` para entender status atual
**QUANDO**: No início de cada chat
**COMO**: Executar `@ai check-status`
**PUNIÇÃO**: Trabalho será considerado desatualizado se não seguir

### **🔴 REGRA 4: SEMPRE VERIFICAR DOMÍNIO**
**O QUE**: Verificar o domínio relevante em `DOMAINS/[domain]/README.md`
**QUANDO**: Antes de implementar qualquer feature
**COMO**: Executar `@ai read-domain [domain]`
**PUNIÇÃO**: Implementação será considerada inconsistente se não seguir

### **🔴 REGRA 5: SEMPRE CONFIRMAR VERSÃO**
**O QUE**: Confirmar a versão do produto em `VERSIONS/[version]/README.md`
**QUANDO**: Antes de implementar qualquer feature
**COMO**: Executar `@ai read-version [version]`
**PUNIÇÃO**: Implementação será considerada incorreta se não seguir

---

## 🟡 **REGRAS IMPORTANTES (OBRIGATÓRIAS)**

### **🟡 REGRA 6: SEMPRE USAR COMANDOS PADRONIZADOS**
**O QUE**: Usar apenas os comandos definidos em `CURSOR-COMMANDS.md`
**QUANDO**: Sempre
**COMO**: Seguir a documentação de comandos
**PUNIÇÃO**: Comandos serão considerados inválidos se não seguir

### **🟡 REGRA 7: SEMPRE ATUALIZAR DASHBOARD**
**O QUE**: Atualizar `PROGRESS-DASHBOARD.md` após cada ação
**QUANDO**: Após cada mudança
**COMO**: Executar `@ai update-dashboard [task-id] [status]`
**PUNIÇÃO**: Progresso será considerado desatualizado se não seguir

### **🟡 REGRA 8: SEMPRE SINCRONIZAR DOMÍNIO**
**O QUE**: Sincronizar com o domínio relevante após cada mudança
**QUANDO**: Após cada implementação
**COMO**: Executar `@ai sync-domain [domain]`
**PUNIÇÃO**: Domínio será considerado inconsistente se não seguir

### **🟡 REGRA 9: SEMPRE VERIFICAR CONSISTÊNCIA**
**O QUE**: Verificar consistência entre domínios e versões
**QUANDO**: Após cada mudança
**COMO**: Executar `@ai check-consistency [scope]`
**PUNIÇÃO**: Projeto será considerado inconsistente se não seguir

### **🟡 REGRA 10: SEMPRE ATUALIZAR DOCUMENTAÇÃO**
**O QUE**: Atualizar documentação relevante após cada mudança
**QUANDO**: Após cada implementação
**COMO**: Executar `@ai update-docs [section]`
**PUNIÇÃO**: Documentação será considerada desatualizada se não seguir

---

## 🟢 **REGRAS DE QUALIDADE (OBRIGATÓRIAS)**

### **🟢 REGRA 11: SEMPRE CRIAR TESTES**
**O QUE**: Criar testes para todo código implementado
**QUANDO**: Após cada implementação
**COMO**: Executar `@ai create-tests [component]`
**PUNIÇÃO**: Código será considerado incompleto se não seguir

### **🟢 REGRA 12: SEMPRE SEGUIR PADRÕES DE CÓDIGO**
**O QUE**: Seguir padrões TypeScript, React e arquitetura definidos
**QUANDO**: Sempre
**COMO**: Seguir documentação técnica
**PUNIÇÃO**: Código será considerado de baixa qualidade se não seguir

### **🟢 REGRA 13: SEMPRE USAR TEMPLATES**
**O QUE**: Usar templates definidos em `TEMPLATES/`
**QUANDO**: Ao criar novos documentos
**COMO**: Seguir templates existentes
**PUNIÇÃO**: Documentos serão considerados inconsistentes se não seguir

### **🟢 REGRA 14: SEMPRE VALIDAR IMPLEMENTAÇÃO**
**O QUE**: Validar implementação antes de finalizar
**QUANDO**: Antes de marcar tarefa como concluída
**COMO**: Executar `@ai validate-docs [section]`
**PUNIÇÃO**: Implementação será considerada inválida se não seguir

### **🟢 REGRA 15: SEMPRE DOCUMENTAR MUDANÇAS**
**O QUE**: Documentar todas as mudanças realizadas
**QUANDO**: Após cada implementação
**COMO**: Atualizar documentação relevante
**PUNIÇÃO**: Mudanças serão consideradas não documentadas se não seguir

---

## 🚨 **REGRAS DE EMERGÊNCIA**

### **🚨 REGRA 16: SEMPRE REPORTAR PROBLEMAS**
**O QUE**: Reportar problemas críticos imediatamente
**QUANDO**: Ao identificar problemas críticos
**COMO**: Executar `@ai fix-critical [issue]`
**PUNIÇÃO**: Problemas podem se agravar se não seguir

### **🚨 REGRA 17: SEMPRE FAZER BACKUP**
**O QUE**: Fazer backup antes de mudanças críticas
**QUANDO**: Antes de mudanças que podem quebrar o sistema
**COMO**: Executar `@ai backup [scope]`
**PUNIÇÃO**: Perda de dados pode ocorrer se não seguir

### **🚨 REGRA 18: SEMPRE TESTAR EM AMBIENTE SEGURO**
**O QUE**: Testar mudanças em ambiente seguro primeiro
**QUANDO**: Antes de implementar em produção
**COMO**: Usar ambiente de desenvolvimento
**PUNIÇÃO**: Sistema pode quebrar se não seguir

---

## 📋 **CHECKLIST OBRIGATÓRIO**

### **Antes de Iniciar Qualquer Chat**
- [ ] Li `CURSOR-METHODOLOGY.md`
- [ ] Li `CURSOR-COMMANDS.md`
- [ ] Li `CURSOR-CHAT-TEMPLATE.md`
- [ ] Li `CURSOR-RULES.md` (este documento)
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

## 🎯 **EXEMPLOS DE USO CORRETO**

### **✅ CORRETO: Inicialização de Chat**
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

### **✅ CORRETO: Comandos de Inicialização**
```bash
@ai read-methodology
@ai check-status
@ai read-domain development
@ai read-version v1.0-prototype
```

### **✅ CORRETO: Implementação**
```bash
@ai implement development database-setup
@ai create-service development DatabaseService
@ai create-tests DatabaseService
@ai update-docs development
@ai update-dashboard TASK-001 in-progress
```

### **✅ CORRETO: Finalização**
```bash
@ai complete-task TASK-001 "MongoDB Atlas configurado com sucesso"
@ai sync-all
@ai check-consistency all
@ai update-metrics velocity 5
```

---

## ❌ **EXEMPLOS DE USO INCORRETO**

### **❌ INCORRETO: Chat sem Template**
```markdown
# Configurar MongoDB
Vou configurar o MongoDB Atlas para o projeto.
```

### **❌ INCORRETO: Comandos Não Padronizados**
```bash
# Comandos inválidos
read methodology
check status
implement database
```

### **❌ INCORRETO: Implementação sem Sincronização**
```bash
# Implementação sem sincronização
@ai implement development database-setup
# Não atualizou dashboard
# Não sincronizou domínio
# Não verificou consistência
```

---

## 🚨 **CONSEQUÊNCIAS DE NÃO SEGUIR AS REGRAS**

### **Regras Críticas (🔴)**
- **Chat será considerado inválido**
- **Ações serão consideradas inválidas**
- **Trabalho será considerado desatualizado**
- **Implementação será considerada inconsistente**
- **Implementação será considerada incorreta**

### **Regras Importantes (🟡)**
- **Comandos serão considerados inválidos**
- **Progresso será considerado desatualizado**
- **Domínio será considerado inconsistente**
- **Projeto será considerado inconsistente**
- **Documentação será considerada desatualizada**

### **Regras de Qualidade (🟢)**
- **Código será considerado incompleto**
- **Código será considerado de baixa qualidade**
- **Documentos serão considerados inconsistentes**
- **Implementação será considerada inválida**
- **Mudanças serão consideradas não documentadas**

---

## 📞 **Suporte e Recursos**

### **Documentação de Referência**
- **Metodologia**: [CURSOR-METHODOLOGY.md](CURSOR-METHODOLOGY.md)
- **Comandos**: [CURSOR-COMMANDS.md](CURSOR-COMMANDS.md)
- **Template de Chat**: [CURSOR-CHAT-TEMPLATE.md](CURSOR-CHAT-TEMPLATE.md)
- **Regras**: [CURSOR-RULES.md](CURSOR-RULES.md) (este documento)

### **Comandos de Ajuda**
```bash
@ai help methodology
@ai help commands
@ai help rules
@ai help [command]
```

---

## 🔄 **Atualizações das Regras**

### **Versão 1.0 (Janeiro 2025)**
- Criação das regras iniciais
- Definição de regras críticas
- Estabelecimento de consequências
- Criação de exemplos

### **Próximas Versões**
- Novas regras baseadas em necessidades
- Melhorias nas regras existentes
- Atualizações de consequências
- Novos exemplos e casos de uso

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

*Este documento é atualizado regularmente. Última atualização: Janeiro 2025*

**Status**: 🚨 **OBRIGATÓRIO** | **Versão**: 1.0 | **Próxima Revisão**: Fevereiro 2025
