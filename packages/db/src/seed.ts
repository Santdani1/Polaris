/**
 * Seed de datos demo para Fase 0 (vía supabase-js con service role).
 *
 * Crea: 1 org "Promotoría Demo", 2 usuarios (admin + agent), 25 leads
 * distribuidos en la máquina de estados, 3 meetings, 2 conversaciones de
 * WhatsApp con 10 mensajes, y 30 agent_actions de los subagentes.
 *
 * Los datos viven en seed-data.ts (compartidos con el seed por SQL directo
 * usado en Lovable Cloud, que no expone el service role key).
 *
 * Uso: pnpm db:seed  (requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY)
 */
import type { SupabaseClient } from "@supabase/supabase-js";
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
import { createServiceClient, loadDbEnv } from "./service-client";

function findLeadId(leads: { id: string; name: string }[], name: string): string {
  const lead = leads.find((l) => l.name === name);
  if (!lead) throw new Error(`Lead seed no encontrado: ${name}`);
  return lead.id;
}

async function main() {
  loadDbEnv();
  const db: SupabaseClient = createServiceClient();

  // ── Idempotencia: no duplicar la org demo
  const { data: existing } = await db
    .from("organizations")
    .select("id")
    .eq("slug", ORG_SLUG)
    .maybeSingle();
  if (existing) {
    console.log(`La organización "${ORG_NAME}" ya existe (${existing.id}). Borra la org o resetea la DB antes de re-seedear.`);
    return;
  }

  // ── 1. Organización
  const { data: org, error: orgError } = await db
    .from("organizations")
    .insert({ name: ORG_NAME, slug: ORG_SLUG })
    .select("id")
    .single();
  if (orgError || !org) throw orgError ?? new Error("No se pudo crear la organización");
  console.log(`✓ Organización "${ORG_NAME}" (${org.id})`);

  // ── 2. Usuarios (el trigger handle_new_user crea las filas en public.users)
  const { data: adminUser, error: adminError } = await db.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    // organization_id/role van en app_metadata (server-side only, ver trigger)
    app_metadata: { organization_id: org.id, role: "admin" },
    user_metadata: { full_name: "Daniel Guzmán" },
  });
  if (adminError || !adminUser.user) throw adminError ?? new Error("No se pudo crear el admin");

  const { data: agentUser, error: agentError } = await db.auth.admin.createUser({
    email: AGENT_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    app_metadata: { organization_id: org.id, role: "agent" },
    user_metadata: { full_name: "Sofía Ramírez" },
  });
  if (agentError || !agentUser.user) throw agentError ?? new Error("No se pudo crear el agente");

  const adminId = adminUser.user.id;
  const agentId = agentUser.user.id;

  await db.from("users").update({ whatsapp_phone: "+52 55 5555 0100" }).eq("id", adminId);
  await db.from("users").update({ whatsapp_phone: "+52 55 5555 0200" }).eq("id", agentId);
  console.log(`✓ Usuarios: ${ADMIN_EMAIL} (admin), ${AGENT_EMAIL} (agent) — password: ${DEMO_PASSWORD}`);

  // ── 3. Leads
  const leadRows = SEED_LEADS.map((l, i) => ({
    organization_id: org.id,
    name: l.name,
    phone: l.phone ?? null,
    email: l.email ?? null,
    linkedin_url: l.linkedin_url ?? null,
    company: l.company,
    title: l.title,
    city: l.city,
    source: l.source,
    icp_score: l.icp_score || null,
    status: l.status,
    assigned_agent_id: i % 2 === 0 ? adminId : agentId,
    enrichment: l.enrichment,
    entry_angle: l.entry_angle || null,
    lost_reason: l.lost_reason ?? null,
    created_at: l.created_days_ago === 0 ? todayHoursAgo(3 + (i % 5)) : daysAgo(l.created_days_ago),
  }));
  const { data: leads, error: leadsError } = await db
    .from("leads")
    .insert(leadRows)
    .select("id, name, status");
  if (leadsError || !leads) throw leadsError ?? new Error("No se pudieron crear los leads");
  console.log(`✓ ${leads.length} leads`);

  // ── 4. lead_events (timeline mínimo: alta + estado actual)
  const leadEvents = leads.flatMap((lead) => {
    const seedLead = SEED_LEADS.find((s) => s.name === lead.name);
    const events: Record<string, unknown>[] = [
      {
        organization_id: org.id,
        lead_id: lead.id,
        type: "lead_created",
        actor: seedLead?.source === "referral" ? "human:daniel" : "agent:hunter",
        payload: { source: seedLead?.source },
        occurred_at: daysAgo(seedLead?.created_days_ago ?? 0),
      },
    ];
    if (lead.status !== "NEW") {
      events.push({
        organization_id: org.id,
        lead_id: lead.id,
        type: "status_changed",
        actor: "agent:hunter",
        payload: { from: "NEW", to: lead.status },
        occurred_at: daysAgo(Math.max((seedLead?.created_days_ago ?? 1) - 1, 0)),
      });
    }
    return events;
  });
  const { error: eventsError } = await db.from("lead_events").insert(leadEvents);
  if (eventsError) throw eventsError;
  console.log(`✓ ${leadEvents.length} lead_events`);

  // ── 5. Meetings: 1 won, 1 pendiente de outcome, 1 futura
  const { error: meetingsError } = await db.from("meetings").insert([
    {
      organization_id: org.id,
      lead_id: findLeadId(leads, "Ricardo Peña"),
      agent_id: adminId,
      calendar_event_id: "demo-evt-001",
      starts_at: daysAgo(2, 11),
      ends_at: daysAgo(2, 12),
      status: "completed",
      outcome: "won",
      outcome_captured_at: daysAgo(2, 14),
      outcome_notes: "Cerró Vida + GMM familiar. Prima anual ~$85,000 MXN. Pedir referidos en 7 días.",
    },
    {
      organization_id: org.id,
      lead_id: findLeadId(leads, "Patricia Zamudio"),
      agent_id: agentId,
      calendar_event_id: "demo-evt-002",
      starts_at: todayHoursAgo(5),
      ends_at: todayHoursAgo(4),
      status: "completed",
      outcome: null, // SENTINEL preguntará el outcome (Fase 3)
    },
    {
      organization_id: org.id,
      lead_id: findLeadId(leads, "Adriana Quintero"),
      agent_id: adminId,
      calendar_event_id: "demo-evt-003",
      starts_at: daysFromNow(2, 12),
      ends_at: daysFromNow(2, 13),
      status: "scheduled",
    },
  ]);
  if (meetingsError) throw meetingsError;
  console.log("✓ 3 meetings (won / outcome pendiente / futura)");

  // ── 6. Conversaciones de WhatsApp con mensajes creíbles
  const { data: convos, error: convosError } = await db
    .from("conversations")
    .insert(
      SEED_CONVERSATION_LEADS.map((leadName) => ({
        organization_id: org.id,
        lead_id: findLeadId(leads, leadName),
        channel: "whatsapp",
        status: "open",
      }))
    )
    .select("id, lead_id");
  if (convosError || !convos) throw convosError ?? new Error("No se pudieron crear las conversaciones");

  const convoByLead = new Map(convos.map((c) => [c.lead_id, c.id]));
  const { error: messagesError } = await db.from("messages").insert(
    SEED_MESSAGES.map((m) => ({
      organization_id: org.id,
      conversation_id: convoByLead.get(findLeadId(leads, m.leadName)),
      direction: m.direction,
      sender: m.sender,
      content: m.content,
      sent_at: hoursAgo(m.hoursBack),
    }))
  );
  if (messagesError) throw messagesError;
  console.log(`✓ ${SEED_CONVERSATION_LEADS.length} conversaciones de WhatsApp con ${SEED_MESSAGES.length} mensajes`);

  // ── 7. 30 agent_actions de los distintos subagentes
  const actionRows = SEED_ACTIONS.map((a) => ({
    organization_id: org.id,
    subagent: a.subagent,
    action: a.action,
    lead_id: a.leadName ? findLeadId(leads, a.leadName) : null,
    tokens: 300 + Math.floor(Math.random() * 1500),
    cost: Number((0.002 + Math.random() * 0.02).toFixed(6)),
    payload: { summary: a.summary },
    at: a.day === "today" ? todayHoursAgo(a.hoursBack) : hoursAgo(a.hoursBack),
  }));
  const { error: actionsError } = await db.from("agent_actions").insert(actionRows);
  if (actionsError) throw actionsError;
  console.log(`✓ ${actionRows.length} agent_actions`);

  console.log("\nSeed completo 🎉");
  console.log(`  Login demo → ${ADMIN_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`             → ${AGENT_EMAIL} / ${DEMO_PASSWORD}`);
}

main().catch((err) => {
  console.error("Seed falló:", err);
  process.exit(1);
});
