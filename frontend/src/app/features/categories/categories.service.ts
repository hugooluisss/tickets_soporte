import { Injectable, inject } from '@angular/core';
import { CategoriesApiService } from './categories-api.service';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly api = inject(CategoriesApiService);
  list() { return this.api.list(); }
  get(id: string) { return this.api.get(id); }
  create(input: { name: string }) { return this.api.create(input); }
  update(id: string, input: { name: string }) { return this.api.update(id, input); }
  delete(id: string) { return this.api.delete(id); }
}
