import { Workflow } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Cadencias" };

export default function CadencesPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Cadencias" description="Las secuencias de seguimiento de tu agente." />
      <EmptyState
        icon={Workflow}
        title="El editor de cadencias está en camino"
        description="Diseña secuencias multi-touch paso a paso: canal, tiempos de espera y el hint de prompt con el que la IA personaliza cada mensaje. Cadencias de frío, nurture, reactivación a 90 días, no-show y renovaciones. Llega en Fase 2 junto con NURTURER."
        action={
          <Link href="/prospects" className={buttonVariants({ variant: "secondary" })}>
            Ver prospectos a nutrir
          </Link>
        }
      />
    </div>
  );
}
