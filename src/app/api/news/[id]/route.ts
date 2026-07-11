import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";

const patchSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().max(400).optional().or(z.literal("")),
  content: z.string().min(10).max(20000).optional(),
  coverUrl: z.string().max(500).optional().or(z.literal("")),
  published: z.boolean().optional(),
});

async function adminOr403() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const blocked = await adminOr403();
  if (blocked) return blocked;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });

  const data: Record<string, unknown> = { ...parsed.data };
  if ("excerpt" in data && !data.excerpt) data.excerpt = null;
  if ("coverUrl" in data && !data.coverUrl) data.coverUrl = null;

  const updated = await prisma.news.update({ where: { id: Number(id) }, data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const blocked = await adminOr403();
  if (blocked) return blocked;

  const { id } = await params;
  await prisma.news.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
