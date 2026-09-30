import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ProjectsService } from '../projects/projects.service';
import { TicketsService } from '../tickets/tickets.service';
import { CreatePublicTicketDto } from './dto/create-public-ticket.dto';

@Controller('public/projects')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60_000 } })
export class PublicTicketsController {
  constructor(private readonly projects: ProjectsService, private readonly tickets: TicketsService) {}

  @Get(':projectId')
  async findProject(@Param('projectId') projectId: string) {
    const project = await this.projects.findById(projectId);
    return { id: project.id, name: project.name };
  }

  @Post(':projectId/tickets')
  create(@Param('projectId') projectId: string, @Body() input: CreatePublicTicketDto) {
    return this.tickets.createPublic(projectId, input);
  }
}
