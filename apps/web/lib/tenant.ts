/**
 * Resolución del tenant (complejo) en el frontend.
 * ---------------------------------------------------------------------------
 * El backend identifica el tenant de cada request por:
 *   - el JWT (para requests autenticados), o
 *   - el header `X-Tenant-Id` (para requests públicos: login, register, landing).
 *
 * Este helper determina qué slug de tenant mandar en el header `X-Tenant-Id`.
 *
 * Estrategia:
 *   - Producción: subdominio del host (clubA.miapp.com → "clubA").
 *   - Desarrollo / dominio plano (localhost): valor de NEXT_PUBLIC_DEFAULT_TENANT.
 *
 * Para requests autenticados el backend ignora este header (el JWT manda),
 * pero enviarlo igual es inofensivo y simplifica el cliente.
 */

const DEFAULT_TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? 'norte';

const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'api', 'admin', 'localhost']);

/** Extrae el slug del subdominio de un hostname, o null si no aplica. */
function slugFromHostname(hostname: string): string | null {
  const host = hostname.split(':')[0]; // descarta el puerto
  const parts = host.split('.');
  // Necesitamos sub.dominio.tld (3+ partes) para tener un subdominio real.
  if (parts.length < 3) return null;
  const sub = parts[0].toLowerCase();
  if (RESERVED_SUBDOMAINS.has(sub)) return null;
  return sub;
}

/**
 * Slug del tenant en el cliente (browser). Usa el subdominio actual; si no
 * hay (localhost / dominio plano), cae al tenant por defecto.
 */
export function getTenantSlug(): string {
  if (typeof window !== 'undefined') {
    const fromSub = slugFromHostname(window.location.hostname);
    if (fromSub) return fromSub;
  }
  return DEFAULT_TENANT;
}

/**
 * Slug del tenant en el servidor (SSR). Recibe el host header del request.
 * Usar junto a `headers()` de next/headers en Server Components.
 */
export function getTenantSlugFromHost(host: string | null | undefined): string {
  if (host) {
    const fromSub = slugFromHostname(host);
    if (fromSub) return fromSub;
  }
  return DEFAULT_TENANT;
}

/** Header listo para mezclar en un fetch del cliente. */
export function tenantHeader(): Record<string, string> {
  return { 'X-Tenant-Id': getTenantSlug() };
}
