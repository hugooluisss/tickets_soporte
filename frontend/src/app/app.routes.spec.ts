import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { routes } from './app.routes';

describe('application routes', () => {
  it('navigates between the shell placeholder routes', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: { isAuthenticated: () => true, hasRole: () => true, currentUser: () => ({ name: 'Ada' }), logout: () => undefined } },
      ],
    });
    const harness = await RouterTestingHarness.create('/tickets');
    expect(harness.routeNativeElement?.textContent).toContain('Tickets');
    await harness.navigateByUrl('/admin');
    expect(harness.routeNativeElement?.textContent).toContain('Administration');
  });
});
