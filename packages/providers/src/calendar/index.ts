/**
 * CalendarProvider — implementación: Google Calendar API (Fase 2).
 * OAuth por agente humano. El dossier del lead va en la descripción
 * del evento (sección 3.4).
 */
export interface CalendarSlot {
  startsAt: string;
  endsAt: string;
}

export interface CalendarProvider {
  getAvailability(agentUserId: string, fromIso: string, toIso: string): Promise<CalendarSlot[]>;
  createEvent(input: {
    agentUserId: string;
    title: string;
    description: string; // dossier generado por Claude
    startsAt: string;
    endsAt: string;
    attendeeEmail?: string;
  }): Promise<{ calendarEventId: string; meetUrl: string | null }>;
  cancelEvent(agentUserId: string, calendarEventId: string): Promise<void>;
}
