# Development Workflow

**File Path**: `docs/specifications/development-workflow.md`  
**Document Type**: Technical Design Document - Development Workflow Section  
**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Complete  

---

## 🔄 Git Workflow & Branching Strategy

### **Branch Naming Convention**
```typescript
// workflow/git-workflow.ts
export interface GitWorkflow {
  branches: BranchStrategy;
  commits: CommitStrategy;
  reviews: ReviewStrategy;
  releases: ReleaseStrategy;
}

export const GIT_WORKFLOW: GitWorkflow = {
  branches: {
    main: 'main',                    // Production-ready code
    develop: 'develop',              // Integration branch
    feature: 'feature/',             // New features
    bugfix: 'bugfix/',              // Bug fixes
    hotfix: 'hotfix/',              // Critical production fixes
    release: 'release/'             // Release preparation
  },
  commits: {
    types: ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
    format: '<type>(<scope>): <description>',
    maxLength: 72
  },
  reviews: {
    required: true,
    minApprovals: 2,
    autoMerge: false,
    deleteAfterMerge: true
  },
  releases: {
    versioning: 'semantic',
    changelog: true,
    tagging: true
  }
};
```

### **Branch Protection Rules**
```yaml
# .github/branch-protection.yml
# Main branch protection
branches:
  - name: main
    protection:
      required_status_checks:
        strict: true
        contexts:
          - "Code Quality"
          - "Security Scan"
          - "Unit Tests"
          - "Integration Tests"
          - "E2E Tests"
          - "Performance Tests"
      
      required_pull_request_reviews:
        required_approving_review_count: 2
        dismiss_stale_reviews: true
        require_code_owner_reviews: true
        require_last_push_approval: true
      
      enforce_admins: true
      allow_force_pushes: false
      allow_deletions: false
      block_creations: true
      required_conversation_resolution: true

  - name: develop
    protection:
      required_status_checks:
        strict: true
        contexts:
          - "Code Quality"
          - "Security Scan"
          - "Unit Tests"
          - "Integration Tests"
      
      required_pull_request_reviews:
        required_approving_review_count: 1
        dismiss_stale_reviews: true
      
      enforce_admins: false
      allow_force_pushes: false
      allow_deletions: false
      required_conversation_resolution: true
```

---

## 📝 Code Quality Standards

### **ESLint Configuration**
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": [
    "@typescript-eslint",
    "import",
    "prefer-arrow",
    "unicorn"
  ],
  "rules": {
    // TypeScript specific rules
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-readonly": "warn",
    
    // Import rules
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],
    
    // Code quality rules
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-template": "error",
    
    // Performance rules
    "prefer-arrow-callback": "error",
    "no-loop-func": "error",
    
    // Security rules
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error"
  },
  "overrides": [
    {
      "files": ["*.test.ts", "*.spec.ts"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off"
      }
    }
  ]
}
```

### **Prettier Configuration**
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": true,
  "proseWrap": "preserve"
}
```

---

## 🧪 Testing Standards & Coverage

### **Testing Configuration**
```typescript
// workflow/testing-standards.ts
export interface TestingStandards {
  unit: UnitTestingStandards;
  integration: IntegrationTestingStandards;
  e2e: EndToEndTestingStandards;
  coverage: CoverageStandards;
}

export const TESTING_STANDARDS: TestingStandards = {
  unit: {
    framework: 'Jest',
    coverage: 90,
    patterns: ['AAA Pattern', 'Given-When-Then'],
    naming: 'describe("Component", () => { it("should do something", () => {}) })'
  },
  integration: {
    framework: 'Jest + Supertest',
    coverage: 80,
    patterns: ['Database Integration', 'API Testing', 'External Services'],
    naming: 'describe("API Integration", () => { it("should handle request", () => {}) })'
  },
  e2e: {
    framework: 'Playwright',
    coverage: 70,
    patterns: ['User Journey Testing', 'Critical Path Testing'],
    naming: 'test("user can complete crafting flow", async ({ page }) => {})'
  },
  coverage: {
    thresholds: {
      global: {
        branches: 80,
        functions: 85,
        lines: 90,
        statements: 90
      }
    },
    exclude: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/coverage/**',
      '**/dist/**',
      '**/node_modules/**'
    ]
  }
};
```

### **Jest Configuration**
```typescript
// jest.config.ts
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true
};

export default config;
```

---

## 🔍 Code Review Process

### **Pull Request Template**
```markdown
<!-- .github/pull_request_template.md -->
## 📋 Pull Request Description

### **Type of Change**
- [ ] 🚀 New feature
- [ ] 🐛 Bug fix
- [ ] 📚 Documentation update
- [ ] 🎨 Style/UI improvement
- [ ] ♻️ Code refactoring
- [ ] ✅ Test addition/update
- [ ] 🔧 Configuration change

### **Related Issues**
Closes #(issue number)
Related to #(issue number)

### **Description**
Provide a clear and concise description of the changes made.

### **Changes Made**
- [ ] Change 1
- [ ] Change 2
- [ ] Change 3

### **Testing**
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

### **Code Quality**
- [ ] Code follows project style guidelines
- [ ] ESLint rules satisfied
- [ ] TypeScript types properly defined
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Performance considerations addressed

### **Documentation**
- [ ] Code comments added where necessary
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Changelog entry added

### **Security**
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] SQL injection prevented

### **Checklist**
- [ ] Self-review completed
- [ ] Code follows project architecture
- [ ] Dependencies are minimal and justified
- [ ] Breaking changes documented
- [ ] Migration guide provided if needed

### **Screenshots/Videos**
If applicable, add screenshots or videos to demonstrate the changes.

---

## 🔄 CI/CD Pipeline Integration

### **GitHub Actions Workflow**
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop, feature/*, bugfix/*, hotfix/*]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: engineering-forge

jobs:
  # Code Quality & Linting
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

      - name: Run TypeScript check
        run: npm run type-check

  # Testing
  test:
    name: Testing
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  # Security Scanning
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run SAST scan
        uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

      - name: Run dependency scan
        run: npm audit --audit-level moderate

      - name: Run container scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'

  # Build & Package
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [quality, test, security]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Build Docker images
        run: |
          docker build -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ github.sha }} ./frontend
          docker build -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:${{ github.sha }} ./backend

      - name: Push Docker images
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Deploy to Staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    environment: staging
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Deploy to staging
        run: |
          kubectl config use-context staging
          kubectl apply -f k8s/staging/
          kubectl set image deployment/frontend frontend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ github.sha }}

  # Deploy to Production
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, deploy-staging]
    environment: production
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          kubectl config use-context production
          kubectl apply -f k8s/production/
          kubectl set image deployment/frontend frontend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ github.sha }}
```

---

## 📚 Documentation Standards

### **Code Documentation Requirements**
```typescript
// workflow/documentation-standards.ts
export interface DocumentationStandards {
  code: CodeDocumentation;
  api: APIDocumentation;
  architecture: ArchitectureDocumentation;
  user: UserDocumentation;
}

export const DOCUMENTATION_STANDARDS: DocumentationStandards = {
  code: {
    required: ['JSDoc for functions', 'README for modules', 'Inline comments for complex logic'],
    format: 'JSDoc standard',
    examples: 'Required for public APIs',
    updates: 'Must be updated with code changes'
  },
  api: {
    required: ['OpenAPI/Swagger specs', 'Endpoint documentation', 'Request/response examples'],
    format: 'OpenAPI 3.0',
    examples: 'Required for all endpoints',
    updates: 'Must be updated with API changes'
  },
  architecture: {
    required: ['System diagrams', 'Component descriptions', 'Data flow documentation'],
    format: 'Mermaid diagrams + Markdown',
    updates: 'Must be updated with architectural changes'
  },
  user: {
    required: ['User guides', 'Tutorials', 'FAQ', 'Troubleshooting'],
    format: 'Markdown + screenshots',
    updates: 'Must be updated with feature changes'
  }
};
```

### **JSDoc Template**
```typescript
/**
 * Calculates the crafting success rate based on user skills and material quality.
 * 
 * @param userSkills - The user's current skill levels
 * @param materialQuality - The quality of materials being used
 * @param toolQuality - The quality of tools being used
 * @param difficulty - The difficulty level of the crafting project
 * 
 * @returns A number between 0 and 1 representing the success probability
 * 
 * @example
 * ```typescript
 * const successRate = calculateCraftingSuccessRate(
 *   { forging: 75, metallurgy: 60 },
 *   'rare',
 *   'epic',
 *   5
 * );
 * console.log(`Success rate: ${(successRate * 100).toFixed(1)}%`);
 * ```
 * 
 * @throws {Error} When user skills are invalid
 * 
 * @since 1.0.0
 * @author Engineering Forge Team
 */
export function calculateCraftingSuccessRate(
  userSkills: UserSkills,
  materialQuality: MaterialQuality,
  toolQuality: ToolQuality,
  difficulty: number
): number {
  // Implementation details...
}
```

---

## 🚀 Development Environment Setup

### **Development Environment Requirements**
```typescript
// workflow/dev-environment.ts
export interface DevelopmentEnvironment {
  system: SystemRequirements;
  tools: DevelopmentTools;
  services: LocalServices;
  configuration: EnvironmentConfig;
}

export const DEV_ENVIRONMENT: DevelopmentEnvironment = {
  system: {
    os: ['macOS 12+', 'Ubuntu 20.04+', 'Windows 11+'],
    memory: '16GB RAM minimum',
    storage: '50GB free space',
    cpu: '4 cores minimum'
  },
  tools: {
    editor: ['VS Code', 'IntelliJ IDEA', 'Vim/Neovim'],
    node: '18.x LTS',
    npm: '9.x',
    git: '2.30+',
    docker: '20.10+',
    kubectl: '1.25+'
  },
  services: {
    database: 'PostgreSQL 15+',
    cache: 'Redis 7+',
    messageQueue: 'RabbitMQ 3.9+',
    blockchain: 'Solana Test Validator'
  },
  configuration: {
    environment: '.env.local',
    database: 'engineering_forge_dev',
    ports: {
      frontend: 3000,
      backend: 3001,
      database: 5432,
      redis: 6379
    }
  }
};
```

### **Docker Compose for Development**
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # Frontend Development
  frontend-dev:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - REACT_APP_API_URL=http://localhost:3001
      - REACT_APP_WS_URL=ws://localhost:3001
    depends_on:
      - backend-dev

  # Backend Development
  backend-dev:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@postgres-dev:5432/engineering_forge_dev
      - REDIS_URL=redis://redis-dev:6379
      - JWT_SECRET=dev-secret-key
      - BLOCKCHAIN_RPC_URL=https://api.devnet.solana.com
    depends_on:
      - postgres-dev
      - redis-dev
      - rabbitmq-dev

  # Database Development
  postgres-dev:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=engineering_forge_dev
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql

  # Redis Development
  redis-dev:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data

  # RabbitMQ Development
  rabbitmq-dev:
    image: rabbitmq:3.9-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=user
      - RABBITMQ_DEFAULT_PASS=pass
    volumes:
      - rabbitmq_dev_data:/var/lib/rabbitmq

  # Solana Test Validator
  solana-test-validator:
    image: solanalabs/solana:stable
    ports:
      - "8899:8899"
      - "8900:8900"
    command: solana-test-validator --rpc-port 8899 --rpc-bind-address 0.0.0.0

volumes:
  postgres_dev_data:
  redis_dev_data:
  rabbitmq_dev_data:
```

---

## 🔒 Security & Compliance

### **Security Checklist**
```typescript
// workflow/security-checklist.ts
export interface SecurityChecklist {
  code: CodeSecurity;
  dependencies: DependencySecurity;
  infrastructure: InfrastructureSecurity;
  deployment: DeploymentSecurity;
}

export const SECURITY_CHECKLIST: SecurityChecklist = {
  code: {
    required: [
      'Input validation implemented',
      'SQL injection prevented',
      'XSS protection enabled',
      'CSRF protection enabled',
      'Authentication required for protected routes',
      'Authorization checks implemented',
      'No hardcoded secrets',
      'Error messages don\'t expose sensitive information'
    ],
    review: 'Security review required for all changes'
  },
  dependencies: {
    required: [
      'Regular dependency updates',
      'Security vulnerability scanning',
      'License compliance check',
      'Minimal dependency footprint'
    ],
    tools: ['npm audit', 'Snyk', 'Dependabot']
  },
  infrastructure: {
    required: [
      'Network segmentation',
      'Firewall rules configured',
      'SSL/TLS encryption',
      'Access control lists',
      'Monitoring and alerting'
    ],
    review: 'Infrastructure changes require security review'
  },
  deployment: {
    required: [
      'Secrets management',
      'Environment isolation',
      'Rollback procedures',
      'Security testing in staging'
    ],
    tools: ['HashiCorp Vault', 'Kubernetes Secrets']
  }
};
```

---

## 📋 Development Workflow Checklist

### **Pre-Development**
- [ ] **Environment Setup**
  - [ ] Development environment configured
  - [ ] Required tools installed
  - [ ] Local services running
  - [ ] Environment variables set

- [ ] **Project Understanding**
  - [ ] Requirements reviewed
  - [ ] Architecture understood
  - [ ] Dependencies identified
  - [ ] Testing strategy planned

### **During Development**
- [ ] **Code Quality**
  - [ ] ESLint rules followed
  - [ ] Prettier formatting applied
  - [ ] TypeScript types defined
  - [ ] Error handling implemented

- [ ] **Testing**
  - [ ] Unit tests written
  - [ ] Integration tests added
  - [ ] Test coverage maintained
  - [ ] All tests passing

- [ ] **Documentation**
  - [ ] Code comments added
  - [ ] README updated
  - [ ] API docs maintained
  - [ ] Changelog updated

### **Pre-Review**
- [ ] **Self-Review**
  - [ ] Code reviewed personally
  - [ ] Tests run locally
  - [ ] Linting passed
  - [ ] Documentation updated

- [ ] **Quality Checks**
  - [ ] No console.log statements
  - [ ] No hardcoded values
  - [ ] Performance considered
  - [ ] Security reviewed

### **Review Process**
- [ ] **Pull Request**
  - [ ] Clear description written
  - [ ] Related issues linked
  - [ ] Screenshots added if needed
  - [ ] Testing documented

- [ ] **Code Review**
  - [ ] At least 2 approvals
  - [ ] All comments addressed
  - [ ] Tests passing in CI
  - [ ] Security scan passed

### **Post-Review**
- [ ] **Deployment**
  - [ ] Staging deployment successful
  - [ ] Integration tests passed
  - [ ] Performance tests passed
  - [ ] User acceptance testing completed

- [ ] **Production**
  - [ ] Production deployment successful
  - [ ] Monitoring alerts configured
  - [ ] Rollback plan ready
  - [ ] Post-deployment verification

---

## 🎯 Best Practices Summary

### **Code Quality**
- **Consistency**: Follow established patterns and conventions
- **Readability**: Write self-documenting code with clear naming
- **Maintainability**: Keep functions small and focused
- **Testability**: Write testable code with dependency injection

### **Security**
- **Defense in Depth**: Implement multiple security layers
- **Principle of Least Privilege**: Grant minimal necessary access
- **Input Validation**: Validate all external inputs
- **Secure by Default**: Use secure configurations by default

### **Performance**
- **Efficiency**: Optimize algorithms and data structures
- **Caching**: Implement appropriate caching strategies
- **Monitoring**: Track performance metrics continuously
- **Profiling**: Identify and fix performance bottlenecks

### **Collaboration**
- **Communication**: Clear and frequent communication
- **Documentation**: Keep documentation up-to-date
- **Code Reviews**: Thorough and constructive reviews
- **Knowledge Sharing**: Share knowledge across the team

---

*This document provides comprehensive development workflow specifications for the Engineering Forge project. All development practices are designed to ensure high code quality, security, and maintainability while fostering effective team collaboration.*
