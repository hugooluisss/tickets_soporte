import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardApiService } from './dashboard-api.service';
import { environment } from '../../../environments/environment';

describe('DashboardApiService', () => {
  it('passes the extended dashboard contract through unchanged', () => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    const api = TestBed.inject(DashboardApiService);
    const http = TestBed.inject(HttpTestingController);
    const payload = { pending: 2, byStatus: [], byProject: [], byCategory: [], totalTickets: 9, clientReplies: 4, staffReplies: 5, ticketsWithoutReply: 3, replyTimeSeries: [{ date: '2026-09-28', count: 2 }], ticketsTrend: [{ date: '2026-09-28', created: 3, solved: 1 }], byPriority: [{ key: 'high' as const, count: 2 }], activeTicketsTotal: 4, recentTickets: [{ id: 't1', title: 'Help', createdAt: '2026-09-28T12:00:00.000Z', status: 'pending' as const }] };
    let result: unknown;
    api.summary().subscribe(value => result = value);
    http.expectOne(`${environment.apiBaseUrl}/dashboard/summary`).flush(payload);
    expect(result).toEqual(payload);
    http.verify();
  });
});
