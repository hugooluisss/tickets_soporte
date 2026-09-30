import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoriesService } from '../categories.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { CategoryList } from './category-list.component';

describe('CategoryList', () => {
  let component: CategoryList;
  let fixture: ComponentFixture<CategoryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryList],
      providers: [
        provideRouter([]),
        {
          provide: CategoriesService,
          useValue: {
            list: () => of([]),
            get: () => of({ id: '', name: '' }),
            create: () => of({ id: '', name: '' }),
            update: () => of({ id: '', name: '' }),
            delete: () => of({ deleted: true }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
