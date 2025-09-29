// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/repositories/GameSessionRepository.ts

import { GameSession } from '../entities/GameSession';

export interface GameSessionRepository {
  findById(id: string): Promise<GameSession | null>;
  findByUserId(userId: string): Promise<GameSession[]>;
  findByProjectId(projectId: string): Promise<GameSession[]>;
  findByUserIdAndProjectId(userId: string, projectId: string): Promise<GameSession | null>;
  findActiveByUserId(userId: string): Promise<GameSession | null>;
  save(gameSession: GameSession): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
