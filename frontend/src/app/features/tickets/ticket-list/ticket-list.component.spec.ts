import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketsService } from '../tickets.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { ProjectsService } from '../../projects/projects.service';
import { CategoriesService } from '../../categories/categories.service';
import { UsersService } from '../../users/users.service';
import { TicketList } from './ticket-list.component';

describe('TicketList', () => {
  let component: TicketList;
  let fixture: ComponentFixture<TicketList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketList],
      providers: [
        provideRouter([]),
        { provide: ProjectsService, useValue: { list: () => of([]) } },
        { provide: CategoriesService, useValue: { list: () => of([]) } },
        { provide: UsersService, useValue: { list: () => of([]) } },
        {
          provide: TicketsService,
          useValue: {
            list: () => of([]),
            get: () =>
              of({
                id: '',
                title: '',
                description: null,
                kind: 'ticket',
                priority: 'medium',
                status: 'pending',
                projectId: null,
                categoryId: null,
                assignedToId: null,
                createdAt: '',
                updatedAt: '',
              }),
            create: () => of({}),
            update: () => of({}),
            delete: () => of({ deleted: true }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
