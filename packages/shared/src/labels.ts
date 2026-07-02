import type { Channel, LeadSource, LeadStatus, Subagent } from "./enums";

/** Copy de UI en español mexicano — nombres legibles de los enums. */

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Nuevo",
  ENRICHED: "Enriquecido",
  QUALIFIED: "Calificado",
  CONTACTED: "Contactado",
  ENGAGED: "En conversación",
  MEETING_SET: "Cita agendada",
  MEETING_HELD: "Cita realizada",
  WON: "Cerrado ✓",
  HOT_FOLLOWUP: "Caliente",
  LOST: "No cerró",
  NO_SHOW: "No se presentó",
  RE_NURTURE_90D: "Re-nurture 90d",
  DISQUALIFIED: "Descalificado",
  OPT_OUT: "Opt-out",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  linkedin: "LinkedIn",
  scraping: "Scraping",
  referral: "Referido",
  portfolio_event: "Cartera",
  manual: "Manual",
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  voice: "Voz",
  email: "Email",
};

export const SUBAGENT_LABELS: Record<Subagent, string> = {
  hunter: "HUNTER",
  opener: "OPENER",
  nurturer: "NURTURER",
  scheduler: "SCHEDULER",
  sentinel: "SENTINEL",
  librarian: "LIBRARIAN",
  strategist: "STRATEGIST",
};
