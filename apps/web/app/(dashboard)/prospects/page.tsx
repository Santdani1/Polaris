import { LeadsTable } from "@/components/prospects/leads-table";
import { PageHeader } from "@/components/ui/page-header";
import { getLeads } from "@/lib/data";

export const metadata = { title: "Prospectos" };
export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  const leads = await getLeads();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Prospectos"
        description="Base completa de prospectos. Import CSV y detalle con timeline llegan en Fase 1."
      />
      <LeadsTable leads={leads} />
    </div>
  );
}
