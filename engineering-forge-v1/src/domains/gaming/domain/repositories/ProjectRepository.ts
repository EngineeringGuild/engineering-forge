// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/repositories/ProjectRepository.ts

import { ProjectAggregate } from '../aggregates/ProjectAggregate';

export interface ProjectRepository {
  findById(id: string): Promise<ProjectAggregate | null>;
  findByUserId(userId: string): Promise<ProjectAggregate[]>;
  save(project: ProjectAggregate): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<ProjectAggregate[]>;
}
