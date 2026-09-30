import { Injectable } from '@nestjs/common';
import { TicketFilter } from '../tickets/ticket-filter';
import { TicketsService } from '../tickets/tickets.service';
@Injectable()
export class ReportsService {
  constructor(private readonly tickets: TicketsService) {}
  generate(filter: TicketFilter) {
    return this.tickets.report(filter);
  }
}
