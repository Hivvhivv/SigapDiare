import { CircleCheck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizRunner, type AnswerValue } from "@/components/eval/quiz-runner";
import { ComingSoon } from "@/components/layout/coming-soon";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { EVAL_DEFAULT_INTRO, EVAL_INSTRUCTIONS, EVAL_THANK_YOU } from "@/content/copy/eval";
import { formatDateTimeId } from "@/lib/dates";
import { PHASE_FRIENDLY_LABEL, PHASE_SLUG, phaseFromSlug } from "@/lib/eval/window";
import { startAttempt } from "@/server/actions/eval";
import { requireRespondent } from "@/server/guards";
import { getAttemptView, hasSubmittedPhase } from "@/server/queries/eval";

export const metadata: Metadata = { title: "Kuis" };

export default async function EvaluationPhasePage(props: PageProps<"/evaluasi/[phase]">) {
  const user = await requireRespondent();
  const { phase: slug } = await props.params;
  const phase = phaseFromSlug(slug);
  if (!phase) notFound();

  const label = PHASE_FRIENDLY_LABEL[phase];
  const view = await getAttemptView(user.id, phase);
  const back = { href: "/evaluasi", label: "Semua Kuis" };

  if (!view || view.status === "UNSCHEDULED" || view.questions.length === 0) {
    return (
      <Container narrow>
        <PageHeader title={label} back={back} />
        <ComingSoon title={`${label} belum dibuka`} description="Kuis ini belum dibuka. Nanti akan diberi tahu oleh peneliti atau kader." />
      </Container>
    );
  }

  const { instrument, attempt, status, questions } = view;
  const intro = instrument.intro ?? EVAL_DEFAULT_INTRO[phase];

  // Sudah dikirim
  if (attempt?.submittedAt) {
    const showResults = status === "CLOSED" && instrument.showResultsAfterClose && attempt.totalScore != null;
    const sections = (attempt.sectionScores as Record<string, number> | null) ?? {};
    return (
      <Container narrow>
        <PageHeader title={label} back={back} />
        <div className="flex flex-col items-center gap-3 rounded-xl border border-outline-variant bg-surface p-8 text-center">
          <CircleCheck aria-hidden className="size-14 text-success" />
          <h2 className="text-h2 font-bold">{EVAL_THANK_YOU}</h2>
          <p className="text-body text-on-surface-variant">Dikirim pada {formatDateTimeId(attempt.submittedAt)} WIB.</p>
          {showResults && (
            <div className="mt-2 w-full rounded-lg bg-primary-50 p-4 text-left">
              <p className="text-body font-semibold">Skor Anda: {attempt.totalScore}</p>
              <ul className="mt-1 text-caption text-on-surface-variant">
                {Object.entries(sections).map(([name, score]) => (
                  <li key={name}>
                    {name}: {score}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ButtonLink href="/beranda" variant="tonal" className="mt-2">
            Kembali ke Beranda
          </ButtonLink>
        </div>
      </Container>
    );
  }

  if (phase === "POSTTEST" && !(await hasSubmittedPhase(view.participantId, "PRETEST"))) {
    return (
      <Container narrow>
        <PageHeader title={label} back={back} />
        <Callout variant="info">Kerjakan Kuis Awal dulu, ya. Kuis Akhir terbuka setelah Kuis Awal dikirim.</Callout>
      </Container>
    );
  }

  if (status !== "OPEN") {
    return (
      <Container narrow>
        <PageHeader title={label} back={back} />
        <Callout variant="info">
          {status === "UPCOMING" && instrument.opensAt
            ? `${label} dibuka mulai ${formatDateTimeId(instrument.opensAt)} WIB.`
            : `Waktu pengerjaan ${label} sudah berakhir.`}
        </Callout>
      </Container>
    );
  }

  // Belum mulai: halaman pembuka
  if (!attempt) {
    return (
      <Container narrow>
        <PageHeader title={label} description={intro} back={back} />
        <div className="rounded-xl border border-outline-variant bg-surface p-6">
          <h2 className="mb-3 text-h3 font-bold">Petunjuk</h2>
          <ul className="mb-4 ml-5 list-disc text-body">
            <li>Ada {questions.length} soal.</li>
            {EVAL_INSTRUCTIONS.map((line) => (
              <li key={line}>{line}</li>
            ))}
            {instrument.closesAt && <li>Batas waktu: {formatDateTimeId(instrument.closesAt)} WIB.</li>}
          </ul>
          <form action={startAttempt}>
            <input type="hidden" name="phase" value={PHASE_SLUG[phase]} />
            <Button type="submit" className="w-full sm:w-auto">
              Mulai {label}
            </Button>
          </form>
        </div>
      </Container>
    );
  }

  const initialAnswers: Record<string, AnswerValue> = Object.fromEntries(
    attempt.answers.map((a) => [a.questionId, { optionId: a.optionId, scaleValue: a.scaleValue, textValue: a.textValue }]),
  );

  return (
    <Container narrow>
      <PageHeader title={label} back={back} />
      <QuizRunner attemptId={attempt.id} questions={questions} initialAnswers={initialAnswers} />
    </Container>
  );
}
