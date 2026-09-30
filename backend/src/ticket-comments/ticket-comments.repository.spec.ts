import { TicketCommentsRepository } from './ticket-comments.repository';

describe('TicketCommentsRepository', () => {
  it('creates comments and lists them oldest first with role derived from ticket creator', async () => {
    const entities = [{ id: 'c1' }, { id: 'c2' }];
    const raw = [{ role: 'client' }, { role: 'staff' }];
    const qb: any = {};
    for (const method of [
      'leftJoinAndSelect',
      'innerJoin',
      'addSelect',
      'where',
      'orderBy',
      'addOrderBy',
    ])
      qb[method] = jest.fn(() => qb);
    qb.getRawAndEntities = jest.fn().mockResolvedValue({ entities, raw });
    const ormRepo: any = {
      create: jest.fn((input) => input),
      save: jest.fn(async (input) => input),
      createQueryBuilder: jest.fn(() => qb),
    };
    const repository = new TicketCommentsRepository(ormRepo);
    await repository.create({ ticketId: 't1', authorId: 'u1', body: 'Hi' });
    const listed = await repository.listByTicket('t1');
    expect(ormRepo.save).toHaveBeenCalledWith({ ticketId: 't1', authorId: 'u1', body: 'Hi' });
    expect(qb.orderBy).toHaveBeenCalledWith('comment.createdAt', 'ASC');
    expect(qb.addSelect).toHaveBeenCalledWith(
      "CASE WHEN comment.authorId = ticket.createdById THEN 'client' ELSE 'staff' END",
      'role',
    );
    expect(listed).toEqual([
      { id: 'c1', role: 'client' },
      { id: 'c2', role: 'staff' },
    ]);
  });

  it('returns a 14-day zero-filled reply series and numeric aggregate counts', async () => {
    const manager = {
      query: jest
        .fn()
        .mockResolvedValueOnce([
          { totalTickets: '2', clientReplies: '1', staffReplies: '0', ticketsWithoutReply: '1' },
        ])
        .mockResolvedValueOnce([]),
    };
    const repository = new TicketCommentsRepository({ manager } as any);
    const stats = await repository.dashboardStats();
    expect(stats).toMatchObject({
      totalTickets: 2,
      clientReplies: 1,
      staffReplies: 0,
      ticketsWithoutReply: 1,
    });
    expect(stats.replyTimeSeries).toHaveLength(14);
    expect(stats.replyTimeSeries.every((day) => day.count === 0)).toBe(true);
  });
});
