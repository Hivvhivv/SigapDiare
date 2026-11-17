import "server-only";
import type { EvalPhase, Prisma } from "@prisma/client";
import { windowStatus, type WindowStatus } from "@/lib/eval/window";
import type { ChoiceOption } from "@/lib/validation/eval";
import { db } from "../db";

// MongoDB: `{ not: null }` juga cocok dengan field yang belum ada, jadi wajib `isSet: true`.
export const SUBMITTED = { isSet: true, not: null } as const;

// Hanya field ini yang boleh sampai ke browser responden. answerKey, reverseScored, rubric TIDAK.
const PUBLIC_QUESTION_SELECT = {
  id: true,
  order: true,
  section: true,
  type: true,
  prompt: true,
  required: true,
  options: true,
  scaleMin: true,
  scaleMax: true,
  scaleLabels: true,
  textVariant: true,
} satisfies Prisma.EvalQuestionSelect;

export type PublicEvalQuestion = {
  id: string;
  order: number;
  section: string | null;
  type: "SCALE" | "CHOICE" | "TEXT";
  prompt: string;
  required: boolean;
  options: ChoiceOption[] | null;
  scaleMin: number | null;
  scaleMax: number | null;
  scaleLabels: Record<string, string> | null;
  textVariant: string | null;
};

type PublicRow = Prisma.EvalQuestionGetPayload<{ select: typeof PUBLIC_QUESTION_SELECT }>;

function toPublic(row: PublicRow): PublicEvalQuestion {
  return {
    ...row,
    section: row.section ?? null,
    scaleMin: row.scaleMin ?? null,
    scaleMax: row.scaleMax ?? null,
    textVariant: row.textVariant ?? null,
    options: (row.options as ChoiceOption[] | null) ?? null,
    scaleLabels: (row.scaleLabels as Record<string, string> | null) ?? null,
  };
}

/** Instrumen yang berlaku untuk sebuah fase: versi terbaru yang sudah dijadwalkan. */
export async function getCurrentInstrument(phase: EvalPhase) {
  return db.evalInstrument.findFirst({
    where: { phase, opensAt: { isSet: true, not: null } },
    orderBy: { version: "desc" },
  });
}

export async function getParticipant(userId: string) {
  return db.participant.findFirst({ where: { userId } });
}

export async function hasSubmittedPhase(participantId: string, phase: EvalPhase) {
  const count = await db.evalAttempt.count({ where: { participantId, submittedAt: SUBMITTED, instrument: { phase } } });
  return count > 0;
}

export type PhaseOverview = {
  phase: EvalPhase;
  instrument: { id: string; title: string; intro: string | null; opensAt: Date | null; closesAt: Date | null } | null;
  status: WindowStatus;
  questionCount: number;
  attempt: { started: boolean; submittedAt: Date | null } | null;
  lockedReason: string | null;
};

/** Ringkasan pretest & posttest untuk halaman /evaluasi responden. */
export async function getRespondentEvalOverview(userId: string): Promise<PhaseOverview[]> {
  const participant = await getParticipant(userId);
  const now = new Date();
  const pretestDone = participant ? await hasSubmittedPhase(participant.id, "PRETEST") : false;

  return Promise.all(
    (["PRETEST", "POSTTEST"] as const).map(async (phase) => {
      const instrument = await getCurrentInstrument(phase);
      if (!instrument) {
        return { phase, instrument: null, status: "UNSCHEDULED" as const, questionCount: 0, attempt: null, lockedReason: null };
      }
      const [questionCount, attempt] = await Promise.all([
        db.evalQuestion.count({ where: { instrumentId: instrument.id } }),
        participant
          ? db.evalAttempt.findUnique({
              where: { participantId_instrumentId: { participantId: participant.id, instrumentId: instrument.id } },
              select: { submittedAt: true },
            })
          : null,
      ]);
      return {
        phase,
        instrument: {
          id: instrument.id,
          title: instrument.title,
          intro: instrument.intro ?? null,
          opensAt: instrument.opensAt ?? null,
          closesAt: instrument.closesAt ?? null,
        },
        status: windowStatus(instrument.opensAt, instrument.closesAt, now),
        questionCount,
        attempt: attempt ? { started: true, submittedAt: attempt.submittedAt ?? null } : null,
        lockedReason: phase === "POSTTEST" && !pretestDone ? "Kerjakan Kuis Awal dulu, ya." : null,
      };
    }),
  );
}

/** Data pengerjaan untuk satu fase. Soal hanya berisi field publik. */
export async function getAttemptView(userId: string, phase: EvalPhase) {
  const [instrument, participant] = await Promise.all([getCurrentInstrument(phase), getParticipant(userId)]);
  if (!instrument || !participant) return null;

  const attempt = await db.evalAttempt.findUnique({
    where: { participantId_instrumentId: { participantId: participant.id, instrumentId: instrument.id } },
    include: { answers: { select: { questionId: true, optionId: true, scaleValue: true, textValue: true } } },
  });
  const questions = await db.evalQuestion.findMany({
    where: { instrumentId: instrument.id },
    orderBy: { order: "asc" },
    select: PUBLIC_QUESTION_SELECT,
  });

  return {
    instrument,
    status: windowStatus(instrument.opensAt, instrument.closesAt, new Date()),
    participantId: participant.id,
    attempt,
    questions: questions.map(toPublic),
  };
}

// ── Admin ───────────────────────────────────────────────

export async function listInstruments() {
  const instruments = await db.evalInstrument.findMany({
    orderBy: [{ phase: "asc" }, { version: "desc" }],
    include: { _count: { select: { questions: true, attempts: true } } },
  });
  const now = new Date();
  return Promise.all(
    instruments.map(async (instrument) => ({
      ...instrument,
      status: windowStatus(instrument.opensAt, instrument.closesAt, now),
      submittedCount: await db.evalAttempt.count({ where: { instrumentId: instrument.id, submittedAt: SUBMITTED } }),
    })),
  );
}

export async function getInstrumentForAdmin(id: string) {
  const instrument = await db.evalInstrument.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      _count: { select: { attempts: true } },
    },
  });
  if (!instrument) return null;
  return {
    ...instrument,
    locked: instrument._count.attempts > 0,
    status: windowStatus(instrument.opensAt, instrument.closesAt, new Date()),
  };
}

/** Isian yang perlu dinilai: hanya dari attempt yang sudah dikirim, hanya dengan kode responden. */
export async function getGradingData(instrumentId: string, questionId: string | null) {
  const questions = await db.evalQuestion.findMany({
    where: { instrumentId, type: "TEXT", scored: true },
    orderBy: { order: "asc" },
    select: { id: true, order: true, prompt: true, points: true, rubric: true },
  });

  const counts = await Promise.all(
    questions.map(async (q) => {
      const base = { questionId: q.id, attempt: { submittedAt: SUBMITTED }, textValue: { isSet: true, not: null } };
      const [answered, graded] = await Promise.all([
        db.evalAnswer.count({ where: base }),
        db.evalAnswer.count({ where: { ...base, score: { isSet: true, not: null } } }),
      ]);
      return { ...q, answered, graded };
    }),
  );

  const selected = counts.find((q) => q.id === questionId) ?? counts[0] ?? null;
  const answers = selected
    ? await db.evalAnswer.findMany({
        where: { questionId: selected.id, attempt: { submittedAt: SUBMITTED }, textValue: { isSet: true, not: null } },
        orderBy: { id: "asc" },
        select: {
          id: true,
          textValue: true,
          score: true,
          scoreNote: true,
          attempt: { select: { participant: { select: { code: true } } } },
        },
      })
    : [];

  return {
    questions: counts,
    selected,
    answers: answers
      .filter((a) => a.textValue?.trim())
      .map((a) => ({
        id: a.id,
        textValue: a.textValue ?? "",
        score: a.score ?? null,
        scoreNote: a.scoreNote ?? null,
        respondentCode: a.attempt.participant.code,
      })),
  };
}
