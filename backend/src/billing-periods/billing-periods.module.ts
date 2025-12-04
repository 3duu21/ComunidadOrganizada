// src/billing-periods/billing-periods.module.ts
import { Module } from '@nestjs/common';
import { BillingPeriodsController } from './billing-periods.controller';
import { BillingPeriodsService } from './billing-periods.service';
import { AuthModule } from '../auth/auth.module'; // 👈 importa tu módulo de auth

@Module({
  imports: [AuthModule],                    // 👈 agrega AuthModule acá
  controllers: [BillingPeriodsController],
  providers: [BillingPeriodsService],
  exports: [BillingPeriodsService],
})
export class BillingPeriodsModule {}
