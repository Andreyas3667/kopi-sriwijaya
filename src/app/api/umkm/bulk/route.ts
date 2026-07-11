import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";
import { parseCsvObjects } from "@/lib/csv";

export const runtime = "nodejs";

const REQUIRED = [
  "nama_usaha", "owner_nama", "owner_email", "owner_password",
  "alamat", "whatsapp", "latitude", "longitude", "wilayah",
] as const;

type RowResult = { row: number; ok: boolean; message: string };

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File CSV wajib diunggah." }, { status: 400 });
  }
  const text = await file.text();
  const rows = parseCsvObjects(text);
  if (rows.length === 0) {
    return NextResponse.json({ error: "CSV kosong atau hanya berisi header." }, { status: 400 });
  }

  const headers = Object.keys(rows[0]);
  const missing = REQUIRED.filter((k) => !headers.includes(k));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Kolom wajib hilang: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const regions = await prisma.region.findMany();
  const regionByName = new Map(regions.map((r) => [r.name.toLowerCase(), r.id]));

  const results: RowResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowNum = i + 2; // header is line 1
    try {
      for (const k of REQUIRED) {
        if (!r[k]) throw new Error(`kolom "${k}" kosong`);
      }
      const lat = Number(r.latitude);
      const lng = Number(r.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error("latitude/longitude tidak valid");
      }
      const regionId = regionByName.get(r.wilayah.toLowerCase());
      if (!regionId) throw new Error(`wilayah "${r.wilayah}" tidak ditemukan`);

      const exists = await prisma.user.findUnique({ where: { email: r.owner_email } });
      if (exists) throw new Error(`email "${r.owner_email}" sudah terdaftar`);

      const owner = await prisma.user.create({
        data: {
          name: r.owner_nama,
          email: r.owner_email,
          password: await bcrypt.hash(r.owner_password, 10),
          role: Role.UMKM,
          phone: r.whatsapp,
          address: r.alamat,
          regionId,
        },
      });
      await prisma.umkm.create({
        data: {
          name: r.nama_usaha,
          description: r.deskripsi || null,
          address: r.alamat,
          whatsapp: r.whatsapp,
          latitude: lat,
          longitude: lng,
          regionId,
          ownerId: owner.id,
        },
      });
      results.push({ row: rowNum, ok: true, message: `${r.nama_usaha} ditambahkan` });
    } catch (err) {
      results.push({
        row: rowNum,
        ok: false,
        message: err instanceof Error ? err.message : "Error tidak diketahui",
      });
    }
  }

  const summary = {
    total: results.length,
    success: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
  return NextResponse.json(summary);
}
