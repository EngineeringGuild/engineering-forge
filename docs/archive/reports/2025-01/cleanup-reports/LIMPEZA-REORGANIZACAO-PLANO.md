# 🧹 Plano de Limpeza e Reorganização - Engineering Forge

**Data**: Janeiro 2025  
**Status**: 🔄 **EM EXECUÇÃO**

---

## 🎯 **Objetivo**

Fazer uma **limpeza e reorganização final** dos documentos, arquivando o que não será usado e reorganizando o que será mantido de forma profissional.

---

## 📋 **Análise da Estrutura Atual**

### **🚨 Problemas Identificados**

#### **Pasta Principal (Muitos arquivos soltos)**
- `COMMIT-INSTRUCTIONS.md` - ❌ Arquivar
- `COMPREHENSIVE-PROJECT-AUDIT-REPORT.md` - ❌ Arquivar
- `DEPLOYMENT-GUIDE.md` - ❌ Arquivar
- `EXECUTE-NOW.md` - ❌ Arquivar
- `fix-environment.sh` - ❌ Arquivar
- `MEGA-REVISAO-COMPLETA-RELATORIO.md` - ❌ Arquivar
- `PROJECT-CLEANUP-REPORT.md` - ❌ Arquivar
- `PROJECT-HEALTH-SUMMARY.md` - ❌ Arquivar
- `start-docs.sh` - ❌ Arquivar
- `start-game.sh` - ❌ Arquivar
- `TEST-CORRECTED-VERSION.md` - ❌ Arquivar

#### **Pasta docs/ (Muitos arquivos soltos)**
- `CURSOR-IMPLEMENTATION-COMPLETE.md` - ❌ Arquivar
- `CURSOR-RULES-SYSTEM-COMPLETE.md` - ❌ Arquivar
- `MEGA-REVISAO-SISTEMA-REGRAS.md` - ❌ Arquivar
- `SISTEMA-REGRAS-100-PERCENT-COMPLETO.md` - ❌ Arquivar
- `STRUCTURE-COMPLETE.md` - ❌ Arquivar
- `Progress-Summary.md` - ❌ Arquivar (duplicado)
- `TDD-Index.md` - ❌ Arquivar
- `TDD-v1.1.md` - ❌ Arquivar
- `GDD-v1.1.md` - ❌ Arquivar (versão antiga)
- `Project-Plan-v1.1.md` - ❌ Arquivar

#### **Pasta engineering-forge-v1/ (Documentos soltos)**
- `IMPLEMENTATION-GUIDE.md` - ✅ Mover para docs/DEVELOPMENT/
- `IMPLEMENTATION-ROADMAP.md` - ✅ Mover para docs/DEVELOPMENT/
- `PRD.md` - ✅ Mover para docs/BUSINESS/
- `QUALITY-CHECKLIST.md` - ✅ Mover para docs/DEVELOPMENT/
- `README-IMPLEMENTATION.md` - ❌ Arquivar (duplicado)
- `TECHNICAL-ARCHITECTURE.md` - ✅ Mover para docs/SPECIFICATIONS/

#### **Pasta engineering-forge-docs/ (Documentos soltos)**
- `ERROR-ANALYSIS-REPORT.md` - ❌ Arquivar

---

## 🗂️ **Plano de Reorganização**

### **Fase 1: Arquivar Documentos Obsoletos**
1. **Criar estrutura de arquivo organizada**
2. **Mover documentos obsoletos para archive/**
3. **Organizar por categoria e data**

### **Fase 2: Reorganizar Documentos Ativos**
1. **Mover documentos para pastas apropriadas**
2. **Consolidar documentos duplicados**
3. **Atualizar referências e links**

### **Fase 3: Limpar Pasta Principal**
1. **Manter apenas arquivos essenciais**
2. **Mover documentos para docs/**
3. **Organizar scripts**

---

## 📁 **Estrutura de Arquivo Proposta**

### **archive/ (Organizado por categoria)**
```
archive/
├── reports/                    # Relatórios e análises
│   ├── 2025-01/               # Por mês
│   │   ├── audit-reports/
│   │   ├── health-reports/
│   │   └── cleanup-reports/
│   └── historical/            # Relatórios históricos
├── old-versions/              # Versões antigas de documentos
│   ├── gdd/
│   ├── tdd/
│   └── project-plans/
├── deprecated/                # Documentos depreciados
│   ├── scripts/
│   ├── guides/
│   └── instructions/
└── temp/                      # Documentos temporários
    ├── fix-reports/
    └── test-files/
```

### **docs/ (Estrutura limpa)**
```
docs/
├── README.md                  # Entrada principal
├── PROGRESS-DASHBOARD.md      # Dashboard central
├── PROJECT-OVERVIEW.md        # Visão geral
├── NEXT-STEPS.md              # Próximos passos
├── CURSOR-SYSTEM.md           # Sistema Cursor
├── CURSOR-RULES.md            # Regras Cursor
├── CURSOR-METHODOLOGY.md      # Metodologia
├── CURSOR-COMMANDS.md         # Comandos
├── CURSOR-CHAT-TEMPLATE.md    # Template de chat
├── DOMAINS/                   # Domínios DDD
├── VERSIONS/                  # Versões do produto
├── DEVELOPMENT/               # Processo de desenvolvimento
├── SPECIFICATIONS/            # Especificações técnicas
├── BUSINESS/                  # Aspectos de negócio
├── GUIDES/                    # Guias e tutoriais
├── TEMPLATES/                 # Templates e padrões
├── ASSETS/                    # Recursos visuais
└── archive/                   # Documentos arquivados
```

### **Pasta Principal (Apenas essenciais)**
```
engineering-forge/
├── README.md                  # README principal
├── package.json               # Configuração do projeto
├── tsconfig.json              # Configuração TypeScript
├── eslint.config.js           # Configuração ESLint
├── prettier.config.js         # Configuração Prettier
├── .gitignore                 # Ignore do Git
├── .cursorrules               # Regras do Cursor
├── scripts/                   # Scripts de automação
├── docs/                      # Documentação
├── engineering-forge-v1/      # V1.0 do jogo
└── engineering-forge-docs/    # Documentação web
```

---

## 🚀 **Ações de Limpeza**

### **Ação 1: Criar Estrutura de Arquivo**
- Criar pastas organizadas em archive/
- Organizar por categoria e data

### **Ação 2: Arquivar Documentos Obsoletos**
- Mover relatórios para archive/reports/
- Mover versões antigas para archive/old-versions/
- Mover scripts depreciados para archive/deprecated/

### **Ação 3: Reorganizar Documentos Ativos**
- Mover documentos para pastas apropriadas
- Consolidar duplicados
- Atualizar links

### **Ação 4: Limpar Pasta Principal**
- Remover documentos desnecessários
- Manter apenas arquivos essenciais
- Organizar scripts

---

## 📊 **Métricas de Limpeza**

### **Antes da Limpeza**
- **Arquivos na pasta principal**: 15+ arquivos soltos
- **Arquivos em docs/**: 20+ arquivos soltos
- **Documentos duplicados**: 5+ duplicados
- **Estrutura desorganizada**: ❌

### **Após a Limpeza**
- **Arquivos na pasta principal**: 5 arquivos essenciais
- **Arquivos em docs/**: Organizados em pastas
- **Documentos duplicados**: 0 duplicados
- **Estrutura organizada**: ✅

---

## 🎯 **Benefícios da Reorganização**

### **✅ Organização**
- Estrutura clara e lógica
- Fácil navegação
- Documentos bem categorizados

### **✅ Manutenibilidade**
- Fácil localização de documentos
- Redução de duplicação
- Atualizações mais eficientes

### **✅ Profissionalismo**
- Estrutura profissional
- Documentação organizada
- Fácil onboarding

### **✅ Eficiência**
- Menos tempo procurando documentos
- Desenvolvimento mais rápido
- Menos confusão

---

## ⚠️ **Considerações sobre Setup**

### **Problema Identificado**
O setup está instalando dependências na pasta principal, mas deveria instalar na pasta específica do projeto (engineering-forge-v1).

### **Solução Proposta**
1. **Manter setup na pasta principal** para configurações gerais
2. **Adicionar comando específico** para instalar na V1
3. **Criar script separado** para setup da V1

---

## 🎯 **Próximos Passos**

### **Imediato**
1. Executar limpeza de documentos
2. Reorganizar estrutura
3. Atualizar links e referências

### **Curto Prazo**
1. Ajustar scripts de setup
2. Testar nova estrutura
3. Validar funcionamento

### **Médio Prazo**
1. Documentar nova estrutura
2. Treinar equipe
3. Manter organização

---

*Este plano será executado durante a limpeza e reorganização*

**Status**: 🔄 **EM EXECUÇÃO** | **Próxima Ação**: Executar limpeza
