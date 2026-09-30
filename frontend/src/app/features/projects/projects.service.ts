import { Injectable, inject } from '@angular/core';
import { ProjectsApiService } from './projects-api.service';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly api = inject(ProjectsApiService);
  list() { return this.api.list(); }
  get(id: string) { return this.api.get(id); }
  create(input: { name: string; description?: string | null; webhookUrl?: string | null }) { return this.api.create(input); }
  update(id: string, input: { name?: string; description?: string | null; webhookUrl?: string | null }) { return this.api.update(id, input); }
  delete(id: string) { return this.api.delete(id); }
  tickets(id: string) { return this.api.tickets(id); }
}
