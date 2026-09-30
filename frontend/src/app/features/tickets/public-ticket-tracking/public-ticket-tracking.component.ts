import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { PublicTrackedTicket, PublicTicketTrackingApiService } from '../public-ticket-tracking-api.service';

@Component({ selector: 'app-public-ticket-tracking', standalone: true, imports: [DatePipe, TranslatePipe], templateUrl: './public-ticket-tracking.component.html' })
export class PublicTicketTrackingComponent {
  readonly ticket = signal<PublicTrackedTicket | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  constructor() {
    const token = inject(ActivatedRoute).snapshot.paramMap.get('token') ?? '';
    inject(PublicTicketTrackingApiService).get(token).subscribe({ next: ticket => { this.ticket.set(ticket); this.loading.set(false); }, error: () => { this.notFound.set(true); this.loading.set(false); } });
  }
}
