import { prisma } from "@/lib/prisma";
import { requireUmkmOwner } from "@/lib/dashboard";
import { rupiah, formatDateTime } from "@/lib/format";
import { parsePeriod } from "@/lib/period";
import { buildAnalytics } from "@/lib/analytics";
import { OrderStatus } from "@/lib/enums";
import { PeriodFilter } from "@/components/PeriodFilter";
import { ExportButtons } from "@/components/ExportButtons";
import { RevenueBarChart } from "@/components/charts/RevenueBarChart";
import { DonutChart } from "@/components/charts/DonutChart";

export const dynamic = "force-dynamic";

export default async function UmkmDashboard({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>;
}) {
  const { umkm } = await requireUmkmOwner();
  const sp = await searchParams;
  const period = parsePeriod(sp);

  const [productCount, lowStock, analytics, recent] = await Promise.all([
    prisma.product.count({ where: { umkmId: umkm.id } }),
    prisma.product.count({ where: { umkmId: umkm.id, stock: { lte: 5 } } }),
    buildAnalytics({ period, umkmId: umkm.id }),
    prisma.order.findMany({
      where: { umkmId: umkm.id },
      include: { items: { include: { product: true } }, buyer: true },
      orderBy: { orderedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-coffee-800">{umkm.name}</h1>
          <p className="text-sm text-coffee-600">{umkm.region.name} • {period.label}</p>
        </div>
        <ExportButtons basePath="/api/exports/orders" />
      </div>

      <PeriodFilter />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Produk" value={productCount.toString()} />
        <Stat label="Stok Rendah (≤5)" value={lowStock.toString()} tone={lowStock > 0 ? "warn" : undefined} />
        <Stat label="Pesanan Pending" value={analytics.pendingOrders.toString()} />
        <Stat label="Pendapatan Selesai" value={rupiah(analytics.totalRevenue)} />
      </div>

      <section className="rounded-xl border border-coffee-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold text-coffee-800">Pendapatan Bulanan</h2>
        <RevenueBarChart data={analytics.monthly} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-coffee-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-coffee-800">Status Pesanan</h2>
          {analytics.perStatus.length === 0
            ? <p className="text-coffee-500">Tidak ada pesanan pada periode ini.</p>
            : <DonutChart data={analytics.perStatus} />}
        </section>

        <section className="rounded-xl border border-coffee-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-coffee-800">Produk Terlaris (Anda)</h2>
          {analytics.topProducts.length === 0 ? (
            <p className="text-coffee-500">Belum ada penjualan.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {analytics.topProducts.slice(0, 5).map((p) => (
                <li key={p.name} className="flex justify-between border-b border-coffee-100 py-1">
                  <span className="text-coffee-800">{p.name}</span>
                  <span className="font-medium text-coffee-700">{p.quantity} pcs · {rupiah(p.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-coffee-200 bg-white">
        <h2 className="border-b border-coffee-100 px-4 py-3 text-lg font-semibold text-coffee-800">
          Pesanan Terbaru
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-coffee-50 text-left text-coffee-700">
              <tr>
                <th className="px-3 py-2">Tanggal</th>
                <th className="px-3 py-2">Pembeli</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-coffee-500">Belum ada pesanan.</td></tr>
              )}
              {recent.map((o) => (
                <tr key={o.id} className="border-t border-coffee-100">
                  <td className="px-3 py-2">{formatDateTime(o.orderedAt)}</td>
                  <td className="px-3 py-2">{o.buyer.name}</td>
                  <td className="px-3 py-2">{rupiah(o.total)}</td>
                  <td className="px-3 py-2"><StatusPill status={o.status as OrderStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  const valueColor = tone === "warn" ? "text-red-700" : "text-coffee-800";
  return (
    <div className="rounded-xl border border-coffee-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wider text-coffee-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    PENDING:   "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status.toLowerCase()}
    </span>
  );
}
