import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { AuthUser, LoginRequest, LoginResponse, UserRole } from './auth.models';

const TOKEN_KEY = 'ticket-support.access-token';
const USER_KEY = 'ticket-support.current-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiService);
  private readonly userState = signal<AuthUser | null>(this.restoreUser());
  readonly currentUser = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => !!this.token && !!this.userState());

  get token(): string | null {
    return this.readStorage(TOKEN_KEY);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.authApi.login(credentials).pipe(
      tap(({ accessToken, user }) => {
        this.writeStorage(TOKEN_KEY, accessToken);
        this.writeStorage(USER_KEY, JSON.stringify(user));
        this.userState.set(user);
      }),
      catchError((error: unknown) => {
        this.logout();
        return throwError(() => error);
      }),
    );
  }

  logout(): void {
    this.removeStorage(TOKEN_KEY);
    this.removeStorage(USER_KEY);
    this.userState.set(null);
  }

  hasRole(role: UserRole): boolean {
    return this.userState()?.role === role;
  }

  private restoreUser(): AuthUser | null {
    const rawUser = this.readStorage(USER_KEY);
    if (!rawUser || !this.readStorage(TOKEN_KEY)) return null;
    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      this.removeStorage(USER_KEY);
      this.removeStorage(TOKEN_KEY);
      return null;
    }
  }

  private readStorage(key: string): string | null {
    try { return globalThis.localStorage?.getItem(key) ?? null; } catch { return null; }
  }

  private writeStorage(key: string, value: string): void {
    try { globalThis.localStorage?.setItem(key, value); } catch { /* Storage may be unavailable. */ }
  }

  private removeStorage(key: string): void {
    try { globalThis.localStorage?.removeItem(key); } catch { /* Storage may be unavailable. */ }
  }
}
