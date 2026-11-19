import { describe, expect, it } from "vitest";
import { detectDangerSigns } from "@/lib/safety/danger-signs";
import { parseCareLog, parseCarePlan, parseTrackerEntry, toDangerInput } from "./tracker";

const form = (values: Record<string, string>) => (key: string) => values[key] ?? null;
// 17 Nov 2026 10.00 WIB
const now = new Date("2026-11-17T03:00:00Z");

describe("parseTrackerEntry", () => {
  it("hanya waktu, jumlah BAB, dan bentuk tinja yang wajib", () => {
    const result = parseTrackerEntry(form({ recordedAt: "2026-11-17T09:30", stoolCount: "3", consistency: "WATERY" }), now);
    expect(result).toEqual({
      ok: true,
      data: {
        recordedAt: new Date("2026-11-17T02:30:00Z"),
        stoolCount: 3,
        consistency: "WATERY",
        bloodInStool: null,
        vomitCount: null,
        persistentVomiting: null,
        drinkingAbility: null,
        generalCondition: null,
        sunkenEyes: null,
        dryMouth: null,
        worsening: null,
        notes: null,
      },
    });
  });

  it("menolak isian wajib yang kosong", () => {
    const result = parseTrackerEntry(form({}), now);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["consistency", "recordedAt", "stoolCount"]);
    }
  });

  it("menolak waktu di masa depan dan terlalu lama", () => {
    expect(parseTrackerEntry(form({ recordedAt: "2026-11-17T12:00", stoolCount: "1", consistency: "SOFT" }), now).ok).toBe(false);
    expect(parseTrackerEntry(form({ recordedAt: "2026-08-01T08:00", stoolCount: "1", consistency: "SOFT" }), now).ok).toBe(false);
  });

  it("menolak jumlah bukan bilangan 0–30", () => {
    for (const stoolCount of ["-1", "31", "2.5", "abc"]) {
      expect(parseTrackerEntry(form({ recordedAt: "2026-11-17T09:00", stoolCount, consistency: "SOFT" }), now).ok).toBe(false);
    }
  });

  it("membaca isian opsional, dan meneruskan tanda bahaya ke mesin tanda bahaya", () => {
    const result = parseTrackerEntry(
      form({
        recordedAt: "2026-11-17T09:00",
        stoolCount: "6",
        consistency: "WATERY",
        bloodInStool: "ya",
        vomitCount: "4",
        persistentVomiting: "on",
        drinkingAbility: "UNABLE",
        generalCondition: "LETHARGIC",
        sunkenEyes: "on",
        dryMouth: "on",
        worsening: "on",
        notes: "  rewel sejak pagi  ",
      }),
      now,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.notes).toBe("rewel sejak pagi");
    expect(detectDangerSigns(toDangerInput(result.data))).toEqual([
      "LETHARGIC",
      "UNABLE_TO_DRINK",
      "SUNKEN_EYES",
      "DRY_MOUTH",
      "PERSISTENT_VOMITING",
      "BLOOD_IN_STOOL",
      "WORSENING",
    ]);
  });

  it("jawaban 'tidak' ada darah disimpan false, bukan tanda bahaya", () => {
    const result = parseTrackerEntry(
      form({ recordedAt: "2026-11-17T09:00", stoolCount: "2", consistency: "SOFT", bloodInStool: "tidak", drinkingAbility: "REDUCED", generalCondition: "FUSSY" }),
      now,
    );
    expect(result.ok && result.data.bloodInStool).toBe(false);
    expect(result.ok && detectDangerSigns(toDangerInput(result.data))).toEqual([]);
  });
});

describe("parseCareLog", () => {
  it("oralit/cairan dengan jumlah ml dan jam", () => {
    expect(parseCareLog(form({ type: "ORALIT", amountMl: "100", givenAt: "2026-11-17T09:45" }), now)).toEqual({
      ok: true,
      data: { type: "ORALIT", amountMl: 100, givenAt: new Date("2026-11-17T02:45:00Z") },
    });
    expect(parseCareLog(form({ type: "ZINC", amountMl: "100", givenAt: "2026-11-17T09:45" }), now).ok).toBe(false);
    expect(parseCareLog(form({ type: "FLUID", amountMl: "0", givenAt: "2026-11-17T09:45" }), now).ok).toBe(false);
  });
});

describe("parseCarePlan", () => {
  it("semua opsional, tanpa nilai bawaan", () => {
    expect(parseCarePlan(form({}))).toEqual({ ok: true, data: { zincDays: null, fluidTargetMl: null, instructionNote: null } });
  });

  it("membaca isian dari instruksi tenaga kesehatan", () => {
    expect(parseCarePlan(form({ zincDays: "10", fluidTargetMl: "600", instructionNote: "kata bidan" }))).toEqual({
      ok: true,
      data: { zincDays: 10, fluidTargetMl: 600, instructionNote: "kata bidan" },
    });
  });

  it("menolak angka di luar rentang", () => {
    expect(parseCarePlan(form({ zincDays: "0" })).ok).toBe(false);
    expect(parseCarePlan(form({ fluidTargetMl: "99999" })).ok).toBe(false);
  });
});
