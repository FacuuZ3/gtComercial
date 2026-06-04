# Changelog

Todos los cambios notables al proyecto se documentan acá.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y
versionado siguiendo [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Seguridad
- Actualizado Next.js de 14.1.0 a 14.2.35 (mitiga CVE-2025-29927:
  middleware authorization bypass). Vulnerabilidades reportadas por
  `npm audit` bajan de 39 a 8.

### Corregido
- `useSearchParams()` en `/verify-email` y `/reset-password` ahora va
  envuelto en `<Suspense>`, requisito de Next.js 14 para prerender SSG.

### Documentación
- Agregado `docs/ROADMAP.md` con hitos v0.2, v0.3 y v0.4.
- Agregado `CHANGELOG.md` siguiendo Keep a Changelog.

### Por agregar
- Integración con MercadoPago Checkout Pro (P0.1).
- Multi-tenant con scoping por subdomain (P0.2).
- Página de marketing pública (P0.4).

## [0.1.0] — 2026-06-03

### Agregado
- Bootstrap inicial del proyecto.
- Backend NestJS 10 con módulos: auth, users, courts, reservations,
  recurring-reservations, club-info, notifications, audit, health.
- Frontend Next.js 14 (App Router) con dark mode, dashboards de USER y ADMIN.
- Base de datos PostgreSQL 16 con Prisma ORM.
- Control de concurrencia con Serializable Snapshot Isolation + SELECT FOR UPDATE.
- Autenticación JWT dual (access + refresh tokens) con bcrypt.
- Sistema de notificaciones extensible (patrón Strategy).
- Audit log de acciones administrativas.
- Health checks (liveness + readiness) con @nestjs/terminus.
- Logs estructurados con Winston.
- Tests unitarios con Jest.
- Tests E2E con Playwright.
- CI con GitHub Actions.
- Docker Compose para desarrollo local.

[Unreleased]: https://github.com/USER/REPO/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/USER/REPO/releases/tag/v0.1.0
