import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UmkmMapClient } from "@/components/UmkmMapClient";
import { UmkmSearchableList } from "@/components/UmkmSearchableList";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kopi Sriwijaya — UMKM Kopi Sumatera Selatan",
  description:
    "Temukan dan beli langsung kopi terbaik dari UMKM Sumatera Selatan. Peta interaktif, edukasi kopi, dan pemesanan via WhatsApp.",
  openGraph: {
    title: "Kopi Sriwijaya — UMKM Kopi Sumatera Selatan",
    description:
      "Platform resmi Dinas Operasi UKM SumSel: peta, profil UMKM, edukasi kopi, dan pemesanan langsung.",
    type: "website",
  },
};

export default async function HomePage() {
  const [umkms, news] = await Promise.all([
    prisma.umkm.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        description: true,
        latitude: true,
        longitude: true,
        region: { select: { name: true } },
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.news.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, slug: true, title: true, excerpt: true, publishedAt: true, coverUrl: true },
    }),
  ]);

  const mapUmkms = umkms.map((u) => ({
    id: u.id,
    name: u.name,
    address: u.address,
    description: u.description,
    latitude: u.latitude,
    longitude: u.longitude,
    region: u.region,
    productCount: u._count.products,
  }));

  const regionNames = [...new Set(mapUmkms.map((u) => u.region.name))].sort();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-8 rounded-2xl bg-gradient-to-br from-coffee-700 to-coffee-900 p-8 text-coffee-50 shadow">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Kopi terbaik Sumatera Selatan, langsung dari petaninya.
        </h1>
        <p className="mt-2 max-w-2xl text-coffee-100">
          Jelajahi peta UMKM kopi se-Sumsel, kenali asal & profil rasanya, lalu pesan langsung
          lewat WhatsApp. Pengiriman ekspedisi ke seluruh Indonesia.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/edukasi" className="rounded-md bg-coffee-50 px-4 py-2 text-sm font-medium text-coffee-800 hover:bg-coffee-100">
            Pelajari Kopi
          </Link>
          <Link href="#daftar-umkm" className="rounded-md border border-coffee-50/40 px-4 py-2 text-sm font-medium text-coffee-50 hover:bg-coffee-50/10">
            Lihat Daftar UMKM
          </Link>
        </div>
      </section>

      <section className="mb-10">
        <UmkmMapClient umkms={mapUmkms} />
        <p className="mt-2 text-sm text-coffee-600">
          Klik pin di peta untuk melihat profil UMKM dan memesan langsung lewat WhatsApp.
        </p>
      </section>

      {news.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-semibold text-coffee-800">Berita Terbaru</h2>
            <Link href="/berita" className="text-sm text-coffee-700 hover:underline">Lihat semua →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {news.map((n) => (
              <Link key={n.id} href={`/berita/${n.slug}`}
                className="block overflow-hidden rounded-xl border border-coffee-200 bg-white shadow-sm hover:border-coffee-400 hover:shadow">
                {n.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.coverUrl} alt="" className="h-32 w-full object-cover" />
                )}
                <div className="p-3">
                  <div className="text-xs text-coffee-500">{formatDate(n.publishedAt)}</div>
                  <h3 className="mt-1 line-clamp-2 font-semibold text-coffee-800">{n.title}</h3>
                  {n.excerpt && <p className="mt-1 line-clamp-2 text-sm text-coffee-700">{n.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="daftar-umkm">
        <h2 className="mb-4 text-2xl font-semibold text-coffee-800">Daftar UMKM</h2>
        <UmkmSearchableList umkms={mapUmkms} regions={regionNames} />
      </section>
    </div>
  );
}
