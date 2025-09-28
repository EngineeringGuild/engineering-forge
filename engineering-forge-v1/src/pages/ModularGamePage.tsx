import React from 'react';
import { GameContainer } from '../presentation/components/game/GameContainer';

/**
 * Modular Game Page - DDD Architecture
 *
 * This is the new modular version of GamePage following Domain-Driven Design principles:
 *
 * - **Separation of Concerns**: Each domain has its own responsibilities
 * - **Single Responsibility**: Each component has one clear purpose
 * - **Dependency Injection**: Services are injected, not created internally
 * - **Testability**: Each component can be tested independently
 * - **Maintainability**: Changes in one domain don't affect others
 *
 * Architecture:
 * - Domain Layer: Entities, Value Objects, Domain Services
 * - Application Layer: Use Cases, Application Services, Hooks
 * - Presentation Layer: UI Components, Pages, Hooks
 * - Infrastructure Layer: External services, APIs, Storage
 */
const ModularGamePage: React.FC = () => {
  return <GameContainer />;
};

export default ModularGamePage;
