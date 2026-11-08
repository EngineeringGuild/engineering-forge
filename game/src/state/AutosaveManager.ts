/**
 * AutosaveManager: Construction Project State Persistence
 *
 * Persists the exact state of active construction projects (node coordinates,
 * member/edge connections, selected materials, and vehicle powertrain setups)
 * to localStorage every 30 seconds and upon component unmount / window unload.
 * Allows users to resume precisely where they left off across reloads and navigation.
 */

export interface AutosaveRecord<T = unknown> {
  discipline: string;
  levelId: string;
  timestamp: number;
  data: T;
}

export type AutosaveListener = (record: AutosaveRecord) => void;

export const AUTOSAVE_STORAGE_PREFIX = 'engineering-forge-autosave-';

export class AutosaveManager {
  private static instance: AutosaveManager | null = null;
  private memoryCache: Map<string, AutosaveRecord> = new Map();
  private listeners: Set<AutosaveListener> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith(AUTOSAVE_STORAGE_PREFIX) && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue) as AutosaveRecord;
            this.memoryCache.set(e.key, parsed);
            this.notify(parsed);
          } catch {
            // Ignore corrupted remote storage events
          }
        }
      });
    }
  }

  public static getInstance(): AutosaveManager {
    if (!AutosaveManager.instance) {
      AutosaveManager.instance = new AutosaveManager();
    }
    return AutosaveManager.instance;
  }

  public getStorageKey(discipline: string, levelId: string): string {
    return `${AUTOSAVE_STORAGE_PREFIX}${discipline}-${levelId}`;
  }

  /**
   * Persists project construction state to memory and localStorage.
   */
  public save<T>(discipline: string, levelId: string, data: T): AutosaveRecord<T> | null {
    const key = this.getStorageKey(discipline, levelId);
    const record: AutosaveRecord<T> = {
      discipline,
      levelId,
      timestamp: Date.now(),
      data,
    };

    // Always store in memory cache
    this.memoryCache.set(key, record as AutosaveRecord);

    // Sync to browser localStorage when available
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(key, JSON.stringify(record));
      } catch (err) {
        console.warn('Failed to persist construction autosave to localStorage:', err);
      }
    }

    this.notify(record as AutosaveRecord);
    return record;
  }

  /**
   * Loads an autosaved construction project if present.
   */
  public load<T>(discipline: string, levelId: string): AutosaveRecord<T> | null {
    const key = this.getStorageKey(discipline, levelId);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as AutosaveRecord<T>;
          if (parsed && typeof parsed === 'object' && parsed.data) {
            this.memoryCache.set(key, parsed as AutosaveRecord);
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Failed to load construction autosave from localStorage:', err);
      }
    }

    // Return cached in-memory instance
    return (this.memoryCache.get(key) as AutosaveRecord<T>) ?? null;
  }

  /**
   * Checks whether an autosave exists for the given discipline and level.
   */
  public hasAutosave(discipline: string, levelId: string): boolean {
    return this.load(discipline, levelId) !== null;
  }

  /**
   * Returns the epoch millisecond timestamp of the latest autosave, or null.
   */
  public getLastSavedTime(discipline: string, levelId: string): number | null {
    const record = this.load(discipline, levelId);
    return record ? record.timestamp : null;
  }

  /**
   * Removes an autosaved project from storage and memory.
   */
  public clear(discipline: string, levelId: string): void {
    const key = this.getStorageKey(discipline, levelId);
    this.memoryCache.delete(key);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        console.warn('Failed to clear autosave from localStorage:', err);
      }
    }
  }

  /**
   * Clears all construction project autosaves across all disciplines and levels.
   */
  public clearAll(): void {
    this.memoryCache.clear();

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(AUTOSAVE_STORAGE_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        for (const key of keysToRemove) {
          localStorage.removeItem(key);
        }
      } catch (err) {
        console.warn('Failed to clear all autosaves:', err);
      }
    }
  }

  /**
   * Subscribes to autosave events across the application.
   */
  public subscribe(listener: AutosaveListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(record: AutosaveRecord): void {
    for (const listener of this.listeners) {
      try {
        listener(record);
      } catch (err) {
        console.error('Error in AutosaveManager listener:', err);
      }
    }
  }
}

export const autosaveManager = AutosaveManager.getInstance();
