import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    SupabaseModule,
    AuthModule,          // 👈 para JwtAuthGuard / JwtService
    AccessControlModule, // 👈 para AccessControlService
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
