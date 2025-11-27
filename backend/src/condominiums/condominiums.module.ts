import { Module } from '@nestjs/common';
import { CondominiumsService } from './condominiums.service';
import { CondominiumsController } from './condominiums.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [
    AuthModule, // para poder usar JwtService dentro del guard
  ],
  controllers: [CondominiumsController],
  providers: [
    CondominiumsService,
    JwtAuthGuard, // lo inyecta Nest cuando usamos @UseGuards(JwtAuthGuard)
  ],
})
export class CondominiumsModule {}
