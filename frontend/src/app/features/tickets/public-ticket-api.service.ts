import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PublicProject { id: string; name: string; }
export type PublicTicketSubmission = {
  reporterName: string;
  reporterEmail: string;
  reporterLocation?: string;
  reporterEmailNotifications?: boolean;
  title: string;
  description?: string;
  kind?: 'ticket' | 'bug' | 'suggestion' | 'feature';
};
export interface PublicTicketReceipt { trackingToken: string; }

@Injectable({ providedIn: 'root' })
export class PublicTicketApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/public/projects`;
  getProject(projectId: string): Observable<PublicProject> { return this.http.get<PublicProject>(`${this.url}/${encodeURIComponent(projectId)}`); }
  submit(projectId: string, input: PublicTicketSubmission): Observable<PublicTicketReceipt> { return this.http.post<PublicTicketReceipt>(`${this.url}/${encodeURIComponent(projectId)}/tickets`, input); }
}
