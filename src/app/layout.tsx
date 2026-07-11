import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const SITE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kopi Sriwijaya — UMKM Kopi Sumatera Selatan",
    template: "%s — Kopi Sriwijaya",
  },
  description:
    "Platform yang menghubungkan UMKM Kopi di Sumatera Selatan dengan pembeli di seluruh Indonesia. Peta interaktif, edukasi kopi, dan pemesanan via WhatsApp.",
  keywords: [
    "kopi", "kopi sumsel", "UMKM kopi", "kopi sumatera selatan",
    "kopi pagaralam", "kopi lahat", "kopi semendo", "kopi empat lawang",
    "robusta", "arabika", "Dinas UKM",
  ],
  openGraph: {
    siteName: "Kopi Sriwijaya",
    locale: "id_ID",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-coffee-200 bg-coffee-100 py-6 text-center text-sm text-coffee-700">
            © {new Date().getFullYear()} Dinas Operasi UKM Sumatera Selatan — Platform UMKM Kopi
          </footer>
        </Providers>
      </body>
    </html>
  );
}
