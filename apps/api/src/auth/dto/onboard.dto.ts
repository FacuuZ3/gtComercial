/**
 * OnboardDto: payload para POST /auth/onboard.
 * ---------------------------------------------------------------------------
 * Da de alta un complejo NUEVO (tenant) junto con su primer usuario
 * administrador. A diferencia de /auth/register (que crea un cliente dentro de
 * un complejo existente), este flujo es público y crea el tenant desde cero.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class OnboardDto {
  // --- Complejo (tenant) ---
  @ApiProperty({ example: 'Complejo Pádel Norte', minLength: 2, maxLength: 120 })
  @IsString({ message: 'El nombre del complejo es obligatorio.' })
  @MinLength(2, { message: 'El nombre del complejo es demasiado corto.' })
  @MaxLength(120)
  complexName!: string;

  @ApiProperty({
    example: 'norte',
    description:
      'Identificador para el subdominio (clubA.miapp.com). Solo minúsculas, ' +
      'números y guiones.',
    minLength: 3,
    maxLength: 40,
  })
  @IsString({ message: 'El identificador (slug) es obligatorio.' })
  @MinLength(3, { message: 'El identificador debe tener al menos 3 caracteres.' })
  @MaxLength(40)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'El identificador solo admite minúsculas, números y guiones (sin espacios ni guiones al inicio/fin).',
  })
  slug!: string;

  // --- Administrador (primer usuario del complejo) ---
  @ApiProperty({ example: 'Juan Pérez', minLength: 2, maxLength: 120 })
  @IsString({ message: 'El nombre del administrador es obligatorio.' })
  @MinLength(2, { message: 'El nombre es demasiado corto.' })
  @MaxLength(120)
  adminName!: string;

  @ApiProperty({ example: 'admin@miclub.com', format: 'email' })
  @IsEmail({}, { message: 'Email inválido.' })
  @MaxLength(160)
  adminEmail!: string;

  @ApiProperty({ example: 'Password123!', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(72)
  adminPassword!: string;

  @ApiPropertyOptional({ example: '+543482111111' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{8,15}$/, { message: 'Teléfono inválido (8-15 dígitos, opcional con +).' })
  adminPhone?: string;
}
