import {
  AdminButton,
  AdminCard,
  AdminField,
  AdminInput,
  AdminSelect,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import {
  createPayableAction,
  createReceivableAction,
  deletePayableAction,
  deleteReceivableAction,
  markPayablePaidAction,
  markReceivablePaidAction,
} from "@/lib/admin/actions/finance";
import {
  PAYABLE_CATEGORIES,
  PAYABLE_STATUSES,
  PAYMENT_METHODS,
  RECEIVABLE_STATUSES,
} from "@/lib/admin/constants";
import { formatCurrency, formatDate, isOverdue } from "@/lib/admin/format";
import {
  listClients,
  listPayables,
  listProjects,
  listReceivables,
} from "@/lib/admin/queries";

export default async function FinanceiroPage() {
  const [receivables, payables, clients, projects] = await Promise.all([
    listReceivables(),
    listPayables(),
    listClients(),
    listProjects(),
  ]);

  const normalize = <T extends { status: string; dueDate: string; amount: number }>(
    items: T[]
  ) =>
    items.map((item) => ({
      ...item,
      status:
        item.status === "pendente" && isOverdue(item.dueDate, item.status)
          ? "atrasado"
          : item.status,
    }));

  const rec = normalize(receivables);
  const pay = normalize(payables);

  const sumBy = (items: { status: string; amount: number }[], statuses: string[]) =>
    items
      .filter((item) => statuses.includes(item.status))
      .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Financeiro"
        description="Contas a receber e contas a pagar."
      />

      <section>
        <h2 className="mb-4 text-lg font-medium">Contas a receber</h2>
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <MiniStat label="Total" value={formatCurrency(sumBy(rec, ["pendente", "atrasado", "pago"]))} />
          <MiniStat label="Recebido" value={formatCurrency(sumBy(rec, ["pago"]))} />
          <MiniStat label="Pendente" value={formatCurrency(sumBy(rec, ["pendente"]))} />
          <MiniStat label="Atrasado" value={formatCurrency(sumBy(rec, ["atrasado"]))} />
        </div>

        <form
          action={createReceivableAction}
          className="mb-5 grid gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 md:grid-cols-3"
        >
          <AdminField label="Cliente">
            <AdminSelect name="clientId" required>
              <option value="">Selecione</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="Projeto">
            <AdminSelect name="projectId">
              <option value="">Opcional</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="Descrição">
            <AdminInput name="description" required />
          </AdminField>
          <AdminField label="Valor">
            <AdminInput name="amount" required />
          </AdminField>
          <AdminField label="Vencimento">
            <AdminInput name="dueDate" type="date" required />
          </AdminField>
          <AdminField label="Forma de pagamento">
            <AdminSelect name="paymentMethod">
              <option value="">Selecione</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="Parcela">
            <AdminInput name="installment" placeholder="1/3" />
          </AdminField>
          <AdminField label="Status">
            <AdminSelect name="status" defaultValue="pendente">
              {RECEIVABLE_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <div className="flex items-end">
            <AdminButton type="submit">Adicionar</AdminButton>
          </div>
        </form>

        {rec.length === 0 ? (
          <EmptyState title="Nenhuma conta a receber" />
        ) : (
          <div className="space-y-2">
            {rec.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{item.description}</p>
                  <p className="text-xs text-muted">
                    {item.clientName} · {formatCurrency(item.amount)} ·{" "}
                    {formatDate(item.dueDate)}
                    {item.installment ? ` · ${item.installment}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={item.status}
                    tone={
                      item.status === "pago"
                        ? "success"
                        : item.status === "atrasado"
                          ? "danger"
                          : "warning"
                    }
                  />
                  {item.status !== "pago" ? (
                    <form action={markReceivablePaidAction.bind(null, item.id)}>
                      <AdminButton variant="secondary" type="submit">
                        Marcar pago
                      </AdminButton>
                    </form>
                  ) : null}
                  <form action={deleteReceivableAction.bind(null, item.id)}>
                    <AdminButton variant="ghost" type="submit">
                      Excluir
                    </AdminButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">Contas a pagar</h2>
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <MiniStat label="Total" value={formatCurrency(sumBy(pay, ["pendente", "atrasado", "pago"]))} />
          <MiniStat label="Pago" value={formatCurrency(sumBy(pay, ["pago"]))} />
          <MiniStat label="Pendente" value={formatCurrency(sumBy(pay, ["pendente"]))} />
          <MiniStat label="Atrasado" value={formatCurrency(sumBy(pay, ["atrasado"]))} />
        </div>

        <form
          action={createPayableAction}
          className="mb-5 grid gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 md:grid-cols-3"
        >
          <AdminField label="Descrição">
            <AdminInput name="description" required />
          </AdminField>
          <AdminField label="Categoria">
            <AdminSelect name="category" defaultValue="outros">
              {PAYABLE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="Fornecedor">
            <AdminInput name="supplier" />
          </AdminField>
          <AdminField label="Valor">
            <AdminInput name="amount" required />
          </AdminField>
          <AdminField label="Vencimento">
            <AdminInput name="dueDate" type="date" required />
          </AdminField>
          <AdminField label="Recorrência">
            <AdminSelect name="recurrence" defaultValue="unica">
              <option value="unica">Única</option>
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
            </AdminSelect>
          </AdminField>
          <AdminField label="Status">
            <AdminSelect name="status" defaultValue="pendente">
              {PAYABLE_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <div className="flex items-end">
            <AdminButton type="submit">Adicionar</AdminButton>
          </div>
        </form>

        {pay.length === 0 ? (
          <EmptyState title="Nenhuma conta a pagar" />
        ) : (
          <div className="space-y-2">
            {pay.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{item.description}</p>
                  <p className="text-xs text-muted">
                    {item.category} · {formatCurrency(item.amount)} ·{" "}
                    {formatDate(item.dueDate)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={item.status}
                    tone={
                      item.status === "pago"
                        ? "success"
                        : item.status === "atrasado"
                          ? "danger"
                          : "warning"
                    }
                  />
                  {item.status !== "pago" ? (
                    <form action={markPayablePaidAction.bind(null, item.id)}>
                      <AdminButton variant="secondary" type="submit">
                        Marcar pago
                      </AdminButton>
                    </form>
                  ) : null}
                  <form action={deletePayableAction.bind(null, item.id)}>
                    <AdminButton variant="ghost" type="submit">
                      Excluir
                    </AdminButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <AdminCard>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </AdminCard>
  );
}
