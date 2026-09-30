import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';

@Injectable()
export class ProjectsRepository {
  constructor(@InjectRepository(Project) private readonly repository: Repository<Project>) {}
  findAll(): Promise<Project[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }
  findById(id: string): Promise<Project | null> {
    return this.repository.findOne({ where: { id } });
  }
  create(data: Partial<Project>): Promise<Project> {
    return this.repository.save(this.repository.create(data));
  }
  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }
  async delete(id: string): Promise<boolean> {
    return (await this.repository.delete(id)).affected! > 0;
  }
  async ticketCounts(): Promise<Map<string, { total: number; pending: number }>> {
    const rows = await this.repository
      .createQueryBuilder('project')
      .leftJoin('tickets', 'ticket', 'ticket.project_id = project.id')
      .select('project.id', 'id')
      .addSelect('COUNT(ticket.id)', 'total')
      .addSelect("SUM(CASE WHEN ticket.status = 'pending' THEN 1 ELSE 0 END)", 'pending')
      .groupBy('project.id')
      .getRawMany();
    return new Map(
      rows.map((row: any) => [
        row.id,
        { total: Number(row.total), pending: Number(row.pending ?? 0) },
      ]),
    );
  }
}
