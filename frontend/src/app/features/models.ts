export interface Project { id: string; name: string; description: string | null; webhookUrl?: string | null; ticketCount?: number; pendingTicketCount?: number; }
export interface Category { id: string; name: string; }
export interface User { id: string; email: string; firstName: string; lastName: string; role: 'admin' | 'user'; isActive: boolean; }
export type TicketKind = 'ticket' | 'bug' | 'suggestion' | 'feature';
export type TicketPriority = 'high' | 'medium' | 'low';
export type TicketStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';
export interface Ticket { id: string; title: string; description: string | null; kind: TicketKind; priority: TicketPriority; status: TicketStatus; projectId: string | null; categoryId: string | null; assignedToId: string | null; project?: Project | null; category?: Category | null; createdBy?: User | null; reporterName?: string | null; reporterEmail?: string | null; reporterLocation?: string | null; assignedTo?: User | null; createdAt: string; updatedAt: string; }
export interface TicketNote { id: string; content: string; author: User; createdAt: string; }
export interface TicketFilters { q?: string; projectId?: string; categoryId?: string; priority?: TicketPriority; status?: TicketStatus; kind?: TicketKind; dateFrom?: string; dateTo?: string; }
export interface CountRow { key?: string; id?: string | null; name?: string; count: number; }
export interface DashboardSummary {
  pending: number; byStatus: CountRow[]; byProject: CountRow[]; byCategory: CountRow[];
  totalTickets: number; clientReplies: number; staffReplies: number; ticketsWithoutReply: number;
  replyTimeSeries: { date: string; count: number }[];
  ticketsTrend: { date: string; created: number; solved: number }[];
  byPriority: { key: TicketPriority; count: number }[];
  activeTicketsTotal: number;
  recentTickets: { id: string; title: string; createdAt: string; status: TicketStatus }[];
}
export interface TicketReport { tickets: Ticket[]; byStatus: CountRow[]; byProject: CountRow[]; byCategory: CountRow[]; }
