import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Project } from '../../models';
import { ProjectsService } from '../projects.service';
@Component({ selector: 'app-project-list', imports: [RouterLink], templateUrl: './project-list.component.html', styleUrl: './project-list.component.css' })
export class ProjectList {
  private readonly projects = inject(ProjectsService); readonly rows = signal<Project[]>([]); readonly error = signal('');
  constructor() { this.load(); }
  load(): void { this.projects.list().subscribe({ next: rows => this.rows.set(rows), error: () => this.error.set('Unable to load projects.') }); }
  remove(project: Project): void { if (!globalThis.confirm(`Delete project “${project.name}”?`)) return; this.projects.delete(project.id).subscribe({ next: () => this.load(), error: () => this.error.set('Unable to delete project. Admin access may be required.') }); }
}
