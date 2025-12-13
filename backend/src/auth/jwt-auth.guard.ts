// src/auth/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject("SUPABASE") private readonly supabase: SupabaseClient
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader) throw new UnauthorizedException("No autorizado: falta token");

    const [type, token] = String(authHeader).split(" ");
    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException("Formato de token inválido");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      // payload esperado: { userId, role, iat, exp }
      if (!payload?.userId) throw new UnauthorizedException("Token inválido");

      // ✅ Validación dura en BD: activo + no vencido
      const { data: user, error } = await this.supabase
        .from("users")
        .select("id, role, is_active, plan_expires_at, plan_id")
        .eq("id", payload.userId)
        .maybeSingle();

      if (error) {
        throw new UnauthorizedException("Error validando usuario");
      }

      if (!user) {
        throw new UnauthorizedException("Usuario no existe o fue eliminado");
      }

      if (user.is_active === false) {
        throw new ForbiddenException("Cuenta desactivada");
      }

      if (user.plan_expires_at) {
        const exp = new Date(user.plan_expires_at);
        if (!isNaN(exp.getTime()) && exp.getTime() <= Date.now()) {
          throw new ForbiddenException("Plan vencido");
        }
      }


      req.user = payload;
      req.dbUser = user; // por si lo quieres usar después
      return true;
    } catch (e: any) {
      // Si ya viene Forbidden (plan vencido), no lo tapes con Unauthorized
      if (e instanceof ForbiddenException) throw e;
      throw new UnauthorizedException("Token inválido o expirado");
    }
  }
}
