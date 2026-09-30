import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ProfileModule } from './profile/profile.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { CategoriesModule } from './categories/categories.module';
import { TicketsModule } from './tickets/tickets.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { TicketCommentsModule } from './ticket-comments/ticket-comments.module';
import { PublicTicketsModule } from './public-tickets/public-tickets.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, UsersModule, AuthModule, ProfileModule, ProjectsModule, CategoriesModule, TicketsModule, TicketCommentsModule, DashboardModule, ReportsModule, PublicTicketsModule] })
export class AppModule {}
