// Teks kuis untuk orang tua (PRD Lampiran A, disesuaikan agar menyapa ayah & bunda).
// Teks pembuka di instrumen (diisi admin) diutamakan bila ada.

export const EVAL_DEFAULT_INTRO = {
  PRETEST:
    "Sebelum mulai belajar, yuk jawab beberapa pertanyaan singkat tentang diare pada anak. Jawab saja sesuai yang Ayah/Bunda ketahui sekarang.",
  POSTTEST:
    "Selamat, Ayah/Bunda sudah mempelajari materi SIGAP DIARE! Yuk jawab kembali pertanyaan berikut sesuai pengetahuan setelah belajar.",
} as const;

export const EVAL_INSTRUCTIONS = [
  "Tidak ada nilai lulus atau gagal. Jawab apa adanya, tidak ada jawaban yang memalukan.",
  "Jawaban tersimpan otomatis. Boleh berhenti dulu dan lanjut lagi nanti selama kuis masih dibuka.",
  "Setelah dikirim, jawaban tidak bisa diubah lagi.",
];

export const EVAL_THANK_YOU = "Terima kasih, Ayah/Bunda! Jawaban sudah tersimpan.";
