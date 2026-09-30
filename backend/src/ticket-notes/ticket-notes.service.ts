import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';
import { TicketNotesRepository } from './ticket-notes.repository';

@Injectable()
export class TicketNotesService {
  constructor(
    private readonly notes: TicketNotesRepository,
    private readonly tickets: TicketsService,
  ) {}
  async create(ticketId: string, authorId: string, content: string) {
    if (!content?.trim()) throw new BadRequestException('Note content is required');
    await this.tickets.findById(ticketId);
    return this.notes.create({ ticketId, authorId, content: content.trim() });
  }
  async listByTicket(ticketId: string) {
    await this.tickets.findById(ticketId);
    return this.notes.listByTicket(ticketId);
  }
  async delete(id: string): Promise<void> {
    if (!(await this.notes.delete(id))) throw new NotFoundException('Note not found');
  }
}
