/**
 * EmailProvider — implementación: Resend o SES (Fase 4).
 * Warm-up del dominio antes de volumen.
 */
export interface EmailProvider {
  sendEmail(input: {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
  }): Promise<{ externalId: string }>;
}
