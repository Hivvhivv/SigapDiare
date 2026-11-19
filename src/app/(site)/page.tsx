import { isStaff } from "@/lib/auth/roles";
import { ArrowRight, BookOpen, ClipboardCheck, Droplets, HeartPulse, Siren, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { Illustration } from "@/components/illustrations/illustration";
import { SceneDecor } from "@/components/illustrations/scene";
import { IconBubble, TONES } from "@/components/ui/icon-bubble";
import { ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { TAGLINE } from "@/content/copy/site";
import { getSessionUser } from "@/server/session";

const PILLARS = [
  { title: "Edukasi", text: "Kenali penyebab, gejala, dan risiko diare pada balita.", Icon: BookOpen, tone: "blue" },
  { title: "Pencegahan", text: "Bangun kebiasaan bersih lewat checklist harian.", Icon: Droplets, tone: "green" },
  { title: "Pemantauan", text: "Catat kondisi si kecil dari waktu ke waktu.", Icon: HeartPulse, tone: "orange" },
  { title: "Kuis", text: "Kuis singkat sebelum dan sesudah belajar.", Icon: ClipboardCheck, tone: "violet" },
] as const;

export default async function LandingPage(props: PageProps<"/">) {
  const user = await getSessionUser();
  if (user) redirect(isStaff(user.role) ? "/admin" : "/beranda");
  const { akun } = await props.searchParams;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-8 lg:gap-16 lg:px-8 lg:py-12">
      {akun === "dihapus" && (
        <Callout variant="success" title="Akun sudah dihapus">
          Terima kasih sudah memakai SIGAP DIARE. Data akun dan data si kecil sudah kami hapus.
        </Callout>
      )}
      <section className="relative isolate grid items-center gap-8 overflow-hidden rounded-xl border border-primary-100 bg-linear-to-b from-secondary-100 via-primary-50 to-surface p-6 pb-20 lg:grid-cols-12 lg:p-10 lg:pb-24">
        <SceneDecor />
        <div className="flex flex-col gap-4 lg:col-span-7">
          <h1 className="text-display font-bold lg:text-display-lg">
            Selamat Datang di{" "}
            <span className="block text-[2.75rem] leading-tight font-extrabold tracking-tight text-primary-800 lg:text-[4rem]">
              SIGAP DIARE!
            </span>
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
            <ButtonLink href="/daftar" variant="sunny">
              Daftar Sekarang
              <ArrowRight aria-hidden className="size-5" />
            </ButtonLink>
            <ButtonLink href="/masuk" variant="outlined">
              Masuk dengan Kode Akses
            </ButtonLink>
          </div>
        </div>
        <div className="mx-auto w-full max-w-xs lg:col-span-5 lg:max-w-none">
          <Illustration name="keluarga" priority />
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
          {PILLARS.map(({ title, text, Icon, tone }) => (
            <li key={title} className={`flex flex-col gap-2 rounded-xl border p-5 ${TONES[tone].tile}`}>
              <IconBubble Icon={Icon} tone={tone} />
              <h3 className="text-h3 font-bold">{title}</h3>
              <p className="text-body text-on-surface-variant">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
