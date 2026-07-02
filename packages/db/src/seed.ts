/**
 * Seed de datos demo para Fase 0.
 *
 * Crea: 1 org "Promotoría Demo", 2 usuarios (admin + agent), 25 leads
 * distribuidos en la máquina de estados, 3 meetings, 2 conversaciones de
 * WhatsApp con 10 mensajes, y 30 agent_actions de los subagentes.
 *
 * Uso: pnpm db:seed  (requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY)
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeadSource, LeadStatus, Subagent } from "@polaris/shared";
import { createServiceClient, loadDbEnv } from "./service-client";

const ORG_NAME = "Promotoría Demo";
const ORG_SLUG = "promotoria-demo";
const DEMO_PASSWORD = "polaris-demo-2026";

const ADMIN_EMAIL = "admin@promotoriademo.mx";
const AGENT_EMAIL = "sofia@promotoriademo.mx";

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}
function daysAgo(d: number, hourOfDay = 10): string {
  const date = new Date(Date.now() - d * 86_400_000);
  date.setHours(hourOfDay, Math.floor(Math.random() * 50), 0, 0);
  return date.toISOString();
}
function daysFromNow(d: number, hourOfDay = 10): string {
  const date = new Date(Date.now() + d * 86_400_000);
  date.setHours(hourOfDay, 0, 0, 0);
  return date.toISOString();
}
/** Hoy, hace `h` horas — sin cruzar la medianoche (para los contadores del día). */
function todayHoursAgo(h: number): string {
  const now = new Date();
  const candidate = new Date(Date.now() - h * 3_600_000);
  if (candidate.getDate() !== now.getDate()) {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 5, 0, 0);
    return startOfDay.toISOString();
  }
  return candidate.toISOString();
}

interface SeedLead {
  name: string;
  phone?: string;
  email?: string;
  linkedin_url?: string;
  company: string;
  title: string;
  city: string;
  source: LeadSource;
  icp_score: number;
  status: LeadStatus;
  entry_angle: string;
  enrichment: Record<string, unknown>;
  created_days_ago: number;
  lost_reason?: string;
}

// 25 leads distribuidos en los estados de la sección 4 de CLAUDE.md,
// con enrichment realista de prospectos de seguros en México.
const SEED_LEADS: SeedLead[] = [
  // ── NEW (3)
  {
    name: "Alejandro Fuentes",
    company: "Transportes Fuentes e Hijos",
    title: "Director General",
    city: "CDMX",
    source: "scraping",
    icp_score: 0,
    status: "NEW",
    entry_angle: "",
    enrichment: {},
    created_days_ago: 0,
  },
  {
    name: "Brenda Salgado",
    company: "Clínica Dental Salgado",
    title: "Fundadora",
    city: "Querétaro",
    source: "scraping",
    icp_score: 0,
    status: "NEW",
    entry_angle: "",
    enrichment: {},
    created_days_ago: 0,
  },
  {
    name: "Iván Cortés",
    linkedin_url: "https://www.linkedin.com/in/ivan-cortes-demo",
    company: "Grupo Constructor Cortés",
    title: "Socio Director",
    city: "Monterrey",
    source: "linkedin",
    icp_score: 0,
    status: "NEW",
    entry_angle: "",
    enrichment: {},
    created_days_ago: 0,
  },
  // ── ENRICHED (4)
  {
    name: "Mariana Solís",
    linkedin_url: "https://www.linkedin.com/in/mariana-solis-demo",
    company: "Solís & Asociados Contadores",
    title: "Socia Fundadora",
    city: "CDMX",
    source: "linkedin",
    icp_score: 82,
    status: "ENRICHED",
    entry_angle: "Acaba de abrir segunda oficina en Polanco; protección patrimonial para el despacho y GMM para sus 12 empleados.",
    enrichment: {
      age_range: "38-42",
      family: "Casada, 2 hijos (4 y 7 años)",
      business: "Despacho contable, 12 empleados, clientes PyME",
      life_signals: ["Abrió segunda oficina hace 1 mes", "Publicó sobre contratación de personal"],
    },
    created_days_ago: 0,
  },
  {
    name: "Rodrigo Ávila",
    linkedin_url: "https://www.linkedin.com/in/rodrigo-avila-demo",
    company: "Avanta Logística",
    title: "Director de Operaciones",
    city: "Guadalajara",
    source: "linkedin",
    icp_score: 74,
    status: "ENRICHED",
    entry_angle: "Cambió de puesto hace 2 meses (ascenso a dirección); momento clásico para revisar protección de ingresos y ahorro para retiro.",
    enrichment: {
      age_range: "35-40",
      family: "Casado, 1 hija recién nacida",
      business: "Logística de última milla, ~80 empleados",
      life_signals: ["Ascenso reciente", "Nació su primera hija (post en LinkedIn)"],
    },
    created_days_ago: 1,
  },
  {
    name: "Paola Rentería",
    company: "Rentería Bienes Raíces",
    title: "Directora Comercial",
    city: "CDMX",
    source: "scraping",
    icp_score: 68,
    status: "ENRICHED",
    entry_angle: "Ingresos por comisión sin prestaciones; ángulo de ahorro con protección (plan personalizado de retiro).",
    enrichment: {
      age_range: "33-37",
      family: "Soltera, sin hijos",
      business: "Inmobiliaria boutique, ingresos variables altos",
      life_signals: ["Compró coche nuevo (publicación reciente)"],
    },
    created_days_ago: 1,
  },
  {
    name: "Gerardo Limón",
    linkedin_url: "https://www.linkedin.com/in/gerardo-limon-demo",
    company: "Limón Agroindustrias",
    title: "Director General",
    city: "Culiacán",
    source: "linkedin",
    icp_score: 79,
    status: "ENRICHED",
    entry_angle: "Negocio familiar de segunda generación; ángulo de plan de sucesión y hombre clave.",
    enrichment: {
      age_range: "45-50",
      family: "Casado, 3 hijos (2 en universidad)",
      business: "Agroindustria familiar, ~200 empleados",
      life_signals: ["Hijo mayor entró a la operación del negocio"],
    },
    created_days_ago: 2,
  },
  // ── QUALIFIED (3)
  {
    name: "Fernanda Ocampo",
    phone: "+52 55 1111 0001",
    linkedin_url: "https://www.linkedin.com/in/fernanda-ocampo-demo",
    company: "Ocampo Legal",
    title: "Socia",
    city: "CDMX",
    source: "linkedin",
    icp_score: 88,
    status: "QUALIFIED",
    entry_angle: "Abogada corporativa con 2 hijos pequeños; sin seguro de vida propio (confirmado en conversación previa de networking).",
    enrichment: {
      age_range: "36-40",
      family: "Casada, 2 hijos (2 y 5 años)",
      business: "Despacho legal boutique, 8 abogados",
      life_signals: ["Compró casa en Interlomas hace 3 meses"],
    },
    created_days_ago: 3,
  },
  {
    name: "Héctor Manzano",
    phone: "+52 81 1111 0002",
    company: "Manzano Distribución Médica",
    title: "Dueño",
    city: "Monterrey",
    source: "referral",
    icp_score: 91,
    status: "QUALIFIED",
    entry_angle: "Referido de cliente actual (Raúl Vega); interesado en GMM familiar y seguro de hombre clave para su distribuidora.",
    enrichment: {
      age_range: "42-46",
      family: "Casado, 2 hijos adolescentes",
      business: "Distribución de equipo médico, 35 empleados",
      life_signals: ["Referido directo: su primo acaba de asegurar a su familia"],
    },
    created_days_ago: 3,
  },
  {
    name: "Lucía Barrios",
    phone: "+52 33 1111 0003",
    linkedin_url: "https://www.linkedin.com/in/lucia-barrios-demo",
    company: "Barrios Arquitectura",
    title: "Directora",
    city: "Guadalajara",
    source: "linkedin",
    icp_score: 76,
    status: "QUALIFIED",
    entry_angle: "Emprendedora sin plan de retiro formal; ángulo de ahorro educativo para sus hijos + retiro.",
    enrichment: {
      age_range: "38-42",
      family: "Divorciada, 2 hijos (8 y 11 años)",
      business: "Despacho de arquitectura, proyectos residenciales premium",
      life_signals: ["Ganó licitación de desarrollo residencial"],
    },
    created_days_ago: 4,
  },
  // ── CONTACTED (4)
  {
    name: "Emilio Zárate",
    phone: "+52 55 1111 0004",
    linkedin_url: "https://www.linkedin.com/in/emilio-zarate-demo",
    company: "Zárate Consultores Fiscales",
    title: "Socio Director",
    city: "CDMX",
    source: "linkedin",
    icp_score: 84,
    status: "CONTACTED",
    entry_angle: "Fiscalista con ingresos altos; ángulo de instrumentos de ahorro con beneficio fiscal (art. 151 LISR).",
    enrichment: {
      age_range: "40-45",
      family: "Casado, 1 hijo",
      business: "Consultoría fiscal para corporativos",
      life_signals: ["Publicó sobre cierre fiscal y deducciones personales"],
    },
    created_days_ago: 5,
  },
  {
    name: "Renata Villaseñor",
    phone: "+52 442 111 0005",
    company: "Villaseñor Interiorismo",
    title: "Fundadora",
    city: "Querétaro",
    source: "referral",
    icp_score: 71,
    status: "CONTACTED",
    entry_angle: "Referida por Lucía Barrios; recién casada, planeando familia — ángulo de vida + GMM en pareja.",
    enrichment: {
      age_range: "30-34",
      family: "Recién casada",
      business: "Estudio de interiorismo, 6 personas",
      life_signals: ["Boda hace 4 meses"],
    },
    created_days_ago: 5,
  },
  {
    name: "Marco Antonio Reyes",
    phone: "+52 81 1111 0006",
    linkedin_url: "https://www.linkedin.com/in/marco-reyes-demo",
    company: "Reyes Maquinados Industriales",
    title: "Director General",
    city: "Monterrey",
    source: "linkedin",
    icp_score: 77,
    status: "CONTACTED",
    entry_angle: "Industrial con planta propia; ángulo de protección de hombre clave + GMM colectivo para retener técnicos.",
    enrichment: {
      age_range: "48-52",
      family: "Casado, 3 hijos (1 en universidad en EUA)",
      business: "Maquinados CNC, 60 empleados, exporta a Texas",
      life_signals: ["Hijo estudiando fuera — gasto fuerte recurrente"],
    },
    created_days_ago: 6,
  },
  {
    name: "Daniela Cepeda",
    phone: "+52 33 1111 0007",
    company: "Cepeda Nutrición Clínica",
    title: "Directora",
    city: "Guadalajara",
    source: "scraping",
    icp_score: 65,
    status: "CONTACTED",
    entry_angle: "Profesionista independiente del sector salud; conoce el valor del GMM — entrada por gastos médicos, luego vida.",
    enrichment: {
      age_range: "34-38",
      family: "Casada, 1 hijo (3 años)",
      business: "Consultorio propio + consultoría a empresas",
      life_signals: ["Abrió segundo consultorio"],
    },
    created_days_ago: 7,
  },
  // ── ENGAGED (3)
  {
    name: "Javier Montaño",
    phone: "+52 55 1111 0008",
    linkedin_url: "https://www.linkedin.com/in/javier-montano-demo",
    company: "Montaño Tech Solutions",
    title: "CEO",
    city: "CDMX",
    source: "linkedin",
    icp_score: 86,
    status: "ENGAGED",
    entry_angle: "Fundador de software house, 2 hijos chicos; le preocupa qué pasa con su familia y la empresa si él falta.",
    enrichment: {
      age_range: "37-41",
      family: "Casado, 2 hijos (1 y 4 años)",
      business: "Software house, 25 desarrolladores, clientes en EUA",
      life_signals: ["Segundo hijo hace 1 año", "Firmó contrato grande con cliente de Austin"],
    },
    created_days_ago: 9,
  },
  {
    name: "Carolina Ibáñez",
    phone: "+52 55 1111 0009",
    company: "Ibáñez y Asociados Aduanas",
    title: "Directora General",
    city: "CDMX",
    source: "referral",
    icp_score: 80,
    status: "ENGAGED",
    entry_angle: "Referida por cliente de cartera; quiere plan educativo para sus hijas y revisar su GMM actual (lo siente caro).",
    enrichment: {
      age_range: "41-45",
      family: "Casada, 2 hijas (9 y 12 años)",
      business: "Agencia aduanal, oficinas en CDMX y Veracruz",
      life_signals: ["Mencionó que su GMM subió 30% en renovación"],
    },
    created_days_ago: 10,
  },
  {
    name: "Óscar Valdez",
    phone: "+52 81 1111 0010",
    company: "Valdez Empaques del Norte",
    title: "Director Comercial",
    city: "Monterrey",
    source: "linkedin",
    icp_score: 72,
    status: "ENGAGED",
    entry_angle: "Preguntó directamente por seguros de ahorro tras post de LinkedIn; interesado en plan a 15 años.",
    enrichment: {
      age_range: "39-43",
      family: "Casado, 1 hijo (6 años)",
      business: "Empaques industriales, negocio familiar",
      life_signals: ["Comentó post sobre ahorro para el retiro"],
    },
    created_days_ago: 11,
  },
  // ── MEETING_SET (2)
  {
    name: "Adriana Quintero",
    phone: "+52 55 1111 0011",
    linkedin_url: "https://www.linkedin.com/in/adriana-quintero-demo",
    company: "Quintero Farma",
    title: "Directora General",
    city: "CDMX",
    source: "linkedin",
    icp_score: 92,
    status: "MEETING_SET",
    entry_angle: "Dueña de cadena de farmacias (5 sucursales); cita para plan patrimonial completo: vida, GMM familiar y hombre clave.",
    enrichment: {
      age_range: "44-48",
      family: "Casada, 3 hijos",
      business: "5 farmacias en CDMX sur, ~40 empleados",
      life_signals: ["Abrió quinta sucursal", "Su contador le recomendó protección patrimonial"],
    },
    created_days_ago: 12,
  },
  {
    name: "Tomás Herrera",
    phone: "+52 33 1111 0012",
    company: "Herrera Talleres Automotrices",
    title: "Dueño",
    city: "Guadalajara",
    source: "referral",
    icp_score: 83,
    status: "MEETING_SET",
    entry_angle: "Referido de cliente; quiere GMM para su familia después del susto de salud de su socio.",
    enrichment: {
      age_range: "46-50",
      family: "Casado, 2 hijos",
      business: "3 talleres automotrices, 25 empleados",
      life_signals: ["Su socio tuvo un infarto hace 2 meses — urgencia real"],
    },
    created_days_ago: 14,
  },
  // ── MEETING_HELD (1) — cita de hoy, outcome pendiente (SENTINEL preguntará)
  {
    name: "Patricia Zamudio",
    phone: "+52 55 1111 0013",
    company: "Zamudio Eventos Corporativos",
    title: "Directora",
    city: "CDMX",
    source: "linkedin",
    icp_score: 78,
    status: "MEETING_HELD",
    entry_angle: "Empresaria de eventos; interesada en vida con ahorro tras la plática inicial por WhatsApp.",
    enrichment: {
      age_range: "40-44",
      family: "Casada, 1 hija (10 años)",
      business: "Agencia de eventos corporativos, 15 empleados fijos",
      life_signals: ["Recuperó facturación post-temporada baja"],
    },
    created_days_ago: 16,
  },
  // ── WON (1)
  {
    name: "Ricardo Peña",
    phone: "+52 81 1111 0014",
    company: "Peña Refacciones Industriales",
    title: "Director General",
    city: "Monterrey",
    source: "referral",
    icp_score: 95,
    status: "WON",
    entry_angle: "Referido caliente; cerró Vida + GMM familiar en la primera cita.",
    enrichment: {
      age_range: "43-47",
      family: "Casado, 2 hijos (7 y 13 años)",
      business: "Refaccionaria industrial, 3 sucursales",
      life_signals: ["Referido por su hermano (cliente con 2 pólizas)"],
    },
    created_days_ago: 18,
  },
  // ── HOT_FOLLOWUP (1)
  {
    name: "Claudia Espinoza",
    phone: "+52 55 1111 0015",
    company: "Espinoza Marketing Digital",
    title: "CEO",
    city: "CDMX",
    source: "linkedin",
    icp_score: 81,
    status: "HOT_FOLLOWUP",
    entry_angle: "Tuvo su cita, quedó convencida del plan de ahorro; pidió una semana para revisar números con su esposo.",
    enrichment: {
      age_range: "35-39",
      family: "Casada, embarazada del primer hijo",
      business: "Agencia de marketing, 18 empleados",
      life_signals: ["Embarazo — máxima receptividad a protección familiar"],
    },
    created_days_ago: 20,
  },
  // ── LOST (1)
  {
    name: "Arturo Bermúdez",
    phone: "+52 33 1111 0016",
    company: "Bermúdez Ferreterías",
    title: "Dueño",
    city: "Guadalajara",
    source: "scraping",
    icp_score: 62,
    status: "LOST",
    entry_angle: "Dueño de ferreterías; la propuesta de GMM le pareció fuera de presupuesto este año.",
    enrichment: {
      age_range: "50-54",
      family: "Casado, 3 hijos adultos",
      business: "2 ferreterías familiares",
      life_signals: [],
    },
    created_days_ago: 22,
    lost_reason: "Presupuesto: lo ve caro este año, retomar en enero con propuesta ajustada",
  },
  // ── NO_SHOW (1)
  {
    name: "Sergio Madrigal",
    phone: "+52 55 1111 0017",
    company: "Madrigal Importaciones",
    title: "Director",
    city: "CDMX",
    source: "linkedin",
    icp_score: 69,
    status: "NO_SHOW",
    entry_angle: "Importador interesado en GMM; no se presentó a la primera cita, reagendando.",
    enrichment: {
      age_range: "38-42",
      family: "Soltero",
      business: "Importación de electrónica",
      life_signals: ["Viaja mucho — probable causa del no-show"],
    },
    created_days_ago: 15,
  },
  // ── RE_NURTURE_90D (1)
  {
    name: "Gabriela Mireles",
    phone: "+52 442 111 0018",
    company: "Mireles Textiles",
    title: "Directora General",
    city: "Querétaro",
    source: "linkedin",
    icp_score: 66,
    status: "RE_NURTURE_90D",
    entry_angle: "No cerró en marzo (cambio de casa absorbió liquidez); re-contactar en septiembre con plan educativo.",
    enrichment: {
      age_range: "37-41",
      family: "Casada, 2 hijos",
      business: "Maquila textil, 45 empleados",
      life_signals: ["Se mudó de casa — liquidez comprometida temporalmente"],
    },
    created_days_ago: 95,
    lost_reason: "Timing: compra de casa absorbió su liquidez, pidió retomar en 3 meses",
  },
];

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
    user_metadata: {
      organization_id: org.id,
      role: "admin",
      full_name: "Daniel Guzmán",
    },
  });
  if (adminError || !adminUser.user) throw adminError ?? new Error("No se pudo crear el admin");

  const { data: agentUser, error: agentError } = await db.auth.admin.createUser({
    email: AGENT_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      organization_id: org.id,
      role: "agent",
      full_name: "Sofía Ramírez",
    },
  });
  if (agentError || !agentUser.user) throw agentError ?? new Error("No se pudo crear el agente");

  const adminId = adminUser.user.id;
  const agentId = agentUser.user.id;

  await db
    .from("users")
    .update({ whatsapp_phone: "+52 55 5555 0100" })
    .eq("id", adminId);
  await db
    .from("users")
    .update({ whatsapp_phone: "+52 55 5555 0200" })
    .eq("id", agentId);
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
  const wonLeadId = findLeadId(leads, "Ricardo Peña");
  const heldLeadId = findLeadId(leads, "Patricia Zamudio");
  const futureLeadId = findLeadId(leads, "Adriana Quintero");

  const { error: meetingsError } = await db.from("meetings").insert([
    {
      organization_id: org.id,
      lead_id: wonLeadId,
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
      lead_id: heldLeadId,
      agent_id: agentId,
      calendar_event_id: "demo-evt-002",
      starts_at: todayHoursAgo(5),
      ends_at: todayHoursAgo(4),
      status: "completed",
      outcome: null, // SENTINEL preguntará el outcome (Fase 3)
    },
    {
      organization_id: org.id,
      lead_id: futureLeadId,
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
  const javierId = findLeadId(leads, "Javier Montaño");
  const adrianaId = findLeadId(leads, "Adriana Quintero");

  const { data: convos, error: convosError } = await db
    .from("conversations")
    .insert([
      { organization_id: org.id, lead_id: javierId, channel: "whatsapp", status: "open" },
      { organization_id: org.id, lead_id: adrianaId, channel: "whatsapp", status: "open" },
    ])
    .select("id, lead_id");
  if (convosError || !convos) throw convosError ?? new Error("No se pudieron crear las conversaciones");

  const javierConvo = convos.find((c) => c.lead_id === javierId)!.id;
  const adrianaConvo = convos.find((c) => c.lead_id === adrianaId)!.id;

  const msg = (
    conversation_id: string,
    direction: "in" | "out",
    sender: "ai" | "lead",
    content: string,
    hoursBack: number
  ) => ({
    organization_id: org.id,
    conversation_id,
    direction,
    sender,
    content,
    sent_at: hoursAgo(hoursBack),
  });

  const { error: messagesError } = await db.from("messages").insert([
    // Conversación 1 — Javier Montaño (ENGAGED)
    msg(javierConvo, "out", "ai", "Hola Javier, ¿qué tal? Soy Alex, asistente de Daniel Guzmán, asesor de MetLife. Vi que Montaño Tech va creciendo fuerte — felicidades por el contrato con el cliente de Austin. Daniel trabaja con varios fundadores de tecnología ayudándoles a proteger a su familia y a su empresa. ¿Te late si te comparto cómo lo hace?", 50),
    msg(javierConvo, "in", "lead", "Hola Alex, gracias. La verdad sí lo he pensado, sobre todo desde que nació mi segundo hijo. ¿Qué manejan?", 47),
    msg(javierConvo, "out", "ai", "Te entiendo perfecto — con dos peques la cosa cambia 🙂. Lo más común entre fundadores como tú: seguro de vida que cubra a la familia y deudas del negocio, y gastos médicos mayores para todos. Daniel arma el plan a la medida en una llamada de 30 min, sin compromiso. ¿Cómo andas esta semana, jueves o viernes?", 46),
    msg(javierConvo, "in", "lead", "Esta semana ando full con un release. ¿La que sigue puede ser?", 30),
    msg(javierConvo, "out", "ai", "Claro que sí, sin bronca. Te propongo martes 10:00 o miércoles 17:00 (hora CDMX), por Meet o donde prefieras. Aparto el que te acomode 👍", 29),
    // Conversación 2 — Adriana Quintero (MEETING_SET)
    msg(adrianaConvo, "out", "ai", "Hola Adriana, buen día. Soy Alex, asistente de Daniel Guzmán, asesor patrimonial de MetLife. Enhorabuena por la apertura de su quinta farmacia — un logro enorme. Daniel se especializa en protección patrimonial para dueños de negocio: vida, gastos médicos y protección de hombre clave. ¿Le interesaría platicarlo con él?", 96),
    msg(adrianaConvo, "in", "lead", "Buen día Alex. Justo mi contador me dijo que ya me urge ver esto. ¿Cómo trabajan?", 74),
    msg(adrianaConvo, "out", "ai", "Qué bueno que ya lo tiene en el radar. Es sencillo: una reunión de 45 min donde Daniel revisa su situación (familia, negocio, lo que ya tiene) y le presenta un plan a la medida. Sin costo y sin compromiso. ¿Prefiere presencial en sus oficinas o videollamada?", 73),
    msg(adrianaConvo, "in", "lead", "Videollamada mejor. ¿Tiene espacio el jueves en la mañana?", 51),
    msg(adrianaConvo, "out", "ai", "Perfecto. Le agendo el jueves 12:00 con Daniel por Google Meet — le acaba de llegar la invitación a su correo con los detalles. Un día antes le mando recordatorio por aquí. ¡Que tenga excelente día! 📅", 50),
  ]);
  if (messagesError) throw messagesError;
  console.log("✓ 2 conversaciones de WhatsApp con 10 mensajes");

  // ── 7. 30 agent_actions de los distintos subagentes
  const byName = (name: string) => leads.find((l) => l.name === name)?.id ?? null;
  type ActionSeed = [Subagent, string, string | null, string, number];
  // [subagente, acción, lead, resumen, horas atrás (hoy) | horas de ayer via offset]
  const actionsToday: ActionSeed[] = [
    ["strategist", "daily_plan_generated", null, "Plan del día generado: 14 acciones priorizadas (6 aperturas, 5 follow-ups, 3 confirmaciones de cita)", 14],
    ["strategist", "morning_briefing_sent", null, "Briefing matutino enviado a Daniel: 1 cita hoy (Patricia Zamudio 10:00), 2 leads calientes, jueves con 2 huecos", 12],
    ["hunter", "lead_scraped", byName("Alejandro Fuentes"), "Prospecto nuevo detectado en directorio de transportistas CDMX: Alejandro Fuentes (Transportes Fuentes e Hijos)", 11],
    ["hunter", "lead_scraped", byName("Brenda Salgado"), "Prospecto nuevo desde directorio médico de Querétaro: Brenda Salgado (Clínica Dental Salgado)", 11],
    ["hunter", "lead_imported", byName("Iván Cortés"), "Lead importado desde LinkedIn Sales Navigator: Iván Cortés, Socio Director en Grupo Constructor Cortés", 10],
    ["hunter", "lead_enriched", byName("Mariana Solís"), "Enriquecimiento completo: 2 hijos, segunda oficina en Polanco, 12 empleados. Score ICP: 82/100", 9],
    ["hunter", "entry_angle_generated", byName("Mariana Solís"), "Ángulo de entrada sugerido: protección patrimonial del despacho + GMM colectivo para sus 12 empleados", 9],
    ["opener", "linkedin_connection_sent", byName("Emilio Zárate"), "Solicitud de conexión enviada en LinkedIn con nota personalizada sobre deducciones del art. 151 LISR", 8],
    ["opener", "whatsapp_message_sent", byName("Renata Villaseñor"), "Primer mensaje de WhatsApp enviado (referida por Lucía Barrios): ángulo de vida + GMM en pareja", 7],
    ["nurturer", "reply_handled", byName("Javier Montaño"), "Respondió a Javier: propuso martes 10:00 o miércoles 17:00 para llamada con Daniel", 6],
    ["scheduler", "reminder_sent", byName("Patricia Zamudio"), "Recordatorio de cita enviado 2h antes por WhatsApp a Patricia Zamudio", 6],
    ["scheduler", "dossier_delivered", byName("Patricia Zamudio"), "Dossier de la cita enviado a Sofía 1h antes: perfil, dolor principal, ángulo de vida con ahorro", 5],
    ["sentinel", "outcome_check_scheduled", byName("Patricia Zamudio"), "Cita de Patricia Zamudio terminó sin outcome; pregunta programada para dentro de 2h", 4],
    ["nurturer", "follow_up_sent", byName("Claudia Espinoza"), "Follow-up suave a Claudia (día 5 de 7 del plazo que pidió): ¿pudieron revisar los números con su esposo?", 3],
    ["opener", "whatsapp_message_sent", byName("Daniela Cepeda"), "Mensaje de apertura enviado a Daniela Cepeda: entrada por GMM (sector salud, conoce el valor)", 2],
    ["nurturer", "objection_handled", byName("Óscar Valdez"), "Objeción manejada («¿y si necesito el dinero antes?»): explicó valores de rescate del plan a 15 años", 2],
    ["scheduler", "availability_checked", byName("Adriana Quintero"), "Disponibilidad verificada en el calendario de Daniel para la cita del jueves 12:00", 1],
    ["hunter", "icp_scored", byName("Iván Cortés"), "Score ICP calculado para Iván Cortés: pendiente de enriquecimiento completo", 1],
  ];
  const actionsYesterday: ActionSeed[] = [
    ["strategist", "nightly_review_completed", null, "Revisión nocturna: 23 leads activos evaluados, 3 marcados para reactivación, cola del día generada", 38],
    ["strategist", "evening_digest_sent", null, "Digest nocturno enviado: 12 conversaciones, 1 cita nueva, 1 cierre confirmado (Ricardo Peña) 🎉", 28],
    ["hunter", "list_built", null, "Lista construida: 18 dueños de negocio 35-50 años en CDMX/GDL con señales de vida recientes", 36],
    ["opener", "linkedin_message_sent", byName("Marco Antonio Reyes"), "Mensaje de LinkedIn enviado a Marco Antonio Reyes: ángulo de hombre clave + GMM colectivo", 34],
    ["opener", "email_sent", byName("Paola Rentería"), "Email de apertura enviado a Paola Rentería: plan de retiro para ingresos por comisión", 33],
    ["nurturer", "reply_handled", byName("Adriana Quintero"), "Adriana pidió videollamada; detectada intención de agendar — control pasado a SCHEDULER", 32],
    ["scheduler", "meeting_booked", byName("Adriana Quintero"), "Cita creada: jueves 12:00 por Google Meet. Invitación enviada con dossier en la descripción", 31],
    ["scheduler", "confirmation_sent", byName("Adriana Quintero"), "Confirmación de cita enviada por WhatsApp a Adriana Quintero", 31],
    ["sentinel", "outcome_captured", byName("Ricardo Peña"), "Outcome capturado: Daniel respondió «1» — Ricardo Peña CERRÓ ✅ Vida + GMM familiar. CRM actualizado a WON", 30],
    ["sentinel", "vault_flow_triggered", byName("Ricardo Peña"), "Flujo de alta en vault disparado: solicitud de datos de póliza enviada a Daniel", 30],
    ["nurturer", "reengagement_queued", byName("Gabriela Mireles"), "Gabriela Mireles cumple 90 días de re-nurture en 5 días; secuencia de reactivación preparada", 27],
    ["sentinel", "no_show_detected", byName("Sergio Madrigal"), "No-show detectado: Sergio Madrigal no se presentó; secuencia de reagendamiento activada (intento 1 de 2)", 26],
  ];

  const actionRows = [
    ...actionsToday.map(([subagent, action, lead_id, summary, h]) => ({
      organization_id: org.id,
      subagent,
      action,
      lead_id,
      tokens: 300 + Math.floor(Math.random() * 1500),
      cost: Number((0.002 + Math.random() * 0.02).toFixed(6)),
      payload: { summary },
      at: todayHoursAgo(h),
    })),
    ...actionsYesterday.map(([subagent, action, lead_id, summary, h]) => ({
      organization_id: org.id,
      subagent,
      action,
      lead_id,
      tokens: 300 + Math.floor(Math.random() * 1500),
      cost: Number((0.002 + Math.random() * 0.02).toFixed(6)),
      payload: { summary },
      at: hoursAgo(h),
    })),
  ];
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
