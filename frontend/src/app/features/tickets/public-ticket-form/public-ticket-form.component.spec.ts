import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PublicTicketFormComponent } from './public-ticket-form.component';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../../../../environments/environment';
import { PublicTicketApiService } from '../public-ticket-api.service';
import { of, throwError } from 'rxjs';

describe('PublicTicketFormComponent', () => {
  let fixture: ComponentFixture<PublicTicketFormComponent>;
  let http: HttpTestingController;
  const lookupUrl = `${environment.apiBaseUrl}/public/projects/project-1`;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    localStorage.clear();
    const publicApi = { getProject: vi.fn(() => of({ id: 'project-1', name: 'Website' })), submit: vi.fn(() => of({ id: 'ticket-1' })) };
    await TestBed.configureTestingModule({
      imports: [PublicTicketFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'public/projects/:projectId/new-ticket', component: PublicTicketFormComponent }]), { provide: PublicTicketApiService, useValue: publicApi }],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PublicTicketFormComponent);
    Object.defineProperty(fixture.componentInstance, 'projectId', { value: 'project-1' });
    fixture.detectChanges();
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('loads the public project and submits the form while logged out', () => {
    expect(fixture.nativeElement.textContent).toContain('Website');
    const component = fixture.componentInstance;
    component.form.setValue({ reporterName: 'Ada', reporterEmail: 'ada@example.com', reporterLocation: 'London', reporterEmailNotifications: false, title: 'Broken page', description: 'Details', kind: 'bug' });
    component.submit();
    expect(TestBed.inject(PublicTicketApiService).submit).toHaveBeenCalledWith('project-1', { reporterName: 'Ada', reporterEmail: 'ada@example.com', reporterEmailNotifications: false, reporterLocation: 'London', title: 'Broken page', description: 'Details', kind: 'bug' });
    expect(localStorage.getItem('ticket-support.access-token')).toBeNull();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Request submitted');
  });

  it('validates required fields and email before submitting', () => {
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.form.invalid).toBe(true);
    expect(fixture.componentInstance.form.controls.reporterName.touched).toBe(true);
    expect(fixture.componentInstance.form.controls.reporterEmail.touched).toBe(true);
    expect(fixture.componentInstance.form.controls.title.touched).toBe(true);
    expect(TestBed.inject(PublicTicketApiService).submit).not.toHaveBeenCalled();
  });

  it('keeps the form visible and shows an error if submission fails', () => {
    const component = fixture.componentInstance;
    component.form.setValue({ reporterName: 'Ada', reporterEmail: 'ada@example.com', reporterLocation: '', reporterEmailNotifications: false, title: 'Broken page', description: '', kind: 'ticket' });
    vi.mocked(TestBed.inject(PublicTicketApiService).submit).mockReturnValue(throwError(() => new Error('Bad Request')));
    component.submit();
    fixture.detectChanges();
    expect(component.submitError()).toBe(true);
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
  });
});

describe('public project load failure', () => {
  it('shows an error state and no form when lookup fails', async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PublicTicketFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'public/projects/:projectId/new-ticket', component: PublicTicketFormComponent }]), { provide: PublicTicketApiService, useValue: { getProject: () => throwError(() => new Error('Not found')), submit: vi.fn() } }],
    }).compileComponents();
    const harness = await RouterTestingHarness.create('/public/projects/project-1/new-ticket');
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('invalid or no longer available');
    expect(harness.routeNativeElement?.querySelector('form')).toBeNull();
  });
});

describe('public ticket route', () => {
  const routeLookupUrl = `${environment.apiBaseUrl}/public/projects/project-1`;
  it('is outside the authenticated app shell', async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'public/projects/:projectId/new-ticket', component: PublicTicketFormComponent }])] });
    const harness = await RouterTestingHarness.create('/public/projects/project-1/new-ticket');
    TestBed.inject(HttpTestingController).expectOne(routeLookupUrl).flush({ id: 'project-1', name: 'Website' });
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.textContent).toContain('Submit a support request');
    expect(harness.routeNativeElement?.textContent).toContain('Website');
  });
});
