import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Category } from '../categories/category.entity';
import { Ticket } from '../tickets/ticket.entity';
import { TicketComment } from '../ticket-comments/ticket-comment.entity';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME ?? 'dev_tickets_app',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'dev_tickets',
  entities: [User, Project, Category, Ticket, TicketComment],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
