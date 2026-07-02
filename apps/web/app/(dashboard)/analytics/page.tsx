import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Analytics" description="Qué pasó, qué convierte y qué está aprendiendo tu agente." />
      <EmptyState
        icon={BarChart3}
        title="Aquí verás a tu agente aprender"
        description="Funnel completo de prospectado a cierre, conversión por canal, fuente y agente, motivos de pérdida, costo por cita y la performance histórica de variantes de mensajes. Con el tiempo, literalmente verás cómo el score y las predicciones mejoran mes a mes. Llega en Fase 7."
        action={
          <Link href="/command" className={buttonVariants({ variant: "secondary" })}>
            Ver los números de hoy
          </Link>
        }
      />
    </div>
  );
}
