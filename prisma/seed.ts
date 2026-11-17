// Data awal SIGAP DIARE. Aman dijalankan berulang (idempoten).
// TIDAK berisi angka dosis apa pun (CLAUDE.md aturan keselamatan no. 2).
import "dotenv/config";
import { PrismaClient, type ContentKind, type ContentStatus } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const db = new PrismaClient();

const CHECKLIST_ITEMS = [
  "Mencuci tangan dengan sabun sebelum menyiapkan makanan",
  "Mencuci tangan dengan sabun sebelum makan atau menyuapi anak",
  "Mencuci tangan dengan sabun setelah BAB atau mengganti popok",
  "Menjaga kebersihan makanan (tertutup dan dimasak matang)",
  "Menggunakan air bersih untuk minum dan memasak",
  "Membersihkan peralatan makan dan botol minum anak",
  "Menjaga kebersihan lingkungan rumah dan jamban",
];

const TOPICS: { slug: string; title: string; summary: string; order: number; kind: ContentKind; status: ContentStatus }[] = [
  {
    slug: "mengenal-diare",
    title: "Mengenal Diare",
    summary: "Apa itu diare, penyebab, cara penularan, gejala, dan risiko dehidrasi pada anak.",
    order: 1,
    kind: "GENERAL",
    status: "PUBLISHED",
  },
  {
    slug: "pencegahan",
    title: "Pencegahan Diare",
    summary: "Cegah diare dimulai dari rumah: kebersihan tangan, makanan, air, dan lingkungan.",
    order: 2,
    kind: "GENERAL",
    status: "PUBLISHED",
  },
  {
    slug: "penanganan",
    title: "Penanganan Diare (LINTAS DIARE)",
    summary: "Langkah penanganan awal: oralit, zinc, ASI dan makanan, antibiotik rasional, serta nasihat.",
    order: 3,
    kind: "CLINICAL",
    status: "DRAFT",
  },
  {
    slug: "tanda-bahaya",
    title: "Tanda Bahaya Diare",
    summary: "Kenali kondisi yang membutuhkan pertolongan medis segera.",
    order: 4,
    kind: "CLINICAL",
    status: "PUBLISHED",
  },
];

const PENDING_REVIEW = "Jawaban sedang disiapkan dan menunggu peninjauan tenaga kesehatan.";

const FAQ: { category: string; question: string; answer: string; kind: ContentKind; status: ContentStatus }[] = [
  {
    category: "Seputar Diare",
    question: "Apa yang dimaksud dengan diare?",
    answer:
      "Diare merupakan kondisi ketika anak mengalami buang air besar dengan konsistensi tinja lebih cair atau lembek dan frekuensinya lebih sering dari biasanya.",
    kind: "GENERAL",
    status: "PUBLISHED",
  },
  {
    category: "Seputar Diare",
    question: "Apa penyebab diare pada anak?",
    answer: "Diare dapat disebabkan oleh infeksi virus, bakteri, atau parasit.",
    kind: "GENERAL",
    status: "PUBLISHED",
  },
  {
    category: "Pencegahan",
    question: "Bagaimana cara mencegah diare?",
    answer:
      "Menjaga kebersihan tangan, makanan, air, dan lingkungan merupakan langkah penting untuk membantu mencegah diare pada anak. Ibu dapat memakai Checklist Harian di SIGAP DIARE untuk membiasakannya.",
    kind: "GENERAL",
    status: "PUBLISHED",
  },
  { category: "Penanganan", question: "Apa fungsi oralit?", answer: PENDING_REVIEW, kind: "CLINICAL", status: "DRAFT" },
  { category: "Penanganan", question: "Mengapa zinc diberikan pada anak diare?", answer: PENDING_REVIEW, kind: "CLINICAL", status: "DRAFT" },
  { category: "Penanganan", question: "Apakah ASI tetap diberikan saat anak diare?", answer: PENDING_REVIEW, kind: "CLINICAL", status: "DRAFT" },
  { category: "Penanganan", question: "Bagaimana mengenali tanda dehidrasi?", answer: PENDING_REVIEW, kind: "CLINICAL", status: "DRAFT" },
  { category: "Penanganan", question: "Kapan anak harus dibawa ke fasilitas kesehatan?", answer: PENDING_REVIEW, kind: "CLINICAL", status: "DRAFT" },
  {
    category: "Penggunaan Website",
    question: "Bagaimana cara menggunakan website?",
    answer:
      "Masuk dengan kode akses Ibu. Di Beranda, Ibu dapat membaca materi Edukasi, mengisi Checklist Harian, mencatat kondisi si kecil, dan mengikuti Evaluasi saat jadwalnya dibuka. Halaman Tanda Bahaya selalu bisa dibuka dari tombol merah di bagian atas.",
    kind: "GENERAL",
    status: "PUBLISHED",
  },
  {
    category: "Penggunaan Website",
    question: "Bagaimana menghubungi pengelola?",
    answer:
      "Buka halaman Bantuan (Lupa Kode Akses) di bagian bawah website, lalu tekan tombol Hubungi Admin via WhatsApp.",
    kind: "GENERAL",
    status: "PUBLISHED",
  },
];

async function seedAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD belum diatur, akun admin dilewati.");
    return;
  }
  if (password.length < 12) throw new Error("ADMIN_SEED_PASSWORD minimal 12 karakter");
  // Akun dari seed adalah Super Admin pertama (dapat menambah admin lain).
  const existing = await db.user.findFirst({ where: { email } });
  if (existing) {
    if (existing.role === "ADMIN") {
      await db.user.update({ where: { id: existing.id }, data: { role: "SUPER_ADMIN" } });
      console.log(`Admin ${email} dinaikkan menjadi Super Admin.`);
    } else {
      console.log(`Super Admin ${email} sudah ada.`);
    }
    return;
  }
  await db.user.create({
    data: { name: "Super Admin SIGAP DIARE", email, role: "SUPER_ADMIN", passwordHash: await hashPassword(password) },
  });
  console.log(`Super Admin ${email} dibuat.`);
}

async function main() {
  await seedAdmin();

  for (const [index, label] of CHECKLIST_ITEMS.entries()) {
    const existing = await db.checklistItem.findFirst({ where: { label } });
    if (!existing) {
      await db.checklistItem.create({ data: { label, order: index + 1, scope: "PREVENTION", status: "PUBLISHED" } });
    }
  }

  for (const topic of TOPICS) {
    await db.topic.upsert({ where: { slug: topic.slug }, create: topic, update: {} });
  }

  for (const [index, faq] of FAQ.entries()) {
    const existing = await db.faqItem.findFirst({ where: { question: faq.question } });
    if (!existing) await db.faqItem.create({ data: { ...faq, order: index + 1 } });
  }

  const whatsapp = process.env.SUPPORT_WHATSAPP?.replace(/\D/g, "");
  if (whatsapp) {
    await db.siteSetting.upsert({
      where: { key: "support.whatsapp" },
      create: { key: "support.whatsapp", value: whatsapp },
      update: { value: whatsapp },
    });
  }

  console.log("Seed selesai.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
