// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/application/use-cases/StartGameSessionUseCase.ts

import { GameSession } from "../../domain/entities/GameSession";
import { GameSessionFactory } from "../../domain/factories/GameSessionFactory";
import { GameSessionRepository } from "../../domain/repositories/GameSessionRepository";
import { ProjectRepository } from "../../domain/repositories/ProjectRepository";

export interface StartGameSessionRequest {
  userId: string;
  projectId: string;
}

export interface StartGameSessionResponse {
  success: boolean;
  gameSession?: GameSession;
  error?: string;
}

export class StartGameSessionUseCase {
  constructor(
    private gameSessionRepository: GameSessionRepository,
    private projectRepository: ProjectRepository,
    private gameSessionFactory: typeof GameSessionFactory
  ) {}

  async execute(
    request: StartGameSessionRequest
  ): Promise<StartGameSessionResponse> {
    try {
      // Check if user already has an active session
      const existingActiveSession =
        await this.gameSessionRepository.findActiveByUserId(request.userId);
      if (existingActiveSession) {
        return {
          success: false,
          error: "User already has an active game session",
        };
      }

      // Verify project exists
      const project = await this.projectRepository.findById(request.projectId);
      if (!project) {
        return {
          success: false,
          error: "Project not found",
        };
      }

      // Create new game session using factory
      const gameSession = this.gameSessionFactory.create({
        userId: request.userId,
        projectId: request.projectId,
      });

      // Save the session
      await this.gameSessionRepository.save(gameSession);

      return {
        success: true,
        gameSession,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
