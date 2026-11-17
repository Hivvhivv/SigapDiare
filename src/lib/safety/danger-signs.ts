// Mesin tanda bahaya. Fungsi murni: hanya memetakan input yang DILAPORKAN pengguna ke daftar
// tanda bahaya. Tidak menghitung derajat dehidrasi dan tidak mengeluarkan diagnosis.
// Setiap perubahan wajib disertai unit test (danger-signs.test.ts).

export const DANGER_SIGNS = [
  "LETHARGIC",
  "UNABLE_TO_DRINK",
  "SUNKEN_EYES",
  "DRY_MOUTH",
  "PERSISTENT_VOMITING",
  "BLOOD_IN_STOOL",
  "WORSENING",
] as const;

export type DangerSign = (typeof DANGER_SIGNS)[number];

export interface DangerInput {
  generalCondition?: "ACTIVE" | "FUSSY" | "LETHARGIC" | null;
  drinkingAbility?: "NORMAL" | "REDUCED" | "UNABLE" | null;
  bloodInStool?: boolean | null;
  persistentVomiting?: boolean | null;
  sunkenEyes?: boolean | null;
  dryMouth?: boolean | null;
  worsening?: boolean | null;
}

/** Mengembalikan tanda bahaya yang dilaporkan pengguna, dalam urutan DANGER_SIGNS. Bukan diagnosis. */
export function detectDangerSigns(input: DangerInput): DangerSign[] {
  const found = new Set<DangerSign>();
  if (input.generalCondition === "LETHARGIC") found.add("LETHARGIC");
  if (input.drinkingAbility === "UNABLE") found.add("UNABLE_TO_DRINK");
  if (input.sunkenEyes === true) found.add("SUNKEN_EYES");
  if (input.dryMouth === true) found.add("DRY_MOUTH");
  if (input.persistentVomiting === true) found.add("PERSISTENT_VOMITING");
  if (input.bloodInStool === true) found.add("BLOOD_IN_STOOL");
  if (input.worsening === true) found.add("WORSENING");
  return DANGER_SIGNS.filter((sign) => found.has(sign));
}
