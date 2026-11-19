import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Warna aksen kartu fitur (DESIGN.md §6.7). Kelas ditulis lengkap agar terbaca Tailwind.
export const TONES = {
  blue: { bubble: "from-sky-100 to-blue-200 text-blue-600", tile: "bg-sky-50 border-sky-100 hover:bg-sky-100" },
  green: { bubble: "from-emerald-100 to-green-200 text-green-600", tile: "bg-emerald-50 border-emerald-100 hover:bg-emerald-100" },
  pink: { bubble: "from-rose-100 to-pink-200 text-rose-600", tile: "bg-rose-50 border-rose-100 hover:bg-rose-100" },
  red: { bubble: "from-red-100 to-red-200 text-red-600", tile: "bg-danger-soft border-danger-border hover:bg-danger-muted" },
  violet: { bubble: "from-violet-100 to-purple-200 text-violet-600", tile: "bg-violet-50 border-violet-100 hover:bg-violet-100" },
  amber: { bubble: "from-amber-100 to-yellow-200 text-amber-600", tile: "bg-amber-50 border-amber-100 hover:bg-amber-100" },
  orange: { bubble: "from-orange-100 to-orange-200 text-orange-600", tile: "bg-orange-50 border-orange-100 hover:bg-orange-100" },
  teal: { bubble: "from-teal-100 to-cyan-200 text-teal-600", tile: "bg-teal-50 border-teal-100 hover:bg-teal-100" },
} as const;

export type Tone = keyof typeof TONES;

/** Ikon dalam bulatan pastel bergradasi (gaya "3D" lembut). */
export function IconBubble({ Icon, tone = "blue", size = "md" }: { Icon: LucideIcon; tone?: Tone; size?: "md" | "lg" }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-linear-to-br shadow-[0_6px_14px_rgb(15_23_42/0.12)] ring-4 ring-white",
        TONES[tone].bubble,
        size === "lg" ? "size-16" : "size-14",
      )}
    >
      <Icon aria-hidden strokeWidth={2.25} className={size === "lg" ? "size-8" : "size-7"} />
    </span>
  );
}
