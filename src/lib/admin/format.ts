export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export const FLEXIBLE_DATE_OPTIONS = [
  { value: "sem_prazo", label: "Sem prazo" },
  { value: "definido_em_conversa", label: "Definido em conversa" },
] as const;

export type FlexibleDateToken =
  (typeof FLEXIBLE_DATE_OPTIONS)[number]["value"];

export function isFlexibleDateToken(
  value?: string | null
): value is FlexibleDateToken {
  return (
    value === "sem_prazo" || value === "definido_em_conversa"
  );
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  if (isFlexibleDateToken(value)) {
    return (
      FLEXIBLE_DATE_OPTIONS.find((item) => item.value === value)?.label || value
    );
  }
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized.endsWith("Z") ? normalized : `${normalized}Z`);
  if (Number.isNaN(date.getTime())) {
    const fallback = new Date(value);
    if (Number.isNaN(fallback.getTime())) return value;
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(fallback);
  }
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isOverdue(dueDate: string, status: string) {
  if (status === "pago" || status === "cancelado") return false;
  if (!dueDate || isFlexibleDateToken(dueDate)) return false;
  return dueDate < todayISO();
}

export function parseMoney(value: string | number) {
  if (typeof value === "number") return value;
  const cleaned = value
    .replace(/R\$\s?/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}
