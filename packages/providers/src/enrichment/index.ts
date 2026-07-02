import type { LeadEnrichment } from "@polaris/shared";

/**
 * EnrichmentProvider — implementación: Apollo.io / scraping + Claude (Fase 4).
 * Claude estructura los datos crudos al schema de leads; la salida
 * SIEMPRE se valida con zod antes de escribirse.
 */
export interface EnrichmentProvider {
  enrichLead(input: {
    name: string;
    company?: string;
    linkedinUrl?: string;
    city?: string;
  }): Promise<LeadEnrichment>;
}
