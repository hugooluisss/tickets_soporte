import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectsService } from '../projects.service';
@Component({ selector: 'app-project-form', imports: [ReactiveFormsModule, RouterLink], templateUrl: './project-form.component.html', styleUrl: './project-form.component.css' })
export class ProjectForm {
  private readonly fb = inject(FormBuilder); private readonly projects = inject(ProjectsService); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router);
  readonly id = this.route.snapshot.paramMap.get('id'); readonly saving = signal(false); readonly error = signal('');
  readonly form = this.fb.nonNullable.group({ name: ['', [Validators.required, Validators.maxLength(150)]], description: [''] });
  constructor() { if (this.id) this.projects.get(this.id).subscribe({ next: p => this.form.patchValue({ name: p.name, description: p.description ?? '' }), error: () => this.error.set('Unable to load project.') }); }
  save(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.saving.set(true); const value = this.form.getRawValue(); (this.id ? this.projects.update(this.id, value) : this.projects.create(value)).subscribe({ next: () => void this.router.navigate(['/projects']), error: () => { this.saving.set(false); this.error.set('Unable to save project.'); } }); }
}
