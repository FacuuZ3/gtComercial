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

/** Info del club + nombre del complejo (tenant) para branding white-label. */
export type ClubInfoWithName = ClubInfo & { clubName: string };

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

  /**
   * Devuelve la info del club del tenant actual (creándola si no existe),
   * acompañada del nombre del complejo para el branding white-label.
   */
  async get(): Promise<ClubInfoWithName> {
    const tenantId = requireTenantId();
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });
    const clubName = tenant?.name ?? '';

    const existing = await this.prisma.clubInfo.findUnique({ where: { tenantId } });
    const info = existing ?? (await this.prisma.clubInfo.create({ data: { tenantId, ...DEFAULTS } }));
    return { ...info, clubName };
  }

  /** Actualiza parcialmente la info del club del tenant actual (merge). */
  async update(dto: UpdateClubInfoDto): Promise<ClubInfoWithName> {
    const existing = await this.get();
    const updated = await this.prisma.clubInfo.update({
      where: { id: existing.id },
      data: dto,
    });
    return { ...updated, clubName: existing.clubName };
  }
}
