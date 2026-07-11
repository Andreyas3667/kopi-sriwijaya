"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm({ ...form, [key]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Gagal mendaftar.");
      setLoading(false);
      return;
    }
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-coffee-800">Daftar Akun Pembeli</h1>
      <p className="mt-1 text-sm text-coffee-600">
        UMKM didaftarkan oleh Dinas. Halaman ini untuk pembeli yang ingin menyimpan riwayat pesanan.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input required placeholder="Nama lengkap" value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full rounded-md border border-coffee-300 px-3 py-2" />
        <input required type="email" placeholder="Email" value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className="w-full rounded-md border border-coffee-300 px-3 py-2" />
        <input required type="password" placeholder="Password (min. 6 karakter)" value={form.password}
          onChange={(e) => set("password", e.target.value)}
          className="w-full rounded-md border border-coffee-300 px-3 py-2" />
        <input placeholder="No. HP / WhatsApp" value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          className="w-full rounded-md border border-coffee-300 px-3 py-2" />
        <textarea placeholder="Alamat pengiriman" value={form.address}
          onChange={(e) => set("address", e.target.value)} rows={2}
          className="w-full rounded-md border border-coffee-300 px-3 py-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading}
          className="w-full rounded-md bg-coffee-700 px-4 py-2 font-medium text-white hover:bg-coffee-800 disabled:opacity-50">
          {loading ? "Memproses…" : "Daftar"}
        </button>
      </form>
    </div>
  );
}
