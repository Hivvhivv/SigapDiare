import { cn } from "@/lib/utils";

/** Ilustrasi orang tua menggendong si kecil (sederhana, warna design system). Pengganti sementara aset ilustrator. */
export function FamilyIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" role="img" aria-label="Ilustrasi orang tua menggendong si kecil" className={cn("h-auto w-full", className)}>
      {/* latar */}
      <circle cx="160" cy="132" r="104" fill="#e0f2fe" />
      <circle cx="262" cy="58" r="30" fill="#fef3c7" />
      <circle cx="58" cy="70" r="14" fill="#dbeafe" />
      <circle cx="40" cy="170" r="8" fill="#bae6fd" />
      <circle cx="286" cy="178" r="10" fill="#fde68a" />

      {/* tubuh orang tua */}
      <path d="M100 240 C100 182 126 150 162 150 C198 150 224 182 224 240 Z" fill="#2563eb" />
      <path d="M140 156 L162 186 L184 156" fill="none" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

      {/* kepala orang tua */}
      <rect x="152" y="128" width="20" height="22" rx="8" fill="#e9b48f" />
      <circle cx="162" cy="108" r="30" fill="#f2c4a0" />
      <path d="M132 108 C132 82 148 72 164 72 C184 72 195 86 193 106 C185 94 170 90 158 93 C147 96 139 102 132 108 Z" fill="#3b2a20" />
      <circle cx="152" cy="111" r="3" fill="#3b2a20" />
      <circle cx="173" cy="111" r="3" fill="#3b2a20" />
      <path d="M154 122 Q162 129 171 122" fill="none" stroke="#3b2a20" strokeWidth="3" strokeLinecap="round" />
      <circle cx="146" cy="120" r="5" fill="#f9a8a8" opacity="0.6" />
      <circle cx="179" cy="120" r="5" fill="#f9a8a8" opacity="0.6" />

      {/* si kecil */}
      <ellipse cx="206" cy="194" rx="24" ry="27" fill="#f59e0b" />
      <circle cx="206" cy="152" r="20" fill="#f5d0b0" />
      <path d="M188 148 C190 136 200 131 208 132 C218 133 225 140 225 150 C219 142 208 140 200 143 C195 145 191 147 188 148 Z" fill="#5b3a24" />
      <circle cx="199" cy="155" r="2.5" fill="#3b2a20" />
      <circle cx="213" cy="155" r="2.5" fill="#3b2a20" />
      <path d="M201 163 Q206 168 211 163" fill="none" stroke="#3b2a20" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="194" cy="161" r="3.5" fill="#f9a8a8" opacity="0.7" />
      <circle cx="218" cy="161" r="3.5" fill="#f9a8a8" opacity="0.7" />

      {/* lengan menggendong */}
      <path d="M140 182 C150 214 192 224 226 204" fill="none" stroke="#1d4ed8" strokeWidth="15" strokeLinecap="round" />
      <circle cx="228" cy="203" r="9" fill="#f2c4a0" />

      {/* hati */}
      <path
        d="M248 104 C248 96 258 92 263 100 C268 92 278 96 278 104 C278 114 263 122 263 122 C263 122 248 114 248 104 Z"
        fill="#fb7185"
      />
      <path d="M86 118 l4 -10 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 Z" fill="#fbbf24" />
    </svg>
  );
}
