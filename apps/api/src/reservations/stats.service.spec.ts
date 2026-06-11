/**
 * Tests de aislamiento por tenant de StatsService.
 *
 * Contexto: en la auditoría se detectó que las estadísticas se calculaban
 * SIN filtro por tenant (un admin veía facturación, ocupación y emails de
 * clientes de TODOS los complejos). Estos tests garantizan que esa fuga no
 * vuelva a introducirse: cada consulta del cálculo debe ir scopeada al
 * tenant del contexto.
 */

import { StatsService } from './stats.service';
import { runWithTenant } from '../common/tenancy/tenant-context';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

interface PrismaMock {
  reservation: {
    count: jest.Mock;
    findMany: jest.Mock;
  };
  court: {
    findMany: jest.Mock;
  };
}

describe('StatsService · aislamiento por tenant', () => {
  let prisma: PrismaMock;
  let service: StatsService;

  beforeEach(() => {
    prisma = {
      reservation: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
      },
      court: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    service = new StatsService(prisma as never);
  });

  it('todas las consultas de métricas filtran por el tenantId del contexto', async () => {
    await runWithTenant(TENANT_A, () => service.getStats(30));

    // Los 3 counts (confirmed / cancelled / pending).
    expect(prisma.reservation.count).toHaveBeenCalledTimes(3);
    for (const call of prisma.reservation.count.mock.calls) {
      expect(call[0].where).toEqual(expect.objectContaining({ tenantId: TENANT_A }));
    }

    // El findMany de reservas confirmadas (facturación / topUsers / heatmap).
    expect(prisma.reservation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: TENANT_A }),
      }),
    );

    // El listado de canchas para la ocupación.
    expect(prisma.court.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: TENANT_A }),
      }),
    );
  });

  it('sin contexto de tenant lanza (no calcula métricas globales)', async () => {
    await expect(service.getStats(30)).rejects.toThrow(/no hay tenant/i);
    expect(prisma.reservation.findMany).not.toHaveBeenCalled();
  });
});
