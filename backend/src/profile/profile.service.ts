import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProfileService {
  constructor(private readonly users: UsersService) {}

  getProfile(userId: string) { return this.users.findById(userId); }

  changePassword(userId: string, currentPassword: string, newPassword: string) {
    return this.users.verifyAndUpdatePassword(userId, currentPassword, newPassword);
  }
}
