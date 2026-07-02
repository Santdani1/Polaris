# STATE.md — Estado del proyecto POLARIS

> Claude Code: lee esto al iniciar cada sesión y actualízalo al terminar.

**Última actualización:** 2 de julio de 2026
**Fase actual:** 0 — Fundaciones → **COMPLETA a nivel de código** (pendiente: conectar un proyecto real de Supabase y correr seed + test de RLS contra él; ver "Cómo verificar" abajo).

---

## Qué quedó hecho (sesión de arranque, jul 2026)

### Monorepo
- pnpm workspaces + Turborepo. Comandos de la sección 13 de CLAUDE.md funcionando (`pnpm dev`, `dev:web`, `dev:worker`, `db:migrate`, `db:types`, `db:seed`, `test`, `lint`, `typecheck`).
- `apps/web` — Next.js 15 (App Router) + TypeScript estricto + Tailwind v4 + componentes shadcn-style personalizados con los tokens de `docs/DESIGN.md`.
- `apps/worker` — esqueleto BullMQ + Redis: healthcheck HTTP en `:8787/health`, catálogo de colas (sin jobs, llegan en Fase 2+). No truena si Redis no está corriendo.
- `packages/shared` — enums de la máquina de estados, tipos de todas las tablas, zod schemas (signup/signin/lead) y labels de UI en español.
- `packages/db` — migration inicial, seed, test de RLS.
- `packages/agents` y `packages/providers` — solo estructura + interfaces + README (por diseño; la implementación es de fases 2-6).

### Supabase
- **Migration** `packages/db/supabase/migrations/20260702000001_initial_schema.sql`: las 21 tablas de la sección 7, enums, índices, triggers de `updated_at`.
- **RLS por `organization_id` en TODAS las tablas** vía `current_org_id()` (SECURITY DEFINER). `users`: lectura dentro de la org, cada quien edita su perfil. `organizations`: solo la propia.
- **Auth email/password**: trigger `handle_new_user` — registro normal crea organization + user con role `admin`; si viene `organization_id` en metadata (invitación/seed), se une con el role indicado.
- **Seed** (`pnpm db:seed`): org "Promotoría Demo", 2 usuarios, 25 leads distribuidos en los estados de la sección 4 con enrichment realista (seguros MX), timeline de `lead_events`, 3 meetings (won / outcome pendiente / futura), 2 conversaciones de WhatsApp con 10 mensajes en español mexicano, 30 `agent_actions` de los 7 subagentes (18 de hoy + 12 de ayer, para que los contadores del día tengan datos).
  - **Credenciales demo:** `admin@promotoriademo.mx` y `sofia@promotoriademo.mx`, password `polaris-demo-2026`.

### Dashboard (shell)
- Sidebar fija con los 10 módulos (lucide icons) + topbar con selector de org y menú de usuario (cerrar sesión).
- `/command` — 5 contadores del día + feed de las agent_actions con badge por subagente (server-rendered; Realtime llega después).
- `/pipeline` — kanban read-only por estado con los leads seed.
- `/prospects` — tabla TanStack (sort + búsqueda global).
- `/cerebro`, `/inbox`, `/calendar`, `/vault`, `/cadences`, `/agent-config`, `/analytics` — empty states diseñados que explican qué vivirá ahí y en qué fase.
- Login / signup funcionales con validación zod y copy es-MX. Middleware protege el dashboard y refresca sesión.

### Docs
- `docs/DESIGN.md` — sistema de diseño (tokens, Geist, densidad Attio/Linear).
- `docs/specs/fase-0.md` — spec de esta fase.
- `.env.example` completo (sección 8 + `NEXT_PUBLIC_*`).

## Verificación hecha en esta sesión

- `pnpm typecheck`, `pnpm lint`, `pnpm build` y `pnpm test` — limpios.
- `pnpm dev` levanta web (:3000) y worker (:8787) sin errores; worker reporta Redis conectado/desconectado sin tronar.
- **Migration + RLS verificados contra PostgreSQL 16 local** con un stub del esquema `auth`: las 21 tablas aplican, las 21 con RLS activo, el trigger de signup crea org + admin, y un usuario de otra org **no puede leer ni escribir** leads, agent_actions, users ni organizations ajenas (lectura filtrada y escritura cruzada bloqueada por WITH CHECK).
- El test formal vive en `packages/db/test/rls.test.ts` (vitest + supabase-js con sesiones reales); se salta con aviso si no hay credenciales configuradas.

## Cómo verificar end-to-end (requiere un proyecto de Supabase)

1. Crear proyecto en supabase.com (o `supabase start` local con Docker).
2. Copiar `.env.example` → `.env` (raíz) y `apps/web/.env.local`; llenar URL + keys.
3. `pnpm db:migrate` (o aplicar la migration con el SQL editor).
4. En Auth → Providers, desactivar "Confirm email" para dev (o configurar SMTP).
5. `pnpm db:seed` → `pnpm dev` → login con las credenciales demo.
6. `pnpm test` — ahora sí corre el test de RLS contra la instancia real.

## Decisiones tomadas

1. **Trigger `handle_new_user` en DB** (no en el cliente) para crear org + user al registrarse: atómico, no depende del frontend y sirve igual para invitaciones y seed.
2. **`current_org_id()` SECURITY DEFINER** como base de todas las policies — evita recursión sobre `public.users` y deja las policies de una línea.
3. **Regla de una cadencia activa por lead** aplicada con unique index parcial (`lead_cadence_state`, `paused = false`) — en código, no en confianza.
4. **Packages consumidos como fuente TS** (sin build step) vía `transpilePackages` (web) y `tsx` (worker/scripts): menos fricción en Fase 0; se puede agregar build cuando haga falta.
5. **Tailwind v4** (`@theme` en CSS, sin `tailwind.config`) con los tokens de DESIGN.md; componentes shadcn-style escritos a mano sobre esos tokens, no generados con estilos default.
6. **Seed con fechas relativas a `now()`** para que los contadores "del día" del Command Center siempre muestren datos al demo.
7. **La app levanta sin Supabase configurado** (muestra instrucciones de setup en /login en lugar de tronar) — mejor DX para quien clona el repo.
8. **Worker tolerante a Redis caído**: healthcheck reporta `disconnected` y reintenta; `pnpm dev` nunca truena por infra local faltante.
9. Enum `portfolio_event_type` incluye `renewal_15` y `upsell` (la sección 3.6 los menciona aunque el listado de la sección 7 no; mejor tenerlos desde el día uno que migrar después).

## Qué sigue (Fase 1 — CRM + Inbox WhatsApp)

- Conectar un proyecto real de Supabase y cerrar la verificación end-to-end de arriba.
- Escribir `docs/specs/fase-1.md` (pedir user stories a Daniel antes de construir).
- Evolution API detrás de `WhatsAppProvider`, inbox unificado funcional, pipeline con drag & drop, timeline de lead, import CSV.
- Pendientes de auditoría de CLAUDE.md: Playbook de Prospección (fuentes MX, funnel math, secuencia default).
