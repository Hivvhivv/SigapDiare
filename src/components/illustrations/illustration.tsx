import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { FamilyIllustration } from "./family";
import { BookSpot, ChatSpot, ClipboardSpot, PhoneSpot, WarningSpot } from "./spots";

// Slot ilustrasi. Bila public/illustrations/<nama>.(webp|png|jpg|svg) ada, gambar itu yang tampil;
// bila belum, tampil SVG pengganti. Daftar nama & ukuran: public/illustrations/README.md.
const SLOTS = {
  keluarga: { alt: "Ilustrasi orang tua memeluk si kecil", Fallback: FamilyIllustration },
  edukasi: { alt: "Ilustrasi buku edukasi kesehatan anak", Fallback: BookSpot },
  fitur: { alt: "Ilustrasi orang tua memakai aplikasi di ponsel", Fallback: PhoneSpot },
  "tanda-bahaya": { alt: "Ilustrasi peringatan tanda bahaya", Fallback: WarningSpot },
  catatan: { alt: "Ilustrasi papan catatan kondisi anak", Fallback: ClipboardSpot },
  kuis: { alt: "Ilustrasi lembar kuis", Fallback: ClipboardSpot },
  "tanya-jawab": { alt: "Ilustrasi tanya jawab", Fallback: ChatSpot },
} satisfies Record<string, { alt: string; Fallback: ComponentType<{ className?: string }> }>;

export type IllustrationName = keyof typeof SLOTS;

const EXTENSIONS = ["webp", "png", "jpg", "svg"];
const DIR = path.join(process.cwd(), "public", "illustrations");

function findFile(name: string) {
  return EXTENSIONS.map((ext) => `${name}.${ext}`).find((file) => existsSync(path.join(DIR, file))) ?? null;
}

export function Illustration({ name, className, priority }: { name: IllustrationName; className?: string; priority?: boolean }) {
  const slot = SLOTS[name];
  const file = findFile(name);
  if (file) {
    return (
      <Image
        src={`/illustrations/${file}`}
        alt={slot.alt}
        width={800}
        height={600}
        priority={priority}
        unoptimized={file.endsWith(".svg")}
        sizes="(min-width: 1024px) 420px, 60vw"
        className={cn("h-auto w-full drop-shadow-sm", className)}
      />
    );
  }
  const { Fallback } = slot;
  return (
    <div role="img" aria-label={slot.alt} className={className}>
      <Fallback />
    </div>
  );
}
