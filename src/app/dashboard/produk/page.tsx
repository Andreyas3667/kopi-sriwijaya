import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUmkmOwner } from "@/lib/dashboard";
import { rupiah } from "@/lib/format";
import { DeleteProductButton } from "@/components/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function ProductListPage() {
  const { umkm } = await requireUmkmOwner();
  const products = await prisma.product.findMany({
    where: { umkmId: umkm.id },
    orderBy: { createdAt: "desc" },
  });

  const oosCount = products.filter((p) => p.stock === 0).length;
  const lowCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

  return (
    <div>
      {(oosCount > 0 || lowCount > 0) && (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
          <strong>Peringatan stok:</strong>{" "}
          {oosCount > 0 && <span>{oosCount} produk habis. </span>}
          {lowCount > 0 && <span>{lowCount} produk stok rendah (≤5). </span>}
          Update stok atau nonaktifkan produk yang habis.
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-coffee-800">Produk</h1>
        <Link
          href="/dashboard/produk/baru"
          className="rounded-md bg-coffee-700 px-3 py-2 text-sm font-medium text-white hover:bg-coffee-800"
        >
          + Tambah Produk
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-coffee-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-coffee-100 text-left text-coffee-700">
            <tr>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Harga</th>
              <th className="px-3 py-2">Stok</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-coffee-500">Belum ada produk.</td></tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-t border-coffee-100">
                <td className="px-3 py-2 font-medium text-coffee-800">
                  {p.name}
                  {p.description && <div className="text-xs text-coffee-600">{p.description}</div>}
                </td>
                <td className="px-3 py-2">{rupiah(p.price)}</td>
                <td className="px-3 py-2">
                  {p.stock}
                  {p.stock === 0 && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      Habis
                    </span>
                  )}
                  {p.stock > 0 && p.stock <= 5 && (
                    <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                      Rendah
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/dashboard/produk/${p.id}`} className="text-coffee-700 underline">Edit</Link>
                  <span className="mx-2 text-coffee-300">|</span>
                  <DeleteProductButton id={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
