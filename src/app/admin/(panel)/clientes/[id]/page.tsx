import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminButton,
  AdminCard,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import { ClientForm } from "@/components/admin/ClientForm";
import { ProjectProgress } from "@/components/admin/ProjectProgress";
import {
  deleteClientAction,
  updateClientAction,
} from "@/lib/admin/actions/clients";
import { DOCUMENT_TYPES, PROJECT_STATUSES } from "@/lib/admin/constants";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import { getClientById } from "@/lib/admin/queries";

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getClientById(Number(id));
  if (!data) notFound();

  const { client, projects, documents, receivables, pendingTotal } = data;
  const update = updateClientAction.bind(null, client.id);
  const remove = deleteClientAction.bind(null, client.id);
  const receivedTotal = receivables
    .filter((item) => item.status === "pago")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title={client.name}
        description={client.company || "Cliente Aragão Dev"}
        actions={
          <form action={remove}>
            <AdminButton variant="danger" type="submit">
              Excluir
            </AdminButton>
          </form>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminCard>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Projetos
          </p>
          <p className="mt-2 text-2xl font-semibold">{projects.length}</p>
        </AdminCard>
        <AdminCard>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Documentos
          </p>
          <p className="mt-2 text-2xl font-semibold">{documents.length}</p>
        </AdminCard>
        <AdminCard>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Entrada / recebido
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-400">
            {formatCurrency(receivedTotal)}
          </p>
        </AdminCard>
        <AdminCard>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Valores pendentes
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-400">
            {formatCurrency(pendingTotal)}
          </p>
        </AdminCard>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-medium">Dados</h2>
        <ClientForm action={update} initial={client} submitLabel="Salvar alterações" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <HistoryBlock title="Projetos">
          {projects.length === 0 ? (
            <EmptyState title="Sem projetos" />
          ) : (
            projects.map((project) => (
              <div key={project.id} className="rounded-xl border border-white/[0.06] px-3 py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted">
                      {formatCurrency(project.value)} · prazo{" "}
                      {project.dueDate
                        ? formatDate(project.dueDate)
                        : "Sem prazo"}
                    </p>
                  </div>
                  <StatusBadge
                    label={
                      PROJECT_STATUSES.find((s) => s.value === project.status)?.label ||
                      project.status
                    }
                  />
                </div>
                <div className="mt-3">
                  <ProjectProgress
                    value={project.value || 0}
                    amountPaid={project.amountPaid || 0}
                  />
                </div>
              </div>
            ))
          )}
        </HistoryBlock>

        <HistoryBlock title="Documentos">
          {documents.length === 0 ? (
            <EmptyState title="Sem documentos" />
          ) : (
            documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/admin/documentos/${doc.id}`}
                className="block rounded-xl border border-white/[0.06] px-3 py-2.5 transition hover:bg-white/[0.02]"
              >
                <p className="text-sm font-medium">{doc.number}</p>
                <p className="text-xs text-muted">
                  {DOCUMENT_TYPES.find((t) => t.value === doc.type)?.label} ·{" "}
                  {formatCurrency(doc.total)}
                </p>
              </Link>
            ))
          )}
        </HistoryBlock>

        <HistoryBlock title="Pagamentos">
          {receivables.length === 0 ? (
            <EmptyState title="Sem lançamentos" />
          ) : (
            receivables.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/[0.06] px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{item.description}</p>
                  <StatusBadge
                    label={item.status}
                    tone={item.status === "pago" ? "success" : "warning"}
                  />
                </div>
                <p className="text-xs text-muted">
                  {formatCurrency(item.amount)} · {formatDate(item.dueDate)}
                  {item.installment ? ` · ${item.installment}` : ""}
                </p>
              </div>
            ))
          )}
        </HistoryBlock>
      </section>
    </div>
  );
}

function HistoryBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
