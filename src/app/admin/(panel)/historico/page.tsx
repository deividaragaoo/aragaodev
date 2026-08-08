import { EmptyState, PageHeader } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/admin/format";
import { listActivity } from "@/lib/admin/queries";

export default async function HistoricoPage() {
  const rows = await listActivity(150);

  return (
    <div>
      <PageHeader
        title="Histórico"
        description="Registro das principais ações do painel."
      />

      {rows.length === 0 ? (
        <EmptyState title="Nenhuma ação registrada ainda" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
          <div className="divide-y divide-white/[0.05]">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{row.action}</p>
                  {row.details ? (
                    <p className="text-xs text-muted">{row.details}</p>
                  ) : null}
                </div>
                <p className="font-mono text-[11px] text-muted">
                  {formatDateTime(row.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
