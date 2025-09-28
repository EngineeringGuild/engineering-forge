// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/shared/domain/BaseEntity.ts

/**
 * Base Entity for Domain-Driven Design
 * Provides common functionality for all domain entities
 */

export abstract class BaseEntity<T> {
  protected readonly _id: T;
  protected _createdAt: Date;
  protected _updatedAt: Date;

  constructor(id: T) {
    this._id = id;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get id(): T {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected updateTimestamp(): void {
    this._updatedAt = new Date();
  }

  public equals(entity?: BaseEntity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this._id === entity._id;
  }
}
