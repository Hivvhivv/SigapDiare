// Pembuat CSV sederhana. Pemisah titik koma agar langsung terbaca di Excel berbahasa Indonesia
// (yang memakai koma sebagai pemisah desimal). SPSS dapat memilih pemisah saat impor.
export const CSV_SEPARATOR = ";";

export type CsvValue = string | number | null | undefined;

function escapeCell(value: CsvValue) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  // Cegah formula injection saat dibuka di spreadsheet.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[";\n\r]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

/** Baris → teks CSV dengan BOM UTF-8 (agar huruf non-ASCII tampil benar di Excel). */
export function toCsv(rows: CsvValue[][]): string {
  return "﻿" + rows.map((row) => row.map(escapeCell).join(CSV_SEPARATOR)).join("\r\n") + "\r\n";
}
