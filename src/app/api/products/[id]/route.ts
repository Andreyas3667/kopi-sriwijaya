import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";

const patchSchema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(1000).optional().or(z.literal("")),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
  variety: z.string().max(40).optional().or(z.literal("")),
  processing: z.string().max(40).optional().or(z.literal("")),
  roastLevel: z.string().max(40).optional().or(z.literal("")),
  flavorNotes: z.string().max(200).optional().or(z.literal("")),
  weightGram: z.number().int().positive().nullable().optional(),
});

async function ownProductOr403(productId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { umkm: true },
  });
  if (!product) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };

  if (session.user.role === Role.ADMIN) return { product };
  if (session.user.role === Role.UMKM && product.umkm.ownerId === session.user.id) {
    return { product };
  }
  return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await ownProductOr403(Number(id));
  if (guard.error) return guard.error;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  const d = parsed.data;

  const updated = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      name: d.name,
      description: d.description || null,
      price: d.price,
      stock: d.stock,
      imageUrl: d.imageUrl || null,
      variety: d.variety || null,
      processing: d.processing || null,
      roastLevel: d.roastLevel || null,
      flavorNotes: d.flavorNotes || null,
      weightGram: d.weightGram ?? null,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guard = await ownProductOr403(Number(id));
  if (guard.error) return guard.error;

  await prisma.product.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
