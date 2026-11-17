"use server";

import type { EvalQuestion, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { jakartaLocalToUtc } from "@/lib/dates";
import { formString, type FormState } from "@/lib/form";
import { parseQuestionForm } from "@/lib/validation/eval";
import { logAudit } from "../audit";
import { db } from "../db";
import { isObjectId, requireAdmin } from "../guards";
import { recalculateAttempt } from "../services/eval";

const LOCKED_MESSAGE = "Instrumen terkunci karena sudah ada jawaban masuk. Soal tidak dapat diubah.";

async function loadInstrument(id: string) {
  if (!isObjectId(id)) return null;
  return db.evalInstrument.findUnique({ where: { id }, include: { _count: { select: { attempts: true } } } });
}

function editorPath(id: string) {
  return `/admin/evaluasi/${id}`;
}

/** Data soal baru hasil salinan. Field disebut satu per satu agar field baru tidak ikut tersalin tanpa sengaja. */
function copyOfQuestion(q: EvalQuestion, instrumentId: string, order: number): Prisma.EvalQuestionUncheckedCreateInput {
  return {
    instrumentId,
    order,
    section: q.section,
    type: q.type,
    prompt: q.prompt,
    required: q.required,
    points: q.points,
    scored: q.scored,
    options: q.options ?? undefined,
    scaleMin: q.scaleMin,
    scaleMax: q.scaleMax,
    scaleLabels: q.scaleLabels ?? undefined,
    textVariant: q.textVariant,
    answerKey: q.answerKey,
    reverseScored: q.reverseScored,
    rubric: q.rubric,
  };
}

const createSchema = z.object({
  phase: z.enum(["PRETEST", "POSTTEST"], { error: "Pilih fase" }),
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(120, "Judul maksimal 120 karakter"),
});

export async function createInstrument(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const values = { phase: formString(formData, "phase"), title: formString(formData, "title") };
  const parsed = createSchema.safeParse(values);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const latest = await db.evalInstrument.findFirst({ where: { phase: parsed.data.phase }, orderBy: { version: "desc" } });
  const instrument = await db.evalInstrument.create({
    data: { phase: parsed.data.phase, title: parsed.data.title, version: (latest?.version ?? 0) + 1 },
  });
  await logAudit(admin.id, "eval.instrument.create", instrument.id);
  redirect(editorPath(instrument.id));
}

const settingsSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(120, "Judul maksimal 120 karakter"),
  intro: z.string().trim().max(1000, "Teks pembuka maksimal 1000 karakter"),
});

// Catatan: id dikirim lewat hidden input, bukan `.bind()`. Action hasil bind yang mengembalikan state
// membuat request menggantung saat form dikirim tanpa JavaScript (Next 16.4).
export async function updateInstrumentSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const instrument = await loadInstrument(formString(formData, "instrumentId"));
  if (!instrument) return { message: "Instrumen tidak ditemukan." };

  const values = {
    title: formString(formData, "title"),
    intro: formString(formData, "intro"),
    opensAt: formString(formData, "opensAt"),
    closesAt: formString(formData, "closesAt"),
  };
  const parsed = settingsSchema.safeParse(values);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const opensAt = values.opensAt ? jakartaLocalToUtc(values.opensAt) : null;
  const closesAt = values.closesAt ? jakartaLocalToUtc(values.closesAt) : null;
  if (values.opensAt && !opensAt) return { errors: { opensAt: ["Format waktu tidak valid"] }, values };
  if (values.closesAt && !closesAt) return { errors: { closesAt: ["Format waktu tidak valid"] }, values };
  if (closesAt && !opensAt) return { errors: { opensAt: ["Isi waktu buka bila waktu tutup diisi"] }, values };
  if (opensAt && closesAt && closesAt <= opensAt) {
    return { errors: { closesAt: ["Waktu tutup harus setelah waktu buka"] }, values };
  }

  await db.evalInstrument.update({
    where: { id: instrument.id },
    data: {
      title: parsed.data.title,
      intro: parsed.data.intro || null,
      opensAt,
      closesAt,
      showResultsAfterClose: formData.get("showResultsAfterClose") === "on",
    },
  });
  await logAudit(admin.id, "eval.instrument.settings", instrument.id);
  revalidatePath(editorPath(instrument.id));
  return { ok: true, message: "Pengaturan disimpan." };
}

export async function saveQuestion(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const instrumentId = formString(formData, "instrumentId");
  const questionId = formString(formData, "questionId") || null;
  const instrument = await loadInstrument(instrumentId);
  if (!instrument) return { message: "Instrumen tidak ditemukan." };
  if (instrument._count.attempts > 0) return { message: LOCKED_MESSAGE };

  const parsed = parseQuestionForm((key) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : null;
  });
  if (!parsed.ok) {
    // Kembalikan isian agar tidak hilang saat React me-reset form setelah action.
    const values = Object.fromEntries(
      [...formData.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string" && !entry[0].startsWith("$")),
    );
    return { errors: parsed.errors, message: "Periksa kembali isian soal.", values };
  }

  if (questionId) {
    if (!isObjectId(questionId)) return { message: "Soal tidak ditemukan." };
    const existing = await db.evalQuestion.findFirst({ where: { id: questionId, instrumentId } });
    if (!existing) return { message: "Soal tidak ditemukan." };
    await db.evalQuestion.update({ where: { id: questionId }, data: parsed.data });
  } else {
    const last = await db.evalQuestion.findFirst({ where: { instrumentId }, orderBy: { order: "desc" } });
    await db.evalQuestion.create({ data: { ...parsed.data, instrumentId, order: (last?.order ?? 0) + 1 } });
  }
  await logAudit(admin.id, "eval.question.save", instrumentId);
  revalidatePath(editorPath(instrumentId));
  redirect(editorPath(instrumentId));
}

/** Aksi daftar soal: hapus, naik, turun, duplikat. */
export async function questionAction(formData: FormData) {
  const admin = await requireAdmin();
  const instrumentId = formString(formData, "instrumentId");
  const questionId = formString(formData, "questionId");
  const op = formString(formData, "op");
  const instrument = await loadInstrument(instrumentId);
  if (!instrument || instrument._count.attempts > 0 || !isObjectId(questionId)) redirect(editorPath(instrumentId));

  const questions = await db.evalQuestion.findMany({ where: { instrumentId }, orderBy: { order: "asc" } });
  const index = questions.findIndex((q) => q.id === questionId);
  if (index === -1) redirect(editorPath(instrumentId));
  const question = questions[index];

  if (op === "delete") {
    await db.evalQuestion.delete({ where: { id: question.id } });
  } else if (op === "up" || op === "down") {
    const neighbor = questions[op === "up" ? index - 1 : index + 1];
    if (neighbor) {
      await db.$transaction([
        db.evalQuestion.update({ where: { id: question.id }, data: { order: neighbor.order } }),
        db.evalQuestion.update({ where: { id: neighbor.id }, data: { order: question.order } }),
      ]);
    }
  } else if (op === "duplicate") {
    const last = questions[questions.length - 1];
    await db.evalQuestion.create({ data: copyOfQuestion(question, instrumentId, last.order + 1) });
  }
  await logAudit(admin.id, `eval.question.${op}`, instrumentId);
  revalidatePath(editorPath(instrumentId));
}

/** Salin semua soal dari instrumen lain (mis. pretest → posttest). Hanya ke instrumen kosong & tidak terkunci. */
export async function copyQuestions(formData: FormData) {
  const admin = await requireAdmin();
  const targetId = formString(formData, "targetId");
  const sourceId = formString(formData, "sourceId");
  const target = await loadInstrument(targetId);
  if (!target || target._count.attempts > 0 || !isObjectId(sourceId)) redirect(editorPath(targetId));
  if ((await db.evalQuestion.count({ where: { instrumentId: targetId } })) > 0) redirect(editorPath(targetId));

  const source = await db.evalQuestion.findMany({ where: { instrumentId: sourceId }, orderBy: { order: "asc" } });
  await db.evalQuestion.createMany({ data: source.map((q) => copyOfQuestion(q, targetId, q.order)) });
  await logAudit(admin.id, "eval.question.copy", targetId, { sourceId });
  revalidatePath(editorPath(targetId));
}

export async function deleteInstrument(formData: FormData) {
  const admin = await requireAdmin();
  const instrument = await loadInstrument(formString(formData, "instrumentId"));
  if (!instrument || instrument._count.attempts > 0) redirect("/admin/evaluasi");
  await db.evalInstrument.delete({ where: { id: instrument.id } });
  await logAudit(admin.id, "eval.instrument.delete", instrument.id);
  redirect("/admin/evaluasi");
}

/** Penilaian manual jawaban isian (0 s.d. bobot), lalu hitung ulang skor attempt. */
export async function gradeAnswer(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const answerId = formString(formData, "answerId");
  if (!isObjectId(answerId)) return { message: "Jawaban tidak ditemukan." };
  const answer = await db.evalAnswer.findUnique({
    where: { id: answerId },
    include: { question: true, attempt: { select: { id: true, submittedAt: true, instrumentId: true } } },
  });
  if (!answer || answer.question.type !== "TEXT" || !answer.question.scored || !answer.attempt.submittedAt) {
    return { message: "Jawaban ini tidak dapat dinilai." };
  }

  const score = Number(formString(formData, "score"));
  if (!Number.isInteger(score) || score < 0 || score > answer.question.points) {
    return { message: `Nilai harus bilangan bulat 0–${answer.question.points}.` };
  }
  const note = formString(formData, "scoreNote").trim().slice(0, 300);

  await db.evalAnswer.update({
    where: { id: answer.id },
    data: { score, scoreNote: note || null, scoredById: admin.id, scoredAt: new Date() },
  });
  await recalculateAttempt(answer.attempt.id);
  await logAudit(admin.id, "eval.answer.grade", answer.id);
  revalidatePath(`/admin/evaluasi/${answer.attempt.instrumentId}/penilaian`);
  return { ok: true, message: "Nilai disimpan." };
}
