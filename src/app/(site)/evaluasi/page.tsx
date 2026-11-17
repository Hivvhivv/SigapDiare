import { ArrowRight, ClipboardCheck, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Chip } from "@/components/ui/chip";
import { EVAL_DEFAULT_INTRO } from "@/content/copy/eval";
import { formatDateTimeId } from "@/lib/dates";
import { PHASE_FRIENDLY_LABEL, PHASE_SLUG } from "@/lib/eval/window";
import { requireRespondent } from "@/server/guards";
import { getRespondentEvalOverview, type PhaseOverview } from "@/server/queries/eval";

export const metadata: Metadata = { title: "Kuis Pengetahuan" };

export default async function EvaluationPage() {
  const user = await requireRespondent();
  const phases = await getRespondentEvalOverview(user.id);

  return (
    <Container narrow>
      <PageHeader
        title="Kuis Pengetahuan"
        description="Ada dua kuis singkat: Kuis Awal sebelum belajar dan Kuis Akhir sesudahnya. Jawaban Ayah/Bunda membantu penelitian SIGAP DIARE."
      />
      <ul className="flex flex-col gap-4">
        {phases.map((phase) => (
          <li key={phase.phase}>
            <PhaseCard phase={phase} />
          </li>
        ))}
      </ul>
    </Container>
  );
}

function statusChip(phase: PhaseOverview) {
  if (phase.attempt?.submittedAt) return <Chip tone="success">Selesai</Chip>;
  if (phase.lockedReason) return <Chip tone="neutral">Terkunci</Chip>;
  switch (phase.status) {
    case "OPEN":
      return phase.attempt ? <Chip tone="warning">Belum dikirim</Chip> : <Chip tone="primary">Sedang dibuka</Chip>;
    case "UPCOMING":
      return <Chip tone="warning">Belum dibuka</Chip>;
    case "CLOSED":
      return <Chip tone="neutral">Sudah ditutup</Chip>;
    default:
      return <Chip tone="neutral">Belum dijadwalkan</Chip>;
  }
}

function PhaseCard({ phase }: { phase: PhaseOverview }) {
  const label = PHASE_FRIENDLY_LABEL[phase.phase];
  const actionable = phase.status === "OPEN" && !phase.lockedReason && phase.instrument;
  const done = Boolean(phase.attempt?.submittedAt);

  let note: string;
  if (done) note = "Terima kasih, jawaban sudah tersimpan.";
  else if (phase.lockedReason) note = phase.lockedReason;
  else if (phase.status === "UPCOMING" && phase.instrument?.opensAt) note = `Dibuka mulai ${formatDateTimeId(phase.instrument.opensAt)} WIB.`;
  else if (phase.status === "OPEN" && phase.instrument?.closesAt) note = `Dapat dikerjakan sampai ${formatDateTimeId(phase.instrument.closesAt)} WIB.`;
  else if (phase.status === "CLOSED") note = "Waktu pengerjaan sudah berakhir.";
  else if (phase.status === "OPEN") note = `${phase.questionCount} soal.`;
  else note = "Kuis ini belum dibuka. Nanti akan diberi tahu oleh peneliti atau kader.";

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-50">
            {phase.lockedReason && !done ? (
              <Lock aria-hidden className="size-6 text-on-surface-variant" />
            ) : (
              <ClipboardCheck aria-hidden className="size-6 text-primary-600" />
            )}
          </span>
          <h2 className="text-h3 font-bold">{label}</h2>
        </div>
        {statusChip(phase)}
      </div>
      <p className="text-body text-on-surface-variant">{phase.instrument?.intro ?? EVAL_DEFAULT_INTRO[phase.phase]}</p>
      <p className="text-caption text-on-surface-variant">{note}</p>
      {actionable && !done && (
        <span className="inline-flex items-center gap-1 text-label font-semibold text-primary-700">
          {phase.attempt ? "Lanjutkan" : "Mulai"} {label}
          <ArrowRight aria-hidden className="size-4" />
        </span>
      )}
    </>
  );

  const className = "flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface p-5";
  return actionable || done ? (
    <Link href={`/evaluasi/${PHASE_SLUG[phase.phase]}`} className={`${className} hover:bg-surface-container`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
