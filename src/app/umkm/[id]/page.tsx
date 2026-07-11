import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { rupiah } from "@/lib/format";
import { OrderForm } from "@/components/OrderForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const umkm = await prisma.umkm.findUnique({
    where: { id: Number(id) },
    select: { name: true, description: true, region: { select: { name: true } } },
  });
  if (!umkm) return { title: "UMKM tidak ditemukan" };
  return {
    title: `${umkm.name} — Kopi Sriwijaya`,
    description: umkm.description ?? `UMKM kopi di ${umkm.region.name}, Sumatera Selatan.`,
    openGraph: {
      title: umkm.name,
      description: umkm.description ?? undefined,
    },
  };
}

export default async function UmkmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const umkmId = Number(id);
  if (!Number.isFinite(umkmId)) notFound();

  const umkm = await prisma.umkm.findUnique({
    where: { id: umkmId },
    include: {
      region: true,
      products: { orderBy: [{ stock: "desc" }, { name: "asc" }] },
    },
  });
  if (!umkm) notFound();

  const inStock = umkm.products.filter((p) => p.stock > 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="overflow-hidden rounded-xl border border-coffee-200 bg-white shadow-sm">
        {umkm.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={umkm.photoUrl} alt={umkm.name} className="h-56 w-full object-cover" />
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-coffee-800">{umkm.name}</h1>
              <p className="mt-1 text-coffee-700">{umkm.address}</p>
              <p className="mt-1 text-sm text-coffee-500">
                Wilayah: <span className="font-medium">{umkm.region.name}</span>
              </p>
            </div>
            <a
              href={`https://wa.me/${umkm.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-green-600 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
            >
              Hubungi via WhatsApp
            </a>
          </div>
          {umkm.description && (
            <p className="mt-4 leading-relaxed text-coffee-700">{umkm.description}</p>
          )}
        </div>
      </div>

      <h2 className="mt-10 mb-4 text-2xl font-semibold text-coffee-800">Produk Tersedia</h2>

      {umkm.products.length === 0 ? (
        <p className="text-coffee-700">UMKM ini belum mendaftarkan produk.</p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {umkm.products.map((p) => {
              const isOut = p.stock === 0;
              const isLow = !isOut && p.stock <= 5;
              return (
                <div key={p.id}
                  className={`overflow-hidden rounded-xl border bg-white shadow-sm transition ${
                    isOut ? "border-red-200 opacity-75" : "border-coffee-200"
                  }`}>
                  {p.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="h-40 w-full object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-lg font-semibold text-coffee-800">{p.name}</div>
                      {isOut && (
                        <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          Stok Habis
                        </span>
                      )}
                      {isLow && (
                        <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                          Stok terbatas
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <div className="mt-1 text-sm text-coffee-700">{p.description}</div>
                    )}

                    <div className="mt-2 flex flex-wrap gap-1 text-xs">
                      {p.variety && <Tag>{p.variety}</Tag>}
                      {p.processing && <Tag>{p.processing}</Tag>}
                      {p.roastLevel && <Tag>Roast {p.roastLevel}</Tag>}
                      {p.weightGram && <Tag>{p.weightGram}g</Tag>}
                    </div>
                    {p.flavorNotes && (
                      <div className="mt-2 text-xs italic text-coffee-600">
                        Aroma: {p.flavorNotes}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-base font-bold text-coffee-700">{rupiah(p.price)}</span>
                      <span className={`text-xs ${isOut ? "text-red-700" : "text-coffee-600"}`}>
                        Stok: {p.stock}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {inStock.length > 0 ? (
            <OrderForm
              umkm={{
                id: umkm.id,
                name: umkm.name,
                whatsapp: umkm.whatsapp,
              }}
              products={inStock.map((p) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                stock: p.stock,
              }))}
            />
          ) : (
            <p className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
              Semua produk UMKM ini sedang habis. Silakan cek kembali nanti atau hubungi UMKM
              langsung untuk informasi restock.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-coffee-100 px-2 py-0.5 text-coffee-800">
      {children}
    </span>
  );
}
