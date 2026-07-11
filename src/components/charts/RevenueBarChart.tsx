"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { rupiah } from "@/lib/format";

export type RevenuePoint = { label: string; revenue: number; orders: number };

export function RevenueBarChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2cfb1" />
          <XAxis dataKey="label" stroke="#6b4530" fontSize={11} />
          <YAxis stroke="#6b4530" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            cursor={{ fill: "rgba(107,69,48,0.08)" }}
            contentStyle={{ borderColor: "#cdac80", borderRadius: 8, fontSize: 12 }}
            formatter={(value: number, name) =>
              name === "revenue" ? [rupiah(value), "Pendapatan"] : [value, "Pesanan"]
            }
          />
          <Bar dataKey="revenue" fill="#6b4530" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
