import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { QUICK_ACCESS } from "@/content/copy/site";
import { cn } from "@/lib/utils";

export function QuickAccess() {
  return (
    <section aria-labelledby="quick-access-title">
      <SectionHeader id="quick-access-title" eyebrow="Menu & fasilitas" title="Akses Cepat Fitur Utama" />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {/* Di mobile, kartu Tanda Bahaya dinaikkan ke baris pertama. */}
        {QUICK_ACCESS.map(({ href, title, description, Icon, danger }) => (
          <li key={href} className={cn(danger && "order-first lg:order-none")}>
            <Link
              href={href}
              className={cn(
                "flex h-full flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors",
                danger
                  ? "border-danger-border bg-danger-soft hover:bg-danger-muted"
                  : "border-outline-variant bg-surface hover:bg-surface-container",
              )}
            >
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-md",
                  danger ? "bg-danger-muted text-danger-strong" : "bg-primary-50 text-primary-600",
                )}
              >
                <Icon aria-hidden className="size-6" />
              </span>
              <span className={cn("text-label font-semibold", danger && "text-danger-strong")}>{title}</span>
              <span className="line-clamp-2 text-[0.875rem] leading-5 text-on-surface-variant">{description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
