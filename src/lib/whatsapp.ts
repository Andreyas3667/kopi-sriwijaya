import { rupiah } from "./format";

export type OrderLine = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type OrderDraft = {
  umkmName: string;
  buyerName?: string;
  buyerAddress?: string;
  buyerPhone?: string;
  lines: OrderLine[];
  note?: string;
};

// Builds the wa.me link the buyer is redirected to after submitting the order form.
// The UMKM receives a pre-filled message they can confirm and arrange shipping for.
export function buildWhatsAppOrderUrl(whatsapp: string, draft: OrderDraft): string {
  const total = draft.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  const lines = [
    `Halo ${draft.umkmName}, saya ingin memesan kopi berikut:`,
    "",
    ...draft.lines.map(
      (l) => `• ${l.name} — ${l.quantity} x ${rupiah(l.unitPrice)} = ${rupiah(l.quantity * l.unitPrice)}`
    ),
    "",
    `Total: ${rupiah(total)}`,
  ];

  if (draft.buyerName)    lines.push("", `Nama: ${draft.buyerName}`);
  if (draft.buyerPhone)   lines.push(`No. HP: ${draft.buyerPhone}`);
  if (draft.buyerAddress) lines.push(`Alamat kirim: ${draft.buyerAddress}`);
  if (draft.note)         lines.push("", `Catatan: ${draft.note}`);

  lines.push("", "Mohon info ekspedisi & total ongkir. Terima kasih.");

  const phone = whatsapp.replace(/[^0-9]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
