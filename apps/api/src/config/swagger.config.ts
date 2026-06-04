/**
 * Configuración de la documentación OpenAPI (Swagger).
 * ---------------------------------------------------------------------------
 * Genera la especificación a partir de los decoradores @ApiOperation /
 * @ApiProperty del código y la sirve en /api/docs.
 */

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Pádel SaaS API')
    .setDescription(
      'Backend de la plataforma SaaS de gestión y reserva de turnos ' +
        'para complejos deportivos.',
    )
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token JWT obtenido en POST /auth/login',
      },
      'access-token',
    )
    .addTag('auth', 'Registro, login, verificación y refresh de tokens.')
    .addTag('users', 'Perfil del usuario autenticado.')
    .addTag('courts', 'Gestión de canchas (ADMIN).')
    .addTag('reservations', 'Disponibilidad y reserva de turnos.')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
