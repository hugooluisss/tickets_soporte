import { Injectable, inject } from '@angular/core';
import { ProfileApiService } from './profile-api.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ProfileApiService);
  get() { return this.api.get(); }
  changePassword(input: { currentPassword: string; newPassword: string }) { return this.api.changePassword(input); }
}
