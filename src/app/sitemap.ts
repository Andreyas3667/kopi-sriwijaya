import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [umkms, news] = await Promise.all([
    prisma.umkm.findMany({ select: { id: true, updatedAt: true } }),
    prisma.news.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "/", "/about", "/berita", "/edukasi",
    "/edukasi/varietas", "/edukasi/proses", "/edukasi/aroma", "/edukasi/seduh",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...umkms.map((u) => ({
      url: `${SITE_URL}/umkm/${u.id}`,
      lastModified: u.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...news.map((n) => ({
      url: `${SITE_URL}/berita/${n.slug}`,
      lastModified: n.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
