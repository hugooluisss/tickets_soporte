import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { UsersApiService } from './users-api.service';

describe('UsersApiService', () => {
  it('gets a user by id', () => {
    const get = vi.fn();
    TestBed.configureTestingModule({
      providers: [UsersApiService, { provide: HttpClient, useValue: { get } }],
    });
    TestBed.inject(UsersApiService).get('user-1');
    expect(get).toHaveBeenCalledWith(`${environment.apiBaseUrl}/users/user-1`);
  });

  it('posts a new user', () => {
    const post = vi.fn();
    const input = {
      email: 'user@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      role: 'user' as const,
      isActive: true,
      password: 'Password123',
    };
    TestBed.configureTestingModule({
      providers: [UsersApiService, { provide: HttpClient, useValue: { post } }],
    });
    TestBed.inject(UsersApiService).create(input);
    expect(post).toHaveBeenCalledWith(`${environment.apiBaseUrl}/users`, input);
  });

  it('patches a user', () => {
    const patch = vi.fn();
    const input = { firstName: 'Augusta', isActive: false };
    TestBed.configureTestingModule({
      providers: [UsersApiService, { provide: HttpClient, useValue: { patch } }],
    });
    TestBed.inject(UsersApiService).update('user-1', input);
    expect(patch).toHaveBeenCalledWith(`${environment.apiBaseUrl}/users/user-1`, input);
  });

  it('deletes a user', () => {
    const deleteMethod = vi.fn();
    TestBed.configureTestingModule({
      providers: [UsersApiService, { provide: HttpClient, useValue: { delete: deleteMethod } }],
    });
    TestBed.inject(UsersApiService).delete('user-1');
    expect(deleteMethod).toHaveBeenCalledWith(`${environment.apiBaseUrl}/users/user-1`);
  });
});
