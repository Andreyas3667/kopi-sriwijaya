import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dashboard";
import { rupiah } from "@/lib/format";
import { parsePeriod } from "@/lib/period";
import { buildAnalytics } from "@/lib/analytics";
import { PeriodFilter } from "@/components/PeriodFilter";
import { ExportButtons } from "@/components/ExportButtons";
import { RevenueBarChart } from "@/components/charts/RevenueBarChart";
import { DonutChart } from "@/components/charts/DonutChart";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const period = parsePeriod(sp);

  const [umkmCount, productCount, analytics] = await Promise.all([
    prisma.umkm.count(),
    prisma.product.count(),
    buildAnalytics({ period }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-coffee-800">Ringkasan Dinas</h1>
          <p className="text-sm text-coffee-600">Pemantauan UMKM kopi se-Sumatera Selatan • {period.label}</p>
        </div>
        <ExportButtons basePath="/api/exports/orders" />
      </div>

      <PeriodFilter />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total UMKM" value={umkmCount.toString()} />
        <Stat label="Total Produk" value={productCount.toString()} />
        <Stat label="Pesanan (periode)" value={analytics.totalOrders.toString()} />
        <Stat label="Pendapatan Selesai" value={rupiah(analytics.totalRevenue)} />
      </div>

      <section className="rounded-xl border border-coffee-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold text-coffee-800">Pendapatan Bulanan</h2>
        <RevenueBarChart data={analytics.monthly} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-coffee-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-coffee-800">Pesanan per Wilayah</h2>
          {analytics.perRegion.length === 0
            ? <p className="text-coffee-500">Belum ada pesanan pada periode ini.</p>
            : <DonutChart data={analytics.perRegion} />}
        </section>

        <section className="rounded-xl border border-coffee-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-coffee-800">Status Pesanan</h2>
          {analytics.perStatus.length === 0
            ? <p className="text-coffee-500">Tidak ada data.</p>
            : <DonutChart data={analytics.perStatus} />}
        </section>
      </div>

      <section className="rounded-xl border border-coffee-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold text-coffee-800">Top Produk Terlaris</h2>
        {analytics.topProducts.length === 0 ? (
          <p className="text-coffee-500">Belum ada penjualan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-coffee-100 text-left text-coffee-700">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Produk</th>
                  <th className="px-3 py-2">UMKM</th>
                  <th className="px-3 py-2 text-right">Terjual</th>
                  <th className="px-3 py-2 text-right">Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProducts.map((p, i) => (
                  <tr key={p.name} className="border-t border-coffee-100">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 font-medium text-coffee-800">{p.name}</td>
                    <td className="px-3 py-2">{p.umkm}</td>
                    <td className="px-3 py-2 text-right">{p.quantity}</td>
                    <td className="px-3 py-2 text-right">{rupiah(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-coffee-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wider text-coffee-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-coffee-800">{value}</div>
    </div>
  );
}
