import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from './user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

interface AuthenticatedRequest extends Request { user: { id: string } }

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll() { return this.users.findAll(); }

  @Post()
  create(@Body() input: CreateUserDto) { return this.users.create(input); }

  @Get(':id')
  findById(@Param('id') id: string) { return this.users.findById(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() input: UpdateUserDto) { return this.users.update(id, input); }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    await this.users.delete(id, request.user.id);
    return { deleted: true };
  }
}
