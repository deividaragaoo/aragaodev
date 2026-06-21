import { contact } from "@/lib/data";

export function buildQuoteWhatsAppUrl(name: string) {
  const trimmed = name.trim();
  const message = `Olá me chamo ${trimmed} e queria orçamentar um projeto personalizado para minha empresa`;
  return `${contact.whatsapp.url}?text=${encodeURIComponent(message)}`;
}
