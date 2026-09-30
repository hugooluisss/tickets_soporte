import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-field.component.html',
})
export class FormFieldComponent {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly control = input.required<FormControl>();
  readonly type = input<'text' | 'email' | 'password' | 'url'>('text');
  readonly kind = input<'input' | 'textarea' | 'select'>('input');
  readonly errorMessage = input('');
  readonly rows = input(4);
}
