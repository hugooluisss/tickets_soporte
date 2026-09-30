import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UserRole } from './user-role.enum';
import { UsersRepository } from './users.repository';

export type PublicUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  async create(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    isActive?: boolean;
  }): Promise<PublicUser> {
    if (await this.users.findByEmail(input.email))
      throw new ConflictException('Email is already in use');
    const user = await this.users.create({
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role ?? UserRole.USER,
      isActive: input.isActive ?? true,
    });
    return this.toPublic(user);
  }

  async findAll(): Promise<PublicUser[]> {
    return (await this.users.findAll()).map((user) => this.toPublic(user));
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  async update(
    id: string,
    input: Partial<{
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      isActive: boolean;
    }>,
  ): Promise<PublicUser> {
    const existing = await this.users.findById(id);
    if (!existing) throw new NotFoundException('User not found');
    if (input.email && input.email.toLowerCase() !== existing.email.toLowerCase()) {
      const duplicate = await this.users.findByEmail(input.email);
      if (duplicate) throw new ConflictException('Email is already in use');
    }
    const { password, ...fields } = input;
    const data: Partial<User> = { ...fields };
    if (password) data.passwordHash = await bcrypt.hash(password, 12);
    const updated = await this.users.update(id, data);
    if (!updated) throw new NotFoundException('User not found');
    return this.toPublic(updated);
  }

  async delete(id: string, requesterId: string): Promise<void> {
    if (id === requesterId) throw new ConflictException('You cannot delete your own account');
    if (!(await this.users.delete(id))) throw new NotFoundException('User not found');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.findByEmail(email);
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async authenticate(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user || !(await this.verifyPassword(user, password)))
      throw new UnauthorizedException('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');
    return user;
  }

  async verifyAndUpdatePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.users.findByEmail((await this.findById(id)).email);
    if (!user || !(await this.verifyPassword(user, currentPassword)))
      throw new BadRequestException('Current password is incorrect');
    await this.users.update(id, { passwordHash: await bcrypt.hash(newPassword, 12) });
  }

  private toPublic(user: User): PublicUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
