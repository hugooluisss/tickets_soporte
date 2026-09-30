import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslationService } from '../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthService } from '../../../core/auth/auth.service';
import { FormFieldComponent } from '../../../shared/form-field/form-field.component';
import { Category, Project, Ticket, TicketKind, TicketNote, TicketPriority, TicketStatus, User } from '../../models';
import { CategoriesService } from '../../categories/categories.service';
import { ProjectsService } from '../../projects/projects.service';
import { TicketsService } from '../tickets.service';
import { UsersService } from '../../users/users.service';

@Component({ selector: 'app-ticket-form', imports: [ReactiveFormsModule, RouterLink, FormFieldComponent, TranslatePipe, DatePipe], templateUrl: './ticket-form.component.html' })
export class TicketForm {
  private readonly translations = inject(TranslationService);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TicketsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  readonly id = this.route.snapshot.paramMap.get('id');
  readonly isAdmin = this.auth.hasRole('admin');
  readonly error = signal('');
  readonly noteError = signal('');
  readonly saving = signal(false);
  readonly noteSaving = signal(false);
  readonly notes = signal<TicketNote[]>([]);
  readonly ticket = signal<Ticket | null>(null);
  readonly trackingUrl = (ticket: Ticket) => new URL(`public/tickets/${encodeURIComponent(ticket.trackingToken)}`, document.baseURI).toString();
  readonly copied = signal(false);
  readonly projects = signal<Project[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly users = signal<User[]>([]);
  readonly kinds: TicketKind[] = ['ticket', 'bug', 'suggestion', 'feature'];
  readonly priorities: TicketPriority[] = ['high', 'medium', 'low'];
  readonly statuses: TicketStatus[] = ['pending', 'in_progress', 'done', 'cancelled'];
  readonly noteForm = this.fb.nonNullable.group({ content: ['', [Validators.required, control => control.value.trim() ? null : { required: true }]] });
  readonly form = this.fb.nonNullable.group({ title: ['', [Validators.required, Validators.maxLength(255)]], description: [''], kind: ['ticket' as TicketKind, Validators.required], priority: ['medium' as TicketPriority, Validators.required], status: ['pending' as TicketStatus, Validators.required], projectId: [''], categoryId: [''], assignedToId: [''] });

  constructor() {
    inject(ProjectsService).list().subscribe(v => this.projects.set(v));
    inject(CategoriesService).list().subscribe(v => this.categories.set(v));
    inject(UsersService).list().subscribe({ next: v => this.users.set(v), error: () => this.error.set(this.translations.t('ticket.assigneesError')) });
    if (this.id) {
      this.api.get(this.id).subscribe({ next: t => { this.ticket.set(t); this.form.patchValue({ title: t.title, description: t.description || '', kind: t.kind, priority: t.priority, status: t.status, projectId: t.projectId || '', categoryId: t.categoryId || '', assignedToId: t.assignedToId || '' }); }, error: () => this.error.set(this.translations.t('ticket.loadError')) });
      this.loadNotes();
    }
  }

  loadNotes() {
    if (this.id) this.api.listNotes(this.id).subscribe({ next: notes => this.notes.set(notes), error: () => this.noteError.set(this.translations.t('ticket.notesLoadError')) });
  }

  submitNoteShortcut(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); this.addNote(); }
  }

  addNote() {
    if (!this.id) return;
    const content = this.noteForm.controls.content.value.trim();
    if (!content) { this.noteForm.controls.content.setErrors({ required: true }); this.noteForm.controls.content.markAsTouched(); return; }
    this.noteSaving.set(true);
    this.noteError.set('');
    this.api.createNote(this.id, content).subscribe({ next: note => { this.notes.update(notes => [...notes, note]); this.noteForm.reset(); this.noteSaving.set(false); }, error: () => { this.noteSaving.set(false); this.noteError.set(this.translations.t('ticket.noteCreateError')); } });
  }

  deleteNote(note: TicketNote) {
    if (!this.id || !this.isAdmin) return;
    this.noteError.set('');
    this.api.deleteNote(this.id, note.id).subscribe({ next: () => this.notes.update(notes => notes.filter(item => item.id !== note.id)), error: () => this.noteError.set(this.translations.t('ticket.noteDeleteError')) });
  }

  copyTrackingLink() {
    const link = this.ticket();
    if (!link) return;
    navigator.clipboard.writeText(this.trackingUrl(link)).then(() => this.copied.set(true));
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const payload = { ...v, projectId: v.projectId || null, categoryId: v.categoryId || null, assignedToId: v.assignedToId || null, description: v.description || null };
    (this.id ? this.api.update(this.id, payload) : this.api.create(payload as Partial<Ticket> & Pick<Ticket, 'title'>)).subscribe({ next: () => void this.router.navigate(['/tickets']), error: () => { this.saving.set(false); this.error.set(this.translations.t('ticket.saveError')); } });
  }
}
