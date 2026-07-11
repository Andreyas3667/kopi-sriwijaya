import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, type OrderStatus } from "@/lib/enums";

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return new Response("Forbidden", { status: 403 });
  }

  const url = new URL(req.url);
  const region = url.searchParams.get("region");
  const status = url.searchParams.get("status");

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as OrderStatus } : {}),
      ...(region ? { umkm: { regionId: Number(region) } } : {}),
    },
    include: {
      umkm: { include: { region: true } },
      buyer: true,
      items: { include: { product: true } },
    },
    orderBy: { orderedAt: "desc" },
  });

  const header = [
    "order_id", "tanggal", "wilayah", "umkm", "pembeli",
    "produk", "jumlah", "harga_satuan", "subtotal", "total_pesanan", "status",
  ];

  const rows: string[] = [header.join(",")];
  for (const o of orders) {
    for (const i of o.items) {
      rows.push(
        [
          o.id,
          o.orderedAt.toISOString(),
          o.umkm.region.name,
          o.umkm.name,
          o.buyer.name,
          i.product.name,
          i.quantity,
          i.unitPrice,
          i.quantity * i.unitPrice,
          o.total,
          o.status,
        ].map(csvEscape).join(",")
      );
    }
  }

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-penjualan-${Date.now()}.csv"`,
    },
  });
}
