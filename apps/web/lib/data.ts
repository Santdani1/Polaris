import type { AgentAction, Lead } from "@polaris/shared";
import { createClient } from "@/lib/supabase/server";

/** agent_action + nombre del lead relacionado (para el feed). */
export type FeedAction = AgentAction & { leads: { name: string } | null };

export interface CommandData {
  leadsToday: number;
  activeConversations: number;
  messagesSentToday: number;
  meetingsScheduled: number;
  meetingsToday: number;
  feed: FeedAction[];
}

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfTodayIso(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

/** Contadores del día + feed de agent_actions (RLS filtra por la org de la sesión). */
export async function getCommandData(): Promise<CommandData> {
  const supabase = await createClient();
  const dayStart = startOfTodayIso();
  const dayEnd = endOfTodayIso();

  const [leadsToday, activeConversations, messagesSentToday, meetingsScheduled, meetingsToday, feed] =
    await Promise.all([
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", dayStart),
      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("direction", "out")
        .gte("sent_at", dayStart),
      supabase
        .from("meetings")
        .select("id", { count: "exact", head: true })
        .eq("status", "scheduled"),
      supabase
        .from("meetings")
        .select("id", { count: "exact", head: true })
        .gte("starts_at", dayStart)
        .lte("starts_at", dayEnd),
      supabase
        .from("agent_actions")
        .select("*, leads(name)")
        .order("at", { ascending: false })
        .limit(30),
    ]);

  return {
    leadsToday: leadsToday.count ?? 0,
    activeConversations: activeConversations.count ?? 0,
    messagesSentToday: messagesSentToday.count ?? 0,
    meetingsScheduled: meetingsScheduled.count ?? 0,
    meetingsToday: meetingsToday.count ?? 0,
    feed: (feed.data ?? []) as FeedAction[],
  };
}

export async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Lead[];
}
