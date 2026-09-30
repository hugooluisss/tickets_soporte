import { Component, computed, inject } from '@angular/core';
import { Lang, TranslationService } from './translation.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  template: `<button
    type="button"
    class="rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
    [attr.aria-label]="'Switch language to ' + nextLanguageName()"
    (click)="toggleLanguage()"
  >
    {{ nextLanguageCode() }}
  </button>`,
})
export class LanguageToggleComponent {
  private readonly translations = inject(TranslationService);
  readonly nextLanguageCode = computed(() => (this.translations.language() === 'es' ? 'EN' : 'ES'));
  readonly nextLanguageName = computed(() =>
    this.translations.language() === 'es' ? 'English' : 'Español',
  );

  toggleLanguage(): void {
    const nextLanguage: Lang = this.translations.language() === 'es' ? 'en' : 'es';
    this.translations.setLanguage(nextLanguage);
  }
}
