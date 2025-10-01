// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/services/PerformanceTestService.ts

import { Component } from '../entities/Component';
import { TestResult, TestType } from '../entities/TestResult';
import { PerformanceMetrics } from '../value-objects/PerformanceMetrics';
import { PhysicsSimulationService } from './PhysicsSimulationService';

export interface TestConfiguration {
  testType: TestType;
  duration: number; // in seconds
  environment: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    trackCondition: 'dry' | 'wet' | 'snow' | 'ice';
  };
  targetPerformance?: PerformanceMetrics;
  passThreshold: number; // 0-100
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  testType: TestType;
  duration: number;
  environment: TestConfiguration['environment'];
  targetPerformance: PerformanceMetrics;
  passThreshold: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  rewards: {
    xp: number;
    credits: number;
    achievements?: string[];
  };
}

export class PerformanceTestService {
  constructor(private physicsService: PhysicsSimulationService) {}

  public async runTest(
    components: Component[],
    configuration: TestConfiguration
  ): Promise<TestResult> {
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const testResult = new TestResult(testId, {
      testType: configuration.testType,
      status: 'pending',
      startTime: new Date(),
      performance: new PerformanceMetrics({
        acceleration: 0,
        topSpeed: 0,
        handling: 0,
        fuelEfficiency: 0,
        weight: 0,
        power: 0,
        torque: 0,
        overall: 0
      }),
      score: 0,
      passed: false,
      environment: configuration.environment
    });

    try {
      testResult.startTest();

      // Simulate test duration
      await this.simulateTestDuration(configuration.duration);

      // Calculate performance based on test type
      const performance = this.calculateTestPerformance(components, configuration);

      // Calculate score
      const score = this.calculateTestScore(performance, configuration);

      // Determine if test passed
      const passed = score >= configuration.passThreshold;

      // Complete the test
      testResult.completeTest(
        performance,
        score,
        passed,
        this.generateTestNotes(performance, score)
      );

      return testResult;
    } catch (error) {
      testResult.failTest(error instanceof Error ? error.message : 'Unknown error occurred');
      return testResult;
    }
  }

  public getAvailableTestScenarios(): TestScenario[] {
    return [
      {
        id: 'acceleration_test_1',
        name: '0-100 km/h Acceleration Test',
        description: 'Test your car\'s acceleration from 0 to 100 km/h',
        testType: 'acceleration',
        duration: 30,
        environment: {
          temperature: 20,
          humidity: 50,
          windSpeed: 5,
          trackCondition: 'dry'
        },
        targetPerformance: new PerformanceMetrics({
          acceleration: 8.0,
          topSpeed: 0,
          handling: 0,
          fuelEfficiency: 0,
          weight: 0,
          power: 0,
          torque: 0,
          overall: 0
        }),
        passThreshold: 60,
        difficulty: 'easy',
        rewards: {
          xp: 50,
          credits: 100
        }
      },
      {
        id: 'top_speed_test_1',
        name: 'Top Speed Challenge',
        description: 'Reach maximum speed on a straight track',
        testType: 'top_speed',
        duration: 60,
        environment: {
          temperature: 25,
          humidity: 40,
          windSpeed: 10,
          trackCondition: 'dry'
        },
        targetPerformance: new PerformanceMetrics({
          acceleration: 0,
          topSpeed: 200,
          handling: 0,
          fuelEfficiency: 0,
          weight: 0,
          power: 0,
          torque: 0,
          overall: 0
        }),
        passThreshold: 70,
        difficulty: 'medium',
        rewards: {
          xp: 75,
          credits: 150
        }
      },
      {
        id: 'handling_test_1',
        name: 'Slalom Course',
        description: 'Navigate through a series of cones as fast as possible',
        testType: 'handling',
        duration: 45,
        environment: {
          temperature: 18,
          humidity: 60,
          windSpeed: 8,
          trackCondition: 'dry'
        },
        targetPerformance: new PerformanceMetrics({
          acceleration: 0,
          topSpeed: 0,
          handling: 80,
          fuelEfficiency: 0,
          weight: 0,
          power: 0,
          torque: 0,
          overall: 0
        }),
        passThreshold: 65,
        difficulty: 'medium',
        rewards: {
          xp: 60,
          credits: 120
        }
      },
      {
        id: 'efficiency_test_1',
        name: 'Fuel Economy Run',
        description: 'Complete a distance with maximum fuel efficiency',
        testType: 'efficiency',
        duration: 120,
        environment: {
          temperature: 22,
          humidity: 45,
          windSpeed: 3,
          trackCondition: 'dry'
        },
        targetPerformance: new PerformanceMetrics({
          acceleration: 0,
          topSpeed: 0,
          handling: 0,
          fuelEfficiency: 15,
          weight: 0,
          power: 0,
          torque: 0,
          overall: 0
        }),
        passThreshold: 55,
        difficulty: 'easy',
        rewards: {
          xp: 40,
          credits: 80
        }
      },
      {
        id: 'comprehensive_test_1',
        name: 'Complete Performance Test',
        description: 'Comprehensive test covering all performance aspects',
        testType: 'comprehensive',
        duration: 180,
        environment: {
          temperature: 20,
          humidity: 50,
          windSpeed: 5,
          trackCondition: 'dry'
        },
        targetPerformance: new PerformanceMetrics({
          acceleration: 6.0,
          topSpeed: 180,
          handling: 75,
          fuelEfficiency: 12,
          weight: 0,
          power: 0,
          torque: 0,
          overall: 80
        }),
        passThreshold: 75,
        difficulty: 'hard',
        rewards: {
          xp: 150,
          credits: 300,
          achievements: ['comprehensive_master']
        }
      }
    ];
  }

  private async simulateTestDuration(duration: number): Promise<void> {
    // Simulate test duration with a shorter delay for demo purposes
    const delay = Math.min(duration * 100, 2000); // Max 2 seconds for demo
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private calculateTestPerformance(
    components: Component[],
    configuration: TestConfiguration
  ): PerformanceMetrics {
    // Use physics service to calculate performance
    const physicsResult = this.physicsService.simulateProject({
      components,
      environment: {
        gravity: 9.81,
        airDensity: this.calculateAirDensity(configuration.environment),
        temperature: configuration.environment.temperature,
        windSpeed: configuration.environment.windSpeed
      }
    });

    // Adjust performance based on test type and environment
    return this.adjustPerformanceForTest(physicsResult.performance, configuration);
  }

  private calculateTestScore(
    performance: PerformanceMetrics,
    configuration: TestConfiguration
  ): number {
    let score = 0;

    switch (configuration.testType) {
      case 'acceleration':
        score = this.calculateAccelerationScore(performance, configuration);
        break;
      case 'top_speed':
        score = this.calculateTopSpeedScore(performance, configuration);
        break;
      case 'handling':
        score = this.calculateHandlingScore(performance, configuration);
        break;
      case 'efficiency':
        score = this.calculateEfficiencyScore(performance, configuration);
        break;
      case 'comprehensive':
        score = this.calculateComprehensiveScore(performance, configuration);
        break;
      default:
        score = performance.overall;
    }

    // Apply environment modifiers
    score = this.applyEnvironmentModifiers(score, configuration.environment);

    return Math.max(0, Math.min(100, score));
  }

  private calculateAccelerationScore(
    performance: PerformanceMetrics,
    configuration: TestConfiguration
  ): number {
    if (!configuration.targetPerformance) {
return performance.overall;
}

    const targetAcceleration = configuration.targetPerformance.acceleration;
    const actualAcceleration = performance.acceleration;

    // Lower acceleration time = higher score
    const ratio = targetAcceleration / actualAcceleration;
    return Math.min(100, ratio * 100);
  }

  private calculateTopSpeedScore(
    performance: PerformanceMetrics,
    configuration: TestConfiguration
  ): number {
    if (!configuration.targetPerformance) {
return performance.overall;
}

    const targetSpeed = configuration.targetPerformance.topSpeed;
    const actualSpeed = performance.topSpeed;

    const ratio = actualSpeed / targetSpeed;
    return Math.min(100, ratio * 100);
  }

  private calculateHandlingScore(
    performance: PerformanceMetrics,
    configuration: TestConfiguration
  ): number {
    if (!configuration.targetPerformance) {
return performance.overall;
}

    const targetHandling = configuration.targetPerformance.handling;
    const actualHandling = performance.handling;

    const ratio = actualHandling / targetHandling;
    return Math.min(100, ratio * 100);
  }

  private calculateEfficiencyScore(
    performance: PerformanceMetrics,
    configuration: TestConfiguration
  ): number {
    if (!configuration.targetPerformance) {
return performance.overall;
}

    const targetEfficiency = configuration.targetPerformance.fuelEfficiency;
    const actualEfficiency = performance.fuelEfficiency;

    const ratio = actualEfficiency / targetEfficiency;
    return Math.min(100, ratio * 100);
  }

  private calculateComprehensiveScore(
    performance: PerformanceMetrics,
    configuration: TestConfiguration
  ): number {
    if (!configuration.targetPerformance) {
return performance.overall;
}

    const target = configuration.targetPerformance;

    const accelerationScore = this.calculateAccelerationScore(performance, {
      ...configuration,
      targetPerformance: new PerformanceMetrics({
        acceleration: target.acceleration,
        topSpeed: 0,
        handling: 0,
        fuelEfficiency: 0,
        weight: target.weight,
        power: target.power,
        torque: target.torque,
        overall: target.overall
      })
    });
    const speedScore = this.calculateTopSpeedScore(performance, {
      ...configuration,
      targetPerformance: new PerformanceMetrics({
        acceleration: 0,
        topSpeed: target.topSpeed,
        handling: 0,
        fuelEfficiency: 0,
        weight: target.weight,
        power: target.power,
        torque: target.torque,
        overall: target.overall
      })
    });
    const handlingScore = this.calculateHandlingScore(performance, {
      ...configuration,
      targetPerformance: new PerformanceMetrics({
        acceleration: 0,
        topSpeed: 0,
        handling: target.handling,
        fuelEfficiency: 0,
        weight: target.weight,
        power: target.power,
        torque: target.torque,
        overall: target.overall
      })
    });
    const efficiencyScore = this.calculateEfficiencyScore(performance, {
      ...configuration,
      targetPerformance: new PerformanceMetrics({
        acceleration: 0,
        topSpeed: 0,
        handling: 0,
        fuelEfficiency: target.fuelEfficiency,
        weight: target.weight,
        power: target.power,
        torque: target.torque,
        overall: target.overall
      })
    });

    return (accelerationScore + speedScore + handlingScore + efficiencyScore) / 4;
  }

  private adjustPerformanceForTest(
    performance: PerformanceMetrics,
    configuration: TestConfiguration
  ): PerformanceMetrics {
    // Adjust performance based on environment conditions
    const temperatureFactor = 1 - Math.abs(configuration.environment.temperature - 20) * 0.01;
    const humidityFactor = 1 - configuration.environment.humidity * 0.005;
    const windFactor = 1 - configuration.environment.windSpeed * 0.02;
    const trackFactor = this.getTrackConditionFactor(configuration.environment.trackCondition);

    const adjustmentFactor = temperatureFactor * humidityFactor * windFactor * trackFactor;

    return new PerformanceMetrics({
      acceleration: performance.acceleration * adjustmentFactor,
      topSpeed: performance.topSpeed * adjustmentFactor,
      handling: performance.handling * adjustmentFactor,
      fuelEfficiency: performance.fuelEfficiency * adjustmentFactor,
      weight: performance.weight,
      power: performance.power,
      torque: performance.torque,
      overall: performance.overall * adjustmentFactor
    });
  }

  private applyEnvironmentModifiers(
    score: number,
    environment: TestConfiguration['environment']
  ): number {
    let modifiedScore = score;

    // Temperature modifier
    if (environment.temperature < 0 || environment.temperature > 35) {
      modifiedScore *= 0.9; // 10% penalty for extreme temperatures
    }

    // Humidity modifier
    if (environment.humidity > 80) {
      modifiedScore *= 0.95; // 5% penalty for high humidity
    }

    // Wind modifier
    if (environment.windSpeed > 15) {
      modifiedScore *= 0.9; // 10% penalty for strong winds
    }

    // Track condition modifier
    const trackModifier = this.getTrackConditionFactor(environment.trackCondition);
    modifiedScore *= trackModifier;

    return modifiedScore;
  }

  private getTrackConditionFactor(trackCondition: string): number {
    switch (trackCondition) {
      case 'dry':
        return 1.0;
      case 'wet':
        return 0.8;
      case 'snow':
        return 0.6;
      case 'ice':
        return 0.4;
      default:
        return 1.0;
    }
  }

  private calculateAirDensity(environment: TestConfiguration['environment']): number {
    // Simplified air density calculation based on temperature and humidity
    const baseDensity = 1.225; // kg/m³ at sea level, 15°C
    const temperatureFactor = 1 - (environment.temperature - 15) * 0.01;
    const humidityFactor = 1 - environment.humidity * 0.001;

    return baseDensity * temperatureFactor * humidityFactor;
  }

  private generateTestNotes(performance: PerformanceMetrics, score: number): string {
    const notes = [];

    if (score >= 90) {
      notes.push('Outstanding performance!');
    } else if (score >= 80) {
      notes.push('Excellent performance!');
    } else if (score >= 70) {
      notes.push('Good performance.');
    } else if (score >= 60) {
      notes.push('Average performance.');
    } else {
      notes.push('Performance needs improvement.');
    }

    if (performance.acceleration < 5) {
      notes.push('Excellent acceleration.');
    } else if (performance.acceleration > 10) {
      notes.push('Acceleration could be improved.');
    }

    if (performance.topSpeed > 200) {
      notes.push('Impressive top speed.');
    } else if (performance.topSpeed < 100) {
      notes.push('Top speed is limited.');
    }

    if (performance.handling > 80) {
      notes.push('Great handling characteristics.');
    } else if (performance.handling < 50) {
      notes.push('Handling needs work.');
    }

    return notes.join(' ');
  }
}
