import { z } from "zod";

/**
 * Máquina de estados del lead — sección 4 de CLAUDE.md.
 * OPT_OUT es terminal e irreversible.
 */
export const LEAD_STATUSES = [
  "NEW",
  "ENRICHED",
  "QUALIFIED",
  "CONTACTED",
  "ENGAGED",
  "MEETING_SET",
  "MEETING_HELD",
  "WON",
  "HOT_FOLLOWUP",
  "LOST",
  "NO_SHOW",
  "RE_NURTURE_90D",
  "DISQUALIFIED",
  "OPT_OUT",
] as const;
export const leadStatusSchema = z.enum(LEAD_STATUSES);
export type LeadStatus = z.infer<typeof leadStatusSchema>;

export const LEAD_SOURCES = [
  "linkedin",
  "scraping",
  "referral",
  "portfolio_event",
  "manual",
] as const;
export const leadSourceSchema = z.enum(LEAD_SOURCES);
export type LeadSource = z.infer<typeof leadSourceSchema>;

export const USER_ROLES = ["admin", "agent", "viewer"] as const;
export const userRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof userRoleSchema>;

export const CHANNELS = ["whatsapp", "linkedin", "voice", "email"] as const;
export const channelSchema = z.enum(CHANNELS);
export type Channel = z.infer<typeof channelSchema>;

export const MESSAGE_DIRECTIONS = ["in", "out"] as const;
export const messageDirectionSchema = z.enum(MESSAGE_DIRECTIONS);
export type MessageDirection = z.infer<typeof messageDirectionSchema>;

export const MESSAGE_SENDERS = ["ai", "human", "lead"] as const;
export const messageSenderSchema = z.enum(MESSAGE_SENDERS);
export type MessageSender = z.infer<typeof messageSenderSchema>;

export const MEETING_STATUSES = [
  "scheduled",
  "completed",
  "no_show",
  "cancelled",
] as const;
export const meetingStatusSchema = z.enum(MEETING_STATUSES);
export type MeetingStatus = z.infer<typeof meetingStatusSchema>;

export const MEETING_OUTCOMES = ["won", "hot", "lost", "no_show"] as const;
export const meetingOutcomeSchema = z.enum(MEETING_OUTCOMES);
export type MeetingOutcome = z.infer<typeof meetingOutcomeSchema>;

export const CADENCE_TRIGGERS = [
  "cold",
  "nurture",
  "reengagement_90d",
  "no_show",
  "renewal",
  "cross_sell",
] as const;
export const cadenceTriggerSchema = z.enum(CADENCE_TRIGGERS);
export type CadenceTrigger = z.infer<typeof cadenceTriggerSchema>;

export const DOCUMENT_TYPES = ["poliza", "id", "formato"] as const;
export const documentTypeSchema = z.enum(DOCUMENT_TYPES);
export type DocumentType = z.infer<typeof documentTypeSchema>;

export const PORTFOLIO_EVENT_TYPES = [
  "renewal_60",
  "renewal_30",
  "renewal_15",
  "birthday",
  "anniversary",
  "cross_sell",
  "upsell",
] as const;
export const portfolioEventTypeSchema = z.enum(PORTFOLIO_EVENT_TYPES);
export type PortfolioEventType = z.infer<typeof portfolioEventTypeSchema>;

export const ACTION_QUEUE_STATUSES = ["pending", "executed", "skipped"] as const;
export const actionQueueStatusSchema = z.enum(ACTION_QUEUE_STATUSES);
export type ActionQueueStatus = z.infer<typeof actionQueueStatusSchema>;

export const VARIANT_STATUSES = ["active", "exploring", "retired"] as const;
export const variantStatusSchema = z.enum(VARIANT_STATUSES);
export type VariantStatus = z.infer<typeof variantStatusSchema>;

export const INSIGHT_STATUSES = ["active", "expired"] as const;
export const insightStatusSchema = z.enum(INSIGHT_STATUSES);
export type InsightStatus = z.infer<typeof insightStatusSchema>;

export const SUBAGENTS = [
  "hunter",
  "opener",
  "nurturer",
  "scheduler",
  "sentinel",
  "librarian",
  "strategist",
] as const;
export const subagentSchema = z.enum(SUBAGENTS);
export type Subagent = z.infer<typeof subagentSchema>;
