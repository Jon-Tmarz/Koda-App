import type { Metadata } from "next";
import { Kanit, Montserrat } from "next/font/google";
import "./globals.css";
import Favicon from "./icon.webp";

const fontKanit = Kanit({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-kanit",
});

const fontMontserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Koda - Sistema de Gestión Comercial",
  description: "Gestión de servicios profesionales y talento humano en Colombia.",
  icons: {
    icon: Favicon.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${fontKanit.variable} ${fontMontserrat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}