import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dashboard";
import { RegionEditor } from "@/components/RegionEditor";

export const dynamic = "force-dynamic";

export default async function AdminRegionsPage() {
  await requireAdmin();
  const regions = await prisma.region.findMany({
    include: { _count: { select: { umkms: true } } },
    orderBy: { name: "asc" },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold text-coffee-800">Kelola Wilayah</h1>
      <p className="mt-1 text-sm text-coffee-600">
        Wilayah / kabupaten penghasil kopi yang dipantau Dinas.
      </p>
      <div className="mt-6">
        <RegionEditor
          initial={regions.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description ?? "",
            umkmCount: r._count.umkms,
          }))}
        />
      </div>
    </div>
  );
}
