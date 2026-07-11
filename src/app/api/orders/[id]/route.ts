import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Role } from "@/lib/enums";

const patchSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orderId = Number(id);
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { umkm: true, items: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ADMIN may update any order; UMKM only their own.
  if (session.user.role === Role.UMKM && order.umkm.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.user.role === Role.BUYER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const newStatus = parsed.data.status;

  // Decrement stock the first time an order moves into COMPLETED. Idempotent: if
  // it was already COMPLETED, do nothing. Re-check stock at confirm time so we
  // never go negative — if a buyer's stock dropped between order and verify
  // (sold elsewhere, manual stock adjust), the UMKM is told to fix it first.
  if (newStatus === OrderStatus.COMPLETED && order.status !== OrderStatus.COMPLETED) {
    const products = await prisma.product.findMany({
      where: { id: { in: order.items.map((i) => i.productId) } },
    });
    for (const item of order.items) {
      const p = products.find((pr) => pr.id === item.productId);
      if (!p || p.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stok ${p?.name ?? "produk"} tidak cukup (tersisa ${p?.stock ?? 0}, dibutuhkan ${item.quantity}). Update stok terlebih dahulu.`,
          },
          { status: 409 }
        );
      }
    }
    await prisma.$transaction([
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      ),
      prisma.order.update({ where: { id: orderId }, data: { status: newStatus } }),
    ]);
  } else {
    await prisma.order.update({ where: { id: orderId }, data: { status: newStatus } });
  }

  return NextResponse.json({ ok: true });
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
  await prisma.order.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
