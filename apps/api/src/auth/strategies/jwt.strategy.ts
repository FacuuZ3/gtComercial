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
import { setTenantId } from '../../common/tenancy/tenant-context';

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

    // El token es la fuente de verdad del tenant para usuarios autenticados:
    // sobreescribe lo que haya resuelto el TenantMiddleware (subdominio/header).
    setTenantId(payload.tenantId);

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
