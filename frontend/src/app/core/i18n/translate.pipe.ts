import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationKey } from './en';
import { TranslationService } from './translation.service';

@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly translations = inject(TranslationService);
  transform(key: TranslationKey | string): string {
    this.translations.language();
    return this.translations.t(key as TranslationKey);
  }
}
