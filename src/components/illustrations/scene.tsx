import { cn } from "@/lib/utils";

/**
 * Dekorasi latar ramah anak: awan, bukit, rumah kecil, kilau, dan hati.
 * Taruh sebagai anak pertama elemen `relative isolate overflow-hidden`; otomatis di belakang konten.
 */
export function SceneDecor({ tone = "sky", className }: { tone?: "sky" | "warm" | "mint" | "sunny"; className?: string }) {
  const hills = {
    sky: ["#bbf7d0", "#86efac"],
    mint: ["#bbf7d0", "#6ee7b7"],
    warm: ["#fecdd3", "#fda4af"],
    sunny: ["#fde68a", "#fcd34d"],
  }[tone];

  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMax slice"
      className={cn("pointer-events-none absolute inset-0 -z-10 h-full w-full", className)}
    >
      {/* awan */}
      <g fill="#ffffff" opacity="0.9">
        <ellipse cx="140" cy="70" rx="70" ry="22" />
        <ellipse cx="185" cy="58" rx="45" ry="26" />
        <ellipse cx="980" cy="48" rx="80" ry="22" />
        <ellipse cx="1030" cy="36" rx="48" ry="26" />
        <ellipse cx="620" cy="30" rx="55" ry="15" opacity="0.7" />
      </g>
      {/* kilau & hati */}
      <path d="M560 120 l6 -16 l6 16 l16 6 l-16 6 l-6 16 l-6 -16 l-16 -6 Z" fill="#fde68a" />
      <path d="M90 190 l4 -10 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 Z" fill="#bae6fd" />
      <path
        d="M1110 150 C1110 142 1120 138 1125 146 C1130 138 1140 142 1140 150 C1140 160 1125 168 1125 168 C1125 168 1110 160 1110 150 Z"
        fill="#fda4af"
        opacity="0.8"
      />
      {/* rumah kecil */}
      <g transform="translate(860 268)" opacity="0.55">
        <rect x="0" y="22" width="56" height="44" rx="4" fill="#bfdbfe" />
        <path d="M-6 26 L28 -2 L62 26 Z" fill="#93c5fd" />
        <rect x="22" y="40" width="12" height="26" rx="2" fill="#dbeafe" />
      </g>
      {/* bukit */}
      <path d="M0 330 C180 270 360 300 520 320 C700 342 880 270 1200 300 L1200 400 L0 400 Z" fill={hills[0]} opacity="0.7" />
      <path d="M0 360 C220 320 420 350 640 360 C860 372 1000 330 1200 345 L1200 400 L0 400 Z" fill={hills[1]} opacity="0.6" />
      {/* pohon kecil */}
      <g opacity="0.6">
        <circle cx="70" cy="318" r="22" fill="#4ade80" />
        <rect x="66" y="330" width="8" height="22" rx="2" fill="#a16207" />
        <circle cx="1150" cy="300" r="18" fill="#4ade80" />
        <rect x="1147" y="310" width="6" height="18" rx="2" fill="#a16207" />
      </g>
    </svg>
  );
}
