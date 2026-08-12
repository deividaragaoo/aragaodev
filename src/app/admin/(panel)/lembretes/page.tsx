import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminTextarea,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import {
  createReminderAction,
  deleteReminderAction,
  toggleReminderAction,
} from "@/lib/admin/actions/reminders";
import { formatDate, todayISO } from "@/lib/admin/format";
import { listReminders } from "@/lib/admin/queries";
import { cn } from "@/lib/utils";

export default async function LembretesPage() {
  const items = await listReminders();
  const today = todayISO();

  const pending = items.filter((item) => !item.done);
  const done = items.filter((item) => item.done);

  const todayPending = pending.filter(
    (item) => !item.dueDate || item.dueDate === today
  );
  const upcoming = pending.filter(
    (item) => item.dueDate && item.dueDate > today
  );
  const overdue = pending.filter(
    (item) => item.dueDate && item.dueDate < today
  );

  return (
    <div className="space-y-10">
      <PageHeader
        title="Lembretes"
        description="Diário do dia a dia — anote o que precisa fazer e marque quando concluir."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat label="Para hoje" value={String(todayPending.length)} />
        <MiniStat
          label="Atrasados"
          value={String(overdue.length)}
          tone={overdue.length > 0 ? "danger" : "default"}
        />
        <MiniStat
          label="Concluídos"
          value={String(done.length)}
          tone="success"
        />
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
        <h2 className="mb-4 text-lg font-medium">Novo lembrete</h2>
        <form
          action={createReminderAction}
          className="grid gap-3 md:grid-cols-2"
        >
          <AdminField label="O que fazer" className="md:col-span-2">
            <AdminInput
              name="title"
              required
              placeholder="Ex.: Ligar pro cliente, pagar hospedagem, revisar layout..."
            />
          </AdminField>
          <AdminField label="Data">
            <AdminInput name="dueDate" type="date" defaultValue={today} />
          </AdminField>
          <AdminField label="Notas (opcional)" className="md:col-span-2">
            <AdminTextarea
              name="notes"
              rows={3}
              placeholder="Detalhes, ideias, contexto do dia..."
            />
          </AdminField>
          <div className="flex items-end md:col-span-2">
            <AdminButton type="submit">Adicionar lembrete</AdminButton>
          </div>
        </form>
      </section>

      {items.length === 0 ? (
        <EmptyState
          title="Nenhum lembrete ainda"
          description="Use esta aba como um diário rápido do que precisa ser feito."
        />
      ) : (
        <div className="space-y-8">
          <ReminderGroup
            title="Atrasados"
            empty="Nada atrasado."
            items={overdue}
            tone="danger"
          />
          <ReminderGroup
            title="Hoje"
            empty="Nada para hoje. Adicione um lembrete acima."
            items={todayPending}
          />
          <ReminderGroup
            title="Próximos"
            empty="Sem lembretes futuros."
            items={upcoming}
          />
          <ReminderGroup
            title="Concluídos"
            empty="Nenhum concluído ainda."
            items={done}
            showDoneStyle
          />
        </div>
      )}
    </div>
  );
}

function ReminderGroup({
  title,
  empty,
  items,
  tone,
  showDoneStyle = false,
}: {
  title: string;
  empty: string;
  items: Awaited<ReturnType<typeof listReminders>>;
  tone?: "danger";
  showDoneStyle?: boolean;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-medium">{title}</h2>
        <span className="text-xs text-muted">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border border-white/[0.06] px-4 py-3 sm:flex-row sm:items-start sm:justify-between",
                showDoneStyle && "opacity-70"
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      showDoneStyle && "line-through text-muted"
                    )}
                  >
                    {item.title}
                  </p>
                  {tone === "danger" ? (
                    <StatusBadge label="Atrasado" tone="danger" />
                  ) : null}
                  {item.dueDate ? (
                    <span className="text-xs text-muted">
                      {formatDate(item.dueDate)}
                    </span>
                  ) : null}
                </div>
                {item.notes ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
                    {item.notes}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={toggleReminderAction.bind(null, item.id)}>
                  <AdminButton variant="secondary" type="submit">
                    {item.done ? "Reabrir" : "Concluir"}
                  </AdminButton>
                </form>
                <form action={deleteReminderAction.bind(null, item.id)}>
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
  );
}

function MiniStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
}) {
  const tones = {
    default: "text-foreground",
    success: "text-emerald-400",
    danger: "text-red-400",
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className={`mt-2 text-lg font-semibold ${tones[tone]}`}>{value}</p>
    </div>
  );
}
