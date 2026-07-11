import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { Role } from "./enums";
import { parsePeriod } from "./period";

// Resolves what range of orders the caller is allowed to export, based on their
// role + URL filters. ADMIN can scope by region; UMKM is auto-scoped to their
// own UMKM. BUYER cannot export.

export type ExportScope = {
  scope: "admin" | "umkm";
  umkmId?: number;
  regionId?: number;
  status?: string;
  period: ReturnType<typeof parsePeriod>;
  ownerName: string;
};

export async function resolveExportScope(req: Request): Promise<ExportScope | { error: Response }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: new Response("Unauthorized", { status: 401 }) };
  }

  const url = new URL(req.url);
  const period = parsePeriod({
    preset: url.searchParams.get("preset") ?? undefined,
    from:   url.searchParams.get("from") ?? undefined,
    to:     url.searchParams.get("to") ?? undefined,
  });
  const status = url.searchParams.get("status") ?? undefined;

  if (session.user.role === Role.ADMIN) {
    const region = url.searchParams.get("region");
    return {
      scope: "admin",
      regionId: region ? Number(region) : undefined,
      status,
      period,
      ownerName: "Dinas Operasi UKM Sumatera Selatan",
    };
  }

  if (session.user.role === Role.UMKM) {
    const umkm = await prisma.umkm.findUnique({ where: { ownerId: session.user.id } });
    if (!umkm) return { error: new Response("UMKM tidak ditemukan", { status: 404 }) };
    return {
      scope: "umkm",
      umkmId: umkm.id,
      status,
      period,
      ownerName: umkm.name,
    };
  }

  return { error: new Response("Forbidden", { status: 403 }) };
}

export function buildOrderWhere(scope: ExportScope) {
  return {
    orderedAt: { gte: scope.period.from, lte: scope.period.to },
    ...(scope.umkmId ? { umkmId: scope.umkmId } : {}),
    ...(scope.regionId ? { umkm: { regionId: scope.regionId } } : {}),
    ...(scope.status ? { status: scope.status } : {}),
  };
}
