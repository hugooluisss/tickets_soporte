import { BadRequestException, Injectable } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';
import { TicketCommentsRepository } from './ticket-comments.repository';

@Injectable()
export class TicketCommentsService {
  constructor(private readonly comments: TicketCommentsRepository, private readonly tickets: TicketsService) {}
  async create(ticketId: string, authorId: string, body: string) {
    if (!body?.trim()) throw new BadRequestException('Comment body is required');
    await this.tickets.findById(ticketId);
    return this.comments.create({ ticketId, authorId, body: body.trim() });
  }
  async listByTicket(ticketId: string) { await this.tickets.findById(ticketId); return this.comments.listByTicket(ticketId); }
  dashboardStats() { return this.comments.dashboardStats(); }
}
