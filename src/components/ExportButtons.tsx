"use client";

import { useSearchParams } from "next/navigation";

export function ExportButtons({ basePath }: { basePath: string }) {
  const params = useSearchParams();
  const qs = params.toString();
  const make = (fmt: string) => `${basePath}/${fmt}${qs ? `?${qs}` : ""}`;
  return (
    <div className="flex gap-2">
      <a href={make("pdf")}
        className="rounded-md border border-coffee-300 px-3 py-1.5 text-sm text-coffee-800 hover:bg-coffee-100">
        Export PDF
      </a>
      <a href={make("xlsx")}
        className="rounded-md border border-coffee-300 px-3 py-1.5 text-sm text-coffee-800 hover:bg-coffee-100">
        Export Excel
      </a>
      <a href={make("csv")}
        className="rounded-md border border-coffee-300 px-3 py-1.5 text-sm text-coffee-800 hover:bg-coffee-100">
        CSV
      </a>
    </div>
  );
}
