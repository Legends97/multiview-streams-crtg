import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";

import { event } from "@/config/event";
import { race } from "@/config/race";
import { siteUrl } from "@/lib/env";
import { cn } from "@/lib/utils/cn";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

/** Beschriftung der Browser-Registerkarte, getrennt von der Ueberschrift. */
const browserTitle = event.browserTitle ?? event.title;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Alle Seiten tragen bewusst dieselbe Beschriftung in der Registerkarte.
  // Setzt eine Seite einen eigenen Titel, haengt sie die Beschriftung an.
  title: {
    default: browserTitle,
    template: `%s — ${browserTitle}`,
  },
  description: event.description,
  applicationName: event.title,
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteUrl,
    title: `${event.title} — ${race.team.name}`,
    description: event.description,
    siteName: event.title,
  },
  twitter: {
    card: "summary_large_image",
    title: `${event.title} — ${race.team.name}`,
    description: event.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#080a0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={cn(inter.variable, barlow.variable)}>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
