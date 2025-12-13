// src/me/me.controller.ts
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeService } from './me.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  async getMe(@Req() req: any) {
    const userId: number = req.user.userId;
    return this.meService.getMeWithRoles(userId);
  }

  @Patch('profile')
  async updateProfile(
    @Req() req: any,
    @Body() body: { name?: string; phone?: string; avatar_url?: string },
  ) {
    const userId: number = req.user.userId;
    return this.meService.updateProfile(userId, body);
  }

  @Patch('settings')
  async updateSettings(
    @Req() req: any,
    @Body()
    body: {
      default_condominium_id?: string | null;
      theme?: string;
      notify_email?: boolean;
      notify_morosidad?: boolean;
    },
  ) {
    const userId: number = req.user.userId;
    return this.meService.updateSettings(userId, body);
  }
}
