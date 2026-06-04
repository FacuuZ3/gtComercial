/**
 * RootLayout: layout principal del App Router.
 */

import './globals.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-day-picker/dist/style.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';
import { APP_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `${APP_NAME} — Reservá tu cancha`,
  description: 'Gestión y reserva de turnos online para complejos deportivos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className={
          'min-h-screen font-sans antialiased ' +
          'bg-zinc-50 text-zinc-900 ' +
          'dark:bg-zinc-950 dark:text-zinc-100 ' +
          'selection:bg-emerald-200 selection:text-emerald-950'
        }
      >
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
