import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';
import { authGuard, roleGuard } from './auth.guards';
import { AuthService } from './auth.service';

describe('auth guards', () => {
  const router = { createUrlTree: vi.fn((commands: string[], extras?: object) => ({ commands, extras })) };
  let auth: { isAuthenticated: ReturnType<typeof vi.fn>; hasRole: ReturnType<typeof vi.fn> };
  beforeEach(() => {
    router.createUrlTree.mockClear();
    auth = { isAuthenticated: vi.fn(), hasRole: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: auth }, { provide: Router, useValue: router }] });
  });

  it('allows authenticated users and redirects unauthenticated users with returnUrl', () => {
    auth.isAuthenticated.mockReturnValue(true);
    expect(TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, { url: '/tickets' } as RouterStateSnapshot))).toBe(true);
    auth.isAuthenticated.mockReturnValue(false);
    expect(TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, { url: '/tickets' } as RouterStateSnapshot))).toEqual({ commands: ['/login'], extras: { queryParams: { returnUrl: '/tickets' } } });
  });

  it('allows admins and redirects regular users from admin routes', () => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.hasRole.mockReturnValue(true);
    expect(TestBed.runInInjectionContext(() => roleGuard({ data: { role: 'admin' } } as unknown as ActivatedRouteSnapshot, {} as RouterStateSnapshot))).toBe(true);
    auth.hasRole.mockReturnValue(false);
    expect(TestBed.runInInjectionContext(() => roleGuard({ data: { role: 'admin' } } as unknown as ActivatedRouteSnapshot, {} as RouterStateSnapshot))).toEqual({ commands: ['/'], extras: undefined });
  });

  it('redirects unauthenticated users from role-protected routes to login', () => {
    auth.isAuthenticated.mockReturnValue(false);
    expect(TestBed.runInInjectionContext(() => roleGuard({ data: { role: 'admin' } } as unknown as ActivatedRouteSnapshot, {} as RouterStateSnapshot))).toEqual({ commands: ['/login'], extras: undefined });
  });
});
