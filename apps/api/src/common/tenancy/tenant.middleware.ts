/**
 * TenantMiddleware
 * ---------------------------------------------------------------------------
 * Resuelve el tenant (complejo) del request y abre el scope de
 * AsyncLocalStorage que lo expone al resto de la pila.
 *
 * Orden de resolución:
 *   1. Header `X-Tenant-Id`: acepta el SLUG o el UUID del tenant. Pensado para
 *      desarrollo local (localhost no tiene subdominio) y para clientes de API.
 *   2. Subdominio: `clubA.miapp.com` → slug `clubA`. Para producción.
 *
 * Si no se resuelve ningún tenant, el scope se abre con tenantId=null. Las
 * rutas públicas que no dependen de un tenant (ej. health) funcionan igual;
 * las que sí lo requieren fallarán explícitamente vía requireTenantId().
 *
 * Para requests autenticados, la JwtStrategy sobrescribe luego este valor con
 * el tenantId del token (fuente de verdad del usuario logueado).
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { runWithTenant } from './tenant-context';

/** Dominios que no representan un tenant (no se interpretan como subdominio). */
const RESERVED_SUBDOMAINS = new Set(['www', 'api', 'app', 'admin', 'localhost']);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const tenantId = await this.resolveTenantId(req);
    runWithTenant(tenantId, () => next());
  }

  private async resolveTenantId(req: Request): Promise<string | null> {
    // 1) Token JWT (fuente de verdad para requests autenticados). Se decodifica
    //    SIN verificar la firma — sólo para enrutar el tenant. El JwtAuthGuard
    //    valida la firma después, y rechaza el request si el token es inválido,
    //    de modo que un tenantId falso nunca llega a tocar datos.
    //
    //    Esto evita una fuga cross-tenant: el token DEBE ganar sobre el header,
    //    y debe fijarse en ESTE scope de AsyncLocalStorage (la JwtStrategy corre
    //    fuera de este contexto async y no puede sobreescribirlo de forma fiable).
    const fromToken = this.tenantIdFromAuthHeader(req);
    if (fromToken) return fromToken;

    // 2) Header explícito (rutas públicas en dev / clientes de API).
    const header = req.headers['x-tenant-id'];
    const headerValue = Array.isArray(header) ? header[0] : header;
    if (headerValue) {
      return this.lookup(headerValue.trim());
    }

    // 3) Subdominio (rutas públicas en producción).
    const slug = this.extractSubdomain(req.hostname);
    if (slug) {
      return this.lookup(slug);
    }

    return null;
  }

  /**
   * Extrae el tenantId del payload del Bearer token, sin verificar la firma.
   * Devuelve null si no hay token o no se puede parsear. La verificación real
   * la realiza el JwtAuthGuard aguas abajo.
   */
  private tenantIdFromAuthHeader(req: Request): string | null {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return null;
    const token = auth.slice(7);
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const json = Buffer.from(parts[1], 'base64url').toString('utf8');
      const payload = JSON.parse(json) as { tenantId?: unknown };
      return typeof payload.tenantId === 'string' ? payload.tenantId : null;
    } catch {
      return null;
    }
  }

  /** Resuelve un identificador (uuid o slug) al id del tenant, si existe y está activo. */
  private async lookup(identifier: string): Promise<string | null> {
    const where = UUID_RE.test(identifier)
      ? { id: identifier }
      : { slug: identifier.toLowerCase() };

    const tenant = await this.prisma.tenant.findUnique({
      where,
      select: { id: true, isActive: true },
    });

    if (!tenant || !tenant.isActive) return null;
    return tenant.id;
  }

  /** "clubA.miapp.com" → "clubA"; ignora dominios reservados y hosts planos. */
  private extractSubdomain(hostname: string): string | null {
    if (!hostname) return null;
    const parts = hostname.split('.');
    // Necesitamos al menos sub.dominio.tld (3 partes) para tener subdominio.
    if (parts.length < 3) return null;
    const sub = parts[0].toLowerCase();
    if (RESERVED_SUBDOMAINS.has(sub)) return null;
    return sub;
  }
}
