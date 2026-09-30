import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ticket, TicketFilters, TicketNote } from '../models';

@Injectable({ providedIn: 'root' })
export class TicketsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/tickets`;
  list(filters: TicketFilters = {}): Observable<Ticket[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) if (value) params = params.set(key, value);
    return this.http.get<Ticket[]>(this.url, { params });
  }
  get(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.url}/${id}`);
  }
  create(input: Partial<Ticket> & Pick<Ticket, 'title'>): Observable<Ticket> {
    return this.http.post<Ticket>(this.url, input);
  }
  update(id: string, input: Partial<Ticket>): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.url}/${id}`, input);
  }
  delete(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.url}/${id}`);
  }
  listNotes(ticketId: string): Observable<TicketNote[]> {
    return this.http.get<TicketNote[]>(`${this.url}/${ticketId}/notes`);
  }
  createNote(ticketId: string, content: string): Observable<TicketNote> {
    return this.http.post<TicketNote>(`${this.url}/${ticketId}/notes`, { content });
  }
  deleteNote(ticketId: string, noteId: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.url}/${ticketId}/notes/${noteId}`);
  }
}
