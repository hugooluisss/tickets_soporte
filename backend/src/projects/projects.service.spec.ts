import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  const projects: any = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    ticketCounts: jest.fn(),
  };
  const tickets: any = { findAll: jest.fn() };
  let service: ProjectsService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProjectsService(projects, tickets);
  });
  it('lists and views projects with total and pending ticket counts', async () => {
    projects.findAll.mockResolvedValue([{ id: 'p1', name: 'Alpha' }]);
    projects.findById.mockResolvedValue({ id: 'p1', name: 'Alpha' });
    projects.ticketCounts.mockResolvedValue(new Map([['p1', { total: 3, pending: 2 }]]));
    expect(await service.findAll()).toMatchObject([{ ticketCount: 3, pendingTicketCount: 2 }]);
    expect(await service.findById('p1')).toMatchObject({ ticketCount: 3, pendingTicketCount: 2 });
  });
  it('creates projects and rejects a missing project on read or delete', async () => {
    await expect(service.create({ name: '   ' })).rejects.toBeInstanceOf(BadRequestException);
    projects.create.mockResolvedValue({ id: 'p1', name: 'Alpha', description: null });
    expect(
      await service.create({ name: ' Alpha ', webhookUrl: 'https://example.com/hook' }),
    ).toMatchObject({ name: 'Alpha' });
    expect(projects.create).toHaveBeenCalledWith(
      expect.objectContaining({ webhookUrl: 'https://example.com/hook' }),
    );
    projects.findById.mockResolvedValue(null);
    await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
    projects.delete.mockResolvedValue(false);
    await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
  it('updates a project and lists only its tickets', async () => {
    projects.findById.mockResolvedValue({ id: 'p1', name: 'Old' });
    projects.update.mockResolvedValue({ id: 'p1', name: 'New' });
    projects.ticketCounts.mockResolvedValue(new Map());
    tickets.findAll.mockResolvedValue([{ projectId: 'p1' }]);
    expect(await service.update('p1', { name: 'New' })).toMatchObject({
      name: 'New',
      ticketCount: 0,
    });
    expect(await service.findTickets('p1')).toEqual([{ projectId: 'p1' }]);
    expect(tickets.findAll).toHaveBeenCalledWith({ projectId: 'p1' });
  });
  it('clears a project webhook URL when explicitly set to null', async () => {
    projects.findById.mockResolvedValue({
      id: 'p1',
      name: 'Alpha',
      webhookUrl: 'https://example.com/hook',
    });
    projects.update.mockResolvedValue({ id: 'p1', name: 'Alpha', webhookUrl: null });
    projects.ticketCounts.mockResolvedValue(new Map());
    await service.update('p1', { webhookUrl: null });
    expect(projects.update).toHaveBeenCalledWith('p1', { webhookUrl: null });
  });
});
