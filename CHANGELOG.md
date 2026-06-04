# Changelog

Todos los cambios notables al proyecto se documentan acá.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y
versionado siguiendo [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

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
