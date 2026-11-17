import { BookOpen, ClipboardCheck, Droplets, HeartPulse, Siren } from "lucide-react";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { TAGLINE } from "@/content/copy/site";
import { getSessionUser } from "@/server/session";

const PILLARS = [
  { title: "Edukasi", text: "Kenali penyebab, gejala, dan risiko diare pada balita.", Icon: BookOpen },
  { title: "Pencegahan", text: "Bangun kebiasaan bersih lewat checklist harian.", Icon: Droplets },
  { title: "Pemantauan", text: "Catat kondisi si kecil dari waktu ke waktu.", Icon: HeartPulse },
  { title: "Evaluasi", text: "Ukur pemahaman Ibu sebelum dan sesudah belajar.", Icon: ClipboardCheck },
];

export default async function LandingPage() {
  const user = await getSessionUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/beranda");

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-8 lg:gap-16 lg:px-8 lg:py-12">
      <section className="grid items-center gap-8 rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50 to-surface p-6 lg:grid-cols-12 lg:p-10">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <h1 className="text-display font-bold lg:text-display-lg">
            Selamat Datang di <span className="text-primary-600">SIGAP DIARE!</span>
          </h1>
          <p className="text-h3 font-semibold text-primary-800">{TAGLINE}</p>
          <p className="max-w-prose text-body-lg text-on-surface-variant">
            Pelajari informasi penting seputar diare pada anak, mulai dari mengenali gejala, mencegah penularan, hingga
            memahami langkah penanganan awal yang tepat.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <ButtonLink href="/daftar">Daftar Sekarang</ButtonLink>
            <ButtonLink href="/masuk" variant="outlined">
              Masuk dengan Kode Akses
            </ButtonLink>
          </div>
        </div>
        <HeroIllustration />
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-danger-border bg-danger-soft p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Siren aria-hidden className="size-8 shrink-0 text-danger" />
          <div>
            <h2 className="text-h3 font-bold text-danger-strong">Kenali Tanda Bahaya Diare!</h2>
            <p className="text-body">
              Jika anak tampak sangat lemas, tidak mampu minum atau menyusu, atau menunjukkan tanda dehidrasi berat,
              segera cari pertolongan medis.
            </p>
          </div>
        </div>
        <ButtonLink href="/tanda-bahaya" variant="danger">
          Pelajari Tanda Bahaya
        </ButtonLink>
      </section>

      <section aria-labelledby="pilar-title">
        <h2 id="pilar-title" className="mb-4 text-h2 font-bold lg:text-h2-lg">
          Apa yang Ada di SIGAP DIARE?
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ title, text, Icon }) => (
            <li key={title} className="rounded-lg border border-outline-variant bg-surface p-5">
              <span className="mb-3 flex size-12 items-center justify-center rounded-md bg-primary-50">
                <Icon aria-hidden className="size-6 text-primary-600" />
              </span>
              <h3 className="text-h3 font-bold">{title}</h3>
              <p className="text-body text-on-surface-variant">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// Penanda tempat ilustrasi ibu menggendong anak (aset ilustrasi menyusul, PRD Q8).
function HeroIllustration() {
  return (
    <div
      role="img"
      aria-label="Ilustrasi ibu menggendong anak"
      className="relative hidden aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-secondary-100 via-primary-100 to-tertiary-100 lg:col-span-5 lg:flex"
    >
      <span className="absolute -top-8 -left-8 size-40 rounded-full bg-white/50" />
      <span className="absolute -right-10 -bottom-10 size-48 rounded-full bg-primary-200/60" />
      <HeartPulse aria-hidden className="relative size-24 text-primary-600" />
    </div>
  );
}
