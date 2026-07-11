import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";

const productSchema = z.object({
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

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.UMKM) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const umkm = await prisma.umkm.findUnique({ where: { ownerId: session.user.id } });
  if (!umkm) return NextResponse.json({ error: "UMKM belum terdaftar." }, { status: 400 });

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  const d = parsed.data;

  const product = await prisma.product.create({
    data: {
      umkmId: umkm.id,
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
  return NextResponse.json(product);
}
