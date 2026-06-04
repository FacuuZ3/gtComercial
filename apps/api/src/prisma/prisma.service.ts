/**
 * PrismaService
 * ---------------------------------------------------------------------------
 * Extiende PrismaClient para integrarlo con el ciclo de vida de NestJS.
 * - OnModuleInit:    establece la conexión con la base de datos al iniciar.
 * - OnModuleDestroy: cierra la conexión limpiamente al apagar la aplicación.
 */

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      // Configuración de logs por nivel. En producción se podrían enviar al
      // LoggerService global (Winston) en lugar de stdout.
      log: [
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Conexión a PostgreSQL establecida.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Conexión a PostgreSQL cerrada.');
  }
}
