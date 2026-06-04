/**
 * Tenant Context (AsyncLocalStorage)
 * ---------------------------------------------------------------------------
 * Provee el `tenantId` del request actual en cualquier capa de la aplicación
 * sin tener que pasarlo manualmente por parámetros a través de toda la pila.
 *
 * Se apoya en AsyncLocalStorage de Node: el TenantMiddleware abre un "scope"
 * por request y todo lo que se ejecute dentro (guards, controllers, services)
 * puede leer el tenant actual con getTenantId() / requireTenantId().
 *
 * El store es un objeto mutable: el middleware lo inicializa con el tenant
 * resuelto del subdominio/header (cubre rutas públicas), y la JwtStrategy lo
 * sobreescribe con el tenant del token cuando el request está autenticado
 * (el token es la fuente de verdad para usuarios logueados).
 */

import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantStore {
  /** Tenant resuelto para el request. null si aún no se resolvió. */
  tenantId: string | null;
}

const storage = new AsyncLocalStorage<TenantStore>();

/** Ejecuta `fn` dentro de un nuevo scope de tenant. */
export function runWithTenant<T>(tenantId: string | null, fn: () => T): T {
  return storage.run({ tenantId }, fn);
}

/** Devuelve el tenantId del scope actual, o null si no hay. */
export function getTenantId(): string | null {
  return storage.getStore()?.tenantId ?? null;
}

/**
 * Devuelve el tenantId del scope actual o lanza si no hay.
 * Usar en operaciones que SIEMPRE deben estar scopeadas a un tenant
 * (creación de canchas, reservas, etc.).
 */
export function requireTenantId(): string {
  const id = getTenantId();
  if (!id) {
    throw new Error(
      'TenantContext: no hay tenant en el contexto actual. ' +
        '¿Falta el TenantMiddleware o el request no está scopeado a un tenant?',
    );
  }
  return id;
}
