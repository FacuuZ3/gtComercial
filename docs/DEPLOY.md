# Guía de Deploy a Producción

> Stack de deploy recomendado, gratuito para empezar. Cada paso indica si lo
> hacés vos (en el navegador) o si ya está resuelto en el código.

## Arquitectura del deploy

```
   Cliente
     │
     ├─ tudominio.com           → Frontend (Next.js) ─┐
     ├─ norte.tudominio.com     → Frontend (Next.js) ─┤→  Vercel
     ├─ sur.tudominio.com       → Frontend (Next.js) ─┘
     │
     └─ (las páginas llaman a) → api.tudominio.com → Backend (NestJS) → Railway
                                                          │
                                                          └→ PostgreSQL → Neon
```

| Pieza | Plataforma | Costo inicial |
|---|---|---|
| Frontend Next.js | **Vercel** | Gratis |
| Backend NestJS | **Railway** | Gratis (con límite de horas) |
| PostgreSQL | **Neon** | Gratis |
| Dominio | NIC.ar / Namecheap | ~$10-15/año |

Todas las cuentas se crean con tu **GitHub** (un clic).

---

## Prerequisitos

1. El repo `gtComercial` en GitHub (✅ ya está).
2. Un **dominio comprado** (depende de la marca definitiva — ver tarea pendiente).
3. Cuenta de GitHub (✅).

---

## Paso 1 — Base de datos (Neon)

1. Entrá a **https://neon.tech** → "Sign up with GitHub".
2. "Create project" → nombre `gtcomercial`, región más cercana (ej. AWS São Paulo).
3. Copiá el **connection string** que te da (empieza con `postgresql://...`).
   Guardalo: es tu `DATABASE_URL` de producción.
4. Listo. Neon ya tiene la base creada y vacía; las migraciones se aplican
   en el Paso 2.

---

## Paso 2 — Backend (Railway)

1. Entrá a **https://railway.app** → "Login with GitHub".
2. "New Project" → "Deploy from GitHub repo" → elegí `gtComercial`.
3. Railway detecta el monorepo. Configurá el servicio del backend:
   - **Root Directory**: `apps/api`
   - **Build**: usa el `Dockerfile` que ya existe en `apps/api/`.
4. En "Variables", cargá las variables de producción (ver tabla abajo).
   Importante: `DATABASE_URL` = el connection string de Neon (Paso 1).
5. En "Settings" → "Deploy", agregá el comando de migración antes del start,
   o ejecutá una vez manualmente desde la consola de Railway:
   ```
   npx prisma migrate deploy
   ```
6. Railway te da una URL tipo `https://gtcomercial-api.up.railway.app`.
   Esa es tu API. Más adelante la mapeás a `api.tudominio.com`.

### Seed inicial (opcional, para datos demo)
Desde la consola de Railway:
```
npm run seed
```

---

## Paso 3 — Frontend (Vercel)

1. Entrá a **https://vercel.com** → "Continue with GitHub".
2. "Add New Project" → importá `gtComercial`.
3. Configurá:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: Next.js (lo detecta solo).
4. En "Environment Variables", cargá:
   - `NEXT_PUBLIC_API_URL` = la URL de la API de Railway (Paso 2).
   - `NEXT_PUBLIC_APP_NAME` = el nombre de la plataforma (ej. el definitivo).
   - (NO hace falta `NEXT_PUBLIC_DEFAULT_TENANT` en prod: el tenant sale del
     subdominio.)
5. "Deploy". Vercel te da `https://gtcomercial.vercel.app`.

---

## Paso 4 — Dominio + DNS (subdominios wildcard)

El multi-tenant necesita que **cualquier subdominio** (`norte.`, `sur.`, ...)
apunte al frontend. Eso se hace con un registro **wildcard**.

1. Comprá el dominio (ej. en **nic.ar** para `.com.ar`, o Namecheap para `.com`).
2. En **Vercel** → tu proyecto → "Settings" → "Domains":
   - Agregá `tudominio.com`.
   - Agregá `*.tudominio.com` (wildcard, cubre todos los complejos).
3. Vercel te dice qué registros DNS cargar en tu proveedor de dominio:
   - Un registro `A` o `CNAME` para `tudominio.com`.
   - Un registro `CNAME` `*` → `cname.vercel-dns.com` (wildcard).
4. En **Railway** → tu servicio API → "Settings" → "Networking" → "Custom Domain":
   - Agregá `api.tudominio.com`. Railway te da un CNAME para cargar en el DNS.
5. Actualizá las variables de producción con el dominio real:
   - Railway: `FRONTEND_URL` = `https://tudominio.com`, `APP_URL` = `https://api.tudominio.com`.
   - Vercel: `NEXT_PUBLIC_API_URL` = `https://api.tudominio.com`.
6. Re-deploy de ambos para tomar las variables nuevas.

> El CORS del backend ya acepta el dominio y **todos sus subdominios**
> automáticamente (ver `buildCorsOrigin` en `apps/api/src/main.ts`), así que
> no hay que listar cada complejo.

---

## Variables de entorno de producción (Backend / Railway)

| Variable | Valor | Notas |
|---|---|---|
| `NODE_ENV` | `production` | |
| `PORT` | `3001` | Railway puede sobreescribirlo; usa el que provee. |
| `APP_URL` | `https://api.tudominio.com` | |
| `FRONTEND_URL` | `https://tudominio.com` | Base para el CORS (incluye subdominios). |
| `APP_NAME` | El nombre definitivo | Branding de Swagger y emails. |
| `DATABASE_URL` | El de Neon | `postgresql://...` |
| `JWT_ACCESS_SECRET` | 64+ chars aleatorios | Generá uno nuevo (no el de dev). |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | |
| `JWT_REFRESH_SECRET` | 64+ chars aleatorios, distinto | |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASSWORD` / `MAIL_FROM` | SMTP real | Ej. una cuenta de envío (Resend, SendGrid, Gmail App Password). |
| `THROTTLE_TTL` / `THROTTLE_LIMIT` | `60` / `10` | |

### Generar secrets JWT
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Corré ese comando dos veces (uno por cada secret).

## Variables de entorno de producción (Frontend / Vercel)

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.tudominio.com` |
| `NEXT_PUBLIC_APP_NAME` | El nombre definitivo |

---

## Checks post-deploy

1. `https://api.tudominio.com/api/health` → debe responder `ok`.
2. `https://tudominio.com` → página de marketing.
3. Crear un complejo en `https://tudominio.com/onboarding`.
4. Si elegiste slug `demo`, entrar a `https://demo.tudominio.com` → su landing.
5. Login en el panel del complejo y crear una cancha.

---

## Notas

- **Free tier de Railway**: el backend puede "dormir" tras inactividad en
  algunos planes; el primer request lo despierta (unos segundos). Para un
  cliente real conviene el plan pago (~USD 5/mes) que lo mantiene activo.
- **Neon free**: la base también puede suspenderse por inactividad; se reactiva
  sola al primer query.
- **Emails**: en dev se simulan si no hay SMTP. En producción configurá un
  proveedor real (Resend tiene free tier generoso) para que lleguen los emails
  de verificación y recordatorios.
- **CI**: el workflow de GitHub Actions ya corre build + tests en cada push,
  así que Vercel/Railway sólo deployan si el código está sano.
