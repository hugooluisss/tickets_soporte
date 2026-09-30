import { Injectable, inject } from '@angular/core';
import { TicketFilters } from '../models';
import { ReportsApiService } from './reports-api.service';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly api = inject(ReportsApiService);
  generate(filters: TicketFilters = {}) {
    return this.api.generate(filters);
  }
}
