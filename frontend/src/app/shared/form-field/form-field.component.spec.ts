import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { FormFieldComponent } from './form-field.component';

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<FormFieldComponent>;
  let control: FormControl;

  beforeEach(async () => {
    control = new FormControl('', Validators.required);
    await TestBed.configureTestingModule({ imports: [FormFieldComponent] }).compileComponents();
    fixture = TestBed.createComponent(FormFieldComponent);
    fixture.componentRef.setInput('id', 'name');
    fixture.componentRef.setInput('label', 'Name');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('errorMessage', 'Name is required.');
    fixture.detectChanges();
  });

  it('associates the label with its input and hides errors before interaction', () => {
    expect(fixture.nativeElement.querySelector('label').getAttribute('for')).toBe('name');
    expect(fixture.nativeElement.querySelector('input').id).toBe('name');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows an error after an invalid control is touched', () => {
    control.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Name is required.');
  });

  it('hides the error after a touched control becomes valid', () => {
    control.markAsTouched();
    control.setValue('Ada');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
