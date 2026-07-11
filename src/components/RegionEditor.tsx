"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Row = { id: number; name: string; description: string; umkmCount: number };

export function RegionEditor({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [rows] = useState(initial);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/regions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: desc }),
    });
    setBusy(false);
    if (res.ok) {
      setName(""); setDesc("");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      alert(body.error ?? "Gagal menambah wilayah.");
    }
  }

  async function remove(id: number) {
    if (!confirm("Hapus wilayah ini? Tidak bisa dihapus jika masih ada UMKM di dalamnya.")) return;
    const res = await fetch(`/api/regions/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else {
      const body = await res.json().catch(() => ({}));
      alert(body.error ?? "Gagal menghapus.");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="rounded-xl border border-coffee-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-coffee-500">Tambah Wilayah</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input required placeholder="Nama wilayah" value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border border-coffee-300 px-3 py-2" />
          <input placeholder="Deskripsi (opsional)" value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="flex-1 rounded-md border border-coffee-300 px-3 py-2" />
          <button disabled={busy}
            className="rounded-md bg-coffee-700 px-4 py-2 font-medium text-white hover:bg-coffee-800 disabled:opacity-50">
            Tambah
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-coffee-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-coffee-100 text-left text-coffee-700">
            <tr>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Deskripsi</th>
              <th className="px-3 py-2">UMKM</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-coffee-100">
                <td className="px-3 py-2 font-medium text-coffee-800">{r.name}</td>
                <td className="px-3 py-2 text-coffee-700">{r.description}</td>
                <td className="px-3 py-2">{r.umkmCount}</td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => remove(r.id)} className="text-red-700 underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
