import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Ticket, TicketFilters } from '../models';
import { TicketsApiService } from './tickets-api.service';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private readonly api = inject(TicketsApiService);
  private readonly filterState = signal<TicketFilters>({});
  readonly filters = this.filterState.asReadonly();
  list(filters: TicketFilters = this.filterState()): Observable<Ticket[]> {
    const composed = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '' && value != null),
    ) as TicketFilters;
    this.filterState.set(composed);
    return this.api.list(composed);
  }
  get(id: string) {
    return this.api.get(id);
  }
  create(input: Partial<Ticket> & Pick<Ticket, 'title'>) {
    return this.api.create(input);
  }
  update(id: string, input: Partial<Ticket>) {
    return this.api.update(id, input);
  }
  delete(id: string) {
    return this.api.delete(id);
  }
  listNotes(ticketId: string) {
    return this.api.listNotes(ticketId);
  }
  createNote(ticketId: string, content: string) {
    return this.api.createNote(ticketId, content);
  }
  deleteNote(ticketId: string, noteId: string) {
    return this.api.deleteNote(ticketId, noteId);
  }
}
