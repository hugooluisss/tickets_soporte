import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ProjectsModule } from '../projects/projects.module';
import { TicketsModule } from '../tickets/tickets.module';
import { PublicTicketsController } from './public-tickets.controller';

@Module({
  imports: [ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 5 }]), ProjectsModule, TicketsModule],
  controllers: [PublicTicketsController],
  providers: [ThrottlerGuard],
})
export class PublicTicketsModule {}
