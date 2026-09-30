import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PublicTicketTrackingApiService } from '../public-ticket-tracking-api.service';
import { PublicTicketTrackingComponent } from './public-ticket-tracking.component';

describe('PublicTicketTrackingComponent', () => {
  afterEach(() => localStorage.removeItem('lang'));

  it('shows public fields for a valid token without mutation controls', async () => {
    TestBed.resetTestingModule();
    localStorage.setItem('lang', 'en');
    await TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'public/tickets/:token', component: PublicTicketTrackingComponent }]), {
        provide: PublicTicketTrackingApiService,
        useValue: { get: vi.fn(() => of({ title: 'Broken page', status: 'pending', createdAt: '2026-01-01', kind: 'bug', description: 'Details' })) },
      }],
    }).compileComponents();
    const harness = await RouterTestingHarness.create('/public/tickets/opaque-token');
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Broken page');
    expect(harness.routeNativeElement?.textContent).toContain('Pending');
    expect(harness.routeNativeElement?.querySelector('form,button,textarea')).toBeNull();
  });

  it('shows a not-found state for an unknown token', async () => {
    TestBed.resetTestingModule();
    localStorage.setItem('lang', 'en');
    await TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'public/tickets/:token', component: PublicTicketTrackingComponent }]), {
        provide: PublicTicketTrackingApiService,
        useValue: { get: vi.fn(() => throwError(() => new Error('Not found'))) },
      }],
    }).compileComponents();
    const harness = await RouterTestingHarness.create('/public/tickets/invalid');
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Ticket not found');
    expect(harness.routeNativeElement?.textContent).not.toContain('Broken page');
  });
});
