import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user-role.enum';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}
  @Get() findAll() {
    return this.projects.findAll();
  }
  @Post() create(@Body() input: CreateProjectDto) {
    return this.projects.create(input);
  }
  @Get(':id/tickets') findTickets(@Param('id') id: string) {
    return this.projects.findTickets(id);
  }
  @Get(':id') findById(@Param('id') id: string) {
    return this.projects.findById(id);
  }
  @Patch(':id') update(@Param('id') id: string, @Body() input: UpdateProjectDto) {
    return this.projects.update(id, input);
  }
  @Delete(':id') @UseGuards(RolesGuard) @Roles(UserRole.ADMIN) async delete(
    @Param('id') id: string,
  ) {
    await this.projects.delete(id);
    return { deleted: true };
  }
}
