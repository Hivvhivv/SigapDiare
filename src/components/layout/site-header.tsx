import { Bell, ChevronDown, LogOut, Siren, UserRound } from "lucide-react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { logout } from "@/server/actions/auth";
import { initials } from "@/lib/utils";
import { Logo } from "./logo";
import { DesktopNavLinks } from "./nav-links";

export type HeaderUser = { name: string } | null;

export function SiteHeader({ user }: { user: HeaderUser }) {
  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant/60 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.06)]">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4 lg:h-[72px] lg:px-8">
        <Logo href={user ? "/beranda" : "/"} />
        {user && <DesktopNavLinks />}
        <div className="flex items-center gap-2">
          <Link
            href="/tanda-bahaya"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-danger-border bg-danger-soft px-3 text-[0.9375rem] font-semibold text-danger-strong hover:bg-danger-muted lg:px-4"
          >
            <Siren aria-hidden className="size-5" />
            <span className="lg:hidden">Bahaya</span>
            <span className="hidden lg:inline">Tanda Bahaya</span>
          </Link>
          {user ? (
            <>
              <Link
                href="/fitur/pengingat"
                aria-label="Pengingat"
                className="flex size-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
              >
                <Bell aria-hidden className="size-5" />
              </Link>
              <UserMenu name={user.name} />
            </>
          ) : (
            <Link href="/masuk" className={buttonClass("primary", "sm", "hidden sm:inline-flex")}>
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function UserMenu({ name }: { name: string }) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full p-1 hover:bg-surface-container [&::-webkit-details-marker]:hidden">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary-100 text-[0.875rem] font-bold text-primary-800">
          {initials(name)}
        </span>
        <span className="hidden flex-col text-left leading-tight lg:flex">
          <span className="max-w-32 truncate text-[0.9375rem] font-semibold">{name}</span>
          <span className="text-[0.75rem] text-on-surface-variant">Lihat profil</span>
        </span>
        <ChevronDown aria-hidden className="hidden size-4 text-on-surface-variant transition-transform group-open:rotate-180 lg:block" />
        <span className="sr-only">Menu akun</span>
      </summary>
      <div className="absolute right-0 mt-2 w-52 rounded-lg border border-outline-variant bg-white p-2 shadow-[0_4px_12px_rgb(15_23_42/0.10)]">
        <Link href="/profil" className="flex items-center gap-2 rounded-md px-3 py-2.5 text-body hover:bg-surface-container">
          <UserRound aria-hidden className="size-5" />
          Profil Saya
        </Link>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-body hover:bg-surface-container">
            <LogOut aria-hidden className="size-5" />
            Keluar
          </button>
        </form>
      </div>
    </details>
  );
}
