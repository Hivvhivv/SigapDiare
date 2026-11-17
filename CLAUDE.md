# CLAUDE.md

Panduan untuk Claude Code saat bekerja di repository SIGAP DIARE.

## Tentang Proyek

SIGAP DIARE adalah website edukasi kesehatan dan pemantauan sederhana untuk ibu/pengasuh balita dalam mencegah dan menangani diare. Antarmuka berbahasa Indonesia, responsif (mobile-first), dengan login wajib untuk fitur personal. Website juga dipakai sebagai instrumen penelitian (pretest/posttest).

Dokumen acuan (baca sebelum mengerjakan fitur terkait):

- [PRD.md](PRD.md): kebutuhan produk, fitur, acceptance criteria
- [DESIGN.md](DESIGN.md): design system, token warna, tipografi, komponen, pola UI
- [ARCHITECTURE.md](ARCHITECTURE.md): stack, struktur folder, model data, auth, alur sistem

## Stack

@AGENTS.md

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript strict. Versi ini berbeda dari pengetahuan umum: baca `node_modules/next/dist/docs/` sebelum memakai API Next. Poin penting: `src/proxy.ts` (bukan `middleware.ts`), `cookies()`/`params`/`searchParams` wajib `await`, `next lint` sudah tidak ada. `cacheComponents` sengaja dimatikan (ARCHITECTURE.md ADR 010).
- Tailwind CSS v4 (token di `src/app/globals.css`, sesuai DESIGN.md) + komponen sendiri di `src/components/ui`; ikon `lucide-react`
- **MongoDB** (wajib replica set) + **Prisma 6.19** (`prisma-client-js`, import dari `@prisma/client`). Prisma 7 belum mendukung MongoDB: jangan upgrade Prisma sebelum ada dukungannya. Lihat "Aturan MongoDB" di bawah.
- Auth buatan sendiri (`src/server/session.ts`): token acak di cookie `sd_session`, hanya hash-nya disimpan di tabel `Session`. Tiga role `USER` (responden) / `ADMIN` / `SUPER_ADMIN`; cek role lewat `src/lib/auth/roles.ts` (`isStaff`, `canManageAdmins`), jangan `role === "ADMIN"`:
  - Responden: daftar sendiri dengan **nama + nomor HP** (tanpa email) → kode akses langsung tampil di layar → masuk dengan **kode akses** tersebut. Admin tidak membuatkan akun responden; lupa kode dibantu admin via WhatsApp
  - Admin & Super Admin: email + password (scrypt) di `/admin/masuk` (tautan "Login Admin" di bawah footer). Hanya Super Admin yang dapat menambah/mengelola admin (`/admin/admin`, `requireSuperAdmin()`)
- Zod 4 untuk validasi; form memakai Server Actions + `useActionState`
- Vitest (unit); Playwright (e2e) belum dipasang
- npm

## Perintah

```bash
npm install            # juga menjalankan prisma generate
npm run dev            # dev server (http://localhost:3000)
npm run lint           # ESLint
npm run typecheck      # next typegen + tsc --noEmit
npm test               # Vitest
npm run build          # build produksi
npm run db:local       # MongoDB replica set lokal tanpa instalasi (port 27017, data di .mongo-data/)
npm run db:push        # sinkronkan koleksi & index dari schema + partial unique index (prisma/indexes.ts)
npm run db:seed        # admin awal, item checklist, topik, FAQ (idempoten)
```

Setup lokal: salin `.env.example` ke `.env`, isi `DATABASE_URL` (Atlas, atau `npm run db:local` di terminal terpisah), buat kunci `ACCESS_CODE_*` (perintah ada di `.env.example`), lalu `npm run db:push` dan `npm run db:seed`. MongoDB tidak memakai migrasi; setiap mengubah `schema.prisma`, jalankan `npm run db:push`. Jangan pernah mengganti `ACCESS_CODE_PEPPER`/`ACCESS_CODE_ENC_KEY` setelah ada responden: semua kode akses lama tidak akan bisa dipakai lagi.

Windows Controlled Folder Access aktif di mesin ini. Bila sebuah aplikasi gagal menulis ke folder proyek (error ENOENT/EPERM), izinkan aplikasinya di Windows Security → Ransomware protection → Allow an app. VS Code sudah diizinkan; Claude Code (claude.exe) masih kadang diblokir, jadi bila Write/Edit gagal ENOENT, tulis lewat skrip Node (node.exe diizinkan).

## Aturan MongoDB (sudah terbukti menimbulkan bug)

- **Field opsional bisa `null` atau tidak ada sama sekali.** Prisma `field: null` hanya cocok dengan `null` eksplisit, dan `{ not: null }` juga cocok dengan field yang tidak ada. Pakai:
  - kosong: `OR: [{ field: null }, { field: { isSet: false } }]`
  - terisi: `{ isSet: true, not: null }`
- **Jangan beri `@unique` pada field opsional** (unique index MongoDB menganggap banyak `null` sebagai duplikat). Tambahkan partial unique index di `prisma/indexes.ts`, dan cari dengan `findFirst`, bukan `findUnique`.
- Semua id adalah ObjectId (`@db.ObjectId`); id dari request yang bukan 24 karakter heksadesimal membuat Prisma melempar error, jadi validasi dulu.
- Tidak ada autoincrement: nomor urut memakai model `Counter` dengan `upsert` + `increment` (lihat `createRespondent`).
- Relasi `onDelete` diemulasikan Prisma (bukan oleh database); hapus data hanya lewat Prisma, jangan lewat shell Mongo.
- Field `String` tidak punya batas panjang di database; batasi di skema Zod.

## Aturan Keselamatan Medis (WAJIB, tidak boleh dilanggar)

Website ini menyentuh kesehatan anak. Setiap perubahan kode harus mematuhi aturan berikut:

1. **Tidak ada diagnosis otomatis.** Jangan menulis logika yang menyimpulkan "anak mengalami diare", "dehidrasi ringan/sedang/berat", atau kesimpulan klinis lain dari input pengguna. Ini termasuk label status seperti "Hidrasi Aman" atau "Kondisi Membaik"; tampilkan data yang dicatat apa adanya.
2. **Tidak ada dosis hardcoded.** Takaran oralit/zinc hanya diambil dari tabel `GuidanceRule` berstatus `PUBLISHED` yang sudah disetujui tenaga kesehatan (`approvedById` terisi). Jangan menulis angka dosis di kode, seed produksi, atau teks UI (termasuk kartu progres beranda dan item checklist).
3. **Tidak ada rekomendasi antibiotik/obat otomatis.** Pengingat obat hanya mencatat instruksi yang diketik pengguna dari tenaga kesehatan.
4. **Tanda bahaya mendahului segalanya.** Jika input memenuhi aturan tanda bahaya (`src/lib/safety/danger-signs.ts`), tampilkan `DangerAlert` dan hentikan alur (misal kalkulator tidak melanjutkan ke hasil). Jangan pernah menunda pesan rujukan di belakang formulir tambahan.
5. **Halaman tanda bahaya publik.** `/tanda-bahaya` harus selalu dapat diakses tanpa login dan tidak boleh di-gate oleh `src/proxy.ts` maupun guard auth.
6. **Tanda bahaya tidak hanya lewat warna.** Selalu gunakan ikon + teks + warna.
7. Perubahan pada `src/lib/safety/` wajib disertai unit test.

## Aturan Data dan Privasi

- Data kesehatan anak bersifat sensitif. Setiap query data anak/pelacak/checklist harus di-scope ke `userId` dari session; jangan pernah percaya `userId`/`childId` dari body request tanpa cek kepemilikan.
- Jawaban evaluasi disimpan dengan **kode responden** (`R-0001`), terpisah dari identitas pengguna (lihat ARCHITECTURE.md §8). Laporan/ekspor skor tidak boleh digabung dengan nama, nomor HP, atau kode akses.
- **Kode akses adalah kredensial login.** Simpan hanya sebagai HMAC (untuk login) + terenkripsi (untuk ditampilkan). Hanya pemilik akun dan admin yang boleh melihatnya; jangan pernah di-log, dikirim ke analitik, atau dimasukkan ke ekspor skor. Kode akses ≠ kode responden.
- Evaluasi punya tiga tipe soal: `SCALE`, `CHOICE`, `TEXT`. Field rahasia (`answerKey`, `reverseScored`, `rubric`) tidak boleh dikirim ke client; gunakan DTO `PublicEvalQuestion`. Logika skor ada di `src/server/services/eval-scoring.ts` dan wajib disertai unit test.
- Jangan log PII (nomor HP, email, kode akses, nama anak, isi catatan pelacak).
- Jangan menambah field data pribadi baru tanpa memperbarui PRD.md bagian privasi.

## Konvensi Kode

- Identifier kode dalam bahasa Inggris (`childProfile`, `trackerEntry`); semua teks UI dalam Bahasa Indonesia, disimpan di `src/content/copy/` atau database, bukan tersebar di komponen.
- Route URL dalam Bahasa Indonesia (`/edukasi`, `/fitur/pelacak`) sesuai sitemap di ARCHITECTURE.md.
- Server Components secara default; `"use client"` hanya untuk interaktivitas.
- Mutasi lewat Server Actions di `src/server/actions/`, validasi input dengan skema Zod di `src/lib/validation/`.
- **Jangan `.bind()` Server Action yang dipakai `useActionState`.** Di Next 16.4, action hasil bind yang mengembalikan state membuat request menggantung saat form dikirim tanpa JavaScript. Kirim id lewat `<input type="hidden">`.
- React 19 me-reset form setelah action selesai: bila validasi gagal, kembalikan `values` dari action dan pakai sebagai `defaultValue`.
- File yang diimpor komponen `"use client"` tidak boleh memakai `node:crypto`/modul Node (pakai Web Crypto `crypto.getRandomValues`).
- Akses database hanya dari `src/server/`; komponen tidak mengimpor Prisma langsung.
- Gunakan token warna dari DESIGN.md (`bg-primary`, `text-danger`), jangan hex langsung di className.
- Target sentuh minimal 44×44 px, teks isi minimal 17 px (lihat DESIGN.md).

## Alur Konten Klinis

Konten bertipe klinis (oralit, zinc, ASI/makanan, tanda bahaya, panduan takaran) mengikuti status `DRAFT → IN_REVIEW → APPROVED → PUBLISHED`. Hanya pengguna dengan flag `isClinicalReviewer` yang dapat mengubah status ke `APPROVED`. Jangan membuat jalan pintas yang mempublikasikan konten klinis tanpa persetujuan.
