import { contact } from "@/lib/data";

export function buildQuoteWhatsAppUrl(name: string, locale: "pt" | "en" = "pt") {
  const trimmed = name.trim();
  const message =
    locale === "en"
      ? `Hi, my name is ${trimmed} and I'd like a quote for a custom project for my company.`
      : `Olá me chamo ${trimmed} e queria orçamentar um projeto personalizado para minha empresa`;
  return `${contact.whatsapp.url}?text=${encodeURIComponent(message)}`;
}
