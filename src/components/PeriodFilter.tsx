"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PRESETS } from "@/lib/period";

export function PeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const preset = params.get("preset") ?? "12m";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";

  function update(next: { preset?: string; from?: string; to?: string }) {
    const sp = new URLSearchParams(params.toString());
    if (next.preset !== undefined) sp.set("preset", next.preset);
    if (next.from !== undefined) sp.set("from", next.from);
    if (next.to !== undefined) sp.set("to", next.to);
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-coffee-200 bg-white p-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-coffee-500">Periode</span>
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => update({ preset: p.value })}
            className={`rounded-md px-2.5 py-1 text-xs ${
              preset === p.value
                ? "bg-coffee-700 text-white"
                : "bg-coffee-100 text-coffee-800 hover:bg-coffee-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => update({ from: e.target.value })}
            className="rounded-md border border-coffee-300 px-2 py-1 text-sm"
          />
          <span className="text-coffee-500">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => update({ to: e.target.value })}
            className="rounded-md border border-coffee-300 px-2 py-1 text-sm"
          />
        </div>
      )}
    </div>
  );
}
