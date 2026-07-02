"use client";

import {
  BarChart3,
  Brain,
  Calendar,
  FolderLock,
  Inbox,
  Kanban,
  LayoutDashboard,
  Settings2,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Los 10 módulos del dashboard — sección 11 de CLAUDE.md.
const NAV_ITEMS = [
  { href: "/command", label: "Command Center", icon: LayoutDashboard },
  { href: "/cerebro", label: "Cerebro", icon: Brain },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/calendar", label: "Calendario", icon: Calendar },
  { href: "/prospects", label: "Prospectos", icon: Users },
  { href: "/vault", label: "Vault", icon: FolderLock },
  { href: "/cadences", label: "Cadencias", icon: Workflow },
  { href: "/agent-config", label: "Agent Config", icon: Settings2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-border bg-surface">
      <div className="flex h-13 items-center gap-2 border-b border-border px-4">
        <div className="flex size-6 items-center justify-center rounded-md bg-accent">
          <Sparkles className="size-3.5 text-white" />
        </div>
        <span className="text-base font-semibold tracking-tight">POLARIS</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-base transition-colors",
                active
                  ? "bg-elevated font-medium text-foreground"
                  : "text-muted hover:bg-elevated/60 hover:text-foreground"
              )}
            >
              <Icon className={cn("size-4 shrink-0", active ? "text-accent-hover" : "")} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <p className="text-xs leading-relaxed text-muted">
          Fase 0 · Fundaciones
          <br />
          El feed en tiempo real llega en fases posteriores.
        </p>
      </div>
    </aside>
  );
}
