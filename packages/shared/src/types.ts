import type {
  ActionQueueStatus,
  CadenceTrigger,
  Channel,
  DocumentType,
  InsightStatus,
  LeadSource,
  LeadStatus,
  MeetingOutcome,
  MeetingStatus,
  MessageDirection,
  MessageSender,
  PortfolioEventType,
  Subagent,
  UserRole,
  VariantStatus,
} from "./enums";

/** Campos comunes a todas las tablas (sección 7 de CLAUDE.md). */
interface BaseRow {
  id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface User extends BaseRow {
  email: string;
  full_name: string;
  role: UserRole;
  whatsapp_phone: string | null;
  google_calendar_connected: boolean;
}

export interface LeadEnrichment {
  age_range?: string;
  family?: string;
  business?: string;
  life_signals?: string[];
  notes?: string;
  [key: string]: unknown;
}

export interface Lead extends BaseRow {
  name: string;
  phone: string | null;
  email: string | null;
  linkedin_url: string | null;
  company: string | null;
  title: string | null;
  city: string | null;
  source: LeadSource;
  icp_score: number | null;
  status: LeadStatus;
  assigned_agent_id: string | null;
  enrichment: LeadEnrichment;
  entry_angle: string | null;
  lost_reason: string | null;
  opted_out: boolean;
}

export interface LeadEvent extends BaseRow {
  lead_id: string;
  type: string;
  actor: string;
  payload: Record<string, unknown>;
  occurred_at: string;
}

export interface Conversation extends BaseRow {
  lead_id: string;
  channel: Channel;
  status: string;
  human_takeover: boolean;
}

export interface Message extends BaseRow {
  conversation_id: string;
  direction: MessageDirection;
  sender: MessageSender;
  content: string;
  media_url: string | null;
  external_id: string | null;
  sent_at: string;
}

export interface Call extends BaseRow {
  lead_id: string;
  provider_call_id: string | null;
  duration_seconds: number | null;
  recording_url: string | null;
  transcript: string | null;
  summary: string | null;
  outcome: string | null;
}

export interface Meeting extends BaseRow {
  lead_id: string;
  agent_id: string;
  calendar_event_id: string | null;
  starts_at: string;
  ends_at: string;
  status: MeetingStatus;
  outcome: MeetingOutcome | null;
  outcome_captured_at: string | null;
  outcome_notes: string | null;
}

export interface Cadence extends BaseRow {
  name: string;
  trigger: CadenceTrigger;
}

export interface CadenceStep extends BaseRow {
  cadence_id: string;
  step_order: number;
  channel: Channel;
  delay_hours: number;
  prompt_hint: string | null;
}

export interface LeadCadenceState extends BaseRow {
  lead_id: string;
  cadence_id: string;
  current_step: number;
  next_action_at: string | null;
  paused: boolean;
}

export interface Client extends BaseRow {
  lead_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface Policy extends BaseRow {
  client_id: string;
  carrier: string;
  product: string;
  policy_number: string | null;
  premium: number | null;
  currency: string;
  start_date: string | null;
  renewal_date: string | null;
  status: string;
  document_id: string | null;
}

export interface DocumentRow extends BaseRow {
  client_id: string | null;
  policy_id: string | null;
  type: DocumentType;
  path: string;
  extracted_meta: Record<string, unknown>;
}

export interface PortfolioEvent extends BaseRow {
  client_id: string;
  type: PortfolioEventType;
  due_at: string;
  status: string;
  generated_lead_id: string | null;
}

export interface ActionQueueItem extends BaseRow {
  lead_id: string;
  action_type: string;
  channel: Channel | null;
  priority_score: number;
  scheduled_window: string | null;
  status: ActionQueueStatus;
  reasoning: string | null;
}

export interface MessageVariant extends BaseRow {
  channel: Channel;
  segment: string | null;
  angle: string;
  copy_template_hint: string | null;
  sends: number;
  replies: number;
  meetings: number;
  wins: number;
  status: VariantStatus;
}

export interface PlaybookInsight extends BaseRow {
  insight: string;
  segment: string | null;
  evidence: Record<string, unknown>;
  confidence: number | null;
  status: InsightStatus;
  learned_at: string;
}

export interface LeadPrediction extends BaseRow {
  lead_id: string;
  close_probability: number | null;
  best_contact_window: string | null;
  no_show_risk: number | null;
  model_version: string | null;
  features_snapshot: Record<string, unknown>;
  computed_at: string;
}

export interface AgentAction extends BaseRow {
  subagent: Subagent;
  action: string;
  lead_id: string | null;
  tokens: number | null;
  cost: number | null;
  payload: Record<string, unknown>;
  at: string;
}

export interface Task extends BaseRow {
  title: string;
  description: string | null;
  lead_id: string | null;
  assigned_user_id: string | null;
  status: string;
  due_at: string | null;
}
