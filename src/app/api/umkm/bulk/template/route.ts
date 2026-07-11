import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/enums";

const HEADER = [
  "nama_usaha","owner_nama","owner_email","owner_password",
  "alamat","whatsapp","latitude","longitude","wilayah","deskripsi",
];

const SAMPLE = [
  [
    "Kopi Contoh Lahat","Pak Budi","budi@contoh.id","password123",
    "Jl. Mawar No.10, Lahat","6281200000001","-3.7859","103.5430","Lahat","Kopi rakyat dari koperasi.",
  ],
  [
    "Kopi Contoh Pagaralam","Bu Sari","sari@contoh.id","password123",
    "Jl. Melati No.5, Pagaralam","6281200000002","-4.0218","103.2480","Pagaralam","Arabika dataran tinggi.",
  ],
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return new Response("Forbidden", { status: 403 });
  }
  const csv = [HEADER, ...SAMPLE].map((row) =>
    row.map((v) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v).join(",")
  ).join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="template-umkm.csv"',
    },
  });
}
