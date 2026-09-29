import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { UsersService } from '../users.service';
import { UserForm } from './user-form.component';

describe('UserForm', () => {
  let fixture: ComponentFixture<UserForm>;
  let service: { get: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };

  async function setup(id: string | null = null) {
    service = {
      get: vi.fn(() => of({ id: 'u1', email: 'old@example.com', firstName: 'Ada', lastName: 'Lovelace', role: 'user', isActive: true })),
      create: vi.fn(() => of({})), update: vi.fn(() => of({})),
    };
    await TestBed.configureTestingModule({
      imports: [UserForm],
      providers: [provideRouter([]), { provide: Router, useValue: { navigate: vi.fn() } }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } } }, { provide: UsersService, useValue: service }],
    }).compileComponents();
    fixture = TestBed.createComponent(UserForm);
    await fixture.whenStable();
  }

  it('creates with the entered password', async () => {
    await setup();
    fixture.componentInstance.form.patchValue({ email: 'new@example.com', firstName: 'Grace', lastName: 'Hopper', password: 'LongPass123' });
    fixture.componentInstance.save();
    expect(service.create).toHaveBeenCalledWith({ email: 'new@example.com', firstName: 'Grace', lastName: 'Hopper', role: 'user', isActive: true, password: 'LongPass123' });
  });

  it('omits a blank password and includes a provided password on update', async () => {
    await setup('u1');
    fixture.componentInstance.form.patchValue({ firstName: 'Augusta' });
    fixture.componentInstance.save();
    expect(service.update).toHaveBeenLastCalledWith('u1', { email: 'old@example.com', firstName: 'Augusta', lastName: 'Lovelace', role: 'user', isActive: true });
    fixture.componentInstance.form.controls.password.setValue('NewPass123');
    fixture.componentInstance.save();
    expect(service.update).toHaveBeenLastCalledWith('u1', { email: 'old@example.com', firstName: 'Augusta', lastName: 'Lovelace', role: 'user', isActive: true, password: 'NewPass123' });
  });

  it('blocks submission when required fields are empty', async () => {
    await setup();
    fixture.componentInstance.save();
    expect(service.create).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.controls.email.touched).toBe(true);
  });
});
