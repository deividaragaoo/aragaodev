"use client";

import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminTextarea,
} from "@/components/admin/ui";

type ClientValues = {
  name?: string | null;
  company?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  notes?: string | null;
};

export function ClientForm({
  action,
  initial,
  submitLabel = "Salvar cliente",
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: ClientValues;
  submitLabel?: string;
}) {
  return (
    <form
      action={action}
      className="grid gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6 md:grid-cols-2"
    >
      <AdminField label="Nome">
        <AdminInput name="name" required defaultValue={initial?.name || ""} />
      </AdminField>
      <AdminField label="Empresa">
        <AdminInput name="company" defaultValue={initial?.company || ""} />
      </AdminField>
      <AdminField label="WhatsApp">
        <AdminInput name="whatsapp" defaultValue={initial?.whatsapp || ""} />
      </AdminField>
      <AdminField label="Endereço">
        <AdminInput name="address" defaultValue={initial?.address || ""} />
      </AdminField>
      <AdminField label="Observações" className="md:col-span-2">
        <AdminTextarea name="notes" defaultValue={initial?.notes || ""} />
      </AdminField>
      <div className="md:col-span-2">
        <AdminButton type="submit">{submitLabel}</AdminButton>
      </div>
    </form>
  );
}
