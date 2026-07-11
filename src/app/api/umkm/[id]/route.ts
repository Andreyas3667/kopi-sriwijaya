import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";

const patchSchema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(2000).optional().or(z.literal("")),
  address: z.string().min(3).max(500),
  whatsapp: z.string().min(6).max(20),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  regionId: z.number().int().positive(),
  photoUrl: z.string().max(500).optional().or(z.literal("")),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const umkm = await prisma.umkm.findUnique({ where: { id: Number(id) } });
  if (!umkm) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Owner UMKM may edit theirs; ADMIN may edit anyone's.
  if (
    session.user.role !== Role.ADMIN &&
    !(session.user.role === Role.UMKM && umkm.ownerId === session.user.id)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  const data = parsed.data;

  const updated = await prisma.umkm.update({
    where: { id: umkm.id },
    data: {
      name: data.name,
      description: data.description || null,
      address: data.address,
      whatsapp: data.whatsapp,
      latitude: data.latitude,
      longitude: data.longitude,
      regionId: data.regionId,
      photoUrl: data.photoUrl || null,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.umkm.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
