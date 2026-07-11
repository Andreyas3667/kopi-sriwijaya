"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserRowActions({ id, role }: { id: number; role: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function resetPassword() {
    const next = prompt("Masukkan password baru untuk pengguna ini:");
    if (!next) return;
    if (next.length < 6) { alert("Password minimal 6 karakter."); return; }
    setBusy(true);
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: next }),
    });
    setBusy(false);
    if (res.ok) alert("Password diperbarui.");
    else alert("Gagal memperbarui password.");
  }

  async function changeRole() {
    const next = prompt(`Role saat ini: ${role}. Ganti ke (ADMIN / UMKM / BUYER):`);
    if (!next) return;
    const upper = next.toUpperCase();
    if (!["ADMIN", "UMKM", "BUYER"].includes(upper)) { alert("Role tidak valid."); return; }
    setBusy(true);
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: upper }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const body = await res.json().catch(() => ({}));
      alert(body.error ?? "Gagal mengubah role.");
    }
  }

  async function remove() {
    if (!confirm("Hapus pengguna ini? Tidak bisa dihapus jika masih punya UMKM atau pesanan.")) return;
    setBusy(true);
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const body = await res.json().catch(() => ({}));
      alert(body.error ?? "Gagal menghapus.");
    }
  }

  return (
    <span className="space-x-2">
      <button onClick={resetPassword} disabled={busy} className="text-coffee-700 underline disabled:opacity-50">
        Reset password
      </button>
      <button onClick={changeRole} disabled={busy} className="text-coffee-700 underline disabled:opacity-50">
        Ganti role
      </button>
      <button onClick={remove} disabled={busy} className="text-red-700 underline disabled:opacity-50">
        Hapus
      </button>
    </span>
  );
}
