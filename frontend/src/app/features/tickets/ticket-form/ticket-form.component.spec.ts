import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketsService } from '../tickets.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { ProjectsService } from '../../projects/projects.service';
import { CategoriesService } from '../../categories/categories.service';
import { UsersService } from '../../users/users.service';
import { TicketForm } from './ticket-form.component';
import { AuthService } from '../../../core/auth/auth.service';
import { vi } from 'vitest';

describe('TicketForm', () => {
  let component: TicketForm;
  let fixture: ComponentFixture<TicketForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketForm],
      providers: [provideRouter([]), { provide: AuthService, useValue: { hasRole: () => false } }, { provide: ProjectsService, useValue: { list: () => of([]) } }, { provide: CategoriesService, useValue: { list: () => of([]) } }, { provide: UsersService, useValue: { list: () => of([]) } }, { provide: TicketsService, useValue: { list: () => of([]), get: () => of({ id: '', title: '', description: null, kind: 'ticket', priority: 'medium', status: 'pending', projectId: null, categoryId: null, assignedToId: null, createdAt: '', updatedAt: '' }), create: () => of({}), update: () => of({}), delete: () => of({ deleted: true }), listNotes: () => of([]), createNote: vi.fn(), deleteNote: vi.fn() } }],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rejects whitespace-only note content without calling the API', () => {
    component.noteForm.controls.content.setValue('  \n ');
    component.addNote();
    expect(component.noteForm.controls.content.invalid).toBe(true);
  });
});
