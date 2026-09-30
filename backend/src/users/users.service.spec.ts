import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-role.enum';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let repository: jest.Mocked<UsersRepository>;
  let service: UsersService;
  const user: any = {
    id: 'u1',
    email: 'a@example.com',
    passwordHash: '',
    firstName: 'A',
    lastName: 'User',
    role: UserRole.USER,
    isActive: true,
  };

  beforeEach(() => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;
    service = new UsersService(repository);
  });

  it('rejects duplicate emails and hashes password on create', async () => {
    repository.findByEmail.mockResolvedValueOnce(user);
    await expect(
      service.create({ email: user.email, password: 'password1', firstName: 'A', lastName: 'B' }),
    ).rejects.toBeInstanceOf(ConflictException);
    repository.findByEmail.mockResolvedValueOnce(null);
    repository.create.mockImplementation(async (data: any) => ({ ...user, ...data }));
    const created = await service.create({
      email: 'new@example.com',
      password: 'password1',
      firstName: 'A',
      lastName: 'B',
    });
    expect(
      await bcrypt.compare('password1', (repository.create.mock.calls[0][0] as any).passwordHash),
    ).toBe(true);
    expect(created).not.toHaveProperty('passwordHash');
  });

  it('rejects invalid credentials generically and deactivated accounts explicitly', async () => {
    repository.findByEmail.mockResolvedValue(null);
    await expect(service.authenticate('missing@example.com', 'bad')).rejects.toMatchObject({
      message: 'Invalid email or password',
    });
    const stored = { ...user, passwordHash: await bcrypt.hash('correct-password', 4) };
    repository.findByEmail.mockResolvedValue(stored);
    await expect(service.authenticate(user.email, 'wrong-password')).rejects.toMatchObject({
      message: 'Invalid email or password',
    });
    repository.findByEmail.mockResolvedValue({ ...stored, isActive: false });
    await expect(service.authenticate(user.email, 'correct-password')).rejects.toMatchObject({
      message: 'Account is deactivated',
    });
  });

  it('updates role and active state', async () => {
    repository.findById.mockResolvedValue(user);
    repository.update.mockResolvedValue({ ...user, role: UserRole.ADMIN, isActive: false });
    const result = await service.update('u1', { role: UserRole.ADMIN, isActive: false });
    expect(result.role).toBe(UserRole.ADMIN);
    expect(result.isActive).toBe(false);
  });

  it('prevents deleting self and reports missing users', async () => {
    await expect(service.delete('u1', 'u1')).rejects.toBeInstanceOf(ConflictException);
    repository.delete.mockResolvedValue(false);
    await expect(service.delete('missing', 'admin')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('verifies and updates passwords; wrong current password preserves stored value', async () => {
    const stored = { ...user, passwordHash: await bcrypt.hash('oldPassword', 4) };
    repository.findById.mockResolvedValue(stored);
    repository.findByEmail.mockResolvedValue(stored);
    repository.update.mockResolvedValue(stored);
    await expect(
      service.verifyAndUpdatePassword('u1', 'wrongPassword', 'newPassword'),
    ).rejects.toMatchObject({ message: 'Current password is incorrect' });
    expect(repository.update).not.toHaveBeenCalled();
    await service.verifyAndUpdatePassword('u1', 'oldPassword', 'newPassword');
    expect(
      await bcrypt.compare('newPassword', (repository.update.mock.calls[0][1] as any).passwordHash),
    ).toBe(true);
  });
});
