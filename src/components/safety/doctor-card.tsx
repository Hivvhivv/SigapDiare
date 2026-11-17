import { Stethoscope, TriangleExclamationPoint } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { DANGER_SIGN_TEXT } from "@/content/copy/danger";
import { DANGER_SIGNS } from "@/lib/safety/danger-signs";

/** Kartu "Kapan Harus ke Dokter / Puskesmas?" di beranda. DESIGN.md §6.9 varian kartu */
export function DoctorCard() {
  return (
    <section aria-labelledby="doctor-card-title" className="rounded-xl border border-danger-border bg-danger-soft p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-full bg-danger-muted">
          <Stethoscope aria-hidden className="size-6 text-danger-strong" />
        </span>
        <h2 id="doctor-card-title" className="text-h3 font-bold text-danger-strong">
          Kapan Harus ke Dokter / Puskesmas?
        </h2>
      </div>
      <p className="mb-3 text-body">Segera cari pertolongan medis bila si kecil mengalami:</p>
      <ul className="mb-5 flex flex-col gap-2">
        {DANGER_SIGNS.map((sign) => (
          <li key={sign} className="flex items-start gap-2 text-body">
            <TriangleExclamationPoint aria-hidden className="mt-1 size-4 shrink-0 text-danger" />
            {DANGER_SIGN_TEXT[sign].label}
          </li>
        ))}
      </ul>
      <ButtonLink href="/tanda-bahaya" variant="danger" className="w-full">
        Cek Pedoman Bahaya Lengkap
      </ButtonLink>
    </section>
  );
}
