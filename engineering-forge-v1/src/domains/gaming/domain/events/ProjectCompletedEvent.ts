// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/events/ProjectCompletedEvent.ts

import { DomainEvent } from '../../../../shared/domain/DomainEvent';

export class ProjectCompletedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly finalScore: number,
    public readonly completionTime: number
  ) {
    super();
  }

  public getEventName(): string {
    return 'ProjectCompleted';
  }
}
