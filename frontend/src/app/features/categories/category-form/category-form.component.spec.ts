import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoriesService } from '../categories.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { CategoryForm } from './category-form.component';

describe('CategoryForm', () => {
  let component: CategoryForm;
  let fixture: ComponentFixture<CategoryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryForm],
      providers: [provideRouter([]), { provide: CategoriesService, useValue: { list: () => of([]), get: () => of({ id: '', name: '' }), create: () => of({ id: '', name: '' }), update: () => of({ id: '', name: '' }), delete: () => of({ deleted: true }) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
