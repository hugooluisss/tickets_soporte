import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AuthApiService } from './auth-api.service';
import { environment } from '../../../environments/environment';

describe('AuthApiService', () => {
  it('posts credentials to the documented login endpoint', () => {
    const post = vi.fn();
    TestBed.configureTestingModule({ providers: [AuthApiService, { provide: HttpClient, useValue: { post } }] });
    TestBed.inject(AuthApiService).login({ email: 'user@example.com', password: 'secret' });
    expect(post).toHaveBeenCalledWith(`${environment.apiBaseUrl}/auth/login`, { email: 'user@example.com', password: 'secret' });
  });
});
