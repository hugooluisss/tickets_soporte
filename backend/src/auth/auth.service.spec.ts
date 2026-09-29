import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../users/user-role.enum';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const users: any = { authenticate: jest.fn() };
  const jwt: any = { signAsync: jest.fn().mockResolvedValue('signed-token') };
  const service = new AuthService(users, jwt);
  beforeEach(() => jest.clearAllMocks());

  it('returns a signed JWT and safe profile on valid login', async () => {
    users.authenticate.mockResolvedValue({ id: 'u1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', role: UserRole.ADMIN, isActive: true });
    await expect(service.login('ada@example.com', 'secret')).resolves.toEqual({ accessToken: 'signed-token', user: { id: 'u1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', role: UserRole.ADMIN, isActive: true } });
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'u1', role: UserRole.ADMIN });
  });

  it.each(['wrong password', 'unknown account', 'inactive account'])('does not issue a token for %s', async () => {
    users.authenticate.mockRejectedValue(new UnauthorizedException('Invalid email or password'));
    await expect(service.login('ada@example.com', 'bad')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});
