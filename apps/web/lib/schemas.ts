/**
 * Esquemas Zod para los formularios del frontend.
 * Reflejan las reglas del backend (class-validator) para validar antes de
 * enviar la request y mostrar errores en tiempo real con React Hook Form.
 */

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido.'),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Mínimo 8 caracteres.').max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'El nombre es demasiado corto.').max(120),
  phone: z
    .string()
    .regex(/^\+?\d{8,15}$/, 'Teléfono inválido.')
    .optional()
    .or(z.literal('')),
});
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresá tu contraseña actual.'),
    newPassword: z.string().min(8, 'Mínimo 8 caracteres.').max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: 'La nueva contraseña debe ser distinta de la actual.',
    path: ['newPassword'],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre es demasiado corto.').max(120),
  email: z.string().email('Email inválido.'),
  password: z.string().min(8, 'Mínimo 8 caracteres.').max(72),
  phone: z
    .string()
    .regex(/^\+?\d{8,15}$/, 'Teléfono inválido.')
    .optional()
    .or(z.literal('')),
});
export type RegisterValues = z.infer<typeof registerSchema>;

/** Alta de un complejo nuevo (tenant) + su primer administrador. */
export const onboardSchema = z.object({
  complexName: z.string().min(2, 'El nombre del complejo es demasiado corto.').max(120),
  slug: z
    .string()
    .min(3, 'Mínimo 3 caracteres.')
    .max(40, 'Máximo 40 caracteres.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Solo minúsculas, números y guiones (sin espacios).',
    ),
  adminName: z.string().min(2, 'El nombre es demasiado corto.').max(120),
  adminEmail: z.string().email('Email inválido.'),
  adminPassword: z.string().min(8, 'Mínimo 8 caracteres.').max(72),
  adminPhone: z
    .string()
    .regex(/^\+?\d{8,15}$/, 'Teléfono inválido.')
    .optional()
    .or(z.literal('')),
});
export type OnboardValues = z.infer<typeof onboardSchema>;
