import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth/auth.guards';
import { LoginComponent } from './features/auth/login/login.component';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { PlaceholderComponent } from './shared/placeholder/placeholder.component';
import { TicketList } from './features/tickets/ticket-list/ticket-list.component';
import { TicketForm } from './features/tickets/ticket-form/ticket-form.component';
import { ProjectList } from './features/projects/project-list/project-list.component';
import { ProjectForm } from './features/projects/project-form/project-form.component';
import { CategoryList } from './features/categories/category-list/category-list.component';
import { CategoryForm } from './features/categories/category-form/category-form.component';
import { ProfileView } from './features/profile/profile-view/profile-view.component';
import { DashboardView } from './features/dashboard/dashboard-view/dashboard-view.component';
import { ReportsView } from './features/reports/reports-view/reports-view.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '', component: AppShellComponent, canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tickets' },
      { path: 'tickets', component: TicketList },
      { path: 'tickets/new', component: TicketForm },
      { path: 'tickets/:id/edit', component: TicketForm },
      { path: 'projects', component: ProjectList },
      { path: 'projects/new', component: ProjectForm },
      { path: 'projects/:id/edit', component: ProjectForm },
      { path: 'categories', component: CategoryList },
      { path: 'categories/new', component: CategoryForm },
      { path: 'categories/:id/edit', component: CategoryForm },
      { path: 'profile', component: ProfileView },
      { path: 'dashboard', component: DashboardView },
      { path: 'reports', component: ReportsView },
      { path: 'admin', component: PlaceholderComponent, canActivate: [roleGuard], data: { role: 'admin', title: 'Administration' } },
    ],
  },
  { path: '**', redirectTo: '' },
];
