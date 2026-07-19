# Testing Strategy

**File Path**: `docs/specifications/testing-strategy.md`  
**Document Type**: Technical Design Document - Testing Strategy Section  
**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Complete  

---

## 🧪 Testing Pyramid & Strategy

### **Testing Layers Overview**
```typescript
// testing/testing-strategy.ts
export interface TestingStrategy {
  unit: UnitTestingConfig;
  integration: IntegrationTestingConfig;
  e2e: EndToEndTestingConfig;
  performance: PerformanceTestingConfig;
  security: SecurityTestingConfig;
  blockchain: BlockchainTestingConfig;
}

export const TESTING_STRATEGY: TestingStrategy = {
  unit: {
    coverage: 90,
    frameworks: ['Jest', 'Vitest'],
    focus: ['Business Logic', 'Utility Functions', 'Components']
  },
  integration: {
    coverage: 80,
    frameworks: ['Jest', 'Supertest'],
    focus: ['API Endpoints', 'Database Operations', 'External Services']
  },
  e2e: {
    coverage: 70,
    frameworks: ['Playwright', 'Cypress'],
    focus: ['User Journeys', 'Critical Paths', 'Cross-browser Compatibility']
  },
  performance: {
    frameworks: ['Artillery', 'K6', 'Lighthouse'],
    focus: ['Load Testing', 'Stress Testing', 'Performance Monitoring']
  },
  security: {
    frameworks: ['OWASP ZAP', 'Snyk', 'SonarQube'],
    focus: ['Vulnerability Scanning', 'Penetration Testing', 'Code Security']
  },
  blockchain: {
    frameworks: ['Anchor', 'Solana Test Validator'],
    focus: ['Smart Contract Testing', 'Transaction Validation', 'NFT Operations']
  }
};
```

---

## 🔬 Unit Testing Framework

### **Frontend Component Testing**
```typescript
// tests/unit/components/ForgeComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ForgeComponent } from '@/components/ForgeComponent';
import { ForgeProvider } from '@/contexts/ForgeContext';
import { mockForgeData } from '@/tests/mocks/forgeData';

describe('ForgeComponent', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <ForgeProvider>
        {component}
      </ForgeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render forge interface correctly', () => {
      renderWithProvider(<ForgeComponent data={mockForgeData} />);
      
      expect(screen.getByText('Engineering Forge')).toBeInTheDocument();
      expect(screen.getByTestId('forge-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('tool-panel')).toBeInTheDocument();
    });

    it('should display user resources', () => {
      renderWithProvider(<ForgeComponent data={mockForgeData} />);
      
      expect(screen.getByText('Gold: 1000')).toBeInTheDocument();
      expect(screen.getByText('Materials: 50')).toBeInTheDocument();
      expect(screen.getByText('Experience: 150')).toBeInTheDocument();
    });

    it('should show available tools based on user level', () => {
      const highLevelData = { ...mockForgeData, userLevel: 25 };
      renderWithProvider(<ForgeComponent data={highLevelData} />);
      
      expect(screen.getByText('Advanced Hammer')).toBeInTheDocument();
      expect(screen.getByText('Precision Anvil')).toBeInTheDocument();
      expect(screen.queryByText('Basic Hammer')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle tool selection', () => {
      const onToolSelect = jest.fn();
      renderWithProvider(
        <ForgeComponent 
          data={mockForgeData} 
          onToolSelect={onToolSelect}
        />
      );
      
      const hammerTool = screen.getByTestId('tool-hammer');
      fireEvent.click(hammerTool);
      
      expect(onToolSelect).toHaveBeenCalledWith('hammer');
      expect(hammerTool).toHaveClass('selected');
    });

    it('should handle material placement', () => {
      const onMaterialPlace = jest.fn();
      renderWithProvider(
        <ForgeComponent 
          data={mockForgeData} 
          onMaterialPlace={onMaterialPlace}
        />
      );
      
      const canvas = screen.getByTestId('forge-canvas');
      const material = screen.getByTestId('material-steel');
      
      fireEvent.dragStart(material);
      fireEvent.drop(canvas, { clientX: 100, clientY: 100 });
      
      expect(onMaterialPlace).toHaveBeenCalledWith('steel', { x: 100, y: 100 });
    });

    it('should validate crafting requirements', () => {
      const insufficientData = { 
        ...mockForgeData, 
        resources: { gold: 50, materials: 5 } 
      };
      renderWithProvider(<ForgeComponent data={insufficientData} />);
      
      const craftButton = screen.getByText('Craft Item');
      fireEvent.click(craftButton);
      
      expect(screen.getByText('Insufficient resources')).toBeInTheDocument();
      expect(craftButton).toBeDisabled();
    });
  });

  describe('State Management', () => {
    it('should update forge state on actions', () => {
      const { rerender } = renderWithProvider(
        <ForgeComponent data={mockForgeData} />
      );
      
      // Initial state
      expect(screen.getByTestId('forge-temperature')).toHaveTextContent('0°C');
      
      // Heat forge
      const heatButton = screen.getByText('Heat Forge');
      fireEvent.click(heatButton);
      
      rerender(<ForgeComponent data={{ ...mockForgeData, temperature: 500 }} />);
      expect(screen.getByTestId('forge-temperature')).toHaveTextContent('500°C');
    });

    it('should persist user progress', () => {
      const onProgressSave = jest.fn();
      renderWithProvider(
        <ForgeComponent 
          data={mockForgeData} 
          onProgressSave={onProgressSave}
        />
      );
      
      // Perform actions
      const heatButton = screen.getByText('Heat Forge');
      fireEvent.click(heatButton);
      
      // Auto-save should trigger
      expect(onProgressSave).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: expect.any(Number),
          lastAction: 'heat_forge'
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      const errorData = { ...mockForgeData, error: 'Network error' };
      renderWithProvider(<ForgeComponent data={errorData} />);
      
      expect(screen.getByText('Connection error. Retrying...')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should show validation errors', () => {
      renderWithProvider(<ForgeComponent data={mockForgeData} />);
      
      const invalidMaterial = screen.getByTestId('material-invalid');
      fireEvent.click(invalidMaterial);
      
      expect(screen.getByText('Invalid material selected')).toBeInTheDocument();
    });
  });
});
```

### **Backend Service Testing**
```typescript
// tests/unit/services/ForgeService.test.ts
import { ForgeService } from '@/services/ForgeService';
import { ForgeRepository } from '@/repositories/ForgeRepository';
import { mockForgeData, mockUserData } from '@/tests/mocks';

jest.mock('@/repositories/ForgeRepository');
jest.mock('@/services/BlockchainService');

describe('ForgeService', () => {
  let forgeService: ForgeService;
  let mockForgeRepository: jest.Mocked<ForgeRepository>;

  beforeEach(() => {
    mockForgeRepository = new ForgeRepository() as jest.Mocked<ForgeRepository>;
    forgeService = new ForgeService(mockForgeRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Crafting Operations', () => {
    it('should craft item successfully with valid materials', async () => {
      const craftingRequest = {
        userId: 'user123',
        itemType: 'sword',
        materials: ['steel', 'iron'],
        quality: 'rare'
      };

      mockForgeRepository.getUserResources.mockResolvedValue({
        gold: 1000,
        materials: { steel: 10, iron: 15 }
      });

      mockForgeRepository.craftItem.mockResolvedValue({
        id: 'item456',
        type: 'sword',
        quality: 'rare',
        stats: { damage: 45, durability: 100 }
      });

      const result = await forgeService.craftItem(craftingRequest);

      expect(result.success).toBe(true);
      expect(result.item.type).toBe('sword');
      expect(result.item.quality).toBe('rare');
      expect(mockForgeRepository.craftItem).toHaveBeenCalledWith(craftingRequest);
    });

    it('should fail crafting with insufficient materials', async () => {
      const craftingRequest = {
        userId: 'user123',
        itemType: 'sword',
        materials: ['steel', 'iron'],
        quality: 'rare'
      };

      mockForgeRepository.getUserResources.mockResolvedValue({
        gold: 1000,
        materials: { steel: 2, iron: 1 }
      });

      const result = await forgeService.craftItem(craftingRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient materials');
      expect(mockForgeRepository.craftItem).not.toHaveBeenCalled();
    });

    it('should calculate crafting success rate based on user skill', async () => {
      const craftingRequest = {
        userId: 'user123',
        itemType: 'sword',
        materials: ['steel', 'iron'],
        quality: 'rare'
      };

      mockForgeRepository.getUserSkills.mockResolvedValue({
        forging: 75,
        metallurgy: 60,
        craftsmanship: 80
      });

      mockForgeRepository.getUserResources.mockResolvedValue({
        gold: 1000,
        materials: { steel: 10, iron: 15 }
      });

      const result = await forgeService.craftItem(craftingRequest);

      expect(result.success).toBe(true);
      expect(result.successRate).toBeGreaterThan(0.7);
    });
  });

  describe('Resource Management', () => {
    it('should deduct resources after successful crafting', async () => {
      const craftingRequest = {
        userId: 'user123',
        itemType: 'sword',
        materials: ['steel', 'iron'],
        quality: 'rare'
      };

      mockForgeRepository.getUserResources.mockResolvedValue({
        gold: 1000,
        materials: { steel: 10, iron: 15 }
      });

      mockForgeRepository.craftItem.mockResolvedValue({
        id: 'item456',
        type: 'sword',
        quality: 'rare'
      });

      await forgeService.craftItem(craftingRequest);

      expect(mockForgeRepository.updateUserResources).toHaveBeenCalledWith(
        'user123',
        {
          gold: 800, // 1000 - 200 crafting cost
          materials: { steel: 7, iron: 12 } // 10-3, 15-3
        }
      );
    });

    it('should handle resource overflow correctly', async () => {
      const addResourcesRequest = {
        userId: 'user123',
        resources: { gold: 500, materials: { steel: 20 } }
      };

      mockForgeRepository.getUserResources.mockResolvedValue({
        gold: 950,
        materials: { steel: 95 }
      });

      await forgeService.addResources(addResourcesRequest);

      expect(mockForgeRepository.updateUserResources).toHaveBeenCalledWith(
        'user123',
        {
          gold: 1000, // Capped at max
          materials: { steel: 100 } // Capped at max
        }
      );
    });
  });

  describe('Experience & Leveling', () => {
    it('should award experience for successful crafting', async () => {
      const craftingRequest = {
        userId: 'user123',
        itemType: 'sword',
        materials: ['steel', 'iron'],
        quality: 'rare'
      };

      mockForgeRepository.getUserSkills.mockResolvedValue({
        forging: 50,
        metallurgy: 40,
        craftsmanship: 45
      });

      mockForgeRepository.getUserResources.mockResolvedValue({
        gold: 1000,
        materials: { steel: 10, iron: 15 }
      });

      mockForgeRepository.craftItem.mockResolvedValue({
        id: 'item456',
        type: 'sword',
        quality: 'rare'
      });

      await forgeService.craftItem(craftingRequest);

      expect(mockForgeRepository.addExperience).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({
          forging: expect.any(Number),
          metallurgy: expect.any(Number),
          craftsmanship: expect.any(Number)
        })
      );
    });

    it('should level up user when experience threshold is met', async () => {
      mockForgeRepository.getUserExperience.mockResolvedValue({
        forging: 999,
        metallurgy: 850,
        craftsmanship: 920
      });

      mockForgeRepository.getUserLevel.mockResolvedValue(24);

      await forgeService.checkLevelUp('user123');

      expect(mockForgeRepository.levelUpUser).toHaveBeenCalledWith('user123');
      expect(mockForgeRepository.unlockNewTools).toHaveBeenCalledWith('user123');
    });
  });
});
```

---

## 🔗 Integration Testing

### **API Endpoint Testing**
```typescript
// tests/integration/api/forge-endpoints.test.ts
import request from 'supertest';
import { app } from '@/app';
import { setupTestDatabase, teardownTestDatabase } from '@/tests/setup/database';
import { createTestUser, createTestForge } from '@/tests/setup/fixtures';

describe('Forge API Endpoints', () => {
  let testUser: any;
  let testForge: any;
  let authToken: string;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    testUser = await createTestUser();
    testForge = await createTestForge(testUser.id);
    authToken = testUser.generateAuthToken();
  });

  afterEach(async () => {
    await testUser.cleanup();
    await testForge.cleanup();
  });

  describe('POST /api/forge/craft', () => {
    it('should craft item successfully with valid request', async () => {
      const craftingRequest = {
        itemType: 'sword',
        materials: ['steel', 'iron'],
        quality: 'rare',
        forgeId: testForge.id
      };

      const response = await request(app)
        .post('/api/forge/craft')
        .set('Authorization', `Bearer ${authToken}`)
        .send(craftingRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.item.type).toBe('sword');
      expect(response.body.item.quality).toBe('rare');
      expect(response.body.item.forgeId).toBe(testForge.id);
    });

    it('should fail with insufficient materials', async () => {
      const craftingRequest = {
        itemType: 'sword',
        materials: ['steel', 'iron'],
        quality: 'rare',
        forgeId: testForge.id
      };

      // Reduce user materials
      await testUser.updateResources({ steel: 1, iron: 1 });

      const response = await request(app)
        .post('/api/forge/craft')
        .set('Authorization', `Bearer ${authToken}`)
        .send(craftingRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insufficient materials');
    });

    it('should fail with invalid forge ID', async () => {
      const craftingRequest = {
        itemType: 'sword',
        materials: ['steel', 'iron'],
        quality: 'rare',
        forgeId: 'invalid-forge-id'
      };

      const response = await request(app)
        .post('/api/forge/craft')
        .set('Authorization', `Bearer ${authToken}`)
        .send(craftingRequest)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Forge not found');
    });

    it('should handle concurrent crafting requests', async () => {
      const craftingRequest = {
        itemType: 'sword',
        materials: ['steel', 'iron'],
        quality: 'rare',
        forgeId: testForge.id
      };

      // Send multiple concurrent requests
      const promises = Array(3).fill(null).map(() =>
        request(app)
          .post('/api/forge/craft')
          .set('Authorization', `Bearer ${authToken}`)
          .send(craftingRequest)
      );

      const responses = await Promise.all(promises);

      // Only one should succeed, others should fail due to resource constraints
      const successfulRequests = responses.filter(r => r.status === 200);
      const failedRequests = responses.filter(r => r.status === 400);

      expect(successfulRequests).toHaveLength(1);
      expect(failedRequests).toHaveLength(2);
    });
  });

  describe('GET /api/forge/:id/status', () => {
    it('should return forge status correctly', async () => {
      const response = await request(app)
        .get(`/api/forge/${testForge.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.forgeId).toBe(testForge.id);
      expect(response.body.temperature).toBeDefined();
      expect(response.body.isActive).toBeDefined();
      expect(response.body.currentProject).toBeDefined();
    });

    it('should return 404 for non-existent forge', async () => {
      const response = await request(app)
        .get('/api/forge/non-existent-id/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Forge not found');
    });
  });

  describe('PUT /api/forge/:id/heat', () => {
    it('should increase forge temperature', async () => {
      const initialStatus = await request(app)
        .get(`/api/forge/${testForge.id}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      const initialTemp = initialStatus.body.temperature;

      const response = await request(app)
        .put(`/api/forge/${testForge.id}/heat`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ intensity: 'medium' })
        .expect(200);

      expect(response.body.temperature).toBeGreaterThan(initialTemp);
      expect(response.body.isHeating).toBe(true);
    });

    it('should respect temperature limits', async () => {
      // Heat forge to maximum
      for (let i = 0; i < 10; i++) {
        await request(app)
          .put(`/api/forge/${testForge.id}/heat`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ intensity: 'high' });
      }

      const finalStatus = await request(app)
        .get(`/api/forge/${testForge.id}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(finalStatus.body.temperature).toBeLessThanOrEqual(1000);
      expect(finalStatus.body.isHeating).toBe(false);
    });
  });
});
```

### **Database Integration Testing**
```typescript
// tests/integration/database/forge-repository.test.ts
import { ForgeRepository } from '@/repositories/ForgeRepository';
import { setupTestDatabase, teardownTestDatabase } from '@/tests/setup/database';
import { createTestUser, createTestForge } from '@/tests/setup/fixtures';

describe('ForgeRepository Integration Tests', () => {
  let forgeRepository: ForgeRepository;
  let testUser: any;
  let testForge: any;

  beforeAll(async () => {
    await setupTestDatabase();
    forgeRepository = new ForgeRepository();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    testUser = await createTestUser();
    testForge = await createTestForge(testUser.id);
  });

  afterEach(async () => {
    await testUser.cleanup();
    await testForge.cleanup();
  });

  describe('Crafting Operations', () => {
    it('should create crafting record and update resources atomically', async () => {
      const craftingData = {
        userId: testUser.id,
        forgeId: testForge.id,
        itemType: 'sword',
        materials: ['steel', 'iron'],
        quality: 'rare',
        successRate: 0.85
      };

      const result = await forgeRepository.craftItem(craftingData);

      expect(result.success).toBe(true);
      expect(result.itemId).toBeDefined();

      // Verify resources were deducted
      const updatedResources = await forgeRepository.getUserResources(testUser.id);
      expect(updatedResources.steel).toBeLessThan(10); // Initial was 10
      expect(updatedResources.iron).toBeLessThan(15); // Initial was 15

      // Verify crafting record exists
      const craftingRecord = await forgeRepository.getCraftingRecord(result.itemId);
      expect(craftingRecord.userId).toBe(testUser.id);
      expect(craftingRecord.itemType).toBe('sword');
    });

    it('should rollback on crafting failure', async () => {
      const initialResources = await forgeRepository.getUserResources(testUser.id);

      try {
        // Simulate crafting failure
        await forgeRepository.craftItem({
          userId: testUser.id,
          forgeId: testForge.id,
          itemType: 'invalid-item',
          materials: ['steel', 'iron'],
          quality: 'rare',
          successRate: 0.0
        });
      } catch (error) {
        // Expected to fail
      }

      // Verify resources were not deducted
      const finalResources = await forgeRepository.getUserResources(testUser.id);
      expect(finalResources.steel).toBe(initialResources.steel);
      expect(finalResources.iron).toBe(initialResources.iron);
    });
  });

  describe('Transaction Management', () => {
    it('should handle concurrent resource updates correctly', async () => {
      const initialResources = await forgeRepository.getUserResources(testUser.id);

      // Simulate concurrent resource updates
      const updatePromises = Array(5).fill(null).map(() =>
        forgeRepository.updateUserResources(testUser.id, { gold: 100 })
      );

      await Promise.all(updatePromises);

      const finalResources = await forgeRepository.getUserResources(testUser.id);
      expect(finalResources.gold).toBe(initialResources.gold + 500);
    });

    it('should maintain data consistency across related tables', async () => {
      const userStats = await forgeRepository.getUserStats(testUser.id);
      const craftingHistory = await forgeRepository.getCraftingHistory(testUser.id);

      // Verify stats match history
      expect(userStats.totalCrafts).toBe(craftingHistory.length);
      expect(userStats.successfulCrafts).toBe(
        craftingHistory.filter(c => c.success).length
      );
    });
  });
});
```

---

## 🌐 End-to-End Testing

### **User Journey Testing**
```typescript
// tests/e2e/user-journeys/complete-crafting-flow.spec.ts
import { test, expect } from '@playwright/test';
import { setupTestUser, cleanupTestUser } from '@/tests/setup/e2e';

test.describe('Complete Crafting Flow', () => {
  let testUser: any;

  test.beforeAll(async () => {
    testUser = await setupTestUser();
  });

  test.afterAll(async () => {
    await cleanupTestUser(testUser);
  });

  test('should complete full crafting journey from login to item creation', async ({ page }) => {
    // 1. User Login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    // Verify successful login
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-gold"]')).toContainText('1000');

    // 2. Navigate to Forge
    await page.click('[data-testid="forge-nav-link"]');
    await expect(page.locator('[data-testid="forge-interface"]')).toBeVisible();

    // 3. Select Crafting Project
    await page.click('[data-testid="project-selector"]');
    await page.click('[data-testid="project-sword"]');
    await expect(page.locator('[data-testid="project-details"]')).toContainText('Sword Crafting');

    // 4. Heat the Forge
    await page.click('[data-testid="heat-forge-button"]');
    await page.selectOption('[data-testid="heat-intensity"]', 'medium');
    await page.click('[data-testid="start-heating"]');

    // Wait for temperature to rise
    await expect(page.locator('[data-testid="forge-temperature"]')).toContainText(/[1-9]\d+°C/);

    // 5. Place Materials
    const steelMaterial = page.locator('[data-testid="material-steel"]');
    const forgeCanvas = page.locator('[data-testid="forge-canvas"]');

    await steelMaterial.dragTo(forgeCanvas);
    await expect(page.locator('[data-testid="placed-material-steel"]')).toBeVisible();

    // 6. Select Tools
    await page.click('[data-testid="tool-hammer"]');
    await expect(page.locator('[data-testid="tool-hammer"]')).toHaveClass(/selected/);

    // 7. Begin Crafting
    await page.click('[data-testid="start-crafting"]');
    await expect(page.locator('[data-testid="crafting-progress"]')).toBeVisible();

    // Wait for crafting to complete
    await expect(page.locator('[data-testid="crafting-complete"]')).toBeVisible({ timeout: 30000 });

    // 8. Verify Results
    await expect(page.locator('[data-testid="crafted-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="item-quality"]')).toContainText('Rare');
    await expect(page.locator('[data-testid="item-stats"]')).toContainText('Damage: 45');

    // 9. Check Resource Updates
    await expect(page.locator('[data-testid="user-gold"]')).toContainText(/[0-9]+/);
    await expect(page.locator('[data-testid="user-materials"]')).toContainText(/Steel: [0-9]+/);

    // 10. Verify Experience Gain
    const initialExp = testUser.experience.forging;
    await expect(page.locator('[data-testid="forging-exp"]')).toContainText(
      new RegExp(`${initialExp + 25}`)
    );
  });

  test('should handle crafting failure gracefully', async ({ page }) => {
    await page.goto('/forge');
    await page.click('[data-testid="project-selector"]');
    await page.click('[data-testid="project-complex-item"]');

    // Use low-quality materials to increase failure chance
    await page.click('[data-testid="material-basic-iron"]');
    await page.click('[data-testid="start-crafting"]');

    // Wait for crafting to complete
    await expect(page.locator('[data-testid="crafting-result"]')).toBeVisible({ timeout: 30000 });

    // Should show failure message
    await expect(page.locator('[data-testid="crafting-failed"]')).toBeVisible();
    await expect(page.locator('[data-testid="failure-reason"]')).toContainText('Material quality too low');

    // Should offer retry option
    await expect(page.locator('[data-testid="retry-crafting"]')).toBeVisible();
  });

  test('should maintain state across page refreshes', async ({ page }) => {
    await page.goto('/forge');
    
    // Start a crafting project
    await page.click('[data-testid="project-selector"]');
    await page.click('[data-testid="project-sword"]');
    await page.click('[data-testid="start-crafting"]');

    // Verify crafting is in progress
    await expect(page.locator('[data-testid="crafting-progress"]')).toBeVisible();

    // Refresh page
    await page.reload();

    // Should still show crafting in progress
    await expect(page.locator('[data-testid="crafting-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-sword"]')).toHaveClass(/active/);
  });
});
```

---

## 📊 Performance Testing

### **Load Testing Scenarios**
```typescript
// tests/performance/load-testing.spec.ts
import { check } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const craftingDuration = new Trend('crafting_duration');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp up to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 users
    { duration: '2m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
    crafting_duration: ['p(95)<30000'], // 95% of crafting must complete below 30s
  },
};

export function setup() {
  // Create test user and get auth token
  const loginRes = http.post(`${__ENV.API_BASE_URL}/auth/login`, {
    email: 'loadtest@example.com',
    password: 'testpassword123'
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200 && r.json('token'),
  });

  return { authToken: loginRes.json('token') };
}

export default function(data: any) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.authToken}`,
    },
  };

  // Simulate user crafting flow
  const craftingRes = http.post(`${__ENV.API_BASE_URL}/forge/craft`, {
    itemType: 'sword',
    materials: ['steel', 'iron'],
    quality: 'rare',
    forgeId: 'test-forge-123'
  }, params);

  check(craftingRes, {
    'crafting request successful': (r) => r.status === 200,
    'crafting response time OK': (r) => r.timings.duration < 500,
  });

  if (craftingRes.status === 200) {
    const craftingData = craftingRes.json();
    craftingDuration.add(craftingData.craftingTime || 0);
  }

  // Simulate resource checking
  const resourcesRes = http.get(`${__ENV.API_BASE_URL}/user/resources`, params);

  check(resourcesRes, {
    'resources request successful': (r) => r.status === 200,
    'resources response time OK': (r) => r.timings.duration < 200,
  });

  // Simulate forge status check
  const forgeStatusRes = http.get(`${__ENV.API_BASE_URL}/forge/test-forge-123/status`, params);

  check(forgeStatusRes, {
    'forge status request successful': (r) => r.status === 200,
    'forge status response time OK': (r) => r.timings.duration < 300,
  });

  // Record errors
  errorRate.add(craftingRes.status !== 200 || resourcesRes.status !== 200 || forgeStatusRes.status !== 200);
}
```

---

## 🔒 Security Testing

### **Authentication & Authorization Testing**
```typescript
// tests/security/auth-security.test.ts
import { test, expect } from '@playwright/test';

test.describe('Security Testing - Authentication & Authorization', () => {
  test('should prevent unauthorized access to protected endpoints', async ({ page }) => {
    // Try to access forge without authentication
    await page.goto('/forge');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="login-required"]')).toBeVisible();
  });

  test('should prevent token tampering', async ({ page }) => {
    // Login normally
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Verify successful login
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Tamper with token in localStorage
    await page.evaluate(() => {
      const token = localStorage.getItem('authToken');
      const tamperedToken = token + 'tampered';
      localStorage.setItem('authToken', tamperedToken);
    });

    // Try to access protected endpoint
    await page.goto('/forge');
    
    // Should reject tampered token
    await expect(page.locator('[data-testid="invalid-token"]')).toBeVisible();
  });

  test('should enforce rate limiting on authentication endpoints', async ({ page }) => {
    const loginAttempts = Array(10).fill(null).map(() =>
      page.fill('[data-testid="email-input"]', 'test@example.com')
        .then(() => page.fill('[data-testid="password-input"]', 'wrongpassword'))
        .then(() => page.click('[data-testid="login-button"]'))
    );

    // Execute multiple login attempts rapidly
    await Promise.all(loginAttempts);

    // Should show rate limit message
    await expect(page.locator('[data-testid="rate-limit-exceeded"]')).toBeVisible();
  });

  test('should prevent SQL injection in login form', async ({ page }) => {
    await page.goto('/login');
    
    // Try SQL injection payloads
    const sqlInjectionPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --"
    ];

    for (const payload of sqlInjectionPayloads) {
      await page.fill('[data-testid="email-input"]', payload);
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Should not crash or expose sensitive data
      await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-error"]')).not.toContainText('users');
    }
  });
});
```

---

## 📋 Testing Checklist & Quality Gates

### **Pre-Release Testing Checklist**
- [ ] **Unit Tests**
  - [ ] All business logic functions tested
  - [ ] Component rendering tests complete
  - [ ] Service layer tests passing
  - [ ] 90% code coverage achieved

- [ ] **Integration Tests**
  - [ ] API endpoint tests passing
  - [ ] Database integration tests complete
  - [ ] External service mocks working
  - [ ] 80% integration coverage achieved

- [ ] **End-to-End Tests**
  - [ ] Critical user journeys tested
  - [ ] Cross-browser compatibility verified
  - [ ] Mobile responsiveness tested
  - [ ] 70% E2E coverage achieved

- [ ] **Performance Tests**
  - [ ] Load testing completed
  - [ ] Response time targets met
  - [ ] Resource usage within limits
  - [ ] Scalability verified

- [ ] **Security Tests**
  - [ ] Authentication tests passing
  - [ ] Authorization verified
  - [ ] Vulnerability scans clean
  - [ ] Penetration testing completed

### **Quality Gates**
- **Code Coverage**: Minimum 90% unit, 80% integration, 70% E2E
- **Performance**: 95% of requests under 500ms, error rate under 1%
- **Security**: Zero critical vulnerabilities, all OWASP Top 10 addressed
- **Accessibility**: WCAG 2.1 AA compliance achieved
- **Browser Support**: Chrome, Firefox, Safari, Edge latest versions

---

## 🎯 Testing Best Practices

### **Test Organization**
- **Test Structure**: Follow AAA pattern (Arrange, Act, Assert)
- **Test Naming**: Descriptive names that explain the scenario
- **Test Isolation**: Each test should be independent
- **Data Management**: Use fixtures and factories for test data

### **Test Maintenance**
- **Regular Updates**: Update tests when features change
- **Test Data**: Keep test data realistic and up-to-date
- **Dependencies**: Mock external dependencies consistently
- **Performance**: Keep tests fast and efficient

### **Continuous Testing**
- **CI/CD Integration**: Run tests on every commit
- **Automated Testing**: Minimize manual testing
- **Test Reporting**: Clear reports for stakeholders
- **Failure Analysis**: Quick identification of test failures

---

*This document provides comprehensive testing strategy specifications for the Engineering Forge project. All testing approaches are designed to ensure high quality, reliability, and security of the application.*
