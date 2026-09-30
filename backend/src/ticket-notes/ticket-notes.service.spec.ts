import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TicketNotesService } from './ticket-notes.service';

describe('TicketNotesService', () => {
  const notes: any = { create: jest.fn(), listByTicket: jest.fn(), delete: jest.fn() };
  const tickets: any = { findById: jest.fn() };
  let service: TicketNotesService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new TicketNotesService(notes, tickets);
  });

  it('creates a trimmed note with the authenticated author for an accessible ticket', async () => {
    tickets.findById.mockResolvedValue({ id: 'ticket-1' });
    notes.create.mockResolvedValue({ id: 'note-1' });
    await service.create('ticket-1', 'user-1', ' Context ');
    expect(notes.create).toHaveBeenCalledWith({
      ticketId: 'ticket-1',
      authorId: 'user-1',
      content: 'Context',
    });
  });
  it('rejects creation without ticket access and creates no note', async () => {
    tickets.findById.mockRejectedValue(new ForbiddenException());
    await expect(service.create('ticket-1', 'user-1', 'Context')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(notes.create).not.toHaveBeenCalled();
  });
  it('rejects empty content', async () => {
    await expect(service.create('ticket-1', 'user-1', '  ')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(notes.create).not.toHaveBeenCalled();
  });
  it('lists notes only after ticket access is verified', async () => {
    tickets.findById.mockResolvedValue({ id: 'ticket-1' });
    notes.listByTicket.mockResolvedValue([]);
    await expect(service.listByTicket('ticket-1')).resolves.toEqual([]);
  });
  it('allows admin deletion through the service and rejects missing notes', async () => {
    notes.delete.mockResolvedValue(true);
    await expect(service.delete('note-1')).resolves.toBeUndefined();
    notes.delete.mockResolvedValue(false);
    await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
