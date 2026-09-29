import { TranslationService } from '../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../models';
import { UsersService } from '../users.service';

@Component({ selector: 'app-user-list', imports: [RouterLink, TranslatePipe], templateUrl: './user-list.component.html', styleUrl: './user-list.component.css' })
export class UserList {
  private readonly translations = inject(TranslationService);
  private readonly users = inject(UsersService);
  readonly rows = signal<User[]>([]);
  readonly error = signal('');

  constructor() { this.load(); }

  load(): void {
    this.users.list().subscribe({
      next: rows => { this.rows.set(rows); this.error.set(''); },
      error: () => this.error.set(this.translations.t('user.loadError')),
    });
  }

  remove(user: User): void {
    if (!globalThis.confirm(this.translations.t('user.deleteConfirm').replace('{name}', `${user.firstName} ${user.lastName}`))) return;
    this.users.delete(user.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set(this.translations.t('user.deleteError')),
    });
  }
}
