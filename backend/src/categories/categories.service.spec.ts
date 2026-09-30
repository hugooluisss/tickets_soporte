import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  const repository: any = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  let service: CategoriesService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new CategoriesService(repository);
  });
  it('lists and views categories, and creates a named category', async () => {
    repository.findAll.mockResolvedValue([{ id: 'c1', name: 'Support' }]);
    repository.findById.mockResolvedValue({ id: 'c1', name: 'Support' });
    repository.findByName.mockResolvedValue(null);
    repository.create.mockResolvedValue({ id: 'c2', name: 'Billing' });
    expect(await service.findAll()).toHaveLength(1);
    expect(await service.findById('c1')).toMatchObject({ name: 'Support' });
    expect(await service.create({ name: ' Billing ' })).toMatchObject({ name: 'Billing' });
  });
  it('rejects duplicate names and persists renames', async () => {
    await expect(service.create({ name: '  ' })).rejects.toBeInstanceOf(BadRequestException);
    repository.findByName.mockResolvedValue({ id: 'c1', name: 'Support' });
    await expect(service.create({ name: 'Support' })).rejects.toBeInstanceOf(ConflictException);
    repository.findById.mockResolvedValue({ id: 'c1', name: 'Support' });
    repository.findByName.mockResolvedValue({ id: 'c2', name: 'Other' });
    await expect(service.update('c1', { name: 'Other' })).rejects.toBeInstanceOf(ConflictException);
    repository.findByName.mockResolvedValue(null);
    repository.update.mockResolvedValue({ id: 'c1', name: 'Updated' });
    expect(await service.update('c1', { name: 'Updated' })).toMatchObject({ name: 'Updated' });
  });
  it('rejects missing categories and deletes existing categories', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.findById('x')).rejects.toBeInstanceOf(NotFoundException);
    repository.delete.mockResolvedValue(true);
    await expect(service.delete('c1')).resolves.toBeUndefined();
    repository.delete.mockResolvedValue(false);
    await expect(service.delete('x')).rejects.toBeInstanceOf(NotFoundException);
  });
});
