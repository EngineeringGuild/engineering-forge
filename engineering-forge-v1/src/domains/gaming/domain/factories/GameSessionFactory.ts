// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/factories/GameSessionFactory.ts

import { GameSession } from "../entities/GameSession";

export interface CreateGameSessionRequest {
  userId: string;
  projectId: string;
}

export class GameSessionFactory {
  /**
   * Create a new game session
   * @param request - Game session creation request
   * @returns New GameSession instance
   */
  static create(request: CreateGameSessionRequest): GameSession {
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return new GameSession(sessionId, {
      userId: request.userId,
      projectId: request.projectId,
      startTime: new Date(),
      status: "active",
      currentPhase: "planning",
      components: [],
      achievements: [],
    });
  }

  /**
   * Create a game session with custom ID
   * @param sessionId - Custom session ID
   * @param request - Game session creation request
   * @returns New GameSession instance
   */
  static createWithId(
    sessionId: string,
    request: CreateGameSessionRequest
  ): GameSession {
    return new GameSession(sessionId, {
      userId: request.userId,
      projectId: request.projectId,
      startTime: new Date(),
      status: "active",
      currentPhase: "planning",
      components: [],
      achievements: [],
    });
  }
}
