/**
 * JwtStrategy
 * ---------------------------------------------------------------------------
 * Estrategia Passport para validar access tokens.
 * Lee el token desde el header `Authorization: Bearer <token>` y, si es
 * válido, inyecta el payload reducido en `req.user` (vía AuthUser).
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
  tenantId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: AccessTokenPayload): AuthUser {
    if (!payload?.sub) throw new UnauthorizedException('Token inválido.');
    if (!payload.tenantId) throw new UnauthorizedException('Token sin tenant.');

    // El scoping de tenant lo fija el TenantMiddleware (que extrae el tenantId
    // del token dentro del scope correcto de AsyncLocalStorage). Acá sólo se
    // expone en AuthUser para los handlers que lo necesiten explícitamente.
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
