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
import { WebhookNotifierService } from '../notifications/webhook-notifier.service';
import { EmailNotifierService } from '../notifications/email-notifier.service';
import { CreatePublicTicketDto } from '../public-tickets/dto/create-public-ticket.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class TicketsService {
  constructor(
    private readonly tickets: TicketsRepository,
    private readonly users: UsersRepository,
    private readonly projects: ProjectsRepository,
    private readonly categories: CategoriesRepository,
    private readonly webhooks: WebhookNotifierService,
    private readonly emails: EmailNotifierService,
  ) {}
  findAll(filter: TicketFilter = {}): Promise<Ticket[]> {
    return this.tickets.findAll(filter);
  }
  async findById(id: string): Promise<Ticket> {
    const ticket = await this.tickets.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }
  async findPublicByTrackingToken(token: string) {
    const ticket = await this.tickets.findByTrackingToken(token);
    if (!ticket) throw new NotFoundException('Ticket not found');
    return {
      title: ticket.title,
      status: ticket.status,
      createdAt: ticket.createdAt,
      kind: ticket.kind,
      ...(ticket.description != null ? { description: ticket.description } : {}),
    };
  }
  async create(input: Partial<Ticket>, creatorId: string): Promise<Ticket> {
    if (!input.title?.trim()) throw new BadRequestException('Title is required');
    const project = await this.validateReferences(input);
    const created = await this.createWithTrackingToken({
      ...input,
      title: input.title.trim(),
      description: input.description ?? null,
      kind: input.kind ?? TicketKind.TICKET,
      priority: input.priority ?? TicketPriority.MEDIUM,
      status: input.status ?? TicketStatus.PENDING,
      projectId: input.projectId ?? null,
      categoryId: input.categoryId ?? null,
      assignedToId: input.assignedToId ?? null,
      createdById: creatorId,
      reporterName: null,
      reporterEmail: null,
      reporterLocation: null,
    });
    this.notifyWebhook(created, project);
    return created;
  }
  async createPublic(projectId: string, input: CreatePublicTicketDto): Promise<Ticket> {
    if (!input.reporterName?.trim()) throw new BadRequestException('Reporter name is required');
    if (!input.reporterEmail?.trim()) throw new BadRequestException('Reporter email is required');
    if (!input.title?.trim()) throw new BadRequestException('Title is required');
    const project = await this.projects.findById(projectId);
    if (!project) throw new BadRequestException('Project does not exist');
    if (input.kind !== undefined && !Object.values(TicketKind).includes(input.kind))
      throw new BadRequestException('Invalid kind');
    const created = await this.createWithTrackingToken({
      title: input.title.trim(),
      description: input.description ?? null,
      kind: input.kind ?? TicketKind.TICKET,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.PENDING,
      projectId,
      categoryId: null,
      assignedToId: null,
      createdById: null,
      reporterName: input.reporterName.trim(),
      reporterEmail: input.reporterEmail.trim(),
      reporterLocation: input.reporterLocation?.trim() || null,
      reporterEmailNotifications: input.reporterEmailNotifications ?? false,
    });
    this.notifyWebhook(created, project);
    return created;
  }
  async update(id: string, input: Partial<Ticket>): Promise<Ticket> {
    await this.findById(id);
    if (input.title !== undefined && !input.title.trim())
      throw new BadRequestException('Title is required');
    await this.validateReferences(input);
    const updated = await this.tickets.update(id, {
      ...input,
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    });
    if (!updated) throw new NotFoundException('Ticket not found');
    if (updated.reporterEmail && updated.reporterEmailNotifications) this.emails.notify(updated);
    return updated;
  }
  async delete(id: string): Promise<void> {
    if (!(await this.tickets.delete(id))) throw new NotFoundException('Ticket not found');
  }
  summary() {
    return this.tickets.summary();
  }
  dashboardAggregates() {
    return this.tickets.dashboardAggregates();
  }
  async report(filter: TicketFilter) {
    const [tickets, aggregates] = await Promise.all([
      this.findAll(filter),
      this.tickets.aggregates(filter),
    ]);
    const statuses = Object.values(TicketStatus).map((status) => ({
      key: status,
      count: Number(aggregates.byStatus.find((item) => item.key === status)?.count ?? 0),
    }));
    return {
      tickets,
      byStatus: statuses,
      byProject: aggregates.byProject,
      byCategory: aggregates.byCategory,
    };
  }
  private async validateReferences(
    input: Partial<Ticket>,
  ): Promise<{ id: string; name: string; webhookUrl?: string | null } | null> {
    if (input.assignedToId && !(await this.users.findById(input.assignedToId)))
      throw new BadRequestException('Assigned user does not exist');
    let project: { id: string; name: string; webhookUrl?: string | null } | null = null;
    if (input.projectId) {
      project = await this.projects.findById(input.projectId);
      if (!project) throw new BadRequestException('Project does not exist');
    }
    if (input.categoryId && !(await this.categories.findById(input.categoryId)))
      throw new BadRequestException('Category does not exist');
    if (input.kind !== undefined && !Object.values(TicketKind).includes(input.kind))
      throw new BadRequestException('Invalid kind');
    if (input.priority !== undefined && !Object.values(TicketPriority).includes(input.priority))
      throw new BadRequestException('Invalid priority');
    if (input.status !== undefined && !Object.values(TicketStatus).includes(input.status))
      throw new BadRequestException('Invalid status');
    return project;
  }

  private notifyWebhook(
    ticket: Ticket,
    project: { id: string; name: string; webhookUrl?: string | null } | null,
  ): void {
    if (!project) return;
    this.webhooks.notify(project.webhookUrl, {
      ticketId: ticket.id,
      title: ticket.title,
      projectId: project.id,
      projectName: project.name,
      kind: ticket.kind,
      ...(ticket.reporterName ? { reporterName: ticket.reporterName } : {}),
      ...(ticket.reporterEmail ? { reporterEmail: ticket.reporterEmail } : {}),
    });
  }

  private async createWithTrackingToken(data: Partial<Ticket>): Promise<Ticket> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.tickets.create({
          ...data,
          trackingToken: randomBytes(32).toString('base64url'),
        });
      } catch (error) {
        const duplicate = (error as any)?.code === 'ER_DUP_ENTRY' || (error as any)?.errno === 1062;
        if (!duplicate || attempt >= 4) throw error;
      }
    }
  }
}
