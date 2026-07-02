import { Inbox } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Inbox" };

export default function InboxPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Inbox" description="Todas las conversaciones de tu agente, en un solo lugar." />
      <EmptyState
        icon={Inbox}
        title="Tu inbox unificado está en camino"
        description="WhatsApp, LinkedIn, transcripts de llamadas y email en una sola vista tipo chat, actualizándose en tiempo real. Podrás leer exactamente qué está diciendo tu agente, tomar el control de cualquier conversación y devolvérsela cuando quieras. Llega en Fase 1 con la conexión de WhatsApp."
        action={
          <Link href="/pipeline" className={buttonVariants({ variant: "secondary" })}>
            Mientras tanto, revisa el pipeline
          </Link>
        }
      />
    </div>
  );
}
