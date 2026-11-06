/**
 * ProgressManager: Unified Achievement & Level Progress Tracking System
 * 
 * Centralized manager that persists and synchronizes user completion state,
 * star ratings, and best scores across all Forge disciplines (Structures,
 * Circuits, and Machines/Vehicles). Persists to localStorage with automatic
 * synchronization and reactive subscription hooks.
 */

import { LEVELS } from '../content/levels';
import { CIRCUIT_LEVELS } from '../content/circuitLevels';
import { VEHICLE_LEVELS } from '../content/vehicleLevels';
import { useGameStore } from './gameStore';
import { useCircuitStore } from './circuitStore';
import { useVehicleStore } from './vehicleStore';

export type PackId = 'structures' | 'circuits' | 'machines';

export interface LevelAchievementRecord {
  levelId: string;
  packId: PackId;
  completed: boolean;
  stars: 0 | 1 | 2 | 3;
  bestCost?: number;
  completedAt?: string;
}

export interface PackProgressSummary {
  packId: PackId;
  packName: string;
  completed: number;
  total: number;
  earnedStars: number;
  maxStars: number;
  percent: number;
  isAllCompleted: boolean;
}

export interface GlobalProgressSummary {
  completedLevels: number;
  totalLevels: number;
  earnedStars: number;
  maxStars: number;
  percent: number;
  isAllCompleted: boolean;
  packs: Record<PackId, PackProgressSummary>;
}

export type ProgressListener = () => void;

const PROGRESS_STORAGE_KEYS = {
  structures: 'engineering-forge-progress',
  circuits: 'engineering-forge-circuits-progress',
  vehicles: 'engineering-forge-vehicles-progress',
  metadata: 'engineering-forge-progress-metadata-v1',
};

export class ProgressManager {
  private static instance: ProgressManager | null = null;
  private listeners: Set<ProgressListener> = new Set();

  private constructor() {
    // Listen to changes across all stores
    if (typeof window !== 'undefined') {
      useGameStore.subscribe(() => this.notify());
      useCircuitStore.subscribe(() => this.notify());
      useVehicleStore.subscribe(() => this.notify());
      window.addEventListener('storage', (e) => {
        if (Object.values(PROGRESS_STORAGE_KEYS).includes(e.key ?? '')) {
          this.notify();
        }
      });
    }
  }

  public static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager();
    }
    return ProgressManager.instance;
  }

  public subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error in ProgressManager listener', err);
      }
    }
  }

  /**
   * Returns progress summary for a specific engineering pack.
   */
  public getPackProgress(packId: PackId): PackProgressSummary {
    switch (packId) {
      case 'structures': {
        const progress = useGameStore.getState().progress;
        const total = LEVELS.length;
        const completed = LEVELS.filter((l) => (progress[l.id]?.stars ?? 0) > 0).length;
        const earnedStars = LEVELS.reduce(
          (acc, l) => acc + (progress[l.id]?.stars ?? 0),
          0,
        );
        const maxStars = total * 3;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          packId,
          packName: 'Structures',
          completed,
          total,
          earnedStars,
          maxStars,
          percent,
          isAllCompleted: total > 0 && completed === total,
        };
      }
      case 'circuits': {
        const progress = useCircuitStore.getState().progress;
        const total = CIRCUIT_LEVELS.length;
        const completed = CIRCUIT_LEVELS.filter((l) => (progress[l.id]?.stars ?? 0) > 0).length;
        const earnedStars = CIRCUIT_LEVELS.reduce(
          (acc, l) => acc + (progress[l.id]?.stars ?? 0),
          0,
        );
        const maxStars = total * 3;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          packId,
          packName: 'Circuits',
          completed,
          total,
          earnedStars,
          maxStars,
          percent,
          isAllCompleted: total > 0 && completed === total,
        };
      }
      case 'machines': {
        const progress = useVehicleStore.getState().progress;
        const total = VEHICLE_LEVELS.length;
        const completed = VEHICLE_LEVELS.filter((l) => (progress[l.id]?.stars ?? 0) > 0).length;
        const earnedStars = VEHICLE_LEVELS.reduce(
          (acc, l) => acc + (progress[l.id]?.stars ?? 0),
          0,
        );
        const maxStars = total * 3;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          packId,
          packName: 'Machines',
          completed,
          total,
          earnedStars,
          maxStars,
          percent,
          isAllCompleted: total > 0 && completed === total,
        };
      }
    }
  }

  /**
   * Returns aggregated progress across all packs in Engineering Forge.
   */
  public getGlobalProgress(): GlobalProgressSummary {
    const structures = this.getPackProgress('structures');
    const circuits = this.getPackProgress('circuits');
    const machines = this.getPackProgress('machines');

    const completedLevels = structures.completed + circuits.completed + machines.completed;
    const totalLevels = structures.total + circuits.total + machines.total;
    const earnedStars = structures.earnedStars + circuits.earnedStars + machines.earnedStars;
    const maxStars = structures.maxStars + circuits.maxStars + machines.maxStars;
    const percent = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

    return {
      completedLevels,
      totalLevels,
      earnedStars,
      maxStars,
      percent,
      isAllCompleted: totalLevels > 0 && completedLevels === totalLevels,
      packs: {
        structures,
        circuits,
        machines,
      },
    };
  }

  /**
   * Checks whether a specific level has been marked completed (stars > 0).
   */
  public isLevelCompleted(packId: PackId, levelId: string): boolean {
    return this.getStarsForLevel(packId, levelId) > 0;
  }

  /**
   * Returns stars awarded for a level (0 to 3).
   */
  public getStarsForLevel(packId: PackId, levelId: string): number {
    switch (packId) {
      case 'structures':
        return useGameStore.getState().progress[levelId]?.stars ?? 0;
      case 'circuits':
        return useCircuitStore.getState().progress[levelId]?.stars ?? 0;
      case 'machines':
        return useVehicleStore.getState().progress[levelId]?.stars ?? 0;
    }
  }

  /**
   * Checks if a level is unlocked.
   */
  public isLevelUnlocked(packId: PackId, levelId: string): boolean {
    switch (packId) {
      case 'structures':
        return useGameStore.getState().isLevelUnlocked(levelId);
      case 'circuits':
        return useCircuitStore.getState().isLevelUnlocked(levelId);
      case 'machines':
        return useVehicleStore.getState().isLevelUnlocked(levelId);
    }
  }

  /**
   * Records a level completion into the appropriate persistent store,
   * guaranteeing that best stars are preserved and best cost is tracked.
   */
  public recordLevelCompletion(
    packId: PackId,
    levelId: string,
    stars: 1 | 2 | 3,
    cost: number,
  ): void {
    switch (packId) {
      case 'structures': {
        const store = useGameStore.getState();
        const existing = store.progress[levelId];
        const bestStars = (existing ? Math.max(existing.stars, stars) : stars) as 1 | 2 | 3;
        const bestCost = existing ? Math.min(existing.bestCost, cost) : cost;
        useGameStore.setState({
          progress: {
            ...store.progress,
            [levelId]: { stars: bestStars, bestCost },
          },
        });
        break;
      }
      case 'circuits': {
        const store = useCircuitStore.getState();
        const existing = store.progress[levelId];
        const bestStars = (existing ? Math.max(existing.stars, stars) : stars) as 1 | 2 | 3;
        const bestCost = existing ? Math.min(existing.bestCost, cost) : cost;
        useCircuitStore.setState({
          progress: {
            ...store.progress,
            [levelId]: { stars: bestStars, bestCost },
          },
        });
        break;
      }
      case 'machines': {
        const store = useVehicleStore.getState();
        const existing = store.progress[levelId];
        const bestStars = (existing ? Math.max(existing.stars, stars) : stars) as 1 | 2 | 3;
        const bestCost = existing ? Math.min(existing.bestCost, cost) : cost;
        useVehicleStore.setState({
          progress: {
            ...store.progress,
            [levelId]: { stars: bestStars, bestCost },
          },
        });
        break;
      }
    }
    this.notify();
  }

  /**
   * Clears progress for an individual pack.
   */
  public resetPackProgress(packId: PackId): void {
    switch (packId) {
      case 'structures':
        useGameStore.setState({ progress: {} });
        break;
      case 'circuits':
        useCircuitStore.setState({ progress: {} });
        break;
      case 'machines':
        useVehicleStore.setState({ progress: {} });
        break;
    }
    this.notify();
  }

  /**
   * Clears all progress across the entire application.
   */
  public resetAllProgress(): void {
    useGameStore.setState({ progress: {} });
    useCircuitStore.setState({ progress: {} });
    useVehicleStore.setState({ progress: {} });
    this.notify();
  }
}

export const progressManager = ProgressManager.getInstance();
