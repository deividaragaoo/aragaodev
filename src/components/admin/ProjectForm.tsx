"use client";

import { useState } from "react";
import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/ui";
import { ClientSelect, type ClientOption } from "@/components/admin/ClientSelect";
import {
  PROJECT_PROGRESS_PRESETS,
  PROJECT_STATUSES,
  progressForStatus,
} from "@/lib/admin/constants";

type ProjectValues = {
  clientId?: number;
  name?: string | null;
  description?: string | null;
  value?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  status?: string | null;
  progress?: number | null;
  notes?: string | null;
};

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
  const [progress, setProgress] = useState(
    Math.min(100, Math.max(0, initial?.progress ?? progressForStatus(status)))
  );

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
        <AdminInput name="value" required defaultValue={initial?.value ?? 0} />
      </AdminField>
      <AdminField label="Status">
        <AdminSelect
          name="status"
          value={status}
          onChange={(e) => {
            const next = e.target.value;
            setStatus(next);
            setProgress(progressForStatus(next));
          }}
        >
          {PROJECT_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </AdminSelect>
      </AdminField>

      <AdminField label="Andamento do projeto" className="md:col-span-2">
        <input type="hidden" name="progress" value={progress} />
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-muted">Progresso atual</p>
            <p className="text-2xl font-semibold text-[#ff6b35]">{progress}%</p>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-[#ff6b35]"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {PROJECT_PROGRESS_PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setProgress(value)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  progress === value
                    ? "border-[#ff6b35]/50 bg-[#ff6b35]/15 text-foreground"
                    : "border-white/10 text-muted hover:border-white/20 hover:text-foreground"
                }`}
              >
                {value}%
              </button>
            ))}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ff7a18] to-[#ff3d00] transition-all"
              style={{ width: `${progress}%` }}
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
