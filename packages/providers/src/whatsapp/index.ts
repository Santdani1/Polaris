/**
 * WhatsAppProvider — implementaciones: Evolution API (v0) → Cloud API (Fase 1+).
 * La política anti-ban (sección 9.2) se aplica ARRIBA de esta interface,
 * en el worker (rate limits, warm-up, delays), no en el vendor.
 */
export interface WhatsAppProvider {
  /** Envía un mensaje de texto. Devuelve el id externo del mensaje. */
  sendMessage(to: string, content: string): Promise<{ externalId: string }>;
  /** Salud del número (bloqueos, tasa de respuesta) para el dashboard. */
  getNumberHealth(): Promise<{ status: "healthy" | "warming_up" | "degraded" | "banned" }>;
}
