import { TranslationService } from '../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Component, inject, signal } from '@angular/core';
import { IconComponent } from '../../../shared/icon/icon.component';
import { RouterLink } from '@angular/router';
import { Project } from '../../models';
import { ProjectsService } from '../projects.service';
@Component({
  selector: 'app-project-list',
  imports: [RouterLink, TranslatePipe, IconComponent],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css',
})
export class ProjectList {
  private readonly translations = inject(TranslationService);
  private readonly projects = inject(ProjectsService);
  readonly rows = signal<Project[]>([]);
  readonly error = signal('');
  constructor() {
    this.load();
  }
  load(): void {
    this.projects
      .list()
      .subscribe({
        next: (rows) => this.rows.set(rows),
        error: () => this.error.set(this.translations.t('project.loadError')),
      });
  }
  remove(project: Project): void {
    if (!globalThis.confirm(`Delete project “${project.name}”?`)) return;
    this.projects
      .delete(project.id)
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set(this.translations.t('project.deleteError')),
      });
  }
}
