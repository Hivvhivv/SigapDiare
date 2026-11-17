import { isStaff } from "@/lib/auth/roles";
import { BookOpen, ClipboardCheck, Droplets, HeartPulse, Siren, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { FamilyIllustration } from "@/components/illustrations/family";
import { ButtonLink } from "@/components/ui/button";
import { TAGLINE } from "@/content/copy/site";
import { getSessionUser } from "@/server/session";

const PILLARS = [
  { title: "Edukasi", text: "Kenali penyebab, gejala, dan risiko diare pada balita.", Icon: BookOpen },
  { title: "Pencegahan", text: "Bangun kebiasaan bersih lewat checklist harian.", Icon: Droplets },
  { title: "Pemantauan", text: "Catat kondisi si kecil dari waktu ke waktu.", Icon: HeartPulse },
  { title: "Kuis", text: "Kuis singkat sebelum dan sesudah belajar.", Icon: ClipboardCheck },
];

export default async function LandingPage() {
  const user = await getSessionUser();
  if (user) redirect(isStaff(user.role) ? "/admin" : "/beranda");

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-8 lg:gap-16 lg:px-8 lg:py-12">
      <section className="grid items-center gap-8 rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50 to-surface p-6 lg:grid-cols-12 lg:p-10">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <h1 className="text-display font-bold lg:text-display-lg">
            Selamat Datang di <span className="text-primary-600">SIGAP DIARE!</span>
          </h1>
          <p className="text-h3 font-semibold text-primary-800">{TAGLINE}</p>
          <p className="max-w-prose text-body-lg text-on-surface-variant">
            Belajar mengenali, mencegah, dan menangani diare pada si kecil dengan bahasa yang mudah. Gratis, cukup
            daftar dengan nama dan nomor HP.
          </p>
          <p className="flex items-center gap-2 text-body font-semibold text-secondary-800">
            <Users aria-hidden className="size-5" />
            Untuk ayah, bunda, nenek, kakek, dan pengasuh balita.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <ButtonLink href="/daftar">Daftar Sekarang</ButtonLink>
            <ButtonLink href="/masuk" variant="outlined">
              Masuk dengan Kode Akses
            </ButtonLink>
          </div>
        </div>
        <div className="hidden lg:col-span-5 lg:block">
          <FamilyIllustration />
        </div>
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
