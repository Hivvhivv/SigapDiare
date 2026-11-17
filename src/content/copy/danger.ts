import type { DangerSign } from "@/lib/safety/danger-signs";

// Teks cadangan tanda bahaya (dari dokumen desain master). Versi yang disetujui tenaga
// kesehatan akan dikelola lewat konten klinis; lihat ARCHITECTURE.md §9.

export const DANGER_SIGN_TEXT: Record<DangerSign, { label: string; detail: string }> = {
  LETHARGIC: {
    label: "Anak sangat lemas atau lesu",
    detail: "Anak tampak tidak bertenaga, sulit dibangunkan, atau tidak merespons seperti biasa.",
  },
  UNABLE_TO_DRINK: {
    label: "Tidak mampu minum atau menyusu",
    detail: "Anak menolak atau tidak sanggup minum maupun menyusu.",
  },
  SUNKEN_EYES: {
    label: "Mata tampak cekung",
    detail: "Mata anak terlihat lebih masuk ke dalam dari biasanya.",
  },
  DRY_MOUTH: {
    label: "Mulut tampak kering",
    detail: "Bibir dan lidah anak terlihat kering.",
  },
  PERSISTENT_VOMITING: {
    label: "Muntah terus-menerus",
    detail: "Anak memuntahkan hampir semua yang diminum atau dimakan.",
  },
  BLOOD_IN_STOOL: {
    label: "Ada darah dalam tinja",
    detail: "Tinja anak bercampur darah.",
  },
  WORSENING: {
    label: "Kondisi anak semakin memburuk",
    detail: "Keadaan anak tidak membaik atau justru bertambah berat.",
  },
};

export const DANGER_REFERRAL =
  "Segera bawa anak ke puskesmas, klinik, atau rumah sakit terdekat. Jangan menunggu.";

export const EMERGENCY_NUMBER = "119";
