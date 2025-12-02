// src/me/me.module.ts
import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // para JwtAuthGuard
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
