import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BeritaListPage() {
  const news = await prisma.news.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-coffee-800">Berita &amp; Pengumuman</h1>
      <p className="mt-1 text-coffee-700">
        Informasi terbaru seputar UMKM kopi Sumatera Selatan dari Dinas Operasi UKM.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {news.length === 0 && <p className="text-coffee-500">Belum ada berita.</p>}
        {news.map((n) => (
          <Link key={n.id} href={`/berita/${n.slug}`}
            className="block overflow-hidden rounded-xl border border-coffee-200 bg-white shadow-sm transition hover:border-coffee-400 hover:shadow">
            {n.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={n.coverUrl} alt="" className="h-40 w-full object-cover" />
            )}
            <div className="p-4">
              <div className="text-xs text-coffee-500">
                {formatDate(n.publishedAt)} • {n.author.name}
              </div>
              <h2 className="mt-1 line-clamp-2 text-lg font-semibold text-coffee-800">
                {n.title}
              </h2>
              {n.excerpt && (
                <p className="mt-2 line-clamp-3 text-sm text-coffee-700">{n.excerpt}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
