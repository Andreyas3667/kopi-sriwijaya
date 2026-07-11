import { Sidebar } from "@/components/Sidebar";

const items = [
  { href: "/dashboard",            label: "Ringkasan",  icon: "📊" },
  { href: "/dashboard/produk",     label: "Produk",     icon: "☕" },
  { href: "/dashboard/pesanan",    label: "Pesanan",    icon: "🧾" },
  { href: "/dashboard/profile",    label: "Profil UMKM", icon: "🏪" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row">
      <Sidebar title="UMKM" items={items} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
