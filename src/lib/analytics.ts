import { prisma } from "./prisma";
import { OrderStatus } from "./enums";
import { monthBuckets, type Period } from "./period";

// Returns a unified analytics bundle for a given period and optional UMKM scope.
// Used by dashboards (admin + umkm) and the PDF/Excel exporters.

export type Analytics = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  monthly: { label: string; revenue: number; orders: number }[];
  perRegion: { name: string; value: number }[];
  perStatus: { name: string; value: number }[];
  topProducts: { name: string; umkm: string; quantity: number; revenue: number }[];
};

export async function buildAnalytics({
  period,
  umkmId,
}: {
  period: Period;
  umkmId?: number;
}): Promise<Analytics> {
  const where = {
    orderedAt: { gte: period.from, lte: period.to },
    ...(umkmId ? { umkmId } : {}),
  };

  const orders = await prisma.order.findMany({
    where,
    include: {
      umkm: { include: { region: true } },
      items: { include: { product: true } },
    },
    orderBy: { orderedAt: "asc" },
  });

  const totalRevenue = orders
    .filter((o) => o.status === OrderStatus.COMPLETED)
    .reduce((sum, o) => sum + o.total, 0);

  const buckets = monthBuckets(period.from, period.to);
  const monthly = buckets.map((b) => {
    const inBucket = orders.filter((o) => o.orderedAt >= b.start && o.orderedAt <= b.end);
    return {
      label: b.label,
      revenue: inBucket
        .filter((o) => o.status === OrderStatus.COMPLETED)
        .reduce((sum, o) => sum + o.total, 0),
      orders: inBucket.length,
    };
  });

  const regionMap = new Map<string, number>();
  const statusMap = new Map<string, number>();
  const productMap = new Map<number, { name: string; umkm: string; quantity: number; revenue: number }>();

  for (const o of orders) {
    regionMap.set(o.umkm.region.name, (regionMap.get(o.umkm.region.name) ?? 0) + 1);
    statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1);
    if (o.status === OrderStatus.COMPLETED) {
      for (const i of o.items) {
        const cur = productMap.get(i.productId) ?? {
          name: i.product.name,
          umkm: o.umkm.name,
          quantity: 0,
          revenue: 0,
        };
        cur.quantity += i.quantity;
        cur.revenue += i.quantity * i.unitPrice;
        productMap.set(i.productId, cur);
      }
    }
  }

  return {
    totalOrders: orders.length,
    totalRevenue,
    pendingOrders: orders.filter((o) => o.status === OrderStatus.PENDING).length,
    completedOrders: orders.filter((o) => o.status === OrderStatus.COMPLETED).length,
    monthly,
    perRegion: [...regionMap.entries()].map(([name, value]) => ({ name, value })),
    perStatus: [...statusMap.entries()].map(([name, value]) => ({ name, value })),
    topProducts: [...productMap.values()]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10),
  };
}
