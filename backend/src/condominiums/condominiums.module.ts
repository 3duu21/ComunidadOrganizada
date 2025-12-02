import { Module } from '@nestjs/common';
import { CondominiumsService } from './condominiums.service';
import { CondominiumsController } from './condominiums.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // 👈 necesario para JwtAuthGuard / JwtService
  controllers: [CondominiumsController],
  providers: [CondominiumsService],
})
export class CondominiumsModule {}
