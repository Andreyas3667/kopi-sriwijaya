import { requireAdmin } from "@/lib/dashboard";
import { NewsForm } from "@/components/NewsForm";

export default async function NewNewsPage() {
  await requireAdmin();
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-coffee-800">Tulis Berita</h1>
      <p className="mt-1 text-sm text-coffee-600">
        Slug akan dibuat otomatis dari judul. Konten mendukung baris baru biasa.
      </p>
      <div className="mt-6">
        <NewsForm mode="create" />
      </div>
    </div>
  );
}
