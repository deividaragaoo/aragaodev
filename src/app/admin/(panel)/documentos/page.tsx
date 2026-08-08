import Link from "next/link";
import {
  AdminButton,
  AdminCard,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import {
  DOCUMENT_STATUS_LABEL,
  DOCUMENT_TYPE_LABEL,
} from "@/lib/admin/constants";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import { listDocuments } from "@/lib/admin/queries";

export default async function DocumentsPage() {
  const documents = await listDocuments();

  return (
    <>
      <PageHeader
        title="Documentos"
        description="Orcamentos e faturas com numeracao automatica, PDF e aprovacao."
        action={
          <AdminButton href="/admin/documentos/novo">Novo documento</AdminButton>
        }
      />
      <AdminCard>
        {documents.length === 0 ? (
          <EmptyState>Nenhum documento criado.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                <tr>
                  <th className="pb-3">Numero</th>
                  <th className="pb-3">Titulo</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Criado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {documents.map((row) => (
                  <tr key={row.document.id}>
                    <td className="py-4">
                      <Link
                        className="font-semibold text-white hover:text-orange-200"
                        href={`/admin/documentos/${row.document.id}`}
                      >
                        {row.document.number}
                      </Link>
                    </td>
                    <td className="py-4 text-zinc-300">{row.document.title}</td>
                    <td className="py-4 text-zinc-300">
                      {row.clientName ?? "Cliente removido"}
                    </td>
                    <td className="py-4 text-zinc-400">
                      {DOCUMENT_TYPE_LABEL[row.document.type]}
                    </td>
                    <td className="py-4 text-orange-200">
                      {formatCurrency(row.document.totalCents)}
                    </td>
                    <td className="py-4">
                      <StatusBadge
                        status={row.document.status}
                        label={DOCUMENT_STATUS_LABEL[row.document.status]}
                      />
                    </td>
                    <td className="py-4 text-zinc-400">
                      {formatDate(row.document.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </>
  );
}
