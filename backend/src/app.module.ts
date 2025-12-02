import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SupabaseModule } from './supabase/supabase.module';
import { BuildingsModule } from './buildings/buildings.module';
import { DepartmentsModule } from './departments/departments.module';
import { PaymentsModule } from './payments/payments.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BalanceModule } from './balance/balance.module';
import { CondominiumsModule } from './condominiums/condominiums.module';
import { ParkingsModule } from './parkings/parkings.module';
import { AuthModule } from './auth/auth.module';
import { AccessControlModule } from './access-control/access-control.module';
import { MeModule } from './me/me.module';

@Module({
  imports: [
    // Cargar .env globalmente
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // IMPORTANTE -> sin esto el SUPABASE no existe
    SupabaseModule,

    BuildingsModule,
    DepartmentsModule,
    PaymentsModule,
    ExpensesModule,
    BalanceModule,
    CondominiumsModule,
    ParkingsModule,
    AuthModule,
    AccessControlModule,
    MeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
