import { Phone, Siren } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { DANGER_REFERRAL, DANGER_SIGN_TEXT, EMERGENCY_NUMBER } from "@/content/copy/danger";
import type { DangerSign } from "@/lib/safety/danger-signs";

/** Komponen keselamatan tunggal untuk semua tempat yang menampilkan tanda bahaya. DESIGN.md §6.9 */
export function DangerAlert({ signs, title = "Segera Bawa Anak ke Fasilitas Kesehatan" }: { signs: DangerSign[]; title?: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-l-[6px] border-danger-border border-l-danger bg-danger-soft p-5"
    >
      <div className="flex gap-3">
        <Siren aria-hidden className="size-8 shrink-0 text-danger" />
        <div className="flex flex-col gap-2">
          <h2 className="text-h3 font-bold text-danger-strong">{title}</h2>
          {signs.length > 0 && (
            <div>
              <p className="text-body">Anda mencatat:</p>
              <ul className="ml-5 list-disc text-body font-semibold">
                {signs.map((sign) => (
                  <li key={sign}>{DANGER_SIGN_TEXT[sign].label.toLowerCase()}</li>
                ))}
              </ul>
              <p className="text-body">Kondisi ini termasuk tanda bahaya diare.</p>
            </div>
          )}
          <p className="text-body">{DANGER_REFERRAL}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <a href={`tel:${EMERGENCY_NUMBER}`} className="inline-flex h-12 items-center gap-2 rounded-full bg-danger px-6 text-label font-semibold text-white hover:bg-danger-strong">
              <Phone aria-hidden className="size-5" />
              Hubungi {EMERGENCY_NUMBER}
            </a>
            <ButtonLink href="/tanda-bahaya" variant="outlined">
              Lihat Tanda Bahaya
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
