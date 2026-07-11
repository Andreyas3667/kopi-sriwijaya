"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarItem = { href: string; label: string; icon?: string };

export function Sidebar({ title, items }: { title: string; items: SidebarItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-r border-coffee-200 bg-white p-4 md:w-60">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-coffee-500">
        {title}
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm transition ${
                active
                  ? "bg-coffee-700 text-white"
                  : "text-coffee-800 hover:bg-coffee-100"
              }`}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
