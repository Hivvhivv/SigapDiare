/**
 * Menormalkan nomor HP Indonesia ke E.164 (+628…).
 * Menerima 08…, 628…, +628…, dengan spasi/tanda hubung/titik/kurung.
 */
export function normalizeIndonesianPhone(input: string): string | null {
  const compact = input.replace(/[\s\-().]/g, "");
  let national: string;
  if (/^\+62\d+$/.test(compact)) national = compact.slice(3);
  else if (/^62\d+$/.test(compact)) national = compact.slice(2);
  else if (/^0\d+$/.test(compact)) national = compact.slice(1);
  else return null;
  // Nomor seluler: 8 diikuti 8–11 digit (total 10–13 digit dengan awalan 0).
  if (!/^8\d{8,11}$/.test(national)) return null;
  return `+62${national}`;
}

/** +6281234567890 → 0812-3456-7890 */
export function formatPhone(e164: string): string {
  const local = `0${e164.slice(3)}`;
  return local.replace(/^(\d{4})(\d{4})(\d+)$/, "$1-$2-$3");
}
