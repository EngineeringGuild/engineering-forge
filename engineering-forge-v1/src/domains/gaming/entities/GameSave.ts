/**
 * GameSave Entity - Engineering Forge V1.0
 * /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/entities/GameSave.ts
 *
 * Game save data entity with project state, progress, and metadata
 */

import { Component } from '../domain/entities/Component';
import { TestResult } from '../domain/entities/TestResult';
import { UserProgressData } from './UserProgress';

export interface GameSaveData {
  id: string;
  userId: string;
  version: string;
  saveName: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  lastPlayed: Date;
  playTime: number;

  // Game state
  currentLevel: number;
  score: number;
  credits: number;
  workspaceComponents: Component[];
  testResults: TestResult[];
  unlockedComponents: string[];
  unlockedAchievements: string[];

  // Progress data
  userProgress: UserProgressData;

  // Settings
  settings: {
    gridSize: number;
    snapToGrid: boolean;
    soundEnabled: boolean;
    musicEnabled: boolean;
    quality: 'low' | 'medium' | 'high';
  };

  // Metadata
  metadata: {
    gameVersion: string;
    platform: string;
    deviceInfo: string;
    saveSize: number;
    checksum: string;
  };
}

export interface SaveSlot {
  id: string;
  userId: string;
  slotNumber: number;
  saveData: GameSaveData | null;
  isEmpty: boolean;
  lastUsed: Date;
}

export class GameSave {
  private data: GameSaveData;

  constructor(data: GameSaveData) {
    this.data = { ...data };
  }

  // Getters
  get id(): string {
    return this.data.id;
  }
  get userId(): string {
    return this.data.userId;
  }
  get version(): string {
    return this.data.version;
  }
  get saveName(): string {
    return this.data.saveName;
  }
  get description(): string | undefined {
    return this.data.description;
  }
  get createdAt(): Date {
    return this.data.createdAt;
  }
  get updatedAt(): Date {
    return this.data.updatedAt;
  }
  get lastPlayed(): Date {
    return this.data.lastPlayed;
  }
  get playTime(): number {
    return this.data.playTime;
  }
  get currentLevel(): number {
    return this.data.currentLevel;
  }
  get score(): number {
    return this.data.score;
  }
  get credits(): number {
    return this.data.credits;
  }
  get workspaceComponents(): Component[] {
    return [...this.data.workspaceComponents];
  }
  get testResults(): TestResult[] {
    return [...this.data.testResults];
  }
  get unlockedComponents(): string[] {
    return [...this.data.unlockedComponents];
  }
  get unlockedAchievements(): string[] {
    return [...this.data.unlockedAchievements];
  }
  get userProgress(): UserProgressData {
    return { ...this.data.userProgress };
  }
  get settings(): GameSaveData['settings'] {
    return { ...this.data.settings };
  }
  get metadata(): GameSaveData['metadata'] {
    return { ...this.data.metadata };
  }

  // Update methods
  updateLastPlayed(): void {
    this.data.lastPlayed = new Date();
    this.data.updatedAt = new Date();
  }

  updatePlayTime(additionalTime: number): void {
    this.data.playTime += additionalTime;
    this.data.updatedAt = new Date();
  }

  updateGameState(state: {
    currentLevel?: number;
    score?: number;
    credits?: number;
    workspaceComponents?: Component[];
    testResults?: TestResult[];
    unlockedComponents?: string[];
    unlockedAchievements?: string[];
  }): void {
    if (state.currentLevel !== undefined) this.data.currentLevel = state.currentLevel;
    if (state.score !== undefined) this.data.score = state.score;
    if (state.credits !== undefined) this.data.credits = state.credits;
    if (state.workspaceComponents !== undefined)
      this.data.workspaceComponents = [...state.workspaceComponents];
    if (state.testResults !== undefined) this.data.testResults = [...state.testResults];
    if (state.unlockedComponents !== undefined)
      this.data.unlockedComponents = [...state.unlockedComponents];
    if (state.unlockedAchievements !== undefined)
      this.data.unlockedAchievements = [...state.unlockedAchievements];

    this.data.updatedAt = new Date();
  }

  updateUserProgress(progress: UserProgressData): void {
    this.data.userProgress = { ...progress };
    this.data.updatedAt = new Date();
  }

  updateSettings(settings: Partial<GameSaveData['settings']>): void {
    this.data.settings = { ...this.data.settings, ...settings };
    this.data.updatedAt = new Date();
  }

  updateMetadata(metadata: Partial<GameSaveData['metadata']>): void {
    this.data.metadata = { ...this.data.metadata, ...metadata };
    this.data.updatedAt = new Date();
  }

  // Validation
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.id) errors.push('Save ID is required');
    if (!this.data.userId) errors.push('User ID is required');
    if (!this.data.version) errors.push('Version is required');
    if (!this.data.saveName) errors.push('Save name is required');
    if (this.data.currentLevel < 1) errors.push('Current level must be at least 1');
    if (this.data.score < 0) errors.push('Score cannot be negative');
    if (this.data.credits < 0) errors.push('Credits cannot be negative');
    if (this.data.playTime < 0) errors.push('Play time cannot be negative');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Serialization
  toData(): GameSaveData {
    return { ...this.data };
  }

  toJSON(): string {
    return JSON.stringify(this.data, null, 2);
  }

  static fromData(data: GameSaveData): GameSave {
    return new GameSave(data);
  }

  static fromJSON(json: string): GameSave {
    const data = JSON.parse(json) as GameSaveData;
    // Convert date strings back to Date objects
    data.createdAt = new Date(data.createdAt);
    data.updatedAt = new Date(data.updatedAt);
    data.lastPlayed = new Date(data.lastPlayed);
    return new GameSave(data);
  }

  // Factory methods
  static createNew(
    userId: string,
    saveName: string,
    description?: string,
    initialData?: Partial<GameSaveData>
  ): GameSave {
    const now = new Date();
    const id = `save_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const defaultData: GameSaveData = {
      id,
      userId,
      version: '1.0.0',
      saveName,
      description,
      createdAt: now,
      updatedAt: now,
      lastPlayed: now,
      playTime: 0,
      currentLevel: 1,
      score: 0,
      credits: 100,
      workspaceComponents: [],
      testResults: [],
      unlockedComponents: [],
      unlockedAchievements: [],
      userProgress: {
        userId,
        level: 1,
        experience: 0,
        totalExperience: 0,
        credits: 100,
        playTime: 0,
        projectsCompleted: 0,
        testsCompleted: 0,
        componentsUnlocked: 0,
        achievementsUnlocked: 0,
        highestScore: 0,
        averageScore: 0,
        totalScore: 0,
        sessionsPlayed: 0,
        lastPlayed: now,
        createdAt: now,
        updatedAt: now
      },
      settings: {
        gridSize: 20,
        snapToGrid: true,
        soundEnabled: true,
        musicEnabled: true,
        quality: 'medium'
      },
      metadata: {
        gameVersion: '1.0.0',
        platform: 'web',
        deviceInfo: navigator.userAgent,
        saveSize: 0,
        checksum: ''
      }
    };

    const saveData = { ...defaultData, ...initialData };
    const gameSave = new GameSave(saveData);

    // Calculate initial metadata
    gameSave.updateMetadata({
      saveSize: JSON.stringify(saveData).length,
      checksum: gameSave.calculateChecksum()
    });

    return gameSave;
  }

  private calculateChecksum(): string {
    // Simple checksum calculation for save data integrity
    const dataString = JSON.stringify(this.data);
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  verifyChecksum(): boolean {
    return this.calculateChecksum() === this.data.metadata.checksum;
  }

  // Export/Import
  exportToFile(): void {
    const dataStr = this.toJSON();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.data.saveName.replace(/[^a-z0-9]/gi, '_')}_${this.data.version}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static importFromFile(file: File): Promise<GameSave> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const json = event.target?.result as string;
          const gameSave = GameSave.fromJSON(json);
          if (gameSave.verifyChecksum()) {
            resolve(gameSave);
          } else {
            reject(new Error('Save file checksum verification failed'));
          }
        } catch (error) {
          reject(new Error('Invalid save file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read save file'));
      reader.readAsText(file);
    });
  }
}

// Types are already exported above as interfaces
