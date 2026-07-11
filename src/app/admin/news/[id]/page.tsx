import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dashboard";
import { NewsForm } from "@/components/NewsForm";

export const dynamic = "force-dynamic";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const post = await prisma.news.findUnique({ where: { id: Number(id) } });
  if (!post) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-coffee-800">Edit Berita</h1>
      <div className="mt-6">
        <NewsForm
          mode="edit"
          post={{
            id: post.id,
            title: post.title,
            excerpt: post.excerpt ?? "",
            content: post.content,
            coverUrl: post.coverUrl ?? "",
            published: post.published,
          }}
        />
      </div>
    </div>
  );
}
