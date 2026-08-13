import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { htmlLang, parseLocale, parseTheme } from "@/lib/i18n";
import { PREFERENCE_SCRIPT } from "@/lib/preferences-script";
import { JsonLd } from "./json-ld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Aragão Dev | Software House Premium",
    template: "%s | Aragão Dev",
  },
  description:
    "Software house premium especializada em desenvolvimento web, apps mobile e design UI/UX. Transformamos ideias em produtos digitais de alto impacto.",
  keywords: [
    "desenvolvimento web",
    "software house",
    "Next.js",
    "React",
    "UI/UX",
    "apps mobile",
    "SaaS",
    "e-commerce",
    "Aragão Dev",
  ],
  authors: [{ name: "Aragão Dev" }],
  creator: "Aragão Dev",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://aragaodev.com",
    siteName: "Aragão Dev",
    title: "Aragão Dev | Software House Premium",
    description:
      "Design de classe mundial, engenharia de excelência e resultados mensuráveis. Transformamos sua visão em experiências digitais premium.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aragão Dev | Software House Premium",
    description:
      "Design de classe mundial, engenharia de excelência e resultados mensuráveis.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ee" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const locale = parseLocale(jar.get("aragao-lang")?.value);
  const theme = parseTheme(jar.get("aragao-theme")?.value);

  return (
    <html
      lang={htmlLang(locale)}
      data-theme={theme}
      data-locale={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFERENCE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
