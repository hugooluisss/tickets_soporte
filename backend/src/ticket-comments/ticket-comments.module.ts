import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TicketsModule } from '../tickets/tickets.module';
import { TicketComment } from './ticket-comment.entity';
import { TicketCommentsController } from './ticket-comments.controller';
import { TicketCommentsRepository } from './ticket-comments.repository';
import { TicketCommentsService } from './ticket-comments.service';

@Module({
  imports: [TypeOrmModule.forFeature([TicketComment]), AuthModule, TicketsModule],
  controllers: [TicketCommentsController],
  providers: [TicketCommentsRepository, TicketCommentsService],
  exports: [TicketCommentsRepository, TicketCommentsService],
})
export class TicketCommentsModule {}
