import { describe, it, expect, beforeEach } from 'vitest';
import { HighScoresManager } from './HighScoresManager';

describe('HighScoresManager Local Storage Best Times', () => {
  beforeEach(() => {
    // Reset scores map
    HighScoresManager.getInstance().clearAllScores();
  });

  it('records initial solve time as new personal best', () => {
    const manager = HighScoresManager.getInstance();
    const result = manager.recordSolveTime('level-1', 45);

    expect(result.isNewRecord).toBe(true);
    expect(result.currentBest).toBe(45);
    expect(result.previousBest).toBeUndefined();

    const pb = manager.getPersonalBest('level-1');
    expect(pb?.bestTimeSeconds).toBe(45);
    expect(manager.getFormattedPersonalBest('level-1')).toBe('00:45');
  });

  it('updates personal best when player solves faster', () => {
    const manager = HighScoresManager.getInstance();
    manager.recordSolveTime('level-1', 50);

    // Faster solve time (35s < 50s)
    const fasterResult = manager.recordSolveTime('level-1', 35);
    expect(fasterResult.isNewRecord).toBe(true);
    expect(fasterResult.previousBest).toBe(50);
    expect(fasterResult.currentBest).toBe(35);
    expect(manager.getFormattedPersonalBest('level-1')).toBe('00:35');
  });

  it('preserves existing personal best when new attempt is slower', () => {
    const manager = HighScoresManager.getInstance();
    manager.recordSolveTime('level-2', 40);

    // Slower solve time (65s > 40s)
    const slowerResult = manager.recordSolveTime('level-2', 65);
    expect(slowerResult.isNewRecord).toBe(false);
    expect(slowerResult.currentBest).toBe(40);
    expect(slowerResult.previousBest).toBe(40);
    expect(manager.getFormattedPersonalBest('level-2')).toBe('00:40');
  });

  it('notifies listeners when a new high score is established', () => {
    const manager = HighScoresManager.getInstance();
    let notifiedLevel: string | undefined;

    const unsubscribe = manager.subscribe((levelId) => {
      notifiedLevel = levelId;
    });

    manager.recordSolveTime('level-3', 28);
    expect(notifiedLevel).toBe('level-3');

    unsubscribe();
  });
});
