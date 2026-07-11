import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Role } from "@/lib/enums";

const orderSchema = z.object({
  umkmId: z.number().int().positive(),
  buyerName: z.string().min(1).max(120),
  buyerPhone: z.string().min(6).max(20),
  buyerAddress: z.string().min(5).max(500),
  note: z.string().max(500).optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = orderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }
  const data = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: data.items.map((i) => i.productId) }, umkmId: data.umkmId },
  });
  if (products.length !== data.items.length) {
    return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 400 });
  }
  for (const item of data.items) {
    const product = products.find((p) => p.id === item.productId)!;
    if (item.quantity > product.stock) {
      return NextResponse.json(
        { error: `Stok produk ${product.name} tidak mencukupi.` },
        { status: 400 }
      );
    }
  }

  // Buyers don't need to be logged in. If they aren't, attribute the order to a
  // shared "Guest Buyer" account so foreign keys stay clean.
  const session = await getServerSession(authOptions);
  let buyerId: number;
  if (session?.user?.id) {
    buyerId = session.user.id;
  } else {
    const guest = await prisma.user.upsert({
      where: { email: "guest@kopi.id" },
      update: {},
      create: {
        name: "Guest Buyer",
        email: "guest@kopi.id",
        password: "!", // login disabled (bcrypt hashes never start with "!")
        role: Role.BUYER,
      },
    });
    buyerId = guest.id;
  }

  const total = data.items.reduce((sum, item) => {
    const p = products.find((x) => x.id === item.productId)!;
    return sum + p.price * item.quantity;
  }, 0);

  const order = await prisma.order.create({
    data: {
      umkmId: data.umkmId,
      buyerId,
      status: OrderStatus.PENDING,
      total,
      note:
        `${data.buyerName} • ${data.buyerPhone}\n${data.buyerAddress}` +
        (data.note ? `\nCatatan: ${data.note}` : ""),
      items: {
        create: data.items.map((item) => {
          const p = products.find((x) => x.id === item.productId)!;
          return { productId: p.id, quantity: item.quantity, unitPrice: p.price };
        }),
      },
    },
  });

  return NextResponse.json({ id: order.id });
}
