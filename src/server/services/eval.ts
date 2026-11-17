import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "../db";
import { scoreAnswer, summarizeAttempt, type ScorableQuestion } from "./eval-scoring";

const SCORABLE_SELECT = {
  id: true,
  type: true,
  section: true,
  points: true,
  scored: true,
  answerKey: true,
  reverseScored: true,
  scaleMin: true,
  scaleMax: true,
  required: true,
} satisfies Prisma.EvalQuestionSelect;

function toScorable(q: Prisma.EvalQuestionGetPayload<{ select: typeof SCORABLE_SELECT }>): ScorableQuestion {
  return {
    ...q,
    section: q.section ?? null,
    answerKey: q.answerKey ?? null,
    scaleMin: q.scaleMin ?? null,
    scaleMax: q.scaleMax ?? null,
  };
}

/** Pertanyaan wajib yang belum dijawab pada sebuah attempt (dicek ulang di server saat kirim). */
export async function missingRequired(attemptId: string, instrumentId: string) {
  const [questions, answers] = await Promise.all([
    db.evalQuestion.findMany({ where: { instrumentId, required: true }, select: { id: true, order: true } }),
    db.evalAnswer.findMany({
      where: { attemptId },
      select: { questionId: true, optionId: true, scaleValue: true, textValue: true },
    }),
  ]);
  const answered = new Set(
    answers
      .filter((a) => a.optionId != null || a.scaleValue != null || Boolean(a.textValue?.trim()))
      .map((a) => a.questionId),
  );
  return questions.filter((q) => !answered.has(q.id));
}

/** Mengirim attempt: skor otomatis per jawaban, ringkasan, lalu attempt menjadi read-only. */
export async function finalizeAttempt(attemptId: string, instrumentId: string) {
  const [questions, answers] = await Promise.all([
    db.evalQuestion.findMany({ where: { instrumentId }, select: SCORABLE_SELECT }),
    db.evalAnswer.findMany({ where: { attemptId } }),
  ]);
  const scorable = questions.map(toScorable);
  const byId = new Map(scorable.map((q) => [q.id, q]));

  const answerScores = answers
    .map((a) => {
      const question = byId.get(a.questionId);
      if (!question || question.type === "TEXT") return null;
      return { id: a.id, score: scoreAnswer(question, a) };
    })
    .filter((x): x is { id: string; score: number | null } => x !== null);

  const summary = summarizeAttempt(scorable, answers);

  await db.$transaction([
    ...answerScores.map((a) => db.evalAnswer.update({ where: { id: a.id }, data: { score: a.score } })),
    db.evalAttempt.update({
      where: { id: attemptId },
      data: {
        submittedAt: new Date(),
        autoScore: summary.autoScore,
        totalScore: summary.totalScore,
        sectionScores: summary.sectionScores,
      },
    }),
  ]);
  return summary;
}

/** Hitung ulang skor setelah admin menilai isian. */
export async function recalculateAttempt(attemptId: string) {
  const attempt = await db.evalAttempt.findUniqueOrThrow({ where: { id: attemptId }, include: { answers: true } });
  const questions = await db.evalQuestion.findMany({ where: { instrumentId: attempt.instrumentId }, select: SCORABLE_SELECT });
  const summary = summarizeAttempt(questions.map(toScorable), attempt.answers);
  await db.evalAttempt.update({
    where: { id: attemptId },
    data: { autoScore: summary.autoScore, totalScore: summary.totalScore, sectionScores: summary.sectionScores },
  });
  return summary;
}
