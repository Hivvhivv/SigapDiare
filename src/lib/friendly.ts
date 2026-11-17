// Teks ramah yang bergantung pada data (sapaan waktu, penyemangat). Fungsi murni.
import { DEFAULT_TIMEZONE } from "./dates";

/** "Selamat pagi/siang/sore/malam" menurut jam lokal (WIB). */
export function timeGreeting(now: Date, timeZone = DEFAULT_TIMEZONE): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hourCycle: "h23" }).format(now));
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

/** Nama depan untuk sapaan singkat ("Sarah Wulandari" → "Sarah"). */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** Pesan penyemangat checklist harian. */
export function checklistEncouragement(done: number, total: number): string {
  if (total === 0) return "Daftar kebiasaan sedang disiapkan.";
  if (done === 0) return "Yuk, mulai dari satu kebiasaan dulu. Centang yang sudah dilakukan hari ini.";
  if (done >= total) return "Luar biasa! Semua kebiasaan sehat sudah dilakukan hari ini.";
  const left = total - done;
  if (done / total >= 0.5) return `Hebat, tinggal ${left} lagi. Si kecil makin terlindungi!`;
  return `Bagus, sudah ${done} kebiasaan. Tinggal ${left} lagi.`;
}
