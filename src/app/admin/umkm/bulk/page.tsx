import { requireAdmin } from "@/lib/dashboard";
import { BulkUploadForm } from "@/components/BulkUploadForm";
import { prisma } from "@/lib/prisma";

export default async function BulkUmkmPage() {
  await requireAdmin();
  const regions = await prisma.region.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-coffee-800">Bulk Tambah UMKM</h1>
      <p className="mt-1 text-sm text-coffee-600">
        Upload file CSV untuk menambahkan banyak UMKM sekaligus. Setiap baris membuat akun
        pemilik (role UMKM) sekaligus profil UMKM.
      </p>

      <section className="mt-6 rounded-xl border border-coffee-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-coffee-800">Format CSV</h2>
        <p className="mt-1 text-sm text-coffee-700">
          Header pada baris pertama. Kolom wajib:
          <code className="mx-1 rounded bg-coffee-100 px-1.5 py-0.5">nama_usaha, owner_nama, owner_email, owner_password, alamat, whatsapp, latitude, longitude, wilayah</code>
          Kolom opsional: <code className="rounded bg-coffee-100 px-1.5 py-0.5">deskripsi</code>.
        </p>
        <p className="mt-2 text-sm text-coffee-700">
          Nilai <strong>wilayah</strong> harus salah satu dari yang sudah terdaftar:
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {regions.map((r) => (
            <span key={r.id} className="rounded-full bg-coffee-100 px-2 py-0.5 text-xs text-coffee-800">
              {r.name}
            </span>
          ))}
        </div>
        <a href="/api/umkm/bulk/template"
          className="mt-3 inline-block rounded-md border border-coffee-300 px-3 py-1.5 text-sm text-coffee-800 hover:bg-coffee-100">
          ⬇ Download template CSV
        </a>
      </section>

      <section className="mt-6">
        <BulkUploadForm />
      </section>
    </div>
  );
}
