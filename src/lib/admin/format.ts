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

/** Valor inicial/exibição em inputs monetários (vírgula pt-BR). */
export function formatMoneyInput(value: number) {
  if (!Number.isFinite(value)) return "0";
  const fixed = Math.round(value * 100) / 100;
  return fixed.toLocaleString("pt-BR", {
    minimumFractionDigits: Number.isInteger(fixed) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** Mantém só dígitos e no máximo um separador decimal (, ou .). */
export function sanitizeMoneyInput(value: string) {
  const cleaned = value.replace(/[^\d.,]/g, "");
  const comma = cleaned.indexOf(",");
  const dot = cleaned.indexOf(".");
  if (comma === -1 && dot === -1) return cleaned;

  const sepIndex = comma === -1 ? dot : dot === -1 ? comma : Math.min(comma, dot);
  const sep = cleaned[sepIndex];
  const intPart = cleaned.slice(0, sepIndex).replace(/[.,]/g, "");
  const fracPart = cleaned
    .slice(sepIndex + 1)
    .replace(/[.,]/g, "")
    .slice(0, 2);
  return `${intPart}${sep}${fracPart}`;
}
