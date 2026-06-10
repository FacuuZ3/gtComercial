/**
 * Layout y bloques compartidos de las páginas legales
 * (/terminos y /privacidad).
 */

import * as React from 'react';

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container max-w-3xl py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-brand-700 dark:text-brand-400">
        / legal
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl dark:text-zinc-50">
        {title}
      </h1>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Última actualización: {updated}
      </p>
      <div className="mt-8 space-y-8">{children}</div>
    </div>
  );
}

export function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {n}. {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {children}
      </p>
    </section>
  );
}
