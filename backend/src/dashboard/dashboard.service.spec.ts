import { DashboardService } from './dashboard.service';
describe('DashboardService', () => {
  it('returns empty breakdowns when no tickets exist', async () => {
    const tickets: any = { summary: jest.fn().mockResolvedValue({ pending: 0, byStatus: [], byProject: [], byCategory: [] }), dashboardAggregates: jest.fn().mockResolvedValue({ byPriority: [{ key: 'high', count: 0 }, { key: 'medium', count: 0 }, { key: 'low', count: 0 }], activeTicketsTotal: 0, ticketsTrend: Array.from({ length: 7 }, (_, i) => ({ date: String(i), created: 0, solved: 0 })), recentTickets: [] }) };
    const comments: any = { dashboardStats: jest.fn().mockResolvedValue({ totalTickets: 0, clientReplies: 0, staffReplies: 0, ticketsWithoutReply: 0, replyTimeSeries: Array.from({ length: 14 }, (_, i) => ({ date: String(i), count: 0 })) }) };
    expect(await new DashboardService(tickets, comments).summary()).toMatchObject({ pending: 0, byStatus: [], byProject: [], byCategory: [], totalTickets: 0, clientReplies: 0, staffReplies: 0, ticketsWithoutReply: 0, activeTicketsTotal: 0, recentTickets: [] });
  });
  it('reflects current totals on each request', async () => {
    const tickets: any = { summary: jest.fn().mockResolvedValueOnce({ pending: 2, byStatus: [{ key: 'pending', count: 2 }], byProject: [], byCategory: [] }).mockResolvedValueOnce({ pending: 1, byStatus: [{ key: 'done', count: 1 }], byProject: [], byCategory: [] }), dashboardAggregates: jest.fn().mockResolvedValue({}) };
    const comments: any = { dashboardStats: jest.fn().mockResolvedValue({}) };
    const service = new DashboardService(tickets, comments);
    expect((await service.summary()).pending).toBe(2); expect((await service.summary()).pending).toBe(1);
  });
});
