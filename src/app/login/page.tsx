"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) {
      router.push(callbackUrl);
      router.refresh();
    } else {
      setError("Email atau password salah.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-coffee-800">Masuk</h1>
      <p className="mt-1 text-sm text-coffee-600">
        Login untuk admin dan UMKM. Pembeli tidak perlu login untuk memesan.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-md border border-coffee-300 px-3 py-2"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-md border border-coffee-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-md bg-coffee-700 px-4 py-2 font-medium text-white hover:bg-coffee-800 disabled:opacity-50"
        >
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>

      <p className="mt-4 text-sm text-coffee-700">
        Belum punya akun? <Link href="/register" className="text-coffee-800 underline">Daftar di sini</Link>
      </p>

      <div className="mt-6 rounded-md bg-coffee-100 p-3 text-xs text-coffee-700">
        <strong>Demo akun:</strong>
        <br />admin@kopi.id / password (Admin)
        <br />sriwijaya@kopi.id / password (UMKM)
      </div>
    </div>
  );
}
