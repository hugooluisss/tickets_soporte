import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, Ticket } from '../models';

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/projects`;
  list(): Observable<Project[]> {
    return this.http.get<Project[]>(this.url);
  }
  get(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.url}/${id}`);
  }
  create(
    input: Pick<Project, 'name'> & Partial<Pick<Project, 'description' | 'webhookUrl'>>,
  ): Observable<Project> {
    return this.http.post<Project>(this.url, input);
  }
  update(
    id: string,
    input: Partial<Pick<Project, 'name' | 'description' | 'webhookUrl'>>,
  ): Observable<Project> {
    return this.http.patch<Project>(`${this.url}/${id}`, input);
  }
  delete(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.url}/${id}`);
  }
  tickets(id: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.url}/${id}/tickets`);
  }
}
