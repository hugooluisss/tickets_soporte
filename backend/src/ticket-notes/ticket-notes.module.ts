import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TicketsModule } from '../tickets/tickets.module';
import { TicketNote } from './ticket-note.entity';
import { TicketNotesController } from './ticket-notes.controller';
import { TicketNotesRepository } from './ticket-notes.repository';
import { TicketNotesService } from './ticket-notes.service';

@Module({
  imports: [TypeOrmModule.forFeature([TicketNote]), AuthModule, TicketsModule],
  controllers: [TicketNotesController],
  providers: [TicketNotesRepository, TicketNotesService],
})
export class TicketNotesModule {}
