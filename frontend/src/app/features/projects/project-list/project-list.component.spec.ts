import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsService } from '../projects.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { ProjectList } from './project-list.component';

describe('ProjectList', () => {
  let component: ProjectList;
  let fixture: ComponentFixture<ProjectList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectList],
      providers: [
        provideRouter([]),
        {
          provide: ProjectsService,
          useValue: {
            list: () => of([]),
            get: () => of({ id: '', name: '', description: null }),
            create: () => of({ id: '', name: '', description: null }),
            update: () => of({ id: '', name: '', description: null }),
            delete: () => of({ deleted: true }),
            tickets: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
