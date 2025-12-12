import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.services';

@Controller('contact')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  send(@Body() body: any) {
    return this.emailService.sendContactEmail(body);
  }
}
