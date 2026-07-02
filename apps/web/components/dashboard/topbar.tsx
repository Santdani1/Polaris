"use client";

import { Building2, Check, ChevronsUpDown, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";

interface TopbarProps {
  organizationName: string;
  userName: string;
  userEmail: string;
  userRole: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  agent: "Agente",
  viewer: "Solo lectura",
};

export function Topbar({ organizationName, userName, userEmail, userRole }: TopbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-13 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur">
      {/* Selector de organización */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-8 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-base transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          <Building2 className="size-4 text-muted" />
          <span className="max-w-48 truncate font-medium">{organizationName}</span>
          <ChevronsUpDown className="size-3.5 text-muted" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Organización</DropdownMenuLabel>
          <DropdownMenuItem>
            <Check className="text-accent-hover" />
            {organizationName}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            Cambiar de organización — próximamente
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Menú de usuario */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          <div className="flex size-7 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent-hover">
            {initials(userName)}
          </div>
          <span className="hidden text-base sm:block">{userName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-foreground">{userName}</span>
            <span className="font-normal">{userEmail}</span>
          </DropdownMenuLabel>
          <DropdownMenuItem disabled>
            <UserRound />
            {ROLE_LABELS[userRole] ?? userRole}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleSignOut} className="text-danger data-[highlighted]:bg-danger/10 [&_svg]:text-danger">
            <LogOut />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
