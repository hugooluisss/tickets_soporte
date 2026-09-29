import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../users/user-role.enum';
import { UsersService } from '../users/users.service';

interface JwtPayload { sub: string; role: UserRole }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly usersService: UsersService) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: config.getOrThrow<string>('JWT_SECRET') });
  }

  async validate(payload: JwtPayload): Promise<{ id: string; role: UserRole }> {
    const user = await this.usersService.findById(payload.sub);
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');
    return { id: user.id, role: user.role };
  }
}
