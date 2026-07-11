"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUpload } from "./ImageUpload";

type NewsDraft = {
  id?: number;
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  published: boolean;
};

export function NewsForm({
  mode,
  post,
}: {
  mode: "create" | "edit";
  post?: NewsDraft;
}) {
  const router = useRouter();
  const [form, setForm] = useState<NewsDraft>(
    post ?? { title: "", excerpt: "", content: "", coverUrl: "", published: true }
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof NewsDraft>(key: K, value: NewsDraft[K]) {
    setForm({ ...form, [key]: value });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const url = mode === "create" ? "/api/news" : `/api/news/${post!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/admin/news");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Gagal menyimpan.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input required value={form.title} onChange={(e) => set("title", e.target.value)}
        placeholder="Judul"
        className="w-full rounded-md border border-coffee-300 px-3 py-2 text-lg font-medium" />
      <ImageUpload value={form.coverUrl} onChange={(v) => set("coverUrl", v)}
        label="Cover Berita" hint="Direkomendasikan rasio 16:9 (mis. 1280×720)." />
      <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)}
        placeholder="Ringkasan (1–2 kalimat untuk preview)" rows={2}
        className="w-full rounded-md border border-coffee-300 px-3 py-2" />
      <textarea required value={form.content} onChange={(e) => set("content", e.target.value)}
        placeholder="Isi berita…" rows={12}
        className="w-full rounded-md border border-coffee-300 px-3 py-2 font-serif" />

      <label className="flex items-center gap-2 text-sm text-coffee-700">
        <input type="checkbox" checked={form.published}
          onChange={(e) => set("published", e.target.checked)} />
        Terbitkan sekarang (uncheck untuk menyimpan sebagai draf)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button disabled={busy}
        className="rounded-md bg-coffee-700 px-4 py-2 font-medium text-white hover:bg-coffee-800 disabled:opacity-50">
        {busy ? "Menyimpan…" : mode === "create" ? "Simpan Berita" : "Update Berita"}
      </button>
    </form>
  );
}
