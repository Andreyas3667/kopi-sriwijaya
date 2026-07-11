"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewsRowActions({ id, published }: { id: number; published: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePublish() {
    setBusy(true);
    const res = await fetch(`/api/news/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Gagal mengubah status.");
  }

  async function remove() {
    if (!confirm("Hapus berita ini?")) return;
    setBusy(true);
    const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Gagal menghapus.");
  }

  return (
    <span className="space-x-2">
      <button onClick={togglePublish} disabled={busy} className="text-coffee-700 underline disabled:opacity-50">
        {published ? "Sembunyikan" : "Terbitkan"}
      </button>
      <button onClick={remove} disabled={busy} className="text-red-700 underline disabled:opacity-50">
        Hapus
      </button>
    </span>
  );
}
