import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TicketsModule } from '../tickets/tickets.module';
import { TicketCommentsModule } from '../ticket-comments/ticket-comments.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
@Module({ imports: [AuthModule, TicketsModule, TicketCommentsModule], controllers: [DashboardController], providers: [DashboardService] })
export class DashboardModule {}
