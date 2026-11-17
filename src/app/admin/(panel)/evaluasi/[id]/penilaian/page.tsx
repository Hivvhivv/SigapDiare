import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GradeForm } from "@/components/admin/eval/grade-form";
import { Callout } from "@/components/ui/callout";
import { Chip } from "@/components/ui/chip";
import { PHASE_LABEL } from "@/lib/eval/window";
import { cn } from "@/lib/utils";
import { db } from "@/server/db";
import { isObjectId, requireAdmin } from "@/server/guards";
import { getGradingData } from "@/server/queries/eval";

export const metadata: Metadata = { title: "Penilaian Isian" };

export default async function GradingPage(props: PageProps<"/admin/evaluasi/[id]/penilaian">) {
  await requireAdmin();
  const { id } = await props.params;
  if (!isObjectId(id)) notFound();
  const instrument = await db.evalInstrument.findUnique({ where: { id }, select: { id: true, phase: true, version: true } });
  if (!instrument) notFound();

  const search = await props.searchParams;
  const questionParam = typeof search.soal === "string" && isObjectId(search.soal) ? search.soal : null;
  const filter = search.filter === "belum" ? "belum" : "semua";
  const { questions, selected, answers } = await getGradingData(instrument.id, questionParam);
  const base = `/admin/evaluasi/${instrument.id}/penilaian`;
  const shown = filter === "belum" ? answers.filter((a) => a.score === null) : answers;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={`/admin/evaluasi/${instrument.id}`}
          className="inline-flex w-fit items-center gap-1 text-label font-semibold text-primary-700 hover:underline"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {PHASE_LABEL[instrument.phase]} v{instrument.version}
        </Link>
        <h1 className="text-h1 font-bold">Penilaian Isian</h1>
        <p className="text-body text-on-surface-variant">
          Hanya jawaban yang sudah dikirim. Responden ditampilkan dengan kode responden, tanpa nama.
        </p>
      </div>

      {questions.length === 0 ? (
        <Callout variant="info">Instrumen ini tidak memiliki soal isian yang dinilai.</Callout>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
          <nav aria-label="Soal isian" className="flex flex-col gap-2">
            {questions.map((q) => (
              <Link
                key={q.id}
                href={`${base}?soal=${q.id}`}
                aria-current={selected?.id === q.id ? "page" : undefined}
                className={cn(
                  "rounded-lg border p-3",
                  selected?.id === q.id ? "border-2 border-primary-600 bg-primary-50" : "border-outline-variant bg-surface hover:bg-surface-container",
                )}
              >
                <p className="line-clamp-2 text-body font-semibold">{q.prompt}</p>
                <p className="text-caption text-on-surface-variant tabular-nums">
                  {q.graded}/{q.answered} dinilai · bobot {q.points}
                </p>
              </Link>
            ))}
          </nav>

          {selected && (
            <section className="flex flex-col gap-4">
              <h2 className="text-h3 font-bold">{selected.prompt}</h2>
              {selected.rubric && (
                <Callout variant="info" title="Contoh jawaban / pedoman">
                  <p className="whitespace-pre-line">{selected.rubric}</p>
                </Callout>
              )}
              <div className="flex gap-2">
                {(["semua", "belum"] as const).map((f) => (
                  <Link
                    key={f}
                    href={`${base}?soal=${selected.id}&filter=${f}`}
                    className={cn(
                      "rounded-full px-4 py-2 text-label font-semibold",
                      filter === f ? "bg-primary-600 text-white" : "bg-surface-container text-on-surface",
                    )}
                  >
                    {f === "semua" ? "Semua" : "Belum dinilai"}
                  </Link>
                ))}
              </div>
              {shown.length === 0 ? (
                <p className="rounded-lg border border-dashed border-outline-variant p-6 text-center text-body text-on-surface-variant">
                  {filter === "belum" ? "Semua jawaban sudah dinilai." : "Belum ada jawaban yang dikirim."}
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {shown.map((answer) => (
                    <li key={answer.id} className="rounded-lg border border-outline-variant bg-surface p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Chip tone="neutral">{answer.respondentCode}</Chip>
                        {answer.score === null ? <Chip tone="warning">Belum dinilai</Chip> : <Chip tone="success">Nilai {answer.score}</Chip>}
                      </div>
                      <p className="mb-3 text-body whitespace-pre-line">{answer.textValue}</p>
                      <GradeForm answerId={answer.id} maxPoints={selected.points} score={answer.score} note={answer.scoreNote} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
