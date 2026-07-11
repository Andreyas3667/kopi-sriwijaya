"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;

  return (
    <header className="sticky top-0 z-30 border-b border-coffee-200 bg-coffee-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-coffee-800">
          <span className="text-2xl">☕</span>
          <span>Kopi Sriwijaya</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="hover:text-coffee-600">Peta UMKM</Link>
          <Link href="/edukasi" className="hover:text-coffee-600">Edukasi Kopi</Link>
          <Link href="/berita" className="hover:text-coffee-600">Berita</Link>
          <Link href="/about" className="hover:text-coffee-600">Tentang</Link>

          {status === "loading" ? null : !session ? (
            <>
              <Link href="/login" className="rounded-md px-3 py-1.5 text-coffee-700 hover:bg-coffee-100">
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-coffee-700 px-3 py-1.5 text-white hover:bg-coffee-800"
              >
                Daftar
              </Link>
            </>
          ) : (
            <>
              {role === "ADMIN" && (
                <Link href="/admin" className="rounded-md px-3 py-1.5 hover:bg-coffee-100">
                  Admin
                </Link>
              )}
              {role === "UMKM" && (
                <Link href="/dashboard" className="rounded-md px-3 py-1.5 hover:bg-coffee-100">
                  Dashboard
                </Link>
              )}
              {role === "BUYER" && (
                <Link href="/profile/pesanan" className="rounded-md px-3 py-1.5 hover:bg-coffee-100">
                  Pesanan Saya
                </Link>
              )}
              <Link href="/profile" className="hidden text-coffee-700 hover:text-coffee-900 sm:inline">
                {session.user?.name}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md border border-coffee-300 px-3 py-1.5 text-coffee-700 hover:bg-coffee-100"
              >
                Keluar
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
