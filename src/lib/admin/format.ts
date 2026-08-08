import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  try {
    return format(parseISO(value), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return value;
  }
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  try {
    return format(parseISO(value), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR });
  } catch {
    return value;
  }
}

export function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function parseMoneyToCents(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return 0;
  }

  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const amount = Number.parseFloat(normalized);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round(amount * 100);
}

export function centsToInput(cents?: number | null) {
  return ((cents ?? 0) / 100).toFixed(2);
}

export function todayDateInput() {
  return new Date().toISOString().slice(0, 10);
}
