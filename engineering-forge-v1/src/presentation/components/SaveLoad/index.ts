/**
 * Save Load Components Index - Engineering Forge V1.0
 * /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/SaveLoad/index.ts
 *
 * Export all save/load-related components
 */

export { default as AutoSaveIndicator } from './AutoSaveIndicator';
export { default as SaveLoadPanel } from './SaveLoadPanel';

// Re-export types
export type { GameSaveData } from '../../../domains/gaming/entities/GameSave';
export type { SaveOperationResult } from '../../../domains/gaming/services/SaveService';
