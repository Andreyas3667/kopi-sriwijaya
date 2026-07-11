import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { resolveExportScope, buildOrderWhere } from "@/lib/exportScope";
import { formatDate } from "@/lib/format";

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

  const wb = new ExcelJS.Workbook();
  wb.creator = "Kopi Sriwijaya";
  wb.created = new Date();

  const ws = wb.addWorksheet("Laporan Penjualan");
  ws.mergeCells("A1:K1");
  ws.getCell("A1").value = `Laporan Penjualan — ${scope.ownerName}`;
  ws.getCell("A1").font = { size: 14, bold: true };

  ws.mergeCells("A2:K2");
  ws.getCell("A2").value =
    `Periode: ${formatDate(scope.period.from)} – ${formatDate(scope.period.to)}` +
    (scope.status ? ` • Status: ${scope.status}` : "");

  const headerRow = ws.addRow([]);
  ws.addRow([
    "ID Pesanan", "Tanggal", "Wilayah", "UMKM", "Pembeli",
    "Produk", "Jumlah", "Harga Satuan", "Subtotal", "Total Pesanan", "Status",
  ]).font = { bold: true };
  headerRow.height = 6; // visual spacer above bold header

  for (const o of orders) {
    for (const i of o.items) {
      ws.addRow([
        o.id,
        o.orderedAt,
        o.umkm.region.name,
        o.umkm.name,
        o.buyer.name,
        i.product.name,
        i.quantity,
        i.unitPrice,
        i.quantity * i.unitPrice,
        o.total,
        o.status,
      ]);
    }
  }

  ws.columns.forEach((col, idx) => {
    col.width = [10, 18, 14, 24, 22, 28, 8, 14, 14, 14, 12][idx] ?? 14;
  });
  ws.getColumn(2).numFmt = "yyyy-mm-dd hh:mm";
  for (const c of [8, 9, 10]) {
    ws.getColumn(c).numFmt = '"Rp"#,##0';
  }

  // Summary sheet
  const summary = wb.addWorksheet("Ringkasan");
  summary.addRow(["Total pesanan", orders.length]);
  summary.addRow(["Pesanan selesai", orders.filter((o) => o.status === "COMPLETED").length]);
  summary.addRow(["Pendapatan selesai (Rp)",
    orders.filter((o) => o.status === "COMPLETED").reduce((s, o) => s + o.total, 0)]);
  summary.getColumn(1).width = 30;
  summary.getColumn(2).width = 20;
  summary.getColumn(2).numFmt = "#,##0";

  const buffer = await wb.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan-penjualan-${Date.now()}.xlsx"`,
    },
  });
}
