import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import dataSource from '../src/database/data-source';
import { User } from '../src/users/user.entity';
import { UserRole } from '../src/users/user-role.enum';
import { Project } from '../src/projects/project.entity';
import { Category } from '../src/categories/category.entity';
import { Ticket } from '../src/tickets/ticket.entity';
import { TicketStatus } from '../src/tickets/ticket-status.enum';
import { TicketsRepository } from '../src/tickets/tickets.repository';
import { ProjectsRepository } from '../src/projects/projects.repository';

async function run(): Promise<void> {
  await dataSource.initialize();
  let userId = ''; let projectId = ''; let categoryId = ''; let ticketId = ''; let unassignedTicketId = '';
  try {
    await dataSource.runMigrations();
    const users = dataSource.getRepository(User); const projects = dataSource.getRepository(Project); const categories = dataSource.getRepository(Category); const tickets = dataSource.getRepository(Ticket);
    const suffix = `${Date.now()}`;
    const user = await users.save(users.create({ email: `phase2-${suffix}@example.com`, passwordHash: 'smoke', firstName: 'Phase', lastName: 'Two', role: UserRole.USER, isActive: true })); userId = user.id;
    const project = await projects.save(projects.create({ name: `Phase2 ${suffix}`, description: 'database round trip' })); projectId = project.id;
    const category = await categories.save(categories.create({ name: `Phase2 ${suffix}` })); categoryId = category.id;
    const ticket = await tickets.save(tickets.create({ title: 'Real database round trip', description: 'needle phrase for filtering', kind: 'bug' as any, priority: 'high' as any, status: TicketStatus.PENDING, projectId, categoryId, createdById: userId, assignedToId: userId })); ticketId = ticket.id;
    const unassignedTicket = await tickets.save(tickets.create({ title: 'Real database round trip unassigned', status: 'done' as any, createdById: userId })); unassignedTicketId = unassignedTicket.id;
    const loaded = await tickets.findOne({ where: { id: ticketId }, relations: { project: true, category: true, createdBy: true, assignedTo: true } });
    assert.equal(loaded?.project?.id, projectId); assert.equal(loaded?.category?.id, categoryId); assert.equal(loaded?.createdBy?.id, userId); assert.equal(loaded?.assignedTo?.id, userId);
    const queryRepository = new TicketsRepository(tickets);
    const projectsRepository = new ProjectsRepository(projects);
    assert.deepEqual(await projectsRepository.ticketCounts().then((map) => map.get(projectId)), { total: 1, pending: 1 });
    const [{ createdDate }] = await dataSource.query('SELECT DATE(`created_at`) AS `createdDate` FROM `tickets` WHERE `id` = ?', [ticketId]);
    const today = createdDate instanceof Date ? `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(createdDate.getDate()).padStart(2, '0')}` : createdDate;
    for (const filter of [{ q: 'NEEDLE' }, { projectId }, { categoryId }, { priority: 'high' as any }, { status: TicketStatus.PENDING }, { kind: 'bug' as any }, { dateFrom: today, dateTo: today }, { projectId, status: TicketStatus.PENDING, kind: 'bug' as any }]) {
      const matches = await queryRepository.findAll(filter);
      assert.equal(filter.dateFrom ? matches.some((row) => row.id === ticketId) : matches.length === 1 && matches[0].id === ticketId, true, `filter ${JSON.stringify(filter)} should match the inserted ticket`);
    }
    const summary = await queryRepository.summary(); assert.equal(summary.pending, 1); assert.equal(summary.byProject[0].count, 1); assert.equal(summary.byCategory[0].count, 1);
    const report = await queryRepository.aggregates({ q: 'Real database round trip' });
    assert.equal(report.byProject.find((row) => row.id == null)?.count, 1); assert.equal(report.byCategory.find((row) => row.id == null)?.count, 1);
    await categories.delete(categoryId); categoryId = '';
    const afterCategoryDelete = await tickets.findOneByOrFail({ id: ticketId }); assert.equal(afterCategoryDelete.categoryId, null);
    let foreignKeyRejected = false;
    try { await tickets.save(tickets.create({ title: 'invalid FK', createdById: userId, projectId: '00000000-0000-0000-0000-000000000000' })); }
    catch { foreignKeyRejected = true; }
    assert.equal(foreignKeyRejected, true, 'unknown project id must be rejected by a foreign key');
    console.log('MySQL migrations and Phase 2 entity/relation/filter/delete round trip passed');
  } finally {
    if (ticketId) await dataSource.getRepository(Ticket).delete(ticketId);
    if (unassignedTicketId) await dataSource.getRepository(Ticket).delete(unassignedTicketId);
    if (categoryId) await dataSource.getRepository(Category).delete(categoryId);
    if (projectId) await dataSource.getRepository(Project).delete(projectId);
    if (userId) await dataSource.getRepository(User).delete(userId);
    await dataSource.destroy();
  }
}
void run();
