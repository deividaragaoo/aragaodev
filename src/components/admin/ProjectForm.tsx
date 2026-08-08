"use client";

import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/ui";
import { PROJECT_STATUSES } from "@/lib/admin/constants";

type ClientOption = { id: number; name: string; company?: string | null };

type ProjectValues = {
  clientId?: number;
  name?: string | null;
  description?: string | null;
  value?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  status?: string | null;
  notes?: string | null;
};

export function ProjectForm({
  action,
  clients,
  initial,
}: {
  action: (formData: FormData) => Promise<void>;
  clients: ClientOption[];
  initial?: ProjectValues;
}) {
  return (
    <form
      action={action}
      className="grid gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6 md:grid-cols-2"
    >
      <AdminField label="Cliente">
        <AdminSelect
          name="clientId"
          required
          defaultValue={initial?.clientId || ""}
        >
          <option value="">Selecione</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
              {client.company ? ` — ${client.company}` : ""}
            </option>
          ))}
        </AdminSelect>
      </AdminField>
      <AdminField label="Nome">
        <AdminInput name="name" required defaultValue={initial?.name || ""} />
      </AdminField>
      <AdminField label="Valor">
        <AdminInput
          name="value"
          required
          defaultValue={initial?.value ?? 0}
        />
      </AdminField>
      <AdminField label="Status">
        <AdminSelect name="status" defaultValue={initial?.status || "orcamento"}>
          {PROJECT_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </AdminSelect>
      </AdminField>
      <AdminField label="Data de início">
        <AdminInput
          name="startDate"
          type="date"
          defaultValue={initial?.startDate || ""}
        />
      </AdminField>
      <AdminField label="Prazo">
        <AdminInput
          name="dueDate"
          type="date"
          defaultValue={initial?.dueDate || ""}
        />
      </AdminField>
      <AdminField label="Descrição" className="md:col-span-2">
        <AdminTextarea
          name="description"
          defaultValue={initial?.description || ""}
        />
      </AdminField>
      <AdminField label="Observações" className="md:col-span-2">
        <AdminTextarea name="notes" defaultValue={initial?.notes || ""} />
      </AdminField>
      <div className="md:col-span-2">
        <AdminButton type="submit">Salvar projeto</AdminButton>
      </div>
    </form>
  );
}
