import {
  createPayableAction,
  createReceivableAction,
  markPayablePaidAction,
  markReceivablePaidAction,
} from "@/lib/admin/actions/finance";
import {
  AdminButton,
  AdminCard,
  Field,
  PageHeader,
  SelectField,
  StatusBadge,
  TextArea,
} from "@/components/admin/ui";
import { FINANCE_STATUS_LABEL } from "@/lib/admin/constants";
import { formatCurrency, formatDate, todayDateInput } from "@/lib/admin/format";
import {
  getFinanceOverview,
  listClients,
  listProjects,
} from "@/lib/admin/queries";

export default async function FinancePage() {
  const [finance, clients, projects] = await Promise.all([
    getFinanceOverview(),
    listClients(),
    listProjects(),
  ]);

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Recebiveis, contas a pagar, status e vencimentos."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <AdminCard>
          <p className="text-sm text-zinc-400">Recebido</p>
          <p className="mt-2 text-xl font-semibold text-emerald-200">
            {formatCurrency(finance.totals.paidReceivablesCents)}
          </p>
        </AdminCard>
        <AdminCard>
          <p className="text-sm text-zinc-400">A receber</p>
          <p className="mt-2 text-xl font-semibold text-orange-200">
            {formatCurrency(finance.totals.pendingReceivablesCents)}
          </p>
        </AdminCard>
        <AdminCard>
          <p className="text-sm text-zinc-400">Pago</p>
          <p className="mt-2 text-xl font-semibold text-emerald-200">
            {formatCurrency(finance.totals.paidPayablesCents)}
          </p>
        </AdminCard>
        <AdminCard>
          <p className="text-sm text-zinc-400">A pagar</p>
          <p className="mt-2 text-xl font-semibold text-red-200">
            {formatCurrency(finance.totals.pendingPayablesCents)}
          </p>
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <h2 className="mb-4 text-xl font-semibold text-white">Recebiveis</h2>
          <div className="grid gap-3">
            {finance.receivables.map((item) => (
              <div
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
                key={item.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.description}</p>
                    <p className="text-xs text-zinc-500">
                      {item.clientName}
                      {item.projectName ? ` - ${item.projectName}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-200">
                      {formatCurrency(item.amountCents)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatDate(item.dueDate)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <StatusBadge
                    status={item.status}
                    label={FINANCE_STATUS_LABEL[item.status]}
                  />
                  {item.status !== "paid" ? (
                    <form action={markReceivablePaidAction}>
                      <input name="id" type="hidden" value={item.id} />
                      <AdminButton variant="secondary">Marcar pago</AdminButton>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-xl font-semibold text-white">Contas a pagar</h2>
          <div className="grid gap-3">
            {finance.payables.map((item) => (
              <div
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
                key={item.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.description}</p>
                    <p className="text-xs text-zinc-500">
                      {item.vendor} - {item.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-200">
                      {formatCurrency(item.amountCents)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatDate(item.dueDate)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <StatusBadge
                    status={item.status}
                    label={FINANCE_STATUS_LABEL[item.status]}
                  />
                  {item.status !== "paid" ? (
                    <form action={markPayablePaidAction}>
                      <input name="id" type="hidden" value={item.id} />
                      <AdminButton variant="secondary">Marcar pago</AdminButton>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Novo recebivel
          </h2>
          <form action={createReceivableAction} className="grid gap-4">
            <SelectField label="Cliente" name="clientId">
              <option value="">Selecione</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="Projeto" name="projectId">
              <option value="">Sem projeto</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </SelectField>
            <Field label="Descricao" name="description" required />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Valor" name="amount" required />
              <Field
                label="Vencimento"
                name="dueDate"
                type="date"
                defaultValue={todayDateInput()}
                required
              />
            </div>
            <SelectField label="Status" name="status" defaultValue="pending">
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </SelectField>
            <Field label="Metodo de pagamento" name="paymentMethod" />
            <TextArea label="Notas" name="notes" rows={3} />
            <AdminButton>Criar recebivel</AdminButton>
          </form>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Nova conta a pagar
          </h2>
          <form action={createPayableAction} className="grid gap-4">
            <Field label="Descricao" name="description" required />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Fornecedor" name="vendor" required />
              <Field label="Categoria" name="category" required />
              <Field label="Valor" name="amount" required />
              <Field
                label="Vencimento"
                name="dueDate"
                type="date"
                defaultValue={todayDateInput()}
                required
              />
            </div>
            <SelectField label="Status" name="status" defaultValue="pending">
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </SelectField>
            <TextArea label="Notas" name="notes" rows={3} />
            <AdminButton>Criar conta</AdminButton>
          </form>
        </AdminCard>
      </div>
    </>
  );
}
