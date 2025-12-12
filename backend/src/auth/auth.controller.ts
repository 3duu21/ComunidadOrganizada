// src/auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

class LoginDto {
  email: string;
  password: string;
}

class SignupTrialDto {
  name: string;
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    console.log('🔥 AuthController LOGIN reached');
    return this.authService.login(body.email, body.password);
  }

  @Post('signup-trial')
  async signupTrial(@Body() body: SignupTrialDto) {
    // delegamos en el servicio
    return this.authService.registerTrial(body);
  }
}
