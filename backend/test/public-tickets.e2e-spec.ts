import { INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ProjectsService } from '../src/projects/projects.service';
import { TicketsService } from '../src/tickets/tickets.service';
import { PublicTicketsController } from '../src/public-tickets/public-tickets.controller';

const projects: any = { findById: jest.fn() };
const tickets: any = { createPublic: jest.fn() };
@Module({
  imports: [ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 5, getTracker: async (req: any) => req.headers['x-forwarded-for'] ?? req.ip }])],
  controllers: [PublicTicketsController],
  providers: [
    { provide: ProjectsService, useValue: projects },
    { provide: TicketsService, useValue: tickets },
    ThrottlerGuard,
  ],
})
class PublicTicketsHttpModule {}

describe('Public ticket API (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [PublicTicketsHttpModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });
  afterAll(async () => app.close());
  let testRequest = 0;
  beforeEach(() => { jest.clearAllMocks(); testRequest++; });

  it('returns a public-safe project and reports an invalid project link', async () => {
    projects.findById.mockResolvedValue({ id: 'p1', name: 'Alpha', webhookUrl: 'https://private.example/hook', ticketCount: 9 });
    await request(app.getHttpServer()).get('/api/public/projects/p1').set('x-forwarded-for', `10.0.0.${testRequest}`).expect(200).expect(({ body }) => expect(body).toEqual({ id: 'p1', name: 'Alpha' }));
    projects.findById.mockRejectedValueOnce(new (require('@nestjs/common').NotFoundException)('Project not found'));
    await request(app.getHttpServer()).get('/api/public/projects/missing').set('x-forwarded-for', `10.0.1.${testRequest}`).expect(404);
  });

  it('creates valid public tickets and rejects invalid submissions', async () => {
    projects.findById.mockResolvedValue({ id: 'p1', name: 'Alpha' });
    tickets.createPublic.mockResolvedValue({ id: 't1', reporterName: 'Client', createdById: null });
    await request(app.getHttpServer()).post('/api/public/projects/p1/tickets').set('x-forwarded-for', `10.0.2.${testRequest}`).send({ reporterName: 'Client', reporterEmail: 'client@example.com', title: 'Issue', kind: 'bug' }).expect(201);
    expect(tickets.createPublic).toHaveBeenCalledWith('p1', expect.objectContaining({ reporterName: 'Client', reporterEmail: 'client@example.com', title: 'Issue', kind: 'bug' }));
    await request(app.getHttpServer()).post('/api/public/projects/p1/tickets').set('x-forwarded-for', `10.0.3.${testRequest}`).send({ reporterEmail: 'client@example.com', title: 'Issue', kind: 'bug' }).expect(400);
    await request(app.getHttpServer()).post('/api/public/projects/p1/tickets').set('x-forwarded-for', `10.0.4.${testRequest}`).send({ reporterName: 'Client', reporterEmail: 'bad-email', title: 'Issue', kind: 'bug' }).expect(400);
    await request(app.getHttpServer()).post('/api/public/projects/p1/tickets').set('x-forwarded-for', `10.0.5.${testRequest}`).send({ reporterName: 'Client', reporterEmail: 'client@example.com', title: '', kind: 'bug' }).expect(400);
  });

  it('accepts a public ticket without kind and lets the service apply the default', async () => {
    tickets.createPublic.mockResolvedValue({ id: 't-default-kind', kind: 'ticket' });
    await request(app.getHttpServer())
      .post('/api/public/projects/p1/tickets')
      .set('x-forwarded-for', `10.0.6.${testRequest}`)
      .send({ reporterName: 'Client', reporterEmail: 'client@example.com', title: 'Issue' })
      .expect(201);
    expect(tickets.createPublic).toHaveBeenCalledWith('p1', expect.not.objectContaining({ kind: expect.anything() }));
  });

  it('rejects requests over the controller-local per-IP limit without creating excess tickets', async () => {
    projects.findById.mockResolvedValue({ id: 'p1', name: 'Alpha' });
    tickets.createPublic.mockResolvedValue({ id: 't1' });
    const input = { reporterName: 'Client', reporterEmail: 'client@example.com', title: 'Issue', kind: 'bug' };
    for (let i = 0; i < 5; i++) await request(app.getHttpServer()).post('/api/public/projects/p1/tickets').set('x-forwarded-for', '192.0.2.1').send(input).expect(201);
    await request(app.getHttpServer()).post('/api/public/projects/p1/tickets').set('x-forwarded-for', '192.0.2.1').send(input).expect(429);
    expect(tickets.createPublic).toHaveBeenCalledTimes(5);
  });
});
