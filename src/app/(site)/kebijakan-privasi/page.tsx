import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Callout } from "@/components/ui/callout";

export const metadata: Metadata = { title: "Kebijakan Privasi" };

// Draf ringkas. Teks final ditetapkan peneliti sesuai persetujuan etik (PRD Q6).
const SECTIONS = [
  {
    title: "Data yang kami kumpulkan",
    body: "Nama dan nomor HP Anda, profil anak (nama panggilan, tanggal lahir, jenis kelamin, berat badan bila diisi), catatan pemantauan, checklist, dan jawaban evaluasi.",
  },
  {
    title: "Untuk apa data digunakan",
    body: "Untuk menampilkan fitur pemantauan bagi Anda dan untuk keperluan penelitian SIGAP DIARE. Jawaban evaluasi disimpan dengan kode responden, terpisah dari nama dan nomor HP.",
  },
  {
    title: "Siapa yang dapat melihat",
    body: "Data anak hanya dapat dilihat oleh Anda sendiri. Admin dapat melihat daftar responden dan kode akses untuk membantu yang lupa kode. Laporan penelitian tidak mencantumkan nama atau nomor HP.",
  },
  {
    title: "Keamanan",
    body: "Website menggunakan koneksi aman (HTTPS). Kode akses disimpan dalam bentuk terenkripsi.",
  },
  {
    title: "Hak Anda",
    body: "Anda dapat meminta data dihapus dengan menghubungi admin. Data evaluasi yang sudah tidak terhubung dengan identitas dapat tetap digunakan untuk penelitian sesuai persetujuan.",
  },
];

export default function PrivacyPage() {
  return (
    <Container narrow>
      <PageHeader title="Kebijakan Privasi" description="Ringkasan cara SIGAP DIARE menjaga data Anda dan si kecil." />
      <Callout variant="info" className="mb-8">
        Versi kebijakan: 2026-11 (draf). Teks final akan disesuaikan dengan persetujuan etik penelitian.
      </Callout>
      <div className="flex flex-col gap-6">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-1 text-h3 font-bold">{section.title}</h2>
            <p className="text-body-lg text-on-surface-variant">{section.body}</p>
          </section>
        ))}
      </div>
    </Container>
  );
}
