import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";

const createSchema = z.object({
  ownerName: z.string().min(2).max(120),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(6).max(128),
  name: z.string().min(1).max(160),
  description: z.string().max(2000).optional().or(z.literal("")),
  address: z.string().min(3).max(500),
  whatsapp: z.string().min(6).max(20),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  regionId: z.number().int().positive(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.ownerEmail } });
  if (existing) return NextResponse.json({ error: "Email pemilik sudah terdaftar." }, { status: 409 });

  const owner = await prisma.user.create({
    data: {
      name: data.ownerName,
      email: data.ownerEmail,
      password: await bcrypt.hash(data.ownerPassword, 10),
      role: Role.UMKM,
      regionId: data.regionId,
      phone: data.whatsapp,
      address: data.address,
    },
  });

  const umkm = await prisma.umkm.create({
    data: {
      name: data.name,
      description: data.description || null,
      address: data.address,
      whatsapp: data.whatsapp,
      latitude: data.latitude,
      longitude: data.longitude,
      regionId: data.regionId,
      ownerId: owner.id,
    },
  });

  return NextResponse.json(umkm);
}
