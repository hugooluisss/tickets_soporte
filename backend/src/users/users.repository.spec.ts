import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
  it('wraps entity persistence operations', async () => {
    const qb: any = { addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue({ id: 'u1' }) };
    const orm = { find: jest.fn().mockResolvedValue([]), findOne: jest.fn().mockResolvedValue({ id: 'u1' }), createQueryBuilder: jest.fn().mockReturnValue(qb), create: jest.fn((x) => x), save: jest.fn((x) => x), update: jest.fn().mockResolvedValue({ affected: 1 }), delete: jest.fn().mockResolvedValue({ affected: 1 }) } as unknown as Repository<User>;
    const repository = new UsersRepository(orm);
    expect(await repository.findAll()).toEqual([]);
    expect(await repository.findById('u1')).toEqual({ id: 'u1' });
    expect(await repository.findByEmail('a@example.com')).toEqual({ id: 'u1' });
    expect(await repository.create({ email: 'a@example.com' })).toEqual({ email: 'a@example.com' });
    expect(await repository.update('u1', { isActive: false })).toEqual({ id: 'u1' });
    expect(await repository.delete('u1')).toBe(true);
  });
});
