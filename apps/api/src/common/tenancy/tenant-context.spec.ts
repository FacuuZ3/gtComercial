/**
 * Tests del contexto de tenant (AsyncLocalStorage).
 * Verifican que el scope se abra/herede correctamente y que las operaciones
 * que requieren tenant fallen explícitamente fuera de contexto.
 */

import {
  getTenantId,
  requireTenantId,
  runWithTenant,
} from './tenant-context';

describe('tenant-context', () => {
  it('getTenantId devuelve null fuera de todo scope', () => {
    expect(getTenantId()).toBeNull();
  });

  it('requireTenantId lanza fuera de todo scope', () => {
    expect(() => requireTenantId()).toThrow(/no hay tenant/i);
  });

  it('runWithTenant expone el tenantId dentro del scope', () => {
    const result = runWithTenant('tenant-A', () => getTenantId());
    expect(result).toBe('tenant-A');
  });

  it('requireTenantId devuelve el id dentro del scope', () => {
    const result = runWithTenant('tenant-A', () => requireTenantId());
    expect(result).toBe('tenant-A');
  });

  it('el scope no se filtra hacia afuera', () => {
    runWithTenant('tenant-A', () => getTenantId());
    expect(getTenantId()).toBeNull();
  });

  it('los scopes anidados se aíslan (el interno no pisa al externo)', () => {
    const trace: Array<string | null> = [];
    runWithTenant('outer', () => {
      trace.push(getTenantId()); // outer
      runWithTenant('inner', () => {
        trace.push(getTenantId()); // inner
      });
      trace.push(getTenantId()); // outer otra vez
    });
    expect(trace).toEqual(['outer', 'inner', 'outer']);
  });

  it('mantiene el tenant a través de un await asincrónico', async () => {
    const result = await runWithTenant('tenant-async', async () => {
      await new Promise((r) => setTimeout(r, 5));
      return getTenantId();
    });
    expect(result).toBe('tenant-async');
  });

  it('runWithTenant(null) deja el contexto sin tenant', () => {
    const id = runWithTenant(null, () => getTenantId());
    expect(id).toBeNull();
    expect(() => runWithTenant(null, () => requireTenantId())).toThrow();
  });
});
