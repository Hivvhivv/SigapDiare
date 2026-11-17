import { ArrowDown, ArrowLeft, ArrowUp, Copy, Download, FilePenLine, PenLine, Plus, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmSubmit } from "@/components/admin/eval/confirm-submit";
import { InstrumentSettingsForm } from "@/components/admin/eval/instrument-settings-form";
import { QuestionEditor, type EditableQuestion } from "@/components/admin/eval/question-editor";
import { InstrumentStatusChip } from "@/components/admin/eval/status-chip";
import { buttonClass } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Chip } from "@/components/ui/chip";
import { utcToJakartaLocalInput } from "@/lib/dates";
import { PHASE_LABEL } from "@/lib/eval/window";
import type { ChoiceOption } from "@/lib/validation/eval";
import { copyQuestions, deleteInstrument, questionAction } from "@/server/actions/admin-eval";
import { db } from "@/server/db";
import { isObjectId, requireAdmin } from "@/server/guards";
import { getInstrumentForAdmin } from "@/server/queries/eval";

export const metadata: Metadata = { title: "Susun Instrumen" };

const TYPE_CHIP = {
  SCALE: { label: "Skala", tone: "primary" },
  CHOICE: { label: "Pilihan", tone: "secondary" },
  TEXT: { label: "Isian", tone: "warning" },
} as const;

type AdminQuestion = NonNullable<Awaited<ReturnType<typeof getInstrumentForAdmin>>>["questions"][number];

function toEditable(q: AdminQuestion | null, type: EditableQuestion["type"]): EditableQuestion {
  return {
    id: q?.id ?? null,
    type: q?.type ?? type,
    prompt: q?.prompt ?? "",
    section: q?.section ?? "",
    required: q?.required ?? true,
    points: q?.points ?? 1,
    scored: q?.scored ?? true,
    options: (q?.options as ChoiceOption[] | null) ?? [],
    answerKey: q?.answerKey ?? null,
    scaleMin: q?.scaleMin ?? 1,
    scaleMax: q?.scaleMax ?? 5,
    scaleLabels: (q?.scaleLabels as Record<string, string> | null) ?? {},
    reverseScored: q?.reverseScored ?? false,
    textVariant: q?.textVariant === "LONG" ? "LONG" : "SHORT",
    rubric: q?.rubric ?? "",
  };
}

function QuestionSummary({ question }: { question: AdminQuestion }) {
  if (question.type === "CHOICE") {
    const options = (question.options as ChoiceOption[] | null) ?? [];
    return (
      <ol className="mt-1 ml-5 list-[upper-alpha] text-caption text-on-surface-variant">
        {options.map((o) => (
          <li key={o.id} className={o.id === question.answerKey ? "font-semibold text-success-strong" : undefined}>
            {o.label}
            {o.id === question.answerKey && " ✓ kunci"}
          </li>
        ))}
      </ol>
    );
  }
  if (question.type === "SCALE") {
    const labels = (question.scaleLabels as Record<string, string> | null) ?? {};
    const min = question.scaleMin ?? 1;
    const max = question.scaleMax ?? 5;
    return (
      <p className="mt-1 text-caption text-on-surface-variant">
        {min} ({labels[String(min)]}) – {max} ({labels[String(max)]}){question.reverseScored && " · skor terbalik"}
      </p>
    );
  }
  return (
    <p className="mt-1 text-caption text-on-surface-variant">
      Isian {question.textVariant === "LONG" ? "panjang" : "singkat"} ·{" "}
      {question.scored ? `dinilai manual, bobot ${question.points}` : "tidak dinilai"}
    </p>
  );
}

export default async function InstrumentEditorPage(props: PageProps<"/admin/evaluasi/[id]">) {
  await requireAdmin();
  const { id } = await props.params;
  if (!isObjectId(id)) notFound();
  const instrument = await getInstrumentForAdmin(id);
  if (!instrument) notFound();

  const search = await props.searchParams;
  const editParam = typeof search.soal === "string" ? search.soal : null;
  const typeParam = search.tipe === "CHOICE" || search.tipe === "TEXT" ? search.tipe : "SCALE";
  const editing =
    editParam === "baru"
      ? toEditable(null, typeParam)
      : editParam
        ? (() => {
            const q = instrument.questions.find((x) => x.id === editParam);
            return q ? toEditable(q, q.type) : null;
          })()
        : null;

  const sections = [...new Set(instrument.questions.map((q) => q.section).filter((s): s is string => Boolean(s)))];
  const copySources =
    instrument.questions.length === 0 && !instrument.locked
      ? await db.evalInstrument.findMany({
          where: { id: { not: instrument.id }, questions: { some: {} } },
          orderBy: [{ phase: "asc" }, { version: "desc" }],
          select: { id: true, phase: true, version: true, title: true },
        })
      : [];
  const base = `/admin/evaluasi/${instrument.id}`;
  const textQuestionCount = instrument.questions.filter((q) => q.type === "TEXT" && q.scored).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/admin/evaluasi" className="inline-flex w-fit items-center gap-1 text-label font-semibold text-primary-700 hover:underline">
          <ArrowLeft aria-hidden className="size-4" />
          Semua instrumen
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h1 font-bold">
            {PHASE_LABEL[instrument.phase]} v{instrument.version}
          </h1>
          <InstrumentStatusChip status={instrument.status} locked={instrument.locked} />
        </div>
        <p className="text-body text-on-surface-variant">
          {instrument.questions.length} soal · {instrument._count.attempts} responden mulai mengerjakan
        </p>
        <div className="flex flex-wrap gap-2">
          {textQuestionCount > 0 && (
            <Link href={`${base}/penilaian`} className={buttonClass("tonal", "sm")}>
              <FilePenLine aria-hidden className="size-4" />
              Penilaian Isian
            </Link>
          )}
          <a href={`${base}/ekspor`} className={buttonClass("outlined", "sm")}>
            <Download aria-hidden className="size-4" />
            Ekspor Hasil (CSV)
          </a>
        </div>
      </div>

      {instrument.locked && (
        <Callout variant="info">
          Instrumen terkunci karena sudah ada jawaban masuk. Soal tidak dapat diubah, tetapi jadwal masih bisa diatur.
        </Callout>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px]">
        <section aria-labelledby="questions-title" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="questions-title" className="text-h2 font-bold">
              Daftar Soal
            </h2>
            {!instrument.locked && !editing && (
              <div className="flex flex-wrap gap-2">
                {(["SCALE", "CHOICE", "TEXT"] as const).map((t) => (
                  <Link key={t} href={`${base}?soal=baru&tipe=${t}`} className={buttonClass("tonal", "sm")}>
                    <Plus aria-hidden className="size-4" />
                    {TYPE_CHIP[t].label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {editing && !instrument.locked && (
            <QuestionEditor key={`${editing.id ?? "baru"}-${editing.type}`} instrumentId={instrument.id} question={editing} sections={sections} />
          )}

          {copySources.length > 0 && !editing && (
            <form action={copyQuestions} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-outline-variant p-4">
              <input type="hidden" name="targetId" value={instrument.id} />
              <label className="flex flex-col gap-1 text-label font-semibold">
                Salin semua soal dari
                <select name="sourceId" className="h-11 rounded-md border border-outline-variant bg-surface px-3 font-normal">
                  {copySources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {PHASE_LABEL[s.phase]} v{s.version} · {s.title}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className={buttonClass("outlined", "sm")}>
                <Copy aria-hidden className="size-4" />
                Salin Soal
              </button>
            </form>
          )}

          {instrument.questions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-outline-variant p-8 text-center text-body text-on-surface-variant">
              Belum ada soal. Tambah soal Skala, Pilihan, atau Isian.
            </p>
          ) : (
            <ol className="flex flex-col gap-3">
              {instrument.questions.map((question, index) => (
                <li
                  key={question.id}
                  className={`rounded-lg border bg-surface p-4 ${editParam === question.id ? "border-2 border-primary-600" : "border-outline-variant"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-bold tabular-nums">{index + 1}.</span>
                        <Chip tone={TYPE_CHIP[question.type].tone}>{TYPE_CHIP[question.type].label}</Chip>
                        {question.section && <Chip tone="neutral">{question.section}</Chip>}
                        {!question.required && <span className="text-caption text-on-surface-variant">opsional</span>}
                      </div>
                      <p className="text-body">{question.prompt}</p>
                      <QuestionSummary question={question} />
                    </div>
                    {!instrument.locked && (
                      <div className="flex shrink-0 flex-wrap items-center gap-1">
                        <Link href={`${base}?soal=${question.id}`} aria-label={`Ubah soal ${index + 1}`} className="flex size-10 items-center justify-center rounded-full hover:bg-surface-container">
                          <PenLine aria-hidden className="size-5" />
                        </Link>
                        {(
                          [
                            ["up", ArrowUp, "Naikkan", index === 0],
                            ["down", ArrowDown, "Turunkan", index === instrument.questions.length - 1],
                            ["duplicate", Copy, "Duplikat", false],
                          ] as const
                        ).map(([op, Icon, label, disabled]) => (
                          <form key={op} action={questionAction}>
                            <input type="hidden" name="instrumentId" value={instrument.id} />
                            <input type="hidden" name="questionId" value={question.id} />
                            <input type="hidden" name="op" value={op} />
                            <button
                              type="submit"
                              disabled={disabled}
                              aria-label={`${label} soal ${index + 1}`}
                              className="flex size-10 items-center justify-center rounded-full hover:bg-surface-container disabled:opacity-30"
                            >
                              <Icon aria-hidden className="size-5" />
                            </button>
                          </form>
                        ))}
                        <form action={questionAction}>
                          <input type="hidden" name="instrumentId" value={instrument.id} />
                          <input type="hidden" name="questionId" value={question.id} />
                          <input type="hidden" name="op" value="delete" />
                          <ConfirmSubmit
                            message={`Hapus soal ${index + 1}?`}
                            aria-label={`Hapus soal ${index + 1}`}
                            className="flex size-10 items-center justify-center rounded-full text-danger hover:bg-danger-soft"
                          >
                            <Trash2 aria-hidden className="size-5" />
                          </ConfirmSubmit>
                        </form>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="flex flex-col gap-6">
          <InstrumentSettingsForm
            instrumentId={instrument.id}
            initial={{
              title: instrument.title,
              intro: instrument.intro ?? "",
              opensAt: utcToJakartaLocalInput(instrument.opensAt),
              closesAt: utcToJakartaLocalInput(instrument.closesAt),
              showResultsAfterClose: instrument.showResultsAfterClose,
            }}
          />
          {!instrument.locked && (
            <form action={deleteInstrument}>
              <input type="hidden" name="instrumentId" value={instrument.id} />
              <ConfirmSubmit
                message="Hapus instrumen ini beserta semua soalnya?"
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-label font-semibold text-danger-strong hover:bg-danger-soft"
              >
                <Trash2 aria-hidden className="size-4" />
                Hapus Instrumen
              </ConfirmSubmit>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
