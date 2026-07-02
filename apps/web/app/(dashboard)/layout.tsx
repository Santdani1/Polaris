import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email, role, organization_id, organizations(name)")
    .eq("id", user.id)
    .maybeSingle();

  const organizationName =
    (profile?.organizations as unknown as { name: string } | null)?.name ?? "Mi organización";

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div className="pl-56">
        <Topbar
          organizationName={organizationName}
          userName={profile?.full_name ?? user.email ?? "Usuario"}
          userEmail={profile?.email ?? user.email ?? ""}
          userRole={profile?.role ?? "agent"}
        />
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}
