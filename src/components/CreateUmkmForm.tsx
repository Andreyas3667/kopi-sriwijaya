"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateUmkmForm({ regions }: { regions: { id: number; name: string }[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    name: "",
    description: "",
    address: "",
    whatsapp: "",
    latitude: -3.0,
    longitude: 104.0,
    regionId: regions[0]?.id ?? 0,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm({ ...form, [key]: value });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/umkm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/admin/umkm");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Gagal menyimpan.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-coffee-500">Akun Pemilik</h2>
      <input required placeholder="Nama pemilik" value={form.ownerName}
        onChange={(e) => set("ownerName", e.target.value)}
        className="w-full rounded-md border border-coffee-300 px-3 py-2" />
      <input required type="email" placeholder="Email login" value={form.ownerEmail}
        onChange={(e) => set("ownerEmail", e.target.value)}
        className="w-full rounded-md border border-coffee-300 px-3 py-2" />
      <input required type="password" placeholder="Password awal" value={form.ownerPassword}
        onChange={(e) => set("ownerPassword", e.target.value)}
        className="w-full rounded-md border border-coffee-300 px-3 py-2" />

      <h2 className="pt-4 text-sm font-semibold uppercase tracking-wider text-coffee-500">Profil UMKM</h2>
      <input required placeholder="Nama usaha" value={form.name}
        onChange={(e) => set("name", e.target.value)}
        className="w-full rounded-md border border-coffee-300 px-3 py-2" />
      <textarea placeholder="Deskripsi" value={form.description}
        onChange={(e) => set("description", e.target.value)} rows={3}
        className="w-full rounded-md border border-coffee-300 px-3 py-2" />
      <textarea required placeholder="Alamat" value={form.address}
        onChange={(e) => set("address", e.target.value)} rows={2}
        className="w-full rounded-md border border-coffee-300 px-3 py-2" />
      <input required placeholder="No. WhatsApp (cth: 6281234567890)" value={form.whatsapp}
        onChange={(e) => set("whatsapp", e.target.value)}
        className="w-full rounded-md border border-coffee-300 px-3 py-2" />

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col text-sm text-coffee-700">
          Latitude
          <input required type="number" step="any" value={form.latitude}
            onChange={(e) => set("latitude", Number(e.target.value))}
            className="mt-1 rounded-md border border-coffee-300 px-3 py-2" />
        </label>
        <label className="flex flex-col text-sm text-coffee-700">
          Longitude
          <input required type="number" step="any" value={form.longitude}
            onChange={(e) => set("longitude", Number(e.target.value))}
            className="mt-1 rounded-md border border-coffee-300 px-3 py-2" />
        </label>
      </div>

      <label className="flex flex-col text-sm text-coffee-700">
        Wilayah
        <select required value={form.regionId}
          onChange={(e) => set("regionId", Number(e.target.value))}
          className="mt-1 rounded-md border border-coffee-300 px-3 py-2">
          {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy}
        className="rounded-md bg-coffee-700 px-4 py-2 font-medium text-white hover:bg-coffee-800 disabled:opacity-50">
        {busy ? "Menyimpan…" : "Simpan UMKM"}
      </button>
    </form>
  );
}
