import {
  archiveClientAction,
  createClientAction,
  updateClientAction,
} from "@/lib/admin/actions/clients";
import type { Client } from "@/lib/db/schema";
import { AdminButton, AdminCard, Field, SelectField, TextArea } from "./ui";

export function ClientForm({ client }: { client?: Client }) {
  const action = client ? updateClientAction : createClientAction;

  return (
    <AdminCard>
      <form action={action} className="grid gap-5">
        {client ? <input name="id" type="hidden" value={client.id} /> : null}
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Nome"
            name="name"
            defaultValue={client?.name}
            required
          />
          <Field label="Empresa" name="company" defaultValue={client?.company} />
          <Field
            label="Email"
            name="email"
            type="email"
            defaultValue={client?.email}
            required
          />
          <Field
            label="Telefone"
            name="phone"
            defaultValue={client?.phone}
            required
          />
          <Field
            label="CPF/CNPJ"
            name="documentNumber"
            defaultValue={client?.documentNumber}
          />
          <SelectField
            label="Status"
            name="status"
            defaultValue={client?.status ?? "active"}
          >
            <option value="active">Ativo</option>
            <option value="archived">Arquivado</option>
          </SelectField>
        </div>
        <Field label="Endereco" name="address" defaultValue={client?.address} />
        <TextArea label="Observacoes" name="notes" defaultValue={client?.notes} />
        <div className="flex flex-wrap gap-3">
          <AdminButton>{client ? "Salvar cliente" : "Criar cliente"}</AdminButton>
          <AdminButton href="/admin/clientes" variant="secondary">
            Voltar
          </AdminButton>
        </div>
      </form>
      {client && client.status !== "archived" ? (
        <form action={archiveClientAction} className="mt-4">
          <input name="id" type="hidden" value={client.id} />
          <AdminButton variant="danger">Arquivar cliente</AdminButton>
        </form>
      ) : null}
    </AdminCard>
  );
}
