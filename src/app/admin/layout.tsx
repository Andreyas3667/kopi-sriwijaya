import { Sidebar } from "@/components/Sidebar";

const items = [
  { href: "/admin",            label: "Ringkasan", icon: "📊" },
  { href: "/admin/umkm",       label: "Daftar UMKM", icon: "🏪" },
  { href: "/admin/wilayah",    label: "Wilayah", icon: "🗺️" },
  { href: "/admin/pesanan",    label: "Pesanan",  icon: "🧾" },
  { href: "/admin/users",      label: "Pengguna", icon: "👥" },
  { href: "/admin/news",       label: "Berita",   icon: "📰" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row">
      <Sidebar title="Admin / Dinas" items={items} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
