import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AppShellComponent } from './app-shell.component';
import { TranslationService } from '../../core/i18n/translation.service';

describe('AppShellComponent', () => {
  it('creates the app shell', () => {
    TestBed.configureTestingModule({ imports: [AppShellComponent], providers: [provideRouter([]), { provide: AuthService, useValue: { logout: () => undefined, hasRole: () => false, currentUser: () => null } }] });
    expect(TestBed.createComponent(AppShellComponent).componentInstance).toBeTruthy();
  });

  it('switches language in place without navigating or reloading', () => {
    localStorage.clear();
    const currentUrl = window.location.href;
    TestBed.configureTestingModule({ imports: [AppShellComponent], providers: [provideRouter([]), { provide: AuthService, useValue: { logout: () => undefined, hasRole: () => false, currentUser: () => null } }] });
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('app-language-toggle button') as HTMLButtonElement;
    expect(toggle.textContent?.trim()).toBe('ES');
    toggle.click(); fixture.detectChanges();
    expect(TestBed.inject(TranslationService).language()).toBe('es');
    expect((fixture.nativeElement.querySelector('app-language-toggle button') as HTMLButtonElement).textContent?.trim()).toBe('EN');
    expect(fixture.nativeElement.textContent).toContain('Cerrar sesión');
    expect(window.location.href).toBe(currentUrl);
  });
});
