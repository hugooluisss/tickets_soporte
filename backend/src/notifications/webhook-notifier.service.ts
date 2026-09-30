import { Injectable, Logger } from '@nestjs/common';

export interface TicketWebhookPayload {
  ticketId: string;
  title: string;
  projectId: string;
  projectName: string;
  kind: string;
  reporterName?: string;
  reporterEmail?: string;
}

@Injectable()
export class WebhookNotifierService {
  private readonly logger = new Logger(WebhookNotifierService.name);

  notify(webhookUrl: string | null | undefined, payload: TicketWebhookPayload): void {
    if (!webhookUrl) return;
    void fetch(webhookUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      .then((response) => { if (!response.ok) this.logger.error(`Webhook returned HTTP ${response.status} for ticket ${payload.ticketId}`); })
      .catch((error: unknown) => this.logger.error(`Webhook delivery failed for ticket ${payload.ticketId}`, error instanceof Error ? error.stack : String(error)));
  }
}
