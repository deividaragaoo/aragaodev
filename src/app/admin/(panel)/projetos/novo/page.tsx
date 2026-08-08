import { PageHeader } from "@/components/admin/ui";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { createProjectAction } from "@/lib/admin/actions/projects";
import { listClients } from "@/lib/admin/queries";

export default async function NovoProjetoPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const clients = await listClients();
  const preselectedClientId = clientId ? Number(clientId) : undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Adicionar projeto"
        description="Cadastre um novo trabalho para acompanhar status e pagamentos."
      />

      <ProjectForm
        action={createProjectAction}
        clients={clients}
        preselectedClientId={
          Number.isFinite(preselectedClientId) ? preselectedClientId : undefined
        }
      />
    </div>
  );
}
