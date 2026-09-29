import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  imports: [RouterLink, RouterOutlet],
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
