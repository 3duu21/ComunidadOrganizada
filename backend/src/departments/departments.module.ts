import { Module } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { AuthModule } from '../auth/auth.module';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    AuthModule,           // 👈 para JwtAuthGuard / JwtService
    AccessControlModule,  // 👈 para AccessControlService
  ],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}
