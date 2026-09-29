import { TranslationService } from '../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormFieldComponent } from '../../../shared/form-field/form-field.component';
import { UsersService } from '../users.service';

@Component({ selector: 'app-user-form', imports: [ReactiveFormsModule, RouterLink, FormFieldComponent, TranslatePipe], templateUrl: './user-form.component.html' })
export class UserForm {
  private readonly translations = inject(TranslationService);
  private readonly fb = inject(FormBuilder);
  private readonly users = inject(UsersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly id = this.route.snapshot.paramMap.get('id');
  readonly saving = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    role: ['user' as 'admin' | 'user', Validators.required],
    isActive: ['true', Validators.required],
    password: ['', this.id ? Validators.minLength(8) : [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    if (this.id) this.users.get(this.id).subscribe({
      next: user => this.form.patchValue({ email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: String(user.isActive) }),
      error: () => this.error.set(this.translations.t('user.loadOneError')),
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const value = this.form.getRawValue();
    const details = { email: value.email, firstName: value.firstName, lastName: value.lastName, role: value.role, isActive: value.isActive === 'true' };
    const request = this.id
      ? this.users.update(this.id, { ...details, ...(value.password ? { password: value.password } : {}) })
      : this.users.create({ ...details, password: value.password });
    request.subscribe({
      next: () => void this.router.navigate(['/admin']),
      error: () => { this.saving.set(false); this.error.set(this.translations.t('user.saveError')); },
    });
  }
}
