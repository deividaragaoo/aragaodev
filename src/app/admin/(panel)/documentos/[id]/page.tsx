import { notFound } from "next/navigation";
import { DocumentForm } from "@/components/admin/DocumentForm";
import { PrintDocumentButton } from "@/components/admin/PrintDocumentButton";
import { AdminCard, PageHeader, StatusBadge } from "@/components/admin/ui";
import {
  DOCUMENT_STATUS_LABEL,
  DOCUMENT_TYPE_LABEL,
} from "@/lib/admin/constants";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import {
  getDocumentDetail,
  listClients,
} from "@/lib/admin/queries";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, clients] = await Promise.all([
    getDocumentDetail(Number(id)),
    listClients(),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={detail.document.number}
        description={`${DOCUMENT_TYPE_LABEL[detail.document.type]} para ${
          detail.client?.name ?? "cliente removido"
        }`}
        action={<PrintDocumentButton documentId={detail.document.id} />}
      />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <AdminCard>
          <p className="text-sm text-zinc-400">Status</p>
          <div className="mt-3">
            <StatusBadge
              status={detail.document.status}
              label={DOCUMENT_STATUS_LABEL[detail.document.status]}
            />
          </div>
        </AdminCard>
        <AdminCard>
          <p className="text-sm text-zinc-400">Total</p>
          <p className="mt-2 text-xl font-semibold text-orange-200">
            {formatCurrency(detail.document.totalCents)}
          </p>
        </AdminCard>
        <AdminCard>
          <p className="text-sm text-zinc-400">Validade</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {formatDate(detail.document.validUntil)}
          </p>
        </AdminCard>
        <AdminCard>
          <p className="text-sm text-zinc-400">Aprovado em</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {formatDate(detail.document.approvedAt)}
          </p>
        </AdminCard>
      </div>
      <DocumentForm
        clients={clients}
        document={detail.document}
        items={detail.items}
        installments={detail.installments}
        settings={detail.settings}
      />
    </>
  );
}
