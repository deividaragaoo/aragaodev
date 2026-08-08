import { AdminStat, PageHeader } from "@/components/admin/ui";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import { getDashboardData } from "@/lib/admin/queries";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumo geral da operação Aragão Dev."
      />

      <section className="mb-8">
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Financeiro
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AdminStat
            label="Faturamento do mês"
            value={formatCurrency(data.finance.monthRevenue)}
          />
          <AdminStat
            label="Total recebido"
            value={formatCurrency(data.finance.received)}
            tone="success"
          />
          <AdminStat
            label="Total a receber"
            value={formatCurrency(data.finance.toReceive)}
            tone="warning"
          />
          <AdminStat
            label="Total a pagar"
            value={formatCurrency(data.finance.toPay)}
          />
          <AdminStat
            label="Valores atrasados"
            value={formatCurrency(data.finance.overdue)}
            tone="danger"
          />
          <AdminStat
            label="Saldo"
            value={formatCurrency(data.finance.balance)}
            tone={data.finance.balance >= 0 ? "success" : "danger"}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Projetos
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStat label="Em andamento" value={String(data.projects.inProgress)} />
          <AdminStat label="Aguardando aprovação" value={String(data.projects.awaiting)} />
          <AdminStat label="Concluídos" value={String(data.projects.done)} tone="success" />
          <AdminStat label="Atrasados" value={String(data.projects.overdue)} tone="danger" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Alertas
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <AlertCard title="Contas próximas do vencimento">
            {data.alerts.upcomingReceivables.length === 0 ? (
              <Empty>Nenhuma conta próxima.</Empty>
            ) : (
              data.alerts.upcomingReceivables.map((item) => (
                <Row
                  key={item.id}
                  title={item.description}
                  meta={`${formatDate(item.dueDate)} · ${formatCurrency(item.amount)}`}
                />
              ))
            )}
          </AlertCard>

          <AlertCard title="Contas atrasadas">
            {[...data.alerts.overdueReceivables, ...data.alerts.overduePayables]
              .length === 0 ? (
              <Empty>Nenhuma conta atrasada.</Empty>
            ) : (
              <>
                {data.alerts.overdueReceivables.map((item) => (
                  <Row
                    key={`r-${item.id}`}
                    title={item.description}
                    meta={`Receber · ${formatDate(item.dueDate)} · ${formatCurrency(item.amount)}`}
                  />
                ))}
                {data.alerts.overduePayables.map((item) => (
                  <Row
                    key={`p-${item.id}`}
                    title={item.description}
                    meta={`Pagar · ${formatDate(item.dueDate)} · ${formatCurrency(item.amount)}`}
                  />
                ))}
              </>
            )}
          </AlertCard>

          <AlertCard title="Clientes com pagamentos pendentes">
            {data.alerts.clientsWithPending.length === 0 ? (
              <Empty>Nenhum cliente com pendência.</Empty>
            ) : (
              data.alerts.clientsWithPending.map(({ client, total, count }) => (
                <Link
                  key={client.id}
                  href={`/admin/clientes/${client.id}`}
                  className="block rounded-xl px-3 py-2 transition hover:bg-white/[0.03]"
                >
                  <p className="text-sm font-medium">{client.name}</p>
                  <p className="text-xs text-muted">
                    {count} pendência(s) · {formatCurrency(total)}
                  </p>
                </Link>
              ))
            )}
          </AlertCard>

          <AlertCard title="Projetos próximos do prazo">
            {data.alerts.dueSoonProjects.length === 0 ? (
              <Empty>Nenhum projeto próximo do prazo.</Empty>
            ) : (
              data.alerts.dueSoonProjects.map((item) => (
                <Row
                  key={item.id}
                  title={item.name}
                  meta={`Prazo ${formatDate(item.dueDate)}`}
                />
              ))
            )}
          </AlertCard>
        </div>
      </section>
    </div>
  );
}

function AlertCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <h3 className="mb-3 text-sm font-medium">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="rounded-xl px-3 py-2">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted">{meta}</p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-3 py-2 text-sm text-muted">{children}</p>;
}
