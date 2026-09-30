import { Injectable, computed, signal } from '@angular/core';
import { en, TranslationKey } from './en';
import { es } from './es';

export type Lang = 'en' | 'es';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly languageSignal = signal<Lang>(this.resolveLanguage());
  readonly language = this.languageSignal.asReadonly();
  readonly currentLanguage = this.language;

  t(key: TranslationKey): string {
    return this.languageSignal() === 'es' ? es[key] : en[key];
  }

  setLanguage(lang: Lang): void {
    this.languageSignal.set(lang);
    localStorage.setItem('lang', lang);
  }

  private resolveLanguage(): Lang {
    const saved = typeof localStorage === 'undefined' ? null : localStorage.getItem('lang');
    if (saved === 'en' || saved === 'es') return saved;
    const browserLanguage =
      typeof navigator === 'undefined' ? '' : navigator.language.toLowerCase();
    return browserLanguage === 'es' || browserLanguage.startsWith('es-') ? 'es' : 'en';
  }
}
