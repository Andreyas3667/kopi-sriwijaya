import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { Role } from "./enums";

export async function requireUmkmOwner() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.UMKM) redirect("/login");

  const umkm = await prisma.umkm.findUnique({
    where: { ownerId: session.user.id },
    include: { region: true },
  });
  if (!umkm) {
    // Account exists but no UMKM record — Dinas needs to provision it.
    redirect("/dashboard/profile?missing=1");
  }
  return { user: session.user, umkm };
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) redirect("/login");
  return session.user;
}
