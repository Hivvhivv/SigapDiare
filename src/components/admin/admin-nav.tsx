"use client";

import { BookOpen, ClipboardCheck, LayoutDashboard, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS: { href: string; label: string; Icon: LucideIcon; ready: boolean }[] = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, ready: true },
  { href: "/admin/responden", label: "Responden", Icon: Users, ready: true },
  { href: "/admin/evaluasi", label: "Evaluasi", Icon: ClipboardCheck, ready: false },
  { href: "/admin/edukasi", label: "Konten Edukasi", Icon: BookOpen, ready: false },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Menu admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map(({ href, label, Icon, ready }) => {
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
