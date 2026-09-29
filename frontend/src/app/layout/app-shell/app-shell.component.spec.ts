import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent', () => {
  it('creates the app shell', () => {
    TestBed.configureTestingModule({ imports: [AppShellComponent], providers: [provideRouter([]), { provide: AuthService, useValue: { logout: () => undefined, hasRole: () => false, currentUser: () => null } }] });
    expect(TestBed.createComponent(AppShellComponent).componentInstance).toBeTruthy();
  });
});
