# Pádel SaaS

> Plataforma SaaS de gestión y reserva de turnos para complejos deportivos.

![Node](https://img.shields.io/badge/node-20.x-339933?logo=node.js)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![Postgres](https://img.shields.io/badge/Postgres-16-336791?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/license-Proprietary-red)

**⚠️ Software propietario.** Este repositorio es privado y su contenido está
protegido por copyright. Ver [LICENSE](./LICENSE) para más información.

---

## Producto

Plataforma web full-stack para que complejos deportivos digitalicen su gestión
de reservas. Pensada inicialmente para canchas de pádel, con arquitectura
preparada para múltiples deportes (tenis, fútbol 5).

**Características principales:**

- 🗓️ Reserva de turnos online con confirmación inmediata.
- 🔐 Autenticación con verificación por email, refresh tokens y roles.
- 🏟️ Panel administrativo para canchas, turnos puntuales y turnos fijos.
- 📧 Notificaciones automáticas por email (canal extensible a WhatsApp/SMS).
- ⚡ Control de concurrencia con Serializable Snapshot Isolation:
  cero reservas duplicadas bajo carga concurrente.
- 📊 Dashboard con métricas operativas para el complejo.
- 🌗 Dark mode nativo, responsivo móvil.
- 🩺 Health checks, audit log y logs estructurados listos para producción.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui |
| Estado servidor | TanStack Query |
| Formularios | React Hook Form + Zod |
| Backend | NestJS 10, TypeScript, Passport JWT |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL 16 |
| Notificaciones | Nodemailer (extensible a WhatsApp/SMS) |
| Tests | Jest (unit) + Playwright (E2E) |
| CI | GitHub Actions |
| Infraestructura | Docker + docker-compose |

## Estructura

```
padel-saas/
├── apps/
│   ├── api/   ← Backend NestJS + Prisma + PostgreSQL
│   └── web/   ← Frontend Next.js 14
├── docker-compose.yml
└── README.md
```

## Desarrollo local

```bash
# 1. Variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# 2. Postgres en Docker
docker compose up -d postgres

# 3. Backend
cd apps/api
npm install
npx prisma migrate dev
npm run seed
npm run start:dev   # http://localhost:3001

# 4. Frontend (en otra terminal)
cd apps/web
npm install
npm run dev         # http://localhost:3000
```

## Roadmap (alto nivel)

- [ ] Integración de pagos (MercadoPago).
- [ ] Multi-tenant (cada complejo aislado).
- [ ] Lista de espera para turnos ocupados.
- [ ] Recordatorios por WhatsApp.
- [ ] App móvil (React Native).
- [ ] Plan freemium + pricing.

Ver [docs/ROADMAP.md](./docs/ROADMAP.md) para el detalle priorizado.

## Licencia

Software propietario. © 2026 Facundo Ferreyra. Todos los derechos reservados.

Para consultas comerciales: **facuferreyrazz3@gmail.com**
