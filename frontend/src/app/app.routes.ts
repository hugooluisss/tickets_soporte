import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth/auth.guards';
import { LoginComponent } from './features/auth/login/login.component';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { PlaceholderComponent } from './shared/placeholder/placeholder.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '', component: AppShellComponent, canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tickets' },
      { path: 'tickets', component: PlaceholderComponent, data: { title: 'Tickets' } },
      { path: 'admin', component: PlaceholderComponent, canActivate: [roleGuard], data: { role: 'admin', title: 'Administration' } },
    ],
  },
  { path: '**', redirectTo: '' },
];
