import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dashboard";
import { formatDate } from "@/lib/format";
import { NewsRowActions } from "@/components/NewsRowActions";

export const dynamic = "force-dynamic";

export default async function AdminNewsList() {
  await requireAdmin();
  const news = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-coffee-800">Berita</h1>
        <Link href="/admin/news/baru"
          className="rounded-md bg-coffee-700 px-3 py-2 text-sm font-medium text-white hover:bg-coffee-800">
          + Tulis Berita
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-coffee-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-coffee-100 text-left text-coffee-700">
            <tr>
              <th className="px-3 py-2">Judul</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Penulis</th>
              <th className="px-3 py-2">Diterbitkan</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {news.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-coffee-500">Belum ada berita.</td></tr>
            )}
            {news.map((n) => (
              <tr key={n.id} className="border-t border-coffee-100">
                <td className="px-3 py-2 font-medium text-coffee-800">
                  <Link href={`/berita/${n.slug}`} className="hover:underline">{n.title}</Link>
                  <div className="text-xs text-coffee-500">/{n.slug}</div>
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    n.published ? "bg-green-100 text-green-800" : "bg-coffee-100 text-coffee-700"}`}>
                    {n.published ? "Terbit" : "Draf"}
                  </span>
                </td>
                <td className="px-3 py-2">{n.author.name}</td>
                <td className="px-3 py-2">{formatDate(n.publishedAt)}</td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/news/${n.id}`} className="text-coffee-700 underline">Edit</Link>
                  <span className="mx-2 text-coffee-300">|</span>
                  <NewsRowActions id={n.id} published={n.published} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
