# CLAUDE.md — POLARIS
### El Agente de Seguros Autónomo + SaaS de Control

> **Codename:** POLARIS (la estrella que guía a los agentes hacia citas). Nombre comercial pendiente.
> **Owner:** Daniel Guzmán — Glassway / Grupo KC (Promotoría 119, MetLife)
> **Este archivo es la fuente de verdad del proyecto.** Claude Code debe leerlo completo antes de tocar código y respetar los guardrails de la sección 9 sin excepción.

---

## 0. Estado actual del proyecto

- **FASE ACTUAL: 0 — Fundaciones** (ver roadmap, sección 12). No implementar nada de fases posteriores sin acuerdo explícito de Daniel.
- **Estado detallado:** vive en `docs/STATE.md` — qué está hecho, qué está en curso, qué sigue. **Claude Code debe leerlo al iniciar cada sesión y actualizarlo al terminar.**
- **Specs por feature:** cada fase tiene su spec en `docs/specs/fase-N.md` con user stories y criterios de aceptación. Este archivo (CLAUDE.md) define visión, arquitectura y reglas; los specs definen el detalle de construcción. Si el spec de la fase actual no existe, pedirlo antes de construir.
- **Nota de honestidad arquitectónica:** las Fases 1-5 son automatización orquestada con LLM (cadencias + triggers + Claude); la autonomía real (percibir → decidir → actuar → aprender) llega en Fase 6 con STRATEGIST. Es intencional: crawl, walk, run.

---

## 1. Visión

POLARIS es un **SDR de seguros autónomo que trabaja 24/7**: prospecta en internet y LinkedIn, contacta por WhatsApp y llamadas de voz, da seguimiento a leads con cadencias inteligentes, y agenda citas para agentes de seguros humanos. Los humanos solo cierran; la máquina hace todo lo demás.

**La tesis:** el 80% del tiempo de un agente de seguros se va en prospección y seguimiento, no en cerrar. POLARIS elimina ese 80%.

**El moat (en orden de importancia):**
1. **Loop de outcome cerrado** — POLARIS detecta cuando una junta ya ocurrió (calendario), le pregunta al agente humano por WhatsApp si cerró, parsea la respuesta, actualiza el CRM automáticamente y decide el siguiente paso (vault si cerró, re-nurture si no). Nadie más cierra este ciclo.
2. **Flywheel de cartera** — el vault de pólizas alimenta un motor de renovaciones, aniversarios y cross-sell. La prospección en frío arranca el sistema; la cartera lo hace perpetuo.
3. **Data de conversión propietaria** — cada outcome alimenta el lead scoring. Con el tiempo, POLARIS sabe qué perfil de prospecto sí cierra con qué agente.

**Modelo de negocio:** multi-tenant desde el día uno. Usuario cero: Grupo KC. Mercado: promotorías y despachos de agentes en México y LatAm. Pricing eventual por asiento de agente + volumen de leads.

### 1.1 La experiencia North Star — "El Día Perfecto"

Todo el producto se diseña hacia esta experiencia del agente humano:

> **7:00 am** — Recibe por WhatsApp su briefing del día: citas de hoy con mini-dossier de cada lead, highlights del pipeline, y qué preparó POLARIS durante la noche.
> **Durante el día** — Abre su calendario: cada cita ya trae en la descripción el dossier completo del prospecto (quién es, su dolor, el ángulo, detalles personales). Solo llega y cierra.
> **Después de cada junta** — Contesta un WhatsApp de una línea: "cerré" / "sigue caliente" / "no cerró porque X". El CRM se actualiza solo.
> **8:00 pm** — Recibe el digest nocturno: *"Hoy: 32 conversaciones, 3 citas nuevas para el jueves, 2 renovaciones aseguradas. Esta noche voy a preparar 45 prospectos nuevos y a reactivar 12 leads fríos. Descansa."*
> **Mientras duerme** — STRATEGIST planea, HUNTER caza, el sistema aprende.

**Principio de diseño — dos superficies:** el "día perfecto" es solo el *resultado*; el sistema es otra cosa y tiene su propia cara.
- **Superficie de entrega (el resultado):** WhatsApp + calendario. Por ahí llega el valor al agente humano: citas con dossier, briefings, captura de outcomes. Cero fricción.
- **Superficie de operación (el sistema):** el dashboard. Es **el front real del cerebro y la operación del agente IA** — un *cerebro de cristal* donde el humano entra a ver qué está diciendo su agente en WhatsApp en tiempo real, cuántos leads prospectó, qué decidió priorizar y por qué, y qué insights está aprendiendo con los datos. La confianza en un sistema autónomo se construye con transparencia radical: todo pensamiento, decisión, acción y lección del agente es observable.

El dashboard no es opcional ni secundario: es donde el humano supervisa, entiende y ajusta a su empleado digital. La entrega fluye a WhatsApp/calendario; la mente vive en el dashboard.

**Ritmo operativo de 24 horas:**

| Franja | Actividad |
|---|---|
| Madrugada (00-06h) | STRATEGIST: revisión de pipeline, next-best-actions, aprendizaje. HUNTER: listas y enriquecimiento. **Cero mensajes salientes.** |
| 7:00 am | Briefing matutino al agente humano |
| Horario hábil (9-19h, configurable por tenant) | OPENER/NURTURER ejecutan la cola priorizada. SCHEDULER agenda. Llamadas de voz. |
| Post-junta | SENTINEL captura outcomes |
| 8:00 pm | Digest nocturno al agente humano |

**North Star Metric:** citas calificadas atendidas por agente por semana (y en última instancia, prima generada por agente). El sueño medible: un agente despierta con su semana llena sin haber prospectado un solo minuto.

---

## 2. Qué ES y qué NO ES

| ES | NO ES |
|---|---|
| Un SDR autónomo que genera **citas calificadas** | Un bot que vende pólizas solo (el cierre es del humano licenciado) |
| Prospección orgánica pura (outbound + cartera) | Una plataforma de ads (cero Meta/Google Ads) |
| Un CRM/SaaS pulido tipo GoHighLevel/Salesforce | Un dashboard interno feo "que funciona" |
| Multicanal: LinkedIn, WhatsApp, voz, email | Solo-WhatsApp |
| Multi-tenant (SaaS vendible) | Una herramienta interna de un solo despacho |

**Regla de oro del producto:** el agente de IA **nunca cotiza precios finales ni cierra la venta**. Recomienda, califica, agenda. La venta de seguros la ejecuta un agente humano con cédula. (Cotizaciones informativas vía API MetLife son fase futura, con disclaimers.)

---

## 3. Arquitectura de agentes

POLARIS es un sistema **multi-agente orquestado**. Cada subagente es un módulo con su propio system prompt, tools y triggers. Todos escriben a la misma base de datos y al log de auditoría (`agent_actions`).

### 3.1 HUNTER — Prospección
- Construye listas de prospectos según el ICP configurado por tenant (ej. "hombres 30-45, CDMX, dueños de negocio o directores, con hijos").
- Fuentes: LinkedIn (vía Unipile/proveedor), directorios públicos, scraping web permitido, referidos de cartera.
- Enriquece cada lead (empresa, puesto, señales de vida: cambio de trabajo, hijos, compra de casa) y lo **puntúa contra el ICP (score 0-100)**.
- Output: leads en estado `ENRICHED` con score y "ángulo de entrada" sugerido.

### 3.2 OPENER — Primer contacto
- Ejecuta la secuencia de apertura multicanal según el canal disponible y el score:
  - LinkedIn: conexión + mensaje personalizado (generado por Claude con el ángulo de HUNTER).
  - WhatsApp: solo con número válido y siguiendo la política anti-ban (sección 9.2).
  - Voz: llamada con agente de voz (Retell/Vapi) para leads de score alto.
  - Email: fallback y warm-up.
- Cada mensaje es **personalizado por lead**, nunca template genérico. Claude genera el copy usando el contexto de enriquecimiento.

### 3.3 NURTURER — Seguimiento y objeciones
- Gestiona cadencias multi-touch (state machine, sección 4). Responde preguntas, maneja objeciones (framework CLOSER de Hormozi ya documentado en los skills de Daniel), reactiva leads fríos.
- Detecta intención de agendar y pasa el control a SCHEDULER.
- **Handoff humano obligatorio** si el lead lo pide, si hay queja, o si detecta tema sensible (sección 9.4).

### 3.4 SCHEDULER — Agendamiento
- Lee la disponibilidad real del agente humano (Google Calendar), ofrece slots, crea el evento con Meet/Zoom, envía confirmación y recordatorios (24h y 2h antes) por WhatsApp.
- Gestiona reagendamientos y detecta no-shows (evento pasó + sin outcome → reactivar).
- **Dossier en el calendario:** al crear cada evento, escribe en la descripción un dossier generado por Claude: quién es el lead, por qué aceptó la cita, su dolor principal, ángulo de producto recomendado, score, detalles personales relevantes (hijos, trabajo, algo que mencionó en la conversación) y resumen del hilo. El mismo dossier se envía por WhatsApp al agente humano 1h antes de la junta. El humano llega sabiéndolo todo.

### 3.5 SENTINEL — Loop de outcome (el diferenciador)
- Cron cada 30 min: busca meetings con `end_time < now()` y `outcome = NULL`.
- 2 horas después de la junta, le escribe por WhatsApp **al agente humano**: *"¿Cómo te fue con [Nombre]? 1) Cerré ✅ 2) Sigue caliente, dar seguimiento 3) No cerró 4) No se presentó"*.
- Parsea la respuesta (número, texto libre, o audio transcrito) y actualiza el CRM:
  - **Cerró** → estado `WON`, dispara flujo de alta en el vault (pedir datos de póliza), y pide referidos a los 7 días.
  - **Caliente** → agenda follow-up y devuelve el lead a NURTURER con contexto.
  - **No cerró** → pregunta el motivo (1 pregunta, no interrogatorio), lo guarda como `lost_reason`, mueve a cadencia de re-nurture a 90 días.
  - **No-show** → NURTURER intenta reagendar con secuencia específica.
- Si el humano no contesta en 24h, un (1) recordatorio. Nunca spamear al agente.

### 3.6 LIBRARIAN — Vault y flywheel de cartera
- Repositorio de clientes, pólizas y documentos (PDFs de póliza, identificaciones, formatos).
- Extrae metadata de las pólizas subidas (aseguradora, producto, prima, fecha de renovación) usando Claude sobre el PDF.
- **Motor de eventos de cartera:** renovación a 60/30/15 días, aniversario de póliza, cumpleaños del cliente (felicitación personalizada, sin pitch — la venta llega después), oportunidades de **cross-sell** (tiene Vida → ofrecer GMM; tiene GMM → ofrecer Ahorro) y de **upsell** (revisión de suma asegurada en renovación; eventos de vida detectados — nuevo hijo, nueva casa, ascenso — que justifican aumentar cobertura). Cada evento genera un lead interno que entra al pipeline como `NURTURE` con contexto completo.

### 3.7 STRATEGIST — El cerebro nocturno (planeación autónoma)
El subagente que convierte a POLARIS en un CRM que **se automanagea**. Corre cada madrugada:
- **Revisión total del pipeline:** evalúa cada lead activo y calcula su **Next Best Action** (¿qué canal, qué mensaje, qué momento, o dejarlo enfriar?). Esto sustituye gradualmente las cadencias rígidas: las cadencias son la v1 (predecibles, auditables); el motor NBA es la v2 (dinámico, aprende). Ambas conviven — el tenant elige por el dial de autonomía.
- **Cola de trabajo del día:** genera `action_queue` priorizada por valor esperado (score × etapa × señales recientes) que OPENER/NURTURER ejecutan en horario hábil.
- **Asignación de esfuerzo:** decide cuánto volumen va a frío vs. nurture vs. cartera según los huecos del calendario de cada agente humano (si la semana está vacía, empuja agendamiento; si está llena, empuja pipeline futuro).
- **Briefing matutino (7am) y digest nocturno (8pm)** al agente humano por WhatsApp.
- **Dueño del motor de aprendizaje (3.8):** ejecuta los análisis y actualiza pesos, variantes e insights.
- **Regla dura:** STRATEGIST planea y analiza de noche; **jamás envía mensajes a prospectos fuera de horario hábil.**

### 3.8 Motor de aprendizaje — "aprende solo", con mecánica real
El aprendizaje no es magia, son cuatro loops medibles:
1. **Testing de variantes (bandit):** cada ángulo/hook/mensaje de apertura es una variante en `message_variants`. Se mide reply rate → tasa de cita → tasa de cierre por variante, canal y segmento de ICP. Asignación estilo multi-armed bandit (explotar lo que funciona, explorar ~15%). Regla 10x de hooks: siempre hay variantes nuevas en prueba.
2. **Recalibración del ICP score:** mensualmente, los outcomes reales (WON/LOST) reentrenan los pesos del scoring. v1: regresión logística simple sobre features del lead. v2: modelo propio (mismo playbook que los modelos de predicción que ya domina Daniel). El score deja de ser opinión y se vuelve probabilidad de cierre.
3. **Minería de lost reasons:** clustering periódico de motivos de pérdida → ajustes a preguntas de calificación y manejo de objeciones. Si "muy caro" domina en un segmento, se ajusta el ángulo o se descalifica antes.
4. **Memoria de playbook (`playbook_insights`):** insights estructurados y versionados que TODOS los subagentes leen en su contexto (ej. *"dueños de restaurante en CDMX responden 3x mejor a ángulo de protección familiar que patrimonial; mejor hora: 16-18h"*). Cada insight guarda su evidencia (n, métrica, periodo) y expira si los datos dejan de sostenerlo.

### 3.9 Dial de autonomía (trust dial)
Para que "se automanagea" no signifique "descontrolado", cada categoría de acción tiene un nivel configurable por tenant:
- **L1 — Sugiere:** la IA propone, el humano aprueba (ej. lista de 40 prospectos nuevos, copy de una campaña fría).
- **L2 — Actúa y notifica:** ejecuta y avisa en el feed/digest (ej. follow-ups de nurture, recordatorios).
- **L3 — Autónomo:** ejecuta en silencio, visible solo en auditoría (ej. felicitaciones de cumpleaños, recordatorios de cita).
Todo tenant nuevo arranca en L1 para acciones de riesgo (outreach frío, cartera) y se gradúa a L2/L3 conforme las métricas lo justifican. El dial vive en Agent Config y se aplica en código (el orquestador verifica el nivel antes de ejecutar).

---

## 4. Máquina de estados del lead

```
NEW → ENRICHED → QUALIFIED → CONTACTED → ENGAGED → MEETING_SET → MEETING_HELD
                                                                      ├→ WON → (vault + referidos + cross-sell futuro)
                                                                      ├→ HOT_FOLLOWUP → (loop a ENGAGED)
                                                                      ├→ LOST(reason) → RE_NURTURE_90D
                                                                      └→ NO_SHOW → (reagendar, máx 2 intentos)
DISQUALIFIED / OPT_OUT ← (desde cualquier estado; OPT_OUT es terminal e irreversible)
```

**Reglas:**
- Toda transición se registra en `lead_events` con timestamp, actor (`agent:hunter`, `agent:sentinel`, `human:daniel`) y payload.
- `OPT_OUT` es sagrado: si un prospecto dice "no me contactes", se marca y **ningún** subagente puede volver a contactarlo. Ni renovaciones, ni nada.
- Un lead no puede estar en dos cadencias activas a la vez.

---

## 5. Stack técnico

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | **Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui** | UI nivel SaaS pro. Dark mode default. |
| Backend / DB | **Supabase** (Postgres + Auth + Storage + Realtime + RLS) | RLS por `organization_id` en TODAS las tablas. Realtime para el activity feed. |
| Agent brain | **Claude API (Anthropic)** con tool use | Un orquestador + system prompts por subagente en `/agents/prompts/`. |
| Jobs / cadencias | **Worker Node (BullMQ + Redis)** o crons de Vercel | n8n puede ser pegamento en v0, pero la lógica de agentes vive en código versionado. |
| WhatsApp | **Evolution API** (v0, ya dominada) → **WhatsApp Cloud API** (path de compliance) | Ver política anti-ban 9.2. Abstraer detrás de `WhatsAppProvider` interface para swap limpio. |
| Voz | **Retell AI o Vapi** (Twilio debajo) | Voz es-MX natural. Transcripts a la DB. Evaluar ambos en Fase 4. |
| LinkedIn | **Unipile API** (inbox unificado) o HeyReach | Ver riesgos 9.3. Abstraer detrás de `LinkedInProvider`. |
| Enriquecimiento | Apollo.io / scraping + Claude | Claude estructura los datos crudos al schema de `leads`. |
| Calendario | **Google Calendar API** (+ Cal.com opcional para booking links) | OAuth por agente humano. |
| Email | Resend o SES | Warm-up antes de volumen. |
| Docs/OCR | Claude sobre PDFs para extracción de pólizas | |

**Principio:** toda integración externa va detrás de una interface en `/lib/providers/`. Nunca acoplar lógica de negocio a un vendor.

---

## 6. Estructura del repo

```
polaris/
├── CLAUDE.md                  # este archivo
├── apps/
│   ├── web/                   # Next.js — dashboard SaaS
│   │   ├── app/
│   │   │   ├── (auth)/        # login, signup, org onboarding
│   │   │   └── (dashboard)/
│   │   │       ├── command/       # Command Center: KPIs + live feed
│   │   │       ├── pipeline/      # Kanban de leads
│   │   │       ├── inbox/         # Conversaciones unificadas (WA/LI/voz/email)
│   │   │       ├── calendar/      # Calendario de citas
│   │   │       ├── prospects/     # DB de prospectos + import
│   │   │       ├── vault/         # Clientes, pólizas, documentos
│   │   │       ├── cadences/      # Editor de cadencias
│   │   │       ├── agent-config/  # ICP, tono, guardrails, canales
│   │   │       └── analytics/     # Funnel, conversión, outcomes
│   │   └── components/
│   └── worker/                # BullMQ: cadencias, crons, colas de mensajes
├── packages/
│   ├── agents/                # Orquestador + subagentes
│   │   ├── orchestrator.ts
│   │   ├── hunter/  opener/  nurturer/  scheduler/  sentinel/  librarian/
│   │   └── prompts/           # system prompts versionados (.md por subagente)
│   ├── db/                    # migrations, schema, tipos generados
│   ├── providers/             # whatsapp/, linkedin/, voice/, calendar/, email/, enrichment/
│   └── shared/                # tipos, zod schemas, utils
└── docs/                      # decisiones de arquitectura (ADRs)
```

---

## 7. Esquema de base de datos (core)

Todas las tablas llevan `id uuid`, `organization_id uuid` (RLS), `created_at`, `updated_at`.

```sql
organizations   -- tenants (promotorías/despachos)
users           -- agentes humanos y admins; role: admin | agent | viewer
                -- incluye: whatsapp_phone (para SENTINEL), google_calendar_connected

leads           -- prospectos
  -- name, phone, email, linkedin_url, company, title, city
  -- source (linkedin|scraping|referral|portfolio_event|manual)
  -- icp_score int, status (enum sección 4), assigned_agent_id
  -- enrichment jsonb, entry_angle text, lost_reason text, opted_out bool

lead_events     -- timeline inmutable: lead_id, type, actor, payload jsonb, occurred_at

conversations   -- lead_id, channel (whatsapp|linkedin|voice|email), status, human_takeover bool
messages        -- conversation_id, direction (in|out), sender (ai|human|lead),
                -- content, media_url, external_id, sent_at

calls           -- lead_id, provider_call_id, duration, recording_url, transcript, summary, outcome

meetings        -- lead_id, agent_id (humano), calendar_event_id, starts_at, ends_at
                -- status (scheduled|completed|no_show|cancelled)
                -- outcome (won|hot|lost|no_show|null), outcome_captured_at, outcome_notes

cadences        -- name, trigger (cold|nurture|reengagement_90d|no_show|renewal|cross_sell)
cadence_steps   -- cadence_id, step_order, channel, delay_hours, prompt_hint
lead_cadence_state -- lead_id, cadence_id, current_step, next_action_at, paused bool

clients         -- clientes cerrados (se crea desde lead al pasar a WON)
policies        -- client_id, carrier, product, policy_number, premium, currency,
                -- start_date, renewal_date, status, document_id
documents       -- Supabase Storage: client_id/policy_id, type (poliza|id|formato), path, extracted_meta jsonb

portfolio_events -- motor del flywheel: client_id, type (renewal_60|renewal_30|birthday|anniversary|cross_sell),
                 -- due_at, status, generated_lead_id

action_queue    -- cola diaria de STRATEGIST: lead_id, action_type, channel, priority_score,
                -- scheduled_window, status (pending|executed|skipped), reasoning text

message_variants -- variantes de hooks/ángulos: channel, segment, angle, copy_template_hint,
                 -- sends, replies, meetings, wins, status (active|exploring|retired)

playbook_insights -- memoria de aprendizaje: insight text, segment, evidence jsonb (n, métrica, periodo),
                  -- confidence, status (active|expired), learned_at

lead_predictions -- capa predictiva (DL): lead_id, close_probability, best_contact_window,
                 -- no_show_risk, model_version, features_snapshot jsonb, computed_at
                 -- (se recalcula al cambiar de estado y en la corrida nocturna de STRATEGIST)

agent_actions   -- AUDIT LOG de TODO lo que hace la IA: subagent, action, lead_id, tokens, cost, payload, at
tasks           -- to-dos para humanos generados por la IA
```

**Regla:** ningún subagente ejecuta una acción externa (mensaje, llamada, evento de calendario) sin escribir primero en `agent_actions`. Sin log, no hay acción.

---

## 8. Variables de entorno

```
ANTHROPIC_API_KEY=
SUPABASE_URL= / SUPABASE_ANON_KEY= / SUPABASE_SERVICE_ROLE_KEY=
REDIS_URL=
EVOLUTION_API_URL= / EVOLUTION_API_KEY=          # WhatsApp v0
WHATSAPP_CLOUD_TOKEN= / WHATSAPP_PHONE_ID=       # path compliance
UNIPILE_API_KEY=                                  # LinkedIn
RETELL_API_KEY=  (o VAPI_API_KEY=)               # voz
GOOGLE_CLIENT_ID= / GOOGLE_CLIENT_SECRET=        # Calendar OAuth
APOLLO_API_KEY=                                   # enriquecimiento
RESEND_API_KEY=
```

Nunca commitear secretos. `.env.example` siempre actualizado.

---

## 9. Guardrails y compliance — **NO NEGOCIABLES**

Estas reglas están al nivel del protocolo de crisis de CereIn: se implementan en código, no en confianza.

### 9.1 Identidad y venta
- El agente de IA se presenta como asistente del despacho/agente humano. **Nunca finge ser una persona** si le preguntan directamente.
- **Nunca** da precios finales de póliza, nunca "cierra" una venta, nunca da asesoría de inversión. Su único CTA es la cita.
- Disclaimer configurable por tenant en la primera conversación.

### 9.2 WhatsApp — política anti-ban
- Realidad: outreach en frío por WhatsApp viola políticas de Meta y quema números. Mitigación obligatoria:
  - **Números dedicados con warm-up** de 2-3 semanas antes de volumen. Nunca el número personal del agente.
  - Rate limits duros en código: arranque ≤20 conversaciones nuevas/día/número, escalar gradual. Delays aleatorizados entre mensajes.
  - **Prioridad de canal: LinkedIn/email primero → pedir el número o el OK → WhatsApp ya tibio.** WhatsApp en frío solo para leads de cartera/referidos (relación previa).
  - Detección de "STOP/no me escribas/baja" → `OPT_OUT` inmediato y terminal.
  - Health-check de números (bloqueos, tasa de respuesta) visible en el dashboard.
- Path a largo plazo: WhatsApp Cloud API con templates aprobados para todo lo iniciado por nosotros.

### 9.3 LinkedIn
- La automatización viola ToS de LinkedIn. Mitigación: límites humanos (≤25 conexiones/día, ≤50 mensajes/día por cuenta), horarios laborales, comportamiento variable, cuentas con Sales Navigator. El tenant acepta el riesgo explícitamente en la config (toggle con warning).

### 9.4 Handoff humano obligatorio
- Triggers: el lead lo pide, queja/enojo, tema legal, siniestro/reclamación, tema de salud delicado, o confusión del agente (2 turnos sin entender). Al activarse: `human_takeover = true`, la IA se calla en esa conversación y se notifica al humano.

### 9.5 Datos personales (LFPDPPP, México)
- Aviso de privacidad disponible y enviable on-demand. Derechos ARCO: comando para exportar/borrar todos los datos de una persona.
- Vault: RLS estricto, Storage con signed URLs de corta vida, documentos de identidad cifrados. Ningún dato personal en logs de terceros.

### 9.6 Respeto al agente humano
- SENTINEL pregunta outcomes máximo 1 vez + 1 recordatorio. POLARIS trabaja PARA los agentes; si los harta, muere el producto.

---

## 10. Convenciones de código

- **TypeScript estricto** en todo. Zod para validar cualquier input externo (webhooks, respuestas de LLM, forms).
- Toda respuesta estructurada de Claude se pide en JSON y se valida con Zod. Si falla el parse → retry con el error, máx 2, luego task para humano.
- Nombres de código en inglés; copy de UI y mensajes al usuario en **español mexicano natural** (tono: profesional-cálido, cero corporativo acartonado).
- Server Components por default; client components solo donde hay interactividad.
- Migrations de DB versionadas (supabase migrations), nunca cambios manuales en prod.
- Tests: unit para parsers/scoring/state machine (lo crítico), integration para el flujo SENTINEL.
- Commits convencionales (`feat:`, `fix:`, `chore:`). Un PR por feature.

---

## 11. Dashboard — el cerebro de cristal

**Filosofía:** el dashboard es el front del cerebro y la operación del agente IA. No es un CRM con un bot adentro; es la ventana a la mente de un empleado digital. Todo lo que el agente hace, dice, decide y aprende debe ser observable aquí, en tiempo real. Referencia visual: **Attio / Linear / GoHighLevel bien hecho**. Denso en información, rápido, dark mode, cero apariencia de "proyecto interno".

1. **Command Center** — qué está haciendo el agente AHORA: live feed en tiempo real de acciones (Supabase Realtime sobre `agent_actions`), estado de cada subagente (activo / idle / próxima corrida), y contadores del día: leads prospectados, conversaciones activas, mensajes enviados, citas agendadas, citas de hoy. Este feed es el "wow" del demo: ves a tu empleado digital trabajando en vivo.
2. **Cerebro** — la mente del agente, visible. Las decisiones de STRATEGIST con su razonamiento en lenguaje natural (*"hoy prioricé estos 30 leads porque tu jueves está vacío y estos 8 mostraron señales de intención ayer"*), la `action_queue` del día con el reasoning de cada acción, los `playbook_insights` activos con su evidencia, la performance de variantes en prueba, y la **capa predictiva (deep learning)**: probabilidad de cierre por lead, mejor ventana de contacto, riesgo de no-show por cita, y forecast de citas/cierres de la semana. Analytics dice qué pasó; Cerebro muestra qué está pensando y qué va a pasar.
3. **Inbox unificado** — todas las conversaciones (WA, LinkedIn, transcripts de llamadas, email) en una sola vista tipo chat, actualizándose en tiempo real: el humano puede leer exactamente qué está diciendo su agente en este momento. Botón "Tomar control" (human takeover) y "Devolver a la IA".
4. **Pipeline** — kanban drag & drop por estado, filtros por agente/score/fuente, vista de tabla alternativa. Cada card muestra su probabilidad de cierre predicha.
5. **Calendario** — citas de todos los agentes, estados de outcome con color, no-shows visibles, riesgo de no-show predicho por cita.
6. **Prospectos** — tabla completa, import CSV, detalle de lead con timeline (`lead_events`) completo y sus predicciones.
7. **Vault** — clientes, pólizas con countdown de renovación, documentos, y la cola de `portfolio_events`.
8. **Cadences** — editor visual de cadencias (pasos, canal, delays, hint de prompt).
9. **Agent Config** — ICP del tenant, tono de voz, límites de canal, guardrails, horarios de operación, on/off por subagente y **dial de autonomía L1/L2/L3 por categoría de acción**.
10. **Analytics + Learning** — funnel completo (prospectado → contactado → engaged → cita → cierre), conversión por canal/fuente/agente, lost reasons, costo por cita, performance histórica de variantes, evolución del ICP score y calibración de los modelos predictivos (el tenant literalmente ve a su agente aprender y mejorar mes a mes).

---

## 12. Roadmap por fases

**Fase 0 — Fundaciones (semana 1-2)**
Monorepo, Supabase schema + RLS + auth multi-tenant, shell del dashboard con navegación, seed data. *Done = login funcional y pipeline con datos dummy.*

**Fase 1 — CRM + Inbox WhatsApp (semana 3-4)**
Evolution API conectada, inbox unificado funcional, pipeline manual, timeline de lead, import CSV. *Done = puedo operar leads reales a mano desde el SaaS.*

**Fase 2 — Agente v1: NURTURER + SCHEDULER (semana 5-7)**
Claude responde WhatsApp con contexto, cadencias básicas, Google Calendar OAuth, agendamiento end-to-end con recordatorios, handoff humano. **Se prueba con leads tibios de la cartera de Grupo KC.** *Done = primera cita agendada 100% por la IA.*

**Fase 3 — SENTINEL + briefings (semana 8-9)**
Detección de meetings pasados, pregunta de outcome por WA al agente humano, parseo, actualización automática, flujos post-outcome. **Además: dossiers en calendario (SCHEDULER), briefing matutino y digest nocturno v1** — baratos de construir sobre lo ya hecho y es el "wow" de la experiencia North Star. *Done = el CRM se actualiza solo después de cada junta y el resultado le llega al agente humano por WhatsApp + calendario.*

**Fase 4 — HUNTER + OPENER: prospección fría (semana 10-13)**
Unipile/LinkedIn, enriquecimiento, ICP scoring, secuencias multicanal en frío con los guardrails 9.2/9.3. Tracking de variantes desde el día uno (`message_variants` acumulando datos aunque el bandit llegue después). *Done = pipeline se llena solo.*

**Fase 5 — Voz + LIBRARIAN (semana 14-16)**
Agente de voz (Retell/Vapi) para leads de score alto y confirmaciones. Vault completo con extracción de pólizas y motor de `portfolio_events` (renovaciones, cumpleaños, cross-sell, upsell). *Done = flywheel de cartera activo.*

**Fase 6 — STRATEGIST + Motor de aprendizaje + Cerebro (semana 17-20)**
Cerebro nocturno completo: next-best-action engine, `action_queue`, asignación de esfuerzo por huecos de calendario, bandit de variantes, recalibración de ICP v1, `playbook_insights`, dial de autonomía aplicado en el orquestador. **Vista Cerebro del dashboard:** decisiones y razonamiento de STRATEGIST visibles, y modelos predictivos v1 (`lead_predictions`: probabilidad de cierre, ventana de contacto, riesgo de no-show — arrancar con regresión logística bien calibrada, evolucionar a MLP cuando haya volumen de outcomes). *Done = el sistema decide solo qué hacer cada día, sus predicciones están calibradas (Brier/log-loss) y todo es observable en el dashboard.*

**Fase 7 — SaaS pulido (semana 21+)**
Analytics + Learning view completo, onboarding self-serve de tenants, billing (Stripe), health de números, docs. *Done = puedo dar acceso a una segunda promotoría sin tocar código.*

**Regla de fases:** no se arranca una fase sin cerrar el "Done" de la anterior. Cada fase termina probándose con datos reales de Grupo KC.

---

## 13. Comandos

```bash
pnpm dev              # web + worker en paralelo
pnpm dev:web          # solo dashboard
pnpm dev:worker       # solo worker (colas/crons)
pnpm db:migrate       # aplicar migrations
pnpm db:types         # regenerar tipos desde Supabase
pnpm test             # unit + integration
pnpm lint && pnpm typecheck
```

---

## 14. Instrucciones para Claude Code

**SÍ:**
- Leer este archivo completo antes de cualquier sesión de trabajo.
- Respetar la fase actual del roadmap; si algo pide adelantar fases, proponerlo primero, no implementarlo.
- Escribir en `agent_actions` cada acción externa de cualquier subagente. Sin excepciones.
- Validar TODA salida de LLM con Zod antes de usarla.
- Mantener los providers desacoplados (interfaces en `/packages/providers/`).
- Preguntar a Daniel cuando una decisión afecte compliance, dinero o datos de clientes.
- UI siempre nivel SaaS comercial (referencia: Attio/Linear), copy en español mexicano.

**NO:**
- No implementar features que violen la sección 9 aunque se pidan "para probar".
- No hardcodear secretos, números de WhatsApp, ni IDs de tenant.
- No permitir que la IA cotice precios finales o cierre ventas.
- No contactar a nadie con `opted_out = true`, jamás, por ningún canal.
- No meter lógica de negocio en componentes de UI ni en n8n; vive en `/packages/agents/` y el worker.
- No usar templates genéricos de outreach; todo mensaje se genera personalizado con contexto del lead.

---

*Última actualización: Julio 2026 — v1.3: sección 0 de estado actual, convención docs/STATE.md + docs/specs/, nota de honestidad arquitectónica sobre autonomía por fases. Pendientes identificados en auditoría: Playbook de Prospección (fuentes MX, funnel math, secuencia default) y docs/DESIGN.md. Actualizar este archivo con cada decisión de arquitectura relevante (o crear ADR en /docs).*
