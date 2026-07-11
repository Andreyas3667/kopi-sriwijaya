import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const regionId = Number(id);
  const inUse = await prisma.umkm.count({ where: { regionId } });
  if (inUse > 0) {
    return NextResponse.json(
      { error: `Tidak bisa dihapus: masih ada ${inUse} UMKM di wilayah ini.` },
      { status: 409 }
    );
  }
  await prisma.region.delete({ where: { id: regionId } });
  return NextResponse.json({ ok: true });
}
