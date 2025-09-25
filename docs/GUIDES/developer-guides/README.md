# 👨‍💻 Guias para Desenvolvedores - Engineering Forge

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: 🚀 **ATIVO**

---

## 🎯 **Visão Geral**

Este guia fornece informações detalhadas para desenvolvedores que trabalham no projeto Engineering Forge. Ele cobre desde configuração inicial até práticas avançadas de desenvolvimento.

### **Público-Alvo**
- **Frontend Developers**: Desenvolvedores React/TypeScript
- **Backend Developers**: Desenvolvedores Node.js/Express
- **Blockchain Developers**: Desenvolvedores Solana/Rust
- **DevOps Engineers**: Engenheiros de infraestrutura
- **QA Engineers**: Engenheiros de qualidade

---

## 🚀 **Quick Start**

### **Configuração Inicial**
```bash
# 1. Clone o repositório
git clone https://github.com/engineeringguild/engineering-forge.git
cd engineering-forge

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### **Primeiros Passos**
1. **Leia a documentação**: Comece com o [README principal](../README.md)
2. **Configure seu ambiente**: Siga o [Guia de Início Rápido](../getting-started/README.md)
3. **Escolha uma tarefa**: Acesse o [Sistema de Tarefas](../../DEVELOPMENT/tasks/README.md)
4. **Comece a desenvolver**: Siga os padrões estabelecidos

---

## 🏗️ **Arquitetura do Sistema**

### **Visão Geral**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (React/TS)    │◄──►│   (Node.js)     │◄──►│   (Solana)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN           │    │   Database      │    │   NFT Storage   │
│   (Cloudflare)  │    │   (MongoDB)     │    │   (Arweave)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Domínios de Negócio**
- **📚 Educação**: Sistema educacional
- **🎮 Jogos**: Mecânicas de jogo
- **⛓️ Blockchain**: Integração Solana
- **👥 Usuários**: Gestão de usuários
- **🛒 Marketplace**: Sistema de compra/venda
- **📊 Analytics**: Métricas e relatórios

---

## 💻 **Desenvolvimento Frontend**

### **Stack Tecnológico**
- **React 18**: Framework principal
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Framework CSS
- **Vite**: Build tool
- **Zustand**: State management
- **React Router**: Roteamento

### **Estrutura de Componentes**
```
src/
├── components/
│   ├── Layout/          # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── UI/              # Componentes de UI
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   └── Game/            # Componentes de jogo
│       ├── ComponentPanel.tsx
│       ├── Workspace.tsx
│       └── PerformanceDisplay.tsx
├── pages/               # Páginas da aplicação
├── hooks/               # Custom hooks
├── store/               # Estado global
├── utils/               # Funções utilitárias
└── types/               # Definições de tipos
```

### **Padrões de Componentes**
```typescript
// Exemplo de componente React
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  disabled = false,
  onClick,
  children
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### **State Management com Zustand**
```typescript
// store/gameStore.ts
import { create } from 'zustand';

interface GameState {
  components: Component[];
  selectedComponent: Component | null;
  performance: PerformanceMetrics;
  addComponent: (component: Component) => void;
  removeComponent: (id: string) => void;
  selectComponent: (component: Component) => void;
  updatePerformance: (performance: PerformanceMetrics) => void;
}

export const useGameStore = create<GameState>((set) => ({
  components: [],
  selectedComponent: null,
  performance: {
    acceleration: 0,
    topSpeed: 0,
    handling: 0,
    weight: 0
  },
  addComponent: (component) =>
    set((state) => ({
      components: [...state.components, component]
    })),
  removeComponent: (id) =>
    set((state) => ({
      components: state.components.filter((c) => c.id !== id)
    })),
  selectComponent: (component) =>
    set({ selectedComponent: component }),
  updatePerformance: (performance) =>
    set({ performance })
}));
```

---

## ⚙️ **Desenvolvimento Backend**

### **Stack Tecnológico**
- **Node.js 20**: Runtime
- **Express.js**: Framework web
- **TypeScript**: Tipagem estática
- **MongoDB**: Banco de dados
- **JWT**: Autenticação
- **bcrypt**: Hash de senhas

### **Estrutura do Backend**
```
src/
├── controllers/         # Controladores de rotas
│   ├── authController.ts
│   ├── userController.ts
│   └── gameController.ts
├── services/            # Lógica de negócio
│   ├── authService.ts
│   ├── userService.ts
│   └── gameService.ts
├── models/              # Modelos de dados
│   ├── User.ts
│   ├── Game.ts
│   └── Component.ts
├── routes/              # Definição de rotas
│   ├── auth.ts
│   ├── users.ts
│   └── games.ts
├── middleware/          # Middleware
│   ├── auth.ts
│   ├── validation.ts
│   └── errorHandler.ts
└── utils/               # Funções utilitárias
    ├── database.ts
    ├── validation.ts
    └── helpers.ts
```

### **Padrões de API**
```typescript
// controllers/gameController.ts
import { Request, Response } from 'express';
import { GameService } from '../services/gameService';

export class GameController {
  private gameService: GameService;

  constructor() {
    this.gameService = new GameService();
  }

  async createGame(req: Request, res: Response): Promise<void> {
    try {
      const { userId, gameData } = req.body;
      const game = await this.gameService.createGame(userId, gameData);
      res.status(201).json({
        success: true,
        data: game
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getGame(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const game = await this.gameService.getGame(gameId);
      res.status(200).json({
        success: true,
        data: game
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }
}
```

### **Middleware de Autenticação**
```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }
    req.user = user;
    next();
  });
};
```

---

## ⛓️ **Desenvolvimento Blockchain**

### **Stack Tecnológico**
- **Solana**: Blockchain
- **Rust**: Linguagem de contratos
- **Anchor**: Framework de desenvolvimento
- **@solana/web3.js**: Cliente JavaScript
- **Metaplex**: Padrão NFT

### **Estrutura de Contratos**
```
contracts/
├── programs/
│   └── engineering-forge/
│       ├── src/
│       │   └── lib.rs
│       ├── Cargo.toml
│       └── Anchor.toml
├── tests/
│   └── engineering-forge.ts
└── app/
    └── src/
        └── components/
            └── WalletConnection.tsx
```

### **Smart Contract Example**
```rust
// programs/engineering-forge/src/lib.rs
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod engineering_forge {
    use super::*;

    pub fn mint_certificate(
        ctx: Context<MintCertificate>,
        course_id: String,
        user_id: String,
        metadata_uri: String,
    ) -> Result<()> {
        let certificate = &mut ctx.accounts.certificate;
        certificate.course_id = course_id;
        certificate.user_id = user_id;
        certificate.metadata_uri = metadata_uri;
        certificate.issuer = ctx.accounts.authority.key();
        certificate.issue_date = Clock::get()?.unix_timestamp;
        certificate.is_verified = true;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(course_id: String, user_id: String)]
pub struct MintCertificate<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 4 + course_id.len() + 4 + user_id.len() + 4 + 256 + 8 + 1
    )]
    pub certificate: Account<'info, Certificate>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Certificate {
    pub course_id: String,
    pub user_id: String,
    pub metadata_uri: String,
    pub issuer: Pubkey,
    pub issue_date: i64,
    pub is_verified: bool,
}
```

### **Integração Frontend**
```typescript
// services/blockchainService.ts
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

export class BlockchainService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(
      process.env.REACT_APP_SOLANA_RPC_URL!,
      'confirmed'
    );
  }

  async mintCertificate(
    wallet: WalletContextState,
    courseId: string,
    userId: string,
    metadataUri: string
  ): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    // Criar transação de minting
    const transaction = new Transaction();
    
    // Adicionar instruções
    // ... lógica de minting

    // Assinar e enviar transação
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    return signature;
  }
}
```

---

## 🧪 **Testes**

### **Testes Frontend**
```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button variant="primary" size="md" onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button variant="primary" size="md" onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button variant="primary" size="md" onClick={() => {}} disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### **Testes Backend**
```typescript
// tests/gameController.test.ts
import request from 'supertest';
import { app } from '../src/app';

describe('Game Controller', () => {
  it('should create a new game', async () => {
    const gameData = {
      userId: 'user123',
      title: 'Test Game',
      components: []
    };

    const response = await request(app)
      .post('/api/games')
      .send(gameData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Test Game');
  });

  it('should return 404 for non-existent game', async () => {
    const response = await request(app)
      .get('/api/games/non-existent')
      .expect(404);

    expect(response.body.success).toBe(false);
  });
});
```

### **Testes Blockchain**
```typescript
// tests/engineering-forge.ts
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { EngineeringForge } from '../target/types/engineering_forge';

describe('engineering-forge', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.EngineeringForge as Program<EngineeringForge>;

  it('mints a certificate', async () => {
    const courseId = 'course123';
    const userId = 'user123';
    const metadataUri = 'https://arweave.net/...';

    const [certificatePDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('certificate'), Buffer.from(courseId), Buffer.from(userId)],
      program.programId
    );

    await program.methods
      .mintCertificate(courseId, userId, metadataUri)
      .accounts({
        certificate: certificatePDA,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const certificate = await program.account.certificate.fetch(certificatePDA);
    expect(certificate.courseId).toBe(courseId);
    expect(certificate.userId).toBe(userId);
  });
});
```

---

## 🔧 **Ferramentas de Desenvolvimento**

### **VS Code Extensions**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "rust-lang.rust-analyzer",
    "coral-xyz.anchor"
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
npm run test:watch   # Testes em modo watch

# Backend
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run test         # Testes
npm run test:watch   # Testes em modo watch
npm run migrate      # Migrações do banco

# Blockchain
anchor build         # Build dos contratos
anchor test          # Testes dos contratos
anchor deploy        # Deploy dos contratos
solana-test-validator # Validator local
```

---

## 📚 **Padrões e Convenções**

### **Convenções de Código**
- **TypeScript**: Sempre use tipos explícitos
- **React**: Use hooks e componentes funcionais
- **CSS**: Use Tailwind CSS classes
- **Commits**: Use conventional commits
- **Naming**: Use camelCase para variáveis, PascalCase para componentes

### **Estrutura de Commits**
```
feat: add new component system
fix: resolve physics calculation bug
docs: update API documentation
style: format code with prettier
refactor: improve component structure
test: add unit tests for physics
chore: update dependencies
```

### **Estrutura de Branches**
```
main                 # Branch principal
develop             # Branch de desenvolvimento
feature/TASK-XXX    # Features
bugfix/TASK-XXX     # Bug fixes
hotfix/TASK-XXX     # Hot fixes
release/v1.0.0      # Releases
```

---

## 🚀 **Deploy e CI/CD**

### **GitHub Actions**
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### **Deploy Frontend (Vercel)**
```bash
# Deploy automático
git push origin main

# Deploy manual
vercel --prod
```

### **Deploy Backend (Railway)**
```bash
# Deploy automático
git push origin main

# Deploy manual
railway up
```

---

## 📞 **Suporte e Recursos**

### **Documentação**
- **Projeto**: [docs.guildeng.com/EngineeringForge](https://docs.guildeng.com/EngineeringForge)
- **API**: [api.engineeringforge.guildeng.com/docs](https://api.engineeringforge.guildeng.com/docs)
- **Blockchain**: [Solana Docs](https://docs.solana.com/)

### **Comunidade**
- **Discord**: [Engineering Guild Discord](https://discord.gg/engineeringguild)
- **GitHub**: [Repository](https://github.com/engineeringguild/engineering-forge)
- **Twitter**: [@engineeringguild](https://twitter.com/engineeringguild)

### **Suporte Técnico**
- **Issues**: [GitHub Issues](https://github.com/engineeringguild/engineering-forge/issues)
- **Email**: dev-support@engineeringforge.guildeng.com
- **Discord**: #dev-support channel

---

*Este guia é atualizado regularmente. Última atualização: Janeiro 2025*

**Status**: 🟢 **ATIVO** | **Versão**: 1.0 | **Próxima Revisão**: Fevereiro 2025
