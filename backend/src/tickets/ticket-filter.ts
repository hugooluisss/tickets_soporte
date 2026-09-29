import { TicketKind } from './ticket-kind.enum';
import { TicketPriority } from './ticket-priority.enum';
import { TicketStatus } from './ticket-status.enum';
export interface TicketFilter {
  q?: string; projectId?: string; categoryId?: string; priority?: TicketPriority; status?: TicketStatus; kind?: TicketKind; dateFrom?: string; dateTo?: string;
}
