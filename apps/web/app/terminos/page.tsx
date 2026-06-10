/**
 * /terminos — Términos y Condiciones de la plataforma.
 * ---------------------------------------------------------------------------
 * Texto base razonable para un SaaS de reservas en Argentina.
 * IMPORTANTE: antes de facturar a clientes reales conviene que lo revise
 * un abogado; este texto es un punto de partida, no asesoramiento legal.
 */

import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/brand';
import { LegalLayout, Section } from '@/components/legal/legal-layout';

export const metadata: Metadata = {
  title: `Términos y Condiciones — ${APP_NAME}`,
};

export default function TerminosPage() {
  return (
    <LegalLayout title="Términos y Condiciones" updated="Junio 2026">
      <Section n="1" title="Aceptación">
        Estos Términos y Condiciones regulan el uso de la plataforma{' '}
        <strong>{APP_NAME}</strong> (en adelante, “la Plataforma”), un servicio
        de gestión y reserva de turnos para complejos deportivos. Al crear una
        cuenta o utilizar la Plataforma, aceptás estos términos en su totalidad.
        Si no estás de acuerdo, no utilices el servicio.
      </Section>

      <Section n="2" title="Descripción del servicio">
        La Plataforma permite: (a) a los complejos deportivos (“Complejos”)
        publicar sus canchas, horarios y precios, y administrar sus reservas;
        (b) a los usuarios finales (“Usuarios”) consultar disponibilidad y
        reservar turnos en los Complejos adheridos. {APP_NAME} actúa como
        intermediario tecnológico: la relación comercial por el uso de la
        cancha (incluido el pago del turno) es exclusivamente entre el Usuario
        y el Complejo.
      </Section>

      <Section n="3" title="Cuentas y responsabilidad">
        Para reservar u operar un Complejo necesitás una cuenta con datos
        veraces y actualizados. Sos responsable de mantener la confidencialidad
        de tu contraseña y de toda actividad realizada desde tu cuenta. Los
        administradores de cada Complejo son responsables de la exactitud de la
        información publicada (precios, horarios, disponibilidad) y de la
        prestación efectiva del servicio deportivo.
      </Section>

      <Section n="4" title="Reservas y cancelaciones">
        Las reservas confirmadas constituyen un compromiso entre el Usuario y
        el Complejo. Las políticas de anticipación mínima, límites de reservas
        activas y plazos de cancelación se muestran durante el proceso de
        reserva y pueden variar según el Complejo. El pago del turno se realiza
        directamente al Complejo, salvo que se indique lo contrario.
      </Section>

      <Section n="5" title="Uso prohibido">
        No está permitido: usar la Plataforma para fines ilícitos; intentar
        acceder a datos de otros usuarios o de otros Complejos; interferir con
        el funcionamiento del servicio (incluyendo scraping masivo, ataques de
        denegación de servicio o ingeniería inversa); ni crear cuentas con
        datos falsos. El incumplimiento puede derivar en la suspensión o baja
        de la cuenta.
      </Section>

      <Section n="6" title="Disponibilidad del servicio">
        Nos esforzamos por mantener la Plataforma disponible de forma continua,
        pero no garantizamos disponibilidad ininterrumpida. Podemos realizar
        mantenimientos programados y actualizaciones. {APP_NAME} no será
        responsable por daños derivados de interrupciones del servicio,
        incluyendo la imposibilidad temporal de realizar o consultar reservas.
      </Section>

      <Section n="7" title="Propiedad intelectual">
        El software, el diseño y la marca de la Plataforma son propiedad de sus
        titulares. El contenido cargado por cada Complejo (nombres, fotos,
        descripciones) es responsabilidad y propiedad de ese Complejo.
      </Section>

      <Section n="8" title="Modificaciones">
        Podemos actualizar estos términos. Los cambios sustanciales se
        comunicarán a través de la Plataforma o por email con razonable
        anticipación. El uso posterior a la entrada en vigencia implica
        aceptación.
      </Section>

      <Section n="9" title="Ley aplicable">
        Estos términos se rigen por las leyes de la República Argentina.
        Cualquier controversia se someterá a los tribunales ordinarios con
        competencia en la materia.
      </Section>

      <Section n="10" title="Contacto">
        Por consultas sobre estos términos, escribinos al email de contacto
        publicado en la Plataforma.
      </Section>
    </LegalLayout>
  );
}
