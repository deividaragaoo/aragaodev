import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientForm } from "@/components/admin/ClientForm";
import { AdminCard, PageHeader, StatusBadge } from "@/components/admin/ui";
import {
  DOCUMENT_STATUS_LABEL,
  PROJECT_STATUS_LABEL,
} from "@/lib/admin/constants";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/admin/format";
import { getClientDetail } from "@/lib/admin/queries";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getClientDetail(Number(id));

  if (!detail) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={detail.client.name}
        description="Dados do cliente, projetos, documentos, recebiveis e historico."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <ClientForm client={detail.client} />
        <div className="grid gap-6">
          <AdminCard>
            <h2 className="mb-4 text-xl font-semibold text-white">Projetos</h2>
            <div className="grid gap-3">
              {detail.projects.map((project) => (
                <Link
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  href={`/admin/projetos/${project.id}`}
                  key={project.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-white">
                      {project.name}
                    </span>
                    <StatusBadge
                      status={project.status}
                      label={PROJECT_STATUS_LABEL[project.status]}
                    />
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">
                    {formatCurrency(project.totalCents)}
                  </p>
                </Link>
              ))}
            </div>
          </AdminCard>
          <AdminCard>
            <h2 className="mb-4 text-xl font-semibold text-white">Documentos</h2>
            <div className="grid gap-3">
              {detail.documents.map((document) => (
                <Link
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  href={`/admin/documentos/${document.id}`}
                  key={document.id}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">
                      {document.number}
                    </span>
                    <StatusBadge
                      status={document.status}
                      label={DOCUMENT_STATUS_LABEL[document.status]}
                    />
                  </div>
                  <p className="mt-2 text-sm text-orange-200">
                    {formatCurrency(document.totalCents)}
                  </p>
                </Link>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <h2 className="mb-4 text-xl font-semibold text-white">Recebiveis</h2>
          <div className="grid gap-3">
            {detail.receivables.map((item) => (
              <div
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
                key={item.id}
              >
                <div className="flex items-center justify-between gap-3">
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
    </>
  );
}
