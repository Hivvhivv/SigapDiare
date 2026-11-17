import { describe, expect, it } from "vitest";
import { DANGER_SIGNS, detectDangerSigns, type DangerInput } from "./danger-signs";

describe("detectDangerSigns", () => {
  it("input kosong tidak menghasilkan tanda bahaya", () => {
    expect(detectDangerSigns({})).toEqual([]);
  });

  it("nilai yang tidak berbahaya tidak memicu tanda bahaya", () => {
    expect(
      detectDangerSigns({
        generalCondition: "FUSSY",
        drinkingAbility: "REDUCED",
        bloodInStool: false,
        persistentVomiting: false,
        sunkenEyes: false,
        dryMouth: false,
        worsening: false,
      }),
    ).toEqual([]);
  });

  it("null diperlakukan sebagai tidak dilaporkan", () => {
    expect(detectDangerSigns({ generalCondition: null, bloodInStool: null })).toEqual([]);
  });

  const single: [DangerInput, (typeof DANGER_SIGNS)[number]][] = [
    [{ generalCondition: "LETHARGIC" }, "LETHARGIC"],
    [{ drinkingAbility: "UNABLE" }, "UNABLE_TO_DRINK"],
    [{ sunkenEyes: true }, "SUNKEN_EYES"],
    [{ dryMouth: true }, "DRY_MOUTH"],
    [{ persistentVomiting: true }, "PERSISTENT_VOMITING"],
    [{ bloodInStool: true }, "BLOOD_IN_STOOL"],
    [{ worsening: true }, "WORSENING"],
  ];

  it.each(single)("%o → %s", (input, sign) => {
    expect(detectDangerSigns(input)).toEqual([sign]);
  });

  it("setiap tanda bahaya memiliki satu pemicu", () => {
    expect(single.map(([, sign]) => sign).sort()).toEqual([...DANGER_SIGNS].sort());
  });

  it("kombinasi dikembalikan dalam urutan tetap", () => {
    expect(
      detectDangerSigns({ worsening: true, bloodInStool: true, generalCondition: "LETHARGIC" }),
    ).toEqual(["LETHARGIC", "BLOOD_IN_STOOL", "WORSENING"]);
  });
});
