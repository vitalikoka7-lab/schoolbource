import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScholarPass - Votre Portail de Bourses",
  description: "Plateforme de gestion des bourses et candidatures universitaires",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
