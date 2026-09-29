import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { DashboardService } from '../dashboard.service';
import { DashboardSummary } from '../../models';
import { DashboardView } from './dashboard-view.component';

const summary: DashboardSummary = {
  pending: 2, byStatus: [], byProject: [], byCategory: [], totalTickets: 12, clientReplies: 8, staffReplies: 6, ticketsWithoutReply: 3,
  replyTimeSeries: [{ date: '2026-09-28', count: 0 }, { date: '2026-09-29', count: 4 }], ticketsTrend: [{ date: '2026-09-28', created: 2, solved: 1 }],
  byPriority: [{ key: 'high', count: 2 }, { key: 'medium', count: 3 }, { key: 'low', count: 4 }], activeTicketsTotal: 9,
  recentTickets: [{ id: '1', title: 'Cannot sign in', createdAt: '2026-09-29T12:00:00.000Z', status: 'pending' }],
};

describe('DashboardView', () => {
  let fixture: ComponentFixture<DashboardView>;
  let router: Router;
  const render = async (data: DashboardSummary) => {
    TestBed.configureTestingModule({ imports: [DashboardView], providers: [provideRouter([{ path: 'tickets', component: DashboardView }, { path: 'reports', component: DashboardView }]), { provide: DashboardService, useValue: { summary: () => of(data) } }] });
    fixture = TestBed.createComponent(DashboardView); router = TestBed.inject(Router); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
  };
  it('renders all summary cards, three charts, and a recent ticket', async () => {
    await render(summary);
    expect(fixture.nativeElement.querySelectorAll('.stat-card').length).toBe(4);
    expect(fixture.nativeElement.querySelectorAll('.panel').length).toBe(4);
    expect(fixture.nativeElement.querySelector('svg polyline')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.donut-wrap circle').length).toBe(4);
    expect(fixture.nativeElement.querySelector('.bar')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Cannot sign in');
    expect(fixture.nativeElement.textContent).toContain('12');
  });
  it('renders zero values and empty states without error', async () => {
    await render({ ...summary, totalTickets: 0, clientReplies: 0, staffReplies: 0, ticketsWithoutReply: 0, replyTimeSeries: [], ticketsTrend: [], byPriority: [], activeTicketsTotal: 0, recentTickets: [] });
    expect(fixture.nativeElement.querySelectorAll('.stat-card').length).toBe(4);
    expect(fixture.nativeElement.querySelector('.recent-list .empty-state')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('svg polyline')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.error')).toBeNull();
  });
  it('navigates to tickets and reports from their links', async () => {
    await render(summary);
    const links = fixture.nativeElement.querySelectorAll('a');
    (links[0] as HTMLAnchorElement).click(); await fixture.whenStable();
    expect(router.url).toBe('/reports');
    (fixture.nativeElement.querySelector('a[routerLink="/tickets"]') as HTMLAnchorElement).click(); await fixture.whenStable();
    expect(router.url).toBe('/tickets');
  });
});
