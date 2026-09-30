import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.authenticate(email, password);
    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role });
    const { id, firstName, lastName, role, isActive } = user;
    return { accessToken, user: { id, firstName, lastName, email: user.email, role, isActive } };
  }
}
