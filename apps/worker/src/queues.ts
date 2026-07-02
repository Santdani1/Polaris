/**
 * Nombres de colas de BullMQ — Fase 0: solo el catálogo, sin jobs.
 * Cada cola se activa en su fase (ver roadmap, sección 12 de CLAUDE.md).
 */
export const QUEUE_NAMES = {
  /** Fase 2: pasos de cadencias (NURTURER) */
  cadences: "cadences",
  /** Fase 2: envío de mensajes salientes con rate limits */
  outbound: "outbound-messages",
  /** Fase 3: cron de SENTINEL — meetings pasadas sin outcome */
  sentinel: "sentinel-outcomes",
  /** Fase 6: corrida nocturna de STRATEGIST */
  strategist: "strategist-nightly",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
