import { AdminCard, PageHeader } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/admin/format";
import { listActivity } from "@/lib/admin/queries";

export default async function ActivityPage() {
  const activity = await listActivity();

  return (
    <>
      <PageHeader
        title="Historico"
        description="Registro de acoes administrativas e eventos do ERP."
      />
      <AdminCard>
        <div className="grid gap-3">
          {activity.map((item) => (
            <div
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
              key={item.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium text-white">{item.message}</p>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                  {item.entityType}:{item.action}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {formatDateTime(item.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </AdminCard>
    </>
  );
}
