import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { AdminCard, PageHeader } from "@/components/admin/ui";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/admin/format";
import {
  getProjectDetail,
  listClients,
} from "@/lib/admin/queries";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, clients] = await Promise.all([
    getProjectDetail(Number(id)),
    listClients(),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={detail.project.name}
        description={`Cliente: ${detail.client?.name ?? "Cliente removido"}`}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <ProjectForm project={detail.project} clients={clients} />
        <div className="grid gap-6">
          <AdminCard>
            <h2 className="mb-4 text-xl font-semibold text-white">Financeiro</h2>
            <div className="grid gap-3">
              {detail.receivables.map((item) => (
                <div
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  key={item.id}
                >
                  <div className="flex justify-between gap-4">
                    <span className="text-white">{item.description}</span>
                    <span className="text-orange-200">
                      {formatCurrency(item.amountCents)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Vence {formatDate(item.dueDate)} - {item.status}
                  </p>
                </div>
              ))}
            </div>
          </AdminCard>
          <AdminCard>
            <h2 className="mb-4 text-xl font-semibold text-white">Historico</h2>
            <div className="grid gap-3">
              {detail.activity.map((activity) => (
                <div
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  key={activity.id}
                >
                  <p className="text-sm text-white">{activity.message}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatDateTime(activity.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
