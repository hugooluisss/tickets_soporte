import { INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { CategoriesController } from '../src/categories/categories.controller';
import { CategoriesService } from '../src/categories/categories.service';
import { ProjectsController } from '../src/projects/projects.controller';
import { ProjectsService } from '../src/projects/projects.service';
import { TicketsController } from '../src/tickets/tickets.controller';
import { TicketsService } from '../src/tickets/tickets.service';
import { DashboardController } from '../src/dashboard/dashboard.controller';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { ReportsController } from '../src/reports/reports.controller';
import { ReportsService } from '../src/reports/reports.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TicketCommentsController } from '../src/ticket-comments/ticket-comments.controller';
import { TicketCommentsService } from '../src/ticket-comments/ticket-comments.service';

const projects: any = {
  findAll: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findTickets: jest.fn(),
};
const categories: any = {
  findAll: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const tickets: any = {
  findAll: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const dashboard: any = { summary: jest.fn() };
const reports: any = { generate: jest.fn() };
const comments: any = { create: jest.fn(), listByTicket: jest.fn() };
@Module({
  controllers: [
    ProjectsController,
    CategoriesController,
    TicketsController,
    TicketCommentsController,
    DashboardController,
    ReportsController,
  ],
  providers: [
    Reflector,
    { provide: ProjectsService, useValue: projects },
    { provide: CategoriesService, useValue: categories },
    { provide: TicketsService, useValue: tickets },
    { provide: TicketCommentsService, useValue: comments },
    { provide: DashboardService, useValue: dashboard },
    { provide: ReportsService, useValue: reports },
  ],
})
class Phase2HttpModule {}

describe('Phase 2 API (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [Phase2HttpModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: any) {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: 'user-1',
            role: req.headers.authorization === 'Bearer regular' ? 'user' : 'admin',
          };
          return true;
        },
      })
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });
  afterAll(async () => app.close());
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists, creates, views, updates projects, rejects missing names, counts tickets, and scopes project tickets', async () => {
    projects.findAll.mockResolvedValue([{ id: 'p1', name: 'Alpha' }]);
    projects.create.mockResolvedValue({ id: 'p1', name: 'Alpha' });
    projects.findById.mockResolvedValue({ id: 'p1', ticketCount: 2, pendingTicketCount: 1 });
    projects.update.mockResolvedValue({ id: 'p1', name: 'Renamed' });
    projects.findTickets.mockResolvedValue([{ id: 't1', projectId: 'p1' }]);
    await request(app.getHttpServer())
      .get('/api/projects')
      .set('Authorization', 'Bearer admin')
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/projects')
      .set('Authorization', 'Bearer admin')
      .send({})
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/projects')
      .set('Authorization', 'Bearer admin')
      .send({ name: 'Alpha' })
      .expect(201);
    await request(app.getHttpServer())
      .get('/api/projects/p1')
      .set('Authorization', 'Bearer admin')
      .expect(200)
      .expect(({ body }) => expect(body).toMatchObject({ ticketCount: 2, pendingTicketCount: 1 }));
    await request(app.getHttpServer())
      .patch('/api/projects/p1')
      .set('Authorization', 'Bearer admin')
      .send({ name: 'Renamed' })
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/projects/p1/tickets')
      .set('Authorization', 'Bearer admin')
      .expect(200)
      .expect(({ body }) => expect(body).toEqual([{ id: 't1', projectId: 'p1' }]));
    await request(app.getHttpServer())
      .delete('/api/projects/p1')
      .set('Authorization', 'Bearer regular')
      .expect(403);
    await request(app.getHttpServer())
      .delete('/api/projects/p1')
      .set('Authorization', 'Bearer admin')
      .expect(200);
  });

  it('lists, creates, views, renames categories, rejects missing names and restricts delete to admins', async () => {
    categories.findAll.mockResolvedValue([{ id: 'c1', name: 'Support' }]);
    categories.create.mockResolvedValue({ id: 'c1', name: 'Support' });
    categories.findById.mockResolvedValue({ id: 'c1' });
    categories.update.mockResolvedValue({ id: 'c1', name: 'Billing' });
    await request(app.getHttpServer())
      .get('/api/categories')
      .set('Authorization', 'Bearer admin')
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/categories')
      .set('Authorization', 'Bearer admin')
      .send({})
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/categories')
      .set('Authorization', 'Bearer admin')
      .send({ name: 'Support' })
      .expect(201);
    await request(app.getHttpServer())
      .get('/api/categories/c1')
      .set('Authorization', 'Bearer admin')
      .expect(200);
    await request(app.getHttpServer())
      .patch('/api/categories/c1')
      .set('Authorization', 'Bearer admin')
      .send({ name: 'Billing' })
      .expect(200);
    await request(app.getHttpServer())
      .delete('/api/categories/c1')
      .set('Authorization', 'Bearer regular')
      .expect(403);
    await request(app.getHttpServer())
      .delete('/api/categories/c1')
      .set('Authorization', 'Bearer admin')
      .expect(200);
  });

  it('lists with filters, validates and creates, views, updates with assignment, and deletes tickets', async () => {
    tickets.findAll.mockResolvedValue([{ id: 't1' }]);
    tickets.create.mockResolvedValue({ id: 't1', createdById: 'user-1' });
    tickets.findById.mockResolvedValue({
      id: 't1',
      project: { name: 'Alpha' },
      category: { name: 'Support' },
      createdBy: { firstName: 'A' },
      assignedTo: { firstName: 'B' },
    });
    tickets.update.mockResolvedValue({ id: 't1', assignedToId: 'user-2' });
    await request(app.getHttpServer())
      .get('/api/tickets?q=term&projectId=p1&status=pending')
      .set('Authorization', 'Bearer admin')
      .expect(200);
    expect(tickets.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'term', projectId: 'p1', status: 'pending' }),
    );
    await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Authorization', 'Bearer admin')
      .send({})
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Authorization', 'Bearer admin')
      .send({ title: 'Issue', kind: 'invalid' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Authorization', 'Bearer admin')
      .send({ title: 'Issue' })
      .expect(201);
    await request(app.getHttpServer())
      .get('/api/tickets/t1')
      .set('Authorization', 'Bearer admin')
      .expect(200)
      .expect(({ body }) => expect(body).toHaveProperty('assignedTo'));
    await request(app.getHttpServer())
      .patch('/api/tickets/t1')
      .set('Authorization', 'Bearer admin')
      .send({ assignedToId: 'user-2', status: 'done' })
      .expect(200);
    await request(app.getHttpServer())
      .patch('/api/tickets/t1')
      .set('Authorization', 'Bearer admin')
      .send({ title: '' })
      .expect(400);
    await request(app.getHttpServer())
      .delete('/api/tickets/t1')
      .set('Authorization', 'Bearer admin')
      .expect(200);
  });

  it('serves dashboard summary and filtered report routes', async () => {
    dashboard.summary.mockResolvedValue({
      pending: 1,
      byStatus: [{ key: 'pending', count: 1 }],
      byProject: [],
      byCategory: [],
      totalTickets: 1,
      clientReplies: 0,
      staffReplies: 0,
      ticketsWithoutReply: 1,
      replyTimeSeries: Array.from({ length: 14 }, (_, i) => ({ date: String(i), count: 0 })),
      ticketsTrend: Array.from({ length: 7 }, (_, i) => ({
        date: String(i),
        created: 0,
        solved: 0,
      })),
      byPriority: [
        { key: 'high', count: 0 },
        { key: 'medium', count: 1 },
        { key: 'low', count: 0 },
      ],
      activeTicketsTotal: 1,
      recentTickets: [],
    });
    reports.generate.mockResolvedValue({
      tickets: [],
      byStatus: [{ key: 'done', count: 0 }],
      byProject: [{ id: null, name: 'unassigned project', count: 0 }],
      byCategory: [{ id: null, name: 'unassigned category', count: 0 }],
    });
    await request(app.getHttpServer())
      .get('/api/dashboard/summary')
      .set('Authorization', 'Bearer admin')
      .expect(200)
      .expect(({ body }) =>
        expect(body).toMatchObject({
          pending: 1,
          totalTickets: 1,
          ticketsWithoutReply: 1,
          activeTicketsTotal: 1,
          recentTickets: [],
          replyTimeSeries: expect.any(Array),
          ticketsTrend: expect.any(Array),
          byPriority: expect.any(Array),
        }),
      );
    await request(app.getHttpServer())
      .get('/api/reports?projectId=p1&dateFrom=2026-01-01&dateTo=2026-01-31')
      .set('Authorization', 'Bearer admin')
      .expect(200)
      .expect(({ body }) => expect(body.tickets).toEqual([]));
    expect(reports.generate).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 'p1', dateFrom: '2026-01-01' }),
    );
  });

  it('creates and lists ticket comments and rejects empty bodies and missing tickets', async () => {
    comments.create.mockImplementation((ticketId: string) =>
      ticketId === 'missing'
        ? Promise.reject(new (require('@nestjs/common').NotFoundException)('Ticket not found'))
        : Promise.resolve({ id: 'comment-1', ticketId: 't1', authorId: 'user-1', body: 'Reply' }),
    );
    comments.listByTicket.mockResolvedValue([{ id: 'comment-1', role: 'client' }]);
    await request(app.getHttpServer())
      .post('/api/tickets/t1/comments')
      .set('Authorization', 'Bearer admin')
      .send({})
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/tickets/missing/comments')
      .set('Authorization', 'Bearer admin')
      .send({ body: 'Reply' })
      .expect(404);
    await request(app.getHttpServer())
      .post('/api/tickets/t1/comments')
      .set('Authorization', 'Bearer admin')
      .send({ body: 'Reply' })
      .expect(201);
    expect(comments.create).toHaveBeenCalledWith('t1', 'user-1', 'Reply');
    await request(app.getHttpServer())
      .get('/api/tickets/t1/comments')
      .set('Authorization', 'Bearer admin')
      .expect(200)
      .expect(({ body }) => expect(body).toEqual([{ id: 'comment-1', role: 'client' }]));
  });
});
