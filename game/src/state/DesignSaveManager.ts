/**
 * DesignSaveManager: LocalStorage-based Multi-Slot Design Save & Resume System
 *
 * Enables players to save named design snapshots, revisions, and experimental
 * prototypes for any level across Structures, Circuits, and Machines.
 * Persists full design models to localStorage and allows instant resumption,
 * deletion, and revision tracking.
 */

export interface DesignStats {
  partCount: number;
  cost: number;
  summary?: string;
}

export interface SavedDesign<T = unknown> {
  id: string;
  discipline: 'structures' | 'circuits' | 'machines';
  levelId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  stats: DesignStats;
  data: T;
}

export const DESIGN_STORAGE_KEY = 'engineering-forge-saved-designs-v1';

export type DesignSaveListener = (designs: SavedDesign[]) => void;

export class DesignSaveManager {
  private static instance: DesignSaveManager | null = null;
  private memoryCache: Map<string, SavedDesign> = new Map();
  private listeners: Set<DesignSaveListener> = new Set();
  private initialized = false;

  private constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === DESIGN_STORAGE_KEY) {
          this.loadFromStorage();
          this.notify();
        }
      });
    }
  }

  public static getInstance(): DesignSaveManager {
    if (!DesignSaveManager.instance) {
      DesignSaveManager.instance = new DesignSaveManager();
    }
    return DesignSaveManager.instance;
  }

  private loadFromStorage(): void {
    this.memoryCache.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(DESIGN_STORAGE_KEY);
        if (raw) {
          const list = JSON.parse(raw) as SavedDesign[];
          if (Array.isArray(list)) {
            for (const item of list) {
              if (item && item.id && item.discipline && item.levelId) {
                this.memoryCache.set(item.id, item);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Failed to read saved designs from localStorage:', err);
      }
    }
    this.initialized = true;
  }

  private syncToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const list = Array.from(this.memoryCache.values());
        localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(list));
      } catch (err) {
        console.warn('Failed to write saved designs to localStorage:', err);
      }
    }
    this.notify();
  }

  private notify(): void {
    const list = Array.from(this.memoryCache.values());
    for (const listener of this.listeners) {
      try {
        listener(list);
      } catch (err) {
        console.error('Error in DesignSaveManager listener:', err);
      }
    }
  }

  /**
   * Save a new design snapshot or update an existing one.
   */
  public saveDesign<T>(
    discipline: 'structures' | 'circuits' | 'machines',
    levelId: string,
    name: string,
    data: T,
    stats: DesignStats,
    existingId?: string,
  ): SavedDesign<T> {
    if (!this.initialized) this.loadFromStorage();

    const id = existingId && this.memoryCache.has(existingId)
      ? existingId
      : `design_${discipline}_${levelId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const existing = this.memoryCache.get(id);
    const now = Date.now();

    const record: SavedDesign<T> = {
      id,
      discipline,
      levelId,
      name: name.trim() || `Design ${new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      stats,
      data,
    };

    this.memoryCache.set(id, record as SavedDesign);
    this.syncToStorage();
    return record;
  }

  /**
   * Get all saved designs for a specific level, sorted newest first.
   */
  public getDesignsForLevel<T = unknown>(
    discipline: 'structures' | 'circuits' | 'machines',
    levelId: string,
  ): SavedDesign<T>[] {
    if (!this.initialized) this.loadFromStorage();

    return Array.from(this.memoryCache.values())
      .filter((d) => d.discipline === discipline && d.levelId === levelId)
      .sort((a, b) => b.updatedAt - a.updatedAt) as SavedDesign<T>[];
  }

  /**
   * Get the most recently updated design for a level, or null if none saved.
   */
  public getLatestDesign<T = unknown>(
    discipline: 'structures' | 'circuits' | 'machines',
    levelId: string,
  ): SavedDesign<T> | null {
    const list = this.getDesignsForLevel<T>(discipline, levelId);
    return list.length > 0 ? list[0] : null;
  }

  /**
   * Retrieve a specific design by ID.
   */
  public getDesignById<T = unknown>(id: string): SavedDesign<T> | null {
    if (!this.initialized) this.loadFromStorage();
    return (this.memoryCache.get(id) as SavedDesign<T>) ?? null;
  }

  /**
   * Delete a saved design by ID.
   */
  public deleteDesign(id: string): boolean {
    if (!this.initialized) this.loadFromStorage();
    const removed = this.memoryCache.delete(id);
    if (removed) {
      this.syncToStorage();
    }
    return removed;
  }

  /**
   * Rename an existing saved design.
   */
  public renameDesign(id: string, newName: string): boolean {
    if (!this.initialized) this.loadFromStorage();
    const existing = this.memoryCache.get(id);
    if (!existing) return false;

    existing.name = newName.trim() || existing.name;
    existing.updatedAt = Date.now();
    this.memoryCache.set(id, existing);
    this.syncToStorage();
    return true;
  }

  /**
   * Clear all designs (e.g. for testing or full reset).
   */
  public clearAll(): void {
    this.memoryCache.clear();
    this.syncToStorage();
  }

  /**
   * Subscribe to design save/delete changes.
   */
  public subscribe(listener: DesignSaveListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const designSaveManager = DesignSaveManager.getInstance();
