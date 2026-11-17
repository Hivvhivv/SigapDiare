"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { phaseFromSlug, PHASE_SLUG, windowStatus } from "@/lib/eval/window";
import { formString } from "@/lib/form";
import { answerInputSchema, type AnswerInput, type ChoiceOption } from "@/lib/validation/eval";
import { logActivity } from "../audit";
import { db } from "../db";
import { requireRespondent } from "../guards";
import { getCurrentInstrument, getParticipant, hasSubmittedPhase } from "../queries/eval";
import { finalizeAttempt, missingRequired } from "../services/eval";

type Result = { ok: true } | { ok: false; message: string };

export async function startAttempt(formData: FormData) {
  const user = await requireRespondent();
  const phase = phaseFromSlug(formString(formData, "phase"));
  if (!phase) redirect("/evaluasi");

  const [instrument, participant] = await Promise.all([getCurrentInstrument(phase), getParticipant(user.id)]);
  if (!instrument || !participant) redirect("/evaluasi");
  if (windowStatus(instrument.opensAt, instrument.closesAt, new Date()) !== "OPEN") redirect("/evaluasi");
  if (phase === "POSTTEST" && !(await hasSubmittedPhase(participant.id, "PRETEST"))) redirect("/evaluasi");

  const key = { participantId: participant.id, instrumentId: instrument.id };
  const existing = await db.evalAttempt.findUnique({ where: { participantId_instrumentId: key } });
  if (!existing) {
    await db.evalAttempt.create({ data: key });
    await logActivity(user.id, "eval.start", instrument.id);
  }
  redirect(`/evaluasi/${PHASE_SLUG[phase]}`);
}

/** Memuat attempt milik pengguna yang masih bisa diubah. */
async function loadEditableAttempt(userId: string, attemptId: string) {
  const attempt = await db.evalAttempt.findUnique({
    where: { id: attemptId },
    include: { participant: { select: { userId: true } }, instrument: true },
  });
  if (!attempt || attempt.participant.userId !== userId) return fail("Data evaluasi tidak ditemukan.");
  if (attempt.submittedAt) return fail("Jawaban sudah dikirim dan tidak dapat diubah.");
  if (windowStatus(attempt.instrument.opensAt, attempt.instrument.closesAt, new Date()) !== "OPEN") {
    return fail("Waktu pengerjaan sudah ditutup.");
  }
  return { ok: true as const, attempt };
}

function fail(message: string) {
  return { ok: false as const, message };
}

/** Simpan otomatis satu jawaban. Nilai kosong menghapus jawaban. */
export async function saveAnswer(input: AnswerInput): Promise<Result> {
  const user = await requireRespondent();
  const parsed = answerInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Jawaban tidak valid." };
  const { attemptId, questionId } = parsed.data;

  const loaded = await loadEditableAttempt(user.id, attemptId);
  if (!loaded.ok) return loaded;

  const question = await db.evalQuestion.findFirst({ where: { id: questionId, instrumentId: loaded.attempt.instrumentId } });
  if (!question) return { ok: false, message: "Soal tidak ditemukan." };

  const value = { optionId: null as string | null, scaleValue: null as number | null, textValue: null as string | null };
  if (question.type === "CHOICE") {
    const options = (question.options as ChoiceOption[] | null) ?? [];
    const optionId = parsed.data.optionId ?? null;
    if (optionId && !options.some((o) => o.id === optionId)) return { ok: false, message: "Pilihan tidak valid." };
    value.optionId = optionId;
  } else if (question.type === "SCALE") {
    const scaleValue = parsed.data.scaleValue ?? null;
    const min = question.scaleMin ?? 1;
    const max = question.scaleMax ?? 5;
    if (scaleValue !== null && (scaleValue < min || scaleValue > max)) return { ok: false, message: "Nilai skala tidak valid." };
    value.scaleValue = scaleValue;
  } else {
    const text = parsed.data.textValue?.trim() ?? "";
    value.textValue = text || null;
  }

  const key = { attemptId_questionId: { attemptId, questionId } };
  if (value.optionId === null && value.scaleValue === null && value.textValue === null) {
    await db.evalAnswer.deleteMany({ where: { attemptId, questionId } });
  } else {
    await db.evalAnswer.upsert({ where: key, create: { attemptId, questionId, ...value }, update: value });
  }
  return { ok: true };
}

export async function submitAttempt(attemptId: string): Promise<Result> {
  const user = await requireRespondent();
  if (!/^[a-f0-9]{24}$/i.test(attemptId)) return { ok: false, message: "Data evaluasi tidak ditemukan." };
  const loaded = await loadEditableAttempt(user.id, attemptId);
  if (!loaded.ok) return loaded;
  const { attempt } = loaded;

  const missing = await missingRequired(attempt.id, attempt.instrumentId);
  if (missing.length > 0) {
    return { ok: false, message: `Masih ada ${missing.length} soal wajib yang belum dijawab.` };
  }

  await finalizeAttempt(attempt.id, attempt.instrumentId);
  await logActivity(user.id, "eval.submit", attempt.instrumentId);
  revalidatePath("/evaluasi");
  revalidatePath("/beranda");
  redirect(`/evaluasi/${PHASE_SLUG[attempt.instrument.phase]}`);
}
