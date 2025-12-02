import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { AuthModule } from '../auth/auth.module';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    AuthModule,          // 👈 para JwtAuthGuard / JwtService
    AccessControlModule, // 👈 para AccessControlService
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
