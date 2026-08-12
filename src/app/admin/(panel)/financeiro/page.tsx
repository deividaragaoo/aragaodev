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
  listReceivableBalances,
  listReceivables,
} from "@/lib/admin/queries";

export default async function FinanceiroPage() {
  const [receivables, payables, clients, projects, balances] = await Promise.all([
    listReceivables(),
    listPayables(),
    listClients(),
    listProjects(),
    listReceivableBalances(),
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

  const openBalances = balances.filter((item) => item.pending > 0 || item.received > 0);

  const activeProjects = projects.filter((project) => project.status !== "cancelado");
  const projectsTotal = activeProjects.reduce(
    (sum, project) => sum + (project.value || 0),
    0
  );
  const projectsReceived = activeProjects.reduce(
    (sum, project) =>
      sum + Math.min(project.value || 0, project.amountPaid || 0),
    0
  );
  const projectsRemaining = Math.max(0, projectsTotal - projectsReceived);
  const projectsPercent =
    projectsTotal > 0
      ? Math.min(100, Math.round((projectsReceived / projectsTotal) * 100))
      : 0;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Financeiro"
        description="Contas a receber e contas a pagar."
      />

      <section>
        <h2 className="mb-4 text-lg font-medium">Total em projetos</h2>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <MiniStat
            label="Valor total dos projetos"
            value={formatCurrency(projectsTotal)}
          />
          <MiniStat
            label="Já recebido"
            value={formatCurrency(projectsReceived)}
            tone="success"
          />
          <MiniStat
            label="Ainda falta receber"
            value={formatCurrency(projectsRemaining)}
            tone={projectsRemaining > 0 ? "warning" : "success"}
          />
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <p className="text-muted">
              {activeProjects.length} projeto(s) ativo(s)
            </p>
            <p className="font-semibold text-[#ff6b35]">{projectsPercent}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={`h-full rounded-full transition-all ${
                projectsRemaining <= 0
                  ? "bg-emerald-400"
                  : "bg-gradient-to-r from-[#ff7a18] to-[#ff3d00]"
              }`}
              style={{ width: `${projectsPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            {formatCurrency(projectsReceived)} de {formatCurrency(projectsTotal)}{" "}
            já recebidos nos projetos atuais
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">Contas a receber</h2>
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <MiniStat
            label="Total"
            value={formatCurrency(sumBy(rec, ["pendente", "atrasado", "pago"]))}
          />
          <MiniStat
            label="Recebido / Entrada"
            value={formatCurrency(sumBy(rec, ["pago"]))}
            tone="success"
          />
          <MiniStat
            label="Pendente"
            value={formatCurrency(sumBy(rec, ["pendente"]))}
            tone="warning"
          />
          <MiniStat
            label="Atrasado"
            value={formatCurrency(sumBy(rec, ["atrasado"]))}
            tone="danger"
          />
        </div>

        {openBalances.length > 0 ? (
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-medium text-muted">
              Progresso por cliente / projeto
            </h3>
            {openBalances.map((item) => {
              const percent =
                item.total > 0 ? Math.round((item.received / item.total) * 100) : 0;
              const tone =
                item.pending <= 0
                  ? "success"
                  : item.overdue > 0
                    ? "danger"
                    : "warning";

              return (
                <div
                  key={item.key}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.projectName}</p>
                      <p className="text-xs text-muted">{item.clientName}</p>
                    </div>
                    <StatusBadge
                      label={
                        item.pending <= 0
                          ? "Quitado"
                          : item.overdue > 0
                            ? "Com atraso"
                            : item.received > 0
                              ? "Entrada paga · pendente"
                              : "Aguardando pagamento"
                      }
                      tone={tone}
                    />
                  </div>

                  <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
                    <p>
                      <span className="text-muted">Total</span>
                      <br />
                      <span className="font-medium">{formatCurrency(item.total)}</span>
                    </p>
                    <p>
                      <span className="text-muted">Entrada / recebido</span>
                      <br />
                      <span className="font-medium text-emerald-400">
                        {formatCurrency(item.received)}
                      </span>
                      {item.entrada > 0 ? (
                        <span className="mt-0.5 block text-[11px] text-muted">
                          Entrada {formatCurrency(item.entrada)}
                        </span>
                      ) : null}
                    </p>
                    <p>
                      <span className="text-muted">Pendente</span>
                      <br />
                      <span className="font-medium text-amber-400">
                        {formatCurrency(item.pending)}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted">Progresso</span>
                      <br />
                      <span className="font-medium">{percent}%</span>
                    </p>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full ${
                        item.pending <= 0
                          ? "bg-emerald-400"
                          : item.overdue > 0
                            ? "bg-red-400"
                            : "bg-[#ff6b35]"
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

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
            <AdminInput
              name="description"
              required
              placeholder="Entrada, parcela 1/2..."
            />
          </AdminField>
          <AdminField label="Valor">
            <AdminInput
              name="amount"
              required
              inputMode="decimal"
              placeholder="Ex.: 1.500,00"
            />
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
          <AdminField label="Parcela / tipo">
            <AdminInput name="installment" placeholder="Entrada ou 1/3" />
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
            {rec.map((item) => {
              const isEntry =
                item.installment?.toLowerCase().includes("entrada") ||
                item.description.toLowerCase().includes("entrada");

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{item.description}</p>
                      {isEntry ? (
                        <StatusBadge label="Entrada" tone="info" />
                      ) : null}
                    </div>
                    <p className="text-xs text-muted">
                      {item.clientName}
                      {item.projectName ? ` · ${item.projectName}` : ""} ·{" "}
                      {formatCurrency(item.amount)} · {formatDate(item.dueDate)}
                      {item.installment ? ` · ${item.installment}` : ""}
                    </p>
                    {item.status === "pago" ? (
                      <p className="mt-1 text-xs text-emerald-400">
                        Pago{item.paidAt ? ` em ${formatDate(item.paidAt)}` : ""}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-amber-400">
                        Valor pendente: {formatCurrency(item.amount)}
                      </p>
                    )}
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
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">Contas a pagar</h2>
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <MiniStat
            label="Total"
            value={formatCurrency(sumBy(pay, ["pendente", "atrasado", "pago"]))}
          />
          <MiniStat label="Pago" value={formatCurrency(sumBy(pay, ["pago"]))} tone="success" />
          <MiniStat
            label="Pendente"
            value={formatCurrency(sumBy(pay, ["pendente"]))}
            tone="warning"
          />
          <MiniStat
            label="Atrasado"
            value={formatCurrency(sumBy(pay, ["atrasado"]))}
            tone="danger"
          />
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
            <AdminInput
              name="amount"
              required
              inputMode="decimal"
              placeholder="Ex.: 250,00"
            />
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

function MiniStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const tones = {
    default: "text-foreground",
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-red-400",
  };

  return (
    <AdminCard>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className={`mt-2 text-lg font-semibold ${tones[tone]}`}>{value}</p>
    </AdminCard>
  );
}
