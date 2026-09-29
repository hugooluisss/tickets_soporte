import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';
import { Project } from './project.entity';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsService {
  constructor(private readonly projects: ProjectsRepository, private readonly tickets: TicketsService) {}
  async findAll(): Promise<Project[]> { return this.attachCounts(await this.projects.findAll()); }
  async findById(id: string): Promise<Project> { const project = await this.projects.findById(id); if (!project) throw new NotFoundException('Project not found'); return (await this.attachCounts([project]))[0]; }
  async create(input: { name: string; description?: string }): Promise<Project> { const name = input.name.trim(); if (!name) throw new BadRequestException('Project name is required'); return this.projects.create({ name, description: input.description ?? null }); }
  async update(id: string, input: Partial<{ name: string; description: string }>): Promise<Project> {
    await this.findById(id);
    if (input.name !== undefined && !input.name.trim()) throw new BadRequestException('Project name is required');
    const updated = await this.projects.update(id, { ...input, ...(input.name !== undefined ? { name: input.name.trim() } : {}) });
    if (!updated) throw new NotFoundException('Project not found');
    return (await this.attachCounts([updated]))[0];
  }
  async delete(id: string): Promise<void> { if (!(await this.projects.delete(id))) throw new NotFoundException('Project not found'); }
  findTickets(id: string) { return this.findById(id).then(() => this.tickets.findAll({ projectId: id })); }
  private async attachCounts(projects: Project[]): Promise<Project[]> {
    const counts = await this.projects.ticketCounts();
    return projects.map((project) => ({ ...project, ticketCount: counts.get(project.id)?.total ?? 0, pendingTicketCount: counts.get(project.id)?.pending ?? 0 }));
  }
}
