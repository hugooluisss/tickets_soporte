import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketKind } from './ticket-kind.enum';
import { TicketPriority } from './ticket-priority.enum';
import { TicketStatus } from './ticket-status.enum';

describe('TicketsService', () => {
  const tickets: any = { findAll: jest.fn(), findById: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), summary: jest.fn(), aggregates: jest.fn() };
  const users: any = { findById: jest.fn() }; const projects: any = { findById: jest.fn() }; const categories: any = { findById: jest.fn() };
  let service: TicketsService;
  beforeEach(() => { jest.clearAllMocks(); service = new TicketsService(tickets, users, projects, categories); });
  it('creates a minimal ticket with default values and creator', async () => {
    tickets.create.mockImplementation(async (row: any) => row);
    const result = await service.create({ title: 'Issue' }, 'u1');
    expect(result).toMatchObject({ title: 'Issue', createdById: 'u1', kind: TicketKind.TICKET, priority: TicketPriority.MEDIUM, status: TicketStatus.PENDING, projectId: null, categoryId: null });
  });
  it('rejects a missing title and invalid enum values', async () => {
    await expect(service.create({}, 'u1')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.create({ title: 'x', kind: 'wrong' as any }, 'u1')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.create({ title: 'x', priority: 'urgent' as any }, 'u1')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.create({ title: 'x', status: 'open' as any }, 'u1')).rejects.toBeInstanceOf(BadRequestException);
  });
  it('validates references, validates and clears assignee', async () => {
    users.findById.mockResolvedValue(null);
    await expect(service.create({ title: 'x', assignedToId: 'missing' }, 'u1')).rejects.toBeInstanceOf(BadRequestException);
    users.findById.mockResolvedValue({ id: 'u2' }); projects.findById.mockResolvedValue({ id: 'p1' }); categories.findById.mockResolvedValue({ id: 'c1' });
    tickets.create.mockImplementation(async (row: any) => row);
    expect(await service.create({ title: 'x', assignedToId: 'u2', projectId: 'p1', categoryId: 'c1' }, 'u1')).toMatchObject({ assignedToId: 'u2' });
    tickets.findById.mockResolvedValue({ id: 't1', title: 'x' }); tickets.update.mockResolvedValue({ id: 't1', title: 'x', assignedToId: null });
    expect(await service.update('t1', { assignedToId: null })).toMatchObject({ assignedToId: null });
    users.findById.mockResolvedValue(null);
    await expect(service.update('t1', { assignedToId: 'missing' })).rejects.toBeInstanceOf(BadRequestException);
  });
  it('updates title and fields, rejecting empty titles and missing tickets', async () => {
    tickets.findById.mockResolvedValue({ id: 't1' }); tickets.update.mockResolvedValue({ id: 't1', title: 'Changed' });
    expect(await service.update('t1', { title: ' Changed ' })).toMatchObject({ title: 'Changed' });
    await expect(service.update('t1', { title: '  ' })).rejects.toBeInstanceOf(BadRequestException);
    tickets.findById.mockResolvedValue(null); await expect(service.update('missing', { status: TicketStatus.DONE })).rejects.toBeInstanceOf(NotFoundException);
  });
  it('deletes tickets and delegates filtered queries', async () => {
    tickets.findAll.mockResolvedValue([{ id: 't1' }]); expect(await service.findAll({ q: 'term' })).toHaveLength(1);
    tickets.delete.mockResolvedValue(true); await expect(service.delete('t1')).resolves.toBeUndefined();
    tickets.delete.mockResolvedValue(false); await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
  it('returns all status buckets, matching filtered tickets and aggregate counts', async () => {
    tickets.findAll.mockResolvedValue([{ id: 't1' }]); tickets.aggregates.mockResolvedValue({ byStatus: [{ key: 'pending', count: 1 }], byProject: [{ id: null, name: 'unassigned project', count: 1 }], byCategory: [{ id: null, name: 'unassigned category', count: 1 }] });
    const result = await service.report({ projectId: 'p1', dateFrom: '2026-01-01' });
    expect(result.tickets).toHaveLength(1); expect(result.byStatus).toEqual([{ key: 'pending', count: 1 }, { key: 'in_progress', count: 0 }, { key: 'done', count: 0 }, { key: 'cancelled', count: 0 }]);
    expect(result.byProject[0]).toMatchObject({ name: 'unassigned project', count: 1 }); expect(result.byCategory[0]).toMatchObject({ name: 'unassigned category', count: 1 });
  });
});
