import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './category.entity';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categories: CategoriesRepository) {}
  findAll(): Promise<Category[]> { return this.categories.findAll(); }
  async findById(id: string): Promise<Category> { const category = await this.categories.findById(id); if (!category) throw new NotFoundException('Category not found'); return category; }
  async create(input: { name: string }): Promise<Category> {
    const name = input.name.trim();
    if (!name) throw new BadRequestException('Category name is required');
    if (await this.categories.findByName(name)) throw new ConflictException('Category name is already in use');
    return this.categories.create({ name });
  }
  async update(id: string, input: { name?: string }): Promise<Category> {
    const existing = await this.findById(id);
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new BadRequestException('Category name is required');
      const duplicate = await this.categories.findByName(name);
      if (duplicate && duplicate.id !== id) throw new ConflictException('Category name is already in use');
      input = { name };
    }
    const updated = await this.categories.update(existing.id, input);
    if (!updated) throw new NotFoundException('Category not found');
    return updated;
  }
  async delete(id: string): Promise<void> { if (!(await this.categories.delete(id))) throw new NotFoundException('Category not found'); }
}
