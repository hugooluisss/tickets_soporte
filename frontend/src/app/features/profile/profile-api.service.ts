import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/profile`;
  get(): Observable<User> { return this.http.get<User>(this.url); }
  changePassword(input: { currentPassword: string; newPassword: string }): Observable<{ changed: boolean }> { return this.http.post<{ changed: boolean }>(`${this.url}/change-password`, input); }
}
