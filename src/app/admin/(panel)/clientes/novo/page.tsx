import { PageHeader } from "@/components/admin/ui";
import { ClientForm } from "@/components/admin/ClientForm";
import { createClientAction } from "@/lib/admin/actions/clients";

export default function NovoClientePage() {
  return (
    <div>
      <PageHeader
        title="Novo cliente"
        description="Cadastre os dados uma vez e reutilize em documentos e projetos."
      />
      <ClientForm action={createClientAction} />
    </div>
  );
}
