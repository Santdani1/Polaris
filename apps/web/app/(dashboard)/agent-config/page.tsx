import { Settings2 } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Agent Config" };

export default function AgentConfigPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Agent Config" description="Cómo piensa, habla y hasta dónde decide tu agente." />
      <EmptyState
        icon={Settings2}
        title="El panel de control de tu empleado digital"
        description="Aquí configurarás el ICP de tu organización, el tono de voz, los límites por canal, los horarios de operación, el on/off por subagente y el dial de autonomía (sugiere → actúa y notifica → autónomo) por categoría de acción. Los guardrails se aplican en código, no en confianza. Se construye junto con las fases 2 a 6."
        action={
          <Link href="/command" className={buttonVariants({ variant: "secondary" })}>
            Volver al Command Center
          </Link>
        }
      />
    </div>
  );
}
