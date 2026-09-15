import { z } from "zod";

// HU-01.1: contraseña mínimamente robusta — la demo no define una política
// exacta, se usa un mínimo razonable (8 caracteres) en vez de inventar
// reglas de negocio no especificadas en docs/.
export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.email().trim().toLowerCase(),
  phone: z.string().trim().min(7),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.email().trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export const createMechanicSchema = z.object({
  name: z.string().trim().min(2),
  email: z.email().trim().toLowerCase(),
  phone: z.string().trim().min(7),
  temporaryPassword: z.string().min(8),
});

export const updateMechanicSchema = z.object({
  active: z.boolean(),
});
