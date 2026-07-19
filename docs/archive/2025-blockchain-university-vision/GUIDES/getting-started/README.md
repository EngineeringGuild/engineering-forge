# 🚀 Guia de Início Rápido - Engineering Forge

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: 🚀 **ATIVO**

---

## 🎯 **Bem-vindo ao Engineering Forge!**

Este guia te ajudará a **começar rapidamente** a trabalhar no projeto Engineering Forge. Siga os passos abaixo para configurar seu ambiente e começar a desenvolver.

---

## 📋 **Pré-requisitos**

### **Software Necessário**
- **Node.js**: 18+ (recomendado: 20 LTS)
- **npm**: 9+ (vem com Node.js)
- **Git**: 2.30+
- **MongoDB Atlas**: Conta gratuita
- **VS Code**: Editor recomendado

### **Contas Necessárias**
- **GitHub**: Para repositório do projeto
- **MongoDB Atlas**: Para banco de dados
- **Vercel**: Para deploy do frontend
- **Railway**: Para deploy do backend

---

## 🏗️ **Configuração do Ambiente**

### **1. Clone o Repositório**
```bash
# Clone o repositório principal
git clone https://github.com/engineeringguild/engineering-forge.git
cd engineering-forge

# Clone o repositório de documentação
git clone https://github.com/engineeringguild/engineering-forge-docs.git
cd engineering-forge-docs
```

### **2. Setup do Frontend (V1.0)**
```bash
# Navegue para o diretório do frontend
cd engineering-forge-v1

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local com suas configurações

# Inicie o servidor de desenvolvimento
npm run dev
```

### **3. Setup do Backend**
```bash
# Navegue para o diretório do backend
cd ../engineering-forge-backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Inicie o servidor de desenvolvimento
npm run dev
```

### **4. Setup do Banco de Dados**
```bash
# Configure o MongoDB Atlas
# 1. Crie uma conta no MongoDB Atlas
# 2. Crie um cluster gratuito
# 3. Configure as credenciais
# 4. Adicione as credenciais no .env

# Execute as migrações
npm run migrate
```

---

## 🎮 **Estrutura do Projeto**

### **Frontend (React + TypeScript)**
```
engineering-forge-v1/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Layout/         # Layout components
│   │   ├── UI/             # UI components
│   │   └── Game/           # Game components
│   ├── pages/              # Páginas da aplicação
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   └── store/              # State management
├── public/                 # Assets estáticos
└── dist/                   # Build output
```

### **Backend (Node.js + Express)**
```
engineering-forge-backend/
├── src/
│   ├── controllers/        # Route controllers
│   ├── services/           # Business logic
│   ├── models/             # Database models
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   └── utils/              # Utility functions
├── tests/                  # Test files
└── docs/                   # API documentation
```

### **Documentação**
```
docs/
├── DOMAINS/                # Domínios de negócio
├── VERSIONS/               # Versões do produto
├── DEVELOPMENT/            # Processo de desenvolvimento
├── SPECIFICATIONS/         # Especificações técnicas
├── BUSINESS/               # Aspectos de negócio
├── ASSETS/                 # Recursos visuais
├── GUIDES/                 # Guias e tutoriais
└── TEMPLATES/              # Templates e padrões
```

---

## 🎯 **Primeiros Passos**

### **1. Entenda a Arquitetura**
- Leia a **[Visão Geral do Projeto](PROJECT-OVERVIEW.md)**
- Revise o **[Dashboard de Progresso](PROGRESS-DASHBOARD.md)**
- Explore a **[Estrutura de Domínios](DOMAINS/README.md)**

### **2. Configure seu Ambiente**
- Siga os passos de configuração acima
- Verifique se tudo está funcionando
- Execute os testes básicos

### **3. Escolha uma Tarefa**
- Acesse o **[Sistema de Tarefas](DEVELOPMENT/tasks/README.md)**
- Escolha uma tarefa do seu domínio
- Leia os critérios de aceitação

### **4. Comece a Desenvolver**
- Crie uma branch para sua tarefa
- Implemente a solução
- Execute os testes
- Faça commit e push

---

## 🏢 **Domínios de Negócio**

### **📚 Educação**
**Responsável**: Frontend Developer  
**Foco**: Sistema educacional, lições, progresso

**Tarefas Iniciais**:
- [TASK-EDU-001] Sistema de lições interativas
- [TASK-EDU-002] Sistema de progresso e conquistas

**Arquivos Principais**:
- `src/components/Education/`
- `src/pages/Courses/`
- `src/services/educationService.ts`

### **🎮 Jogos**
**Responsável**: Frontend Developer  
**Foco**: Mecânicas de jogo, física, componentes

**Tarefas Iniciais**:
- [TASK-GAME-001] Interface de construção 2D
- [TASK-GAME-002] Sistema de componentes

**Arquivos Principais**:
- `src/components/Game/`
- `src/pages/GamePage/`
- `src/services/gameService.ts`

### **⛓️ Blockchain**
**Responsável**: Blockchain Developer  
**Foco**: Integração Solana, NFTs, carteiras

**Tarefas Iniciais**:
- [TASK-BC-001] Setup do ambiente Solana
- [TASK-BC-002] Integração de carteiras

**Arquivos Principais**:
- `src/services/blockchainService.ts`
- `src/components/Blockchain/`
- `contracts/` (Rust + Anchor)

### **👥 Usuários**
**Responsável**: Backend Developer  
**Foco**: Autenticação, perfis, sessões

**Tarefas Iniciais**:
- [TASK-USER-001] Sistema de autenticação
- [TASK-USER-002] Gestão de perfis

**Arquivos Principais**:
- `src/controllers/authController.ts`
- `src/models/User.ts`
- `src/middleware/auth.ts`

---

## 🚀 **Versões do Produto**

### **V1.0 - Protótipo 2D (Atual)**
**Status**: 🔄 Em desenvolvimento  
**Prazo**: Março 2025

**Características**:
- Interface 2D simples
- Sistema de construção básico
- Física simplificada
- Validação de mecânicas

**Tecnologias**:
- React + TypeScript + Tailwind
- Node.js + Express
- MongoDB Atlas
- Cálculos matemáticos

### **V2.0 - MVP Web (Próximo)**
**Status**: ⏳ Planejado  
**Prazo**: Setembro 2025

**Características**:
- Interface 2D polida
- Sistema educacional completo
- Integração blockchain básica
- Lançamento para mercado

**Tecnologias**:
- React + Three.js + Framer Motion
- Node.js + PostgreSQL + Redis
- Solana + Anchor
- Matter.js 2D

---

## 🛠️ **Ferramentas de Desenvolvimento**

### **VS Code Extensions**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-markdown"
  ]
}
```

### **Scripts Úteis**
```bash
# Frontend
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Linter
npm run test         # Testes

# Backend
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run test         # Testes
npm run migrate      # Migrações do banco
```

### **Comandos Git**
```bash
# Criar branch para tarefa
git checkout -b feature/TASK-XXX-description

# Fazer commit
git add .
git commit -m "feat: implement TASK-XXX"

# Push para repositório
git push origin feature/TASK-XXX-description

# Criar Pull Request
# Use a interface do GitHub ou VS Code
```

---

## 🧪 **Testes e Qualidade**

### **Executar Testes**
```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Cobertura de testes
npm run test:coverage
```

### **Linting e Formatação**
```bash
# ESLint
npm run lint

# Prettier
npm run format

# Verificar tipos TypeScript
npm run type-check
```

### **Padrões de Código**
- **TypeScript**: Sempre use tipos explícitos
- **React**: Use hooks e componentes funcionais
- **CSS**: Use Tailwind CSS classes
- **Commits**: Use conventional commits
- **Naming**: Use camelCase para variáveis, PascalCase para componentes

---

## 📚 **Recursos de Aprendizado**

### **Documentação do Projeto**
- **[Visão Geral](PROJECT-OVERVIEW.md)** - Entenda o projeto
- **[Dashboard](PROGRESS-DASHBOARD.md)** - Acompanhe progresso
- **[Tarefas](DEVELOPMENT/tasks/README.md)** - Gerencie tarefas
- **[Arquitetura](DEVELOPMENT/architecture/README.md)** - Entenda a arquitetura

### **Documentação Externa**
- **[React](https://react.dev/)** - Documentação oficial
- **[TypeScript](https://www.typescriptlang.org/)** - Documentação oficial
- **[Tailwind CSS](https://tailwindcss.com/)** - Documentação oficial
- **[MongoDB](https://docs.mongodb.com/)** - Documentação oficial
- **[Solana](https://docs.solana.com/)** - Documentação oficial

### **Tutoriais Recomendados**
- **[React + TypeScript](https://react-typescript-cheatsheet.netlify.app/)**
- **[Tailwind CSS](https://tailwindcss.com/docs/utility-first)**
- **[MongoDB Atlas](https://docs.atlas.mongodb.com/)**
- **[Solana Development](https://docs.solana.com/developing)**

---

## 🤖 **Trabalhando com AI**

### **Comandos Úteis**
```bash
# Criar tarefa
@ai create-task [domain] [title] [description]

# Implementar feature
@ai implement [domain] [feature]

# Revisar código
@ai review-code [file]

# Gerar testes
@ai generate-tests [component]

# Atualizar documentação
@ai update-docs [section]
```

### **Fluxo de Trabalho com AI**
1. **Descreva** o que você quer fazer
2. **Peça** para a AI criar a tarefa
3. **Implemente** seguindo as especificações
4. **Peça** para a AI revisar o código
5. **Teste** e faça commit

---

## 🚨 **Problemas Comuns**

### **Erro de Conexão com MongoDB**
```bash
# Verifique as credenciais no .env
# Teste a conexão
npm run test:db-connection
```

### **Erro de Build**
```bash
# Limpe o cache
npm run clean
# Reinstale dependências
npm install
# Tente novamente
npm run build
```

### **Erro de TypeScript**
```bash
# Verifique os tipos
npm run type-check
# Atualize as definições
npm install @types/[package]
```

### **Erro de Dependências**
```bash
# Limpe o cache
npm cache clean --force
# Delete node_modules
rm -rf node_modules
# Reinstale
npm install
```

---

## 📞 **Suporte e Ajuda**

### **Canais de Suporte**
- **Discord**: [Engineering Guild Discord](https://discord.gg/engineeringguild)
- **GitHub Issues**: [Criar issue](https://github.com/engineeringguild/engineering-forge/issues)
- **Email**: support@engineeringforge.guildeng.com

### **Documentação**
- **Projeto**: [docs.guildeng.com/EngineeringForge](https://docs.guildeng.com/EngineeringForge)
- **API**: [api.engineeringforge.guildeng.com/docs](https://api.engineeringforge.guildeng.com/docs)

### **Comunidade**
- **Twitter**: [@engineeringguild](https://twitter.com/engineeringguild)
- **Website**: [guildeng.com](https://guildeng.com)

---

## 🎉 **Próximos Passos**

### **Esta Semana**
1. **Configure** seu ambiente de desenvolvimento
2. **Escolha** uma tarefa do seu domínio
3. **Implemente** a solução
4. **Teste** e faça commit

### **Próxima Semana**
1. **Complete** sua primeira tarefa
2. **Escolha** uma tarefa mais complexa
3. **Colabore** com outros desenvolvedores
4. **Contribua** para a documentação

### **Próximo Mês**
1. **Domine** seu domínio de negócio
2. **Contribua** para múltiplas versões
3. **Mentore** novos desenvolvedores
4. **Inove** com novas features

---

## 🔄 **Atualizações**

Este guia é atualizado regularmente. Para ver as últimas mudanças:

```bash
# Atualize a documentação
git pull origin main

# Verifique a versão
cat GUIDES/getting-started/README.md | grep "Versão"
```

---

*Última atualização: Janeiro 2025*

**Status**: 🟢 **ATIVO** | **Versão**: 1.0 | **Próxima Revisão**: Fevereiro 2025
