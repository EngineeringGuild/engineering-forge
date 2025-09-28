// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/entities/TestResult.ts

import { BaseEntity } from '../../../../shared/domain/BaseEntity';
import { PerformanceMetrics } from '../value-objects/PerformanceMetrics';

export type TestType =
  | 'acceleration'
  | 'top_speed'
  | 'handling'
  | 'efficiency'
  | 'endurance'
  | 'comprehensive';
export type TestStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface TestResultProps {
  testType: TestType;
  status: TestStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  performance: PerformanceMetrics;
  score: number; // 0-100
  passed: boolean;
  notes?: string;
  environment: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    trackCondition: 'dry' | 'wet' | 'snow' | 'ice';
  };
}

export class TestResult extends BaseEntity<string> {
  private _testType: TestType;
  private _status: TestStatus;
  private _startTime: Date;
  private _endTime?: Date;
  private _duration?: number;
  private _performance: PerformanceMetrics;
  private _score: number;
  private _passed: boolean;
  private _notes?: string;
  private _environment: TestResultProps['environment'];

  constructor(id: string, props: TestResultProps) {
    super(id);
    this._testType = props.testType;
    this._status = props.status;
    this._startTime = props.startTime;
    this._endTime = props.endTime;
    this._duration = props.duration;
    this._performance = props.performance;
    this._score = props.score;
    this._passed = props.passed;
    this._notes = props.notes;
    this._environment = props.environment;
  }

  get testType(): TestType {
    return this._testType;
  }

  get status(): TestStatus {
    return this._status;
  }

  get startTime(): Date {
    return this._startTime;
  }

  get endTime(): Date | undefined {
    return this._endTime;
  }

  get duration(): number | undefined {
    return this._duration;
  }

  get performance(): PerformanceMetrics {
    return this._performance;
  }

  get score(): number {
    return this._score;
  }

  get passed(): boolean {
    return this._passed;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get environment(): TestResultProps['environment'] {
    return this._environment;
  }

  public startTest(): void {
    if (this._status !== 'pending') {
      throw new Error('Test can only be started if it is pending');
    }

    this._status = 'running';
    this._startTime = new Date();
    this.updateTimestamp();
  }

  public completeTest(
    performance: PerformanceMetrics,
    score: number,
    passed: boolean,
    notes?: string
  ): void {
    if (this._status !== 'running') {
      throw new Error('Test can only be completed if it is running');
    }

    this._status = 'completed';
    this._endTime = new Date();
    this._duration = (this._endTime.getTime() - this._startTime.getTime()) / 1000;
    this._performance = performance;
    this._score = score;
    this._passed = passed;
    this._notes = notes;
    this.updateTimestamp();
  }

  public failTest(reason: string): void {
    if (this._status !== 'running') {
      throw new Error('Test can only be failed if it is running');
    }

    this._status = 'failed';
    this._endTime = new Date();
    this._duration = (this._endTime.getTime() - this._startTime.getTime()) / 1000;
    this._notes = reason;
    this.updateTimestamp();
  }

  public getGrade(): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    if (this._score >= 95) return 'A+';
    if (this._score >= 90) return 'A';
    if (this._score >= 80) return 'B';
    if (this._score >= 70) return 'C';
    if (this._score >= 60) return 'D';
    return 'F';
  }

  public getPerformanceRating(): 'excellent' | 'good' | 'average' | 'poor' | 'terrible' {
    if (this._score >= 85) return 'excellent';
    if (this._score >= 70) return 'good';
    if (this._score >= 55) return 'average';
    if (this._score >= 40) return 'poor';
    return 'terrible';
  }
}
