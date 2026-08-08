import Link from "next/link";
import {
  AdminButton,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import { DOCUMENT_TYPES } from "@/lib/admin/constants";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import { listDocuments } from "@/lib/admin/queries";

export default async function DocumentosPage() {
  const rows = await listDocuments();

  return (
    <div>
      <PageHeader
        title="Documentos"
        description="Orçamentos, contratos, propostas e recibos."
        actions={
          <Link href="/admin/documentos/novo">
            <AdminButton>+ Novo documento</AdminButton>
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="Nenhum documento"
          description="Crie um orçamento e transforme em projeto quando aprovado."
        />
      ) : (
        <div className="space-y-2">
          {rows.map((doc) => (
            <Link
              key={doc.id}
              href={`/admin/documentos/${doc.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition hover:border-white/10 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium">{doc.number}</p>
                <p className="text-xs text-muted">
                  {DOCUMENT_TYPES.find((t) => t.value === doc.type)?.label} ·{" "}
                  {doc.clientName} · {formatDate(doc.issueDate)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium">{formatCurrency(doc.total)}</p>
                <StatusBadge label={doc.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
