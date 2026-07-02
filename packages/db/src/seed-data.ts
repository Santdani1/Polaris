/**
 * Datos del seed demo — separados de la lógica de inserción para poder
 * sembrarlos vía supabase-js (seed.ts) o vía SQL directo (Lovable Cloud,
 * que no expone el service role key).
 */
import type { LeadSource, LeadStatus } from "@polaris/shared";

export const ORG_NAME = "Promotoría Demo";
export const ORG_SLUG = "promotoria-demo";
export const DEMO_PASSWORD = "polaris-demo-2026";

export const ADMIN_EMAIL = "admin@promotoriademo.mx";
export const AGENT_EMAIL = "sofia@promotoriademo.mx";

export function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}
export function daysAgo(d: number, hourOfDay = 10): string {
  const date = new Date(Date.now() - d * 86_400_000);
  date.setHours(hourOfDay, Math.floor(Math.random() * 50), 0, 0);
  return date.toISOString();
}
export function daysFromNow(d: number, hourOfDay = 10): string {
  const date = new Date(Date.now() + d * 86_400_000);
  date.setHours(hourOfDay, 0, 0, 0);
  return date.toISOString();
}
/** Hoy, hace `h` horas — sin cruzar la medianoche (para los contadores del día). */
export function todayHoursAgo(h: number): string {
  const now = new Date();
  const candidate = new Date(Date.now() - h * 3_600_000);
  if (candidate.getDate() !== now.getDate()) {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 5, 0, 0);
    return startOfDay.toISOString();
  }
  return candidate.toISOString();
}

export interface SeedLead {
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
export const SEED_LEADS: SeedLead[] = [
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

// ── Conversaciones de WhatsApp (mensajes creíbles en español mexicano) ──

export interface SeedMessage {
  leadName: string;
  direction: "in" | "out";
  sender: "ai" | "lead";
  content: string;
  hoursBack: number;
}

export const SEED_CONVERSATION_LEADS = ["Javier Montaño", "Adriana Quintero"] as const;

export const SEED_MESSAGES: SeedMessage[] = [
  // Conversación 1 — Javier Montaño (ENGAGED)
  { leadName: "Javier Montaño", direction: "out", sender: "ai", hoursBack: 50, content: "Hola Javier, ¿qué tal? Soy Alex, asistente de Daniel Guzmán, asesor de MetLife. Vi que Montaño Tech va creciendo fuerte — felicidades por el contrato con el cliente de Austin. Daniel trabaja con varios fundadores de tecnología ayudándoles a proteger a su familia y a su empresa. ¿Te late si te comparto cómo lo hace?" },
  { leadName: "Javier Montaño", direction: "in", sender: "lead", hoursBack: 47, content: "Hola Alex, gracias. La verdad sí lo he pensado, sobre todo desde que nació mi segundo hijo. ¿Qué manejan?" },
  { leadName: "Javier Montaño", direction: "out", sender: "ai", hoursBack: 46, content: "Te entiendo perfecto — con dos peques la cosa cambia 🙂. Lo más común entre fundadores como tú: seguro de vida que cubra a la familia y deudas del negocio, y gastos médicos mayores para todos. Daniel arma el plan a la medida en una llamada de 30 min, sin compromiso. ¿Cómo andas esta semana, jueves o viernes?" },
  { leadName: "Javier Montaño", direction: "in", sender: "lead", hoursBack: 30, content: "Esta semana ando full con un release. ¿La que sigue puede ser?" },
  { leadName: "Javier Montaño", direction: "out", sender: "ai", hoursBack: 29, content: "Claro que sí, sin bronca. Te propongo martes 10:00 o miércoles 17:00 (hora CDMX), por Meet o donde prefieras. Aparto el que te acomode 👍" },
  // Conversación 2 — Adriana Quintero (MEETING_SET)
  { leadName: "Adriana Quintero", direction: "out", sender: "ai", hoursBack: 96, content: "Hola Adriana, buen día. Soy Alex, asistente de Daniel Guzmán, asesor patrimonial de MetLife. Enhorabuena por la apertura de su quinta farmacia — un logro enorme. Daniel se especializa en protección patrimonial para dueños de negocio: vida, gastos médicos y protección de hombre clave. ¿Le interesaría platicarlo con él?" },
  { leadName: "Adriana Quintero", direction: "in", sender: "lead", hoursBack: 74, content: "Buen día Alex. Justo mi contador me dijo que ya me urge ver esto. ¿Cómo trabajan?" },
  { leadName: "Adriana Quintero", direction: "out", sender: "ai", hoursBack: 73, content: "Qué bueno que ya lo tiene en el radar. Es sencillo: una reunión de 45 min donde Daniel revisa su situación (familia, negocio, lo que ya tiene) y le presenta un plan a la medida. Sin costo y sin compromiso. ¿Prefiere presencial en sus oficinas o videollamada?" },
  { leadName: "Adriana Quintero", direction: "in", sender: "lead", hoursBack: 51, content: "Videollamada mejor. ¿Tiene espacio el jueves en la mañana?" },
  { leadName: "Adriana Quintero", direction: "out", sender: "ai", hoursBack: 50, content: "Perfecto. Le agendo el jueves 12:00 con Daniel por Google Meet — le acaba de llegar la invitación a su correo con los detalles. Un día antes le mando recordatorio por aquí. ¡Que tenga excelente día! 📅" },
];

// ── 30 agent_actions de los distintos subagentes ──

export interface SeedAction {
  subagent: "hunter" | "opener" | "nurturer" | "scheduler" | "sentinel" | "librarian" | "strategist";
  action: string;
  leadName: string | null;
  summary: string;
  hoursBack: number;
  day: "today" | "yesterday";
}

export const SEED_ACTIONS: SeedAction[] = [
  { day: "today", hoursBack: 14, subagent: "strategist", action: "daily_plan_generated", leadName: null, summary: "Plan del día generado: 14 acciones priorizadas (6 aperturas, 5 follow-ups, 3 confirmaciones de cita)" },
  { day: "today", hoursBack: 12, subagent: "strategist", action: "morning_briefing_sent", leadName: null, summary: "Briefing matutino enviado a Daniel: 1 cita hoy (Patricia Zamudio 10:00), 2 leads calientes, jueves con 2 huecos" },
  { day: "today", hoursBack: 11, subagent: "hunter", action: "lead_scraped", leadName: "Alejandro Fuentes", summary: "Prospecto nuevo detectado en directorio de transportistas CDMX: Alejandro Fuentes (Transportes Fuentes e Hijos)" },
  { day: "today", hoursBack: 11, subagent: "hunter", action: "lead_scraped", leadName: "Brenda Salgado", summary: "Prospecto nuevo desde directorio médico de Querétaro: Brenda Salgado (Clínica Dental Salgado)" },
  { day: "today", hoursBack: 10, subagent: "hunter", action: "lead_imported", leadName: "Iván Cortés", summary: "Lead importado desde LinkedIn Sales Navigator: Iván Cortés, Socio Director en Grupo Constructor Cortés" },
  { day: "today", hoursBack: 9, subagent: "hunter", action: "lead_enriched", leadName: "Mariana Solís", summary: "Enriquecimiento completo: 2 hijos, segunda oficina en Polanco, 12 empleados. Score ICP: 82/100" },
  { day: "today", hoursBack: 9, subagent: "hunter", action: "entry_angle_generated", leadName: "Mariana Solís", summary: "Ángulo de entrada sugerido: protección patrimonial del despacho + GMM colectivo para sus 12 empleados" },
  { day: "today", hoursBack: 8, subagent: "opener", action: "linkedin_connection_sent", leadName: "Emilio Zárate", summary: "Solicitud de conexión enviada en LinkedIn con nota personalizada sobre deducciones del art. 151 LISR" },
  { day: "today", hoursBack: 7, subagent: "opener", action: "whatsapp_message_sent", leadName: "Renata Villaseñor", summary: "Primer mensaje de WhatsApp enviado (referida por Lucía Barrios): ángulo de vida + GMM en pareja" },
  { day: "today", hoursBack: 6, subagent: "nurturer", action: "reply_handled", leadName: "Javier Montaño", summary: "Respondió a Javier: propuso martes 10:00 o miércoles 17:00 para llamada con Daniel" },
  { day: "today", hoursBack: 6, subagent: "scheduler", action: "reminder_sent", leadName: "Patricia Zamudio", summary: "Recordatorio de cita enviado 2h antes por WhatsApp a Patricia Zamudio" },
  { day: "today", hoursBack: 5, subagent: "scheduler", action: "dossier_delivered", leadName: "Patricia Zamudio", summary: "Dossier de la cita enviado a Sofía 1h antes: perfil, dolor principal, ángulo de vida con ahorro" },
  { day: "today", hoursBack: 4, subagent: "sentinel", action: "outcome_check_scheduled", leadName: "Patricia Zamudio", summary: "Cita de Patricia Zamudio terminó sin outcome; pregunta programada para dentro de 2h" },
  { day: "today", hoursBack: 3, subagent: "nurturer", action: "follow_up_sent", leadName: "Claudia Espinoza", summary: "Follow-up suave a Claudia (día 5 de 7 del plazo que pidió): ¿pudieron revisar los números con su esposo?" },
  { day: "today", hoursBack: 2, subagent: "opener", action: "whatsapp_message_sent", leadName: "Daniela Cepeda", summary: "Mensaje de apertura enviado a Daniela Cepeda: entrada por GMM (sector salud, conoce el valor)" },
  { day: "today", hoursBack: 2, subagent: "nurturer", action: "objection_handled", leadName: "Óscar Valdez", summary: "Objeción manejada («¿y si necesito el dinero antes?»): explicó valores de rescate del plan a 15 años" },
  { day: "today", hoursBack: 1, subagent: "scheduler", action: "availability_checked", leadName: "Adriana Quintero", summary: "Disponibilidad verificada en el calendario de Daniel para la cita del jueves 12:00" },
  { day: "today", hoursBack: 1, subagent: "hunter", action: "icp_scored", leadName: "Iván Cortés", summary: "Score ICP calculado para Iván Cortés: pendiente de enriquecimiento completo" },
  { day: "yesterday", hoursBack: 38, subagent: "strategist", action: "nightly_review_completed", leadName: null, summary: "Revisión nocturna: 23 leads activos evaluados, 3 marcados para reactivación, cola del día generada" },
  { day: "yesterday", hoursBack: 28, subagent: "strategist", action: "evening_digest_sent", leadName: null, summary: "Digest nocturno enviado: 12 conversaciones, 1 cita nueva, 1 cierre confirmado (Ricardo Peña) 🎉" },
  { day: "yesterday", hoursBack: 36, subagent: "hunter", action: "list_built", leadName: null, summary: "Lista construida: 18 dueños de negocio 35-50 años en CDMX/GDL con señales de vida recientes" },
  { day: "yesterday", hoursBack: 34, subagent: "opener", action: "linkedin_message_sent", leadName: "Marco Antonio Reyes", summary: "Mensaje de LinkedIn enviado a Marco Antonio Reyes: ángulo de hombre clave + GMM colectivo" },
  { day: "yesterday", hoursBack: 33, subagent: "opener", action: "email_sent", leadName: "Paola Rentería", summary: "Email de apertura enviado a Paola Rentería: plan de retiro para ingresos por comisión" },
  { day: "yesterday", hoursBack: 32, subagent: "nurturer", action: "reply_handled", leadName: "Adriana Quintero", summary: "Adriana pidió videollamada; detectada intención de agendar — control pasado a SCHEDULER" },
  { day: "yesterday", hoursBack: 31, subagent: "scheduler", action: "meeting_booked", leadName: "Adriana Quintero", summary: "Cita creada: jueves 12:00 por Google Meet. Invitación enviada con dossier en la descripción" },
  { day: "yesterday", hoursBack: 31, subagent: "scheduler", action: "confirmation_sent", leadName: "Adriana Quintero", summary: "Confirmación de cita enviada por WhatsApp a Adriana Quintero" },
  { day: "yesterday", hoursBack: 30, subagent: "sentinel", action: "outcome_captured", leadName: "Ricardo Peña", summary: "Outcome capturado: Daniel respondió «1» — Ricardo Peña CERRÓ ✅ Vida + GMM familiar. CRM actualizado a WON" },
  { day: "yesterday", hoursBack: 30, subagent: "sentinel", action: "vault_flow_triggered", leadName: "Ricardo Peña", summary: "Flujo de alta en vault disparado: solicitud de datos de póliza enviada a Daniel" },
  { day: "yesterday", hoursBack: 27, subagent: "nurturer", action: "reengagement_queued", leadName: "Gabriela Mireles", summary: "Gabriela Mireles cumple 90 días de re-nurture en 5 días; secuencia de reactivación preparada" },
  { day: "yesterday", hoursBack: 26, subagent: "sentinel", action: "no_show_detected", leadName: "Sergio Madrigal", summary: "No-show detectado: Sergio Madrigal no se presentó; secuencia de reagendamiento activada (intento 1 de 2)" },
];
