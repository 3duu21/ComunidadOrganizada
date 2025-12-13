// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  Inject,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SupabaseClient } from "@supabase/supabase-js";
import * as bcrypt from "bcrypt";

interface JwtPayload {
  userId: number;
  role: "admin" | "owner";
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject("SUPABASE") private readonly supabase: SupabaseClient
  ) {}

  async validateUser(email: string, password: string) {
    const { data: user, error } = await this.supabase
      .from("users")
      .select("id, name, email, password_hash, role, is_active, plan_expires_at")
      .eq("email", email)
      .single();

    if (error || !user) throw new UnauthorizedException("Credenciales inválidas");

    // ✅ Bloqueo por estado / expiración antes de dar acceso
    if (user.is_active === false) {
      throw new ForbiddenException("Cuenta desactivada");
    }
    if (user.plan_expires_at) {
      const exp = new Date(user.plan_expires_at);
      if (!isNaN(exp.getTime()) && exp.getTime() <= Date.now()) {
        throw new ForbiddenException("Plan vencido");
      }
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new UnauthorizedException("Credenciales inválidas");

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const normalizedRole: "admin" | "owner" =
      user.role === "owner" ? "owner" : "admin";

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

  async registerTrial(dto: { name: string; email: string; password: string }) {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name.trim();
    const password = dto.password.trim();

    if (!email || !password || !name) {
      throw new BadRequestException("Nombre, correo y contraseña son obligatorios.");
    }
    if (password.length < 6) {
      throw new BadRequestException("La contraseña debe tener al menos 6 caracteres.");
    }

    const { data: existing, error: existingError } = await this.supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) throw new BadRequestException("Ya existe una cuenta con este correo.");

    const passwordHash = await bcrypt.hash(password, 10);

    const trialDays = 14;
    const now = new Date();
    const planStartedAt = now.toISOString();
    const planExpiresAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000).toISOString();

    const { data: user, error: userError } = await this.supabase
      .from("users")
      .insert({
        email,
        name,
        password_hash: passwordHash,
        role: "admin",
        plan_id: "trial",
        plan_started_at: planStartedAt,
        plan_expires_at: planExpiresAt,
        is_active: true,
      })
      .select("id")
      .single();

    if (userError) throw userError;

    const { data: condo, error: condoError } = await this.supabase
      .from("condominiums")
      .insert({ name: `Demo - ${name}` })
      .select("id")
      .single();

    if (condoError) throw condoError;

    const { error: linkError } = await this.supabase
      .from("user_condominiums")
      .insert({
        user_id: user.id,
        condominium_id: condo.id,
        role: "admin",
      });

    if (linkError) throw linkError;

    return this.login(email, password);
  }
}
