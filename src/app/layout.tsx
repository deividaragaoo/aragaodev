import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
