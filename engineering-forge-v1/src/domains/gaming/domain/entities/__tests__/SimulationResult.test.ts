// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/entities/__tests__/SimulationResult.test.ts

import { PerformanceMetrics } from '../../value-objects/PerformanceMetrics';
import { Position, PositionVO } from '../../value-objects/Position';
import { SimulationResult, SimulationStep } from '../SimulationResult';

describe('SimulationResult', () => {
  let mockPerformanceMetrics: PerformanceMetrics;
  let mockSimulationSteps: SimulationStep[];
  let startTime: Date;
  let endTime: Date;

  beforeEach(() => {
    startTime = new Date('2025-01-30T10:00:00Z');
    endTime = new Date('2025-01-30T10:01:00Z');

    mockPerformanceMetrics = new PerformanceMetrics({
      acceleration: 75,
      topSpeed: 120,
      handling: 80,
      fuelEfficiency: 12,
      weight: 1300,
      power: 150,
      torque: 200,
      overall: 85
    });

    // Create mock simulation steps
    mockSimulationSteps = [
      new SimulationStep('step-1', {
        timestamp: 0,
        position: new PositionVO(0, 0),
        speed: 0,
        acceleration: 2.5,
        performance: mockPerformanceMetrics
      }),
      new SimulationStep('step-2', {
        timestamp: 5,
        position: new PositionVO(50, 0),
        speed: 25,
        acceleration: 2.0,
        performance: mockPerformanceMetrics
      }),
      new SimulationStep('step-3', {
        timestamp: 10,
        position: new PositionVO(200, 0),
        speed: 60,
        acceleration: 1.5,
        performance: mockPerformanceMetrics
      })
    ];
  });

  describe('constructor', () => {
    it('should create SimulationResult with valid props', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 85,
        passed: true,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      expect(result.id).toBe('sim-1');
      expect(result.startTime).toBe(startTime);
      expect(result.endTime).toBe(endTime);
      expect(result.duration).toBe(60);
      expect(result.distance).toBe(200);
      expect(result.maxSpeed).toBe(120);
      expect(result.averageSpeed).toBe(60);
      expect(result.finalPerformance).toBe(mockPerformanceMetrics);
      expect(result.score).toBe(85);
      expect(result.passed).toBe(true);
      expect(result.simulationSteps).toEqual(mockSimulationSteps);
      expect(result.userId).toBe('user-001');
    });

    it('should throw error for invalid duration', () => {
      expect(() => {
        new SimulationResult('sim-1', {
          startTime,
          endTime,
          duration: -10, // Invalid negative duration
          distance: 200,
          maxSpeed: 120,
          averageSpeed: 60,
          finalPerformance: mockPerformanceMetrics,
          score: 85,
          passed: true,
          simulationSteps: mockSimulationSteps,
          userId: 'user-001'
        });
      }).toThrow('Duration must be positive');
    });

    it('should throw error for negative distance', () => {
      expect(() => {
        new SimulationResult('sim-1', {
          startTime,
          endTime,
          duration: 60,
          distance: -100, // Invalid negative distance
          maxSpeed: 120,
          averageSpeed: 60,
          finalPerformance: mockPerformanceMetrics,
          score: 85,
          passed: true,
          simulationSteps: mockSimulationSteps,
          userId: 'user-001'
        });
      }).toThrow('Distance must be non-negative');
    });

    it('should throw error for negative speeds', () => {
      expect(() => {
        new SimulationResult('sim-1', {
          startTime,
          endTime,
          duration: 60,
          distance: 200,
          maxSpeed: -50, // Invalid negative speed
          averageSpeed: 60,
          finalPerformance: mockPerformanceMetrics,
          score: 85,
          passed: true,
          simulationSteps: mockSimulationSteps,
          userId: 'user-001'
        });
      }).toThrow('Max speed must be non-negative');
    });

    it('should throw error for invalid score range', () => {
      expect(() => {
        new SimulationResult('sim-1', {
          startTime,
          endTime,
          duration: 60,
          distance: 200,
          maxSpeed: 120,
          averageSpeed: 60,
          finalPerformance: mockPerformanceMetrics,
          score: 150, // Invalid score > 100
          passed: true,
          simulationSteps: mockSimulationSteps,
          userId: 'user-001'
        });
      }).toThrow('Score must be between 0 and 100');
    });

    it('should throw error for invalid time order', () => {
      const invalidEndTime = new Date('2025-01-30T09:59:00Z'); // Before start time

      expect(() => {
        new SimulationResult('sim-1', {
          startTime,
          endTime: invalidEndTime,
          duration: 60,
          distance: 200,
          maxSpeed: 120,
          averageSpeed: 60,
          finalPerformance: mockPerformanceMetrics,
          score: 85,
          passed: true,
          simulationSteps: mockSimulationSteps,
          userId: 'user-001'
        });
      }).toThrow('Start time must be before end time');
    });

    it('should throw error for empty userId', () => {
      expect(() => {
        new SimulationResult('sim-1', {
          startTime,
          endTime,
          duration: 60,
          distance: 200,
          maxSpeed: 120,
          averageSpeed: 60,
          finalPerformance: mockPerformanceMetrics,
          score: 85,
          passed: true,
          simulationSteps: mockSimulationSteps,
          userId: '' // Empty userId
        });
      }).toThrow('User ID is required');
    });
  });

  describe('getGrade', () => {
    it('should return correct grade for score 95', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 95,
        passed: true,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      expect(result.getGrade()).toBe('A');
    });

    it('should return correct grade for score 85', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 85,
        passed: true,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      expect(result.getGrade()).toBe('B');
    });

    it('should return correct grade for score 75', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 75,
        passed: true,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      expect(result.getGrade()).toBe('C');
    });

    it('should return correct grade for score 65', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 65,
        passed: true,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      expect(result.getGrade()).toBe('D');
    });

    it('should return correct grade for score 45', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 45,
        passed: false,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      expect(result.getGrade()).toBe('F');
    });
  });

  describe('getPerformanceRating', () => {
    it('should return correct rating for excellent score', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 95,
        passed: true,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      expect(result.getPerformanceRating()).toBe('Excellent');
    });

    it('should return correct rating for poor score', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 45,
        passed: false,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      expect(result.getPerformanceRating()).toBe('Poor');
    });
  });

  describe('getEfficiencyMetrics', () => {
    it('should calculate efficiency metrics correctly', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 85,
        passed: true,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      const efficiency = result.getEfficiencyMetrics();

      expect(efficiency.distancePerSecond).toBeCloseTo(200 / 60, 2);
      expect(efficiency.speedEfficiency).toBeLessThanOrEqual(1);
      expect(efficiency.accelerationEfficiency).toBeLessThanOrEqual(1);
      expect(efficiency.overallEfficiency).toBeLessThanOrEqual(1);
    });
  });

  describe('getStatistics', () => {
    it('should calculate statistics correctly', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 85,
        passed: true,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      const stats = result.getStatistics();

      expect(stats.totalSteps).toBe(3);
      expect(stats.averageTimePerStep).toBeCloseTo(60 / 3, 2);
      expect(stats.maxAcceleration).toBe(2.5);
      expect(stats.minSpeed).toBe(0);
      expect(stats.totalAcceleration).toBe(6.0);
    });

    it('should handle empty simulation steps', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 85,
        passed: true,
        simulationSteps: [],
        userId: 'user-001'
      });

      const stats = result.getStatistics();

      expect(stats.totalSteps).toBe(0);
      expect(stats.averageTimePerStep).toBe(0);
      expect(stats.maxAcceleration).toBe(0);
      expect(stats.minSpeed).toBe(0);
      expect(stats.totalAcceleration).toBe(0);
    });
  });

  describe('getStepsInTimeRange', () => {
    it('should filter steps by time range correctly', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 85,
        passed: true,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      const stepsInRange = result.getStepsInTimeRange(2, 8);

      expect(stepsInRange.length).toBe(1);
      expect(stepsInRange[0].timestamp).toBe(5);
    });
  });

  describe('getStepsInDistanceRange', () => {
    it('should filter steps by distance range correctly', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 85,
        passed: true,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      const stepsInRange = result.getStepsInDistanceRange(30, 150);

      expect(stepsInRange.length).toBe(1);
      expect(stepsInRange[0].position.x).toBe(50);
    });
  });

  describe('isSuccessful', () => {
    it('should return true for successful simulation', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 85,
        passed: true,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      expect(result.isSuccessful()).toBe(true);
    });

    it('should return false for failed simulation', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 45,
        passed: false,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      expect(result.isSuccessful()).toBe(false);
    });

    it('should return false for zero distance', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 0,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 85,
        passed: true,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      expect(result.isSuccessful()).toBe(false);
    });
  });

  describe('getImprovementRecommendations', () => {
    it('should provide recommendations for poor performance', () => {
      const poorPerformance = new PerformanceMetrics({
        acceleration: 20,
        topSpeed: 30,
        handling: 25,
        fuelEfficiency: 2,
        weight: 1300,
        power: 50,
        torque: 80,
        overall: 25
      });

      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 100,
        maxSpeed: 30,
        averageSpeed: 15,
        finalPerformance: poorPerformance,
        score: 25,
        passed: false,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      const recommendations = result.getImprovementRecommendations();

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations).toContain('Overall performance needs significant improvement');
      expect(recommendations).toContain('Consider upgrading engine for better top speed');
      expect(recommendations).toContain(
        'Improve acceleration by reducing weight or increasing power'
      );
    });

    it('should provide minimal recommendations for good performance', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 800,
        maxSpeed: 150,
        averageSpeed: 80,
        finalPerformance: mockPerformanceMetrics,
        score: 95,
        passed: true,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001'
      });

      const recommendations = result.getImprovementRecommendations();

      expect(recommendations.length).toBeLessThanOrEqual(1);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON correctly', () => {
      const result = new SimulationResult('sim-1', {
        startTime,
        endTime,
        duration: 60,
        distance: 200,
        maxSpeed: 120,
        averageSpeed: 60,
        finalPerformance: mockPerformanceMetrics,
        score: 85,
        passed: true,
        simulationSteps: mockSimulationSteps,
        userId: 'user-001',
        projectId: 'project-1'
      });

      const json = result.toJSON();
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe('sim-1');
      expect(parsed.startTime).toBe(startTime.toISOString());
      expect(parsed.endTime).toBe(endTime.toISOString());
      expect(parsed.duration).toBe(60);
      expect(parsed.distance).toBe(200);
      expect(parsed.maxSpeed).toBe(120);
      expect(parsed.averageSpeed).toBe(60);
      expect(parsed.score).toBe(85);
      expect(parsed.passed).toBe(true);
      expect(parsed.userId).toBe('user-001');
      expect(parsed.projectId).toBe('project-1');
      expect(parsed.simulationSteps).toHaveLength(3);
    });
  });
});

describe('SimulationStep', () => {
  let mockPerformanceMetrics: PerformanceMetrics;
  let mockPosition: Position;

  beforeEach(() => {
    mockPerformanceMetrics = new PerformanceMetrics({
      acceleration: 75,
      topSpeed: 120,
      handling: 80,
      fuelEfficiency: 12,
      weight: 1300,
      power: 150,
      torque: 200,
      overall: 85
    });

    mockPosition = new PositionVO(100, 50);
  });

  describe('constructor', () => {
    it('should create SimulationStep with valid props', () => {
      const step = new SimulationStep('step-1', {
        timestamp: 10.5,
        position: mockPosition,
        speed: 60,
        acceleration: 2.0,
        performance: mockPerformanceMetrics
      });

      expect(step.id).toBe('step-1');
      expect(step.timestamp).toBe(10.5);
      expect(step.position).toBe(mockPosition);
      expect(step.speed).toBe(60);
      expect(step.acceleration).toBe(2.0);
      expect(step.performance).toBe(mockPerformanceMetrics);
    });

    it('should throw error for negative timestamp', () => {
      expect(() => {
        new SimulationStep('step-1', {
          timestamp: -5,
          position: mockPosition,
          speed: 60,
          acceleration: 2.0,
          performance: mockPerformanceMetrics
        });
      }).toThrow('Timestamp must be non-negative');
    });

    it('should throw error for negative speed', () => {
      expect(() => {
        new SimulationStep('step-1', {
          timestamp: 10,
          position: mockPosition,
          speed: -10,
          acceleration: 2.0,
          performance: mockPerformanceMetrics
        });
      }).toThrow('Speed must be non-negative');
    });

    it('should throw error for invalid performance overall', () => {
      const invalidPerformance = new PerformanceMetrics({
        acceleration: 75,
        topSpeed: 120,
        handling: 80,
        fuelEfficiency: 12,
        weight: 1300,
        power: 150,
        torque: 200,
        overall: 150 // Invalid > 100
      });

      expect(() => {
        new SimulationStep('step-1', {
          timestamp: 10,
          position: mockPosition,
          speed: 60,
          acceleration: 2.0,
          performance: invalidPerformance
        });
      }).toThrow('Performance overall must be between 0 and 100');
    });
  });

  describe('updateStep', () => {
    it('should update step properties correctly', () => {
      const step = new SimulationStep('step-1', {
        timestamp: 10,
        position: mockPosition,
        speed: 60,
        acceleration: 2.0,
        performance: mockPerformanceMetrics
      });

      const newPosition = new PositionVO(200, 100);
      const newPerformance = new PerformanceMetrics({
        acceleration: 75,
        topSpeed: 120,
        handling: 80,
        fuelEfficiency: 12,
        weight: 1300,
        power: 150,
        torque: 200,
        overall: 90
      });

      step.updateStep({
        timestamp: 15,
        position: newPosition,
        speed: 80,
        acceleration: 1.5,
        performance: newPerformance
      });

      expect(step.timestamp).toBe(15);
      expect(step.position).toBe(newPosition);
      expect(step.speed).toBe(80);
      expect(step.acceleration).toBe(1.5);
      expect(step.performance).toBe(newPerformance);
    });
  });

  describe('getSpeedInUnit', () => {
    it('should convert speed to different units correctly', () => {
      const step = new SimulationStep('step-1', {
        timestamp: 10,
        position: mockPosition,
        speed: 100, // km/h
        acceleration: 2.0,
        performance: mockPerformanceMetrics
      });

      expect(step.getSpeedInUnit('kmh')).toBe(100);
      expect(step.getSpeedInUnit('mph')).toBeCloseTo(62.1371, 2);
      expect(step.getSpeedInUnit('ms')).toBeCloseTo(27.7778, 2);
    });

    it('should throw error for invalid unit', () => {
      const step = new SimulationStep('step-1', {
        timestamp: 10,
        position: mockPosition,
        speed: 100,
        acceleration: 2.0,
        performance: mockPerformanceMetrics
      });

      expect(() => {
        step.getSpeedInUnit('invalid' as any);
      }).toThrow('Invalid speed unit');
    });
  });

  describe('isNewMaxSpeed', () => {
    it('should return true for new maximum speed', () => {
      const step = new SimulationStep('step-1', {
        timestamp: 10,
        position: mockPosition,
        speed: 120,
        acceleration: 2.0,
        performance: mockPerformanceMetrics
      });

      expect(step.isNewMaxSpeed(100)).toBe(true);
    });

    it('should return false for not new maximum speed', () => {
      const step = new SimulationStep('step-1', {
        timestamp: 10,
        position: mockPosition,
        speed: 80,
        acceleration: 2.0,
        performance: mockPerformanceMetrics
      });

      expect(step.isNewMaxSpeed(100)).toBe(false);
    });
  });

  describe('calculateDistanceFrom', () => {
    it('should calculate distance correctly', () => {
      const step = new SimulationStep('step-1', {
        timestamp: 10,
        position: new PositionVO(300, 400),
        speed: 60,
        acceleration: 2.0,
        performance: mockPerformanceMetrics
      });

      const previousPosition = new PositionVO(0, 0);
      const distance = step.calculateDistanceFrom(previousPosition);

      expect(distance).toBeCloseTo(500, 2); // 3-4-5 triangle
    });
  });
});
