import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminUmkmList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; region?: string }>;
}) {
  await requireAdmin();
  const { q, region } = await searchParams;

  const regionId = region ? Number(region) : undefined;

  const umkms = await prisma.umkm.findMany({
    where: {
      AND: [
        regionId ? { regionId } : {},
        q
          ? {
              OR: [
                { name: { contains: q } },
                { address: { contains: q } },
                { whatsapp: { contains: q } },
              ],
            }
          : {},
      ],
    },
    include: {
      region: true,
      owner: true,
      products: { select: { stock: true } },
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  const regions = await prisma.region.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-coffee-800">Kelola UMKM</h1>
        <div className="flex gap-2">
          <Link href="/admin/umkm/bulk"
            className="rounded-md border border-coffee-300 px-3 py-2 text-sm text-coffee-800 hover:bg-coffee-100">
            ⬆ Bulk CSV
          </Link>
          <Link href="/admin/umkm/baru"
            className="rounded-md bg-coffee-700 px-3 py-2 text-sm font-medium text-white hover:bg-coffee-800">
            + Tambah UMKM
          </Link>
        </div>
      </div>

      <form className="mb-4 flex flex-wrap gap-2" action="/admin/umkm">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Cari nama / alamat / kontak…"
          className="flex-1 rounded-md border border-coffee-300 px-3 py-2"
        />
        <select
          name="region"
          defaultValue={region ?? ""}
          className="rounded-md border border-coffee-300 px-3 py-2"
        >
          <option value="">Semua wilayah</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <button className="rounded-md bg-coffee-700 px-4 py-2 text-sm font-medium text-white hover:bg-coffee-800">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-coffee-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-coffee-100 text-left text-coffee-700">
            <tr>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Wilayah</th>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2">Kontak</th>
              <th className="px-3 py-2">Produk</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {umkms.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-coffee-500">Tidak ada data.</td></tr>
            )}
            {umkms.map((u) => (
              <tr key={u.id} className="border-t border-coffee-100">
                <td className="px-3 py-2 font-medium text-coffee-800">{u.name}</td>
                <td className="px-3 py-2">{u.region.name}</td>
                <td className="px-3 py-2">
                  <div>{u.owner.name}</div>
                  <div className="text-xs text-coffee-500">{u.owner.email}</div>
                </td>
                <td className="px-3 py-2">{u.whatsapp}</td>
                <td className="px-3 py-2">
                  {u._count.products}
                  {u.products.some((p) => p.stock <= 5) && (
                    <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">stok rendah</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/umkm/${u.id}`} className="text-coffee-700 underline">Lihat</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
