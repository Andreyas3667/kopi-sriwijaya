import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BuyerProfileForm } from "@/components/BuyerProfileForm";

export const dynamic = "force-dynamic";

export default async function BuyerProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/profile");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, address: true, role: true },
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-coffee-800">Profil Saya</h1>
      <p className="mt-1 text-sm text-coffee-600">
        Data ini akan otomatis diisi pada form pemesanan.
      </p>
      <div className="mt-6">
        <BuyerProfileForm
          user={{
            name: user.name,
            email: user.email,
            phone: user.phone ?? "",
            address: user.address ?? "",
          }}
        />
      </div>
    </div>
  );
}
