import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";
import { UmkmProfileForm } from "@/components/UmkmProfileForm";

export const dynamic = "force-dynamic";

export default async function UmkmProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.UMKM) redirect("/login");

  const umkm = await prisma.umkm.findUnique({
    where: { ownerId: session.user.id },
    include: { region: true },
  });

  const regions = await prisma.region.findMany({ orderBy: { name: "asc" } });

  if (!umkm) {
    return (
      <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-6">
        <h1 className="text-xl font-bold text-yellow-900">UMKM belum terdaftar</h1>
        <p className="mt-2 text-yellow-900">
          Akun Anda belum terhubung dengan data UMKM. Silakan hubungi Dinas Operasi UKM untuk
          melengkapi pendaftaran.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-coffee-800">Profil UMKM</h1>
      <p className="mt-1 text-sm text-coffee-600">
        Lengkapi profil agar pembeli dapat menemukan dan menghubungi Anda.
      </p>
      <div className="mt-6">
        <UmkmProfileForm
          umkm={{
            id: umkm.id,
            name: umkm.name,
            description: umkm.description ?? "",
            address: umkm.address,
            whatsapp: umkm.whatsapp,
            latitude: umkm.latitude,
            longitude: umkm.longitude,
            regionId: umkm.regionId,
            photoUrl: umkm.photoUrl ?? "",
          }}
          regions={regions.map((r) => ({ id: r.id, name: r.name }))}
        />
      </div>
    </div>
  );
}
