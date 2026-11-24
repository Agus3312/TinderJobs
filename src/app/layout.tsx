import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { clinica } from "@/config/clinica";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${clinica.nombre} · Recepción con IA por WhatsApp`,
  description:
    "Demo: una recepcionista con IA que responde consultas, informa precios y agenda turnos por WhatsApp para clínicas odontológicas y estéticas.",
};

export const viewport: Viewport = {
  themeColor: clinica.colorPrimario,
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
