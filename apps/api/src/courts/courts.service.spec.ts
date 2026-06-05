/**
 * Tests de aislamiento por tenant de CourtsService.
 *
 * Verifican que TODA consulta queda scopeada al tenant del contexto:
 *   - las lecturas filtran por tenantId,
 *   - las escrituras setean tenantId,
 *   - sin contexto de tenant, la operación falla (no se puede leer "todo").
 *
 * Es la garantía de aislamiento a nivel de servicio: si alguien quita un
 * filtro tenantId en el futuro, estos tests fallan.
 */

import { CourtsService } from './courts.service';
import { runWithTenant } from '../common/tenancy/tenant-context';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

interface PrismaMock {
  court: {
    findMany: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
  };
}

describe('CourtsService · aislamiento por tenant', () => {
  let prisma: PrismaMock;
  let service: CourtsService;

  beforeEach(() => {
    prisma = {
      court: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue({ id: 'c1', tenantId: TENANT_A }),
        create: jest.fn().mockResolvedValue({ id: 'c1' }),
      },
    };
    service = new CourtsService(prisma as never);
  });

  it('list() filtra por el tenantId del contexto', async () => {
    await runWithTenant(TENANT_A, () => service.list());
    expect(prisma.court.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: TENANT_A }),
      }),
    );
  });

  it('list() sin contexto de tenant lanza (no devuelve datos de todos)', () => {
    // requireTenantId() lanza sincrónicamente antes de tocar la base.
    expect(() => service.list()).toThrow(/no hay tenant/i);
    expect(prisma.court.findMany).not.toHaveBeenCalled();
  });

  it('findByIdOrThrow() scopea por tenantId (defensa en profundidad)', async () => {
    await runWithTenant(TENANT_A, () => service.findByIdOrThrow('c1'));
    expect(prisma.court.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'c1', tenantId: TENANT_A }),
      }),
    );
  });

  it('create() setea el tenantId del contexto', async () => {
    await runWithTenant(TENANT_A, () =>
      service.create({
        name: 'Cancha 1',
        sportType: 'PADEL',
        pricePerHour: 5000,
      } as never),
    );
    expect(prisma.court.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: TENANT_A }),
      }),
    );
  });
});
