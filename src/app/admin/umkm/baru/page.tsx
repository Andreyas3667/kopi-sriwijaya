import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dashboard";
import { CreateUmkmForm } from "@/components/CreateUmkmForm";

export default async function NewUmkmPage() {
  await requireAdmin();
  const regions = await prisma.region.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-coffee-800">Tambah UMKM</h1>
      <p className="mt-1 text-sm text-coffee-600">
        Membuat akun pemilik UMKM sekaligus profil UMKM-nya.
      </p>
      <div className="mt-6">
        <CreateUmkmForm regions={regions.map((r) => ({ id: r.id, name: r.name }))} />
      </div>
    </div>
  );
}
