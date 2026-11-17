import { describe, expect, it } from "vitest";
import { parseQuestionForm } from "./eval";

function form(values: Record<string, string>) {
  return (key: string) => values[key] ?? null;
}

let counter = 0;
const makeId = () => `0000000${++counter}`.slice(-8);

describe("parseQuestionForm", () => {
  it("menolak teks soal kosong dan tipe tidak dikenal", () => {
    const result = parseQuestionForm(form({ type: "LAIN", prompt: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.type).toBeDefined();
      expect(result.errors.prompt).toBeDefined();
    }
  });

  it("SCALE: rentang 1–5 dengan label ujung, skor terbalik", () => {
    const result = parseQuestionForm(
      form({
        type: "SCALE",
        prompt: "Saya mencuci tangan sebelum menyiapkan makanan",
        section: "Perilaku",
        required: "on",
        scaleMin: "1",
        scaleMax: "5",
        label_1: "Sangat Tidak Setuju",
        label_3: "Ragu-ragu",
        label_5: "Sangat Setuju",
        reverseScored: "on",
      }),
    );
    expect(result).toEqual({
      ok: true,
      data: expect.objectContaining({
        type: "SCALE",
        section: "Perilaku",
        required: true,
        scaleMin: 1,
        scaleMax: 5,
        scaleLabels: { "1": "Sangat Tidak Setuju", "3": "Ragu-ragu", "5": "Sangat Setuju" },
        reverseScored: true,
        answerKey: null,
        options: null,
      }),
    });
  });

  it("SCALE: wajib ada label ujung dan rentang yang masuk akal", () => {
    const noLabels = parseQuestionForm(form({ type: "SCALE", prompt: "Pernyataan", scaleMin: "1", scaleMax: "5" }));
    expect(noLabels.ok).toBe(false);
    const badRange = parseQuestionForm(form({ type: "SCALE", prompt: "Pernyataan", scaleMin: "1", scaleMax: "1" }));
    expect(badRange.ok === false && badRange.errors.scaleMax).toBeTruthy();
    const tooWide = parseQuestionForm(form({ type: "SCALE", prompt: "Pernyataan", scaleMin: "0", scaleMax: "10" }));
    expect(tooWide.ok === false && tooWide.errors.scaleMax).toBeTruthy();
  });

  it("CHOICE: melewati pilihan kosong, kunci menunjuk id pilihan, id lama dipertahankan", () => {
    const result = parseQuestionForm(
      form({
        type: "CHOICE",
        prompt: "Apa fungsi oralit?",
        option_0: "Mengganti cairan tubuh",
        option_id_0: "abcdef12",
        option_1: "",
        option_2: "Menghentikan diare seketika",
        answerKey: "0",
        points: "2",
      }),
      makeId,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.options).toEqual([
        { id: "abcdef12", label: "Mengganti cairan tubuh" },
        { id: expect.stringMatching(/^\d{8}$/), label: "Menghentikan diare seketika" },
      ]);
      expect(result.data.answerKey).toBe("abcdef12");
      expect(result.data.points).toBe(2);
    }
  });

  it("CHOICE: minimal 2 pilihan dan wajib ada kunci", () => {
    const result = parseQuestionForm(form({ type: "CHOICE", prompt: "Soal", option_0: "Satu" }), makeId);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.options).toBeDefined();
      expect(result.errors.answerKey).toBeDefined();
    }
  });

  it("TEXT: tidak dinilai tidak memerlukan bobot", () => {
    const result = parseQuestionForm(form({ type: "TEXT", prompt: "Saran untuk website", textVariant: "LONG" }));
    expect(result).toEqual({
      ok: true,
      data: expect.objectContaining({ type: "TEXT", textVariant: "LONG", scored: false, rubric: null }),
    });
  });

  it("TEXT: dinilai dengan bobot dan contoh jawaban", () => {
    const result = parseQuestionForm(
      form({ type: "TEXT", prompt: "Sebutkan langkah LINTAS DIARE", scored: "on", points: "3", rubric: "Oralit, zinc, ASI" }),
    );
    expect(result.ok && result.data.points).toBe(3);
    expect(result.ok && result.data.rubric).toBe("Oralit, zinc, ASI");
    const badPoints = parseQuestionForm(form({ type: "TEXT", prompt: "Soal isian", scored: "on", points: "0" }));
    expect(badPoints.ok).toBe(false);
  });
});
