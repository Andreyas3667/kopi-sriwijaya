import React from "react";
import {
  Document, Page, Text, View, StyleSheet, renderToBuffer,
} from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { resolveExportScope, buildOrderWhere } from "@/lib/exportScope";
import { formatDate } from "@/lib/format";

export const runtime = "nodejs";

const styles = StyleSheet.create({
  page:    { padding: 32, fontSize: 9, fontFamily: "Helvetica" },
  h1:      { fontSize: 16, fontWeight: 700, marginBottom: 4, color: "#523427" },
  meta:    { fontSize: 9, marginBottom: 12, color: "#6b4530" },
  table:   { display: "flex", flexDirection: "column" },
  trHead:  { flexDirection: "row", borderBottomWidth: 1, borderColor: "#a06f44", paddingBottom: 4, marginBottom: 4 },
  tr:      { flexDirection: "row", borderBottomWidth: 0.5, borderColor: "#e2cfb1", paddingVertical: 3 },
  cell:    { paddingHorizontal: 2 },
  right:   { textAlign: "right" },
  bold:    { fontWeight: 700 },
  total:   { marginTop: 12, fontSize: 11, fontWeight: 700, color: "#523427" },
});

const COLS = [
  { key: "id",      label: "ID",       w: "5%" },
  { key: "date",    label: "Tanggal",  w: "12%" },
  { key: "region",  label: "Wilayah",  w: "12%" },
  { key: "umkm",    label: "UMKM",     w: "15%" },
  { key: "buyer",   label: "Pembeli",  w: "13%" },
  { key: "product", label: "Produk",   w: "20%" },
  { key: "qty",     label: "Qty",      w: "5%",  align: "right" },
  { key: "subtotal",label: "Subtotal", w: "9%",  align: "right" },
  { key: "status",  label: "Status",   w: "9%" },
];

function rp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export async function GET(req: Request) {
  const r = await resolveExportScope(req);
  if ("error" in r) return r.error;
  const scope = r;

  const orders = await prisma.order.findMany({
    where: buildOrderWhere(scope),
    include: {
      umkm: { include: { region: true } },
      buyer: true,
      items: { include: { product: true } },
    },
    orderBy: { orderedAt: "desc" },
  });

  const totalCompleted = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((s, o) => s + o.total, 0);

  const rows = orders.flatMap((o) =>
    o.items.map((i) => ({
      id:       String(o.id),
      date:     formatDate(o.orderedAt),
      region:   o.umkm.region.name,
      umkm:     o.umkm.name,
      buyer:    o.buyer.name,
      product:  i.product.name,
      qty:      String(i.quantity),
      subtotal: rp(i.quantity * i.unitPrice),
      status:   o.status,
    }))
  );

  const doc = React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", orientation: "landscape", style: styles.page },
      React.createElement(Text, { style: styles.h1 }, `Laporan Penjualan — ${scope.ownerName}`),
      React.createElement(
        Text,
        { style: styles.meta },
        `Periode: ${formatDate(scope.period.from)} – ${formatDate(scope.period.to)}` +
          (scope.status ? ` • Status: ${scope.status}` : "") +
          ` • Total pesanan: ${orders.length}`
      ),
      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: styles.trHead },
          ...COLS.map((c) =>
            React.createElement(
              Text,
              {
                key: c.key,
                style: [
                  styles.cell,
                  styles.bold,
                  { width: c.w },
                  c.align === "right" ? styles.right : {},
                ],
              },
              c.label
            )
          )
        ),
        ...rows.map((row, idx) =>
          React.createElement(
            View,
            { key: idx, style: styles.tr },
            ...COLS.map((c) =>
              React.createElement(
                Text,
                {
                  key: c.key,
                  style: [styles.cell, { width: c.w }, c.align === "right" ? styles.right : {}],
                },
                String((row as Record<string, string>)[c.key])
              )
            )
          )
        )
      ),
      React.createElement(Text, { style: styles.total }, `Total Pendapatan Selesai: ${rp(totalCompleted)}`)
    )
  );

  const buffer = await renderToBuffer(doc);
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="laporan-penjualan-${Date.now()}.pdf"`,
    },
  });
}
