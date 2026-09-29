import { INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { DatabaseModule } from '../src/database/database.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ProfileModule } from '../src/profile/profile.module';
import { User } from '../src/users/user.entity';
import { UserRole } from '../src/users/user-role.enum';
import { UsersModule } from '../src/users/users.module';

@Module({}) class EmptyDatabaseModule {}

describe('Phase 1 API (e2e)', () => {
  let app: INestApplication;
  const repository: any = {
    find: jest.fn(), findOne: jest.fn(), createQueryBuilder: jest.fn(), create: jest.fn((x) => x), save: jest.fn(), update: jest.fn(), delete: jest.fn(),
  };
  let token: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'e2e-test-secret-long-enough';
    const module = await Test.createTestingModule({ imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), DatabaseModule, UsersModule, AuthModule, ProfileModule] })
      .overrideModule(DatabaseModule).useModule(EmptyDatabaseModule)
      .overrideProvider(getRepositoryToken(User)).useValue(repository)
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    const { ValidationPipe } = await import('@nestjs/common');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    const bcrypt = await import('bcrypt');
    const admin = { id: 'admin-1', email: 'admin@example.com', firstName: 'Admin', lastName: 'One', passwordHash: await bcrypt.hash('password', 4), role: UserRole.ADMIN, isActive: true };
    repository.createQueryBuilder.mockReturnValue({ addSelect() { return this; }, where() { return this; }, getOne: async () => admin });
    repository.findOne.mockImplementation(async ({ where }: any) => where.id === 'regular-1' ? { id: 'regular-1', isActive: true, role: UserRole.USER } : admin);
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password' });
    token = login.body.accessToken;
  });

  afterAll(async () => { await app.close(); });

  it('logs in and returns own profile without password hash', async () => {
    expect(token).toBeTruthy();
    repository.findOne.mockResolvedValue({ id: 'admin-1', email: 'admin@example.com', firstName: 'Admin', lastName: 'One', role: UserRole.ADMIN, isActive: true });
    const response = await request(app.getHttpServer()).get('/api/profile').set('Authorization', `Bearer ${token}`).expect(200);
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('rejects missing, malformed, expired, and incorrect-password authentication', async () => {
    await request(app.getHttpServer()).get('/api/profile').expect(401);
    await request(app.getHttpServer()).get('/api/profile').set('Authorization', 'Bearer malformed').expect(401);
    const jwt = await import('@nestjs/jwt');
    const expired = await app.get(jwt.JwtService).signAsync({ sub: 'admin-1', role: UserRole.ADMIN }, { expiresIn: -1 });
    await request(app.getHttpServer()).get('/api/profile').set('Authorization', `Bearer ${expired}`).expect(401);
    repository.createQueryBuilder.mockReturnValue({ addSelect() { return this; }, where() { return this; }, getOne: async () => ({ id: 'admin-1', email: 'admin@example.com', passwordHash: await (await import('bcrypt')).hash('right-password', 4), isActive: true }) });
    await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'admin@example.com', password: 'wrong-password' }).expect(401);
  });

  it('returns validation details for malformed login payload', async () => {
    const response = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'invalid', password: '', extra: true }).expect(400);
    expect(response.body.message).toBeDefined();
  });

  it('rejects regular users on admin endpoints and rejects wrong profile password', async () => {
    const jwt = await import('@nestjs/jwt');
    const jwtService = app.get(jwt.JwtService);
    const regular = await jwtService.signAsync({ sub: 'regular-1', role: UserRole.USER });
    repository.findOne.mockImplementation(async ({ where }: any) => where.id === 'regular-1' ? { id: 'regular-1', isActive: true, role: UserRole.USER } : { id: 'admin-1', isActive: true, role: UserRole.ADMIN });
    await request(app.getHttpServer()).get('/api/users').set('Authorization', `Bearer ${regular}`).expect(403);
    const bcrypt = await import('bcrypt');
    let stored = await bcrypt.hash('real-current-password', 4);
    repository.update.mockImplementation(async (_id: string, data: any) => { stored = data.passwordHash; return { affected: 1 }; });
    repository.findOne.mockResolvedValue({ id: 'admin-1', email: 'admin@example.com', isActive: true, role: UserRole.ADMIN });
    repository.createQueryBuilder.mockReturnValue({ addSelect() { return this; }, where() { return this; }, getOne: async () => ({ id: 'admin-1', email: 'admin@example.com', passwordHash: stored, isActive: true, role: UserRole.ADMIN }) });
    await request(app.getHttpServer()).post('/api/profile/change-password').set('Authorization', `Bearer ${token}`).send({ currentPassword: 'wrong-current', newPassword: 'new-password' }).expect(400);
    await request(app.getHttpServer()).post('/api/profile/change-password').set('Authorization', `Bearer ${token}`).send({ currentPassword: 'real-current-password', newPassword: 'new-password-123' }).expect(201);
    const nextLogin = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'admin@example.com', password: 'new-password-123' }).expect(201);
    expect(nextLogin.body.accessToken).toBeTruthy();
  });

  it('allows an admin to create, list, update, and delete users while rejecting duplicate emails', async () => {
    const rows: any[] = [{ id: 'admin-1', email: 'admin@example.com', firstName: 'Admin', lastName: 'One', role: UserRole.ADMIN, isActive: true }];
    repository.find.mockImplementation(async () => rows);
    repository.findOne.mockImplementation(async ({ where }: any) => rows.find((row) => row.id === where.id) ?? null);
    repository.createQueryBuilder.mockImplementation(() => {
      let email = '';
      const builder: any = {
        addSelect() { return this; },
        where(_condition: string, params: any) { email = params.email; return this; },
        getOne: async () => rows.find((row) => row.email.toLowerCase() === email.toLowerCase()) ?? null,
      };
      return builder;
    });
    repository.save.mockImplementation(async (user: any) => {
      const saved = { ...user, id: 'created-1' };
      rows.push(saved);
      return saved;
    });
    repository.update.mockImplementation(async (id: string, data: any) => {
      const row = rows.find((candidate) => candidate.id === id);
      if (!row) return { affected: 0 };
      Object.assign(row, data);
      return { affected: 1 };
    });
    repository.delete.mockImplementation(async (id: string) => {
      const index = rows.findIndex((row) => row.id === id);
      if (index < 0) return { affected: 0 };
      rows.splice(index, 1);
      return { affected: 1 };
    });

    const create = await request(app.getHttpServer()).post('/api/users').set('Authorization', `Bearer ${token}`).send({ email: 'new@example.com', password: 'password-123', firstName: 'New', lastName: 'User' }).expect(201);
    expect(create.body).not.toHaveProperty('passwordHash');
    await request(app.getHttpServer()).post('/api/users').set('Authorization', `Bearer ${token}`).send({ email: 'NEW@example.com', password: 'password-123', firstName: 'Dup', lastName: 'User' }).expect(409);
    const list = await request(app.getHttpServer()).get('/api/users').set('Authorization', `Bearer ${token}`).expect(200);
    expect(list.body).toHaveLength(2);
    await request(app.getHttpServer()).get('/api/users/created-1').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).patch('/api/users/created-1').set('Authorization', `Bearer ${token}`).send({ role: UserRole.ADMIN, isActive: false }).expect(200);
    await request(app.getHttpServer()).delete('/api/users/created-1').set('Authorization', `Bearer ${token}`).expect(200);
  });

  it('rejects login for unknown accounts and inactive accounts without issuing tokens', async () => {
    repository.createQueryBuilder.mockReturnValue({ addSelect() { return this; }, where() { return this; }, getOne: async () => null });
    await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'missing@example.com', password: 'password' }).expect(401);
    repository.createQueryBuilder.mockReturnValue({ addSelect() { return this; }, where() { return this; }, getOne: async () => ({ id: 'inactive', email: 'inactive@example.com', passwordHash: await (await import('bcrypt')).hash('password', 4), isActive: false }) });
    await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'inactive@example.com', password: 'password' }).expect(401);
  });
});
