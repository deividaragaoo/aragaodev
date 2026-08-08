import Link from "next/link";
import { AdminCard, PageHeader } from "@/components/admin/ui";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/admin/format";
import { getDashboardData } from "@/lib/admin/queries";

export default async function AdminDashboardPage() {
  const data = await getDashboardData();
  const cards = [
    ["Clientes ativos", data.stats.activeClients],
    ["Projetos ativos", data.stats.activeProjects],
    ["Projetos concluidos", data.stats.completedProjects],
    ["Documentos em rascunho", data.stats.draftDocuments],
  ] as const;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visao geral de projetos, financeiro, documentos pendentes e alertas operacionais."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <AdminCard key={label}>
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          </AdminCard>
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <AdminCard>
          <p className="text-sm text-zinc-400">Recebido</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-200">
            {formatCurrency(data.stats.revenueCents)}
          </p>
        </AdminCard>
        <AdminCard>
          <p className="text-sm text-zinc-400">A receber</p>
          <p className="mt-3 text-2xl font-semibold text-orange-200">
            {formatCurrency(data.stats.pendingReceivablesCents)}
          </p>
        </AdminCard>
        <AdminCard>
          <p className="text-sm text-zinc-400">A pagar</p>
          <p className="mt-3 text-2xl font-semibold text-red-200">
            {formatCurrency(data.stats.pendingPayablesCents)}
          </p>
        </AdminCard>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <h2 className="mb-4 text-xl font-semibold text-white">Alertas</h2>
          <div className="grid gap-3 text-sm">
            {data.alerts.overdueReceivables.map((item) => (
              <Link
                className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-red-100"
                href="/admin/financeiro"
                key={`r-${item.id}`}
              >
                Recebivel vencido: {item.description} em{" "}
                {formatDate(item.dueDate)} ({formatCurrency(item.amountCents)})
              </Link>
            ))}
            {data.alerts.overduePayables.map((item) => (
              <Link
                className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-red-100"
                href="/admin/financeiro"
                key={`p-${item.id}`}
              >
                Conta vencida: {item.description} em {formatDate(item.dueDate)} (
                {formatCurrency(item.amountCents)})
              </Link>
            ))}
            {data.alerts.documentsWaitingApproval.slice(0, 5).map((doc) => (
              <Link
                className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-3 text-orange-100"
                href={`/admin/documentos/${doc.id}`}
                key={`d-${doc.id}`}
              >
                Documento aguardando aprovacao: {doc.number}
              </Link>
            ))}
            {data.alerts.overdueReceivables.length === 0 &&
            data.alerts.overduePayables.length === 0 &&
            data.alerts.documentsWaitingApproval.length === 0 ? (
              <p className="rounded-2xl border border-white/10 p-4 text-zinc-400">
                Nenhum alerta critico no momento.
              </p>
            ) : null}
          </div>
        </AdminCard>
        <AdminCard>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Atividade recente
          </h2>
          <div className="grid gap-3">
            {data.recentActivity.map((activity) => (
              <div
                className="rounded-2xl border border-white/10 bg-black/20 p-3"
                key={activity.id}
              >
                <p className="text-sm text-white">{activity.message}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {formatDateTime(activity.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </>
  );
}
