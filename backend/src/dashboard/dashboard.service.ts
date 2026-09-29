import { Injectable } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';
import { TicketCommentsService } from '../ticket-comments/ticket-comments.service';
@Injectable()
export class DashboardService {
  constructor(private readonly tickets: TicketsService, private readonly comments: TicketCommentsService) {}
  async summary() {
    const [base, ticketStats, commentStats] = await Promise.all([this.tickets.summary(), this.tickets.dashboardAggregates(), this.comments.dashboardStats()]);
    return { ...base, ...commentStats, ...ticketStats };
  }
}
