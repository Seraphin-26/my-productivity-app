// app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProductivityAI – Gérez vos tâches avec l'IA",
  description: "Application de productivité fullstack avec analyse IA de vos notes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="fr" className="dark">
        <body className="min-h-screen bg-[#09090e] text-slate-100">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
