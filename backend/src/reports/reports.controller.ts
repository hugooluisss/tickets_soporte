import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TicketFilterDto } from '../tickets/dto/ticket-filter.dto';
import { ReportsService } from './reports.service';
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}
  @Get() generate(@Query() filter: TicketFilterDto) {
    return this.reports.generate(filter);
  }
}
