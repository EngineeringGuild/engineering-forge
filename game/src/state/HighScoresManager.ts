/**
 * HighScoresManager: Local Persistence for Level Completion Times
 * 
 * Tracks, persists, and compares personal best solve times (in seconds)
 * per level across all challenge disciplines (structures, circuits, vehicles)
 * using browser localStorage.
 */

import { formatChallengeTime, formatChallengeTimeWithDecimals } from '../components/timerUtils';

export interface LevelHighScore {
  levelId: string;
  bestTimeSeconds: number;
  recordedAt: string; // ISO 8601 string
}

export type HighScoresListener = (levelId?: string) => void;

const HIGH_SCORES_STORAGE_KEY = 'engineering-forge-high-scores-v1';

export class HighScoresManager {
  private static instance: HighScoresManager | null = null;
  private scores: Map<string, LevelHighScore> = new Map();
  private listeners: Set<HighScoresListener> = new Set();

  private constructor() {
    this.loadFromStorage();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === HIGH_SCORES_STORAGE_KEY) {
          this.loadFromStorage();
          this.notify();
        }
      });
    }
  }

  public static getInstance(): HighScoresManager {
    if (!HighScoresManager.instance) {
      HighScoresManager.instance = new HighScoresManager();
    }
    return HighScoresManager.instance;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const raw = localStorage.getItem(HIGH_SCORES_STORAGE_KEY);
      if (raw) {
        const parsed: Record<string, LevelHighScore> = JSON.parse(raw);
        this.scores.clear();
        for (const [lvlId, score] of Object.entries(parsed)) {
          if (score && typeof score.bestTimeSeconds === 'number' && score.bestTimeSeconds > 0) {
            this.scores.set(lvlId, score);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to parse high scores from localStorage', err);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const data: Record<string, LevelHighScore> = {};
      for (const [lvlId, score] of this.scores.entries()) {
        data[lvlId] = score;
      }
      localStorage.setItem(HIGH_SCORES_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Failed to save high scores to localStorage', err);
    }
  }

  public subscribe(listener: HighScoresListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(levelId?: string): void {
    for (const listener of this.listeners) {
      try {
        listener(levelId);
      } catch (err) {
        console.error('Error in HighScoresManager listener', err);
      }
    }
  }

  /**
   * Retrieves the personal best time record for a level, if any.
   */
  public getPersonalBest(levelId: string): LevelHighScore | null {
    return this.scores.get(levelId) ?? null;
  }

  /**
   * Retrieves the formatted personal best time string (e.g., '01:24'), or null if unattempted.
   */
  public getFormattedPersonalBest(levelId: string, withDecimals: boolean = false): string | null {
    const record = this.scores.get(levelId);
    if (!record) return null;
    return withDecimals
      ? formatChallengeTimeWithDecimals(record.bestTimeSeconds)
      : formatChallengeTime(record.bestTimeSeconds);
  }

  /**
   * Records a level solve time.
   * If a previous record exists, updates only if the new time is strictly faster (lower seconds).
   * Returns an object indicating if this is a new personal best record.
   */
  public recordSolveTime(
    levelId: string,
    elapsedSeconds: number,
  ): { isNewRecord: boolean; previousBest?: number; currentBest: number } {
    if (elapsedSeconds <= 0) {
      const existing = this.scores.get(levelId)?.bestTimeSeconds ?? 0;
      return { isNewRecord: false, previousBest: existing, currentBest: existing };
    }

    const existing = this.scores.get(levelId);

    if (!existing || elapsedSeconds < existing.bestTimeSeconds) {
      const previousBest = existing?.bestTimeSeconds;
      const record: LevelHighScore = {
        levelId,
        bestTimeSeconds: elapsedSeconds,
        recordedAt: new Date().toISOString(),
      };
      this.scores.set(levelId, record);
      this.saveToStorage();
      this.notify(levelId);

      return {
        isNewRecord: true,
        previousBest,
        currentBest: elapsedSeconds,
      };
    }

    return {
      isNewRecord: false,
      previousBest: existing.bestTimeSeconds,
      currentBest: existing.bestTimeSeconds,
    };
  }

  /**
   * Resets all high score records.
   */
  public clearAllScores(): void {
    this.scores.clear();
    this.saveToStorage();
    this.notify();
  }
}

export const highScoresManager = HighScoresManager.getInstance();
