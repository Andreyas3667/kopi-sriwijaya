import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BeritaDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.news.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });
  if (!post || !post.published) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/berita" className="text-sm text-coffee-600 hover:underline">← Semua berita</Link>
      <h1 className="mt-2 text-3xl font-bold text-coffee-800">{post.title}</h1>
      <div className="mt-1 text-sm text-coffee-500">
        {formatDate(post.publishedAt)} • {post.author.name}
      </div>
      {post.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverUrl} alt="" className="mt-4 w-full rounded-xl border border-coffee-200" />
      )}
      <div className="mt-6 whitespace-pre-wrap leading-relaxed text-coffee-800">
        {post.content}
      </div>
    </article>
  );
}
