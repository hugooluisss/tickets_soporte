import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  it('creates a login form and calls AuthService with valid credentials', () => {
    localStorage.clear();
    const login = vi.fn(() =>
      of({
        accessToken: 'token',
        user: { id: '1', name: 'A', email: 'a@b.com', role: 'user' as const },
      }),
    );
    const navigateByUrl = vi.fn();
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        AuthService,
        { provide: AuthApiService, useValue: { login } },
        { provide: Router, useValue: { navigateByUrl } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
      ],
    });
    const component = TestBed.createComponent(LoginComponent).componentInstance;
    component.form.setValue({ email: 'a@b.com', password: 'secret' });
    component.submit();
    expect(login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret' });
    expect(navigateByUrl).toHaveBeenCalledWith('/');
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(true);
    expect(TestBed.inject(AuthService).currentUser()?.email).toBe('a@b.com');
  });
});
