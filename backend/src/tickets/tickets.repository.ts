import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Ticket } from './ticket.entity';
import { TicketFilter } from './ticket-filter';

@Injectable()
export class TicketsRepository {
  constructor(@InjectRepository(Ticket) private readonly repository: Repository<Ticket>) {}
  findAll(filter: TicketFilter = {}): Promise<Ticket[]> { return this.filtered(filter).orderBy('ticket.createdAt', 'DESC').getMany(); }
  findById(id: string): Promise<Ticket | null> { return this.repository.findOne({ where: { id }, relations: { project: true, category: true, createdBy: true, assignedTo: true } }); }
  findByTrackingToken(trackingToken: string): Promise<Ticket | null> { return this.repository.findOne({ where: { trackingToken } }); }
  create(data: Partial<Ticket>): Promise<Ticket> { return this.repository.save(this.repository.create(data)); }
  async update(id: string, data: Partial<Ticket>): Promise<Ticket | null> { await this.repository.update(id, data); return this.findById(id); }
  async delete(id: string): Promise<boolean> { return (await this.repository.delete(id)).affected! > 0; }
  async summary(): Promise<{ pending: number; byStatus: any[]; byProject: any[]; byCategory: any[] }> {
    const [byStatus, byProject, byCategory] = await Promise.all([
      this.repository.createQueryBuilder('ticket').select('ticket.status', 'key').addSelect('COUNT(ticket.id)', 'count').groupBy('ticket.status').getRawMany(),
      this.groupByRelation('ticket.project', 'project'), this.groupByRelation('ticket.category', 'category'),
    ]);
    const pending = Number((byStatus.find((row: any) => row.key === 'pending') ?? {}).count ?? 0);
    return { pending, byStatus: this.numeric(byStatus), byProject: this.numeric(byProject), byCategory: this.numeric(byCategory) };
  }
  async dashboardAggregates() {
    const [priorityRows, activeRows, createdRows, solvedRows, recentTickets] = await Promise.all([
      this.repository.createQueryBuilder('ticket').select('ticket.priority', 'key').addSelect('COUNT(ticket.id)', 'count').where('ticket.status NOT IN (:...terminal)', { terminal: ['done', 'cancelled'] }).groupBy('ticket.priority').getRawMany(),
      this.repository.createQueryBuilder('ticket').select('COUNT(ticket.id)', 'count').where('ticket.status NOT IN (:...terminal)', { terminal: ['done', 'cancelled'] }).getRawOne(),
      this.repository.createQueryBuilder('ticket').select('DATE_FORMAT(ticket.createdAt, \'%Y-%m-%d\')', 'date').addSelect('COUNT(ticket.id)', 'count').where('ticket.createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)').andWhere('ticket.createdAt < DATE_ADD(CURDATE(), INTERVAL 1 DAY)').groupBy("DATE_FORMAT(ticket.createdAt, '%Y-%m-%d')").getRawMany(),
      this.repository.createQueryBuilder('ticket').select('DATE_FORMAT(ticket.updatedAt, \'%Y-%m-%d\')', 'date').addSelect('COUNT(ticket.id)', 'count').where('ticket.status = :status', { status: 'done' }).andWhere('ticket.updatedAt >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)').andWhere('ticket.updatedAt < DATE_ADD(CURDATE(), INTERVAL 1 DAY)').groupBy("DATE_FORMAT(ticket.updatedAt, '%Y-%m-%d')").getRawMany(),
      this.repository.createQueryBuilder('ticket').select(['ticket.id', 'ticket.title', 'ticket.createdAt', 'ticket.status']).orderBy('ticket.createdAt', 'DESC').take(5).getMany(),
    ]);
    const priorityMap = new Map<string, number>(priorityRows.map((row: any) => [row.key, Number(row.count)]));
    const byPriority = ['high', 'medium', 'low'].map((key) => ({ key, count: priorityMap.get(key) ?? 0 }));
    const createdMap = new Map<string, number>(createdRows.map((row: any) => [row.date, Number(row.count)]));
    const solvedMap = new Map<string, number>(solvedRows.map((row: any) => [row.date, Number(row.count)]));
    const ticketsTrend = Array.from({ length: 7 }, (_, index) => { const day = new Date(); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() - 6 + index); const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`; return { date, created: createdMap.get(date) ?? 0, solved: solvedMap.get(date) ?? 0 }; });
    return { byPriority, activeTicketsTotal: Number(activeRows?.count ?? 0), ticketsTrend, recentTickets: recentTickets.map(({ id, title, createdAt, status }) => ({ id, title, createdAt: createdAt.toISOString(), status })) };
  }
  async aggregates(filter: TicketFilter): Promise<{ byStatus: any[]; byProject: any[]; byCategory: any[] }> {
    const [byStatus, byProject, byCategory] = await Promise.all([
      this.aggregateFiltered(filter).select('ticket.status', 'key').addSelect('COUNT(ticket.id)', 'count').groupBy('ticket.status').getRawMany(),
      this.aggregateFiltered(filter).leftJoin('ticket.project', 'project').select('project.id', 'id').addSelect('project.name', 'name').addSelect('COUNT(ticket.id)', 'count').groupBy('project.id').addGroupBy('project.name').getRawMany(),
      this.aggregateFiltered(filter).leftJoin('ticket.category', 'category').select('category.id', 'id').addSelect('category.name', 'name').addSelect('COUNT(ticket.id)', 'count').groupBy('category.id').addGroupBy('category.name').getRawMany(),
    ]);
    return { byStatus: this.numeric(byStatus), byProject: this.numeric(byProject, 'unassigned project'), byCategory: this.numeric(byCategory, 'unassigned category') };
  }
  private filtered(filter: TicketFilter): SelectQueryBuilder<Ticket> {
    const qb = this.repository.createQueryBuilder('ticket').leftJoinAndSelect('ticket.project', 'project').leftJoinAndSelect('ticket.category', 'category').leftJoinAndSelect('ticket.createdBy', 'creator').leftJoinAndSelect('ticket.assignedTo', 'assignee');
    return this.applyFilters(qb, filter);
  }
  private aggregateFiltered(filter: TicketFilter): SelectQueryBuilder<Ticket> {
    return this.applyFilters(this.repository.createQueryBuilder('ticket'), filter);
  }
  private applyFilters(qb: SelectQueryBuilder<Ticket>, filter: TicketFilter): SelectQueryBuilder<Ticket> {
    if (filter.q) qb.andWhere('(LOWER(ticket.title) LIKE LOWER(:q) OR LOWER(ticket.description) LIKE LOWER(:q))', { q: `%${filter.q}%` });
    if (filter.projectId) qb.andWhere('ticket.projectId = :projectId', { projectId: filter.projectId });
    if (filter.categoryId) qb.andWhere('ticket.categoryId = :categoryId', { categoryId: filter.categoryId });
    if (filter.priority) qb.andWhere('ticket.priority = :priority', { priority: filter.priority });
    if (filter.status) qb.andWhere('ticket.status = :status', { status: filter.status });
    if (filter.kind) qb.andWhere('ticket.kind = :kind', { kind: filter.kind });
    if (filter.dateFrom) qb.andWhere('ticket.createdAt >= :dateFrom', { dateFrom: `${filter.dateFrom} 00:00:00` });
    if (filter.dateTo) qb.andWhere('ticket.createdAt <= :dateTo', { dateTo: `${filter.dateTo} 23:59:59.999` });
    return qb;
  }
  private groupByRelation(relation: string, alias: string): Promise<any[]> {
    return this.repository.createQueryBuilder('ticket').leftJoin(relation, alias).select(`${alias}.id`, 'id').addSelect(`${alias}.name`, 'name').addSelect('COUNT(ticket.id)', 'count').groupBy(`${alias}.id`).addGroupBy(`${alias}.name`).getRawMany();
  }
  private numeric(rows: any[], unassignedName?: string): any[] {
    const result = rows.map((row) => ({ ...row, count: Number(row.count) }));
    if (unassignedName) {
      const existing = result.find((row) => row.id == null);
      if (existing) existing.name = unassignedName;
      else result.push({ id: null, name: unassignedName, count: 0 });
    }
    return result;
  }
}
