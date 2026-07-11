import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";

const patchSchema = z.object({
  password: z.string().min(6).max(128).optional(),
  role: z.enum(["ADMIN", "UMKM", "BUYER"]).optional(),
});

async function adminOr403() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await adminOr403();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const userId = Number(id);
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });

  const { password, role } = parsed.data;

  // Prevent demoting the only admin so the system isn't locked out.
  if (role && role !== Role.ADMIN) {
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (target?.role === Role.ADMIN) {
      const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Tidak bisa menurunkan role: ini admin terakhir." },
          { status: 409 }
        );
      }
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
      ...(role ? { role } : {}),
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await adminOr403();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const userId = Number(id);

  const [umkmCount, orderCount, adminCount, target] = await Promise.all([
    prisma.umkm.count({ where: { ownerId: userId } }),
    prisma.order.count({ where: { buyerId: userId } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  if (target?.role === Role.ADMIN && adminCount <= 1) {
    return NextResponse.json({ error: "Tidak bisa menghapus admin terakhir." }, { status: 409 });
  }
  if (umkmCount > 0) {
    return NextResponse.json({ error: "Pengguna masih memiliki UMKM. Hapus UMKM terlebih dahulu." }, { status: 409 });
  }
  if (orderCount > 0) {
    return NextResponse.json({ error: "Pengguna masih memiliki riwayat pesanan." }, { status: 409 });
  }

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
