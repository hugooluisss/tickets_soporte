import { Injectable, inject } from '@angular/core';
import { UsersApiService } from './users-api.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(UsersApiService);
  list() {
    return this.api.list();
  }
  get(id: string) {
    return this.api.get(id);
  }
  create(input: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user';
    isActive: boolean;
    password: string;
  }) {
    return this.api.create(input);
  }
  update(
    id: string,
    input: {
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: 'admin' | 'user';
      isActive?: boolean;
      password?: string;
    },
  ) {
    return this.api.update(id, input);
  }
  delete(id: string) {
    return this.api.delete(id);
  }
}
