/**
 * VoiceProvider — implementación: Retell AI o Vapi (evaluar en Fase 4).
 * Voz es-MX natural; transcripts siempre a la DB (tabla calls).
 */
export interface VoiceProvider {
  startCall(to: string, context: { leadId: string; scriptHint: string }): Promise<{ providerCallId: string }>;
  getCallResult(providerCallId: string): Promise<{
    durationSeconds: number;
    recordingUrl: string | null;
    transcript: string | null;
  }>;
}
