/**
 * Save Service - Engineering Forge V1.0
 * /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/services/SaveService.ts
 *
 * Service for managing game saves with local storage and cloud backup
 */

import { GameSave, GameSaveData, SaveSlot } from '../entities/GameSave';

export interface SaveServiceConfig {
  maxSaveSlots: number;
  autoSaveInterval: number; // in minutes
  enableCloudSync: boolean;
  enableAutoBackup: boolean;
  maxBackups: number;
}

export interface SaveOperationResult {
  success: boolean;
  message: string;
  saveData?: GameSaveData;
  error?: string;
}

export interface BackupInfo {
  id: string;
  saveId: string;
  createdAt: Date;
  size: number;
  description: string;
}

export class SaveService {
  private config: SaveServiceConfig;
  private saveSlots: Map<string, SaveSlot> = new Map();
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, ((result: SaveOperationResult) => void)[]> = new Map();

  constructor(config: Partial<SaveServiceConfig> = {}) {
    this.config = {
      maxSaveSlots: 10,
      autoSaveInterval: 5,
      enableCloudSync: false,
      enableAutoBackup: true,
      maxBackups: 5,
      ...config
    };
  }

  // Initialize save service
  async initialize(userId: string): Promise<void> {
    await this.loadSaveSlots(userId);
    if (this.config.autoSaveInterval > 0) {
      this.startAutoSave();
    }
  }

  // Save operations
  async saveGame(
    userId: string,
    saveData: GameSaveData,
    slotNumber?: number
  ): Promise<SaveOperationResult> {
    try {
      const gameSave = new GameSave(saveData);
      const validation = gameSave.validate();

      if (!validation.isValid) {
        return {
          success: false,
          message: 'Save data validation failed',
          error: validation.errors.join(', ')
        };
      }

      // Determine slot number
      const targetSlot = slotNumber || this.getNextAvailableSlot(userId);
      if (targetSlot === -1) {
        return {
          success: false,
          message: 'No available save slots',
          error: 'Maximum number of save slots reached'
        };
      }

      // Update save metadata
      gameSave.updateMetadata({
        saveSize: gameSave.toJSON().length,
        checksum: 'calculated' // TODO: Implement public checksum method
      });

      // Save to slot
      const saveSlot: SaveSlot = {
        id: `slot_${userId}_${targetSlot}`,
        userId,
        slotNumber: targetSlot,
        saveData: gameSave.toData(),
        isEmpty: false,
        lastUsed: new Date()
      };

      // Save to localStorage
      await this.saveToLocalStorage(saveSlot);

      // Save to cloud if enabled
      if (this.config.enableCloudSync) {
        await this.saveToCloud(saveSlot);
      }

      // Create backup if enabled
      if (this.config.enableAutoBackup) {
        await this.createBackup(saveSlot);
      }

      // Update in-memory cache
      this.saveSlots.set(saveSlot.id, saveSlot);

      // Notify listeners
      this.notifyListeners('save', {
        success: true,
        message: `Game saved to slot ${targetSlot}`,
        saveData: gameSave.toData()
      });

      return {
        success: true,
        message: `Game saved to slot ${targetSlot}`,
        saveData: gameSave.toData()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to save game',
        error: errorMessage
      };
    }
  }

  async loadGame(userId: string, slotNumber: number): Promise<SaveOperationResult> {
    try {
      const slotId = `slot_${userId}_${slotNumber}`;
      let saveSlot = this.saveSlots.get(slotId);

      // Try to load from localStorage if not in cache
      if (!saveSlot) {
        saveSlot = await this.loadFromLocalStorage(slotId);
      }

      // Try cloud sync if local save not found
      if (!saveSlot && this.config.enableCloudSync) {
        saveSlot = await this.loadFromCloud(slotId);
      }

      if (!saveSlot || saveSlot.isEmpty) {
        return {
          success: false,
          message: 'No save data found in this slot',
          error: 'Save slot is empty'
        };
      }

      // Validate save data
      const gameSave = new GameSave(saveSlot.saveData!);
      const validation = gameSave.validate();
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Save data validation failed',
          error: validation.errors.join(', ')
        };
      }

      // Update last used
      saveSlot.lastUsed = new Date();
      await this.saveToLocalStorage(saveSlot);

      return {
        success: true,
        message: 'Game loaded successfully',
        saveData: gameSave.toData()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to load game',
        error: errorMessage
      };
    }
  }

  async deleteSave(userId: string, slotNumber: number): Promise<SaveOperationResult> {
    try {
      const slotId = `slot_${userId}_${slotNumber}`;
      const saveSlot = this.saveSlots.get(slotId);

      if (!saveSlot || saveSlot.isEmpty) {
        return {
          success: false,
          message: 'No save data found in this slot',
          error: 'Save slot is empty'
        };
      }

      // Delete from localStorage
      localStorage.removeItem(`save_${slotId}`);

      // Delete from cloud if enabled
      if (this.config.enableCloudSync) {
        await this.deleteFromCloud(slotId);
      }

      // Update in-memory cache
      saveSlot.saveData = null;
      saveSlot.isEmpty = true;
      this.saveSlots.set(slotId, saveSlot);

      return {
        success: true,
        message: 'Save deleted successfully'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to delete save',
        error: errorMessage
      };
    }
  }

  // Save slot management
  getSaveSlots(userId: string): SaveSlot[] {
    const slots: SaveSlot[] = [];
    for (let i = 1; i <= this.config.maxSaveSlots; i++) {
      const slotId = `slot_${userId}_${i}`;
      const slot = this.saveSlots.get(slotId) || {
        id: slotId,
        userId,
        slotNumber: i,
        saveData: null,
        isEmpty: true,
        lastUsed: new Date()
      };
      slots.push(slot);
    }
    return slots;
  }

  getSaveSlot(userId: string, slotNumber: number): SaveSlot | null {
    const slotId = `slot_${userId}_${slotNumber}`;
    return this.saveSlots.get(slotId) || null;
  }

  private getNextAvailableSlot(userId: string): number {
    for (let i = 1; i <= this.config.maxSaveSlots; i++) {
      const slotId = `slot_${userId}_${i}`;
      const slot = this.saveSlots.get(slotId);
      if (!slot || slot.isEmpty) {
        return i;
      }
    }
    return -1;
  }

  // Local storage operations
  private async saveToLocalStorage(saveSlot: SaveSlot): Promise<void> {
    const key = `save_${saveSlot.id}`;
    const data = JSON.stringify(saveSlot);
    localStorage.setItem(key, data);
  }

  private async loadFromLocalStorage(slotId: string): Promise<SaveSlot | undefined> {
    const key = `save_${slotId}`;
    const data = localStorage.getItem(key);
    if (!data) {
return undefined;
}

    try {
      const saveSlot = JSON.parse(data) as SaveSlot;
      // Convert date strings back to Date objects
      saveSlot.lastUsed = new Date(saveSlot.lastUsed);
      if (saveSlot.saveData) {
        saveSlot.saveData.createdAt = new Date(saveSlot.saveData.createdAt);
        saveSlot.saveData.updatedAt = new Date(saveSlot.saveData.updatedAt);
        saveSlot.saveData.lastPlayed = new Date(saveSlot.saveData.lastPlayed);
      }
      return saveSlot;
    } catch (error) {
      console.error('Failed to parse save slot from localStorage:', error);
      return undefined;
    }
  }

  private async loadSaveSlots(userId: string): Promise<void> {
    for (let i = 1; i <= this.config.maxSaveSlots; i++) {
      const slotId = `slot_${userId}_${i}`;
      const saveSlot = await this.loadFromLocalStorage(slotId);
      if (saveSlot) {
        this.saveSlots.set(slotId, saveSlot);
      }
    }
  }

  // Cloud operations (placeholder implementation)
  private async saveToCloud(saveSlot: SaveSlot): Promise<void> {
    // TODO: Implement cloud save functionality
    console.log('Cloud save not implemented yet:', saveSlot.id);
  }

  private async loadFromCloud(slotId: string): Promise<SaveSlot | undefined> {
    // TODO: Implement cloud load functionality
    console.log('Cloud load not implemented yet:', slotId);
    return undefined;
  }

  private async deleteFromCloud(slotId: string): Promise<void> {
    // TODO: Implement cloud delete functionality
    console.log('Cloud delete not implemented yet:', slotId);
  }

  // Backup operations
  private async createBackup(saveSlot: SaveSlot): Promise<void> {
    if (!saveSlot.saveData) {
return;
}

    const backup: BackupInfo = {
      id: `backup_${saveSlot.id}_${Date.now()}`,
      saveId: saveSlot.id,
      createdAt: new Date(),
      size: JSON.stringify(saveSlot.saveData).length,
      description: `Auto backup - ${new Date().toLocaleString()}`
    };

    // Store backup in localStorage
    const backupKey = `backup_${backup.id}`;
    localStorage.setItem(backupKey, JSON.stringify(backup));

    // Clean up old backups
    await this.cleanupOldBackups(saveSlot.id);
  }

  private async cleanupOldBackups(saveId: string): Promise<void> {
    const backups: BackupInfo[] = [];

    // Find all backups for this save
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`backup_${saveId}_`)) {
        try {
          const backup = JSON.parse(localStorage.getItem(key) || '') as BackupInfo;
          backup.createdAt = new Date(backup.createdAt);
          backups.push(backup);
        } catch (error) {
          console.error('Failed to parse backup:', error);
        }
      }
    }

    // Sort by creation date (newest first)
    backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Remove excess backups
    if (backups.length > this.config.maxBackups) {
      const backupsToRemove = backups.slice(this.config.maxBackups);
      for (const backup of backupsToRemove) {
        localStorage.removeItem(`backup_${backup.id}`);
      }
    }
  }

  // Auto-save functionality
  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(
      () => {
        // Auto-save logic would be implemented here
        // This would require access to current game state
        console.log('Auto-save triggered');
      },
      this.config.autoSaveInterval * 60 * 1000
    );
  }

  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // Event listeners
  addEventListener(event: string, callback: (result: SaveOperationResult) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: (result: SaveOperationResult) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, result: SaveOperationResult): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(result));
    }
  }

  // Utility methods
  getSaveSize(userId: string, slotNumber: number): number {
    const slot = this.getSaveSlot(userId, slotNumber);
    return slot?.saveData?.metadata.saveSize || 0;
  }

  getTotalSavesSize(userId: string): number {
    let totalSize = 0;
    for (let i = 1; i <= this.config.maxSaveSlots; i++) {
      totalSize += this.getSaveSize(userId, i);
    }
    return totalSize;
  }

  exportSave(userId: string, slotNumber: number): void {
    const slot = this.getSaveSlot(userId, slotNumber);
    if (slot?.saveData) {
      const gameSave = new GameSave(slot.saveData);
      gameSave.exportToFile();
    }
  }

  async importSave(userId: string, file: File): Promise<SaveOperationResult> {
    try {
      const gameSave = await GameSave.importFromFile(file);

      // Validate that the save belongs to the user
      if (gameSave.userId !== userId) {
        return {
          success: false,
          message: 'Save file does not belong to current user',
          error: 'User ID mismatch'
        };
      }

      // Find available slot
      const slotNumber = this.getNextAvailableSlot(userId);
      if (slotNumber === -1) {
        return {
          success: false,
          message: 'No available save slots',
          error: 'Maximum number of save slots reached'
        };
      }

      // Save to slot
      const result = await this.saveGame(userId, gameSave.toData(), slotNumber);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to import save file',
        error: errorMessage
      };
    }
  }

  // Progress-specific methods for compatibility with GamePage
  async saveProgress(userId: string, progressData: any): Promise<SaveOperationResult> {
    try {
      // Create a save data object with progress information
      const saveData: GameSaveData = {
        id: `progress_${userId}_${Date.now()}`,
        saveName: `Progress_${userId}_${Date.now()}`,
        userId,
        currentLevel: progressData.level || 1,
        score: progressData.score || 0,
        playTime: progressData.playTime || 0,
        credits: progressData.credits || 0,
        workspaceComponents: progressData.workspaceComponents || [],
        testResults: progressData.testResults || [],
        userProgress: progressData,
        unlockedComponents: progressData.unlockedComponents || [],
        unlockedAchievements: progressData.unlockedAchievements || [],
        settings: progressData.settings || {
          gridSize: 20,
          snapToGrid: true
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastPlayed: new Date(),
        version: '1.0.0',
        metadata: {
          gameVersion: '1.0.0',
          platform: 'web',
          deviceInfo: 'browser',
          saveSize: 0,
          checksum: ''
        }
      };

      return await this.saveGame(userId, saveData);
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save progress',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async loadProgress(userId: string, slotNumber?: number): Promise<any | null> {
    try {
      if (slotNumber !== undefined) {
        const result = await this.loadGame(userId, slotNumber);
        if (result.success && result.saveData) {
          return result.saveData.userProgress;
        }
      } else {
        // Load from the most recent save
        const slots = this.getSaveSlots(userId);
        if (slots.length > 0) {
          const latestSlot = slots.sort(
            (a, b) =>
              new Date(b.saveData?.updatedAt || 0).getTime() -
              new Date(a.saveData?.updatedAt || 0).getTime()
          )[0];

          const result = await this.loadGame(userId, latestSlot.slotNumber);
          if (result.success && result.saveData) {
            return result.saveData.userProgress;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading progress:', error);
      return null;
    }
  }

  // Cleanup
  destroy(): void {
    this.stopAutoSave();
    this.eventListeners.clear();
    this.saveSlots.clear();
  }
}

// Types are already exported above as interfaces
