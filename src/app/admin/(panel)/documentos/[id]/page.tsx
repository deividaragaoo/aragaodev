import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminButton,
  AdminCard,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import { PrintDocumentButton } from "@/components/admin/PrintDocumentButton";
import {
  approveDocumentAsProjectAction,
  deleteDocumentAction,
} from "@/lib/admin/actions/documents";
import { DOCUMENT_TYPES } from "@/lib/admin/constants";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import { getDocumentById } from "@/lib/admin/queries";

export default async function DocumentoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await getDocumentById(Number(id));
  if (!doc) notFound();

  const approve = approveDocumentAsProjectAction.bind(null, doc.id);
  const remove = deleteDocumentAction.bind(null, doc.id);
  const typeLabel =
    DOCUMENT_TYPES.find((item) => item.value === doc.type)?.label || doc.type;

  return (
    <div className="space-y-6">
      <PageHeader
        title={doc.number}
        description={`${typeLabel} · ${doc.client?.name || "Cliente"}`}
        actions={
          <>
            <a
              href={`/api/admin/documents/${doc.id}/pdf`}
              target="_blank"
              rel="noreferrer"
            >
              <AdminButton type="button">Gerar PDF</AdminButton>
            </a>
            <PrintDocumentButton />
            <form action={remove}>
              <AdminButton variant="danger" type="submit">
                Excluir
              </AdminButton>
            </form>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        <StatusBadge label={doc.status} tone="info" />
        <StatusBadge label={formatCurrency(doc.total)} />
      </div>

      {(doc.type === "orcamento" || doc.type === "proposta") &&
      doc.status !== "aprovado" ? (
        <form action={approve}>
          <AdminButton type="submit">Transformar em Projeto</AdminButton>
        </form>
      ) : null}

      <div
        className="grid gap-4 lg:grid-cols-2 print:grid-cols-1"
        id="document-preview"
      >
        <AdminCard>
          <h2 className="mb-3 text-sm font-medium">Cliente</h2>
          <div className="space-y-1 text-sm text-muted">
            <p>{doc.client?.name}</p>
            <p>{doc.client?.company}</p>
            <p>{doc.client?.document}</p>
            <p>{doc.client?.whatsapp}</p>
            <p>{doc.client?.email}</p>
            <p>{doc.client?.address}</p>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-3 text-sm font-medium">Condições</h2>
          <div className="space-y-1 text-sm text-muted">
            <p>Emissão: {formatDate(doc.issueDate)}</p>
            <p>Validade: {formatDate(doc.validUntil)}</p>
            <p>Entrega: {formatDate(doc.deliveryDeadline)}</p>
            <p>Garantia: {doc.warranty || "—"}</p>
            <p>Pagamento: {doc.paymentMethod || "—"}</p>
            <p>Entrada: {formatCurrency(doc.downPayment || 0)}</p>
          </div>
        </AdminCard>

        <AdminCard className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-medium">Serviços</h2>
          <div className="space-y-2">
            {doc.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1 border-b border-white/[0.05] py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  {item.description ? (
                    <p className="text-xs text-muted">{item.description}</p>
                  ) : null}
                </div>
                <p className="text-sm">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-right text-lg font-semibold">
            Total: {formatCurrency(doc.total)}
          </p>
        </AdminCard>

        {doc.installments.length > 0 ? (
          <AdminCard className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-medium">Parcelas</h2>
            <div className="space-y-2">
              {doc.installments.map((installment) => (
                <p key={installment.id} className="text-sm text-muted">
                  Parcela {installment.number}: {formatCurrency(installment.amount)}{" "}
                  — {formatDate(installment.dueDate)}
                </p>
              ))}
            </div>
          </AdminCard>
        ) : null}

        {(doc.notes || doc.conditions) && (
          <AdminCard className="lg:col-span-2">
            {doc.notes ? (
              <p className="text-sm text-muted">Observações: {doc.notes}</p>
            ) : null}
            {doc.conditions ? (
              <p className="mt-2 text-sm text-muted">
                Condições: {doc.conditions}
              </p>
            ) : null}
          </AdminCard>
        )}
      </div>

      <Link
        href="/admin/documentos"
        className="text-sm text-muted hover:text-foreground"
      >
        ← Voltar para documentos
      </Link>
    </div>
  );
}
