import Link from "next/link";
import { IconBubble, TONES, type Tone } from "@/components/ui/icon-bubble";
import { SectionHeader } from "@/components/ui/section-header";
import { QUICK_ACCESS } from "@/content/copy/site";
import { cn } from "@/lib/utils";

// Warna tiap fitur, mengikuti mockup (setiap kartu punya warna sendiri).
export const FEATURE_TONE: Record<string, Tone> = {
  "/edukasi/mengenal-diare": "blue",
  "/edukasi/pencegahan": "green",
  "/edukasi/penanganan": "pink",
  "/tanda-bahaya": "red",
  "/fitur/panduan-takaran": "teal",
  "/fitur/checklist": "green",
  "/fitur/pelacak": "orange",
  "/fitur/pengingat": "amber",
  "/faq": "blue",
  "/evaluasi": "violet",
};

export function QuickAccess() {
  return (
    <section aria-labelledby="quick-access-title">
      <SectionHeader id="quick-access-title" eyebrow="Menu & fasilitas" title="Akses Cepat Fitur Utama" />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {/* Di mobile, kartu Tanda Bahaya dinaikkan ke baris pertama. */}
        {QUICK_ACCESS.map(({ href, title, description, Icon, danger }) => {
          const tone = FEATURE_TONE[href] ?? "blue";
          return (
            <li key={href} className={cn(danger && "order-first lg:order-none")}>
              <Link
                href={href}
                className={cn(
                  "flex h-full flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgb(15_23_42/0.08)]",
                  TONES[tone].tile,
                )}
              >
                <IconBubble Icon={Icon} tone={tone} />
                <span className={cn("text-label font-semibold", danger && "text-danger-strong")}>{title}</span>
                <span className="line-clamp-2 text-[0.875rem] leading-5 text-on-surface-variant">{description}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
