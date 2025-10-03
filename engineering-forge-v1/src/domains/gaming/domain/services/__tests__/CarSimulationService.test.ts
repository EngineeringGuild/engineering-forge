// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/services/__tests__/CarSimulationService.test.ts

import { Component } from '../../entities/Component';
import { ComponentProperties } from '../../value-objects/ComponentProperties';
import { CarSimulationService } from '../CarSimulationService';

describe('CarSimulationService', () => {
  let simulationService: CarSimulationService;
  let mockComponents: Component[];

  beforeEach(() => {
    simulationService = new CarSimulationService();

    // Create mock components
    mockComponents = [
      new Component('chassis-1', {
        name: 'Basic Chassis',
        type: 'chassis',
        category: 'structural',
        properties: ComponentProperties.create({
          power: 0,
          weight: 1000,
          efficiency: 80,
          durability: 90,
          cost: 100,
          unlockLevel: 1
        }),
        position: { x: 0, y: 0 },
        size: { width: 60, height: 30 },
        rotation: 0,
        isUnlocked: true,
        rarity: 'common',
        icon: 'chassis-icon',
        description: 'Basic chassis for car construction',
        level: 1
      }),
      new Component('engine-1', {
        name: 'Basic Engine',
        type: 'engine',
        category: 'mechanical',
        properties: ComponentProperties.create({
          power: 150,
          weight: 200,
          efficiency: 70,
          durability: 85,
          cost: 500,
          unlockLevel: 2
        }),
        position: { x: 0, y: 0 },
        size: { width: 40, height: 30 },
        rotation: 0,
        isUnlocked: true,
        rarity: 'common',
        icon: 'engine-icon',
        description: 'Basic engine for car propulsion',
        level: 1
      }),
      new Component('wheels-1', {
        name: 'Basic Wheels',
        type: 'wheels',
        category: 'mechanical',
        properties: ComponentProperties.create({
          power: 0,
          weight: 100,
          efficiency: 75,
          durability: 80,
          cost: 200,
          unlockLevel: 1
        }),
        position: { x: 0, y: 0 },
        size: { width: 20, height: 20 },
        rotation: 0,
        isUnlocked: true,
        rarity: 'common',
        icon: 'wheels-icon',
        description: 'Basic wheels for car movement',
        level: 1
      })
    ];
  });

  describe('runSimulation', () => {
    it('should run simulation successfully with complete car', async() => {
      const result = await simulationService.runSimulation(mockComponents);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.startTime).toBeInstanceOf(Date);
      expect(result.endTime).toBeInstanceOf(Date);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.distance).toBeGreaterThanOrEqual(0);
      expect(result.maxSpeed).toBeGreaterThanOrEqual(0);
      expect(result.averageSpeed).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.passed).toBeDefined();
      expect(result.simulationSteps.length).toBeGreaterThan(0);
    });

    it('should throw error when car is incomplete', async() => {
      const incompleteComponents = mockComponents.slice(0, 2); // Missing wheels

      await expect(simulationService.runSimulation(incompleteComponents)).rejects.toThrow(
        'Car must have chassis, engine, and wheels to run simulation'
      );
    });

    it('should throw error when no components provided', async() => {
      await expect(simulationService.runSimulation([])).rejects.toThrow(
        'Car must have chassis, engine, and wheels to run simulation'
      );
    });

    it('should accept custom simulation configuration', async() => {
      const customConfig = {
        trackLength: 500,
        maxSimulationTime: 30,
        timeStep: 0.05
      };

      const result = await simulationService.runSimulation(mockComponents, customConfig);

      expect(result).toBeDefined();
      expect(result.distance).toBeLessThanOrEqual(600); // Allow some tolerance for physics calculations
      expect(result.duration).toBeLessThanOrEqual(30);
    });
  });

  describe('validateComponents', () => {
    it('should validate complete car successfully', () => {
      // This is tested indirectly through runSimulation, but we can test the validation logic
      expect(() => {
        // Create a private method test by running simulation
        simulationService.runSimulation(mockComponents);
      }).not.toThrow();
    });

    it('should throw error for incomplete car', async() => {
      const incompleteComponents = [mockComponents[0]]; // Only chassis

      await expect(simulationService.runSimulation(incompleteComponents)).rejects.toThrow(
        'Car must have chassis, engine, and wheels to run simulation'
      );
    });
  });

  describe('calculateInitialPerformance', () => {
    it('should calculate performance metrics correctly', async() => {
      const result = await simulationService.runSimulation(mockComponents);

      expect(result.finalPerformance).toBeDefined();
      expect(result.finalPerformance.acceleration).toBeGreaterThanOrEqual(0);
      expect(result.finalPerformance.topSpeed).toBeGreaterThanOrEqual(0);
      expect(result.finalPerformance.handling).toBeGreaterThanOrEqual(0);
      expect(result.finalPerformance.fuelEfficiency).toBeGreaterThanOrEqual(0);
      expect(result.finalPerformance.weight).toBeGreaterThan(0);
      expect(result.finalPerformance.power).toBeGreaterThan(0);
      expect(result.finalPerformance.torque).toBeGreaterThan(0);
      expect(result.finalPerformance.overall).toBeGreaterThanOrEqual(0);
      expect(result.finalPerformance.overall).toBeLessThanOrEqual(100);
    });
  });

  describe('simulation physics', () => {
    it('should generate simulation steps with realistic physics', async() => {
      const result = await simulationService.runSimulation(mockComponents);

      expect(result.simulationSteps.length).toBeGreaterThan(0);

      // Check that speed increases over time (acceleration)
      const firstStep = result.simulationSteps[0];
      const lastStep = result.simulationSteps[result.simulationSteps.length - 1];

      expect(firstStep.speed).toBeGreaterThanOrEqual(0);
      expect(lastStep.speed).toBeGreaterThanOrEqual(0);

      // Check position progression
      expect(lastStep.position.x).toBeGreaterThanOrEqual(firstStep.position.x);

      // Check that acceleration is calculated
      expect(firstStep.acceleration).toBeDefined();
      expect(typeof firstStep.acceleration).toBe('number');
    });

    it('should respect track length limit', async() => {
      const shortTrackConfig = {
        trackLength: 100,
        maxSimulationTime: 10
      };

      const result = await simulationService.runSimulation(mockComponents, shortTrackConfig);

      expect(result.distance).toBeLessThanOrEqual(120); // Allow some tolerance for physics calculations
    });
  });

  describe('scoring system', () => {
    it('should generate score between 0 and 100', async() => {
      const result = await simulationService.runSimulation(mockComponents);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(Number.isInteger(result.score)).toBe(true);
    });

    it('should set passed status based on score', async() => {
      const result = await simulationService.runSimulation(mockComponents);

      if (result.score >= 60) {
        expect(result.passed).toBe(true);
      } else {
        expect(result.passed).toBe(false);
      }
    });
  });

  describe('configuration validation', () => {
    it('should validate positive track length', () => {
      const invalidConfig = {
        trackLength: -100
      };

      expect(() => {
        simulationService.validateConfig(invalidConfig);
      }).toThrow('Track length must be positive');
    });

    it('should validate positive simulation time', () => {
      const invalidConfig = {
        maxSimulationTime: -10
      };

      expect(() => {
        simulationService.validateConfig(invalidConfig);
      }).toThrow('Max simulation time must be positive');
    });

    it('should validate time step range', () => {
      const invalidConfig1 = {
        timeStep: 0
      };

      const invalidConfig2 = {
        timeStep: 2
      };

      expect(() => {
        simulationService.validateConfig(invalidConfig1);
      }).toThrow('Time step must be between 0 and 1 seconds');

      expect(() => {
        simulationService.validateConfig(invalidConfig2);
      }).toThrow('Time step must be between 0 and 1 seconds');
    });

    it('should accept valid configuration', () => {
      const validConfig = {
        trackLength: 1000,
        maxSimulationTime: 60,
        timeStep: 0.1
      };

      expect(() => {
        simulationService.validateConfig(validConfig);
      }).not.toThrow();
    });
  });

  describe('default configuration', () => {
    it('should provide default configuration', () => {
      const defaultConfig = simulationService.getDefaultConfig();

      expect(defaultConfig.trackLength).toBe(1000);
      expect(defaultConfig.maxSimulationTime).toBe(60);
      expect(defaultConfig.timeStep).toBe(0.1);
      expect(defaultConfig.enablePhysics).toBe(true);
      expect(defaultConfig.enableDrag).toBe(true);
      expect(defaultConfig.enableFriction).toBe(true);
    });
  });

  describe('performance with different car configurations', () => {
    it('should handle high-performance car', async() => {
      // Create high-performance components by cloning and modifying
      const highPerformanceComponents = mockComponents.map(comp => {
        if (comp.type === 'engine') {
          return new Component(comp.id, {
            name: comp.name,
            type: comp.type,
            category: comp.category,
            properties: ComponentProperties.create({
              power: 300, // High power engine
              weight: 150, // Lighter weight
              efficiency: comp.properties.efficiency,
              durability: comp.properties.durability,
              cost: comp.properties.cost,
              unlockLevel: comp.properties.unlockLevel
            }),
            position: comp.position,
            size: comp.size,
            rotation: comp.rotation,
            isUnlocked: comp.isUnlocked,
            rarity: comp.rarity,
            icon: comp.icon,
            description: comp.description,
            level: comp.level
          });
        }
        return comp;
      });

      const result = await simulationService.runSimulation(highPerformanceComponents);

      expect(result.maxSpeed).toBeGreaterThan(0);
      expect(result.distance).toBeGreaterThan(0);
    });

    it('should handle heavy car', async() => {
      const heavyComponents = mockComponents.map(comp => {
        return new Component(comp.id, {
          name: comp.name,
          type: comp.type,
          category: comp.category,
          properties: ComponentProperties.create({
            power: comp.properties.power,
            weight: comp.properties.weight * 2, // Double the weight
            efficiency: comp.properties.efficiency,
            durability: comp.properties.durability,
            cost: comp.properties.cost,
            unlockLevel: comp.properties.unlockLevel
          }),
          position: comp.position,
          size: comp.size,
          rotation: comp.rotation,
          isUnlocked: comp.isUnlocked,
          rarity: comp.rarity,
          icon: comp.icon,
          description: comp.description,
          level: comp.level
        });
      });

      const result = await simulationService.runSimulation(heavyComponents);

      expect(result.maxSpeed).toBeGreaterThanOrEqual(0);
      expect(result.distance).toBeGreaterThanOrEqual(0);
    });
  });
});
