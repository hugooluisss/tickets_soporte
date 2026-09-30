import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Project } from './project.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsRepository } from './projects.repository';
import { ProjectsService } from './projects.service';
import { TicketsModule } from '../tickets/tickets.module';
@Module({ imports: [TypeOrmModule.forFeature([Project]), AuthModule, TicketsModule], controllers: [ProjectsController], providers: [ProjectsRepository, ProjectsService], exports: [ProjectsService] })
export class ProjectsModule {}
