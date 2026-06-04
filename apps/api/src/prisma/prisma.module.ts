/**
 * PrismaModule
 * ---------------------------------------------------------------------------
 * Módulo global que expone PrismaService al resto de la aplicación, evitando
 * tener que importarlo manualmente en cada módulo de dominio.
 */

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
