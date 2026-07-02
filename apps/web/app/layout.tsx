import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "POLARIS",
    template: "%s · POLARIS",
  },
  description:
    "El agente de seguros autónomo. Prospecta, contacta y agenda citas 24/7 — los humanos solo cierran.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body>{children}</body>
    </html>
  );
}
