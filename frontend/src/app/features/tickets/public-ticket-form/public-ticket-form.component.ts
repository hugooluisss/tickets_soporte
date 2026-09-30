import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../core/i18n/translation.service';
import { FormFieldComponent } from '../../../shared/form-field/form-field.component';
import { PublicProject, PublicTicketApiService } from '../public-ticket-api.service';
import { TicketKind } from '../../models';
import QRCode from 'qrcode';

@Component({ selector: 'app-public-ticket-form', standalone: true, imports: [ReactiveFormsModule, FormFieldComponent, TranslatePipe], templateUrl: './public-ticket-form.component.html' })
export class PublicTicketFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PublicTicketApiService);
  private readonly translations = inject(TranslationService);
  private readonly projectId = inject(ActivatedRoute).snapshot.paramMap.get('projectId') ?? '';
  readonly project = signal<PublicProject | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly submitError = signal(false);
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly trackingUrl = signal('');
  readonly qrCode = signal('');
  readonly kinds = ['ticket', 'bug', 'suggestion', 'feature'] as const;
  readonly form = this.fb.nonNullable.group({
    reporterName: ['', [Validators.required, Validators.maxLength(150)]],
    reporterEmail: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    reporterLocation: ['', Validators.maxLength(255)],
    reporterEmailNotifications: [false],
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    kind: ['ticket' as TicketKind, Validators.required],
  });
  constructor() {
    this.api.getProject(this.projectId).subscribe({
      next: project => { this.project.set(project); this.loading.set(false); },
      error: () => { this.loadError.set(true); this.loading.set(false); },
    });
  }
  submit(): void {
    if (this.form.invalid || this.submitting()) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.submitError.set(false);
    const value = this.form.getRawValue();
    this.api.submit(this.projectId, {
      reporterName: value.reporterName.trim(), reporterEmail: value.reporterEmail.trim(),
      reporterLocation: value.reporterLocation.trim() || undefined, title: value.title.trim(), reporterEmailNotifications: value.reporterEmailNotifications,
      description: value.description.trim() || undefined, kind: value.kind,
    }).subscribe({
      next: receipt => {
        const url = new URL(`public/tickets/${encodeURIComponent(receipt.trackingToken)}`, document.baseURI).toString();
        this.trackingUrl.set(url);
        QRCode.toDataURL(url, { width: 220, margin: 1 }).then(qr => this.qrCode.set(qr));
        this.submitted.set(true); this.submitting.set(false);
      },
      error: () => { this.submitError.set(true); this.submitting.set(false); },
    });
  }
  validationMessage(control: 'reporterName' | 'reporterEmail' | 'title'): string {
    const field = this.form.controls[control];
    if (field.hasError('email')) return this.translations.t('publicTicket.emailError');
    if (field.hasError('maxlength')) return this.translations.t('publicTicket.fieldTooLong');
    return this.translations.t('publicTicket.requiredError');
  }
}
