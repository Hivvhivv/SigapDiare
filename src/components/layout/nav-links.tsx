"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV } from "@/content/copy/site";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Menu utama" className="hidden items-center gap-1 lg:flex">
      {MAIN_NAV.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-[0.9375rem] font-semibold whitespace-nowrap transition-colors",
              active ? "bg-primary-600 text-white" : "text-on-surface-variant hover:bg-surface-container",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Menu utama"
      className="fixed inset-x-3 bottom-3 z-40 rounded-full bg-surface-container px-2 py-1.5 shadow-[0_4px_12px_rgb(15_23_42/0.10)] lg:hidden"
    >
      <ul className="flex justify-between">
        {MAIN_NAV.map(({ href, shortLabel, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center gap-0.5 rounded-full py-1"
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full transition-colors",
                    active ? "bg-primary-600 text-white" : "text-on-surface-variant",
                  )}
                >
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className={cn("text-[0.8125rem] font-semibold", active ? "text-primary-700" : "text-on-surface-variant")}>
                  {shortLabel}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
