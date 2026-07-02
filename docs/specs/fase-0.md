# Spec — Fase 0: Fundaciones

> Registrada a partir del brief de la sesión de arranque (Daniel, jul 2026). CLAUDE.md define visión y reglas; este spec define el detalle de construcción de la fase.

## Objetivo

Montar los cimientos: monorepo, base de datos multi-tenant con RLS, auth funcional y el shell del dashboard con datos seed realistas.

## Entregables

1. **Monorepo** (pnpm workspaces + Turborepo): `apps/web` (Next.js 15 App Router, TS estricto, Tailwind, shadcn/ui), `apps/worker` (esqueleto BullMQ + Redis, solo healthcheck), `packages/db`, `packages/shared` (tipos + zod), `packages/agents` y `packages/providers` (estructura + interfaces + README).
2. **Supabase**: migrations con TODAS las tablas de la sección 7 de CLAUDE.md; RLS por `organization_id` en todas; auth email/password con creación de organization + user admin al registrarse; seed con 1 org demo, 2 usuarios, 25 leads en los estados de la sección 4 con enrichment realista, 3 meetings (won / outcome pendiente / futura), 2 conversaciones de WhatsApp con 10 mensajes en español mexicano y 30 agent_actions.
3. **Shell del dashboard**: sidebar fija con los 10 módulos (íconos lucide) + topbar con selector de org y usuario. Rutas: `/command` (contadores del día + feed server-rendered), `/pipeline` (kanban read-only), `/prospects` (TanStack Table), y placeholders con empty states diseñados en las demás.
4. **docs/STATE.md** actualizado al cierre de la sesión.
5. **.env.example** completo (sección 8).
6. **docs/DESIGN.md** con el sistema de diseño (tokens, tipografía Geist, densidad Attio/Linear) aplicado en toda la UI.

## Criterios de done

- [ ] `pnpm dev` levanta web y worker sin errores
- [ ] Registro → login → dashboard end-to-end
- [ ] `/pipeline` muestra el kanban con los 25 leads seed
- [ ] `/command` muestra el feed con las 30 agent_actions
- [ ] RLS verificado con test: un usuario de otra org no puede leer datos de la org demo
- [ ] `pnpm typecheck` y `pnpm lint` pasan limpio

## Fuera de alcance (explícito)

- Cualquier feature de fases 1+ (integraciones, agentes funcionando, Realtime).
- Sección 9 (guardrails): se diseña con revisión de Daniel en las fases donde aplica.
