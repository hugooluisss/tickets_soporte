import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PublicTrackedTicket { title: string; status: 'pending' | 'in_progress' | 'done' | 'cancelled'; createdAt: string; kind: string; description?: string | null; }

@Injectable({ providedIn: 'root' })
export class PublicTicketTrackingApiService {
  private readonly http = inject(HttpClient);
  get(token: string): Observable<PublicTrackedTicket> { return this.http.get<PublicTrackedTicket>(`${environment.apiBaseUrl}/public/tickets/${encodeURIComponent(token)}`); }
}
