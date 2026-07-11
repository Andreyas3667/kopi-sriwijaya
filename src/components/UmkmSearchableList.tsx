"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type UmkmListItem = {
  id: number;
  name: string;
  address: string;
  region: { name: string };
  productCount: number;
};

export function UmkmSearchableList({
  umkms,
  regions,
}: {
  umkms: UmkmListItem[];
  regions: string[];
}) {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return umkms.filter((u) => {
      if (region && u.region.name !== region) return false;
      if (!needle) return true;
      return (
        u.name.toLowerCase().includes(needle) ||
        u.address.toLowerCase().includes(needle) ||
        u.region.name.toLowerCase().includes(needle)
      );
    });
  }, [umkms, q, region]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari UMKM, alamat, atau wilayah…"
          className="flex-1 rounded-md border border-coffee-300 bg-white px-3 py-2"
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-md border border-coffee-300 bg-white px-3 py-2"
        >
          <option value="">Semua wilayah</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="mb-2 text-sm text-coffee-600">
        Menampilkan {filtered.length} dari {umkms.length} UMKM
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <p className="col-span-full rounded-xl border border-coffee-200 bg-white p-6 text-center text-coffee-500">
            Tidak ada UMKM yang cocok.
          </p>
        )}
        {filtered.map((u) => (
          <Link
            key={u.id}
            href={`/umkm/${u.id}`}
            className="block rounded-xl border border-coffee-200 bg-white p-4 shadow-sm transition hover:border-coffee-400 hover:shadow"
          >
            <div className="text-lg font-semibold text-coffee-800">{u.name}</div>
            <div className="mt-1 text-sm text-coffee-700">{u.address}</div>
            <div className="mt-2 text-xs uppercase tracking-wide text-coffee-500">
              {u.region.name} • {u.productCount} produk
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
