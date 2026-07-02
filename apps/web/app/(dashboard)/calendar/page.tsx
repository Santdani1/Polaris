import { Calendar } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Calendario" };

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Calendario" description="Las citas que tu agente agenda por ti." />
      <EmptyState
        icon={Calendar}
        title="Tus citas vivirán aquí"
        description="El calendario de todos los agentes de tu organización: citas con outcome a color, no-shows visibles y — más adelante — el riesgo de no-show predicho por cita. Cada evento llegará con el dossier completo del prospecto en la descripción. Llega en Fase 2 con Google Calendar."
        action={
          <Link href="/pipeline" className={buttonVariants({ variant: "secondary" })}>
            Ver leads con cita agendada
          </Link>
        }
      />
    </div>
  );
}
