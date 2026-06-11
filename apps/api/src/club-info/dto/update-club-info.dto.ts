/**
 * UpdateClubInfoDto: payload de PATCH /club-info (ADMIN).
 * Todos los campos son opcionales — se aplica un merge.
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateClubInfoDto {
  @ApiPropertyOptional({ example: 'Av. San Martín 1234, Reconquista, Santa Fe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({
    description:
      'URL del iframe de Google Maps (atributo src). Pegar la URL del embed. ' +
      'Solo se aceptan URLs de https://www.google.com/maps/embed.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  // Mitigación XSS: este valor se inyecta como src de un <iframe> en la
  // landing pública. Restringirlo al embed oficial de Google Maps impide
  // payloads tipo javascript:, data: o iframes a sitios arbitrarios.
  @Matches(/^https:\/\/www\.google\.com\/maps\/embed/, {
    message:
      'La URL del mapa debe ser un embed de Google Maps (https://www.google.com/maps/embed...).',
  })
  mapEmbedUrl?: string;

  @ApiPropertyOptional({ example: '13:00 a 23:00' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  weekdayHours?: string;

  @ApiPropertyOptional({ example: '13:00 a 23:00' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  weekendHours?: string;

  @ApiPropertyOptional({ example: '13:00 a 23:00' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  holidayHours?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Wi-Fi', 'Vestuario', 'Bar / Restaurante'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  services?: string[];
}
