import { describe, expect, it } from "vitest";
import { scoreAnswer, summarizeAttempt, type ScorableQuestion } from "./eval-scoring";

function q(partial: Partial<ScorableQuestion> & Pick<ScorableQuestion, "id" | "type">): ScorableQuestion {
  return {
    section: null,
    points: 1,
    scored: true,
    answerKey: null,
    reverseScored: false,
    scaleMin: null,
    scaleMax: null,
    ...partial,
  };
}

describe("scoreAnswer", () => {
  it("SCALE: nilai yang dipilih", () => {
    expect(scoreAnswer(q({ id: "s", type: "SCALE" }), { questionId: "s", scaleValue: 4 })).toBe(4);
  });

  it("SCALE: skor terbalik pada rentang default 1–5", () => {
    const question = q({ id: "s", type: "SCALE", reverseScored: true });
    expect(scoreAnswer(question, { questionId: "s", scaleValue: 1 })).toBe(5);
    expect(scoreAnswer(question, { questionId: "s", scaleValue: 4 })).toBe(2);
  });

  it("SCALE: skor terbalik pada rentang khusus 0–4", () => {
    const question = q({ id: "s", type: "SCALE", reverseScored: true, scaleMin: 0, scaleMax: 4 });
    expect(scoreAnswer(question, { questionId: "s", scaleValue: 0 })).toBe(4);
  });

  it("SCALE: menolak nilai di luar rentang", () => {
    expect(() => scoreAnswer(q({ id: "s", type: "SCALE" }), { questionId: "s", scaleValue: 6 })).toThrow(RangeError);
  });

  it("CHOICE: benar = bobot, salah = 0", () => {
    const question = q({ id: "c", type: "CHOICE", answerKey: "b", points: 2 });
    expect(scoreAnswer(question, { questionId: "c", optionId: "b" })).toBe(2);
    expect(scoreAnswer(question, { questionId: "c", optionId: "a" })).toBe(0);
  });

  it("TEXT selalu null (manual), dan soal tidak dinilai selalu null", () => {
    expect(scoreAnswer(q({ id: "t", type: "TEXT" }), { questionId: "t", textValue: "jawaban" })).toBeNull();
    expect(
      scoreAnswer(q({ id: "c", type: "CHOICE", answerKey: "a", scored: false }), { questionId: "c", optionId: "a" }),
    ).toBeNull();
  });

  it("tidak dijawab → null", () => {
    expect(scoreAnswer(q({ id: "c", type: "CHOICE", answerKey: "a" }), undefined)).toBeNull();
  });
});

describe("summarizeAttempt", () => {
  const questions = [
    q({ id: "c1", type: "CHOICE", answerKey: "a", section: "Pengetahuan" }),
    q({ id: "c2", type: "CHOICE", answerKey: "b", section: "Pengetahuan" }),
    q({ id: "s1", type: "SCALE", section: "Sikap" }),
    q({ id: "s2", type: "SCALE", section: "Sikap", reverseScored: true }),
    q({ id: "t1", type: "TEXT", section: "Pengetahuan", points: 3 }),
    q({ id: "t2", type: "TEXT", scored: false }),
  ];

  it("menjumlahkan skor otomatis dan menunda total saat isian belum dinilai", () => {
    const summary = summarizeAttempt(questions, [
      { questionId: "c1", optionId: "a" },
      { questionId: "c2", optionId: "a" },
      { questionId: "s1", scaleValue: 5 },
      { questionId: "s2", scaleValue: 2 },
      { questionId: "t1", textValue: "Memberi oralit" },
      { questionId: "t2", textValue: "Saran terbuka" },
    ]);
    expect(summary.autoScore).toBe(1 + 0 + 5 + 4);
    expect(summary.pendingManual).toBe(1);
    expect(summary.totalScore).toBeNull();
    expect(summary.sectionScores).toEqual({ Pengetahuan: 1, Sikap: 9 });
  });

  it("menghitung total setelah isian dinilai, dengan skor dibatasi bobot", () => {
    const summary = summarizeAttempt(questions, [
      { questionId: "c1", optionId: "a" },
      { questionId: "s1", scaleValue: 3 },
      { questionId: "t1", textValue: "Memberi oralit", score: 9 },
    ]);
    expect(summary.pendingManual).toBe(0);
    expect(summary.totalScore).toBe(1 + 3 + 3);
    expect(summary.sectionScores).toEqual({ Pengetahuan: 4, Sikap: 3 });
  });

  it("isian kosong tidak menunggu penilaian", () => {
    const summary = summarizeAttempt(questions, [{ questionId: "t1", textValue: "   " }]);
    expect(summary.pendingManual).toBe(0);
    expect(summary.totalScore).toBe(0);
  });
});
