import { TicketsRepository } from './tickets.repository';

describe('TicketsRepository filters', () => {
  it.each([
    ['keyword', { q: 'needle' }, 'LOWER(ticket.title)'],
    ['project', { projectId: 'p1' }, 'ticket.projectId'],
    ['category', { categoryId: 'c1' }, 'ticket.categoryId'],
    ['priority', { priority: 'high' }, 'ticket.priority'],
    ['status', { status: 'pending' }, 'ticket.status'],
    ['kind', { kind: 'bug' }, 'ticket.kind'],
    ['date start', { dateFrom: '2026-01-01' }, 'ticket.createdAt >='],
    ['date end', { dateTo: '2026-01-31' }, 'ticket.createdAt <='],
  ])('filters by %s independently', async (_label, filter, expected) => {
    const clauses: any[] = [];
    const qb: any = { leftJoinAndSelect: jest.fn().mockReturnThis(), andWhere: jest.fn((...args) => { clauses.push(args); return qb; }), orderBy: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue([]) };
    const subject = new TicketsRepository({ createQueryBuilder: jest.fn().mockReturnValue(qb) } as any);
    await subject.findAll(filter as any);
    expect(clauses).toHaveLength(1); expect(clauses[0][0]).toContain(expected);
  });
  it('adds each filter condition and combines them with AND', async () => {
    const clauses: any[] = [];
    const qb: any = { leftJoinAndSelect: jest.fn().mockReturnThis(), andWhere: jest.fn((...args) => { clauses.push(args); return qb; }), orderBy: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue([]) };
    const repository: any = { createQueryBuilder: jest.fn().mockReturnValue(qb) };
    const tickets = new TicketsRepository(repository);
    const filter = { q: 'needle', projectId: 'p1', categoryId: 'c1', priority: 'high' as any, status: 'pending' as any, kind: 'bug' as any, dateFrom: '2026-01-01', dateTo: '2026-01-31' };
    await tickets.findAll(filter);
    expect(clauses).toHaveLength(8);
    expect(clauses[0][0]).toContain('LOWER(ticket.title)');
    expect(clauses.slice(1).map((entry) => entry[1])).toEqual(expect.arrayContaining([{ projectId: 'p1' }, { categoryId: 'c1' }, { priority: 'high' }, { status: 'pending' }, { kind: 'bug' }, { dateFrom: '2026-01-01 00:00:00' }, { dateTo: '2026-01-31 23:59:59.999' }]));
    expect(qb.orderBy).toHaveBeenCalledWith('ticket.createdAt', 'DESC');
  });
});
