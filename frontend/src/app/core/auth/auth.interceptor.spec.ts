import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  it('attaches the token and clears the session and redirects on 401', () => {
    const logout = vi.fn();
    const navigate = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { token: 'jwt-token', logout } },
        { provide: Router, useValue: { navigate } },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const client = TestBed.inject(HttpClient);
    client.get('/api/private').subscribe({ error: () => undefined });
    const request = http.expectOne('/api/private');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/login']);
    http.verify();
  });
});
