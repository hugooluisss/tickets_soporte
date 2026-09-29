import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketCommentsService } from './ticket-comments.service';

describe('TicketCommentsService', () => {
  const commentRepo: any = { create: jest.fn(), listByTicket: jest.fn(), dashboardStats: jest.fn() };
  const tickets: any = { findById: jest.fn() };
  let service: TicketCommentsService;
  beforeEach(() => { jest.clearAllMocks(); service = new TicketCommentsService(commentRepo, tickets); });

  it('rejects an empty or whitespace-only body', async () => {
    await expect(service.create('ticket-1', 'user-1', '  ')).rejects.toBeInstanceOf(BadRequestException);
    expect(tickets.findById).not.toHaveBeenCalled();
    expect(commentRepo.create).not.toHaveBeenCalled();
  });
  it('rejects a comment for a nonexistent ticket', async () => {
    tickets.findById.mockRejectedValue(new NotFoundException('Ticket not found'));
    await expect(service.create('missing', 'user-1', 'Reply')).rejects.toBeInstanceOf(NotFoundException);
    expect(commentRepo.create).not.toHaveBeenCalled();
  });
  it('trims body and records the authenticated author after validating the ticket', async () => {
    tickets.findById.mockResolvedValue({ id: 'ticket-1' }); commentRepo.create.mockResolvedValue({ id: 'comment-1' });
    await service.create('ticket-1', 'user-1', ' Reply ');
    expect(commentRepo.create).toHaveBeenCalledWith({ ticketId: 'ticket-1', authorId: 'user-1', body: 'Reply' });
  });
});
