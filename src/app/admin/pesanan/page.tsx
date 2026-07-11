import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dashboard";
import { rupiah, formatDateTime } from "@/lib/format";
import { OrderStatusActions } from "@/components/OrderStatusActions";
import { OrderStatus, ORDER_STATUSES } from "@/lib/enums";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; status?: string }>;
}) {
  await requireAdmin();
  const { region, status } = await searchParams;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as OrderStatus } : {}),
      ...(region
        ? { umkm: { regionId: Number(region) } }
        : {}),
    },
    include: {
      umkm: { include: { region: true } },
      buyer: true,
      items: { include: { product: true } },
    },
    orderBy: { orderedAt: "desc" },
  });
  const regions = await prisma.region.findMany({ orderBy: { name: "asc" } });

  const csvHref = `/api/orders/export?${new URLSearchParams({
    ...(region ? { region } : {}),
    ...(status ? { status } : {}),
  }).toString()}`;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-coffee-800">Semua Pesanan</h1>
        <a href={csvHref}
          className="rounded-md border border-coffee-300 px-3 py-2 text-sm text-coffee-800 hover:bg-coffee-100">
          Export CSV
        </a>
      </div>

      <form className="mb-4 flex flex-wrap gap-2" action="/admin/pesanan">
        <select name="region" defaultValue={region ?? ""}
          className="rounded-md border border-coffee-300 px-3 py-2">
          <option value="">Semua wilayah</option>
          {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select name="status" defaultValue={status ?? ""}
          className="rounded-md border border-coffee-300 px-3 py-2">
          <option value="">Semua status</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="rounded-md bg-coffee-700 px-4 py-2 text-sm font-medium text-white hover:bg-coffee-800">
          Filter
        </button>
      </form>

      <div className="space-y-3">
        {orders.length === 0 && (
          <p className="rounded-xl border border-coffee-200 bg-white p-6 text-center text-coffee-500">
            Tidak ada pesanan.
          </p>
        )}
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border border-coffee-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm text-coffee-500">
                  #{o.id} • {formatDateTime(o.orderedAt)} • {o.umkm.region.name}
                </div>
                <div className="font-medium text-coffee-800">
                  {o.umkm.name} ← {o.buyer.name}
                </div>
                {o.note && <pre className="mt-1 whitespace-pre-wrap text-xs text-coffee-700">{o.note}</pre>}
              </div>
              <OrderStatusActions id={o.id} current={o.status as OrderStatus} />
            </div>
            <ul className="mt-3 space-y-1 text-sm text-coffee-700">
              {o.items.map((i) => (
                <li key={i.id}>{i.quantity} × {i.product.name} — {rupiah(i.unitPrice)}</li>
              ))}
            </ul>
            <div className="mt-2 text-right text-coffee-800">
              Total: <span className="font-semibold">{rupiah(o.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
