/**
 * Slugs de tenant reservados por el sistema.
 * ---------------------------------------------------------------------------
 * Única fuente de verdad: la usan tanto el alta de complejos (onboard)
 * como la resolución de subdominios (TenantMiddleware). Mantener acá evita
 * que las dos listas diverjan.
 *
 * Criterio: subdominios que el sistema usa (o podría usar) para sí mismo y
 * que por lo tanto ningún complejo puede tomar.
 */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  'www',
  'api',
  'app',
  'admin',
  'localhost',
  'mail',
  'static',
  'cdn',
  'docs',
  'status',
]);
