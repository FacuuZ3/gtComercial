/**
 * AuthService
 * ---------------------------------------------------------------------------
 * Lógica de negocio del subsistema de autenticación.
 * Responsabilidades:
 *  - Registrar usuarios con contraseña hasheada (bcrypt).
 *  - Verificar credenciales en el login.
 *  - Emitir access + refresh tokens firmados con secretos distintos.
 *  - Generar y validar tokens de verificación de email.
 *  - Delegar el envío del email de verificación a NotificationsService.
 */

import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OnboardDto } from './dto/onboard.dto';

/** Slugs no disponibles para complejos (colisionan con subdominios del sistema). */
const RESERVED_SLUGS = new Set(['www', 'api', 'app', 'admin', 'localhost', 'mail', 'static']);

/** Valores por defecto de la info pública de un complejo recién creado. */
const NEW_CLUB_DEFAULTS = {
  mapEmbedUrl: null as string | null,
  weekdayHours: '13:00 a 23:00',
  weekendHours: '13:00 a 23:00',
  holidayHours: '13:00 a 23:00',
  services: ['Wi-Fi', 'Vestuario'],
};

const BCRYPT_ROUNDS = 10;

/** Vida útil de un token de reseteo de contraseña, en milisegundos. */
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  // -------------------------------------------------------------------------
  // Registro
  // -------------------------------------------------------------------------

  async register(dto: RegisterDto): Promise<{ id: string; email: string; message: string }> {
    // 1) Email único.
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese email.');
    }

    // 2) Hash de la contraseña.
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // 3) Token de verificación de email (UUID v4 → suficientemente entrópico
    //    para uso de un solo paso, sin almacenar tokens largos).
    const emailVerifyToken = randomUUID();

    // 4) Persistencia.
    const user = await this.users.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
      role: Role.USER,
      emailVerifyToken,
    });

    // 5) Envío del email de verificación con la marca del complejo. Errores
    //    SMTP se loguean en el canal pero no rompen el registro.
    await this.notifications.sendVerificationEmail(
      user.email,
      user.name,
      emailVerifyToken,
      await this.tenantName(user.tenantId),
    );

    return {
      id: user.id,
      email: user.email,
      message: 'Cuenta creada. Revisá tu email para verificar la cuenta.',
    };
  }

  // -------------------------------------------------------------------------
  // Verificación de email
  // -------------------------------------------------------------------------

  async verifyEmail(token: string): Promise<{ message: string }> {
    if (!token || token.length < 8) {
      throw new BadRequestException('Token de verificación inválido.');
    }
    await this.users.verifyEmail(token);
    return { message: 'Cuenta verificada correctamente. Ya podés iniciar sesión.' };
  }

  // -------------------------------------------------------------------------
  // Login
  // -------------------------------------------------------------------------

  async login(
    dto: LoginDto,
  ): Promise<TokenPair & { user: SafeUser & { tenantName: string } }> {
    const user = await this.users.findByEmail(dto.email);
    // Mensaje genérico para no revelar si el email existe o no (mitiga
    // enumeración de cuentas).
    if (!user) throw new UnauthorizedException('Credenciales inválidas.');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas.');

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('La cuenta aún no fue verificada por email.');
    }

    const tokens = await this.signTokens(user);
    return {
      ...tokens,
      user: {
        ...this.toSafeUser(user),
        // Nombre del complejo para el branding white-label del frontend.
        tenantName: await this.tenantName(user.tenantId),
      },
    };
  }

  // -------------------------------------------------------------------------
  // Onboarding de un complejo nuevo (self-service)
  // -------------------------------------------------------------------------

  /**
   * Da de alta un complejo (tenant) nuevo junto con su primer administrador,
   * de forma atómica. El admin queda auto-verificado (es el dueño) y se
   * devuelven tokens para entrar directo al panel.
   */
  async onboard(
    dto: OnboardDto,
  ): Promise<TokenPair & { user: SafeUser & { tenantName: string } }> {
    const slug = dto.slug.toLowerCase();

    if (RESERVED_SLUGS.has(slug)) {
      throw new BadRequestException('Ese identificador no está disponible.');
    }

    // Unicidad del slug (más allá del constraint de BD, para dar un 409 claro).
    const existingTenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      throw new ConflictException('Ya existe un complejo con ese identificador.');
    }

    const passwordHash = await bcrypt.hash(dto.adminPassword, BCRYPT_ROUNDS);

    // Transacción: tenant + info del club + admin. Si algo falla, no queda
    // ningún registro huérfano.
    const { admin, tenant } = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: dto.complexName, slug },
      });

      await tx.clubInfo.create({
        data: {
          tenantId: tenant.id,
          address: `${dto.complexName} — completá tu dirección`,
          ...NEW_CLUB_DEFAULTS,
        },
      });

      const admin = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: dto.adminName,
          email: dto.adminEmail.toLowerCase(),
          password: passwordHash,
          phone: dto.adminPhone,
          role: Role.ADMIN,
          isEmailVerified: true, // el dueño del complejo se verifica solo
        },
      });

      return { admin, tenant };
    });

    const tokens = await this.signTokens(admin);
    return {
      ...tokens,
      user: { ...this.toSafeUser(admin), tenantName: tenant.name },
    };
  }

  // -------------------------------------------------------------------------
  // Reset de contraseña — solicitud
  // -------------------------------------------------------------------------

  /**
   * Genera un token de reseteo y lo envía por email.
   *
   * Seguridad: SIEMPRE devuelve el mismo mensaje independientemente de si el
   * email existe en la base. Esto evita que un atacante use este endpoint
   * para enumerar cuentas válidas del sistema.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const token = randomUUID() + randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

    const user = await this.users.assignPasswordResetToken(email, token, expiresAt);
    if (user) {
      // Sólo enviamos el email si el usuario existe; el caller no se entera.
      await this.notifications.sendPasswordResetEmail(
        user.email,
        user.name,
        token,
        await this.tenantName(user.tenantId),
      );
    }

    return {
      message:
        'Si el email está registrado, te enviamos un enlace para restablecer tu contraseña.',
    };
  }

  /**
   * Aplica una contraseña nueva a partir de un token válido y no expirado.
   * El token se descarta tras usarlo (no se puede reutilizar).
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.users.resetPasswordWithToken(token, passwordHash);
    return { message: 'Contraseña actualizada. Ya podés iniciar sesión.' };
  }

  // -------------------------------------------------------------------------
  // Refresh
  // -------------------------------------------------------------------------

  async refresh(userId: string): Promise<TokenPair> {
    const user = await this.users.findByIdOrThrow(userId);
    return this.signTokens(user);
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  /** Nombre del complejo (tenant) para branding white-label de emails y UI. */
  private async tenantName(tenantId: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });
    return tenant?.name ?? '';
  }

  private async signTokens(user: User): Promise<TokenPair> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'),
    });

    return { accessToken, refreshToken };
  }

  private toSafeUser(user: User): SafeUser {
    const { password, emailVerifyToken, ...safe } = user;
    return safe;
  }
}

export type SafeUser = Omit<User, 'password' | 'emailVerifyToken'>;
