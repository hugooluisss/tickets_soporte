import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  const originalLanguage = Object.getOwnPropertyDescriptor(window.navigator, 'language');
  const browserLanguage = (language: string) => Object.defineProperty(window.navigator, 'language', { configurable: true, value: language });

  beforeEach(() => { localStorage.clear(); TestBed.resetTestingModule(); });
  afterAll(() => {
    if (originalLanguage) Object.defineProperty(window.navigator, 'language', originalLanguage);
  });

  it('prefers a stored choice to the browser locale', () => {
    browserLanguage('es-MX'); localStorage.setItem('lang', 'en');
    TestBed.configureTestingModule({});
    expect(TestBed.inject(TranslationService).language()).toBe('en');
  });

  it.each(['es', 'es-MX', 'es-419'])('resolves %s as Spanish', (locale) => {
    browserLanguage(locale); TestBed.configureTestingModule({});
    expect(TestBed.inject(TranslationService).language()).toBe('es');
  });

  it('falls back to English for another browser locale', () => {
    browserLanguage('fr-FR'); TestBed.configureTestingModule({});
    expect(TestBed.inject(TranslationService).language()).toBe('en');
  });

  it('persists manual selection and updates lookup immediately', () => {
    browserLanguage('en-US'); TestBed.configureTestingModule({});
    const service = TestBed.inject(TranslationService);
    service.setLanguage('es');
    expect(localStorage.getItem('lang')).toBe('es');
    expect(service.t('login.title')).toBe('Iniciar sesión');
  });
});
