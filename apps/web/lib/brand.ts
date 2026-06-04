/**
 * Branding de la plataforma.
 * ---------------------------------------------------------------------------
 * Nombre genérico del SaaS, configurable por variable de entorno. Se usa como
 * marca de la PLATAFORMA (no de cada complejo). Donde se muestra la marca al
 * cliente final de un complejo, debe usarse el nombre del complejo (tenant),
 * cayendo a este valor solo como fallback.
 *
 * Para cambiar el nombre, setear NEXT_PUBLIC_APP_NAME en el entorno; no hace
 * falta tocar código.
 */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'Reservá';
