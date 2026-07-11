"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { rupiah } from "@/lib/format";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";

type Product = { id: number; name: string; price: number; stock: number };

export function OrderForm({
  umkm,
  products,
}: {
  umkm: { id: number; name: string; whatsapp: string };
  products: Product[];
}) {
  const { data: session } = useSession();
  const [qty, setQty] = useState<Record<number, number>>({});
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");

  // Prefill buyer fields once the session is hydrated.
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/profile/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (!p) return;
        setBuyerName(p.name ?? "");
        setBuyerPhone(p.phone ?? "");
        setBuyerAddress(p.address ?? "");
      });
  }, [session]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lines = useMemo(
    () =>
      products
        .map((p) => ({ p, q: qty[p.id] ?? 0 }))
        .filter(({ q }) => q > 0)
        .map(({ p, q }) => ({ name: p.name, quantity: q, unitPrice: p.price, productId: p.id })),
    [products, qty]
  );
  const total = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (lines.length === 0) {
      setError("Pilih minimal satu produk dengan jumlah > 0.");
      return;
    }
    for (const l of lines) {
      const stock = products.find((p) => p.id === l.productId)?.stock ?? 0;
      if (l.quantity > stock) {
        setError(`Jumlah "${l.name}" melebihi stok tersedia (${stock}).`);
        return;
      }
    }

    setSubmitting(true);
    try {
      // Record the order so the UMKM/admin can verify it later. Anonymous buyers
      // are still allowed; the API returns a guest-order id.
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          umkmId: umkm.id,
          buyerName,
          buyerPhone,
          buyerAddress,
          note,
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Gagal menyimpan pesanan.");
      }

      const url = buildWhatsAppOrderUrl(umkm.whatsapp, {
        umkmName: umkm.name,
        buyerName,
        buyerPhone,
        buyerAddress,
        note,
        lines,
      });
      window.open(url, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-coffee-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-coffee-800">Form Pemesanan</h3>
      <p className="mt-1 text-sm text-coffee-600">
        Pilih jumlah produk lalu kirim pesanan ke UMKM via WhatsApp. Pengiriman akan diatur
        bersama UMKM melalui ekspedisi.
      </p>

      <div className="mt-4 space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 border-b border-coffee-100 py-2">
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-coffee-800">{p.name}</div>
              <div className="text-xs text-coffee-600">{rupiah(p.price)} • stok {p.stock}</div>
            </div>
            <input
              type="number"
              min={0}
              max={p.stock}
              value={qty[p.id] ?? 0}
              onChange={(e) => setQty({ ...qty, [p.id]: Math.max(0, Number(e.target.value) || 0) })}
              className="w-20 rounded-md border border-coffee-300 px-2 py-1 text-right"
              disabled={p.stock === 0}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <input
          required
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          placeholder="Nama lengkap"
          className="rounded-md border border-coffee-300 px-3 py-2"
        />
        <input
          required
          value={buyerPhone}
          onChange={(e) => setBuyerPhone(e.target.value)}
          placeholder="No. HP / WhatsApp"
          className="rounded-md border border-coffee-300 px-3 py-2"
        />
        <textarea
          required
          value={buyerAddress}
          onChange={(e) => setBuyerAddress(e.target.value)}
          placeholder="Alamat pengiriman lengkap"
          className="rounded-md border border-coffee-300 px-3 py-2 sm:col-span-2"
          rows={2}
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Catatan tambahan (opsional)"
          className="rounded-md border border-coffee-300 px-3 py-2 sm:col-span-2"
          rows={2}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-coffee-800">
          Total: <span className="text-xl font-bold">{rupiah(total)}</span>
        </div>
        <button
          type="submit"
          disabled={submitting || lines.length === 0}
          className="rounded-md bg-green-600 px-5 py-2.5 font-medium text-white shadow hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Mengirim…" : "Pesan via WhatsApp"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
    </form>
  );
}
