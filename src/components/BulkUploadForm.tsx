"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Result = { row: number; ok: boolean; message: string };
type Summary = { total: number; success: number; failed: number; results: Result[] };

export function BulkUploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) { setError("Pilih file CSV terlebih dahulu."); return; }

    setError(null); setSummary(null); setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/umkm/bulk", { method: "POST", body: fd });
    setBusy(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Gagal mengunggah.");
      return;
    }
    setSummary(await res.json());
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-coffee-200 bg-white p-4">
      <label className="block text-sm font-medium text-coffee-700">Pilih file CSV</label>
      <input ref={inputRef} type="file" accept=".csv,text/csv"
        className="mt-2 block w-full text-sm text-coffee-700 file:mr-3 file:rounded-md file:border-0 file:bg-coffee-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-coffee-800" />

      <button disabled={busy}
        className="mt-3 rounded-md bg-coffee-700 px-4 py-2 font-medium text-white hover:bg-coffee-800 disabled:opacity-50">
        {busy ? "Mengunggah…" : "Upload & Proses"}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {summary && (
        <div className="mt-4 space-y-2">
          <div className="rounded-md bg-coffee-100 px-3 py-2 text-sm text-coffee-800">
            Diproses: <strong>{summary.total}</strong> baris •
            Berhasil: <strong className="text-green-700">{summary.success}</strong> •
            Gagal: <strong className="text-red-700">{summary.failed}</strong>
          </div>
          <ul className="max-h-72 overflow-y-auto rounded-md border border-coffee-200 text-sm">
            {summary.results.map((r) => (
              <li key={r.row}
                className={`border-b border-coffee-100 px-3 py-1.5 ${r.ok ? "" : "bg-red-50 text-red-800"}`}>
                <span className="font-mono text-xs text-coffee-500">baris {r.row}:</span> {r.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
