import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn("size-10", className)}>
      <rect width="40" height="40" rx="12" fill="#2563eb" />
      <path d="M20 8c-4.6 6-8 10.4-8 14.6A8 8 0 0 0 28 22.6C28 18.4 24.6 14 20 8Z" fill="#fff" />
      <path d="M18.6 19.5h2.8v2.6H24v2.8h-2.6v2.6h-2.8v-2.6H16v-2.8h2.6z" fill="#0ea5e9" />
    </svg>
  );
}

export function Logo({ href = "/", tagline = true }: { href?: string; tagline?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-md" aria-label="SIGAP DIARE, ke halaman utama">
      <LogoMark />
      <span className="flex flex-col leading-tight">
        <span className="text-[1.0625rem] font-extrabold tracking-tight text-primary-700">SIGAP DIARE</span>
        {tagline && <span className="hidden text-[0.75rem] text-on-surface-variant sm:block">Sahabat Ayah Bunda</span>}
      </span>
    </Link>
  );
}
