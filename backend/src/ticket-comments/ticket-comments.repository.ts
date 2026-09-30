import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketComment } from './ticket-comment.entity';

export interface TicketCommentDashboardStats {
  totalTickets: number;
  clientReplies: number;
  staffReplies: number;
  ticketsWithoutReply: number;
  replyTimeSeries: { date: string; count: number }[];
}

@Injectable()
export class TicketCommentsRepository {
  constructor(
    @InjectRepository(TicketComment) private readonly repository: Repository<TicketComment>,
  ) {}
  create(data: Partial<TicketComment>): Promise<TicketComment> {
    return this.repository.save(this.repository.create(data));
  }
  async listByTicket(ticketId: string): Promise<any[]> {
    const { entities, raw } = await this.repository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .innerJoin('comment.ticket', 'ticket')
      .addSelect(
        "CASE WHEN comment.authorId = ticket.createdById THEN 'client' ELSE 'staff' END",
        'role',
      )
      .where('comment.ticketId = :ticketId', { ticketId })
      .orderBy('comment.createdAt', 'ASC')
      .addOrderBy('comment.id', 'ASC')
      .getRawAndEntities();
    return entities.map((comment, index) => ({ ...comment, role: raw[index]?.role }));
  }

  async dashboardStats(): Promise<TicketCommentDashboardStats> {
    const totals = await this.repository.manager.query(
      'SELECT COUNT(DISTINCT t.id) AS totalTickets, COUNT(CASE WHEN c.author_id = t.created_by_id THEN c.id END) AS clientReplies, COUNT(CASE WHEN c.id IS NOT NULL AND c.author_id <> t.created_by_id THEN c.id END) AS staffReplies, COUNT(DISTINCT CASE WHEN c.id IS NULL THEN t.id END) AS ticketsWithoutReply FROM tickets t LEFT JOIN ticket_comments c ON c.ticket_id = t.id',
    );
    const rows = await this.repository.manager.query(
      "SELECT DATE_FORMAT(c.created_at, '%Y-%m-%d') AS date, COUNT(*) AS count FROM ticket_comments c WHERE c.created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) AND c.created_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY) GROUP BY DATE_FORMAT(c.created_at, '%Y-%m-%d')",
    );
    const byDate = new Map<string, number>(rows.map((row: any) => [row.date, Number(row.count)]));
    const replyTimeSeries = Array.from({ length: 14 }, (_, index) => {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - 13 + index);
      const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      return { date, count: byDate.get(date) ?? 0 };
    });
    const result = totals[0] ?? {};
    return {
      totalTickets: Number(result.totalTickets ?? 0),
      clientReplies: Number(result.clientReplies ?? 0),
      staffReplies: Number(result.staffReplies ?? 0),
      ticketsWithoutReply: Number(result.ticketsWithoutReply ?? 0),
      replyTimeSeries,
    };
  }
}
