import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUmkmOwner } from "@/lib/dashboard";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { umkm } = await requireUmkmOwner();
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product || product.umkmId !== umkm.id) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-coffee-800">Edit Produk</h1>
      <div className="mt-6">
        <ProductForm
          mode="edit"
          product={{
            id: product.id,
            name: product.name,
            description: product.description ?? "",
            price: product.price,
            stock: product.stock,
            imageUrl: product.imageUrl ?? "",
            variety: product.variety ?? "",
            processing: product.processing ?? "",
            roastLevel: product.roastLevel ?? "",
            flavorNotes: product.flavorNotes ?? "",
            weightGram: product.weightGram ?? "",
          }}
        />
      </div>
    </div>
  );
}
