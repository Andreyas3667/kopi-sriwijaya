import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";
import { uniqueSlug } from "@/lib/slug";

const schema = z.object({
  title: z.string().min(3).max(200),
  excerpt: z.string().max(400).optional().or(z.literal("")),
  content: z.string().min(10).max(20000),
  coverUrl: z.string().max(500).optional().or(z.literal("")),
  published: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  const { title, excerpt, content, coverUrl, published } = parsed.data;

  const slug = await uniqueSlug(title, async (s) => !!(await prisma.news.findUnique({ where: { slug: s } })));

  const post = await prisma.news.create({
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      coverUrl: coverUrl || null,
      published: published ?? true,
      authorId: session.user.id,
    },
  });
  return NextResponse.json(post);
}
