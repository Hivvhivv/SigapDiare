import { Phone, TriangleExclamationPoint } from "lucide-react";
import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Callout } from "@/components/ui/callout";
import { DANGER_REFERRAL, DANGER_SIGN_TEXT, EMERGENCY_NUMBER } from "@/content/copy/danger";
import { DANGER_SIGNS } from "@/lib/safety/danger-signs";

export const metadata: Metadata = { title: "Tanda Bahaya Diare" };

// Halaman ini SELALU publik (tanpa login). Lihat CLAUDE.md aturan keselamatan no. 5.
export default function DangerSignsPage() {
  return (
    <Container narrow>
      <PageHeader
        title="Kenali Tanda Bahaya Diare!"
        description="Diare bisa membuat si kecil kehilangan banyak cairan tubuh. Kenali tanda-tanda di bawah ini agar Ayah/Bunda tahu kapan harus segera membawa anak ke fasilitas kesehatan."
      />

      <div role="alert" className="mb-8 rounded-xl border border-l-[6px] border-danger-border border-l-danger bg-danger-soft p-5">
        <p className="text-h3 font-bold text-danger-strong">Bila ada SATU saja tanda di bawah ini:</p>
        <p className="mt-1 text-body">{DANGER_REFERRAL}</p>
        <a
          href={`tel:${EMERGENCY_NUMBER}`}
          className="mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-danger px-6 text-label font-semibold text-white hover:bg-danger-strong"
        >
          <Phone aria-hidden className="size-5" />
          Hubungi {EMERGENCY_NUMBER}
        </a>
      </div>

      <ol className="flex flex-col gap-3">
        {DANGER_SIGNS.map((sign, index) => (
          <li key={sign} className="flex gap-4 rounded-lg border border-danger-border bg-surface p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-soft">
              <TriangleExclamationPoint aria-hidden className="size-5 text-danger" />
            </span>
            <div>
              <h2 className="text-h3 font-bold">
                <span className="sr-only">Tanda {index + 1}: </span>
                {DANGER_SIGN_TEXT[sign].label}
              </h2>
              <p className="text-body text-on-surface-variant">{DANGER_SIGN_TEXT[sign].detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <Callout variant="disclaimer" className="mt-8">
        Informasi ini membantu Ayah/Bunda mengenali kondisi yang perlu pertolongan segera. SIGAP DIARE tidak menggantikan
        pemeriksaan oleh tenaga kesehatan.
      </Callout>
    </Container>
  );
}
