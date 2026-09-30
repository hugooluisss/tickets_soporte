import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user-role.enum';
import { TicketNotesController } from './ticket-notes.controller';

describe('TicketNotesController authorization', () => {
  const notes: any = { create: jest.fn(), listByTicket: jest.fn(), delete: jest.fn() };
  const controller = new TicketNotesController(notes);
  const guard = new RolesGuard(new Reflector());

  it('creates with the authenticated principal as author', async () => {
    notes.create.mockResolvedValue({ id: 'note-1' });
    await controller.create('ticket-1', { content: 'Context' }, { user: { id: 'user-1' } } as any);
    expect(notes.create).toHaveBeenCalledWith('ticket-1', 'user-1', 'Context');
  });
  it('allows administrators and rejects non-admin deletion', () => {
    const handler = TicketNotesController.prototype.delete;
    const context = (role: UserRole) =>
      ({
        getHandler: () => handler,
        getClass: () => TicketNotesController,
        switchToHttp: () => ({ getRequest: () => ({ user: { role } }) }),
      }) as any;
    expect(guard.canActivate(context(UserRole.ADMIN))).toBe(true);
    expect(() => guard.canActivate(context(UserRole.USER))).toThrow(ForbiddenException);
  });
});
