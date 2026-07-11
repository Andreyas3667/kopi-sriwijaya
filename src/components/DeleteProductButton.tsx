"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProductButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!confirm("Hapus produk ini?")) return;
    setLoading(true);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert("Gagal menghapus produk.");
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="text-red-700 underline disabled:opacity-50"
    >
      {loading ? "Menghapus…" : "Hapus"}
    </button>
  );
}
