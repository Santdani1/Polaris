import { z } from "zod";
import { leadSourceSchema, leadStatusSchema } from "./enums";

/**
 * Schemas zod para validar inputs externos (forms, webhooks, salidas de LLM).
 * Regla (sección 10): TODA salida de LLM y todo input externo se valida con zod.
 */

export const signUpSchema = z.object({
  organizationName: z.string().trim().min(2, "El nombre de la organización es muy corto"),
  fullName: z.string().trim().min(2, "Escribe tu nombre completo"),
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(1, "Escribe tu contraseña"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const leadInsertSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().nullish(),
  email: z.string().trim().email().nullish(),
  linkedin_url: z.string().trim().url().nullish(),
  company: z.string().trim().nullish(),
  title: z.string().trim().nullish(),
  city: z.string().trim().nullish(),
  source: leadSourceSchema.default("manual"),
  icp_score: z.number().int().min(0).max(100).nullish(),
  status: leadStatusSchema.default("NEW"),
  entry_angle: z.string().nullish(),
});
export type LeadInsertInput = z.infer<typeof leadInsertSchema>;
