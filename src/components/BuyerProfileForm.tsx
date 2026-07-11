"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BuyerProfileForm({
  user,
}: {
  user: { name: string; email: string; phone: string; address: string };
}) {
  const router = useRouter();
  const [form, setForm] = useState(user);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm({ ...form, [key]: value });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      setMsg("Profil tersimpan.");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setMsg(body.error ?? "Gagal menyimpan.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input required value={form.name} onChange={(e) => set("name", e.target.value)}
        placeholder="Nama lengkap"
        className="w-full rounded-md border border-coffee-300 px-3 py-2" />
      <input value={form.email} disabled
        className="w-full rounded-md border border-coffee-300 bg-coffee-100 px-3 py-2" />
      <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
        placeholder="No. HP / WhatsApp"
        className="w-full rounded-md border border-coffee-300 px-3 py-2" />
      <textarea value={form.address} onChange={(e) => set("address", e.target.value)}
        placeholder="Alamat pengiriman" rows={3}
        className="w-full rounded-md border border-coffee-300 px-3 py-2" />

      {msg && <p className="text-sm text-coffee-700">{msg}</p>}

      <button disabled={busy}
        className="rounded-md bg-coffee-700 px-4 py-2 font-medium text-white hover:bg-coffee-800 disabled:opacity-50">
        {busy ? "Menyimpan…" : "Simpan"}
      </button>
    </form>
  );
}
