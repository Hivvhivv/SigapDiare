import { z } from "zod";

// Validasi form soal evaluasi (admin) dan jawaban (responden). Lihat PRD EVAL-09.

export const MAX_OPTIONS = 6;
export const MAX_SCALE_POINTS = 10;
export const TEXT_ANSWER_MAX = 500;

export type ChoiceOption = { id: string; label: string };

export type QuestionData = {
  type: "SCALE" | "CHOICE" | "TEXT";
  prompt: string;
  section: string | null;
  required: boolean;
  points: number;
  scored: boolean;
  options: ChoiceOption[] | null;
  scaleMin: number | null;
  scaleMax: number | null;
  scaleLabels: Record<string, string> | null;
  textVariant: "SHORT" | "LONG" | null;
  answerKey: string | null;
  reverseScored: boolean;
  rubric: string | null;
};

type Errors = Record<string, string[]>;
type Get = (key: string) => string | null;

const commonSchema = z.object({
  type: z.enum(["SCALE", "CHOICE", "TEXT"], { error: "Pilih tipe soal" }),
  prompt: z.string().trim().min(3, "Teks soal minimal 3 karakter").max(500, "Teks soal maksimal 500 karakter"),
  section: z.string().trim().max(60, "Nama bagian maksimal 60 karakter"),
});

const pointsSchema = z.coerce
  .number({ error: "Bobot harus angka" })
  .int("Bobot harus bilangan bulat")
  .min(1, "Bobot minimal 1")
  .max(10, "Bobot maksimal 10");

/** Id pilihan jawaban: 8 karakter heksadesimal acak (Web Crypto, aman di server maupun browser). */
export function newOptionId() {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function addError(errors: Errors, key: string, message: string) {
  (errors[key] ??= []).push(message);
}

/** Membaca form editor soal. `get` biasanya `(k) => formData.get(k)` sebagai string. */
export function parseQuestionForm(
  get: Get,
  makeId: () => string = newOptionId,
): { ok: true; data: QuestionData } | { ok: false; errors: Errors } {
  const errors: Errors = {};
  const common = commonSchema.safeParse({
    type: get("type") ?? "",
    prompt: get("prompt") ?? "",
    section: get("section") ?? "",
  });
  if (!common.success) return { ok: false, errors: z.flattenError(common.error).fieldErrors as Errors };

  const { type, prompt } = common.data;
  const data: QuestionData = {
    type,
    prompt,
    section: common.data.section || null,
    required: get("required") === "on",
    points: 1,
    scored: true,
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    textVariant: null,
    answerKey: null,
    reverseScored: false,
    rubric: null,
  };

  if (type === "SCALE") {
    const min = Number(get("scaleMin") ?? "1");
    const max = Number(get("scaleMax") ?? "5");
    if (![0, 1].includes(min)) addError(errors, "scaleMin", "Nilai terendah harus 0 atau 1");
    if (!Number.isInteger(max) || max <= min || max - min + 1 > MAX_SCALE_POINTS || max < 2) {
      addError(errors, "scaleMax", `Nilai tertinggi harus lebih besar dari nilai terendah (maks. ${MAX_SCALE_POINTS} titik)`);
    }
    if (!errors.scaleMin && !errors.scaleMax) {
      const labels: Record<string, string> = {};
      for (let point = min; point <= max; point++) {
        const label = (get(`label_${point}`) ?? "").trim();
        if (label.length > 40) addError(errors, `label_${point}`, "Label maksimal 40 karakter");
        if (label) labels[String(point)] = label;
      }
      if (!labels[String(min)] || !labels[String(max)]) {
        addError(errors, "scaleLabels", "Isi label untuk nilai terendah dan tertinggi");
      }
      data.scaleMin = min;
      data.scaleMax = max;
      data.scaleLabels = labels;
    }
    data.reverseScored = get("reverseScored") === "on";
    data.points = 1;
  }

  if (type === "CHOICE") {
    const options: ChoiceOption[] = [];
    let keyId: string | null = null;
    const keyIndex = get("answerKey");
    for (let i = 0; i < MAX_OPTIONS; i++) {
      const label = (get(`option_${i}`) ?? "").trim();
      if (!label) continue;
      if (label.length > 200) addError(errors, `option_${i}`, "Pilihan maksimal 200 karakter");
      const existingId = get(`option_id_${i}`) ?? "";
      const id = /^[a-f0-9]{8}$/.test(existingId) ? existingId : makeId();
      options.push({ id, label });
      if (keyIndex === String(i)) keyId = id;
    }
    if (options.length < 2) addError(errors, "options", "Isi minimal 2 pilihan jawaban");
    if (!keyId) addError(errors, "answerKey", "Tandai satu pilihan sebagai kunci jawaban");
    const points = pointsSchema.safeParse(get("points") ?? "1");
    if (!points.success) addError(errors, "points", points.error.issues[0].message);
    else data.points = points.data;
    data.options = options;
    data.answerKey = keyId;
  }

  if (type === "TEXT") {
    const variant = get("textVariant");
    data.textVariant = variant === "LONG" ? "LONG" : "SHORT";
    data.scored = get("scored") === "on";
    const rubric = (get("rubric") ?? "").trim();
    if (rubric.length > 1000) addError(errors, "rubric", "Contoh jawaban maksimal 1000 karakter");
    data.rubric = rubric || null;
    if (data.scored) {
      const points = pointsSchema.safeParse(get("points") ?? "1");
      if (!points.success) addError(errors, "points", points.error.issues[0].message);
      else data.points = points.data;
    }
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

/** Jawaban dari responden; divalidasi lagi terhadap soalnya di server. */
export const answerInputSchema = z.object({
  attemptId: z.string().regex(/^[a-f0-9]{24}$/i),
  questionId: z.string().regex(/^[a-f0-9]{24}$/i),
  optionId: z.string().max(20).nullable().optional(),
  scaleValue: z.number().int().nullable().optional(),
  textValue: z.string().max(TEXT_ANSWER_MAX, `Jawaban maksimal ${TEXT_ANSWER_MAX} karakter`).nullable().optional(),
});

export type AnswerInput = z.infer<typeof answerInputSchema>;
