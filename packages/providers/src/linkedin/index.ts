/**
 * LinkedInProvider — implementación planeada: Unipile (Fase 4).
 * Límites humanos (sección 9.3): ≤25 conexiones/día, ≤50 mensajes/día
 * por cuenta — se aplican en el worker, no aquí.
 */
export interface LinkedInProvider {
  sendConnectionRequest(profileUrl: string, note: string): Promise<{ externalId: string }>;
  sendMessage(profileUrl: string, content: string): Promise<{ externalId: string }>;
}
