/**
 * Emite el seed demo como SQL puro (stdout).
 *
 * Para backends donde no hay service role key disponible (p. ej. Lovable
 * Cloud) y el seed se aplica con un runner de SQL como usuario postgres.
 * Crea los usuarios directamente en auth.users/auth.identities con el
 * password cifrado (bcrypt vía pgcrypto), y deja que el trigger
 * handle_new_user cree las filas de public.users.
 *
 * Uso: pnpm --filter @polaris/db db:seed:sql > seed.sql
 */
import { randomUUID } from "node:crypto";
import {
  ADMIN_EMAIL,
  AGENT_EMAIL,
  DEMO_PASSWORD,
  ORG_NAME,
  ORG_SLUG,
  SEED_ACTIONS,
  SEED_CONVERSATION_LEADS,
  SEED_LEADS,
  SEED_MESSAGES,
  daysAgo,
  daysFromNow,
  hoursAgo,
  todayHoursAgo,
} from "./seed-data";

const q = (v: string | null | undefined): string =>
  v === null || v === undefined ? "null" : `'${v.replace(/'/g, "''")}'`;
const qj = (v: unknown): string => `${q(JSON.stringify(v))}::jsonb`;

const orgId = randomUUID();
const adminId = randomUUID();
const agentId = randomUUID();
const leadIds = new Map(SEED_LEADS.map((l) => [l.name, randomUUID()]));
const leadId = (name: string): string => {
  const id = leadIds.get(name);
  if (!id) throw new Error(`Lead seed no encontrado: ${name}`);
  return id;
};

const lines: string[] = [];
lines.push("-- Seed demo de POLARIS (generado por emit-seed-sql.ts)");
lines.push("begin;");

// ── 1. Organización
lines.push(`insert into public.organizations (id, name, slug) values ('${orgId}', ${q(ORG_NAME)}, ${q(ORG_SLUG)});`);

// ── 2. Usuarios en auth (el trigger crea public.users)
function authUserSql(id: string, email: string, fullName: string, role: "admin" | "agent"): string {
  const appMeta = { provider: "email", providers: ["email"], organization_id: orgId, role };
  const userMeta = { full_name: fullName };
  return `
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '${id}', 'authenticated', 'authenticated',
  ${q(email)}, extensions.crypt(${q(DEMO_PASSWORD)}, extensions.gen_salt('bf')), now(),
  ${qj(appMeta)}, ${qj(userMeta)}, now(), now(), '', '', '', ''
);
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(), '${id}', '${id}',
  ${qj({ sub: id, email, email_verified: true })}, 'email', now(), now(), now()
);`;
}
lines.push(authUserSql(adminId, ADMIN_EMAIL, "Daniel Guzmán", "admin"));
lines.push(authUserSql(agentId, AGENT_EMAIL, "Sofía Ramírez", "agent"));
lines.push(`update public.users set whatsapp_phone = '+52 55 5555 0100' where id = '${adminId}';`);
lines.push(`update public.users set whatsapp_phone = '+52 55 5555 0200' where id = '${agentId}';`);

// ── 3. Leads
for (const [i, l] of SEED_LEADS.entries()) {
  const createdAt = l.created_days_ago === 0 ? todayHoursAgo(3 + (i % 5)) : daysAgo(l.created_days_ago);
  lines.push(
    `insert into public.leads (id, organization_id, name, phone, email, linkedin_url, company, title, city, source, icp_score, status, assigned_agent_id, enrichment, entry_angle, lost_reason, created_at) values (` +
      `'${leadId(l.name)}', '${orgId}', ${q(l.name)}, ${q(l.phone ?? null)}, ${q(l.email ?? null)}, ${q(l.linkedin_url ?? null)}, ` +
      `${q(l.company)}, ${q(l.title)}, ${q(l.city)}, '${l.source}', ${l.icp_score || "null"}, '${l.status}', ` +
      `'${i % 2 === 0 ? adminId : agentId}', ${qj(l.enrichment)}, ${q(l.entry_angle || null)}, ${q(l.lost_reason ?? null)}, '${createdAt}');`
  );
}

// ── 4. lead_events
for (const l of SEED_LEADS) {
  const actor = l.source === "referral" ? "human:daniel" : "agent:hunter";
  lines.push(
    `insert into public.lead_events (organization_id, lead_id, type, actor, payload, occurred_at) values ` +
      `('${orgId}', '${leadId(l.name)}', 'lead_created', ${q(actor)}, ${qj({ source: l.source })}, '${daysAgo(l.created_days_ago)}');`
  );
  if (l.status !== "NEW") {
    lines.push(
      `insert into public.lead_events (organization_id, lead_id, type, actor, payload, occurred_at) values ` +
        `('${orgId}', '${leadId(l.name)}', 'status_changed', 'agent:hunter', ${qj({ from: "NEW", to: l.status })}, '${daysAgo(Math.max(l.created_days_ago - 1, 0))}');`
    );
  }
}

// ── 5. Meetings
lines.push(
  `insert into public.meetings (organization_id, lead_id, agent_id, calendar_event_id, starts_at, ends_at, status, outcome, outcome_captured_at, outcome_notes) values ` +
    `('${orgId}', '${leadId("Ricardo Peña")}', '${adminId}', 'demo-evt-001', '${daysAgo(2, 11)}', '${daysAgo(2, 12)}', 'completed', 'won', '${daysAgo(2, 14)}', ${q("Cerró Vida + GMM familiar. Prima anual ~$85,000 MXN. Pedir referidos en 7 días.")});`
);
lines.push(
  `insert into public.meetings (organization_id, lead_id, agent_id, calendar_event_id, starts_at, ends_at, status, outcome) values ` +
    `('${orgId}', '${leadId("Patricia Zamudio")}', '${agentId}', 'demo-evt-002', '${todayHoursAgo(5)}', '${todayHoursAgo(4)}', 'completed', null);`
);
lines.push(
  `insert into public.meetings (organization_id, lead_id, agent_id, calendar_event_id, starts_at, ends_at, status) values ` +
    `('${orgId}', '${leadId("Adriana Quintero")}', '${adminId}', 'demo-evt-003', '${daysFromNow(2, 12)}', '${daysFromNow(2, 13)}', 'scheduled');`
);

// ── 6. Conversaciones + mensajes
const convoIds = new Map<string, string>(SEED_CONVERSATION_LEADS.map((name) => [name, randomUUID()]));
for (const [name, id] of convoIds) {
  lines.push(
    `insert into public.conversations (id, organization_id, lead_id, channel, status) values ('${id}', '${orgId}', '${leadId(name)}', 'whatsapp', 'open');`
  );
}
for (const m of SEED_MESSAGES) {
  lines.push(
    `insert into public.messages (organization_id, conversation_id, direction, sender, content, sent_at) values ` +
      `('${orgId}', '${convoIds.get(m.leadName)}', '${m.direction}', '${m.sender}', ${q(m.content)}, '${hoursAgo(m.hoursBack)}');`
  );
}

// ── 7. agent_actions
for (const a of SEED_ACTIONS) {
  const at = a.day === "today" ? todayHoursAgo(a.hoursBack) : hoursAgo(a.hoursBack);
  const tokens = 300 + Math.floor(Math.random() * 1500);
  const cost = (0.002 + Math.random() * 0.02).toFixed(6);
  lines.push(
    `insert into public.agent_actions (organization_id, subagent, action, lead_id, tokens, cost, payload, at) values ` +
      `('${orgId}', '${a.subagent}', ${q(a.action)}, ${a.leadName ? `'${leadId(a.leadName)}'` : "null"}, ${tokens}, ${cost}, ${qj({ summary: a.summary })}, '${at}');`
  );
}

lines.push("commit;");
console.log(lines.join("\n"));
