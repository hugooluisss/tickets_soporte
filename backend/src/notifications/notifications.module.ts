import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailNotifierService } from './email-notifier.service';
import { WebhookNotifierService } from './webhook-notifier.service';

@Module({ imports: [ConfigModule], providers: [EmailNotifierService, WebhookNotifierService], exports: [EmailNotifierService, WebhookNotifierService] })
export class NotificationsModule {}
