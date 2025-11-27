// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

interface JwtPayload {
  userId: number;
  role: string;
}



@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('SUPABASE') private readonly supabase: SupabaseClient,
  ) { }

  async validateUser(email: string, password: string) {
  
    // Traer usuario desde la tabla users
    const { data: user, error } = await this.supabase
      .from('users')
      .select('id, name, email, password_hash, role')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }



    return user;
  }


  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload: JwtPayload = {
      userId: user.id,
      role: user.role || 'user',
    };

    const token = await this.jwtService.signAsync(payload);

    console.log('ENV URL:', process.env.SUPABASE_URL);
    console.log('ENV KEY:', process.env.SUPABASE_KEY?.substring(0, 15) + '...');
    console.log('Verifying users table...');

    const test = await this.supabase.from('users').select('*');
    console.log('🟧 SUPABASE RESULT:', test);


    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
