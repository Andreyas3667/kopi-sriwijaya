import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dashboard";
import { formatDate } from "@/lib/format";
import { Role } from "@/lib/enums";
import { UserRowActions } from "@/components/UserRowActions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  await requireAdmin();
  const { role, q } = await searchParams;

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {}),
      email: { not: "guest@kopi.id" },
    },
    orderBy: { createdAt: "desc" },
    include: { umkm: { select: { id: true, name: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-coffee-800">Pengguna</h1>
      <p className="mt-1 text-sm text-coffee-600">
        Kelola akun admin, UMKM, dan pembeli. Reset password tersedia di sini.
      </p>

      <form className="mt-4 mb-4 flex flex-wrap gap-2" action="/admin/users">
        <input name="q" defaultValue={q ?? ""} placeholder="Cari nama / email…"
          className="flex-1 rounded-md border border-coffee-300 px-3 py-2" />
        <select name="role" defaultValue={role ?? ""}
          className="rounded-md border border-coffee-300 px-3 py-2">
          <option value="">Semua role</option>
          {Object.values(Role).map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="rounded-md bg-coffee-700 px-4 py-2 text-sm font-medium text-white hover:bg-coffee-800">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-coffee-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-coffee-100 text-left text-coffee-700">
            <tr>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">UMKM</th>
              <th className="px-3 py-2">Bergabung</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-coffee-500">Tidak ada pengguna.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-t border-coffee-100">
                <td className="px-3 py-2 font-medium text-coffee-800">{u.name}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-coffee-100 px-2 py-0.5 text-xs font-medium text-coffee-800">
                    {u.role}
                  </span>
                </td>
                <td className="px-3 py-2">{u.umkm?.name ?? "—"}</td>
                <td className="px-3 py-2">{formatDate(u.createdAt)}</td>
                <td className="px-3 py-2 text-right">
                  <UserRowActions id={u.id} role={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
