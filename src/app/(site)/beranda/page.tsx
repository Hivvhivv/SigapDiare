import {
  ArrowLeftRight,
  CircleQuestionMark,
  ClipboardCheck,
  Droplets,
  GlassWater,
  MessageCircle,
  NotebookPen,
  Pill,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import { ChecklistCard } from "@/components/home/checklist-card";
import { QuickAccess } from "@/components/home/quick-access";
import { FamilyIllustration } from "@/components/illustrations/family";
import { DangerAlert } from "@/components/safety/danger-alert";
import { DoctorCard } from "@/components/safety/doctor-card";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SectionHeader } from "@/components/ui/section-header";
import { TAGLINE_SHORT } from "@/content/copy/site";
import { formatAge, formatDateTimeId } from "@/lib/dates";
import { PHASE_FRIENDLY_LABEL } from "@/lib/eval/window";
import { firstName } from "@/lib/friendly";
import { requireRespondent } from "@/server/guards";
import { getHomeData } from "@/server/queries/home";
import { getSupportWhatsapp } from "@/server/queries/settings";

export const metadata: Metadata = { title: "Beranda" };

const CONSISTENCY_LABEL = { NORMAL: "Normal", SOFT: "Lembek", WATERY: "Cair" } as const;

export default async function HomePage() {
  const user = await requireRespondent();
  const [data, whatsapp] = await Promise.all([getHomeData(user), getSupportWhatsapp()]);
  if (!data) return null;
  const { child, lastEntry, episode, checklist, openInstrument, greeting } = data;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-6 lg:gap-12 lg:px-8 lg:py-8">
      {/* Bar profil anak */}
      <section
        aria-label="Profil anak aktif"
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant bg-surface p-4"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary-100 text-h3 font-bold text-secondary-800">
            {child.nickname[0]?.toUpperCase()}
          </span>
          <div>
            <p className="flex flex-wrap items-center gap-2">
              <span className="text-h3 font-bold">{child.nickname}</span>
              <Chip tone="success">Anak Aktif</Chip>
            </p>
            <p className="text-caption text-on-surface-variant">
              {formatAge(child.ageMonths)}
              {child.weightKg ? ` · ${child.weightKg.toLocaleString("id-ID")} kg` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {episode && <Chip tone="warning">Pemantauan hari ke-{episode.dayNumber}</Chip>}
          <ButtonLink href="/profil/anak" variant="tonal" size="sm">
            <ArrowLeftRight aria-hidden className="size-4" />
            Ganti Anak
          </ButtonLink>
        </div>
      </section>

      {/* Hero */}
      <section className="grid items-center gap-6 rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50 to-surface p-6 lg:grid-cols-12 lg:p-10">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <Chip className="w-fit">
            <Sparkles aria-hidden className="size-4" />
            {TAGLINE_SHORT}
          </Chip>
          <h1 className="text-display font-bold lg:text-display-lg">
            {greeting}, <span className="text-primary-600">{firstName(user.name)}!</span>
          </h1>
          <p className="max-w-prose text-body-lg text-on-surface-variant">
            Semoga {child.nickname} sehat dan ceria hari ini. Yuk, cek kebiasaan sehat di rumah dan catat kondisi si
            kecil bila ada keluhan.
          </p>
          {lastEntry && lastEntry.dangerSigns.length > 0 ? (
            <DangerAlert signs={lastEntry.dangerSigns} />
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface p-4">
              <NotebookPen aria-hidden className="size-6 shrink-0 text-primary-600" />
              <p className="text-body">
                {lastEntry ? (
                  <>
                    <span className="font-semibold">Catatan terakhir:</span> {formatDateTimeId(lastEntry.recordedAt, user.timezone)} ·
                    BAB {lastEntry.stoolCount}× · {CONSISTENCY_LABEL[lastEntry.consistency]}
                  </>
                ) : (
                  `Belum ada catatan untuk ${child.nickname}. Catat bila si kecil BAB lebih sering atau lebih cair dari biasanya.`
                )}
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/fitur/pelacak">Catat Kondisi Hari Ini</ButtonLink>
            <ButtonLink href="/edukasi/penanganan" variant="outlined">
              Panduan Cepat LINTAS DIARE
            </ButtonLink>
          </div>
        </div>
        <div className="hidden lg:col-span-5 lg:block">
          <FamilyIllustration />
        </div>
      </section>

      {/* Mobile: kartu dokter dinaikkan agar cepat terlihat */}
      <div className="lg:hidden">
        <DoctorCard />
      </div>

      <TreatmentProgress episode={episode} />

      <QuickAccess />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ChecklistCard items={checklist.items} checked={checklist.checked} />
        </div>
        <div className="hidden lg:col-span-5 lg:block">
          <DoctorCard />
        </div>
      </div>

      {openInstrument && (
        <section className="flex flex-col gap-4 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between lg:p-8">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15">
              <ClipboardCheck aria-hidden className="size-6" />
            </span>
            <div>
              <h2 className="text-h3 font-bold">Yuk, Ikut {PHASE_FRIENDLY_LABEL[openInstrument.phase]}</h2>
              <p className="text-body text-primary-100">
                Kuis singkat seputar diare pada anak. Hanya butuh beberapa menit, tidak ada jawaban yang memalukan.
              </p>
            </div>
          </div>
          <ButtonLink href="/evaluasi" variant="white">
            Mulai Kuis
          </ButtonLink>
        </section>
      )}

      <section
        aria-labelledby="help-title"
        className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface p-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary-100">
            <CircleQuestionMark aria-hidden className="size-6 text-secondary-700" />
          </span>
          <div>
            <h2 id="help-title" className="text-h3 font-bold">
              Butuh bantuan?
            </h2>
            <p className="text-body text-on-surface-variant">Lihat jawaban pertanyaan umum, atau tanyakan langsung ke admin.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/faq" variant="outlined">
            Tanya Jawab
          </ButtonLink>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-success px-6 text-label font-semibold text-white hover:bg-success-strong"
            >
              <MessageCircle aria-hidden className="size-5" />
              Chat Admin
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

type Episode = NonNullable<Awaited<ReturnType<typeof getHomeData>>>["episode"];

function TreatmentProgress({ episode }: { episode: Episode }) {
  if (!episode) {
    return (
      <section className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-eyebrow font-bold tracking-[0.08em] text-primary-700 uppercase">Pemantauan</p>
          <h2 className="text-h3 font-bold">Si kecil sedang diare?</h2>
          <p className="text-body text-on-surface-variant">
            Mulai pemantauan untuk mencatat BAB, cairan, dan zinc sesuai anjuran tenaga kesehatan.
          </p>
        </div>
        <ButtonLink href="/fitur/pelacak" variant="tonal">
          Mulai Pemantauan Diare
        </ButtonLink>
      </section>
    );
  }

  const fluidPercent = episode.fluidTargetMl ? Math.min(100, Math.round((episode.fluidTodayMl / episode.fluidTargetMl) * 100)) : null;
  const zincPercent = episode.zincPlannedDays
    ? Math.min(100, Math.round((episode.zincDaysGiven / episode.zincPlannedDays) * 100))
    : null;

  return (
    <section aria-labelledby="progress-title">
      <SectionHeader
        id="progress-title"
        eyebrow="Pemantauan"
        title="Progres Penanganan Hari Ini"
        action={{ href: "/fitur/pelacak", label: "Lihat Grafik Lengkap" }}
      />
      <div className="flex snap-x gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
        <ProgressCard
          title="Cairan & Oralit Hari Ini"
          chip={`Tercatat ${episode.fluidLogCountToday}×`}
          Icon={GlassWater}
          value={`${episode.fluidTodayMl} ml`}
          note={episode.fluidTargetMl ? `Target dari tenaga kesehatan: ${episode.fluidTargetMl} ml` : "Belum ada target dari tenaga kesehatan."}
          percent={fluidPercent}
          barClass="bg-primary-600"
        />
        <ProgressCard
          title="Zinc"
          chip={episode.zincGivenToday ? "Sudah diberikan hari ini" : "Belum dicatat hari ini"}
          Icon={Pill}
          value={episode.zincPlannedDays ? `Hari ke-${episode.zincDaysGiven} dari ${episode.zincPlannedDays}` : `${episode.zincDaysGiven} hari tercatat`}
          note="Berikan sesuai anjuran tenaga kesehatan."
          percent={zincPercent}
          barClass="bg-secondary-700"
        />
        <ProgressCard
          title="Pemberian Oralit"
          chip="Catatan terakhir"
          Icon={Droplets}
          value={
            episode.lastOralit
              ? `${episode.lastOralit.amountMl ?? "–"} ml`
              : "Belum dicatat"
          }
          note={
            episode.lastOralit
              ? formatDateTimeId(episode.lastOralit.givenAt)
              : "Ikuti takaran dari tenaga kesehatan."
          }
          percent={null}
          barClass="bg-tertiary-800"
        />
      </div>
    </section>
  );
}

function ProgressCard({
  title,
  chip,
  Icon,
  value,
  note,
  percent,
  barClass,
}: {
  title: string;
  chip: string;
  Icon: typeof Pill;
  value: string;
  note: string;
  percent: number | null;
  barClass: string;
}) {
  return (
    <div className="min-w-[260px] snap-start rounded-lg border border-outline-variant bg-surface p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <Icon aria-hidden className="size-6 text-primary-600" />
        <Chip tone="neutral">{chip}</Chip>
      </div>
      <h3 className="text-label font-semibold text-on-surface-variant">{title}</h3>
      <p className="text-h3 font-bold">{value}</p>
      {percent !== null && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-outline-variant/40">
          <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percent}%` }} />
        </div>
      )}
      <p className="mt-2 text-caption text-on-surface-variant">{note}</p>
    </div>
  );
}
