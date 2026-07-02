import { SUBAGENT_LABELS, type Subagent } from "@polaris/shared";
import { Activity, CalendarCheck, CalendarClock, MessagesSquare, Send, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getCommandData, type FeedAction } from "@/lib/data";
import { cn, timeAgo } from "@/lib/utils";

export const metadata = { title: "Command Center" };
export const dynamic = "force-dynamic";

const SUBAGENT_COLORS: Record<Subagent, string> = {
  hunter: "border-accent/30 bg-accent/10 text-accent-hover",
  opener: "border-success/30 bg-success/10 text-success",
  nurturer: "border-warning/30 bg-warning/10 text-warning",
  scheduler: "border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8]",
  sentinel: "border-danger/30 bg-danger/10 text-danger",
  librarian: "border-[#A78BFA]/30 bg-[#A78BFA]/10 text-[#A78BFA]",
  strategist: "border-[#F472B6]/30 bg-[#F472B6]/10 text-[#F472B6]",
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-elevated">
          <Icon className="size-4 text-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

function FeedItem({ action }: { action: FeedAction }) {
  const summary =
    typeof action.payload?.summary === "string" ? action.payload.summary : action.action;
  return (
    <li className="flex items-start gap-3 px-4 py-2.5">
      <Badge className={cn("mt-0.5 shrink-0 font-mono", SUBAGENT_COLORS[action.subagent])}>
        {SUBAGENT_LABELS[action.subagent]}
      </Badge>
      <div className="min-w-0 flex-1">
        <p className="text-base leading-snug">{summary}</p>
        <p className="mt-0.5 text-xs text-muted">
          {action.leads?.name ? `${action.leads.name} · ` : ""}
          {timeAgo(action.at)}
        </p>
      </div>
    </li>
  );
}

export default async function CommandPage() {
  const data = await getCommandData();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Command Center"
        description="Qué está haciendo tu agente ahora mismo."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Leads prospectados hoy" value={data.leadsToday} icon={UserPlus} />
        <StatCard label="Conversaciones activas" value={data.activeConversations} icon={MessagesSquare} />
        <StatCard label="Mensajes enviados hoy" value={data.messagesSentToday} icon={Send} />
        <StatCard label="Citas agendadas" value={data.meetingsScheduled} icon={CalendarClock} />
        <StatCard label="Citas de hoy" value={data.meetingsToday} icon={CalendarCheck} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between border-b border-border pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-4 text-accent-hover" />
            Actividad del agente
          </CardTitle>
          <span className="text-xs text-muted">
            Realtime llega en fases posteriores — por ahora, server-rendered
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {data.feed.map((action) => (
              <FeedItem key={action.id} action={action} />
            ))}
          </ul>
          {data.feed.length === 0 ? (
            <p className="px-4 py-8 text-center text-base text-muted">
              Sin actividad todavía. Corre <code className="font-mono text-sm">pnpm db:seed</code>{" "}
              para ver el feed con datos demo.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
