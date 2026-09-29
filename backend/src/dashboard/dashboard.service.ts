import { Injectable } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';
@Injectable()
export class DashboardService { constructor(private readonly tickets: TicketsService) {} summary() { return this.tickets.summary(); } }
