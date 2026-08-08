import Link from "next/link";
import {
  AdminButton,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { PROJECT_STATUSES } from "@/lib/admin/constants";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import {
  getProjectFinance,
  listClients,
  listProjects,
} from "@/lib/admin/queries";
import { createProjectAction } from "@/lib/admin/actions/projects";

export default async function ProjetosPage() {
  const [rows, clients] = await Promise.all([listProjects(), listClients()]);
  const finances = await Promise.all(
    rows.map(async (project) => ({
      id: project.id,
      ...(await getProjectFinance(project.id)),
    }))
  );
  const financeMap = Object.fromEntries(finances.map((f) => [f.id, f]));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projetos"
        description="Controle dos trabalhos em andamento."
      />

      <section>
        <h2 className="mb-4 text-lg font-medium">Novo projeto</h2>
        <ProjectForm action={createProjectAction} clients={clients} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">Lista</h2>
        {rows.length === 0 ? (
          <EmptyState title="Nenhum projeto cadastrado" />
        ) : (
          <div className="space-y-3">
            {rows.map((project) => {
              const finance = financeMap[project.id];
              return (
                <div
                  key={project.id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-medium">{project.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {project.clientName}
                        {project.clientCompany ? ` · ${project.clientCompany}` : ""}
                      </p>
                    </div>
                    <StatusBadge
                      label={
                        PROJECT_STATUSES.find((s) => s.value === project.status)
                          ?.label || project.status
                      }
                      tone={
                        project.status === "concluido"
                          ? "success"
                          : project.status === "cancelado"
                            ? "danger"
                            : "info"
                      }
                    />
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-4">
                    <p>Total: {formatCurrency(project.value)}</p>
                    <p>Recebido: {formatCurrency(finance?.received || 0)}</p>
                    <p>Pendente: {formatCurrency(finance?.pending || 0)}</p>
                    <p>Próx. venc.: {formatDate(finance?.nextDue)}</p>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Início {formatDate(project.startDate)} · Prazo{" "}
                    {formatDate(project.dueDate)}
                  </p>
                  <div className="mt-4">
                    <Link href={`/admin/projetos/${project.id}`}>
                      <AdminButton variant="secondary" type="button">
                        Editar
                      </AdminButton>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
