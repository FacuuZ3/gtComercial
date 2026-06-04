# Roadmap

> Hoja de ruta del producto. Las prioridades se revisan cada 2 semanas.

## Estado actual

**Versión:** `0.1.0` (alpha, sin clientes en producción).

**Lo que está listo:**
- Reservas con control de concurrencia (SSI).
- Autenticación JWT dual (access + refresh) + verificación por email.
- Panel ADMIN: canchas, turnos puntuales, turnos fijos, estadísticas.
- Notificaciones por email (interfaz extensible a otros canales).
- Audit log de acciones administrativas.
- Health checks (liveness + readiness).
- CI con GitHub Actions.
- Tests unitarios + E2E (Playwright).
- Dark mode, responsivo móvil.

---

## Próximos hitos

### 🎯 v0.2 — MVP vendible (4-6 semanas)

Lo mínimo para cobrarle al primer cliente.

| # | Feature | Estado | Estimado |
|---|---|---|---|
| P0.1 | Pagos online con MercadoPago Checkout Pro | ⏳ | 2 semanas |
| P0.2 | Multi-tenant (cada complejo aislado, scoping por subdomain o header) | ⏳ | 2 semanas |
| P0.3 | Onboarding self-service del cliente ADMIN | ⏳ | 3 días |
| P0.4 | Página de marketing pública (landing /pricing /demo /contacto) | ⏳ | 1 semana |
| P0.5 | Términos y Condiciones + Política de Privacidad | ⏳ | 1 día |
| P0.6 | Deploy real (API en Railway, Web en Vercel, DB en Neon) | ⏳ | 2 días |
| P0.7 | Dominio + email institucional | ⏳ | 1 día |

### 🚀 v0.3 — Diferenciación (4-6 semanas)

Lo que nos separa de las opciones existentes (Bookpadel, Padelmanager).

| # | Feature | Estado | Estimado |
|---|---|---|---|
| P1.1 | Recordatorios por WhatsApp (canal Strategy) | ⏳ | 1 semana |
| P1.2 | Lista de espera para slots ocupados | ⏳ | 1 semana |
| P1.3 | Dashboard ampliado: heatmap de ocupación, ranking de clientes, ingresos estimados | ⏳ | 1 semana |
| P1.4 | Compartir reserva por link público | ⏳ | 2 días |
| P1.5 | Calificación de la cancha post-juego | ⏳ | 3 días |
| P1.6 | Multi-deporte (tenis, fútbol 5) | ⏳ | 1 semana |

### 🌟 v0.4 — Plataforma (3-4 meses)

Lo que nos convierte en plataforma SaaS escalable.

| # | Feature | Estado | Estimado |
|---|---|---|---|
| P2.1 | App móvil (React Native) | ⏳ | 8 semanas |
| P2.2 | API pública + webhooks para terceros | ⏳ | 2 semanas |
| P2.3 | Plan freemium + facturación recurrente (Stripe Billing o MP) | ⏳ | 3 semanas |
| P2.4 | Marketplace público de complejos | ⏳ | 4 semanas |
| P2.5 | Reservas grupales con split de pago (estilo Playtomic) | ⏳ | 4 semanas |

### 🔮 Backlog (sin orden)

- 2FA / MFA para ADMIN.
- Cupones de descuento y promociones.
- Programa de fidelidad con puntos.
- Predicción de demanda con ML simple.
- Sistema de torneos.
- i18n (ES / EN / PT).
- Login social (Google OAuth).
- Modo "vista pública" del calendario semanal sin login.

---

## Mejoras técnicas en paralelo

- [ ] `next/image` en lugar de `<img>` (LCP).
- [ ] Outbox pattern real para eventos de dominio.
- [ ] Background jobs con BullMQ + Redis.
- [ ] Redis cache de disponibilidad (TTL 30s).
- [ ] Tests de integración con testcontainers.
- [ ] OpenTelemetry + Sentry para observabilidad.
- [ ] ADRs formales en `docs/adr/`.

---

## Cómo se priorizan los items

1. **¿Bloquea cobrar?** → P0.
2. **¿Diferencia frente a competencia?** → P1.
3. **¿Escala / abre nuevos canales de venta?** → P2.
4. **¿Es deuda técnica que va a frenar algo de arriba?** → priorizar antes del item afectado.
