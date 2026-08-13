import { cookies } from "next/headers";
import { HomeContent } from "@/components/HomeContent";
import { parseLocale, parseTheme } from "@/lib/i18n";

export default async function Home() {
  const jar = await cookies();
  const locale = parseLocale(jar.get("aragao-lang")?.value);
  const theme = parseTheme(jar.get("aragao-theme")?.value);

  return <HomeContent initialLocale={locale} initialTheme={theme} />;
}
