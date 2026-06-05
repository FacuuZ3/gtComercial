/**
 * Tests del TenantMiddleware: resolución del tenant de cada request.
 *
 * Cubre especialmente la regla de seguridad clave (aislamiento entre
 * complejos): el tenant del JWT SIEMPRE gana sobre el header X-Tenant-Id,
 * evitando que un token de un complejo acceda a datos de otro cambiando el
 * header.
 */

import { TenantMiddleware } from './tenant.middleware';
import { getTenantId } from './tenant-context';

/** Construye un JWT falso (sin firma válida) con el payload dado. */
function fakeJwt(payload: Record<string, unknown>): string {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const sig = Buffer.from('signature').toString('base64url');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.${sig}`;
}

interface PrismaMock {
  tenant: { findUnique: jest.Mock };
}

describe('TenantMiddleware', () => {
  let prisma: PrismaMock;
  let middleware: TenantMiddleware;

  beforeEach(() => {
    prisma = { tenant: { findUnique: jest.fn() } };
    middleware = new TenantMiddleware(prisma as never);
  });

  /** Ejecuta el middleware y devuelve el tenantId que quedó en el contexto. */
  async function resolve(req: Partial<{
    headers: Record<string, string | undefined>;
    hostname: string;
  }>): Promise<string | null> {
    let captured: string | null = null;
    await middleware.use(
      { headers: {}, hostname: '', ...req } as never,
      {} as never,
      () => {
        captured = getTenantId();
      },
    );
    return captured;
  }

  // -------------------------------------------------------------------------
  // Regla de seguridad: el token gana sobre el header
  // -------------------------------------------------------------------------

  it('el tenant del JWT gana sobre el header X-Tenant-Id', async () => {
    const tenantId = await resolve({
      headers: {
        authorization: `Bearer ${fakeJwt({ tenantId: 'TOKEN-TENANT' })}`,
        'x-tenant-id': 'sur', // intento de pisar el tenant por header
      },
    });

    expect(tenantId).toBe('TOKEN-TENANT');
    // No se debe haber consultado el tenant del header: el token manda.
    expect(prisma.tenant.findUnique).not.toHaveBeenCalled();
  });

  it('un token malformado no rompe: cae al header', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ id: 'SUR-ID', isActive: true });
    const tenantId = await resolve({
      headers: {
        authorization: 'Bearer no-es-un-jwt',
        'x-tenant-id': 'sur',
      },
    });
    expect(tenantId).toBe('SUR-ID');
  });

  // -------------------------------------------------------------------------
  // Resolución por header (rutas públicas)
  // -------------------------------------------------------------------------

  it('resuelve el tenant por header cuando no hay token', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ id: 'SUR-ID', isActive: true });
    const tenantId = await resolve({ headers: { 'x-tenant-id': 'sur' } });

    expect(tenantId).toBe('SUR-ID');
    expect(prisma.tenant.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'sur' } }),
    );
  });

  it('un tenant inexistente resuelve a null', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);
    const tenantId = await resolve({ headers: { 'x-tenant-id': 'fantasma' } });
    expect(tenantId).toBeNull();
  });

  it('un tenant suspendido (isActive=false) resuelve a null', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ id: 'X', isActive: false });
    const tenantId = await resolve({ headers: { 'x-tenant-id': 'suspendido' } });
    expect(tenantId).toBeNull();
  });

  it('un identificador UUID se busca por id (no por slug)', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ id: 'UUID-ID', isActive: true });
    const uuid = '11111111-1111-4111-8111-111111111111';
    await resolve({ headers: { 'x-tenant-id': uuid } });
    expect(prisma.tenant.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: uuid } }),
    );
  });

  // -------------------------------------------------------------------------
  // Resolución por subdominio (producción)
  // -------------------------------------------------------------------------

  it('resuelve el tenant por subdominio', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ id: 'A-ID', isActive: true });
    const tenantId = await resolve({ hostname: 'cluba.miapp.com' });

    expect(tenantId).toBe('A-ID');
    expect(prisma.tenant.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'cluba' } }),
    );
  });

  it('ignora subdominios reservados (www, api, app...)', async () => {
    const tenantId = await resolve({ hostname: 'www.miapp.com' });
    expect(tenantId).toBeNull();
    expect(prisma.tenant.findUnique).not.toHaveBeenCalled();
  });

  it('un host plano (sin subdominio) resuelve a null', async () => {
    const tenantId = await resolve({ hostname: 'miapp.com' });
    expect(tenantId).toBeNull();
    expect(prisma.tenant.findUnique).not.toHaveBeenCalled();
  });

  it('sin token, header ni subdominio resuelve a null', async () => {
    const tenantId = await resolve({});
    expect(tenantId).toBeNull();
  });
});
