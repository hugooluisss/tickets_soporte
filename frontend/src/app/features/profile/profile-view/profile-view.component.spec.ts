import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileService } from '../profile.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { ProfileView } from './profile-view.component';

describe('ProfileView', () => {
  let component: ProfileView;
  let fixture: ComponentFixture<ProfileView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileView],
      providers: [provideRouter([]), { provide: ProfileService, useValue: { get: () => of({ id: '', email: '', firstName: '', lastName: '', role: 'admin', isActive: true }), changePassword: () => of({ changed: true }) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
