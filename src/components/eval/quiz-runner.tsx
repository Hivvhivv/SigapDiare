"use client";

import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Chip } from "@/components/ui/chip";
import { inputClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { TEXT_ANSWER_MAX } from "@/lib/validation/eval";
import { saveAnswer, submitAttempt } from "@/server/actions/eval";
import type { PublicEvalQuestion } from "@/server/queries/eval";

export type AnswerValue = { optionId?: string | null; scaleValue?: number | null; textValue?: string | null };

const LETTERS = "ABCDEF";
const TEXT_SAVE_DELAY_MS = 800;

function isAnswered(question: PublicEvalQuestion, value: AnswerValue | undefined) {
  if (!value) return false;
  if (question.type === "CHOICE") return Boolean(value.optionId);
  if (question.type === "SCALE") return value.scaleValue != null;
  return Boolean(value.textValue?.trim());
}

/** Pengerjaan evaluasi: satu soal per layar, simpan otomatis, tinjau, lalu kirim. DESIGN.md §6.13 */
export function QuizRunner({
  attemptId,
  questions,
  initialAnswers,
}: {
  attemptId: string;
  questions: PublicEvalQuestion[];
  initialAnswers: Record<string, AnswerValue>;
}) {
  const [index, setIndex] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [answers, setAnswers] = useState(initialAnswers);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();
  const pending = useRef(new Map<string, { timer: ReturnType<typeof setTimeout>; value: AnswerValue }>());

  useEffect(() => {
    const timers = pending.current;
    return () => timers.forEach(({ timer }) => clearTimeout(timer));
  }, []);

  async function persist(questionId: string, value: AnswerValue) {
    setSaveState("saving");
    const result = await saveAnswer({ attemptId, questionId, ...value });
    if (result.ok) {
      setSaveState("saved");
      setError(null);
    } else {
      setSaveState("error");
      setError(result.message);
    }
  }

  function update(questionId: string, value: AnswerValue, debounce = false) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    const existing = pending.current.get(questionId);
    if (existing) clearTimeout(existing.timer);
    if (debounce) {
      const timer = setTimeout(() => {
        pending.current.delete(questionId);
        void persist(questionId, value);
      }, TEXT_SAVE_DELAY_MS);
      pending.current.set(questionId, { timer, value });
    } else {
      pending.current.delete(questionId);
      void persist(questionId, value);
    }
  }

  /** Simpan segera isian yang masih menunggu jeda ketik. */
  async function flushPending() {
    const entries = [...pending.current.entries()];
    pending.current.clear();
    await Promise.all(
      entries.map(([questionId, { timer, value }]) => {
        clearTimeout(timer);
        return persist(questionId, value);
      }),
    );
  }

  async function goTo(nextIndex: number) {
    await flushPending();
    setIndex(nextIndex);
    setReviewing(false);
    window.scrollTo({ top: 0 });
  }

  async function openReview() {
    await flushPending();
    setReviewing(true);
    setConfirming(false);
    window.scrollTo({ top: 0 });
  }

  const missingRequired = questions.filter((q) => q.required && !isAnswered(q, answers[q.id]));
  const answeredCount = questions.filter((q) => isAnswered(q, answers[q.id])).length;

  if (reviewing) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-h2 font-bold">Tinjau Jawaban</h2>
          <p className="text-body text-on-surface-variant">
            {answeredCount} dari {questions.length} soal sudah dijawab. Ketuk nomor soal untuk mengubah jawaban.
          </p>
        </div>
        <ol className="grid grid-cols-5 gap-2 sm:grid-cols-8">
          {questions.map((q, i) => {
            const answered = isAnswered(q, answers[q.id]);
            return (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Soal ${i + 1}, ${answered ? "sudah dijawab" : "belum dijawab"}${q.required ? ", wajib" : ""}`}
                  className={cn(
                    "flex h-12 w-full items-center justify-center rounded-md text-label font-bold tabular-nums",
                    answered
                      ? "bg-primary-600 text-white"
                      : q.required
                        ? "border-2 border-danger bg-danger-soft text-danger-strong"
                        : "border border-outline-variant bg-surface text-on-surface-variant",
                  )}
                >
                  {i + 1}
                </button>
              </li>
            );
          })}
        </ol>

        {missingRequired.length > 0 && (
          <Callout variant="warning" title={`${missingRequired.length} soal wajib belum dijawab`}>
            <ul className="mt-1 flex flex-col gap-1">
              {missingRequired.map((q) => (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => goTo(questions.indexOf(q))}
                    className="text-left font-semibold text-primary-700 underline"
                  >
                    Jawab soal {questions.indexOf(q) + 1}
                  </button>
                </li>
              ))}
            </ul>
          </Callout>
        )}

        {error && <Callout variant="danger">{error}</Callout>}

        {confirming ? (
          <div role="alertdialog" aria-labelledby="confirm-title" className="rounded-xl border border-outline-variant bg-surface p-5">
            <h3 id="confirm-title" className="text-h3 font-bold">
              Kirim jawaban sekarang?
            </h3>
            <p className="mt-1 text-body text-on-surface-variant">Jawaban tidak dapat diubah setelah dikirim.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                disabled={submitting}
                onClick={() =>
                  startSubmit(async () => {
                    const result = await submitAttempt(attemptId);
                    if (result && !result.ok) setError(result.message);
                  })
                }
              >
                {submitting ? "Mengirim…" : "Ya, Kirim Jawaban"}
              </Button>
              <Button variant="outlined" disabled={submitting} onClick={() => setConfirming(false)}>
                Batal
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Button disabled={missingRequired.length > 0} onClick={() => setConfirming(true)}>
              Kirim Jawaban
            </Button>
            <Button variant="outlined" onClick={() => goTo(questions.length - 1)}>
              Kembali ke Soal
            </Button>
          </div>
        )}
      </div>
    );
  }

  const question = questions[index];
  const value = answers[question.id];
  const isLast = index === questions.length - 1;
  const progress = Math.round(((index + 1) / questions.length) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {question.section && <Chip>{question.section}</Chip>}
            <span className="text-label font-semibold text-on-surface-variant tabular-nums">
              Soal {index + 1} dari {questions.length}
            </span>
          </div>
          <SaveIndicator state={saveState} />
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-outline-variant/40">
          <div className="h-full rounded-full bg-tertiary-800 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-h3 font-bold">{question.prompt}</legend>
        <p className="-mt-2 text-caption text-on-surface-variant">{question.required ? "(wajib)" : "(opsional)"}</p>

        {question.type === "CHOICE" && (
          <ChoiceInput question={question} value={value?.optionId ?? null} onChange={(optionId) => update(question.id, { optionId })} />
        )}
        {question.type === "SCALE" && (
          <ScaleInput question={question} value={value?.scaleValue ?? null} onChange={(scaleValue) => update(question.id, { scaleValue })} />
        )}
        {question.type === "TEXT" && (
          <TextInput
            question={question}
            value={value?.textValue ?? ""}
            onChange={(textValue) => update(question.id, { textValue }, true)}
          />
        )}
      </fieldset>

      {error && <Callout variant="danger">{error}</Callout>}

      <div className="sticky bottom-28 z-10 flex justify-between gap-3 rounded-full bg-background/90 py-2 backdrop-blur lg:bottom-4">
        <Button variant="outlined" disabled={index === 0} onClick={() => goTo(index - 1)}>
          Sebelumnya
        </Button>
        {isLast ? (
          <Button onClick={openReview}>Tinjau Jawaban</Button>
        ) : (
          <Button onClick={() => goTo(index + 1)}>Selanjutnya</Button>
        )}
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  return (
    <span aria-live="polite" className="inline-flex items-center gap-1 text-caption text-on-surface-variant">
      {state === "saving" && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
      {state === "saved" && <Check aria-hidden className="size-4 text-success" />}
      {state === "error" && <CircleAlert aria-hidden className="size-4 text-danger" />}
      {state === "saving" ? "Menyimpan…" : state === "saved" ? "Tersimpan" : "Gagal menyimpan"}
    </span>
  );
}

function ChoiceInput({
  question,
  value,
  onChange,
}: {
  question: PublicEvalQuestion;
  value: string | null;
  onChange: (optionId: string | null) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Pilihan jawaban" className="flex flex-col gap-3">
      {(question.options ?? []).map((option, i) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className={cn(
              "flex min-h-14 items-center gap-3 rounded-md border px-4 py-3 text-left text-body transition-colors",
              selected ? "border-2 border-primary-600 bg-primary-50" : "border-outline-variant bg-surface hover:bg-surface-container",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-label font-bold",
                selected ? "bg-primary-600 text-white" : "border border-outline-variant text-on-surface-variant",
              )}
            >
              {LETTERS[i]}
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ScaleInput({
  question,
  value,
  onChange,
}: {
  question: PublicEvalQuestion;
  value: number | null;
  onChange: (scaleValue: number) => void;
}) {
  const min = question.scaleMin ?? 1;
  const max = question.scaleMax ?? 5;
  const labels = question.scaleLabels ?? {};
  const points = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const labelOf = (point: number) => labels[String(point)];

  return (
    <>
      {/* Mobile: daftar vertikal dengan label lengkap tiap titik */}
      <div role="radiogroup" aria-label="Pilih nilai" className="flex flex-col gap-2 sm:hidden">
        {points.map((point) => {
          const selected = value === point;
          return (
            <button
              key={point}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(point)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-md border px-4 py-2 text-left text-body",
                selected ? "border-2 border-primary-600 bg-primary-50" : "border-outline-variant bg-surface",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full text-label font-bold tabular-nums",
                  selected ? "bg-primary-600 text-white" : "border border-outline-variant",
                )}
              >
                {point}
              </span>
              {labelOf(point) ?? ""}
            </button>
          );
        })}
      </div>

      {/* Tablet & desktop: deret lingkaran dengan label di ujung */}
      <div className="hidden sm:block">
        <div role="radiogroup" aria-label="Pilih nilai" className="flex justify-between gap-2">
          {points.map((point) => {
            const selected = value === point;
            return (
              <button
                key={point}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={labelOf(point) ? `${point}, ${labelOf(point)}` : String(point)}
                title={labelOf(point)}
                onClick={() => onChange(point)}
                className={cn(
                  "flex size-14 items-center justify-center rounded-full text-label font-bold tabular-nums transition-colors",
                  selected ? "bg-primary-600 text-white" : "border border-outline-variant bg-surface hover:bg-surface-container",
                )}
              >
                {point}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between gap-4 text-caption text-on-surface-variant">
          <span className="max-w-[40%]">{labelOf(min)}</span>
          <span className="max-w-[40%] text-right">{labelOf(max)}</span>
        </div>
      </div>
    </>
  );
}

function TextInput({
  question,
  value,
  onChange,
}: {
  question: PublicEvalQuestion;
  value: string;
  onChange: (text: string) => void;
}) {
  const common = {
    id: `answer-${question.id}`,
    value,
    maxLength: TEXT_ANSWER_MAX,
    placeholder: "Tulis jawaban di sini…",
    "aria-label": "Jawaban",
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
  };
  return (
    <div className="flex flex-col gap-1">
      {question.textVariant === "LONG" ? (
        <textarea {...common} rows={5} className={cn(inputClass, "h-auto min-h-32 py-3")} />
      ) : (
        <input {...common} className={inputClass} />
      )}
      <span className="self-end text-caption text-on-surface-variant tabular-nums">
        {value.length}/{TEXT_ANSWER_MAX}
      </span>
    </div>
  );
}
