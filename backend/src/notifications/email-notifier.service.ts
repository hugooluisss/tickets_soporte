import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Ticket } from '../tickets/ticket.entity';

@Injectable()
export class EmailNotifierService {
  private readonly logger = new Logger(EmailNotifierService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST', 'localhost'),
      port: config.get<number>('SMTP_PORT', 587),
      secure: config.get<number>('SMTP_PORT', 587) === 465,
      auth: { user: config.get<string>('SMTP_USER', ''), pass: config.get<string>('SMTP_PASSWORD', '') },
    });
    this.from = config.get<string>('SMTP_FROM', 'tickets@example.com');
  }

  notify(ticket: Ticket): void {
    if (!ticket.reporterEmail) return;
    const status = ticket.status.replace('_', ' ');
    void this.transporter.sendMail({
      from: this.from,
      to: ticket.reporterEmail,
      subject: `Ticket updated: ${ticket.title}`,
      text: `Your ticket "${ticket.title}" has been updated. Current status: ${status}.`,
    }).catch((error: unknown) => this.logger.error(`Email delivery failed for ticket ${ticket.id}`, error instanceof Error ? error.stack : String(error)));
  }
}
