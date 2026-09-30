import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileService } from './profile.service';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.profile.getProfile(request.user.id);
  }

  @Post('change-password')
  async changePassword(@Req() request: AuthenticatedRequest, @Body() input: ChangePasswordDto) {
    await this.profile.changePassword(request.user.id, input.currentPassword, input.newPassword);
    return { changed: true };
  }
}
