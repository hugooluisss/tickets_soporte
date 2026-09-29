import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { LanguageToggleComponent } from '../../core/i18n/language-toggle.component';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  imports: [RouterLink, RouterOutlet, TranslatePipe, LanguageToggleComponent, IconComponent],
  selector: 'app-app-shell',
  styleUrl: './app-shell.component.css',
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
