"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/lib/enums";

const transitions: { value: OrderStatus; label: string; tone: string }[] = [
  { value: "PENDING",   label: "Pending",    tone: "bg-yellow-100 text-yellow-800" },
  { value: "CONFIRMED", label: "Konfirmasi", tone: "bg-blue-100 text-blue-800" },
  { value: "COMPLETED", label: "Selesai",    tone: "bg-green-100 text-green-800" },
  { value: "CANCELLED", label: "Batal",      tone: "bg-red-100 text-red-700" },
];

export function OrderStatusActions({ id, current }: { id: number; current: OrderStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function update(status: OrderStatus) {
    if (status === current) return;
    setBusy(true);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Gagal memperbarui status.");
  }

  return (
    <div className="flex flex-wrap gap-1">
      {transitions.map((t) => (
        <button
          key={t.value}
          onClick={() => update(t.value)}
          disabled={busy || t.value === current}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.tone} ${
            t.value === current ? "ring-2 ring-coffee-700" : "opacity-80 hover:opacity-100"
          } disabled:cursor-not-allowed`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
