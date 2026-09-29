import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TicketsModule } from '../tickets/tickets.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
@Module({ imports: [AuthModule, TicketsModule], controllers: [ReportsController], providers: [ReportsService] })
export class ReportsModule {}
