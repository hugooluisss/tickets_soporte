import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { routes } from './app.routes';
import { TicketsService } from './features/tickets/tickets.service';
import { ProjectsService } from './features/projects/projects.service';
import { CategoriesService } from './features/categories/categories.service';
import { UsersService } from './features/users/users.service';
import { of } from 'rxjs';

describe('application routes', () => {
  it('navigates between the shell placeholder routes', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: { isAuthenticated: () => true, hasRole: () => true, currentUser: () => ({ name: 'Ada' }), logout: () => undefined } },
        { provide: TicketsService, useValue: { list: () => of([]) } },
        { provide: ProjectsService, useValue: { list: () => of([]) } },
        { provide: CategoriesService, useValue: { list: () => of([]) } },
        { provide: UsersService, useValue: { list: () => of([]) } },
      ],
    });
    const harness = await RouterTestingHarness.create('/tickets');
    expect(harness.routeNativeElement?.textContent).toContain('Tickets');
    await harness.navigateByUrl('/admin');
    expect(harness.routeNativeElement?.textContent).toContain('Manage user accounts');
  });

  it('redirects the authenticated application root to the dashboard', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: AuthService, useValue: { isAuthenticated: () => true, hasRole: () => false, currentUser: () => ({ name: 'Ada' }), logout: () => undefined } }, { provide: TicketsService, useValue: { list: () => of([]) } }, { provide: ProjectsService, useValue: { list: () => of([]) } }, { provide: CategoriesService, useValue: { list: () => of([]) } }, { provide: UsersService, useValue: { list: () => of([]) } }, { provide: (await import('./features/dashboard/dashboard.service')).DashboardService, useValue: { summary: () => of({ pending: 0, byStatus: [], byProject: [], byCategory: [], totalTickets: 0, clientReplies: 0, staffReplies: 0, ticketsWithoutReply: 0, replyTimeSeries: [], ticketsTrend: [], byPriority: [], activeTicketsTotal: 0, recentTickets: [] }) } }],
    });
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.textContent).toContain('Support overview');
  });
});
