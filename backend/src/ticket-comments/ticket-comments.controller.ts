import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTicketCommentDto } from './dto/create-ticket-comment.dto';
import { TicketCommentsService } from './ticket-comments.service';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}
@Controller('tickets/:ticketId/comments')
@UseGuards(JwtAuthGuard)
export class TicketCommentsController {
  constructor(private readonly comments: TicketCommentsService) {}
  @Post() create(
    @Param('ticketId') ticketId: string,
    @Body() input: CreateTicketCommentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.comments.create(ticketId, request.user.id, input.body);
  }
  @Get() list(@Param('ticketId') ticketId: string) {
    return this.comments.listByTicket(ticketId);
  }
}
