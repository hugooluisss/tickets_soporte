import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketNote } from './ticket-note.entity';

@Injectable()
export class TicketNotesRepository {
  constructor(@InjectRepository(TicketNote) private readonly repository: Repository<TicketNote>) {}
  async create(data: Partial<TicketNote>): Promise<TicketNote> {
    const note = await this.repository.save(this.repository.create(data));
    return this.repository.findOneOrFail({ where: { id: note.id }, relations: { author: true } });
  }
  listByTicket(ticketId: string): Promise<TicketNote[]> { return this.repository.find({ where: { ticketId }, relations: { author: true }, order: { createdAt: 'ASC', id: 'ASC' } }); }
  async delete(id: string): Promise<boolean> { return (await this.repository.delete(id)).affected! > 0; }
}
