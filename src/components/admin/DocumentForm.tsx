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
import { DOCUMENT_TYPES, PAYMENT_METHODS } from "@/lib/admin/constants";
import {
  FLEXIBLE_DATE_OPTIONS,
  formatCurrency,
  isFlexibleDateToken,
} from "@/lib/admin/format";

type Item = {
  name: string;
  description: string;
  quantity: string;
  unitPrice: string;
  discount: string;
};

type Installment = {
  dueDate: string;
  amount: string;
};

type DateMode = "date" | FlexibleMode;
type FlexibleMode = (typeof FLEXIBLE_DATE_OPTIONS)[number]["value"];

function resolveDateMode(value?: string | null): DateMode {
  if (isFlexibleDateToken(value)) return value;
  return "date";
}

function money(value: string) {
  const cleaned = value.replace(/R\$\s?/g, "").replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function DocumentForm({
  clients,
  action,
}: {
  clients: ClientOption[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [type, setType] = useState("orcamento");
  const [clientId, setClientId] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientOption | undefined>();
  const [items, setItems] = useState<Item[]>([
    { name: "", description: "", quantity: "1", unitPrice: "", discount: "0" },
  ]);
  const [trackPayments, setTrackPayments] = useState(false);
  const [amountPaid, setAmountPaid] = useState("0");
  const [downPayment, setDownPayment] = useState("0");
  const [installmentsCount, setInstallmentsCount] = useState("1");
  const [installments, setInstallments] = useState<Installment[]>([
    { dueDate: "definido_em_conversa", amount: "" },
  ]);
  const [deliveryMode, setDeliveryMode] = useState<DateMode>("definido_em_conversa");
  const [deliveryDeadline, setDeliveryDeadline] = useState("");
  const [preview, setPreview] = useState(false);

  const totals = useMemo(() => {
    const lines = items.map((item) => {
      const quantity = Number(item.quantity || 1);
      const unitPrice = money(item.unitPrice);
      const discount = money(item.discount);
      return Math.max(quantity * unitPrice - discount, 0);
    });
    const total = lines.reduce((sum, value) => sum + value, 0);
    return { total, lines };
  }, [items]);

  function recalcInstallments(count: number, entry: number, total: number) {
    const remaining = Math.max(total - entry, 0);
    const n = Math.max(count, 1);
    const base = n > 0 ? remaining / n : remaining;
    setInstallments(
      Array.from({ length: n }, (_, index) => ({
        dueDate: installments[index]?.dueDate || "definido_em_conversa",
        amount: base.toFixed(2),
      }))
    );
  }

  function DateModeField({
    label,
    name,
    mode,
    dateValue,
    onModeChange,
    onDateChange,
  }: {
    label: string;
    name: string;
    mode: DateMode;
    dateValue: string;
    onModeChange: (mode: DateMode) => void;
    onDateChange: (value: string) => void;
  }) {
    const storedValue =
      mode === "date" ? dateValue : mode;

    return (
      <AdminField label={label}>
        <input type="hidden" name={name} value={storedValue} />
        <div className="space-y-2">
          <AdminSelect
            value={mode}
            onChange={(e) => onModeChange(e.target.value as DateMode)}
          >
            <option value="date">Data específica</option>
            {FLEXIBLE_DATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AdminSelect>
          {mode === "date" ? (
            <AdminInput
              type="date"
              value={dateValue}
              onChange={(e) => onDateChange(e.target.value)}
            />
          ) : (
            <p className="text-xs text-muted">
              Será salvo como “
              {
                FLEXIBLE_DATE_OPTIONS.find((item) => item.value === mode)
                  ?.label
              }
              ”.
            </p>
          )}
        </div>
      </AdminField>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="type" value={type} />

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-medium">Tipo de documento</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DOCUMENT_TYPES.map((docType) => (
            <button
              key={docType.value}
              type="button"
              onClick={() => setType(docType.value)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                type === docType.value
                  ? "border-[#ff6b35]/50 bg-[#ff6b35]/10"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {docType.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-medium">Cliente</h2>
        <ClientSelect
          initialClients={clients}
          defaultValue={clientId}
          onChange={(nextId, client) => {
            setClientId(nextId);
            setSelectedClient(client);
          }}
        />
        {selectedClient ? (
          <div className="mt-4 grid gap-2 rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm text-muted sm:grid-cols-2">
            <p>Nome: {selectedClient.name}</p>
            <p>Empresa: {selectedClient.company || "—"}</p>
            <p>WhatsApp: {selectedClient.whatsapp || "—"}</p>
            <p>Endereço: {selectedClient.address || "—"}</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Serviços</h2>
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() =>
              setItems((prev) => [
                ...prev,
                {
                  name: "",
                  description: "",
                  quantity: "1",
                  unitPrice: "",
                  discount: "0",
                },
              ])
            }
          >
            + Item
          </AdminButton>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border border-white/[0.06] p-3 md:grid-cols-5"
            >
              <AdminField label="Nome" className="md:col-span-2">
                <AdminInput
                  name="itemName"
                  required
                  value={item.name}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((row, i) =>
                        i === index ? { ...row, name: e.target.value } : row
                      )
                    )
                  }
                />
              </AdminField>
              <AdminField label="Qtd">
                <AdminInput
                  name="itemQuantity"
                  value={item.quantity}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((row, i) =>
                        i === index ? { ...row, quantity: e.target.value } : row
                      )
                    )
                  }
                />
              </AdminField>
              <AdminField label="Valor">
                <AdminInput
                  name="itemUnitPrice"
                  value={item.unitPrice}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((row, i) =>
                        i === index ? { ...row, unitPrice: e.target.value } : row
                      )
                    )
                  }
                />
              </AdminField>
              <AdminField label="Desconto">
                <AdminInput
                  name="itemDiscount"
                  value={item.discount}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((row, i) =>
                        i === index ? { ...row, discount: e.target.value } : row
                      )
                    )
                  }
                />
              </AdminField>
              <AdminField label="Descrição" className="md:col-span-5">
                <AdminInput
                  name="itemDescription"
                  value={item.description}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((row, i) =>
                        i === index
                          ? { ...row, description: e.target.value }
                          : row
                      )
                    )
                  }
                />
              </AdminField>
              <p className="text-sm text-muted md:col-span-5">
                Total do item: {formatCurrency(totals.lines[index] || 0)}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-right text-lg font-semibold">
          Total: {formatCurrency(totals.total)}
        </p>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6">
        <h2 className="mb-2 text-lg font-medium">Pagamento</h2>
        <label className="mb-4 flex cursor-pointer items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={trackPayments}
            onChange={(e) => setTrackPayments(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#ff6b35]"
          />
          <span>
            Acompanhar valores pagos neste documento
            <span className="mt-0.5 block text-xs">
              Marque só se quiser ver quanto já pagou e quanto ainda deve.
            </span>
          </span>
        </label>
        <input
          type="hidden"
          name="trackPayments"
          value={trackPayments ? "1" : "0"}
        />

        {trackPayments ? (
          <>
            <div className="mb-4 grid gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-4 sm:grid-cols-3">
              <AdminField label="Valor já pago">
                <AdminInput
                  name="amountPaid"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </AdminField>
              <AdminField label="Ainda deve">
                <AdminInput
                  readOnly
                  value={Math.max(
                    0,
                    totals.total - money(amountPaid)
                  ).toFixed(2)}
                />
              </AdminField>
              <AdminField label="Total do documento">
                <AdminInput readOnly value={totals.total.toFixed(2)} />
              </AdminField>
              <div className="sm:col-span-3">
                <div className="mb-2 flex justify-between text-xs text-muted">
                  <span>
                    {formatCurrency(money(amountPaid))} de{" "}
                    {formatCurrency(totals.total)}
                  </span>
                  <span>
                    {totals.total > 0
                      ? Math.min(
                          100,
                          Math.round((money(amountPaid) / totals.total) * 100)
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#ff7a18] to-[#ff3d00]"
                    style={{
                      width: `${
                        totals.total > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (money(amountPaid) / totals.total) * 100
                              )
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <AdminField label="Forma de pagamento">
                <AdminSelect name="paymentMethod">
                  <option value="">Selecione</option>
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </AdminSelect>
              </AdminField>
              <AdminField label="Entrada">
                <AdminInput
                  name="downPayment"
                  value={downPayment}
                  onChange={(e) => {
                    setDownPayment(e.target.value);
                    recalcInstallments(
                      Number(installmentsCount || 1),
                      money(e.target.value),
                      totals.total
                    );
                  }}
                />
              </AdminField>
              <AdminField label="Qtd. parcelas">
                <AdminInput
                  name="installmentsCount"
                  value={installmentsCount}
                  onChange={(e) => {
                    setInstallmentsCount(e.target.value);
                    recalcInstallments(
                      Number(e.target.value || 1),
                      money(downPayment),
                      totals.total
                    );
                  }}
                />
              </AdminField>
            </div>

            <div className="mt-4 space-y-3">
              {installments.map((installment, index) => {
                const mode = resolveDateMode(installment.dueDate);
                const dateValue = isFlexibleDateToken(installment.dueDate)
                  ? ""
                  : installment.dueDate;

                return (
                  <div key={index} className="grid gap-3 md:grid-cols-2">
                    <DateModeField
                      label={`Vencimento parcela ${index + 1}`}
                      name="installmentDueDate"
                      mode={mode}
                      dateValue={dateValue}
                      onModeChange={(nextMode) =>
                        setInstallments((prev) =>
                          prev.map((row, i) =>
                            i === index
                              ? {
                                  ...row,
                                  dueDate:
                                    nextMode === "date"
                                      ? dateValue || ""
                                      : nextMode,
                                }
                              : row
                          )
                        )
                      }
                      onDateChange={(value) =>
                        setInstallments((prev) =>
                          prev.map((row, i) =>
                            i === index ? { ...row, dueDate: value } : row
                          )
                        )
                      }
                    />
                    <AdminField label={`Valor parcela ${index + 1}`}>
                      <AdminInput
                        name="installmentAmount"
                        value={installment.amount}
                        onChange={(e) =>
                          setInstallments((prev) =>
                            prev.map((row, i) =>
                              i === index
                                ? { ...row, amount: e.target.value }
                                : row
                            )
                          )
                        }
                      />
                    </AdminField>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <input type="hidden" name="amountPaid" value="0" />
            <input type="hidden" name="downPayment" value="0" />
            <input type="hidden" name="installmentsCount" value="1" />
            <p className="text-sm text-muted">
              Sem acompanhamento financeiro neste documento.
            </p>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-medium">Condições</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Data de emissão">
            <AdminInput
              name="issueDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </AdminField>
          <AdminField label="Validade do orçamento">
            <AdminInput name="validUntil" type="date" />
          </AdminField>
          <DateModeField
            label="Prazo de entrega"
            name="deliveryDeadline"
            mode={deliveryMode}
            dateValue={deliveryDeadline}
            onModeChange={(mode) => {
              setDeliveryMode(mode);
              if (mode !== "date") setDeliveryDeadline("");
            }}
            onDateChange={(value) => {
              setDeliveryDeadline(value);
              setDeliveryMode("date");
            }}
          />
          <AdminField label="Garantia">
            <AdminInput name="warranty" placeholder="90 dias" />
          </AdminField>
          <AdminField label="Observações" className="md:col-span-2">
            <AdminTextarea name="notes" />
          </AdminField>
          <AdminField label="Condições adicionais" className="md:col-span-2">
            <AdminTextarea name="conditions" />
          </AdminField>
        </div>
      </section>

      {preview ? (
        <section className="rounded-2xl border border-[#ff6b35]/30 bg-[#ff6b35]/5 p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-medium">Pré-visualização</h2>
          <p className="text-sm text-muted">
            {DOCUMENT_TYPES.find((t) => t.value === type)?.label} para{" "}
            {selectedClient?.name || "cliente"}
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {items
              .filter((item) => item.name)
              .map((item, index) => (
                <li key={index}>
                  {item.name} — {formatCurrency(totals.lines[index] || 0)}
                </li>
              ))}
          </ul>
          <p className="mt-4 font-semibold">Total: {formatCurrency(totals.total)}</p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <AdminButton type="button" variant="secondary" onClick={() => setPreview(true)}>
          Pré-visualizar
        </AdminButton>
        <AdminButton type="submit">Salvar documento</AdminButton>
      </div>
    </form>
  );
}
