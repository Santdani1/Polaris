-- POLARIS · Fase 0 — Esquema inicial (sección 7 de CLAUDE.md)
-- Todas las tablas llevan: id uuid, organization_id uuid (RLS), created_at, updated_at.
-- RLS por organization_id en TODAS las tablas, sin excepción.

-- ─────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────

create type public.user_role as enum ('admin', 'agent', 'viewer');

-- Máquina de estados del lead (sección 4)
create type public.lead_status as enum (
  'NEW', 'ENRICHED', 'QUALIFIED', 'CONTACTED', 'ENGAGED',
  'MEETING_SET', 'MEETING_HELD', 'WON', 'HOT_FOLLOWUP', 'LOST',
  'NO_SHOW', 'RE_NURTURE_90D', 'DISQUALIFIED', 'OPT_OUT'
);

create type public.lead_source as enum (
  'linkedin', 'scraping', 'referral', 'portfolio_event', 'manual'
);

create type public.channel as enum ('whatsapp', 'linkedin', 'voice', 'email');
create type public.message_direction as enum ('in', 'out');
create type public.message_sender as enum ('ai', 'human', 'lead');
create type public.meeting_status as enum ('scheduled', 'completed', 'no_show', 'cancelled');
create type public.meeting_outcome as enum ('won', 'hot', 'lost', 'no_show');
create type public.cadence_trigger as enum (
  'cold', 'nurture', 'reengagement_90d', 'no_show', 'renewal', 'cross_sell'
);
create type public.document_type as enum ('poliza', 'id', 'formato');
create type public.portfolio_event_type as enum (
  'renewal_60', 'renewal_30', 'renewal_15', 'birthday', 'anniversary', 'cross_sell', 'upsell'
);
create type public.action_queue_status as enum ('pending', 'executed', 'skipped');
create type public.variant_status as enum ('active', 'exploring', 'retired');
create type public.insight_status as enum ('active', 'expired');
create type public.subagent as enum (
  'hunter', 'opener', 'nurturer', 'scheduler', 'sentinel', 'librarian', 'strategist'
);

-- ─────────────────────────────────────────────────────────────
-- Helpers
-- ─────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Tenants y usuarios
-- ─────────────────────────────────────────────────────────────

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Agentes humanos y admins. id = auth.users.id (1:1 con Supabase Auth).
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  full_name text not null,
  role public.user_role not null default 'agent',
  whatsapp_phone text,               -- para SENTINEL (Fase 3)
  google_calendar_connected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Organización del usuario autenticado. SECURITY DEFINER para no
-- recursar sobre las policies de public.users. (Se define aquí porque
-- referencia public.users.)
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.users where id = auth.uid();
$$;

-- ─────────────────────────────────────────────────────────────
-- Leads y timeline
-- ─────────────────────────────────────────────────────────────

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  linkedin_url text,
  company text,
  title text,
  city text,
  source public.lead_source not null default 'manual',
  icp_score integer check (icp_score between 0 and 100),
  status public.lead_status not null default 'NEW',
  assigned_agent_id uuid references public.users (id) on delete set null,
  enrichment jsonb not null default '{}'::jsonb,
  entry_angle text,
  lost_reason text,
  opted_out boolean not null default false,  -- sagrado: nadie contacta un opt-out
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Timeline inmutable de transiciones y eventos del lead.
create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  type text not null,
  actor text not null,               -- 'agent:hunter', 'human:daniel', …
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Conversaciones y mensajes
-- ─────────────────────────────────────────────────────────────

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  channel public.channel not null,
  status text not null default 'open',
  human_takeover boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  direction public.message_direction not null,
  sender public.message_sender not null,
  content text not null,
  media_url text,
  external_id text,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.calls (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  provider_call_id text,
  duration_seconds integer,
  recording_url text,
  transcript text,
  summary text,
  outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Meetings (loop de outcome de SENTINEL)
-- ─────────────────────────────────────────────────────────────

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  agent_id uuid not null references public.users (id) on delete cascade,  -- agente humano
  calendar_event_id text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.meeting_status not null default 'scheduled',
  outcome public.meeting_outcome,
  outcome_captured_at timestamptz,
  outcome_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Cadencias
-- ─────────────────────────────────────────────────────────────

create table public.cadences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  trigger public.cadence_trigger not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cadence_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  cadence_id uuid not null references public.cadences (id) on delete cascade,
  step_order integer not null,
  channel public.channel not null,
  delay_hours integer not null default 0,
  prompt_hint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cadence_id, step_order)
);

create table public.lead_cadence_state (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  cadence_id uuid not null references public.cadences (id) on delete cascade,
  current_step integer not null default 0,
  next_action_at timestamptz,
  paused boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Regla (sección 4): un lead no puede estar en dos cadencias activas a la vez.
create unique index one_active_cadence_per_lead
  on public.lead_cadence_state (lead_id)
  where paused = false;

-- ─────────────────────────────────────────────────────────────
-- Vault: clientes, pólizas, documentos, flywheel
-- ─────────────────────────────────────────────────────────────

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.clients (id) on delete cascade,
  policy_id uuid,                    -- FK suave; la póliza también referencia al documento
  type public.document_type not null,
  path text not null,                -- ruta en Supabase Storage (signed URLs de corta vida)
  extracted_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  carrier text not null,
  product text not null,
  policy_number text,
  premium numeric(12, 2),
  currency text not null default 'MXN',
  start_date date,
  renewal_date date,
  status text not null default 'active',
  document_id uuid references public.documents (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  type public.portfolio_event_type not null,
  due_at timestamptz not null,
  status text not null default 'pending',
  generated_lead_id uuid references public.leads (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- STRATEGIST: cola de trabajo, variantes, insights, predicciones
-- ─────────────────────────────────────────────────────────────

create table public.action_queue (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  action_type text not null,
  channel public.channel,
  priority_score numeric(6, 2) not null default 0,
  scheduled_window text,
  status public.action_queue_status not null default 'pending',
  reasoning text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.message_variants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  channel public.channel not null,
  segment text,
  angle text not null,
  copy_template_hint text,
  sends integer not null default 0,
  replies integer not null default 0,
  meetings integer not null default 0,
  wins integer not null default 0,
  status public.variant_status not null default 'exploring',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.playbook_insights (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  insight text not null,
  segment text,
  evidence jsonb not null default '{}'::jsonb,  -- { n, métrica, periodo }
  confidence numeric(4, 3),
  status public.insight_status not null default 'active',
  learned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_predictions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  close_probability numeric(4, 3),
  best_contact_window text,
  no_show_risk numeric(4, 3),
  model_version text,
  features_snapshot jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Audit log y tasks
-- ─────────────────────────────────────────────────────────────

-- Regla (sección 7): ningún subagente ejecuta una acción externa sin
-- escribir aquí primero. Sin log, no hay acción.
create table public.agent_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  subagent public.subagent not null,
  action text not null,
  lead_id uuid references public.leads (id) on delete set null,
  tokens integer,
  cost numeric(10, 6),
  payload jsonb not null default '{}'::jsonb,
  at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  description text,
  lead_id uuid references public.leads (id) on delete cascade,
  assigned_user_id uuid references public.users (id) on delete set null,
  status text not null default 'pending',
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Índices
-- ─────────────────────────────────────────────────────────────

create index leads_org_status_idx on public.leads (organization_id, status);
create index leads_org_created_idx on public.leads (organization_id, created_at desc);
create index lead_events_lead_idx on public.lead_events (lead_id, occurred_at desc);
create index conversations_org_idx on public.conversations (organization_id, updated_at desc);
create index messages_conversation_idx on public.messages (conversation_id, sent_at);
create index meetings_org_starts_idx on public.meetings (organization_id, starts_at);
-- Para el cron de SENTINEL: meetings pasadas sin outcome (Fase 3)
create index meetings_pending_outcome_idx on public.meetings (ends_at) where outcome is null;
create index agent_actions_org_at_idx on public.agent_actions (organization_id, at desc);
create index action_queue_org_status_idx on public.action_queue (organization_id, status, priority_score desc);
create index portfolio_events_due_idx on public.portfolio_events (organization_id, due_at) where status = 'pending';

-- ─────────────────────────────────────────────────────────────
-- Trigger de updated_at en todas las tablas
-- ─────────────────────────────────────────────────────────────

do $$
declare
  t text;
begin
  foreach t in array array[
    'organizations', 'users', 'leads', 'lead_events', 'conversations',
    'messages', 'calls', 'meetings', 'cadences', 'cadence_steps',
    'lead_cadence_state', 'clients', 'documents', 'policies',
    'portfolio_events', 'action_queue', 'message_variants',
    'playbook_insights', 'lead_predictions', 'agent_actions', 'tasks'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- RLS — por organization_id en TODAS las tablas, sin excepción
-- ─────────────────────────────────────────────────────────────

alter table public.organizations enable row level security;
alter table public.users enable row level security;

-- organizations: cada quien ve (y edita, si es admin vía app) solo la suya
create policy "members_select_own_org" on public.organizations
  for select using (id = public.current_org_id());
create policy "members_update_own_org" on public.organizations
  for update using (id = public.current_org_id())
  with check (id = public.current_org_id());

-- users: visibles dentro de la misma org; cada quien edita su propio perfil
create policy "members_select_org_users" on public.users
  for select using (organization_id = public.current_org_id());
create policy "user_update_self" on public.users
  for update using (id = auth.uid())
  with check (id = auth.uid() and organization_id = public.current_org_id());

-- Resto de tablas: aislamiento total por organization_id
do $$
declare
  t text;
begin
  foreach t in array array[
    'leads', 'lead_events', 'conversations', 'messages', 'calls',
    'meetings', 'cadences', 'cadence_steps', 'lead_cadence_state',
    'clients', 'documents', 'policies', 'portfolio_events',
    'action_queue', 'message_variants', 'playbook_insights',
    'lead_predictions', 'agent_actions', 'tasks'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "org_isolation" on public.%I
       for all using (organization_id = public.current_org_id())
       with check (organization_id = public.current_org_id())',
      t
    );
  end loop;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Signup: al crear un usuario en auth se crea su organization
-- (role admin) o se une a una existente si viene en metadata.
-- ─────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_role public.user_role;
begin
  if new.raw_user_meta_data ? 'organization_id' then
    -- Invitación / seed: se une a una org existente
    v_org_id := (new.raw_user_meta_data ->> 'organization_id')::uuid;
    v_role := coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'agent');
  else
    -- Registro normal: crea su propia org y queda como admin
    insert into public.organizations (name)
    values (coalesce(nullif(trim(new.raw_user_meta_data ->> 'organization_name'), ''), 'Mi organización'))
    returning id into v_org_id;
    v_role := 'admin';
  end if;

  insert into public.users (id, organization_id, email, full_name, role)
  values (
    new.id,
    v_org_id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), new.email),
    v_role
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
