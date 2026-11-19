// Ilustrasi pengganti (SVG sederhana) untuk slot <Illustration>. Akan tergantikan otomatis bila
// file gambar dengan nama yang sama ditaruh di public/illustrations/ (lihat README di folder itu).
import { cn } from "@/lib/utils";

type Props = { className?: string };
const svgClass = (className?: string) => cn("h-auto w-full", className);

function Sparkles() {
  return (
    <g>
      <path d="M40 40 l5 -12 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 Z" fill="#fbbf24" />
      <path d="M262 70 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 Z" fill="#7dd3fc" />
      <circle cx="270" cy="200" r="5" fill="#fda4af" />
    </g>
  );
}

export function BookSpot({ className }: Props) {
  return (
    <svg viewBox="0 0 300 240" aria-hidden className={svgClass(className)}>
      <circle cx="150" cy="128" r="96" fill="#e0f2fe" />
      <Sparkles />
      <path d="M150 80 C120 64 84 64 58 74 L58 184 C84 174 120 174 150 190 Z" fill="#ffffff" stroke="#93c5fd" strokeWidth="4" strokeLinejoin="round" />
      <path d="M150 80 C180 64 216 64 242 74 L242 184 C216 174 180 174 150 190 Z" fill="#ffffff" stroke="#93c5fd" strokeWidth="4" strokeLinejoin="round" />
      <path d="M78 100 h52 M78 118 h52 M78 136 h40 M170 100 h52 M170 118 h52 M170 136 h40" stroke="#bfdbfe" strokeWidth="6" strokeLinecap="round" />
      <path d="M196 150 C196 144 204 141 208 147 C212 141 220 144 220 150 C220 158 208 164 208 164 C208 164 196 158 196 150 Z" fill="#fb7185" />
    </svg>
  );
}

export function PhoneSpot({ className }: Props) {
  return (
    <svg viewBox="0 0 300 240" aria-hidden className={svgClass(className)}>
      <circle cx="150" cy="128" r="96" fill="#dcfce7" />
      <Sparkles />
      <rect x="104" y="40" width="92" height="170" rx="18" fill="#1e40af" />
      <rect x="112" y="56" width="76" height="134" rx="8" fill="#ffffff" />
      <rect x="122" y="70" width="56" height="20" rx="6" fill="#bfdbfe" />
      <g fill="none" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M124 110 l6 6 l10 -12" />
        <path d="M124 136 l6 6 l10 -12" />
        <path d="M124 162 l6 6 l10 -12" />
      </g>
      <path d="M148 110 h28 M148 136 h28 M148 162 h20" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
      <path d="M210 70 C210 62 220 58 225 66 C230 58 240 62 240 70 C240 80 225 88 225 88 C225 88 210 80 210 70 Z" fill="#fb7185" />
    </svg>
  );
}

export function WarningSpot({ className }: Props) {
  return (
    <svg viewBox="0 0 300 240" aria-hidden className={svgClass(className)}>
      <circle cx="150" cy="128" r="96" fill="#ffe4e6" />
      <path d="M150 46 L246 206 L54 206 Z" fill="#ef4444" stroke="#ef4444" strokeWidth="18" strokeLinejoin="round" />
      <rect x="140" y="96" width="20" height="60" rx="10" fill="#ffffff" />
      <circle cx="150" cy="180" r="11" fill="#ffffff" />
      <path d="M48 70 l14 -6 M44 92 l16 0 M252 70 l-14 -6 M256 92 l-16 0" stroke="#fb7185" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function ClipboardSpot({ className }: Props) {
  return (
    <svg viewBox="0 0 300 240" aria-hidden className={svgClass(className)}>
      <circle cx="150" cy="128" r="96" fill="#fef3c7" />
      <Sparkles />
      <rect x="86" y="44" width="128" height="170" rx="14" fill="#d97706" />
      <rect x="98" y="60" width="104" height="142" rx="8" fill="#ffffff" />
      <rect x="122" y="34" width="56" height="26" rx="8" fill="#64748b" />
      <g fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M110 92 l7 7 l12 -14" />
        <path d="M110 128 l7 7 l12 -14" />
        <path d="M110 164 l7 7 l12 -14" />
      </g>
      <path d="M140 94 h48 M140 130 h48 M140 166 h36" stroke="#cbd5e1" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

export function ChatSpot({ className }: Props) {
  return (
    <svg viewBox="0 0 300 240" aria-hidden className={svgClass(className)}>
      <circle cx="150" cy="128" r="96" fill="#ede9fe" />
      <Sparkles />
      <path d="M64 70 h120 a20 20 0 0 1 20 20 v52 a20 20 0 0 1 -20 20 h-70 l-30 24 v-24 h-20 a20 20 0 0 1 -20 -20 v-52 a20 20 0 0 1 20 -20 Z" fill="#3b82f6" />
      <circle cx="98" cy="116" r="8" fill="#ffffff" />
      <circle cx="124" cy="116" r="8" fill="#ffffff" />
      <circle cx="150" cy="116" r="8" fill="#ffffff" />
      <path d="M190 120 h50 a16 16 0 0 1 16 16 v40 a16 16 0 0 1 -16 16 h-8 v18 l-22 -18 h-20 a16 16 0 0 1 -16 -16 v-40 a16 16 0 0 1 16 -16 Z" fill="#a78bfa" />
      <text x="215" y="172" textAnchor="middle" fontSize="34" fontWeight="800" fill="#ffffff" fontFamily="sans-serif">?</text>
    </svg>
  );
}
