import { Injectable, inject } from '@angular/core';
import { DashboardApiService } from './dashboard-api.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(DashboardApiService);
  summary() { return this.api.summary(); }
}
