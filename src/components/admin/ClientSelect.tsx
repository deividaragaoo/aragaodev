"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminField, AdminSelect } from "@/components/admin/ui";

export type ClientOption = {
  id: number;
  name: string;
  company?: string | null;
  whatsapp?: string | null;
  address?: string | null;
};

export function ClientSelect({
  name = "clientId",
  initialClients = [],
  defaultValue,
  required = true,
  label = "Cliente",
  onChange,
}: {
  name?: string;
  initialClients?: ClientOption[];
  defaultValue?: string | number;
  required?: boolean;
  label?: string;
  onChange?: (clientId: string, client?: ClientOption) => void;
}) {
  const [clients, setClients] = useState<ClientOption[]>(initialClients);
  const [value, setValue] = useState(String(defaultValue || ""));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/admin/clients", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as { clients: ClientOption[] };
        if (!active) return;
        setClients(data.clients || []);
      } catch {
        // Keep initial list if the request fails.
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-2">
      <AdminField label={label}>
        <AdminSelect
          name={name}
          required={required}
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            setValue(next);
            onChange?.(
              next,
              clients.find((client) => String(client.id) === next)
            );
          }}
        >
          <option value="">
            {loading ? "Carregando clientes..." : "Selecione"}
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
              {client.company ? ` — ${client.company}` : ""}
            </option>
          ))}
        </AdminSelect>
      </AdminField>

      {!loading && clients.length === 0 ? (
        <p className="text-xs text-amber-400">
          Nenhum cliente cadastrado.{" "}
          <Link href="/admin/clientes/novo" className="underline">
            Cadastrar cliente
          </Link>
        </p>
      ) : null}
    </div>
  );
}
