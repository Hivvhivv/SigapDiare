// Validasi Catatan Diare (pelacak), catatan pemberian cairan/zinc, dan rencana dari tenaga kesehatan.
// Fungsi murni; dipakai server action dan unit test.
import { jakartaLocalToUtc } from "@/lib/dates";
import type { DangerInput } from "@/lib/safety/danger-signs";

export const CONSISTENCY = ["NORMAL", "SOFT", "WATERY"] as const;
export const DRINKING = ["NORMAL", "REDUCED", "UNABLE"] as const;
export const CONDITION = ["ACTIVE", "FUSSY", "LETHARGIC"] as const;
export const NOTES_MAX = 1000;
const MAX_COUNT = 30;
const MAX_AGE_DAYS = 60;
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

export type TrackerEntryData = {
  recordedAt: Date;
  stoolCount: number;
  consistency: (typeof CONSISTENCY)[number];
  bloodInStool: boolean | null;
  vomitCount: number | null;
  persistentVomiting: boolean | null;
  drinkingAbility: (typeof DRINKING)[number] | null;
  generalCondition: (typeof CONDITION)[number] | null;
  sunkenEyes: boolean | null;
  dryMouth: boolean | null;
  worsening: boolean | null;
  notes: string | null;
};

type Errors = Record<string, string[]>;
type Get = (key: string) => string | null;
type Parsed<T> = { ok: true; data: T } | { ok: false; errors: Errors };

function addError(errors: Errors, key: string, message: string) {
  (errors[key] ??= []).push(message);
}

function readCount(get: Get, key: string, errors: Errors, required: boolean): number | null {
  const raw = (get(key) ?? "").trim();
  if (raw === "") {
    if (required) addError(errors, key, "Wajib diisi");
    return null;
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > MAX_COUNT) {
    addError(errors, key, `Isi angka 0 sampai ${MAX_COUNT}`);
    return null;
  }
  return n;
}

function readEnum<T extends readonly string[]>(get: Get, key: string, values: T): T[number] | null {
  const raw = get(key) ?? "";
  return (values as readonly string[]).includes(raw) ? (raw as T[number]) : null;
}

/** Kotak centang: dicentang = true, tidak = null (tidak dilaporkan). */
function readCheck(get: Get, key: string): boolean | null {
  return get(key) === "on" ? true : null;
}

function readYesNo(get: Get, key: string): boolean | null {
  const raw = get(key);
  if (raw === "ya") return true;
  if (raw === "tidak") return false;
  return null;
}

export function parseTrackerEntry(get: Get, now: Date): Parsed<TrackerEntryData> {
  const errors: Errors = {};

  const recordedAt = jakartaLocalToUtc(get("recordedAt") ?? "");
  if (!recordedAt) addError(errors, "recordedAt", "Isi tanggal dan jam");
  else if (recordedAt.getTime() > now.getTime() + FUTURE_TOLERANCE_MS) addError(errors, "recordedAt", "Waktu tidak boleh di masa depan");
  else if (now.getTime() - recordedAt.getTime() > MAX_AGE_DAYS * 24 * 60 * 60 * 1000) {
    addError(errors, "recordedAt", `Hanya bisa mencatat ${MAX_AGE_DAYS} hari terakhir`);
  }

  const stoolCount = readCount(get, "stoolCount", errors, true);
  const consistency = readEnum(get, "consistency", CONSISTENCY);
  if (!consistency) addError(errors, "consistency", "Pilih bentuk tinja");
  const vomitCount = readCount(get, "vomitCount", errors, false);

  const notes = (get("notes") ?? "").trim();
  if (notes.length > NOTES_MAX) addError(errors, "notes", `Catatan maksimal ${NOTES_MAX} karakter`);

  if (Object.keys(errors).length || !recordedAt || stoolCount === null || !consistency) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      recordedAt,
      stoolCount,
      consistency,
      bloodInStool: readYesNo(get, "bloodInStool"),
      vomitCount,
      persistentVomiting: readCheck(get, "persistentVomiting"),
      drinkingAbility: readEnum(get, "drinkingAbility", DRINKING),
      generalCondition: readEnum(get, "generalCondition", CONDITION),
      sunkenEyes: readCheck(get, "sunkenEyes"),
      dryMouth: readCheck(get, "dryMouth"),
      worsening: readCheck(get, "worsening"),
      notes: notes || null,
    },
  };
}

/** Bagian catatan yang diperiksa mesin tanda bahaya. */
export function toDangerInput(data: Pick<
  TrackerEntryData,
  "generalCondition" | "drinkingAbility" | "bloodInStool" | "persistentVomiting" | "sunkenEyes" | "dryMouth" | "worsening"
>): DangerInput {
  return {
    generalCondition: data.generalCondition,
    drinkingAbility: data.drinkingAbility,
    bloodInStool: data.bloodInStool,
    persistentVomiting: data.persistentVomiting,
    sunkenEyes: data.sunkenEyes,
    dryMouth: data.dryMouth,
    worsening: data.worsening,
  };
}

export type CareLogData = { type: "ORALIT" | "FLUID"; amountMl: number; givenAt: Date };

export function parseCareLog(get: Get, now: Date): Parsed<CareLogData> {
  const errors: Errors = {};
  const type = get("type") === "FLUID" ? "FLUID" : get("type") === "ORALIT" ? "ORALIT" : null;
  if (!type) addError(errors, "type", "Pilih oralit atau cairan lain");
  const amount = Number((get("amountMl") ?? "").trim());
  if (!Number.isInteger(amount) || amount < 5 || amount > 3000) addError(errors, "amountMl", "Isi jumlah dalam ml (5–3000)");
  const givenAt = jakartaLocalToUtc(get("givenAt") ?? "");
  if (!givenAt) addError(errors, "givenAt", "Isi jam pemberian");
  else if (givenAt.getTime() > now.getTime() + FUTURE_TOLERANCE_MS) addError(errors, "givenAt", "Waktu tidak boleh di masa depan");
  if (Object.keys(errors).length || !type || !givenAt) return { ok: false, errors };
  return { ok: true, data: { type, amountMl: amount, givenAt } };
}

export type CarePlanData = { zincDays: number | null; fluidTargetMl: number | null; instructionNote: string | null };

/** Rencana perawatan: DIISI ORANG TUA sesuai instruksi tenaga kesehatan. Tidak ada nilai bawaan. */
export function parseCarePlan(get: Get): Parsed<CarePlanData> {
  const errors: Errors = {};
  const optionalInt = (key: string, min: number, max: number, message: string) => {
    const raw = (get(key) ?? "").trim();
    if (raw === "") return null;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < min || n > max) {
      addError(errors, key, message);
      return null;
    }
    return n;
  };
  const zincDays = optionalInt("zincDays", 1, 30, "Isi 1–30 hari, atau kosongkan");
  const fluidTargetMl = optionalInt("fluidTargetMl", 50, 5000, "Isi 50–5000 ml, atau kosongkan");
  const note = (get("instructionNote") ?? "").trim();
  if (note.length > NOTES_MAX) addError(errors, "instructionNote", `Maksimal ${NOTES_MAX} karakter`);
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, data: { zincDays, fluidTargetMl, instructionNote: note || null } };
}
