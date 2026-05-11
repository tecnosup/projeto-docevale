import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doce Vale — Admin",
  description: "Painel administrativo da Doce Vale Brownies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-neutral-950 text-neutral-100 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
