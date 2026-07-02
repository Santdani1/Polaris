import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  type Lead,
  type LeadStatus,
} from "@polaris/shared";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { getLeads } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Pipeline" };
export const dynamic = "force-dynamic";

// Orden de columnas del kanban (flujo de la sección 4 + terminales al final).
const COLUMN_ORDER: LeadStatus[] = [
  "NEW",
  "ENRICHED",
  "QUALIFIED",
  "CONTACTED",
  "ENGAGED",
  "MEETING_SET",
  "MEETING_HELD",
  "HOT_FOLLOWUP",
  "WON",
  "LOST",
  "NO_SHOW",
  "RE_NURTURE_90D",
  "DISQUALIFIED",
  "OPT_OUT",
];

const STATUS_DOT: Partial<Record<LeadStatus, string>> = {
  WON: "bg-success",
  HOT_FOLLOWUP: "bg-warning",
  LOST: "bg-danger",
  NO_SHOW: "bg-danger",
  OPT_OUT: "bg-danger",
  MEETING_SET: "bg-accent",
  MEETING_HELD: "bg-accent",
};

function scoreColor(score: number | null): string {
  if (score === null) return "text-muted";
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-warning";
  return "text-muted";
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="rounded-lg border border-border bg-elevated p-2.5 transition-colors hover:border-muted/40">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-base font-medium">{lead.name}</p>
        {lead.icp_score !== null ? (
          <span className={cn("shrink-0 font-mono text-sm tabular-nums", scoreColor(lead.icp_score))}>
            {lead.icp_score}
          </span>
        ) : null}
      </div>
      {lead.company ? (
        <p className="mt-0.5 truncate text-sm text-muted">{lead.company}</p>
      ) : null}
      <div className="mt-2 flex items-center gap-1.5">
        <Badge variant="outline">{LEAD_SOURCE_LABELS[lead.source]}</Badge>
        {lead.city ? <span className="text-xs text-muted">{lead.city}</span> : null}
      </div>
    </div>
  );
}

export default async function PipelinePage() {
  const leads = await getLeads();

  const grouped = new Map<LeadStatus, Lead[]>();
  for (const lead of leads) {
    const bucket = grouped.get(lead.status) ?? [];
    bucket.push(lead);
    grouped.set(lead.status, bucket);
  }
  // Solo columnas con leads (más las etapas core del flujo, siempre visibles)
  const CORE: LeadStatus[] = ["NEW", "ENRICHED", "QUALIFIED", "CONTACTED", "ENGAGED", "MEETING_SET"];
  const columns = COLUMN_ORDER.filter(
    (status) => CORE.includes(status) || (grouped.get(status)?.length ?? 0) > 0
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Pipeline"
        description={`${leads.length} leads en la máquina de estados. Drag & drop y filtros llegan en Fase 1.`}
      />

      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((status) => {
          const columnLeads = grouped.get(status) ?? [];
          return (
            <div key={status} className="flex w-64 shrink-0 flex-col rounded-lg border border-border bg-surface">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <span className={cn("size-1.5 rounded-full", STATUS_DOT[status] ?? "bg-muted/60")} />
                <span className="text-sm font-medium">{LEAD_STATUS_LABELS[status]}</span>
                <span className="ml-auto font-mono text-xs text-muted tabular-nums">
                  {columnLeads.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 p-2">
                {columnLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
                {columnLeads.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-sm text-muted">
                    Sin leads aquí
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
