// Teks pilihan Catatan Diare. Bahasa awam, tanpa istilah diagnosis.

export const CONSISTENCY_OPTIONS = [
  { value: "NORMAL", label: "Seperti biasa", hint: "Lembut/padat seperti biasanya" },
  { value: "SOFT", label: "Lembek", hint: "Lebih lembek dari biasanya" },
  { value: "WATERY", label: "Cair", hint: "Encer seperti air" },
] as const;

export const DRINKING_OPTIONS = [
  { value: "NORMAL", label: "Seperti biasa" },
  { value: "REDUCED", label: "Berkurang" },
  { value: "UNABLE", label: "Tidak mau / tidak bisa minum" },
] as const;

export const CONDITION_OPTIONS = [
  { value: "ACTIVE", label: "Aktif, mau bermain" },
  { value: "FUSSY", label: "Rewel" },
  { value: "LETHARGIC", label: "Sangat lemas / sulit dibangunkan" },
] as const;

export const OTHER_SIGN_OPTIONS = [
  { name: "sunkenEyes", label: "Mata tampak cekung" },
  { name: "dryMouth", label: "Mulut atau bibir kering" },
  { name: "worsening", label: "Kondisi terasa makin buruk" },
] as const;

export const CONSISTENCY_LABEL = { NORMAL: "Seperti biasa", SOFT: "Lembek", WATERY: "Cair" } as const;
export const DRINKING_LABEL = { NORMAL: "Minum seperti biasa", REDUCED: "Minum berkurang", UNABLE: "Tidak mau minum" } as const;
export const CONDITION_LABEL = { ACTIVE: "Aktif", FUSSY: "Rewel", LETHARGIC: "Sangat lemas" } as const;

export const TRACKER_DISCLAIMER =
  "Catatan ini membantu Ayah/Bunda dan tenaga kesehatan melihat perubahan kondisi si kecil. SIGAP DIARE tidak menentukan diagnosis atau tingkat dehidrasi.";
