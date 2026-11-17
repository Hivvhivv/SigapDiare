export const DEFAULT_TIMEZONE = "Asia/Jakarta";
// WIB tidak mengenal daylight saving, jadi offset-nya tetap.
const JAKARTA_OFFSET = "+07:00";

/** Nilai <input type="datetime-local"> (WIB, "2026-11-20T08:00") → Date UTC. null bila kosong/tidak valid. */
export function jakartaLocalToUtc(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00${JAKARTA_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Date UTC → nilai <input type="datetime-local"> dalam WIB. */
export function utcToJakartaLocalInput(date: Date | null | undefined): string {
  if (!date) return "";
  const local = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

/** Tanggal lokal dalam format YYYY-MM-DD. */
export function localDateString(date: Date, timeZone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** YYYY-MM-DD → Date pada tengah malam UTC (format kolom @db.Date). */
export function dateOnlyToUtc(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

/** Tanggal hari ini (lokal pengguna) sebagai Date tengah malam UTC. */
export function todayAsDateOnly(timeZone = DEFAULT_TIMEZONE, now = new Date()): Date {
  return dateOnlyToUtc(localDateString(now, timeZone));
}

/** Usia dalam bulan penuh. Kedua argumen berupa tanggal tengah malam UTC. */
export function ageInMonths(birthDate: Date, today: Date): number {
  let months =
    (today.getUTCFullYear() - birthDate.getUTCFullYear()) * 12 +
    (today.getUTCMonth() - birthDate.getUTCMonth());
  if (today.getUTCDate() < birthDate.getUTCDate()) months -= 1;
  return Math.max(0, months);
}

export function formatAge(months: number): string {
  if (months < 1) return "kurang dari 1 bulan";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} bulan`;
  if (rest === 0) return `${years} tahun`;
  return `${years} tahun ${rest} bulan`;
}

export function formatDateId(date: Date, timeZone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat("id-ID", { timeZone, day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function formatDateTimeId(date: Date, timeZone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
