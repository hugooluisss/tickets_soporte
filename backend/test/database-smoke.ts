import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import dataSource from '../src/database/data-source';
import { UserRole } from '../src/users/user-role.enum';
import { UsersRepository } from '../src/users/users.repository';

async function run(): Promise<void> {
  await dataSource.initialize();
  try {
    await dataSource.runMigrations();
    const repository = new UsersRepository(dataSource.getRepository('User') as any);
    const email = `db-smoke-${Date.now()}@example.com`;
    const created = await repository.create({ email, passwordHash: 'test-hash', firstName: 'DB', lastName: 'Smoke', role: UserRole.USER, isActive: true });
    assert.ok(created.id);
    assert.equal((await repository.findById(created.id))?.email, email);
    assert.equal((await repository.findByEmail(email))?.id, created.id);
    assert.ok((await repository.findAll()).some((user) => user.id === created.id));
    assert.equal((await repository.update(created.id, { isActive: false }))?.isActive, false);
    assert.equal(await repository.delete(created.id), true);
    console.log('MySQL migration and UsersRepository CRUD smoke test passed');
  } finally {
    await dataSource.destroy();
  }
}

void run();
