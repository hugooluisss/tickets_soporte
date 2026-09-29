import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { User } from '../../models';
import { UsersService } from '../users.service';
import { UserList } from './user-list.component';

describe('UserList', () => {
  let fixture: ComponentFixture<UserList>;
  const user: User = { id: 'u1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace', role: 'admin', isActive: true };
  let service: { list: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    service = { list: vi.fn(() => of([user])), delete: vi.fn(() => of({ deleted: true })) };
    await TestBed.configureTestingModule({ imports: [UserList], providers: [provideRouter([]), { provide: UsersService, useValue: service }] }).compileComponents();
    fixture = TestBed.createComponent(UserList);
    vi.stubGlobal('confirm', () => true);
    await fixture.whenStable();
  });

  it('renders users with role and active indicator', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('ada@example.com');
    expect(fixture.nativeElement.textContent).toContain('Admin');
    expect(fixture.nativeElement.querySelector('.status-pill-active')).toBeTruthy();
  });

  it('removes the row after successful deletion', async () => {
    fixture.componentInstance.remove(user);
    await fixture.whenStable();
    expect(service.delete).toHaveBeenCalledWith('u1');
    expect(service.list).toHaveBeenCalledTimes(2);
  });

  it('shows a delete error and keeps the row when deletion fails', async () => {
    service.delete.mockReturnValue(throwError(() => new Error('conflict')));
    fixture.componentInstance.remove(user);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Unable to delete user');
    expect(fixture.componentInstance.rows()).toEqual([user]);
  });
});
