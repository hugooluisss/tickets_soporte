import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { ProjectsRepository } from '../projects/projects.repository';
import { Ticket } from './ticket.entity';
import { TicketFilter } from './ticket-filter';
import { TicketKind } from './ticket-kind.enum';
import { TicketPriority } from './ticket-priority.enum';
import { TicketStatus } from './ticket-status.enum';
import { TicketsRepository } from './tickets.repository';

@Injectable()
export class TicketsService {
  constructor(private readonly tickets: TicketsRepository, private readonly users: UsersRepository, private readonly projects: ProjectsRepository, private readonly categories: CategoriesRepository) {}
  findAll(filter: TicketFilter = {}): Promise<Ticket[]> { return this.tickets.findAll(filter); }
  async findById(id: string): Promise<Ticket> { const ticket = await this.tickets.findById(id); if (!ticket) throw new NotFoundException('Ticket not found'); return ticket; }
  async create(input: Partial<Ticket>, creatorId: string): Promise<Ticket> {
    if (!input.title?.trim()) throw new BadRequestException('Title is required');
    await this.validateReferences(input);
    return this.tickets.create({ ...input, title: input.title.trim(), description: input.description ?? null, kind: input.kind ?? TicketKind.TICKET, priority: input.priority ?? TicketPriority.MEDIUM, status: input.status ?? TicketStatus.PENDING, projectId: input.projectId ?? null, categoryId: input.categoryId ?? null, assignedToId: input.assignedToId ?? null, createdById: creatorId });
  }
  async update(id: string, input: Partial<Ticket>): Promise<Ticket> {
    await this.findById(id);
    if (input.title !== undefined && !input.title.trim()) throw new BadRequestException('Title is required');
    await this.validateReferences(input);
    const updated = await this.tickets.update(id, { ...input, ...(input.title !== undefined ? { title: input.title.trim() } : {}) });
    if (!updated) throw new NotFoundException('Ticket not found');
    return updated;
  }
  async delete(id: string): Promise<void> { if (!(await this.tickets.delete(id))) throw new NotFoundException('Ticket not found'); }
  summary() { return this.tickets.summary(); }
  dashboardAggregates() { return this.tickets.dashboardAggregates(); }
  async report(filter: TicketFilter) {
    const [tickets, aggregates] = await Promise.all([this.findAll(filter), this.tickets.aggregates(filter)]);
    const statuses = Object.values(TicketStatus).map((status) => ({ key: status, count: Number(aggregates.byStatus.find((item) => item.key === status)?.count ?? 0) }));
    return { tickets, byStatus: statuses, byProject: aggregates.byProject, byCategory: aggregates.byCategory };
  }
  private async validateReferences(input: Partial<Ticket>): Promise<void> {
    if (input.assignedToId && !(await this.users.findById(input.assignedToId))) throw new BadRequestException('Assigned user does not exist');
    if (input.projectId && !(await this.projects.findById(input.projectId))) throw new BadRequestException('Project does not exist');
    if (input.categoryId && !(await this.categories.findById(input.categoryId))) throw new BadRequestException('Category does not exist');
    if (input.kind !== undefined && !Object.values(TicketKind).includes(input.kind)) throw new BadRequestException('Invalid kind');
    if (input.priority !== undefined && !Object.values(TicketPriority).includes(input.priority)) throw new BadRequestException('Invalid priority');
    if (input.status !== undefined && !Object.values(TicketStatus).includes(input.status)) throw new BadRequestException('Invalid status');
  }
}
