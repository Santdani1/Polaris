# @polaris/providers

Interfaces de integraciones externas. **Principio (sección 5 de CLAUDE.md):** toda integración va detrás de una interface; la lógica de negocio nunca se acopla a un vendor.

**Fase 0: solo interfaces.** Implementaciones concretas por fase:

| Provider | Interface | Implementación planeada | Fase |
|---|---|---|---|
| `whatsapp/` | `WhatsAppProvider` | Evolution API (v0) → WhatsApp Cloud API | 1 |
| `calendar/` | `CalendarProvider` | Google Calendar API | 2 |
| `linkedin/` | `LinkedInProvider` | Unipile | 4 |
| `voice/` | `VoiceProvider` | Retell AI o Vapi (evaluar en Fase 4) | 4-5 |
| `email/` | `EmailProvider` | Resend o SES | 4 |
| `enrichment/` | `EnrichmentProvider` | Apollo.io + scraping + Claude | 4 |

El swap de vendor (p. ej. Evolution → Cloud API) debe ser un cambio de una línea en la composición, nunca en la lógica de agentes.
