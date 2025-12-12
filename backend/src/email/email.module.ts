import { Module } from '@nestjs/common';
import { EmailService } from './email.services';
import { EmailController } from './email.controller';

@Module({
  providers: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
