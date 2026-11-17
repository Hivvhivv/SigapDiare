// Penilaian evaluasi (pretest/posttest). Fungsi murni; lihat ARCHITECTURE.md §8.

export type QuestionType = "SCALE" | "CHOICE" | "TEXT";

export interface ScorableQuestion {
  id: string;
  type: QuestionType;
  section: string | null;
  points: number;
  scored: boolean;
  answerKey: string | null;
  reverseScored: boolean;
  scaleMin: number | null;
  scaleMax: number | null;
}

export interface AnswerInput {
  questionId: string;
  optionId?: string | null;
  scaleValue?: number | null;
  textValue?: string | null;
  /** Skor manual dari admin, hanya untuk TEXT. */
  score?: number | null;
}

export const DEFAULT_SCALE_MIN = 1;
export const DEFAULT_SCALE_MAX = 5;
export const DEFAULT_SECTION = "Umum";

/** Skor otomatis satu jawaban. TEXT selalu null (dinilai manual). */
export function scoreAnswer(question: ScorableQuestion, answer: AnswerInput | undefined): number | null {
  if (!question.scored || !answer) return null;
  switch (question.type) {
    case "SCALE": {
      if (answer.scaleValue == null) return null;
      const min = question.scaleMin ?? DEFAULT_SCALE_MIN;
      const max = question.scaleMax ?? DEFAULT_SCALE_MAX;
      if (answer.scaleValue < min || answer.scaleValue > max) {
        throw new RangeError(`Nilai skala ${answer.scaleValue} di luar rentang ${min}–${max}`);
      }
      return question.reverseScored ? min + max - answer.scaleValue : answer.scaleValue;
    }
    case "CHOICE":
      if (!answer.optionId) return null;
      return answer.optionId === question.answerKey ? question.points : 0;
    case "TEXT":
      return null;
  }
}

export interface AttemptSummary {
  /** Jumlah skor SCALE + CHOICE. */
  autoScore: number;
  /** null selama masih ada isian yang menunggu penilaian. */
  totalScore: number | null;
  /** Subskor per bagian (termasuk isian yang sudah dinilai). */
  sectionScores: Record<string, number>;
  /** Jumlah isian bernilai yang sudah dijawab tetapi belum dinilai. */
  pendingManual: number;
}

export function summarizeAttempt(questions: ScorableQuestion[], answers: AnswerInput[]): AttemptSummary {
  const byQuestion = new Map(answers.map((a) => [a.questionId, a]));
  let autoScore = 0;
  let manualScore = 0;
  let pendingManual = 0;
  const sectionScores: Record<string, number> = {};

  for (const question of questions) {
    if (!question.scored) continue;
    const answer = byQuestion.get(question.id);
    const section = question.section ?? DEFAULT_SECTION;
    sectionScores[section] ??= 0;

    if (question.type === "TEXT") {
      const answered = Boolean(answer?.textValue?.trim());
      if (!answered) continue;
      if (answer?.score == null) {
        pendingManual += 1;
        continue;
      }
      const score = Math.min(Math.max(answer.score, 0), question.points);
      manualScore += score;
      sectionScores[section] += score;
      continue;
    }

    const score = scoreAnswer(question, answer) ?? 0;
    autoScore += score;
    sectionScores[section] += score;
  }

  return {
    autoScore,
    totalScore: pendingManual === 0 ? autoScore + manualScore : null,
    sectionScores,
    pendingManual,
  };
}
