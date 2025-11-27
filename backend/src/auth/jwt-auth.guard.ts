// src/auth/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('No autorizado: falta token');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      // guardamos el user en la request para usarlo después
      req.user = payload; // { userId, role, iat, exp }
      return true;
    } catch (e) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
