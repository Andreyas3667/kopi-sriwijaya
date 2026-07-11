import { prisma } from "@/lib/prisma";
import { requireUmkmOwner } from "@/lib/dashboard";
import { rupiah, formatDateTime } from "@/lib/format";
import { OrderStatusActions } from "@/components/OrderStatusActions";
import type { OrderStatus } from "@/lib/enums";

export const dynamic = "force-dynamic";

export default async function UmkmOrdersPage() {
  const { umkm } = await requireUmkmOwner();
  const orders = await prisma.order.findMany({
    where: { umkmId: umkm.id },
    include: { items: { include: { product: true } }, buyer: true },
    orderBy: { orderedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-coffee-800">Pesanan Masuk</h1>
      <p className="mt-1 text-sm text-coffee-600">
        Verifikasi pesanan setelah pembayaran &amp; pengiriman selesai. Stok akan otomatis berkurang
        ketika pesanan ditandai <strong>Selesai</strong>.
      </p>

      <div className="mt-4 space-y-3">
        {orders.length === 0 && (
          <p className="rounded-xl border border-coffee-200 bg-white p-6 text-center text-coffee-500">
            Belum ada pesanan.
          </p>
        )}
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border border-coffee-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm text-coffee-500">#{o.id} • {formatDateTime(o.orderedAt)}</div>
                <div className="font-medium text-coffee-800">Pembeli: {o.buyer.name}</div>
                {o.note && <pre className="mt-1 whitespace-pre-wrap text-xs text-coffee-700">{o.note}</pre>}
              </div>
              <OrderStatusActions id={o.id} current={o.status as OrderStatus} />
            </div>
            <ul className="mt-3 space-y-1 text-sm text-coffee-700">
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.quantity} × {i.product.name} — {rupiah(i.unitPrice)}
                </li>
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
