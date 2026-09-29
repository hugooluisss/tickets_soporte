import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models';

@Injectable({ providedIn: 'root' })
export class CategoriesApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/categories`;
  list(): Observable<Category[]> { return this.http.get<Category[]>(this.url); }
  get(id: string): Observable<Category> { return this.http.get<Category>(`${this.url}/${id}`); }
  create(input: Pick<Category, 'name'>): Observable<Category> { return this.http.post<Category>(this.url, input); }
  update(id: string, input: Pick<Category, 'name'>): Observable<Category> { return this.http.patch<Category>(`${this.url}/${id}`, input); }
  delete(id: string): Observable<{ deleted: boolean }> { return this.http.delete<{ deleted: boolean }>(`${this.url}/${id}`); }
}
