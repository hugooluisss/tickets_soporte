import { TranslationService } from '../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../profile.service';
import { User } from '../../models';
@Component({
  selector: 'app-profile-view',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.css',
})
export class ProfileView {
  private readonly translations = inject(TranslationService);
  private readonly api = inject(ProfileService);
  private readonly fb = inject(FormBuilder);
  readonly profile = signal<User | null>(null);
  readonly error = signal('');
  readonly message = signal('');
  readonly form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });
  constructor() {
    this.api
      .get()
      .subscribe({
        next: (p) => this.profile.set(p),
        error: () => this.error.set(this.translations.t('profile.loadError')),
      });
  }
  changePassword() {
    this.error.set('');
    this.message.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.api.changePassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.message.set(this.translations.t('profile.passwordSuccess'));
        this.form.reset();
      },
      error: (e) =>
        this.error.set(e.error?.message || this.translations.t('profile.passwordError')),
    });
  }
}
