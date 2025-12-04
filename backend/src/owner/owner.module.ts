// src/owner/owner.module.ts
import { Module } from '@nestjs/common';
import { OwnerController } from './owner.controller';
import { AuthModule } from '../auth/auth.module';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [AuthModule, AccessControlModule],
  controllers: [OwnerController],
})
export class OwnerModule {}
