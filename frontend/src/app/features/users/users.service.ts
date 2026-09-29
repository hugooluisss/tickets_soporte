import { Injectable, inject } from '@angular/core';
import { UsersApiService } from './users-api.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(UsersApiService);
  list() { return this.api.list(); }
}
