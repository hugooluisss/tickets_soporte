import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesRepository {
  constructor(@InjectRepository(Category) private readonly repository: Repository<Category>) {}
  findAll(): Promise<Category[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }
  findById(id: string): Promise<Category | null> {
    return this.repository.findOne({ where: { id } });
  }
  findByName(name: string): Promise<Category | null> {
    return this.repository
      .createQueryBuilder('category')
      .where('LOWER(category.name) = LOWER(:name)', { name })
      .getOne();
  }
  create(data: Partial<Category>): Promise<Category> {
    return this.repository.save(this.repository.create(data));
  }
  async update(id: string, data: Partial<Category>): Promise<Category | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }
  async delete(id: string): Promise<boolean> {
    return (await this.repository.delete(id)).affected! > 0;
  }
}
