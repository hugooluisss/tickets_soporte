import { ReportsService } from './reports.service';
describe('ReportsService', () => {
  it('returns filtered aggregates including unassigned groups', async () => {
    const tickets: any = {
      report: jest.fn().mockResolvedValue({
        tickets: [],
        byStatus: [
          { key: 'pending', count: 0 },
          { key: 'in_progress', count: 0 },
          { key: 'done', count: 0 },
          { key: 'cancelled', count: 0 },
        ],
        byProject: [{ id: null, name: 'unassigned project', count: 2 }],
        byCategory: [{ id: null, name: 'unassigned category', count: 2 }],
      }),
    };
    const service = new ReportsService(tickets);
    const filter = { q: 'term', projectId: 'p1', dateFrom: '2026-01-01', dateTo: '2026-01-31' };
    const result = await service.generate(filter);
    expect(tickets.report).toHaveBeenCalledWith(filter);
    expect(result.tickets).toEqual([]);
    expect(result.byStatus.every((item: any) => item.count === 0)).toBe(true);
    expect(result.byProject[0].name).toBe('unassigned project');
    expect(result.byCategory[0].name).toBe('unassigned category');
  });
});
