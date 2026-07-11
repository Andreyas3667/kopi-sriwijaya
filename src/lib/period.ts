// Centralised period parsing so admin & UMKM dashboards and exporters all
// agree on the date window. Parses preset shortcuts ("month", "year", "12m",
// "ytd", "all") and custom from/to dates.

export type Period = {
  from: Date;
  to: Date;
  label: string;
  preset: string;
};

export const PRESETS = [
  { value: "month",  label: "Bulan ini" },
  { value: "3m",     label: "3 bulan" },
  { value: "6m",     label: "6 bulan" },
  { value: "12m",    label: "12 bulan" },
  { value: "ytd",    label: "Tahun ini" },
  { value: "year",   label: "1 tahun terakhir" },
  { value: "2y",     label: "2 tahun" },
  { value: "all",    label: "Semua" },
  { value: "custom", label: "Kustom…" },
] as const;

export function parsePeriod(searchParams: {
  preset?: string;
  from?: string;
  to?: string;
}): Period {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const preset = searchParams.preset ?? "12m";

  if (preset === "custom" && searchParams.from && searchParams.to) {
    return {
      preset,
      from: new Date(searchParams.from + "T00:00:00"),
      to: new Date(searchParams.to + "T23:59:59"),
      label: `${searchParams.from} → ${searchParams.to}`,
    };
  }

  if (preset === "all") {
    return { preset, from: new Date(2000, 0, 1), to: today, label: "Semua periode" };
  }

  const start = new Date(today);
  start.setHours(0, 0, 0, 0);

  switch (preset) {
    case "month":
      start.setDate(1);
      return { preset, from: start, to: today, label: "Bulan ini" };
    case "3m":
      start.setMonth(start.getMonth() - 3);
      return { preset, from: start, to: today, label: "3 bulan terakhir" };
    case "6m":
      start.setMonth(start.getMonth() - 6);
      return { preset, from: start, to: today, label: "6 bulan terakhir" };
    case "ytd":
      start.setMonth(0); start.setDate(1);
      return { preset, from: start, to: today, label: `Tahun ${start.getFullYear()}` };
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      return { preset, from: start, to: today, label: "1 tahun terakhir" };
    case "2y":
      start.setFullYear(start.getFullYear() - 2);
      return { preset, from: start, to: today, label: "2 tahun terakhir" };
    case "12m":
    default:
      start.setMonth(start.getMonth() - 12);
      return { preset: "12m", from: start, to: today, label: "12 bulan terakhir" };
  }
}

export function monthBuckets(from: Date, to: Date): { key: string; label: string; start: Date; end: Date }[] {
  const buckets: { key: string; label: string; start: Date; end: Date }[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);
  while (cursor <= end) {
    const start = new Date(cursor);
    const next = new Date(cursor); next.setMonth(next.getMonth() + 1);
    buckets.push({
      key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
      label: start.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      start,
      end: new Date(next.getTime() - 1),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return buckets;
}
