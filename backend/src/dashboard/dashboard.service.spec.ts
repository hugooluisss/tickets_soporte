import { DashboardService } from './dashboard.service';
describe('DashboardService', () => {
  it('returns empty breakdowns when no tickets exist', async () => {
    const tickets: any = { summary: jest.fn().mockResolvedValue({ pending: 0, byStatus: [], byProject: [], byCategory: [] }) };
    expect(await new DashboardService(tickets).summary()).toEqual({ pending: 0, byStatus: [], byProject: [], byCategory: [] });
  });
  it('reflects current totals on each request', async () => {
    const tickets: any = { summary: jest.fn().mockResolvedValueOnce({ pending: 2, byStatus: [{ key: 'pending', count: 2 }], byProject: [], byCategory: [] }).mockResolvedValueOnce({ pending: 1, byStatus: [{ key: 'done', count: 1 }], byProject: [], byCategory: [] }) };
    const service = new DashboardService(tickets);
    expect((await service.summary()).pending).toBe(2); expect((await service.summary()).pending).toBe(1);
  });
});
