import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Component({ selector: 'app-login', imports: [ReactiveFormsModule], templateUrl: './login.component.html', styleUrl: './login.component.css' })
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });

  submit(): void {
    this.errorMessage.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.auth.login(this.form.getRawValue()).pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => void this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') || '/'),
      error: (error: { error?: { message?: string | string[] } }) => {
        const message = error.error?.message;
        this.errorMessage.set(Array.isArray(message) ? message.join(', ') : message || 'Unable to sign in. Check your email and password.');
      },
    });
  }
}
