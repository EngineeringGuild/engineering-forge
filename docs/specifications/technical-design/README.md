# ⚙️ Especificações Técnicas - Engineering Forge

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: 🚀 **ATIVO**

---

## 🎯 **Visão Geral**

Este documento contém as especificações técnicas detalhadas para o projeto Engineering Forge. Ele define a arquitetura, tecnologias, padrões e implementações técnicas necessárias para o desenvolvimento.

### **Objetivo**
Fornecer especificações técnicas claras e detalhadas para todos os desenvolvedores e stakeholders técnicos.

### **Público-Alvo**
- **Desenvolvedores**: Frontend, Backend, Blockchain
- **Arquitetos**: Arquitetos de software
- **DevOps**: Engenheiros de infraestrutura
- **QA**: Engenheiros de qualidade

---

## 🏗️ **Arquitetura do Sistema**

### **Arquitetura Geral**
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/TS)                     │
├─────────────────────────────────────────────────────────────┤
│                    Backend (Node.js)                       │
├─────────────────────────────────────────────────────────────┤
│                    Database (MongoDB)                      │
├─────────────────────────────────────────────────────────────┤
│                    Blockchain (Solana)                     │
└─────────────────────────────────────────────────────────────┘
```

### **Arquitetura de Microserviços**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   User      │  │  Content    │  │ Simulation  │  │ Blockchain  │
│  Service    │  │  Service    │  │  Service    │  │  Service    │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
       │                │                │                │
       └────────────────┼────────────────┼────────────────┘
                        │                │
                ┌─────────────┐  ┌─────────────┐
                │   API       │  │   Message   │
                │  Gateway    │  │   Queue     │
                └─────────────┘  └─────────────┘
```

---

## 💻 **Especificações Frontend**

### **Stack Tecnológico**
```json
{
  "framework": "React 18.2.0",
  "language": "TypeScript 5.0.0",
  "build": "Vite 4.0.0",
  "styling": "Tailwind CSS 3.3.0",
  "state": "Zustand 4.4.0",
  "routing": "React Router 6.8.0",
  "3d": "Three.js 0.150.0",
  "physics": "Matter.js 0.19.0",
  "animations": "Framer Motion 10.0.0"
}
```

### **Estrutura de Componentes**
```typescript
// Tipos base
interface BaseComponent {
  id: string;
  name: string;
  type: string;
  props: Record<string, any>;
  children?: React.ReactNode;
}

// Componente de Layout
interface LayoutComponent extends BaseComponent {
  type: 'header' | 'sidebar' | 'main' | 'footer';
  responsive: boolean;
  breakpoints: BreakpointConfig;
}

// Componente de UI
interface UIComponent extends BaseComponent {
  type: 'button' | 'input' | 'modal' | 'dropdown';
  variant: string;
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

// Componente de Jogo
interface GameComponent extends BaseComponent {
  type: 'workspace' | 'component-panel' | 'performance-display';
  gameState: GameState;
  onStateChange: (state: GameState) => void;
}
```

### **Sistema de Estado**
```typescript
// Store principal
interface AppState {
  user: UserState;
  game: GameState;
  ui: UIState;
  auth: AuthState;
}

// Store de usuário
interface UserState {
  currentUser: User | null;
  profile: UserProfile | null;
  preferences: UserPreferences;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Store de jogo
interface GameState {
  currentProject: Project | null;
  components: Component[];
  selectedComponent: Component | null;
  performance: PerformanceMetrics;
  session: GameSession | null;
  isPlaying: boolean;
}

// Store de UI
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  modalOpen: boolean;
  notifications: Notification[];
  loading: boolean;
}
```

### **Sistema de Roteamento**
```typescript
// Rotas principais
const routes = [
  {
    path: '/',
    element: <HomePage />,
    title: 'Home'
  },
  {
    path: '/game',
    element: <GamePage />,
    title: 'Game',
    protected: true
  },
  {
    path: '/courses',
    element: <CoursesPage />,
    title: 'Courses',
    protected: true
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    title: 'Profile',
    protected: true
  },
  {
    path: '/marketplace',
    element: <MarketplacePage />,
    title: 'Marketplace',
    protected: true
  }
];
```

---

## ⚙️ **Especificações Backend**

### **Stack Tecnológico**
```json
{
  "runtime": "Node.js 20.0.0",
  "framework": "Express.js 4.18.0",
  "language": "TypeScript 5.0.0",
  "database": "MongoDB 6.0.0",
  "cache": "Redis 7.0.0",
  "auth": "JWT + bcrypt",
  "validation": "Joi 17.9.0",
  "testing": "Jest 29.0.0"
}
```

### **Arquitetura de APIs**
```typescript
// Estrutura de resposta padrão
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId: string;
}

// Estrutura de erro
interface APIError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

// Middleware de autenticação
interface AuthMiddleware {
  authenticate: (req: Request, res: Response, next: NextFunction) => void;
  authorize: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
  validateToken: (token: string) => Promise<User>;
}
```

### **Modelos de Dados**
```typescript
// Modelo de Usuário
interface User {
  _id: ObjectId;
  email: string;
  username: string;
  passwordHash: string;
  profile: UserProfile;
  preferences: UserPreferences;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Modelo de Projeto
interface Project {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  description: string;
  type: ProjectType;
  category: EngineeringCategory;
  difficulty: DifficultyLevel;
  components: Component[];
  performance: PerformanceMetrics;
  isCompleted: boolean;
  completionTime?: number;
  finalScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Modelo de Componente
interface Component {
  _id: ObjectId;
  name: string;
  type: ComponentType;
  category: ComponentCategory;
  properties: ComponentProperties;
  position: Position;
  rotation: number;
  scale: number;
  isUnlocked: boolean;
  unlockRequirements: UnlockRequirement[];
  cost: number;
  rarity: ComponentRarity;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Serviços de Negócio**
```typescript
// Serviço de Autenticação
class AuthService {
  async register(userData: RegisterUserData): Promise<User>;
  async login(email: string, password: string): Promise<AuthResult>;
  async logout(userId: string): Promise<void>;
  async refreshToken(refreshToken: string): Promise<TokenPair>;
  async resetPassword(email: string): Promise<void>;
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
}

// Serviço de Jogo
class GameService {
  async createProject(userId: string, projectData: CreateProjectData): Promise<Project>;
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project>;
  async deleteProject(projectId: string): Promise<void>;
  async getProject(projectId: string): Promise<Project>;
  async getUserProjects(userId: string): Promise<Project[]>;
  async calculatePerformance(components: Component[]): Promise<PerformanceMetrics>;
}

// Serviço de Componentes
class ComponentService {
  async getComponents(filters?: ComponentFilters): Promise<Component[]>;
  async getComponent(componentId: string): Promise<Component>;
  async unlockComponent(userId: string, componentId: string): Promise<void>;
  async getUnlockedComponents(userId: string): Promise<Component[]>;
  async validateAssembly(components: Component[]): Promise<ValidationResult>;
}
```

---

## ⛓️ **Especificações Blockchain**

### **Stack Tecnológico**
```json
{
  "blockchain": "Solana 1.14.0",
  "language": "Rust 1.70.0",
  "framework": "Anchor 0.28.0",
  "client": "@solana/web3.js 1.78.0",
  "wallets": "Phantom, Solflare",
  "nfts": "Metaplex 0.25.0",
  "storage": "Arweave"
}
```

### **Smart Contracts**
```rust
// Programa principal
#[program]
pub mod engineering_forge {
    use super::*;

    // Mintar certificado
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

    // Transferir certificado
    pub fn transfer_certificate(
        ctx: Context<TransferCertificate>,
        new_owner: Pubkey,
    ) -> Result<()> {
        let certificate = &mut ctx.accounts.certificate;
        certificate.owner = new_owner;
        Ok(())
    }

    // Verificar certificado
    pub fn verify_certificate(
        ctx: Context<VerifyCertificate>,
    ) -> Result<()> {
        let certificate = &mut ctx.accounts.certificate;
        certificate.is_verified = true;
        certificate.verification_count += 1;
        Ok(())
    }
}

// Estruturas de contas
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

// Estrutura de dados
#[account]
pub struct Certificate {
    pub course_id: String,
    pub user_id: String,
    pub metadata_uri: String,
    pub issuer: Pubkey,
    pub owner: Pubkey,
    pub issue_date: i64,
    pub is_verified: bool,
    pub verification_count: u32,
}
```

### **Integração Frontend**
```typescript
// Serviço de Blockchain
class BlockchainService {
  private connection: Connection;
  private program: Program<EngineeringForge>;

  constructor() {
    this.connection = new Connection(
      process.env.REACT_APP_SOLANA_RPC_URL!,
      'confirmed'
    );
    this.program = new Program(
      IDL,
      new PublicKey(process.env.REACT_APP_PROGRAM_ID!)
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

    const [certificatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('certificate'), Buffer.from(courseId), Buffer.from(userId)],
      this.program.programId
    );

    const transaction = await this.program.methods
      .mintCertificate(courseId, userId, metadataUri)
      .accounts({
        certificate: certificatePDA,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    return signature;
  }
}
```

---

## 🗄️ **Especificações de Banco de Dados**

### **MongoDB Schema**
```javascript
// Coleção de Usuários
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

// Coleção de Projetos
db.projects.createIndex({ "userId": 1 });
db.projects.createIndex({ "type": 1 });
db.projects.createIndex({ "category": 1 });
db.projects.createIndex({ "difficulty": 1 });
db.projects.createIndex({ "createdAt": 1 });

// Coleção de Componentes
db.components.createIndex({ "type": 1 });
db.components.createIndex({ "category": 1 });
db.components.createIndex({ "rarity": 1 });
db.components.createIndex({ "isUnlocked": 1 });

// Coleção de Sessões
db.sessions.createIndex({ "userId": 1 });
db.sessions.createIndex({ "token": 1 }, { unique: true });
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
```

### **Relacionamentos**
```typescript
// Relacionamentos principais
interface DatabaseRelations {
  User: {
    projects: Project[];
    sessions: Session[];
    preferences: UserPreferences;
    achievements: Achievement[];
  };
  Project: {
    user: User;
    components: Component[];
    performance: PerformanceMetrics;
    assessments: Assessment[];
  };
  Component: {
    projects: Project[];
    unlockRequirements: UnlockRequirement[];
  };
}
```

---

## 🔒 **Especificações de Segurança**

### **Autenticação e Autorização**
```typescript
// JWT Configuration
interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
  algorithm: 'HS256';
}

// Password Hashing
interface PasswordConfig {
  saltRounds: 12;
  algorithm: 'bcrypt';
}

// CORS Configuration
interface CORSConfig {
  origin: string[];
  credentials: true;
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  allowedHeaders: ['Content-Type', 'Authorization'];
}
```

### **Validação de Dados**
```typescript
// Schemas de validação
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required()
});

const projectSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500),
  type: Joi.string().valid('car', 'bridge', 'circuit', 'structure').required(),
  category: Joi.string().valid('mechanical', 'electrical', 'civil', 'aerospace').required(),
  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').required()
});
```

---

## 🧪 **Especificações de Testes**

### **Estratégia de Testes**
```typescript
// Testes Unitários
interface UnitTestConfig {
  framework: 'Jest';
  coverage: {
    statements: 80;
    branches: 80;
    functions: 80;
    lines: 80;
  };
  files: ['**/*.test.ts', '**/*.spec.ts'];
}

// Testes de Integração
interface IntegrationTestConfig {
  framework: 'Jest + Supertest';
  database: 'MongoDB Memory Server';
  coverage: {
    statements: 70;
    branches: 70;
    functions: 70;
    lines: 70;
  };
}

// Testes E2E
interface E2ETestConfig {
  framework: 'Playwright';
  browsers: ['chromium', 'firefox', 'webkit'];
  coverage: {
    statements: 60;
    branches: 60;
    functions: 60;
    lines: 60;
  };
}
```

### **Testes de Performance**
```typescript
// Configuração de testes de performance
interface PerformanceTestConfig {
  framework: 'Artillery';
  scenarios: {
    load: {
      duration: '5m';
      arrivalRate: 10;
    };
    stress: {
      duration: '10m';
      arrivalRate: 50;
    };
    spike: {
      duration: '2m';
      arrivalRate: 100;
    };
  };
  thresholds: {
    responseTime: 2000;
    errorRate: 0.01;
    throughput: 100;
  };
}
```

---

## 🚀 **Especificações de Deploy**

### **Ambientes**
```yaml
# Desenvolvimento
development:
  frontend:
    url: http://localhost:3000
    build: npm run build
    deploy: npm run dev
  backend:
    url: http://localhost:5000
    build: npm run build
    deploy: npm run dev
  database:
    url: mongodb://localhost:27017/engineering-forge-dev

# Staging
staging:
  frontend:
    url: https://staging.engineeringforge.guildeng.com
    build: npm run build
    deploy: vercel --env staging
  backend:
    url: https://api-staging.engineeringforge.guildeng.com
    build: npm run build
    deploy: railway up --env staging
  database:
    url: mongodb+srv://staging:password@cluster.mongodb.net/engineering-forge-staging

# Produção
production:
  frontend:
    url: https://engineeringforge.guildeng.com
    build: npm run build
    deploy: vercel --prod
  backend:
    url: https://api.engineeringforge.guildeng.com
    build: npm run build
    deploy: railway up --prod
  database:
    url: mongodb+srv://prod:password@cluster.mongodb.net/engineering-forge-prod
```

### **CI/CD Pipeline**
```yaml
# GitHub Actions
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

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
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

  deploy-production:
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
          vercel-args: '--prod'
```

---

## 📊 **Especificações de Monitoramento**

### **Métricas de Aplicação**
```typescript
// Métricas principais
interface ApplicationMetrics {
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
  };
  business: {
    activeUsers: number;
    sessions: number;
    conversions: number;
    revenue: number;
  };
  technical: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkUsage: number;
  };
}
```

### **Logging**
```typescript
// Configuração de logs
interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  format: 'json' | 'text';
  transports: {
    console: boolean;
    file: boolean;
    database: boolean;
  };
  retention: {
    days: 30;
    maxSize: '100MB';
  };
}
```

---

## 📞 **Contatos**

### **Responsáveis Técnicos**
- **Tech Lead**: [A ser definido]
- **Frontend Lead**: [A ser definido]
- **Backend Lead**: [A ser definido]
- **Blockchain Lead**: [A ser definido]
- **DevOps Lead**: [A ser definido]

### **Suporte Técnico**
- **Email**: tech-support@engineeringforge.guildeng.com
- **Discord**: #tech-support channel
- **GitHub**: [Repository Issues](https://github.com/engineeringguild/engineering-forge/issues)

---

*Este documento é atualizado regularmente. Última atualização: Janeiro 2025*

**Status**: 🟢 **ATIVO** | **Versão**: 1.0 | **Próxima Revisão**: Fevereiro 2025
