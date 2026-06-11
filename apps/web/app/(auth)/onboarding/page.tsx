/**
 * /onboarding — alta self-service de un complejo (tenant) + su administrador.
 * ---------------------------------------------------------------------------
 * Crea el complejo en el backend (POST /auth/onboard), guarda la sesión del
 * admin recién creado y lo lleva directo a su panel.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api, ApiError } from '@/lib/api';
import { saveSession } from '@/lib/auth';
import { onboardSchema, OnboardValues } from '@/lib/schemas';
import { LoginResponse } from '@/lib/types';

/** Convierte un nombre en un slug sugerido (minúsculas, guiones, sin tildes). */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // saca tildes
    .replace(/[^a-z0-9]+/g, '-') // no-alfanum → guion
    .replace(/^-+|-+$/g, '') // sin guiones en los extremos
    .slice(0, 40);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  // Mientras el usuario no edite el slug a mano, lo autocompletamos del nombre.
  const [slugTouched, setSlugTouched] = React.useState(false);

  const form = useForm<OnboardValues>({
    resolver: zodResolver(onboardSchema),
    defaultValues: {
      complexName: '',
      slug: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      adminPhone: '',
    },
  });

  const complexName = form.watch('complexName');
  React.useEffect(() => {
    if (!slugTouched) {
      form.setValue('slug', slugify(complexName), { shouldValidate: true });
    }
  }, [complexName, slugTouched, form]);

  const onSubmit = async (values: OnboardValues) => {
    setServerError(null);
    try {
      const res = await api<LoginResponse>('/auth/onboard', {
        method: 'POST',
        anonymous: true,
        body: {
          complexName: values.complexName,
          slug: values.slug,
          adminName: values.adminName,
          adminEmail: values.adminEmail,
          adminPassword: values.adminPassword,
          adminPhone: values.adminPhone || undefined,
        },
      });
      // Sesión iniciada como admin del complejo recién creado.
      saveSession(
        { accessToken: res.accessToken, refreshToken: res.refreshToken },
        res.user,
      );
      router.push('/dashboard/admin');
      router.refresh();
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : 'Error inesperado.');
    }
  };

  const slug = form.watch('slug');

  return (
    <div className="container flex min-h-[calc(100dvh-4rem)] items-center justify-center py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <p className="font-mono text-[11px] uppercase tracking-widest text-brand-700">
            / nuevo complejo
          </p>
          <CardTitle className="mt-2 text-2xl">Registrá tu complejo</CardTitle>
          <CardDescription>
            Creá tu complejo y tu cuenta de administrador. Después vas a poder
            cargar tus canchas, horarios y empezar a recibir reservas.
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <Field
              id="complexName"
              label="Nombre del complejo"
              error={form.formState.errors.complexName?.message}
            >
              <Input
                id="complexName"
                placeholder="Ej.: Complejo Pádel Norte"
                {...form.register('complexName')}
              />
            </Field>

            <Field
              id="slug"
              label="Identificador (subdominio)"
              error={form.formState.errors.slug?.message}
              hint={slug ? `Tu complejo tendrá su propia dirección web: ${slug}.tudominio` : 'Solo minúsculas, números y guiones.'}
            >
              <Input
                id="slug"
                placeholder="norte"
                {...form.register('slug', {
                  onChange: () => setSlugTouched(true),
                })}
              />
            </Field>

            <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                / tu cuenta de administrador
              </p>

              <div className="space-y-4">
                <Field
                  id="adminName"
                  label="Nombre y apellido"
                  error={form.formState.errors.adminName?.message}
                >
                  <Input id="adminName" autoComplete="name" {...form.register('adminName')} />
                </Field>
                <Field
                  id="adminEmail"
                  label="Email"
                  error={form.formState.errors.adminEmail?.message}
                >
                  <Input
                    id="adminEmail"
                    type="email"
                    autoComplete="email"
                    {...form.register('adminEmail')}
                  />
                </Field>
                <Field
                  id="adminPhone"
                  label="Teléfono (opcional)"
                  error={form.formState.errors.adminPhone?.message}
                >
                  <Input
                    id="adminPhone"
                    inputMode="tel"
                    placeholder="+543482..."
                    autoComplete="tel"
                    {...form.register('adminPhone')}
                  />
                </Field>
                <Field
                  id="adminPassword"
                  label="Contraseña"
                  error={form.formState.errors.adminPassword?.message}
                  hint="Mínimo 8 caracteres."
                >
                  <Input
                    id="adminPassword"
                    type="password"
                    autoComplete="new-password"
                    {...form.register('adminPassword')}
                  />
                </Field>
              </div>
            </div>

            {serverError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {serverError}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
              Crear complejo
            </Button>
            <p className="text-center text-xs text-zinc-500">
              Al crear el complejo aceptás los{' '}
              <Link href="/terminos" className="font-medium text-brand-700 hover:underline">
                Términos y Condiciones
              </Link>{' '}
              y la{' '}
              <Link href="/privacidad" className="font-medium text-brand-700 hover:underline">
                Política de Privacidad
              </Link>
              .
            </p>
            <p className="text-xs text-zinc-500">
              ¿Ya tenés un complejo?{' '}
              <Link href="/login" className="font-medium text-brand-700 hover:underline">
                Ingresar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}
