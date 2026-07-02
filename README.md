# POLARIS

**El agente de seguros autónomo + SaaS de control.** Un SDR de seguros que trabaja 24/7: prospecta, contacta, da seguimiento y agenda citas para agentes de seguros humanos. Los humanos solo cierran.

> La fuente de verdad del proyecto es [`CLAUDE.md`](./CLAUDE.md). El estado actual vive en [`docs/STATE.md`](./docs/STATE.md). El sistema de diseño en [`docs/DESIGN.md`](./docs/DESIGN.md).

## Estructura

```
apps/
  web/        Next.js 15 — dashboard SaaS (el "cerebro de cristal")
  worker/     BullMQ + Redis — cadencias, crons, colas (esqueleto en Fase 0)
packages/
  db/         Migrations de Supabase, seed, test de RLS
  shared/     Tipos + zod schemas compartidos
  agents/     Orquestador + subagentes (interfaces en Fase 0)
  providers/  Interfaces de integraciones externas (WhatsApp, LinkedIn, voz…)
docs/         STATE.md, DESIGN.md, specs por fase, ADRs
```

## Quick start

```bash
pnpm install

# 1. Configura tu proyecto de Supabase y copia .env.example → .env
#    (y apps/web/.env.local con las NEXT_PUBLIC_*)
# 2. Aplica migrations y siembra datos demo:
pnpm db:migrate
pnpm db:seed

# 3. Levanta web + worker:
pnpm dev
```

Ver [`docs/STATE.md`](./docs/STATE.md) para el detalle de setup y credenciales demo.

## Comandos

```bash
pnpm dev              # web + worker en paralelo
pnpm dev:web          # solo dashboard
pnpm dev:worker       # solo worker (colas/crons)
pnpm db:migrate       # aplicar migrations (supabase db push)
pnpm db:types         # regenerar tipos desde Supabase
pnpm db:seed          # sembrar datos demo (org, usuarios, leads…)
pnpm test             # unit + integration (incluye test de RLS)
pnpm lint && pnpm typecheck
```
