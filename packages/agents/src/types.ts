import type { Subagent } from "@polaris/shared";

/**
 * Contratos del sistema multi-agente — Fase 0: solo interfaces.
 * La implementación llega en las fases 2-6 (ver roadmap, sección 12).
 */

/** Contexto mínimo que recibe cualquier subagente al ejecutarse. */
export interface AgentContext {
  organizationId: string;
  /** Dial de autonomía vigente para la categoría de acción (L1 | L2 | L3). */
  autonomyLevel: "L1" | "L2" | "L3";
}

/** Resultado estándar de una corrida de subagente. */
export interface AgentRunResult {
  subagent: Subagent;
  /** ids de los registros escritos en agent_actions durante la corrida. */
  actionIds: string[];
  summary: string;
}

/**
 * Todo subagente implementa este contrato. Regla dura: `run` escribe en
 * `agent_actions` ANTES de ejecutar cualquier acción externa.
 */
export interface SubagentRunner {
  readonly name: Subagent;
  run(context: AgentContext): Promise<AgentRunResult>;
}

/**
 * El orquestador decide qué subagente corre, verifica el dial de
 * autonomía y respeta el ritmo operativo de 24h (sección 1.1).
 */
export interface Orchestrator {
  register(runner: SubagentRunner): void;
  dispatch(subagent: Subagent, context: AgentContext): Promise<AgentRunResult>;
}
