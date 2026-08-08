import Link from "next/link";
import { ProjectForm } from "@/components/admin/ProjectForm";
import {
  AdminCard,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import { PROJECT_STATUS_LABEL } from "@/lib/admin/constants";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import { listClients, listProjects } from "@/lib/admin/queries";

export default async function ProjectsPage() {
  const [projects, clients] = await Promise.all([listProjects(), listClients()]);

  return (
    <>
      <PageHeader
        title="Projetos"
        description="Controle de status, recebido, pendente e proximo vencimento."
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminCard>
          {projects.length === 0 ? (
            <EmptyState>Nenhum projeto cadastrado.</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <tr>
                    <th className="pb-3">Projeto</th>
                    <th className="pb-3">Cliente</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Recebido</th>
                    <th className="pb-3">Pendente</th>
                    <th className="pb-3">Proximo venc.</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td className="py-4">
                        <Link
                          className="font-semibold text-white hover:text-orange-200"
                          href={`/admin/projetos/${project.id}`}
                        >
                          {project.name}
                        </Link>
                      </td>
                      <td className="py-4 text-zinc-300">
                        {project.clientName}
                      </td>
                      <td className="py-4 text-zinc-300">
                        {formatCurrency(project.totalCents)}
                      </td>
                      <td className="py-4 text-emerald-200">
                        {formatCurrency(project.receivedCents)}
                      </td>
                      <td className="py-4 text-orange-200">
                        {formatCurrency(project.pendingCents)}
                      </td>
                      <td className="py-4 text-zinc-400">
                        {formatDate(project.nextDueDate)}
                      </td>
                      <td className="py-4">
                        <StatusBadge
                          status={project.status}
                          label={PROJECT_STATUS_LABEL[project.status]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
        <div>
          <h2 className="mb-3 text-xl font-semibold text-white">
            Novo projeto
          </h2>
          <ProjectForm clients={clients} />
        </div>
      </div>
    </>
  );
}
