"use client";

import { BookOpen, ClipboardCheck, KeyRound, LayoutDashboard, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; Icon: LucideIcon; ready: boolean; superOnly?: boolean };

const ITEMS: Item[] = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, ready: true },
  { href: "/admin/responden", label: "Responden", Icon: Users, ready: true },
  { href: "/admin/evaluasi", label: "Evaluasi", Icon: ClipboardCheck, ready: true },
  { href: "/admin/edukasi", label: "Konten Edukasi", Icon: BookOpen, ready: true },
  { href: "/admin/admin", label: "Kelola Admin", Icon: ShieldCheck, ready: true, superOnly: true },
  { href: "/admin/akun", label: "Akun Saya", Icon: KeyRound, ready: true },
];

export function AdminNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Menu admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.filter((item) => !item.superOnly || isSuperAdmin).map(({ href, label, Icon, ready }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        if (!ready) {
          return (
            <span key={href} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.9375rem] whitespace-nowrap text-neutral-400">
              <Icon aria-hidden className="size-5" />
              {label}
              <span className="text-[0.75rem]">(segera)</span>
            </span>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.9375rem] font-semibold whitespace-nowrap",
              active ? "bg-primary-600 text-white" : "text-on-surface hover:bg-surface-container-high",
            )}
          >
            <Icon aria-hidden className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
