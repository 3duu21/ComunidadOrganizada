import { Module } from '@nestjs/common';
import { BuildingsController } from './buildings.controller';
import { BuildingsService } from './buildings.service';
import { AuthModule } from '../auth/auth.module';    // 👈 IMPORTANTE
import { AccessControlModule } from '../access-control/access-control.module'; // 👈 también

@Module({
  imports: [
    AuthModule,            // 👈 Necesario para JwtAuthGuard / JwtService
    AccessControlModule,   // 👈 Necesario para AccessControlService
  ],
  controllers: [BuildingsController],
  providers: [BuildingsService]
})
export class BuildingsModule { }
