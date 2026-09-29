import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ProjectsRepository } from '../projects/projects.repository';
import { Project } from '../projects/project.entity';
import { CategoriesModule } from '../categories/categories.module';
import { Ticket } from './ticket.entity';
import { TicketsController } from './tickets.controller';
import { TicketsRepository } from './tickets.repository';
import { TicketsService } from './tickets.service';
@Module({ imports: [TypeOrmModule.forFeature([Ticket, Project]), AuthModule, UsersModule, CategoriesModule], controllers: [TicketsController], providers: [TicketsRepository, TicketsService, ProjectsRepository], exports: [TicketsService, TicketsRepository] })
export class TicketsModule {}
