"use client";

import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Button, buttonClass } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { FieldError, FieldShell, TextField, inputClass } from "@/components/ui/field";
import { initialFormState } from "@/lib/form";
import { cn } from "@/lib/utils";
import { MAX_OPTIONS, type ChoiceOption } from "@/lib/validation/eval";
import { saveQuestion } from "@/server/actions/admin-eval";

export type EditableQuestion = {
  id: string | null;
  type: "SCALE" | "CHOICE" | "TEXT";
  prompt: string;
  section: string;
  required: boolean;
  points: number;
  scored: boolean;
  options: ChoiceOption[];
  answerKey: string | null;
  scaleMin: number;
  scaleMax: number;
  scaleLabels: Record<string, string>;
  reverseScored: boolean;
  textVariant: "SHORT" | "LONG";
  rubric: string;
};

const TYPE_LABEL = { SCALE: "Skala", CHOICE: "Pilihan", TEXT: "Isian" } as const;

const SCALE_PRESETS: { name: string; labels: string[] }[] = [
  { name: "Setuju", labels: ["Sangat Tidak Setuju", "Tidak Setuju", "Ragu-ragu", "Setuju", "Sangat Setuju"] },
  { name: "Frekuensi", labels: ["Tidak Pernah", "Jarang", "Kadang-kadang", "Sering", "Selalu"] },
];

export function QuestionEditor({
  instrumentId,
  question,
  sections,
}: {
  instrumentId: string;
  question: EditableQuestion;
  sections: string[];
}) {
  const [state, action, pending] = useActionState(saveQuestion, initialFormState);
  const [type, setType] = useState(question.type);
  const [scaleMin, setScaleMin] = useState(question.scaleMin);
  const [scaleMax, setScaleMax] = useState(question.scaleMax);
  const [labels, setLabels] = useState(question.scaleLabels);
  const [options, setOptions] = useState<ChoiceOption[]>(
    question.options.length ? question.options : [{ id: "", label: "" }, { id: "", label: "" }],
  );
  const [answerKey, setAnswerKey] = useState(() => {
    const index = question.options.findIndex((o) => o.id === question.answerKey);
    return index >= 0 ? index : null;
  });
  const [scored, setScored] = useState(question.scored);
  const errors = state.errors ?? {};
  // Setelah validasi gagal, pakai isian terakhir sebagai default (React me-reset form setelah action).
  const sent = state.values;
  const initial = {
    prompt: sent?.prompt ?? question.prompt,
    section: sent?.section ?? question.section,
    required: sent ? sent.required === "on" : question.required,
    reverseScored: sent ? sent.reverseScored === "on" : question.reverseScored,
    points: sent?.points ?? String(question.points),
    rubric: sent?.rubric ?? question.rubric,
    textVariant: sent?.textVariant ?? question.textVariant,
  };
  const backHref = `/admin/evaluasi/${instrumentId}`;

  function applyPreset(preset: string[]) {
    setScaleMin(1);
    setScaleMax(5);
    setLabels(Object.fromEntries(preset.map((label, i) => [String(i + 1), label])));
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setAnswerKey((key) => (key === null || key === index ? null : key > index ? key - 1 : key));
  }

  const points = Array.from({ length: Math.max(0, scaleMax - scaleMin + 1) }, (_, i) => scaleMin + i);

  return (
    <form action={action} className="flex flex-col gap-5 rounded-xl border-2 border-primary-200 bg-surface p-5">
      <input type="hidden" name="instrumentId" value={instrumentId} />
      <input type="hidden" name="questionId" value={question.id ?? ""} />
      <h2 className="text-h3 font-bold">{question.id ? "Ubah Soal" : "Tambah Soal"}</h2>
      {state.message && <Callout variant="danger">{state.message}</Callout>}

      <fieldset>
        <legend className="mb-2 text-label font-semibold">Tipe soal</legend>
        <div className="grid grid-cols-3 gap-3">
          {(["SCALE", "CHOICE", "TEXT"] as const).map((t) => (
            <label
              key={t}
              className="flex h-12 cursor-pointer items-center justify-center rounded-md border border-outline-variant text-label font-semibold has-[:checked]:border-2 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
            >
              <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="sr-only" />
              {TYPE_LABEL[t]}
            </label>
          ))}
        </div>
      </fieldset>

      <FieldShell id="field-prompt" label={type === "SCALE" ? "Pernyataan" : "Pertanyaan"} errors={errors.prompt}>
        <textarea
          id="field-prompt"
          name="prompt"
          rows={3}
          required
          defaultValue={initial.prompt}
          className={cn(inputClass, "h-auto py-3")}
        />
      </FieldShell>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="section"
          label="Bagian / dimensi"
          optional
          list="eval-sections"
          placeholder="Contoh: Pengetahuan"
          defaultValue={initial.section}
          errors={errors.section}
          hint="Dipakai untuk subskor."
        />
        <datalist id="eval-sections">
          {sections.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <label className="flex cursor-pointer items-center gap-3 self-center sm:mt-7">
          <input type="checkbox" name="required" defaultChecked={initial.required} className="size-5 accent-primary-600" />
          <span className="text-body">Wajib dijawab</span>
        </label>
      </div>

      {type === "SCALE" && (
        <div className="flex flex-col gap-4 rounded-lg bg-surface-container p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-label font-semibold">Preset label:</span>
            {SCALE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset.labels)}
                className={buttonClass("tonal", "sm")}
              >
                {preset.labels[0]}â€“{preset.labels[preset.labels.length - 1]}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldShell id="field-scaleMin" label="Nilai terendah" errors={errors.scaleMin}>
              <select
                id="field-scaleMin"
                name="scaleMin"
                value={scaleMin}
                onChange={(e) => setScaleMin(Number(e.target.value))}
                className={inputClass}
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>
            </FieldShell>
            <FieldShell id="field-scaleMax" label="Nilai tertinggi" errors={errors.scaleMax}>
              <select
                id="field-scaleMax"
                name="scaleMax"
                value={scaleMax}
                onChange={(e) => setScaleMax(Number(e.target.value))}
                className={inputClass}
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </FieldShell>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-label font-semibold">Label tiap nilai (minimal nilai terendah dan tertinggi)</p>
            {points.map((point) => (
              <div key={point} className="flex items-center gap-3">
                <span className="w-8 text-center font-bold tabular-nums">{point}</span>
                <input
                  name={`label_${point}`}
                  aria-label={`Label nilai ${point}`}
                  value={labels[String(point)] ?? ""}
                  onChange={(e) => setLabels((prev) => ({ ...prev, [String(point)]: e.target.value }))}
                  maxLength={40}
                  className={inputClass}
                />
              </div>
            ))}
            <FieldError id="field-scaleLabels" errors={errors.scaleLabels} />
          </div>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" name="reverseScored" defaultChecked={initial.reverseScored} className="mt-1 size-5 accent-primary-600" />
            <span className="text-body">
              Skor terbalik <span className="text-on-surface-variant">(untuk pernyataan negatif; tidak terlihat oleh responden)</span>
            </span>
          </label>
        </div>
      )}

      {type === "CHOICE" && (
        <div className="flex flex-col gap-3 rounded-lg bg-surface-container p-4">
          <p className="text-label font-semibold">Pilihan jawaban (tandai satu kunci)</p>
          {options.map((option, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="hidden" name={`option_id_${i}`} value={option.id} />
              <label className="flex shrink-0 items-center gap-1 text-caption">
                <input
                  type="radio"
                  name="answerKey"
                  value={i}
                  checked={answerKey === i}
                  onChange={() => setAnswerKey(i)}
                  className="size-5 accent-success"
                  aria-label={`Jadikan pilihan ${i + 1} kunci jawaban`}
                />
                Kunci
              </label>
              <input
                name={`option_${i}`}
                aria-label={`Pilihan ${i + 1}`}
                value={option.label}
                onChange={(e) =>
                  setOptions((prev) => prev.map((o, j) => (j === i ? { ...o, label: e.target.value } : o)))
                }
                maxLength={200}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeOption(i)}
                disabled={options.length <= 2}
                aria-label={`Hapus pilihan ${i + 1}`}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface disabled:opacity-30"
              >
                <Trash2 aria-hidden className="size-5" />
              </button>
            </div>
          ))}
          <FieldError id="field-options" errors={errors.options} />
          <FieldError id="field-answerKey" errors={errors.answerKey} />
          {options.length < MAX_OPTIONS && (
            <Button
              variant="outlined"
              size="sm"
              className="w-fit"
              onClick={() => setOptions((prev) => [...prev, { id: "", label: "" }])}
            >
              <Plus aria-hidden className="size-4" />
              Tambah Pilihan
            </Button>
          )}
          <TextField name="points" label="Bobot jika benar" type="number" min={1} max={10} defaultValue={initial.points} errors={errors.points} className="w-32" />
        </div>
      )}

      {type === "TEXT" && (
        <div className="flex flex-col gap-4 rounded-lg bg-surface-container p-4">
          <fieldset>
            <legend className="mb-2 text-label font-semibold">Jenis isian</legend>
            <div className="flex gap-4">
              {(
                [
                  ["SHORT", "Singkat (satu baris)"],
                  ["LONG", "Panjang (paragraf)"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-2 text-body">
                  <input
                    type="radio"
                    name="textVariant"
                    value={value}
                    defaultChecked={initial.textVariant === value}
                    className="size-5 accent-primary-600"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="scored"
              checked={scored}
              onChange={(e) => setScored(e.target.checked)}
              className="size-5 accent-primary-600"
            />
            <span className="text-body">Dinilai (admin memberi nilai manual)</span>
          </label>
          {scored && (
            <>
              <TextField name="points" label="Bobot maksimal" type="number" min={1} max={10} defaultValue={initial.points} errors={errors.points} className="w-32" />
              <FieldShell id="field-rubric" label="Contoh jawaban / pedoman penilai" optional errors={errors.rubric} hint="Hanya terlihat oleh admin.">
                <textarea id="field-rubric" name="rubric" rows={3} defaultValue={initial.rubric} className={cn(inputClass, "h-auto py-3")} />
              </FieldShell>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpanâ€¦" : "Simpan Soal"}
        </Button>
        <Link href={backHref} className={buttonClass("outlined")}>
          Batal
        </Link>
      </div>
    </form>
  );
}
