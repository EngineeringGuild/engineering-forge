// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/events/ComponentRemovedEvent.ts

import { DomainEvent } from '../../../../shared/domain/DomainEvent';

export class ComponentRemovedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly componentId: string
  ) {
    super();
  }

  public getEventName(): string {
    return 'ComponentRemoved';
  }
}
