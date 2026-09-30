import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Category } from '../categories/category.entity';
import { Ticket } from '../tickets/ticket.entity';
import { TicketComment } from '../ticket-comments/ticket-comment.entity';
import { TicketNote } from '../ticket-notes/ticket-note.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'dev_tickets_app'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'dev_tickets'),
        entities: [User, Project, Category, Ticket, TicketComment, TicketNote],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false,
        migrationsRun: config.get<string>('DB_MIGRATIONS_RUN', 'false') === 'true',
        retryAttempts: 5,
        retryDelay: 2000,
      }),
    }),
  ],
})
export class DatabaseModule {}
