import { Sidebar } from "@/components/Sidebar";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const items = [
  { href: "/profile",          label: "Profil Saya", icon: "👤" },
  { href: "/profile/pesanan",  label: "Riwayat Pesanan", icon: "🧾" },
];

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/profile");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row">
      <Sidebar title="Akun Saya" items={items} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
