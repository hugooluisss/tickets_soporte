import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardService } from '../dashboard.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { DashboardView } from './dashboard-view.component';

describe('DashboardView', () => {
  let component: DashboardView;
  let fixture: ComponentFixture<DashboardView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardView],
      providers: [provideRouter([]), { provide: DashboardService, useValue: { summary: () => of({ pending: 0, byStatus: [], byProject: [], byCategory: [] }) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
