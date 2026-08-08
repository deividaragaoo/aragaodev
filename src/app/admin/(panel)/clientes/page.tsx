import Link from "next/link";
import {
  AdminButton,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import { listClients } from "@/lib/admin/queries";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const rows = await listClients(q);

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastro único para orçamentos, projetos e financeiro."
        actions={
          <Link href="/admin/clientes/novo">
            <AdminButton>+ Novo cliente</AdminButton>
          </Link>
        }
      />

      <form className="mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Pesquisar por nome, empresa, documento..."
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-[#ff6b35]/50"
        />
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title="Nenhum cliente cadastrado"
          description="Comece cadastrando o primeiro cliente da Aragão Dev."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[11px] font-mono uppercase tracking-[0.14em] text-muted md:grid">
            <span>Nome</span>
            <span>Empresa</span>
            <span>WhatsApp</span>
            <span>E-mail</span>
            <span />
          </div>
          <div className="divide-y divide-white/[0.05]">
            {rows.map((client) => (
              <Link
                key={client.id}
                href={`/admin/clientes/${client.id}`}
                className="grid gap-1 px-4 py-3 transition hover:bg-white/[0.02] md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-center md:gap-3"
              >
                <div>
                  <p className="text-sm font-medium">{client.name}</p>
                  <p className="text-xs text-muted md:hidden">
                    {[client.company, client.whatsapp].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <p className="hidden text-sm text-muted md:block">
                  {client.company || "—"}
                </p>
                <p className="hidden text-sm text-muted md:block">
                  {client.whatsapp || "—"}
                </p>
                <p className="hidden text-sm text-muted md:block">
                  {client.email || "—"}
                </p>
                <StatusBadge label="Ver" tone="info" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
