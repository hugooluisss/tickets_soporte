import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketNote } from './ticket-note.entity';

@Injectable()
export class TicketNotesRepository {
  constructor(@InjectRepository(TicketNote) private readonly repository: Repository<TicketNote>) {}
  create(data: Partial<TicketNote>): Promise<TicketNote> { return this.repository.save(this.repository.create(data)); }
  listByTicket(ticketId: string): Promise<TicketNote[]> { return this.repository.find({ where: { ticketId }, relations: { author: true }, order: { createdAt: 'ASC', id: 'ASC' } }); }
  async delete(id: string): Promise<boolean> { return (await this.repository.delete(id)).affected! > 0; }
}
