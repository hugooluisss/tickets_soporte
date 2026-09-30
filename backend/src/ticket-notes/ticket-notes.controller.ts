import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user-role.enum';
import { CreateTicketNoteDto } from './dto/create-ticket-note.dto';
import { TicketNotesService } from './ticket-notes.service';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('tickets/:ticketId/notes')
@UseGuards(JwtAuthGuard)
export class TicketNotesController {
  constructor(private readonly notes: TicketNotesService) {}
  @Post() create(
    @Param('ticketId') ticketId: string,
    @Body() input: CreateTicketNoteDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.notes.create(ticketId, request.user.id, input.content);
  }
  @Get() list(@Param('ticketId') ticketId: string) {
    return this.notes.listByTicket(ticketId);
  }
  @Delete(':noteId') @UseGuards(RolesGuard) @Roles(UserRole.ADMIN) async delete(
    @Param('noteId') id: string,
  ) {
    await this.notes.delete(id);
    return { deleted: true };
  }
}
