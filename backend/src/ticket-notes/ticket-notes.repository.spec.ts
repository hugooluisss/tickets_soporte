import { TicketNotesRepository } from './ticket-notes.repository';

describe('TicketNotesRepository', () => {
  it('returns a created note with its author and database timestamp', async () => {
    const createdAt = new Date('2026-09-29T12:00:00Z');
    const note = {
      id: 'note-1',
      ticketId: 'ticket-1',
      authorId: 'user-1',
      content: 'Context',
      createdAt,
      author: { id: 'user-1', firstName: 'Ada', lastName: 'Lovelace' },
    };
    const orm = {
      create: jest.fn((data) => data),
      save: jest.fn().mockResolvedValue({ id: note.id }),
      findOneOrFail: jest.fn().mockResolvedValue(note),
    };
    const repository = new TicketNotesRepository(orm as any);

    await expect(
      repository.create({
        ticketId: note.ticketId,
        authorId: note.authorId,
        content: note.content,
      }),
    ).resolves.toEqual(note);
    expect(orm.findOneOrFail).toHaveBeenCalledWith({
      where: { id: note.id },
      relations: { author: true },
    });
  });
});
