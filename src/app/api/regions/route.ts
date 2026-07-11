import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";

const schema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });

  const exists = await prisma.region.findUnique({ where: { name: parsed.data.name } });
  if (exists) return NextResponse.json({ error: "Wilayah sudah ada." }, { status: 409 });

  const r = await prisma.region.create({
    data: { name: parsed.data.name, description: parsed.data.description || null },
  });
  return NextResponse.json(r);
}
