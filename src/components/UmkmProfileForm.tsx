"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "./ImageUpload";

type UmkmDraft = {
  id: number;
  name: string;
  description: string;
  address: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  regionId: number;
  photoUrl: string;
};

export function UmkmProfileForm({
  umkm,
  regions,
}: {
  umkm: UmkmDraft;
  regions: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(umkm);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof UmkmDraft>(key: K, value: UmkmDraft[K]) {
    setForm({ ...form, [key]: value });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    const res = await fetch(`/api/umkm/${form.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      setMsg("Profil berhasil diperbarui.");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setMsg(body.error ?? "Gagal menyimpan.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input required value={form.name} onChange={(e) => set("name", e.target.value)}
        placeholder="Nama usaha"
        className="w-full rounded-md border border-coffee-300 px-3 py-2" />
      <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
        placeholder="Deskripsi UMKM" rows={3}
        className="w-full rounded-md border border-coffee-300 px-3 py-2" />
      <textarea required value={form.address} onChange={(e) => set("address", e.target.value)}
        placeholder="Alamat" rows={2}
        className="w-full rounded-md border border-coffee-300 px-3 py-2" />
      <input required value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)}
        placeholder="No. WhatsApp (contoh: 6281234567890)"
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

      <ImageUpload value={form.photoUrl} onChange={(v) => set("photoUrl", v)}
        label="Foto / Logo UMKM" hint="Tampil di halaman detail UMKM." />

      {msg && <p className="text-sm text-coffee-700">{msg}</p>}

      <button disabled={busy}
        className="rounded-md bg-coffee-700 px-4 py-2 font-medium text-white hover:bg-coffee-800 disabled:opacity-50">
        {busy ? "Menyimpan…" : "Simpan"}
      </button>
    </form>
  );
}
