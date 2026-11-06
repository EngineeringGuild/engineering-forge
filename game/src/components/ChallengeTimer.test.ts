import { describe, it, expect } from 'vitest';
import {
  formatChallengeTime,
  formatChallengeTimeWithDecimals,
} from './timerUtils';

describe('ChallengeTimer and Time Formatting', () => {
  it('formats zero seconds accurately as 00:00', () => {
    expect(formatChallengeTime(0)).toBe('00:00');
    expect(formatChallengeTimeWithDecimals(0)).toBe('00:00.0');
  });

  it('formats seconds less than a minute correctly', () => {
    expect(formatChallengeTime(9)).toBe('00:09');
    expect(formatChallengeTime(45)).toBe('00:45');
    expect(formatChallengeTimeWithDecimals(45.67)).toBe('00:45.6');
  });

  it('formats multiple minutes and boundaries correctly', () => {
    expect(formatChallengeTime(60)).toBe('01:00');
    expect(formatChallengeTime(75)).toBe('01:15');
    expect(formatChallengeTime(605)).toBe('10:05');
    expect(formatChallengeTime(3600)).toBe('60:00');
  });

  it('handles negative or invalid seconds defensively', () => {
    expect(formatChallengeTime(-10)).toBe('00:00');
    expect(formatChallengeTimeWithDecimals(-5)).toBe('00:00.0');
  });
});
