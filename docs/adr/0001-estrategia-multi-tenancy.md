# ADR 0001 — Estrategia de Multi-Tenancy

- **Estado:** ✅ Aceptado — Opción A (Shared DB + `tenantId`), identificación
  por subdominio con fallback a header en desarrollo.
- **Fecha:** 2026-06-04
- **Decisores:** Facundo Ferreyra
- **Contexto técnico:** El sistema nació como single-tenant (un solo complejo).
  Para venderlo como SaaS a múltiples clubes, cada cliente (tenant) debe ver y
  operar únicamente sus propios datos.

---

## 1. Problema

Hoy todas las entidades son globales: existe **un** conjunto de canchas, **un**
conjunto de reservas, **una** fila de `ClubInfo`. Si dos complejos usaran la
misma instancia, verían y modificarían los datos del otro.

Además hay un bloqueo concreto en el modelo actual:

- `User.email` es `@unique` **global**. Un mismo email (ej. un entrenador que
  trabaja en dos clubes) no podría tener cuenta en ambos.
- `ClubInfo` es un **singleton** (`id = "default"`). Debe pasar a ser uno por
  tenant.

Para vender el producto a más de un cliente sin desplegar una copia separada
por cada uno (insostenible operativamente), necesitamos **aislamiento de datos
por tenant**.

---

## 2. Opciones evaluadas

### Opción A — Shared Database, Shared Schema (columna discriminadora)

Todas las tablas ganan una columna `tenantId`. Cada query se filtra por el
tenant del usuario autenticado. Una sola base de datos, un solo esquema.

```
┌─────────────────────────────────────────┐
│  Base de datos única                     │
│  ┌─────────────────────────────────────┐ │
│  │ courts                              │ │
│  │  id | tenantId | name | ...         │ │
│  │  c1 | club-A    | Cancha 1          │ │
│  │  c2 | club-A    | Cancha 2          │ │
│  │  c3 | club-B    | Pista Central     │ │  ← filtrado por tenantId
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Pros**
- La más simple de operar: una sola DB, una sola migración, un solo backup.
- Costo de infraestructura mínimo (ideal para arrancar con pocos clientes).
- Onboarding de un cliente nuevo = insertar una fila en `tenants`. Instantáneo.
- Es el approach con el que nacen la mayoría de los SaaS B2B (Stripe, Shopify
  en sus inicios, etc.).

**Contras**
- El aislamiento depende del **código**: si una query olvida el filtro
  `tenantId`, hay fuga de datos entre clientes. Se mitiga con Prisma Client
  Extensions (middleware que inyecta el filtro automáticamente) + tests.
- "Noisy neighbor": un cliente con muchísimo tráfico afecta a los demás (no es
  problema con pocos clientes).
- Un cliente no puede pedir "quiero mi base separada" sin migración.

### Opción B — Shared Database, Schema-per-Tenant

Una sola base de datos PostgreSQL, pero cada tenant tiene su propio **schema**
(`club_a.courts`, `club_b.courts`).

**Pros**
- Aislamiento más fuerte que A (a nivel de schema de Postgres).
- Backup/restore selectivo por tenant es posible.

**Contras**
- Las migraciones se multiplican: hay que correr cada cambio de schema en N
  schemas. Prisma **no** soporta esto de forma nativa y cómoda.
- Complejidad operativa alta para el beneficio que da con pocos clientes.
- Postgres degrada con miles de schemas.

### Opción C — Database-per-Tenant

Cada cliente, su propia base de datos (y string de conexión).

**Pros**
- Aislamiento máximo. Cumple requisitos enterprise/compliance estrictos.
- "Noisy neighbor" eliminado. Backup/restore/borrado por cliente trivial.

**Contras**
- Operativamente la más cara y compleja: N bases, N backups, N migraciones,
  pooling de conexiones complejo.
- Sobre-ingeniería absoluta para la etapa actual (0 clientes).
- Onboarding lento (provisionar una DB nueva por cliente).

---

## 3. Decisión recomendada

> **Opción A — Shared Database, Shared Schema con columna `tenantId`.**

Es el estándar de industria para un SaaS B2B que arranca. Permite onboarding
instantáneo, costo mínimo, y una sola base que administrar. El riesgo de fuga
de datos se neutraliza con una **Prisma Client Extension** que inyecta el filtro
`tenantId` en *todas* las queries automáticamente — el código de aplicación no
puede "olvidarse" del filtro porque no lo escribe a mano.

Si en el futuro un cliente enterprise exige base dedicada, se migra **ese**
tenant a Opción C de forma puntual, sin rehacer todo.

---

## 4. Plan de implementación (Opción A)

### Fase 1 — Modelo de datos
1. Nuevo modelo `Tenant` (id, nombre, slug único, plan, estado, createdAt).
2. Agregar `tenantId` (FK → Tenant) a: `User`, `Court`, `Reservation`,
   `RecurringReservation`, `AuditLog`, `ClubInfo`.
3. Cambiar `User.email`: de `@unique` global a `@@unique([tenantId, email])`.
4. `ClubInfo`: de singleton a uno por tenant (`@@unique([tenantId])`).
5. Índices: anteponer `tenantId` a los índices compuestos existentes
   (ej. `[tenantId, courtId, startTime, endTime]`).
6. Migración de datos: crear un tenant "default" y asignar todas las filas
   existentes a él (para no perder los datos del seed/demo).

### Fase 2 — Resolución del tenant (request scoping)
7. Estrategia de identificación del tenant en cada request. Opciones:
   - **Subdominio**: `clubA.miapp.com` → tenant `clubA`. (recomendado, limpio)
   - Header `X-Tenant-Id`.
   - Path prefix `/t/clubA/...`.
8. Middleware/Guard que resuelve el tenant y lo agrega al request context
   (usando `AsyncLocalStorage` para que esté disponible en toda la cadena).
9. El JWT incluye `tenantId` en el payload (ya emitimos `sub`, `email`, `role`
   en `AuthService.signTokens` — se suma `tenantId`).

### Fase 3 — Aislamiento automático en Prisma
10. **Prisma Client Extension** que:
    - En lecturas: inyecta `where: { tenantId }` automáticamente.
    - En escrituras: setea `tenantId` automáticamente.
    - Lee el tenant actual desde el `AsyncLocalStorage`.
11. Esto evita tocar las 11 services una por una con filtros manuales.

### Fase 4 — Onboarding y autenticación
12. Endpoint de registro de **complejo** (no de usuario): crea Tenant + primer
    usuario ADMIN + `ClubInfo` vacío. Self-service.
13. Ajustar `register`/`login`: el email se valida dentro del tenant, no global.
14. Página pública de alta de complejo (parte de P0.4 - marketing).

### Fase 5 — Verificación
15. Tests de aislamiento: crear 2 tenants, verificar que A no ve datos de B en
    cada endpoint crítico (reservas, canchas, usuarios, stats, audit).
16. Test de que el filtro automático no se puede saltear.

---

## 5. Impacto

- **Archivos afectados:** schema.prisma (+1 migración), módulo nuevo `tenants`,
  `auth` (payload JWT + onboarding), `prisma.service` (extension), un middleware
  nuevo, y validación de que las 11 services heredan el filtro automático.
- **Breaking change:** sí, a nivel de datos (requiere migración). Como todavía
  no hay clientes en producción, el momento es **ahora** (cuanto antes, más
  barato).
- **Estimación:** 1.5 a 2 semanas de trabajo enfocado.

---

## 6. Decisión pendiente del propietario

Antes de ejecutar, se requiere confirmar:

1. **Estrategia de aislamiento** → recomendado: Opción A.
2. **Método de identificación del tenant** → recomendado: subdominio
   (`club.miapp.com`), con fallback a header en desarrollo local.

Una vez confirmado, se ejecuta la Fase 1 (modelo de datos + migración) como
primer paso reversible y verificable.
