// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

interface JwtPayload {
  userId: number;
  role: 'admin' | 'owner';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('SUPABASE') private readonly supabase: SupabaseClient,
  ) {}

  async validateUser(email: string, password: string) {
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

    // 👇 Normalizamos: cualquier cosa que no sea 'owner' lo tratamos como 'admin'
    const normalizedRole: 'admin' | 'owner' =
      user.role === 'owner' ? 'owner' : 'admin';

    const payload: JwtPayload = {
      userId: user.id,
      role: normalizedRole,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizedRole,
      },
    };
  }
}
