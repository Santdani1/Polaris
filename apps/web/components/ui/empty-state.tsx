import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** CTA — botón o link ya armado. Siempre presente por diseño. */
  action: React.ReactNode;
  className?: string;
}

/**
 * Estado vacío siempre diseñado (regla de DESIGN.md): ícono + título +
 * descripción + CTA. Nunca un div vacío.
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-elevated">
        <Icon className="size-6 text-accent-hover" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-md text-base leading-relaxed text-muted">{description}</p>
      <div className="mt-5">{action}</div>
    </div>
  );
}
