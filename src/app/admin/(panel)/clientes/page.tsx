import Link from "next/link";
import {
  AdminButton,
  AdminCard,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/admin/ui";
import { CLIENT_STATUS_LABEL } from "@/lib/admin/constants";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import { listClients } from "@/lib/admin/queries";

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Cadastro, status, historico e saldos pendentes por cliente."
        action={<AdminButton href="/admin/clientes/novo">Novo cliente</AdminButton>}
      />
      <AdminCard>
        {clients.length === 0 ? (
          <EmptyState>Nenhum cliente cadastrado.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                <tr>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Contato</th>
                  <th className="pb-3">Projetos</th>
                  <th className="pb-3">Pendente</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Criado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="py-4">
                      <Link
                        className="font-semibold text-white hover:text-orange-200"
                        href={`/admin/clientes/${client.id}`}
                      >
                        {client.name}
                      </Link>
                      <p className="text-xs text-zinc-500">{client.company}</p>
                    </td>
                    <td className="py-4 text-zinc-300">
                      {client.email}
                      <p className="text-xs text-zinc-500">{client.phone}</p>
                    </td>
                    <td className="py-4 text-zinc-300">{client.projectCount}</td>
                    <td className="py-4 text-orange-200">
                      {formatCurrency(client.pendingCents)}
                    </td>
                    <td className="py-4">
                      <StatusBadge
                        status={client.status}
                        label={CLIENT_STATUS_LABEL[client.status]}
                      />
                    </td>
                    <td className="py-4 text-zinc-400">
                      {formatDate(client.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </>
  );
}
