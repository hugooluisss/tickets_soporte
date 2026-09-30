import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsService } from '../reports.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { ProjectsService } from '../../projects/projects.service';
import { CategoriesService } from '../../categories/categories.service';
import { UsersService } from '../../users/users.service';
import { ReportsView } from './reports-view.component';

describe('ReportsView', () => {
  let component: ReportsView;
  let fixture: ComponentFixture<ReportsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsView],
      providers: [
        provideRouter([]),
        { provide: ProjectsService, useValue: { list: () => of([]) } },
        { provide: CategoriesService, useValue: { list: () => of([]) } },
        { provide: UsersService, useValue: { list: () => of([]) } },
        {
          provide: ReportsService,
          useValue: {
            generate: () => of({ tickets: [], byStatus: [], byProject: [], byCategory: [] }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
