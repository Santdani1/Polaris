import { FolderLock } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Vault" };

export default function VaultPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Vault" description="Tu cartera: clientes, pólizas y documentos." />
      <EmptyState
        icon={FolderLock}
        title="El flywheel de tu cartera empieza aquí"
        description="Clientes cerrados, pólizas con countdown de renovación y documentos con extracción automática de metadata. El motor de eventos de cartera convierte renovaciones, aniversarios, cumpleaños y oportunidades de cross-sell en leads que regresan solos al pipeline. Llega en Fase 5."
        action={
          <Link href="/pipeline" className={buttonVariants({ variant: "secondary" })}>
            Ver cierres en el pipeline
          </Link>
        }
      />
    </div>
  );
}
