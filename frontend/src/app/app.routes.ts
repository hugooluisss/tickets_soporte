import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth/auth.guards';
import { LoginComponent } from './features/auth/login/login.component';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { TicketList } from './features/tickets/ticket-list/ticket-list.component';
import { TicketForm } from './features/tickets/ticket-form/ticket-form.component';
import { ProjectList } from './features/projects/project-list/project-list.component';
import { ProjectForm } from './features/projects/project-form/project-form.component';
import { CategoryList } from './features/categories/category-list/category-list.component';
import { CategoryForm } from './features/categories/category-form/category-form.component';
import { ProfileView } from './features/profile/profile-view/profile-view.component';
import { DashboardView } from './features/dashboard/dashboard-view/dashboard-view.component';
import { ReportsView } from './features/reports/reports-view/reports-view.component';
import { UserList } from './features/users/user-list/user-list.component';
import { UserForm } from './features/users/user-form/user-form.component';
import { PublicTicketFormComponent } from './features/tickets/public-ticket-form/public-ticket-form.component';
import { PublicTicketTrackingComponent } from './features/tickets/public-ticket-tracking/public-ticket-tracking.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'public/projects/:projectId/new-ticket', component: PublicTicketFormComponent },
  { path: 'public/tickets/:token', component: PublicTicketTrackingComponent },
  {
    path: '', component: AppShellComponent, canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
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
      { path: 'admin', component: UserList, canActivate: [roleGuard], data: { role: 'admin' } },
      { path: 'admin/new', component: UserForm, canActivate: [roleGuard], data: { role: 'admin' } },
      { path: 'admin/:id/edit', component: UserForm, canActivate: [roleGuard], data: { role: 'admin' } },
    ],
  },
  { path: '**', redirectTo: '' },
];
