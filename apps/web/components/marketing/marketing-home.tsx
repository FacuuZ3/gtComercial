/**
 * MarketingHome
 * ---------------------------------------------------------------------------
 * Página pública que vende la PLATAFORMA (no un complejo). Se muestra en el
 * dominio raíz (sin subdominio de complejo). Su objetivo es que un dueño de
 * complejo entienda la propuesta y se registre en /onboarding.
 *
 * Server Component — sin estado ni interactividad (solo links).
 */

import Link from 'next/link';
import {
  CalendarCheck,
  ShieldCheck,
  LayoutDashboard,
  Bell,
  Building2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/brand';

export function MarketingHome() {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-950">
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FinalCta />
      <MarketingFooter />
    </div>
  );
}

// ============================================================================
//  HERO
// ============================================================================

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-white to-zinc-50 dark:from-brand-900/20 dark:via-zinc-950 dark:to-zinc-950" />
      <div className="container py-24 text-center lg:py-32">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3 py-1 text-xs font-medium text-brand-800 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-pulse" />
          Reservas online para complejos deportivos
        </span>

        <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tighter text-zinc-950 md:text-7xl dark:text-zinc-50">
          El sistema de turnos
          <br />
          <span className="text-brand-700 dark:text-brand-400">de tu complejo.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-[60ch] text-base leading-relaxed text-zinc-600 md:text-lg dark:text-zinc-400">
          {APP_NAME} es la plataforma para que tu complejo de pádel reciba
          reservas online, sin llamados ni planillas. Tus clientes eligen
          horario y confirman; vos administrás todo desde un panel.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/onboarding">
            <Button size="lg">Registrá tu complejo gratis</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Ya tengo cuenta
            </Button>
          </Link>
        </div>

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          Sin tarjeta. Configurás tus canchas y empezás a recibir reservas hoy.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
//  FEATURES
// ============================================================================

const FEATURES = [
  {
    icon: CalendarCheck,
    title: 'Reservas online 24/7',
    text: 'Tus clientes reservan desde el celular cuando quieran. Confirmación inmediata por email.',
  },
  {
    icon: ShieldCheck,
    title: 'Sin turnos duplicados',
    text: 'El sistema bloquea automáticamente los horarios ocupados, incluso con reservas simultáneas.',
  },
  {
    icon: LayoutDashboard,
    title: 'Panel de administración',
    text: 'Gestioná canchas, turnos fijos, precios y mirá estadísticas de ocupación e ingresos.',
  },
  {
    icon: Bell,
    title: 'Recordatorios automáticos',
    text: 'Tus clientes reciben un recordatorio antes del turno. Menos ausencias, más ocupación.',
  },
];

function Features() {
  return (
    <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="container py-20">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-brand-700 dark:text-brand-400">
            / por qué {APP_NAME}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl dark:text-zinc-50">
            Todo lo que tu complejo necesita
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
//  HOW IT WORKS
// ============================================================================

const STEPS = [
  {
    n: '01',
    title: 'Registrá tu complejo',
    text: 'Creás tu cuenta y tu complejo en menos de un minuto. Sin instalaciones.',
  },
  {
    n: '02',
    title: 'Cargá tus canchas',
    text: 'Definís canchas, horarios, precios y turnos fijos desde el panel.',
  },
  {
    n: '03',
    title: 'Recibí reservas',
    text: 'Compartís tu link y tus clientes empiezan a reservar online.',
  },
];

function HowItWorks() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container py-20">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-brand-700 dark:text-brand-400">
            / cómo funciona
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl dark:text-zinc-50">
            Empezás en 3 pasos
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              <span className="font-mono text-5xl font-semibold text-brand-200 dark:text-brand-900">
                {s.n}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
//  PRICING (teaser)
// ============================================================================

const PLAN_INCLUYE = [
  'Reservas online ilimitadas',
  'Canchas y turnos fijos ilimitados',
  'Panel de administración y estadísticas',
  'Recordatorios automáticos por email',
];

function Pricing() {
  return (
    <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="container py-20">
        <div className="mx-auto max-w-md rounded-3xl border border-zinc-200 bg-zinc-50/50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="font-mono text-xs uppercase tracking-widest text-brand-700 dark:text-brand-400">
            / empezá gratis
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Plan inicial
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Probá la plataforma sin costo mientras armás tu complejo.
          </p>

          <ul className="mt-6 space-y-3 text-left">
            {PLAN_INCLUYE.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600" />
                {item}
              </li>
            ))}
          </ul>

          <Link href="/onboarding" className="mt-8 block">
            <Button size="lg" className="w-full">
              Crear mi complejo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
//  FINAL CTA
// ============================================================================

function FinalCta() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container py-20 text-center">
        <Building2 className="mx-auto h-10 w-10 text-brand-600" />
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl dark:text-zinc-50">
          ¿Listo para digitalizar tu complejo?
        </h2>
        <p className="mx-auto mt-3 max-w-[50ch] text-sm text-zinc-600 dark:text-zinc-400">
          Sumate a {APP_NAME} y empezá a recibir reservas online hoy mismo.
        </p>
        <div className="mt-6">
          <Link href="/onboarding">
            <Button size="lg">Registrá tu complejo gratis</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
//  FOOTER
// ============================================================================

function MarketingFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container flex flex-col items-center justify-between gap-3 py-10 text-xs text-zinc-500 sm:flex-row dark:text-zinc-400">
        <span>© {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.</span>
        <nav className="flex items-center gap-x-6">
          <Link href="/login" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Ingresar
          </Link>
          <Link href="/onboarding" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Registrar complejo
          </Link>
        </nav>
      </div>
    </footer>
  );
}
