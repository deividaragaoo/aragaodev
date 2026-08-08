"use client";

import { useMemo, useState } from "react";
import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/ui";
import { ClientSelect, type ClientOption } from "@/components/admin/ClientSelect";
import { PROJECT_STATUSES } from "@/lib/admin/constants";
import { formatCurrency, parseMoney } from "@/lib/admin/format";

type ProjectValues = {
  clientId?: number;
  name?: string | null;
  description?: string | null;
  value?: number | null;
  amountPaid?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  status?: string | null;
  notes?: string | null;
};

function clampMoney(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100) / 100;
}

export function ProjectForm({
  action,
  clients,
  initial,
  preselectedClientId,
}: {
  action: (formData: FormData) => Promise<void>;
  clients: ClientOption[];
  initial?: ProjectValues;
  preselectedClientId?: number;
}) {
  const [status, setStatus] = useState(initial?.status || "orcamento");
  const [projectValue, setProjectValue] = useState(
    clampMoney(Number(initial?.value ?? 0))
  );
  const [amountPaid, setAmountPaid] = useState(
    clampMoney(Number(initial?.amountPaid ?? 0))
  );

  const remaining = useMemo(
    () => clampMoney(Math.max(0, projectValue - amountPaid)),
    [projectValue, amountPaid]
  );

  const percent = useMemo(() => {
    if (projectValue <= 0) return amountPaid > 0 ? 100 : 0;
    return Math.min(100, Math.round((amountPaid / projectValue) * 100));
  }, [amountPaid, projectValue]);

  return (
    <form
      action={action}
      className="grid gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6 md:grid-cols-2"
    >
      <div className="md:col-span-1">
        <ClientSelect
          initialClients={clients}
          defaultValue={initial?.clientId || preselectedClientId || ""}
        />
      </div>
      <AdminField label="Nome">
        <AdminInput name="name" required defaultValue={initial?.name || ""} />
      </AdminField>
      <AdminField label="Valor">
        <AdminInput
          name="value"
          required
          value={String(projectValue)}
          onChange={(e) => {
            const next = clampMoney(parseMoney(e.target.value || "0"));
            setProjectValue(next);
            if (amountPaid > next) setAmountPaid(next);
          }}
        />
      </AdminField>
      <AdminField label="Status">
        <AdminSelect
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {PROJECT_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </AdminSelect>
      </AdminField>

      <AdminField label="Pagamento do projeto" className="md:col-span-2">
        <input type="hidden" name="amountPaid" value={amountPaid} />
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label="Valor já pago">
              <AdminInput
                inputMode="decimal"
                value={String(amountPaid)}
                onChange={(e) => {
                  const next = clampMoney(parseMoney(e.target.value || "0"));
                  setAmountPaid(Math.min(next, projectValue || next));
                }}
              />
            </AdminField>
            <AdminField label="Valor que falta pagar">
              <AdminInput
                inputMode="decimal"
                value={String(remaining)}
                onChange={(e) => {
                  const nextRemaining = clampMoney(
                    parseMoney(e.target.value || "0")
                  );
                  const nextPaid = clampMoney(
                    Math.max(0, projectValue - nextRemaining)
                  );
                  setAmountPaid(nextPaid);
                }}
              />
            </AdminField>
          </div>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Progresso financeiro</p>
              <p className="mt-1 text-xs text-muted">
                {formatCurrency(amountPaid)} de {formatCurrency(projectValue)}
              </p>
            </div>
            <p className="text-2xl font-semibold text-[#ff6b35]">{percent}%</p>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ff7a18] to-[#ff3d00] transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
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
