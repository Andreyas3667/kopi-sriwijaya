import { ProductForm } from "@/components/ProductForm";
import { requireUmkmOwner } from "@/lib/dashboard";

export default async function NewProductPage() {
  await requireUmkmOwner();
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-coffee-800">Tambah Produk</h1>
      <p className="mt-1 text-sm text-coffee-600">Lengkapi data produk yang akan dijual.</p>
      <div className="mt-6">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
