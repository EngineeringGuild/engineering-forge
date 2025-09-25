# 🤖 Metodologia Cursor - Engineering Forge

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: 🚀 **ATIVO**

---

## 🎯 **Visão Geral**

Este documento define a **metodologia obrigatória** para o Cursor trabalhar no projeto Engineering Forge. Ele estabelece regras, padrões e fluxos de trabalho que devem ser seguidos rigorosamente para manter a sincronização e qualidade do projeto.

### **Objetivo**
Garantir que o Cursor trabalhe de forma **metodológica**, **sincronizada** e **padronizada** em todas as tarefas do projeto.

### **Princípios**
- **Metodologia Rigorosa**: Seguir sempre os padrões estabelecidos
- **Sincronização Total**: Manter tudo atualizado e consistente
- **Documentação Primeiro**: Documentar antes de implementar
- **Chats Específicos**: Um chat por tarefa para organização
- **Atualização Contínua**: Sempre atualizar documentação

---

## 📋 **Regras Obrigatórias**

### **🔴 REGRA 1: Sempre Consultar a Estrutura**
Antes de qualquer ação, o Cursor DEVE:
1. **Ler** o `PROGRESS-DASHBOARD.md` para entender o status atual
2. **Consultar** o domínio relevante em `DOMAINS/`
3. **Verificar** a versão atual em `VERSIONS/`
4. **Usar** os templates em `TEMPLATES/`

### **🔴 REGRA 2: Um Chat por Tarefa**
Para cada nova tarefa:
1. **Criar** um novo chat específico
2. **Nomear** o chat com o padrão: `[TASK-XXX] Título da Tarefa`
3. **Referenciar** este documento no início do chat
4. **Seguir** o fluxo de trabalho definido

### **🔴 REGRA 3: Documentação Primeiro**
Antes de implementar qualquer código:
1. **Criar/Atualizar** a documentação relevante
2. **Usar** os templates apropriados
3. **Atualizar** o `PROGRESS-DASHBOARD.md`
4. **Sincronizar** com a estrutura DDD

### **🔴 REGRA 4: Atualização Contínua**
Após cada ação:
1. **Atualizar** o status da tarefa
2. **Atualizar** o progresso no dashboard
3. **Atualizar** a documentação afetada
4. **Verificar** consistência com outros domínios

---

## 🚀 **Fluxo de Trabalho Padrão**

### **Passo 1: Inicialização do Chat**
```markdown
# [TASK-XXX] Título da Tarefa

## 📋 Informações da Tarefa
- **ID**: TASK-XXX
- **Domínio**: [education | gaming | blockchain | user-management | marketplace | analytics | development]
- **Versão**: [V1.0 | V2.0 | V3.0 | V4.0]
- **Prioridade**: [High | Medium | Low]
- **Responsável**: Cursor AI

## 🎯 Objetivo
[Descrição clara do objetivo da tarefa]

## 📚 Referências
- **Metodologia**: [CURSOR-METHODOLOGY.md](CURSOR-METHODOLOGY.md)
- **Dashboard**: [PROGRESS-DASHBOARD.md](PROGRESS-DASHBOARD.md)
- **Domínio**: [DOMAINS/[domain]/README.md](DOMAINS/[domain]/README.md)
- **Versão**: [VERSIONS/[version]/README.md](VERSIONS/[version]/README.md)

## ✅ Checklist de Inicialização
- [ ] Li a metodologia Cursor
- [ ] Consultei o dashboard de progresso
- [ ] Verifiquei o domínio relevante
- [ ] Confirmei a versão do produto
- [ ] Entendi o objetivo da tarefa
```

### **Passo 2: Análise e Planejamento**
```markdown
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
```

### **Passo 3: Implementação**
```markdown
## 🛠️ Implementação

### **Código Implementado**
[Implementar o código seguindo os padrões estabelecidos]

### **Testes Criados**
[Criar testes unitários e de integração]

### **Documentação Atualizada**
[Atualizar documentação relevante]
```

### **Passo 4: Finalização e Sincronização**
```markdown
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

## 📊 **Comandos Obrigatórios**

### **Comandos de Inicialização**
```bash
# Sempre executar no início de cada chat
@ai read-file PROGRESS-DASHBOARD.md
@ai read-file DOMAINS/[domain]/README.md
@ai read-file VERSIONS/[version]/README.md
@ai read-file TEMPLATES/document-templates/task-template.md
```

### **Comandos de Implementação**
```bash
# Para implementar código
@ai implement [domain] [feature]
@ai create-tests [component]
@ai update-docs [section]
@ai review-code [file]
```

### **Comandos de Sincronização**
```bash
# Para manter sincronização
@ai update-dashboard [task-id] [status]
@ai update-domain [domain] [field] [value]
@ai update-version [version] [field] [value]
@ai check-consistency [domain]
```

---

## 🏗️ **Padrões de Implementação**

### **Estrutura de Arquivos**
```
# Sempre seguir esta estrutura
src/
├── components/
│   ├── [Domain]/
│   │   ├── [Component].tsx
│   │   ├── [Component].test.tsx
│   │   └── [Component].types.ts
│   └── UI/
├── services/
│   ├── [domain]Service.ts
│   └── [domain]Service.test.ts
├── types/
│   └── [domain].types.ts
└── utils/
    └── [domain].utils.ts
```

### **Padrões de Código**
```typescript
// Sempre usar TypeScript com tipos explícitos
interface ComponentProps {
  // Propriedades tipadas
}

// Sempre usar React hooks
const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Implementação
};

// Sempre exportar tipos
export type { ComponentProps };
```

### **Padrões de Testes**
```typescript
// Sempre criar testes unitários
describe('Component', () => {
  it('should render correctly', () => {
    // Teste
  });
  
  it('should handle user interactions', () => {
    // Teste
  });
});
```

---

## 📚 **Templates Obrigatórios**

### **Template de Tarefa**
Sempre usar o template em `TEMPLATES/document-templates/task-template.md`

### **Template de Sprint**
Sempre usar o template em `TEMPLATES/document-templates/sprint-template.md`

### **Template de Documentação**
Sempre seguir a estrutura dos documentos existentes

---

## 🔄 **Sincronização Contínua**

### **Checklist de Sincronização**
Após cada tarefa, verificar:
- [ ] **PROGRESS-DASHBOARD.md** atualizado
- [ ] **Domínio relevante** atualizado
- [ ] **Versão do produto** atualizada
- [ ] **Documentação técnica** atualizada
- [ ] **Templates** atualizados se necessário
- [ ] **Consistência** entre domínios verificada

### **Comandos de Verificação**
```bash
# Verificar consistência
@ai check-consistency [domain]
@ai validate-docs [section]
@ai check-dependencies [task-id]
```

---

## 🚨 **Regras de Qualidade**

### **Código**
- **TypeScript**: Sempre usar tipos explícitos
- **Testes**: Cobertura mínima de 80%
- **Linting**: Sempre passar no ESLint
- **Formatação**: Sempre usar Prettier

### **Documentação**
- **Markdown**: Sempre usar formatação correta
- **Links**: Sempre verificar se funcionam
- **Estrutura**: Sempre seguir a hierarquia
- **Atualização**: Sempre manter atualizada

### **Consistência**
- **Nomenclatura**: Sempre seguir padrões
- **Estrutura**: Sempre seguir arquitetura
- **Padrões**: Sempre seguir convenções
- **Sincronização**: Sempre manter consistente

---

## 📞 **Suporte e Recursos**

### **Documentação de Referência**
- **Metodologia**: [CURSOR-METHODOLOGY.md](CURSOR-METHODOLOGY.md)
- **Dashboard**: [PROGRESS-DASHBOARD.md](PROGRESS-DASHBOARD.md)
- **Domínios**: [DOMAINS/README.md](DOMAINS/README.md)
- **Versões**: [VERSIONS/README.md](VERSIONS/README.md)
- **Templates**: [TEMPLATES/README.md](TEMPLATES/README.md)

### **Comandos de Ajuda**
```bash
# Ajuda geral
@ai help methodology

# Ajuda específica
@ai help [domain]
@ai help [version]
@ai help [template]
```

---

## 🎯 **Exemplo de Uso**

### **Chat de Exemplo**
```markdown
# [TASK-001] Configurar MongoDB Atlas

## 📋 Informações da Tarefa
- **ID**: TASK-001
- **Domínio**: development
- **Versão**: V1.0
- **Prioridade**: High
- **Responsável**: Cursor AI

## 🎯 Objetivo
Configurar MongoDB Atlas com conexão e modelos básicos para o projeto V1.0

## 📚 Referências
- **Metodologia**: [CURSOR-METHODOLOGY.md](CURSOR-METHODOLOGY.md)
- **Dashboard**: [PROGRESS-DASHBOARD.md](PROGRESS-DASHBOARD.md)
- **Domínio**: [DOMAINS/development/README.md](DOMAINS/development/README.md)
- **Versão**: [VERSIONS/v1.0-prototype/README.md](VERSIONS/v1.0-prototype/README.md)

## ✅ Checklist de Inicialização
- [x] Li a metodologia Cursor
- [x] Consultei o dashboard de progresso
- [x] Verifiquei o domínio relevante
- [x] Confirmei a versão do produto
- [x] Entendi o objetivo da tarefa

## 🔍 Análise da Tarefa
[Análise detalhada...]

## 🛠️ Implementação
[Implementação detalhada...]

## ✅ Finalização
[Finalização e sincronização...]
```

---

## 🔄 **Atualizações da Metodologia**

### **Versão 1.0 (Janeiro 2025)**
- Criação da metodologia inicial
- Definição de regras obrigatórias
- Estabelecimento de fluxo de trabalho
- Criação de comandos padrão

### **Próximas Versões**
- Melhorias baseadas em feedback
- Novos comandos e templates
- Otimizações de fluxo
- Integração com novas ferramentas

---

*Este documento é atualizado regularmente. Última atualização: Janeiro 2025*

**Status**: 🟢 **ATIVO** | **Versão**: 1.0 | **Próxima Revisão**: Fevereiro 2025
