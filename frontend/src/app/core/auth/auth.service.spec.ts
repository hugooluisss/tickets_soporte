import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthApiService } from './auth-api.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const user = { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', role: 'admin' as const };
  const success = { accessToken: 'jwt-token', user };
  let login: ReturnType<typeof vi.fn>;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    login = vi.fn();
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: AuthApiService, useValue: { login } }],
    });
    auth = TestBed.inject(AuthService);
  });

  it('stores token and user on successful login', () => {
    login.mockReturnValue(of(success));
    auth.login({ email: user.email, password: 'secret' }).subscribe();
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.currentUser()).toEqual(user);
    expect(localStorage.getItem('ticket-support.access-token')).toBe('jwt-token');
  });

  it('clears session state when login fails', () => {
    login.mockReturnValue(throwError(() => new Error('Unauthorized')));
    auth.login({ email: user.email, password: 'wrong' }).subscribe({ error: () => undefined });
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.currentUser()).toBeNull();
    expect(localStorage.getItem('ticket-support.access-token')).toBeNull();
  });

  it('clears session state on logout and checks roles', () => {
    login.mockReturnValue(of(success));
    auth.login({ email: user.email, password: 'secret' }).subscribe();
    expect(auth.hasRole('admin')).toBe(true);
    auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.hasRole('admin')).toBe(false);
  });
});
