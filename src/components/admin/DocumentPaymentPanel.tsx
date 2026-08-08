"use client";

import { useMemo, useState } from "react";
import { updateDocumentPaymentAction } from "@/lib/admin/actions/documents";
import {
  formatCurrency,
  formatMoneyInput,
  parseMoney,
  sanitizeMoneyInput,
} from "@/lib/admin/format";
import { AdminButton, AdminField, AdminInput } from "@/components/admin/ui";

function clampMoney(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100) / 100;
}

export function DocumentPaymentPanel({
  documentId,
  total,
  trackPayments,
  amountPaid,
}: {
  documentId: number;
  total: number;
  trackPayments: number;
  amountPaid: number;
}) {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(trackPayments === 1);
  const [paidText, setPaidText] = useState(
    formatMoneyInput(clampMoney(amountPaid || 0))
  );

  const paid = useMemo(() => {
    const next = clampMoney(parseMoney(paidText || "0"));
    return Math.min(total || next, next);
  }, [paidText, total]);

  const remaining = useMemo(
    () => clampMoney(Math.max(0, total - paid)),
    [total, paid]
  );
  const percent = useMemo(() => {
    if (total <= 0) return paid > 0 ? 100 : 0;
    return Math.min(100, Math.round((paid / total) * 100));
  }, [paid, total]);

  const action = updateDocumentPaymentAction.bind(null, documentId);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Situação financeira</p>
          <p className="text-xs text-muted">
            {enabled
              ? "Acompanhamento ativo neste documento"
              : "Opcional — só aparece se você marcar"}
          </p>
        </div>
        <AdminButton
          type="button"
          variant="secondary"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Fechar" : enabled ? "Ver / editar" : "Ativar acompanhamento"}
        </AdminButton>
      </div>

      {!open && enabled ? (
        <p className="mt-3 text-sm text-muted">
          Já pago {formatCurrency(paid)} · Falta {formatCurrency(remaining)}
        </p>
      ) : null}

      {open ? (
        <form action={action} className="mt-4 space-y-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 accent-[#ff6b35]"
            />
            Acompanhar quanto este cliente já pagou / ainda deve
          </label>
          <input
            type="hidden"
            name="trackPayments"
            value={enabled ? "1" : "0"}
          />

          {enabled ? (
            <>
              <input type="hidden" name="amountPaid" value={paid} />
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminField label="Valor já pago">
                  <AdminInput
                    inputMode="decimal"
                    placeholder="0,00"
                    value={paidText}
                    onChange={(e) =>
                      setPaidText(sanitizeMoneyInput(e.target.value))
                    }
                  />
                </AdminField>
                <AdminField label="Ainda deve">
                  <AdminInput
                    readOnly
                    value={formatMoneyInput(remaining)}
                  />
                </AdminField>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {formatCurrency(paid)} de {formatCurrency(total)}
                  </span>
                  <span className="font-semibold text-[#ff6b35]">{percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#ff7a18] to-[#ff3d00]"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <input type="hidden" name="amountPaid" value="0" />
          )}

          <AdminButton type="submit">Salvar situação</AdminButton>
        </form>
      ) : null}
    </div>
  );
}
