/**
 * ClubInfoService
 * ---------------------------------------------------------------------------
 * Gestiona la información pública del club. Existe una fila por tenant
 * (relación 1:1). Si el registro del tenant no existe, se crea con valores
 * por defecto al primer GET.
 */

import { Injectable } from '@nestjs/common';
import { ClubInfo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateClubInfoDto } from './dto/update-club-info.dto';
import { requireTenantId } from '../common/tenancy/tenant-context';

const DEFAULTS = {
  address: 'Av. San Martín 1234, Reconquista, Santa Fe',
  mapEmbedUrl: null as string | null,
  weekdayHours: '13:00 a 23:00',
  weekendHours: '13:00 a 23:00',
  holidayHours: '13:00 a 23:00',
  services: ['Wi-Fi', 'Vestuario', 'Bar / Restaurante'],
};

@Injectable()
export class ClubInfoService {
  constructor(private readonly prisma: PrismaService) {}

  /** Devuelve la info del club del tenant actual, creándola si no existe. */
  async get(): Promise<ClubInfo> {
    const tenantId = requireTenantId();
    const existing = await this.prisma.clubInfo.findUnique({ where: { tenantId } });
    if (existing) return existing;
    return this.prisma.clubInfo.create({ data: { tenantId, ...DEFAULTS } });
  }

  /** Actualiza parcialmente la info del club del tenant actual (merge). */
  async update(dto: UpdateClubInfoDto): Promise<ClubInfo> {
    const existing = await this.get();
    return this.prisma.clubInfo.update({
      where: { id: existing.id },
      data: dto,
    });
  }
}
