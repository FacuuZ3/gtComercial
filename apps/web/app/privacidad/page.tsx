/**
 * /privacidad — Política de Privacidad de la plataforma.
 * ---------------------------------------------------------------------------
 * Texto base alineado con la Ley 25.326 de Protección de Datos Personales
 * (Argentina). IMPORTANTE: antes de operar con clientes reales conviene que
 * lo revise un abogado; es un punto de partida, no asesoramiento legal.
 */

import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/brand';
import { LegalLayout, Section } from '@/components/legal/legal-layout';

export const metadata: Metadata = {
  title: `Política de Privacidad — ${APP_NAME}`,
};

export default function PrivacidadPage() {
  return (
    <LegalLayout title="Política de Privacidad" updated="Junio 2026">
      <Section n="1" title="Qué datos recolectamos">
        Para operar la Plataforma recolectamos: nombre y apellido, dirección de
        email, teléfono (opcional) y contraseña (almacenada cifrada con
        algoritmos de hashing — nunca en texto plano). Además registramos los
        datos propios del uso del servicio: reservas realizadas, complejo al
        que pertenecés y registros técnicos de acceso (fecha, IP) con fines de
        seguridad.
      </Section>

      <Section n="2" title="Para qué los usamos">
        Usamos tus datos exclusivamente para: gestionar tu cuenta y tus
        reservas; enviarte emails operativos (verificación de cuenta,
        confirmaciones, recordatorios de turno, restablecimiento de
        contraseña); permitir al complejo donde reservás administrar sus
        turnos; y mantener la seguridad del servicio. No vendemos ni cedemos
        tus datos a terceros con fines publicitarios.
      </Section>

      <Section n="3" title="Quién accede a tus datos">
        El personal administrativo del complejo en el que tenés cuenta puede
        ver tus datos de contacto y tus reservas en ese complejo, a fin de
        gestionar los turnos. Los datos de cada complejo están aislados: un
        complejo no puede acceder a los datos de usuarios de otro. Proveedores
        de infraestructura (alojamiento, envío de emails) procesan datos por
        cuenta nuestra bajo sus propias garantías de seguridad.
      </Section>

      <Section n="4" title="Conservación">
        Conservamos tus datos mientras tu cuenta esté activa. El historial de
        reservas se conserva con fines estadísticos y de auditoría del
        complejo. Podés solicitar la baja de tu cuenta y la supresión de tus
        datos personales en cualquier momento.
      </Section>

      <Section n="5" title="Tus derechos (Ley 25.326)">
        Como titular de los datos tenés derecho a acceder, rectificar y
        suprimir tu información personal de forma gratuita. Podés ejercer
        estos derechos escribiendo al contacto publicado en la Plataforma. La
        Agencia de Acceso a la Información Pública, órgano de control de la
        Ley N.º 25.326, tiene la atribución de atender denuncias y reclamos
        sobre incumplimientos de las normas de protección de datos personales.
      </Section>

      <Section n="6" title="Cookies y almacenamiento local">
        Usamos cookies y almacenamiento local del navegador con fines
        estrictamente funcionales: mantener tu sesión iniciada y recordar tus
        preferencias (por ejemplo, el tema claro/oscuro). No usamos cookies de
        publicidad ni de seguimiento de terceros.
      </Section>

      <Section n="7" title="Seguridad">
        Aplicamos medidas técnicas razonables para proteger tus datos:
        contraseñas hasheadas, comunicaciones cifradas (HTTPS), aislamiento de
        datos entre complejos y registro de auditoría de acciones
        administrativas. Ningún sistema es infalible; ante un incidente que
        comprometa tus datos te lo comunicaremos a la brevedad.
      </Section>

      <Section n="8" title="Cambios a esta política">
        Si modificamos esta política de forma sustancial, lo comunicaremos por
        la Plataforma o por email. La fecha de última actualización figura al
        inicio de esta página.
      </Section>
    </LegalLayout>
  );
}
