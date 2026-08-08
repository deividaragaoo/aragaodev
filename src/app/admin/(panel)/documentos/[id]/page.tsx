import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminButton,
  AdminCard,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import { DocumentPaymentPanel } from "@/components/admin/DocumentPaymentPanel";
import { PrintDocumentButton } from "@/components/admin/PrintDocumentButton";
import {
  approveDocumentAsProjectAction,
  deleteDocumentAction,
} from "@/lib/admin/actions/documents";
import { DOCUMENT_TYPES } from "@/lib/admin/constants";
import { getDocumentTypeProfile } from "@/lib/admin/document-profiles";
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
  const profile = getDocumentTypeProfile(doc.type);

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

      <p className="text-sm text-muted">{profile.description}</p>

      <div className="flex flex-wrap gap-2">
        <StatusBadge label={doc.status} tone="info" />
        {profile.showServicePricing || profile.showPaidAmount ? (
          <StatusBadge
            label={formatCurrency(
              profile.showPaidAmount
                ? doc.amountPaid || doc.total
                : doc.total
            )}
          />
        ) : null}
      </div>

      {profile.canConvertToProject && doc.status !== "aprovado" ? (
        <form action={approve}>
          <AdminButton type="submit">Transformar em Projeto</AdminButton>
        </form>
      ) : null}

      {profile.showPaymentPanel ? (
        <DocumentPaymentPanel
          documentId={doc.id}
          total={doc.total || 0}
          trackPayments={doc.trackPayments || 0}
          amountPaid={doc.amountPaid || 0}
        />
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
            <p>{doc.client?.whatsapp}</p>
            <p>{doc.client?.address}</p>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-3 text-sm font-medium">Resumo</h2>
          <div className="space-y-1 text-sm text-muted">
            <p>Emissão: {formatDate(doc.issueDate)}</p>
            {profile.showValidUntil ? (
              <p>
                {profile.labels.validUntil}: {formatDate(doc.validUntil)}
              </p>
            ) : null}
            {profile.showDeliveryDeadline ? (
              <p>Entrega: {formatDate(doc.deliveryDeadline)}</p>
            ) : null}
            {profile.showWarranty ? (
              <p>Garantia: {doc.warranty || "—"}</p>
            ) : null}
            {profile.showPaymentTerms || profile.showPaidAmount ? (
              <p>Pagamento: {doc.paymentMethod || "—"}</p>
            ) : null}
            {profile.showRemainingBalance ? (
              <>
                <p>
                  {profile.labels.contractTotal}:{" "}
                  {formatCurrency(doc.total || 0)}
                </p>
                <p>
                  {profile.labels.paidAmount}:{" "}
                  {formatCurrency(doc.amountPaid || 0)}
                </p>
                <p>
                  {profile.labels.remaining}:{" "}
                  {formatCurrency(
                    Math.max(0, (doc.total || 0) - (doc.amountPaid || 0))
                  )}
                </p>
              </>
            ) : profile.showPaidAmount ? (
              <p>
                {profile.labels.paidAmount}:{" "}
                {formatCurrency(doc.amountPaid || doc.total || 0)}
              </p>
            ) : null}
            {profile.showInstallmentPlan && doc.trackPayments ? (
              <p>Entrada: {formatCurrency(doc.downPayment || 0)}</p>
            ) : null}
          </div>
        </AdminCard>

        {profile.showServices ? (
          <AdminCard className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-medium">
              {profile.labels.services}
            </h2>
            <div className="space-y-2">
              {doc.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-1 border-b border-white/[0.05] py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    {profile.showServiceDescription && item.description ? (
                      <p className="text-xs text-muted">{item.description}</p>
                    ) : null}
                  </div>
                  {profile.showServicePricing ? (
                    <p className="text-sm">{formatCurrency(item.total)}</p>
                  ) : null}
                </div>
              ))}
            </div>
            {profile.showServicePricing ? (
              <p className="mt-4 text-right text-lg font-semibold">
                Total: {formatCurrency(doc.total)}
              </p>
            ) : null}
          </AdminCard>
        ) : null}

        {profile.showInstallmentPlan && doc.installments.length > 0 ? (
          <AdminCard className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-medium">Parcelas</h2>
            <div className="space-y-2">
              {doc.installments.map((installment) => (
                <p key={installment.id} className="text-sm text-muted">
                  Parcela {installment.number}:{" "}
                  {formatCurrency(installment.amount)} —{" "}
                  {formatDate(installment.dueDate)}
                </p>
              ))}
            </div>
          </AdminCard>
        ) : null}

        {((profile.showNotes && doc.notes) ||
          (profile.showConditions && doc.conditions)) && (
          <AdminCard className="lg:col-span-2">
            {profile.showNotes && doc.notes ? (
              <p className="text-sm text-muted">
                {profile.labels.notes}: {doc.notes}
              </p>
            ) : null}
            {profile.showConditions && doc.conditions ? (
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted">
                {profile.labels.conditions}: {doc.conditions}
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
