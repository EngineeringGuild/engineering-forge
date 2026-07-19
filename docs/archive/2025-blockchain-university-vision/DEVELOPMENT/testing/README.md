# 🧪 Engineering Forge - Testing

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: 🚀 **ATIVO**

---

## 🎯 **Visão Geral**

Estratégia abrangente de testes para o Engineering Forge, incluindo testes
unitários, integração, E2E e de performance.

---

## 📋 **Estratégia de Testes**

### **Pirâmide de Testes**

```
        ┌─────────────────┐
        │   E2E Tests     │ ← Poucos, lentos, caros
        │   (Playwright)  │
        ├─────────────────┤
        │ Integration     │ ← Alguns, médios
        │ Tests           │
        ├─────────────────┤
        │   Unit Tests    │ ← Muitos, rápidos, baratos
        │   (Jest)        │
        └─────────────────┘
```

### **Tipos de Testes**

1. **Unit Tests**: Testes de unidades individuais
2. **Integration Tests**: Testes de integração entre componentes
3. **E2E Tests**: Testes end-to-end da aplicação
4. **Performance Tests**: Testes de performance
5. **Visual Tests**: Testes de regressão visual

---

## 🧪 **Frontend Testing**

### **Stack de Testes**

- **Framework**: Jest
- **Testing Library**: React Testing Library
- **E2E**: Playwright
- **Visual**: Chromatic
- **Coverage**: Jest Coverage

### **Estrutura de Testes**

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.stories.tsx
├── pages/
│   ├── Home/
│   │   ├── Home.tsx
│   │   ├── Home.test.tsx
│   │   └── Home.integration.test.tsx
└── __tests__/
    ├── setup.ts
    ├── utils.ts
    └── e2e/
        ├── auth.spec.ts
        └── game.spec.ts
```

### **Exemplo de Teste Unitário**

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');
  });
});
```

### **Exemplo de Teste de Integração**

```typescript
// GameEngine.integration.test.tsx
import { render, screen } from '@testing-library/react';
import { GameEngine } from './GameEngine';
import { GameProvider } from '../context/GameContext';

describe('GameEngine Integration', () => {
  it('renders game components together', () => {
    render(
      <GameProvider>
        <GameEngine />
      </GameProvider>
    );

    expect(screen.getByTestId('game-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('ui-panel')).toBeInTheDocument();
    expect(screen.getByTestId('controls')).toBeInTheDocument();
  });

  it('handles game state updates', async () => {
    render(
      <GameProvider>
        <GameEngine />
      </GameProvider>
    );

    // Simular ação do usuário
    fireEvent.click(screen.getByTestId('start-button'));

    // Verificar mudança de estado
    await waitFor(() => {
      expect(screen.getByTestId('game-status')).toHaveTextContent('Playing');
    });
  });
});
```

---

## ⚙️ **Backend Testing**

### **Stack de Testes**

- **Framework**: Jest
- **HTTP Testing**: Supertest
- **Database**: MongoDB Memory Server
- **Mocking**: Jest mocks
- **Coverage**: Jest Coverage

### **Estrutura de Testes**

```
src/
├── controllers/
│   ├── authController.ts
│   └── authController.test.ts
├── services/
│   ├── userService.ts
│   └── userService.test.ts
├── models/
│   ├── User.ts
│   └── User.test.ts
└── __tests__/
    ├── setup.ts
    ├── fixtures/
    └── integration/
        ├── auth.integration.test.ts
        └── game.integration.test.ts
```

### **Exemplo de Teste de API**

```typescript
// authController.test.ts
import request from 'supertest';
import { app } from '../app';
import { connectDB, disconnectDB } from '../config/database';

describe('Auth Controller', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
```

---

## 🎮 **Game Testing**

### **Testes de Mecânicas de Jogo**

- **Physics**: Testes de física e colisões
- **Game Logic**: Testes de lógica do jogo
- **User Input**: Testes de entrada do usuário
- **State Management**: Testes de estado do jogo

### **Exemplo de Teste de Física**

```typescript
// physics.test.ts
import { PhysicsEngine } from '../game/physics/PhysicsEngine';
import { GameObject } from '../game/objects/GameObject';

describe('PhysicsEngine', () => {
  let physics: PhysicsEngine;

  beforeEach(() => {
    physics = new PhysicsEngine();
  });

  it('should handle collision detection', () => {
    const object1 = new GameObject({ x: 0, y: 0, width: 10, height: 10 });
    const object2 = new GameObject({ x: 5, y: 5, width: 10, height: 10 });

    physics.addObject(object1);
    physics.addObject(object2);

    physics.update(16); // 60 FPS

    expect(physics.checkCollision(object1, object2)).toBe(true);
  });

  it('should apply gravity correctly', () => {
    const object = new GameObject({ x: 0, y: 0, velocityY: 0 });

    physics.addObject(object);
    physics.update(16);

    expect(object.velocityY).toBeGreaterThan(0);
  });
});
```

---

## 🎭 **E2E Testing**

### **Playwright Setup**

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ]
});
```

### **Exemplo de Teste E2E**

```typescript
// e2e/game.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Game Flow', () => {
  test('should complete a full game session', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navigate to game
    await expect(page).toHaveURL('/dashboard');
    await page.click('[data-testid="start-game"]');

    // Game interaction
    await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
    await page.click('[data-testid="game-canvas"]', {
      position: { x: 100, y: 100 }
    });

    // Verify game state
    await expect(page.locator('[data-testid="score"]')).toContainText('100');
  });

  test('should handle game errors gracefully', async ({ page }) => {
    await page.goto('/game');

    // Simulate error
    await page.route('**/api/game/state', route => route.abort());

    await page.click('[data-testid="start-game"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
```

---

## 📊 **Performance Testing**

### **Lighthouse CI**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run lighthouse:ci
```

### **Exemplo de Teste de Performance**

```typescript
// performance.test.ts
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load page within 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test('should maintain 60 FPS during gameplay', async ({ page }) => {
    await page.goto('/game');

    const fps = await page.evaluate(() => {
      return new Promise(resolve => {
        let frames = 0;
        const start = performance.now();

        function countFrames() {
          frames++;
          if (performance.now() - start < 1000) {
            requestAnimationFrame(countFrames);
          } else {
            resolve(frames);
          }
        }

        requestAnimationFrame(countFrames);
      });
    });

    expect(fps).toBeGreaterThan(55);
  });
});
```

---

## 🎨 **Visual Testing**

### **Chromatic Setup**

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@chromatic-com/storybook'],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  }
};

export default config;
```

### **Exemplo de Story**

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger']
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
};
```

---

## 📈 **Coverage e Métricas**

### **Configuração de Coverage**

```json
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### **Métricas de Qualidade**

- **Coverage**: >80% para código novo
- **Performance**: <2s load time
- **Accessibility**: WCAG 2.1 AA
- **Security**: Sem vulnerabilidades

---

## 🔧 **Ferramentas de Teste**

### **Desenvolvimento**

- **Jest**: Framework de testes
- **React Testing Library**: Testes de componentes
- **Playwright**: Testes E2E
- **Chromatic**: Testes visuais

### **CI/CD**

- **GitHub Actions**: Automação
- **Lighthouse CI**: Performance
- **Coverage**: Relatórios de cobertura
- **Reports**: Relatórios de testes

---

## 📚 **Recursos de Teste**

### **Documentação**

- **[Implementation](../implementation/README.md)** - Guias de implementação
- **[Architecture](../architecture/README.md)** - Arquitetura do sistema
- **[Quality Checklist](../../specifications/QUALITY-CHECKLIST.md)** - Checklist
  de qualidade

### **Ferramentas**

- **Testing Library**: Documentação oficial
- **Playwright**: Guias e tutoriais
- **Jest**: Documentação e exemplos
- **Chromatic**: Setup e uso

---

## 🎯 **Próximos Passos**

### **Imediato**

1. Configurar ambiente de testes
2. Implementar testes unitários básicos
3. Criar testes de integração
4. Configurar CI/CD

### **Curto Prazo**

1. Implementar testes E2E
2. Adicionar testes de performance
3. Configurar testes visuais
4. Alcançar 80% de cobertura

### **Médio Prazo**

1. Otimizar pipeline de testes
2. Implementar testes automatizados
3. Adicionar testes de segurança
4. Manter qualidade alta

---

## 🔗 **Links Relacionados**

- **[Development](../README.md)** - Domínio de desenvolvimento
- **[Implementation](../implementation/README.md)** - Guias de implementação
- **[Architecture](../architecture/README.md)** - Arquitetura do sistema
- **[Dashboard](../../PROGRESS-DASHBOARD.md)** - Status do projeto

---

_Última atualização: Janeiro 2025_

**Status**: 🟢 **ATIVO** | **Responsável**: QA Team | **Próxima Revisão**:
Fevereiro 2025
