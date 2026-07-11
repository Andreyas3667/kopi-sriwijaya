import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rupiah, formatDateTime } from "@/lib/format";
import { OrderStatus } from "@/lib/enums";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:   "Menunggu konfirmasi UMKM",
  CONFIRMED: "Dikonfirmasi UMKM",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const STATUS_TONES: Record<OrderStatus, string> = {
  PENDING:   "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function BuyerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/profile/pesanan");
  const { status } = await searchParams;

  const orders = await prisma.order.findMany({
    where: {
      buyerId: session.user.id,
      ...(status ? { status } : {}),
    },
    include: {
      umkm: true,
      items: { include: { product: true } },
    },
    orderBy: { orderedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-coffee-800">Riwayat Pesanan</h1>
      <p className="mt-1 text-sm text-coffee-600">Pesanan yang Anda lakukan dari platform ini.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/profile/pesanan"
          className={`rounded-md px-3 py-1.5 text-sm ${!status ? "bg-coffee-700 text-white" : "bg-coffee-100 text-coffee-800 hover:bg-coffee-200"}`}>
          Semua
        </Link>
        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
          <Link key={s} href={`/profile/pesanan?status=${s}`}
            className={`rounded-md px-3 py-1.5 text-sm ${status === s ? "bg-coffee-700 text-white" : "bg-coffee-100 text-coffee-800 hover:bg-coffee-200"}`}>
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {orders.length === 0 && (
          <p className="rounded-xl border border-coffee-200 bg-white p-6 text-center text-coffee-500">
            Belum ada pesanan.
          </p>
        )}
        {orders.map((o) => {
          const waUrl = `https://wa.me/${o.umkm.whatsapp.replace(/\D/g, "")}` +
            `?text=${encodeURIComponent(`Halo ${o.umkm.name}, mengenai pesanan #${o.id} tanggal ${o.orderedAt.toLocaleDateString("id-ID")}`)}`;
          const s = o.status as OrderStatus;
          return (
            <div key={o.id} className="rounded-xl border border-coffee-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-sm text-coffee-500">
                    #{o.id} • {formatDateTime(o.orderedAt)}
                  </div>
                  <Link href={`/umkm/${o.umkm.id}`} className="font-medium text-coffee-800 hover:underline">
                    {o.umkm.name}
                  </Link>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONES[s]}`}>
                  {STATUS_LABELS[s]}
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-coffee-700">
                {o.items.map((i) => (
                  <li key={i.id}>{i.quantity} × {i.product.name} — {rupiah(i.unitPrice)}</li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-coffee-800">
                  Total: <span className="font-semibold">{rupiah(o.total)}</span>
                </div>
                <a href={waUrl} target="_blank" rel="noreferrer"
                  className="rounded-md border border-green-600 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50">
                  Hubungi UMKM
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
