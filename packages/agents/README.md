# @polaris/agents

Orquestador + subagentes de POLARIS (sección 3 de CLAUDE.md).

**Fase 0: solo estructura e interfaces.** La implementación llega por fases:

| Subagente | Rol | Fase |
|---|---|---|
| `hunter/` | Prospección: listas, enriquecimiento, ICP scoring | 4 |
| `opener/` | Primer contacto multicanal personalizado | 4 |
| `nurturer/` | Seguimiento, objeciones, handoff humano | 2 |
| `scheduler/` | Agendamiento + dossiers en calendario | 2 |
| `sentinel/` | Loop de outcome post-junta (el diferenciador) | 3 |
| `librarian/` | Vault y flywheel de cartera | 5 |
| `strategist/` | Cerebro nocturno: NBA, action_queue, aprendizaje | 6 |

## Reglas duras (se aplican en código, no en confianza)

- Ningún subagente ejecuta una acción externa sin escribir **antes** en `agent_actions`. Sin log, no hay acción.
- Nadie contacta un lead con `opted_out = true`. Jamás.
- Toda salida de LLM se valida con zod (retry máx. 2, luego task para humano).
- El orquestador verifica el dial de autonomía (L1/L2/L3) antes de ejecutar.
- Los system prompts viven versionados en `prompts/` (un `.md` por subagente).
