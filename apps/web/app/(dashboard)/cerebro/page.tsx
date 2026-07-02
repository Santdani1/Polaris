import { Brain } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Cerebro" };

export default function CerebroPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Cerebro" description="La mente del agente, visible." />
      <EmptyState
        icon={Brain}
        title="Aquí vas a ver pensar a tu agente"
        description="Las decisiones de STRATEGIST con su razonamiento en lenguaje natural, la cola de trabajo del día con el porqué de cada acción, los insights del playbook con su evidencia, y las predicciones por lead: probabilidad de cierre, mejor ventana de contacto y riesgo de no-show. Llega en Fase 6, junto con el cerebro nocturno."
        action={
          <Link href="/command" className={buttonVariants({ variant: "secondary" })}>
            Ver la actividad de hoy
          </Link>
        }
      />
    </div>
  );
}
