"use client";

import { useRef, useState } from "react";

export function ImageUpload({
  value,
  onChange,
  label = "Gambar",
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setBusy(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Gagal mengunggah.");
      return;
    }
    const { url } = await res.json();
    onChange(url);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-coffee-700">{label}</label>
      {hint && <p className="text-xs text-coffee-600">{hint}</p>}

      {value && (
        <div className="flex items-start gap-3 rounded-md border border-coffee-200 bg-coffee-50 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-20 w-20 rounded-md object-cover" />
          <div className="min-w-0 flex-1 text-xs">
            <div className="break-all text-coffee-700">{value}</div>
            <button type="button"
              onClick={() => onChange("")}
              className="mt-1 text-red-700 underline">
              Hapus
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile}
          className="block w-full text-sm text-coffee-700 file:mr-3 file:rounded-md file:border-0 file:bg-coffee-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-coffee-800" />
        {busy && <span className="text-xs text-coffee-500">Mengunggah…</span>}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="atau tempel URL gambar (https://…)"
        className="w-full rounded-md border border-coffee-300 px-3 py-1.5 text-sm"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
