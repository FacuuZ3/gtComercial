/**
 * ===========================================================================
 *  seed.ts - Carga de datos iniciales para entorno de desarrollo y pruebas.
 * ---------------------------------------------------------------------------
 *  Multi-tenant: crea DOS complejos (tenants) independientes para poder
 *  demostrar el aislamiento de datos:
 *
 *    Tenant "norte" (Complejo Pádel Norte)
 *      - 1 admin + 2 clientes
 *      - 2 canchas
 *      - 3 reservas de ejemplo
 *      - info del club
 *
 *    Tenant "sur" (Club Raqueta Sur)
 *      - 1 admin + 1 cliente
 *      - 1 cancha
 *      - 1 reserva de ejemplo
 *      - info del club
 *
 *  Idempotencia: usa upsert por (tenantId, email) y por slug de tenant.
 *
 *  Ejecución:
 *    npm run seed      (desde apps/api)
 * ===========================================================================
 */

import {
  PrismaClient,
  Prisma,
  Role,
  SportType,
  ReservationStatus,
  TenantPlan,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hash(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/** Fecha desplazada N días desde hoy, a la hora indicada (hora local). */
function dateInDays(days: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

interface SeedCourt {
  name: string;
  description: string;
  pricePerHour: number;
}

interface SeedTenantSpec {
  slug: string;
  name: string;
  plan: TenantPlan;
  adminEmail: string;
  clientEmails: string[];
  courts: SeedCourt[];
  clubAddress: string;
}

/**
 * Crea (o actualiza) un tenant completo con sus usuarios, canchas, reservas
 * de ejemplo e info del club. Todo lo creado lleva el tenantId correspondiente.
 */
async function seedTenant(spec: SeedTenantSpec): Promise<void> {
  const adminPassword = await hash('Admin123!');
  const userPassword = await hash('User123!');

  // 1) Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: spec.slug },
    update: { name: spec.name, plan: spec.plan },
    create: { slug: spec.slug, name: spec.name, plan: spec.plan },
  });
  console.log(`\n🏢  Tenant "${tenant.name}" (slug=${tenant.slug})`);

  // 2) Admin
  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: spec.adminEmail } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: `Administrador · ${spec.name}`,
      email: spec.adminEmail,
      password: adminPassword,
      phone: '+543482000000',
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  // 3) Clientes
  const clients = [];
  for (let i = 0; i < spec.clientEmails.length; i++) {
    const email = spec.clientEmails[i];
    const client = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: email.split('@')[0].replace(/\./g, ' '),
        email,
        password: userPassword,
        phone: `+54348211${i}${i}${i}${i}`,
        role: Role.USER,
        isEmailVerified: true,
      },
    });
    clients.push(client);
  }
  console.log(`   👤  ${1 + clients.length} usuarios (1 admin + ${clients.length} clientes)`);

  // 4) Canchas
  const courts = [];
  for (const c of spec.courts) {
    let court = await prisma.court.findFirst({
      where: { tenantId: tenant.id, name: c.name },
    });
    if (!court) {
      court = await prisma.court.create({
        data: {
          tenantId: tenant.id,
          name: c.name,
          sportType: SportType.PADEL,
          description: c.description,
          isActive: true,
          pricePerHour: c.pricePerHour,
        },
      });
    }
    courts.push(court);
  }
  console.log(`   🎾  ${courts.length} canchas`);

  // 5) Reservas de ejemplo (mañana). Idempotente: limpia las del día primero.
  const tomorrow = dateInDays(1, 0);
  const dayAfter = dateInDays(2, 0);
  await prisma.reservation.deleteMany({
    where: { tenantId: tenant.id, startTime: { gte: tomorrow, lt: dayAfter } },
  });

  const firstClient = clients[0];
  const reservations: Prisma.ReservationCreateManyInput[] = [
    {
      tenantId: tenant.id,
      userId: firstClient.id,
      courtId: courts[0].id,
      startTime: dateInDays(1, 9, 0),
      endTime: dateInDays(1, 10, 30),
      status: ReservationStatus.CONFIRMED,
      notes: 'Partido de práctica matutino.',
    },
  ];
  // Si hay 2do cliente y 2da cancha, agregamos otra reserva.
  if (clients[1] && courts[1]) {
    reservations.push({
      tenantId: tenant.id,
      userId: clients[1].id,
      courtId: courts[1].id,
      startTime: dateInDays(1, 16, 30),
      endTime: dateInDays(1, 18, 0),
      status: ReservationStatus.CONFIRMED,
      notes: 'Clase con profesor.',
    });
    reservations.push({
      tenantId: tenant.id,
      userId: firstClient.id,
      courtId: courts[0].id,
      startTime: dateInDays(1, 21, 0),
      endTime: dateInDays(1, 22, 30),
      status: ReservationStatus.PENDING,
      notes: 'Pendiente de confirmación del cuarto jugador.',
    });
  }
  await prisma.reservation.createMany({ data: reservations });
  console.log(`   📅  ${reservations.length} reservas de ejemplo`);

  // 6) Info del club (una por tenant)
  await prisma.clubInfo.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      address: spec.clubAddress,
      mapEmbedUrl: null,
      weekdayHours: '13:00 a 23:00',
      weekendHours: '13:00 a 23:00',
      holidayHours: '13:00 a 23:00',
      services: ['Wi-Fi', 'Vestuario', 'Bar / Restaurante', 'Estacionamiento'],
    },
  });
  console.log(`   🏟️   Info del club lista`);
}

async function main(): Promise<void> {
  console.log('🌱  Iniciando seed multi-tenant...');

  await seedTenant({
    slug: 'norte',
    name: 'Complejo Pádel Norte',
    plan: TenantPlan.PRO,
    adminEmail: 'admin@norte.local',
    clientEmails: ['juan.perez@example.com', 'maria.gomez@example.com'],
    courts: [
      {
        name: 'Cancha Norte',
        description: 'Cancha techada con paredes de blindex y césped sintético azul.',
        pricePerHour: 6000.0,
      },
      {
        name: 'Cancha Sur',
        description: 'Cancha al aire libre con iluminación LED y césped verde.',
        pricePerHour: 5500.0,
      },
    ],
    clubAddress: 'Av. San Martín 1234, Reconquista, Santa Fe',
  });

  await seedTenant({
    slug: 'sur',
    name: 'Club Raqueta Sur',
    plan: TenantPlan.BASIC,
    adminEmail: 'admin@sur.local',
    clientEmails: ['pedro.lopez@example.com'],
    courts: [
      {
        name: 'Pista Central',
        description: 'Cancha panorámica con vidrio en las cuatro paredes.',
        pricePerHour: 7000.0,
      },
    ],
    clubAddress: 'Belgrano 567, Avellaneda, Santa Fe',
  });

  console.log('\n✅  Seed multi-tenant completado.');
  console.log('   Credenciales: admin@norte.local / admin@sur.local  (pass: Admin123!)');
  console.log('   Clientes: juan.perez@example.com, etc.  (pass: User123!)');
}

main()
  .catch((error) => {
    console.error('❌  Error ejecutando el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
