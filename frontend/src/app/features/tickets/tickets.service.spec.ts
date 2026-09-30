import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Ticket } from '../models';
import { TicketsApiService } from './tickets-api.service';
import { TicketsService } from './tickets.service';

describe('TicketsService', () => {
  it('composes non-empty filter values and remembers the applied state', () => {
    const list = vi.fn(() => of([] as Ticket[]));
    TestBed.configureTestingModule({
      providers: [TicketsService, { provide: TicketsApiService, useValue: { list } }],
    });
    const service = TestBed.inject(TicketsService);
    service
      .list({ q: ' outage ', projectId: '', status: 'pending', dateFrom: '2026-01-01' })
      .subscribe();
    expect(list).toHaveBeenCalledWith({ q: ' outage ', status: 'pending', dateFrom: '2026-01-01' });
    expect(service.filters()).toEqual({ q: ' outage ', status: 'pending', dateFrom: '2026-01-01' });
  });
});
