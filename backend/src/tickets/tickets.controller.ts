import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketFilterDto } from './dto/ticket-filter.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';
interface AuthenticatedRequest extends Request { user: { id: string } }
@Controller('tickets') @UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}
  @Get() findAll(@Query() filter: TicketFilterDto) { return this.tickets.findAll(filter); }
  @Post() create(@Body() input: CreateTicketDto, @Req() request: AuthenticatedRequest) { return this.tickets.create(input, request.user.id); }
  @Get(':id') findById(@Param('id') id: string) { return this.tickets.findById(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() input: UpdateTicketDto) { return this.tickets.update(id, input); }
  @Delete(':id') async delete(@Param('id') id: string) { await this.tickets.delete(id); return { deleted: true }; }
}
