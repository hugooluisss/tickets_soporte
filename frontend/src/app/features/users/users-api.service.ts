import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/users`;
  list(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }
  get(id: string): Observable<User> {
    return this.http.get<User>(`${this.url}/${id}`);
  }
  create(
    input: Pick<User, 'email' | 'firstName' | 'lastName' | 'role' | 'isActive'> & {
      password: string;
    },
  ): Observable<User> {
    return this.http.post<User>(this.url, input);
  }
  update(
    id: string,
    input: Partial<Pick<User, 'email' | 'firstName' | 'lastName' | 'role' | 'isActive'>> & {
      password?: string;
    },
  ): Observable<User> {
    return this.http.patch<User>(`${this.url}/${id}`, input);
  }
  delete(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.url}/${id}`);
  }
}
