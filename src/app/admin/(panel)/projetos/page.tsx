import Link from "next/link";
import {
  AdminButton,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import { ProjectProgress } from "@/components/admin/ProjectProgress";
import { PROJECT_STATUSES } from "@/lib/admin/constants";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import { getProjectFinance, listProjects, listProjectTaskStats } from "@/lib/admin/queries";

export default async function ProjetosPage() {
  const rows = await listProjects();
  const [finances, taskStats] = await Promise.all([
    Promise.all(
      rows.map(async (project) => ({
        id: project.id,
        ...(await getProjectFinance(project.id)),
      }))
    ),
    listProjectTaskStats(),
  ]);
  const financeMap = Object.fromEntries(finances.map((f) => [f.id, f]));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projetos"
        description="Trabalhos em andamento e histórico de projetos."
        actions={
          <Link href="/admin/projetos/novo">
            <AdminButton>+ Adicionar projeto</AdminButton>
          </Link>
        }
      />

      <section>
        {rows.length === 0 ? (
          <EmptyState
            title="Nenhum projeto cadastrado"
            description="Adicione o primeiro projeto pela aba Adicionar projeto."
          />
        ) : (
          <div className="space-y-3">
            {rows.map((project) => {
              const finance = financeMap[project.id];
              const tasks = taskStats[project.id];
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
                        {project.clientCompany
                          ? ` · ${project.clientCompany}`
                          : ""}
                      </p>
                      {tasks && tasks.total > 0 ? (
                        <p className="mt-1 text-xs text-[#ff6b35]">
                          {tasks.pending > 0
                            ? `${tasks.pending} tarefa${tasks.pending > 1 ? "s" : ""} pendente${tasks.pending > 1 ? "s" : ""}`
                            : "Checklist concluído"}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-muted">
                          Sem checklist ainda
                        </p>
                      )}
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

                  <div className="mt-4">
                    <ProjectProgress
                      projectId={project.id}
                      value={project.value || 0}
                      amountPaid={project.amountPaid || 0}
                      editable
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
                    {project.dueDate ? formatDate(project.dueDate) : "Sem prazo"}
                  </p>
                  <div className="mt-4">
                    <Link href={`/admin/projetos/${project.id}`}>
                      <AdminButton variant="secondary" type="button">
                        Abrir / tarefas
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
