"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "./ImageUpload";

type ProductDraft = {
  id?: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  variety: string;
  processing: string;
  roastLevel: string;
  flavorNotes: string;
  weightGram: number | "";
};

const VARIETIES = ["", "Arabika", "Robusta", "Liberika", "Excelsa", "Blend"];
const PROCESSES = ["", "Natural", "Honey", "Washed", "Wine", "Anaerobic", "Wet-hulled"];
const ROASTS    = ["", "Light", "Medium-Light", "Medium", "Medium-Dark", "Dark"];

export function ProductForm({
  mode,
  product,
}: {
  mode: "create" | "edit";
  product?: ProductDraft;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductDraft>(
    product ?? {
      name: "", description: "", price: 0, stock: 0, imageUrl: "",
      variety: "", processing: "", roastLevel: "", flavorNotes: "", weightGram: "",
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setForm({ ...form, [key]: value });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = mode === "create" ? "/api/products" : `/api/products/${product!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const payload = {
      ...form,
      weightGram: form.weightGram === "" ? null : Number(form.weightGram),
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/dashboard/produk");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Gagal menyimpan produk.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        required
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Nama produk"
        className="w-full rounded-md border border-coffee-300 px-3 py-2"
      />
      <textarea
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="Deskripsi"
        rows={3}
        className="w-full rounded-md border border-coffee-300 px-3 py-2"
      />
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col text-sm text-coffee-700">
          Harga (Rp)
          <input required type="number" min={0} value={form.price}
            onChange={(e) => set("price", Number(e.target.value))}
            className="mt-1 rounded-md border border-coffee-300 px-3 py-2" />
        </label>
        <label className="flex flex-col text-sm text-coffee-700">
          Stok
          <input required type="number" min={0} value={form.stock}
            onChange={(e) => set("stock", Number(e.target.value))}
            className="mt-1 rounded-md border border-coffee-300 px-3 py-2" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col text-sm text-coffee-700">
          Varietas
          <select value={form.variety} onChange={(e) => set("variety", e.target.value)}
            className="mt-1 rounded-md border border-coffee-300 px-3 py-2">
            {VARIETIES.map((v) => <option key={v} value={v}>{v || "—"}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-sm text-coffee-700">
          Proses
          <select value={form.processing} onChange={(e) => set("processing", e.target.value)}
            className="mt-1 rounded-md border border-coffee-300 px-3 py-2">
            {PROCESSES.map((v) => <option key={v} value={v}>{v || "—"}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-sm text-coffee-700">
          Tingkat Sangrai
          <select value={form.roastLevel} onChange={(e) => set("roastLevel", e.target.value)}
            className="mt-1 rounded-md border border-coffee-300 px-3 py-2">
            {ROASTS.map((v) => <option key={v} value={v}>{v || "—"}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-sm text-coffee-700">
          Berat (gram)
          <input type="number" min={0} value={form.weightGram}
            onChange={(e) => set("weightGram", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="200, 250, 500…"
            className="mt-1 rounded-md border border-coffee-300 px-3 py-2" />
        </label>
      </div>

      <label className="flex flex-col text-sm text-coffee-700">
        Catatan Aroma (pisahkan dengan koma)
        <input value={form.flavorNotes} onChange={(e) => set("flavorNotes", e.target.value)}
          placeholder="cokelat, karamel, citrus, bunga"
          className="mt-1 rounded-md border border-coffee-300 px-3 py-2" />
      </label>

      <ImageUpload
        value={form.imageUrl}
        onChange={(url) => set("imageUrl", url)}
        label="Foto Produk"
        hint="Foto kemasan / biji kopi. Upload langsung atau tempel URL."
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        disabled={loading}
        className="rounded-md bg-coffee-700 px-4 py-2 font-medium text-white hover:bg-coffee-800 disabled:opacity-50"
      >
        {loading ? "Menyimpan…" : mode === "create" ? "Simpan Produk" : "Update Produk"}
      </button>
    </form>
  );
}
