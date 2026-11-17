# ARCHITECTURE.md: SIGAP DIARE

Dokumen ini menjelaskan arsitektur teknis SIGAP DIARE: stack, struktur kode, model data, autentikasi, mesin keselamatan, alur konten, evaluasi penelitian, notifikasi, keamanan, dan deployment. Kebutuhan produk ada di [PRD.md](PRD.md); design system di [DESIGN.md](DESIGN.md).

---

## 1. Prinsip Arsitektur

1. **Satu aplikasi, satu database.** Monolit Next.js (user + admin) cukup untuk skala penelitian dan mudah dirawat tim kecil.
2. **Keselamatan sebagai kode yang dapat diuji.** Logika tanda bahaya berupa fungsi murni dengan unit test, terpisah dari UI.
3. **Konten klinis sebagai data yang disetujui.** Takaran dan materi klinis tinggal di database dengan alur persetujuan, bukan di kode.
4. **Privasi sejak rancangan.** Data identitas, data anak, dan data evaluasi dipisahkan; setiap akses data di-scope ke pemilik.
5. **Server-first.** Render di server, JavaScript client seminimal mungkin agar cepat di HP kelas menengah dan jaringan 4G.

## 2. Stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript strict | SSR/RSC cepat di mobile, satu codebase untuk user + admin, Server Actions untuk form |
| Styling | Tailwind CSS v4 | Token design system di `@theme` (DESIGN.md §12) |
| Komponen | Komponen sendiri; elemen native (`<details>`, `<dialog>`) untuk accordion/menu; Radix bila perlu nanti | Ringan, aksesibel, gaya penuh di tangan kita |
| Ikon | `lucide-react` | Tree-shakable, gaya membulat mirip referensi; Material Symbols butuh loader SVG tambahan |
| Form | Server Actions + `useActionState` + Zod 4 | Validasi di server, tanpa library form di client |
| Database | MongoDB 7+ dalam mode replica set (MongoDB Atlas untuk produksi; `npm run db:local` untuk pengembangan) | Pilihan tim proyek (ADR 011); dokumen fleksibel untuk blok konten |
| ORM | Prisma 6.19 (`prisma-client-js`, `prisma db push`) | Type-safe; Prisma 7 belum mendukung MongoDB |
| Auth | Buatan sendiri: session database + cookie, scrypt untuk password admin, HMAC + AES-GCM untuk kode akses (`node:crypto`) | Responden tidak punya email, sedangkan library auth umumnya mewajibkan email (ADR 006) |
| Email | Resend atau SMTP (Nodemailer) | Hanya untuk reset password admin (responden tidak memakai email) |
| Upload | Penyimpanan objek kompatibel S3 (Cloudflare R2 / Supabase Storage / MinIO) | Ilustrasi materi diunggah admin |
| Push | Web Push (VAPID) + service worker | Pengingat tanpa biaya SMS |
| Job terjadwal | Cron endpoint (Vercel Cron) atau worker `node-cron` di VPS | Pemrosesan pengingat, pembersihan data |
| Chart | Recharts (atau SVG sederhana) | Grafik frekuensi BAB |
| Test | Vitest, Testing Library, Playwright | Unit, komponen, e2e |
| Kualitas | ESLint, Prettier, TypeScript `--noEmit`, Husky + lint-staged | |

## 3. Gambaran Sistem

```
                ┌────────────────────────────────────────────┐
  Browser       │  Next.js App                               │
  (HP/Laptop)   │                                            │
  ─────────────▶│  proxy.ts  (cek cookie sesi, redirect)     │
  HTTPS         │       │                                    │
                │       ▼                                    │
                │  app/(public)  app/(app)  app/admin        │
                │   RSC pages + Server Actions + Route API   │
                │       │                                    │
                │       ▼                                    │
                │  src/server/  (services, repositories)     │
                │       │            │             │         │
                │  lib/safety   lib/validation  lib/auth     │
                └───────┼────────────┼─────────────┼─────────┘
                        ▼            ▼             ▼
                  MongoDB      Object Storage   Email provider
                  (Prisma)     (ilustrasi)      (reset admin)
                        ▲
                        │  Cron: /api/cron/reminders  → Web Push
                        │        /api/cron/retention  → anonimisasi
```

## 4. Struktur Folder

```
sigap-diare/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts                 # materi, FAQ, item checklist, admin dev (tanpa angka dosis)
├─ public/
│  ├─ illustrations/          # ilustrasi bawaan
│  ├─ sw.js                   # service worker (push)
│  └─ manifest.webmanifest
├─ src/
│  ├─ app/
│  │  ├─ (public)/            # tanpa login
│  │  │  ├─ page.tsx          # landing
│  │  │  ├─ masuk/            # login responden dengan kode akses
│  │  │  ├─ daftar/  daftar/berhasil/  lupa-kode/
│  │  │  ├─ tanda-bahaya/     # SELALU publik
│  │  │  └─ kebijakan-privasi/
│  │  ├─ (app)/               # wajib login (role USER/ADMIN)
│  │  │  ├─ layout.tsx        # header + bottom nav
│  │  │  ├─ beranda/
│  │  │  ├─ edukasi/[topic]/[lesson]/
│  │  │  ├─ fitur/
│  │  │  │  ├─ kalkulator/  checklist/  pelacak/  pengingat/
│  │  │  ├─ evaluasi/[phase]/
│  │  │  ├─ faq/
│  │  │  └─ profil/  profil/anak/[id]/  onboarding/anak/
│  │  ├─ admin/
│  │  │  ├─ masuk/  lupa-password/   # publik: login email + password
│  │  │  └─ (panel)/          # wajib role ADMIN
│  │  │     ├─ page.tsx       # dashboard
│  │  │     ├─ edukasi/  panduan/  checklist/  faq/  evaluasi/
│  │  │     ├─ responden/     # daftar responden + kode akses
│  │  │     ├─ laporan/  pengaturan/  pengaturan/admin/  audit/
│  │  └─ api/
│  │     ├─ cron/reminders/   # dilindungi CRON_SECRET
│  │     ├─ cron/retention/
│  │     └─ push/subscribe/
│  ├─ components/
│  │  ├─ ui/                  # Button, Card, Field, Accordion, ...
│  │  ├─ safety/              # DangerAlert, DangerBanner, Disclaimer
│  │  ├─ layout/              # Header, BottomNav, BackLink
│  │  └─ features/            # komponen per fitur
│  ├─ content/copy/           # teks UI statis Bahasa Indonesia
│  ├─ lib/
│  │  ├─ auth/                # access-code.ts (generate, HMAC, AES-GCM), password.ts (scrypt)
│  │  ├─ safety/danger-signs.ts   (+ danger-signs.test.ts)
│  │  ├─ validation/          # skema Zod
│  │  ├─ dates.ts             # zona waktu, usia anak
│  │  └─ utils.ts
│  ├─ server/
│  │  ├─ db.ts                # Prisma client singleton
│  │  ├─ guards.ts            # requireUser, requireAdmin, requireChildOwnership
│  │  ├─ actions/             # Server Actions (mutasi)
│  │  ├─ queries/             # pembacaan data untuk RSC
│  │  └─ services/            # push, email, storage, audit, reports
│  └─ proxy.ts               # pengganti middleware.ts di Next.js 16
├─ tests/e2e/
└─ docs/adr/                  # Architecture Decision Records
```

## 5. Routing dan Kontrol Akses

| Grup | Route | Akses |
|---|---|---|
| Publik | `/`, `/masuk`, `/daftar`, `/daftar/berhasil`, `/lupa-kode`, `/kebijakan-privasi`, **`/tanda-bahaya`**, `/admin/masuk`, `/admin/lupa-password` | Semua orang |
| Responden | `/beranda`, `/edukasi/**`, `/fitur/**`, `/evaluasi/**`, `/faq`, `/profil/**`, `/onboarding/**` | Login dengan kode akses |
| Admin | `/admin/**` (kecuali halaman masuk) | Role `ADMIN`, login email + password |
| Admin klinis | Aksi "Setujui" pada konten klinis | `ADMIN` + `isClinicalReviewer` |

`src/proxy.ts` (hanya memeriksa ada/tidaknya cookie, tanpa database):

1. Daftar route publik di-whitelist secara eksplisit (termasuk `/tanda-bahaya` dan `/admin/masuk`).
2. Tanpa session: route responden → `/masuk?next=…`; route admin → `/admin/masuk`.
3. Responden tanpa profil anak → `/onboarding/anak` (kecuali route profil/logout).
4. `/admin/**` dengan session non-admin → 404.

Proxy hanya pemeriksaan awal. **Setiap halaman, Server Action, dan query tetap memanggil guard di server** (`requireRespondent`, `requireAdmin`, `requireChildOwnership` di `src/server/guards.ts`), karena proxy dapat dilewati.

## 6. Autentikasi

Dua mekanisme login, satu sistem session (`src/server/session.ts`): token acak 32 byte di cookie `sd_session` (`HttpOnly`, `Secure` di produksi, `SameSite=Lax`); tabel `Session` hanya menyimpan hash SHA-256 token. Sesi yang kedaluwarsa atau milik akun nonaktif ditolak.

| | Responden | Admin |
|---|---|---|
| Halaman | `/masuk` | `/admin/masuk` (tautan "Login Admin" di bawah footer) |
| Kredensial | Kode akses | Email + password |
| Pendaftaran | Mandiri di `/daftar` (nama + nomor HP); kode akses tampil di layar setelah daftar | Admin pertama lewat `npm run db:seed` (`ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD`); tidak ada pendaftaran publik |
| Pemulihan | Lewat admin (halaman Lupa Kode → WhatsApp admin) | Reset password lewat email |
| Masa session | 30 hari, rolling refresh | 8 jam |

### 6.1 Registrasi responden

1. `/daftar`: nama, nomor HP, persetujuan privasi → Server Action `registerRespondent`. Nomor HP dinormalisasi ke E.164 (`+628…`); nomor yang sudah terdaftar ditolak.
2. Dalam satu transaksi: buat `User` (role `USER`), `Consent`, `Participant` (kode responden), dan kode akses baru.
3. Buat session langsung, lalu redirect ke `/daftar/berhasil`, yang mendekripsi `accessCodeEnc` milik pengguna yang sedang login dan menampilkannya (kode yang sama juga bisa dilihat lagi di Profil).
4. Lanjut ke `/onboarding/anak`.

Tidak ada verifikasi nomor HP dan tidak ada OTP (keputusan final, PRD Q9). Nomor HP dipakai sebagai kontak dan untuk pencarian oleh admin saat responden lupa kode.

Akun responden hanya dibuat lewat `/daftar`; tidak ada endpoint admin untuk membuat responden.

### 6.2 Kode akses

- Dibuat dengan CSPRNG (`crypto.randomInt`): **8 angka** (10⁸ kombinasi, boleh diawali 0), sesuai permintaan tim agar mudah diketik ibu. Ditampilkan sebagai `1234-5678`.
- Normalisasi input: buang spasi dan tanda hubung; selain 8 angka ditolak.
- Karena ruang kodenya lebih kecil daripada kode huruf+angka, rate limit login adalah pertahanan utama terhadap tebakan beruntun. Bila jumlah responden besar atau website dibuka luas, pertimbangkan rate limit global/Redis dan pemantauan lonjakan login gagal.
- Penyimpanan (`src/lib/auth/access-code.ts`):
  - `accessCodeHash` = HMAC-SHA256(kode, `ACCESS_CODE_PEPPER`), unique index, dipakai untuk mencari pengguna saat login.
  - `accessCodeEnc` = AES-256-GCM(kode, `ACCESS_CODE_ENC_KEY`), didekripsi di server hanya untuk pemilik (halaman profil) dan role `ADMIN`.
  - Kode mentah tidak pernah disimpan atau di-log.
- Login: Server Action `loginWithAccessCode` (`src/server/actions/auth.ts`). Alurnya: normalisasi → HMAC → cari `User` role `USER` → tolak bila `banned` → buat session.
- Rate limit: 5 percobaan gagal per 15 menit per IP. Ada juga ambang global kegagalan per menit yang memicu peringatan di dashboard admin sebagai indikasi brute force.
- Buat ulang kode (oleh admin, atau oleh pemilik dari profil): hash dan enc diganti, `accessCodeIssuedAt` diperbarui, semua session milik pengguna dicabut, dan aksi dicatat di `AuditLog`.
- Lupa kode (`/lupa-kode`): halaman statis dengan tautan WhatsApp ke admin (nomor dari `SiteSetting` `support.whatsapp`). Admin mencari responden berdasarkan nomor HP di `/admin/responden`, memastikan identitas (misalnya pesan berasal dari nomor terdaftar), lalu memberikan kode yang ada atau membuat ulang kode. **Tidak ada endpoint publik yang mengembalikan kode akses.**

### 6.3 Admin

- Email + password; hash scrypt (`src/lib/auth/password.ts`), minimal 12 karakter. Saat email tidak terdaftar tetap dijalankan verifikasi terhadap hash palsu agar waktu respons sama.
- Admin pertama dibuat lewat skrip seed (`ADMIN_SEED_EMAIL` + password sementara yang wajib diganti saat login pertama). Admin berikutnya ditambahkan dari `/admin/pengaturan/admin`.
- Rate limit login admin: 5 percobaan per 15 menit per IP dan per email.

Persetujuan privasi disimpan di `Consent` dengan versi dokumen dan waktu.

## 7. Model Data

Ringkasan skema Prisma (field audit `createdAt`/`updatedAt` ada di semua model, disingkat di sini). Sumber kebenaran adalah `prisma/schema.prisma` (MongoDB); potongan di bawah adalah ringkasan dari rancangan awal. Perbedaan di skema MongoDB yang sebenarnya:

- Semua id `String @id @default(auto()) @map("_id") @db.ObjectId`; tidak ada `@db.Date`/`@db.VarChar`/`Decimal` (`birthDate` & `ChecklistDay.date` disimpan sebagai tengah malam UTC, `weightKg` sebagai `Float`, batas panjang teks di Zod).
- `User.phoneNumber`, `User.email`, `User.accessCodeHash` tanpa `@unique`; keunikannya dijaga partial unique index (`prisma/indexes.ts`, dijalankan oleh `npm run db:push`).
- `Participant.userId` tanpa `@unique` (relasi `User.participants`, selalu satu per responden); nomor `seq` diambil dari model `Counter`, bukan autoincrement.
- `LessonProgress` memakai id sendiri + `@@unique([userId, lessonId])` (MongoDB tidak mendukung id komposit).
- Relasi `onDelete` diemulasikan Prisma.

 Di skema sebenarnya `User` juga punya `passwordHash` (admin), dan ada model `Session` (`tokenHash`, `userId`, `expiresAt`).

```prisma
enum Role { USER ADMIN }
enum Sex { MALE FEMALE }
enum ContentStatus { DRAFT IN_REVIEW APPROVED PUBLISHED ARCHIVED }
enum ContentKind { GENERAL CLINICAL }
enum StoolConsistency { NORMAL SOFT WATERY }
enum DrinkingAbility { NORMAL REDUCED UNABLE }
enum GeneralCondition { ACTIVE FUSSY LETHARGIC }
enum EvalPhase { PRETEST POSTTEST }
enum EvalQuestionType { SCALE CHOICE TEXT }
enum ReminderRepeat { ONCE DAILY }
enum CareLogType { ORALIT FLUID ZINC }
enum ChecklistScope { PREVENTION EPISODE }

// ── Identitas ───────────────────────────────────────────
model User {
  id                 String   @id @default(cuid())
  name               String
  email              String?  @unique   // hanya untuk admin
  emailVerified      Boolean  @default(false)
  phoneNumber        String?  @unique   // wajib untuk responden, E.164 (+628…)
  role               Role     @default(USER)
  isClinicalReviewer Boolean  @default(false)
  banned             Boolean  @default(false)
  // kredensial responden (null untuk admin; password admin di kolom passwordHash)
  accessCodeHash     String?  @unique   // HMAC-SHA256, untuk login
  accessCodeEnc      String?            // AES-256-GCM, untuk ditampilkan ke pemilik & admin
  accessCodeIssuedAt DateTime?
  timezone           String   @default("Asia/Jakarta")
  activeChildId      String?
  lastActiveAt       DateTime?
  children           ChildProfile[]
  consents           Consent[]
  checklistDays      ChecklistDay[]
  reminders          Reminder[]
  pushSubscriptions  PushSubscription[]
  lessonProgress     LessonProgress[]
  participant        Participant?
}

model Consent {
  id            String   @id @default(cuid())
  userId        String
  policyVersion String
  acceptedAt    DateTime @default(now())  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ── Anak & pemantauan ───────────────────────────────────
model ChildProfile {
  id         String   @id @default(cuid())
  userId     String
  nickname   String
  birthDate  DateTime @db.Date
  sex        Sex
  weightKg   Decimal? @db.Decimal(4, 1)
  avatarKey  String?
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  entries    TrackerEntry[]
  episodes   DiarrheaEpisode[]
  @@index([userId])
}

model TrackerEntry {
  id               String            @id @default(cuid())
  childId          String
  episodeId        String?
  recordedAt       DateTime
  stoolCount       Int
  consistency      StoolConsistency
  bloodInStool     Boolean?
  vomitCount       Int?
  drinkingAbility  DrinkingAbility?
  generalCondition GeneralCondition?
  worsening        Boolean?
  notes            String?           @db.VarChar(1000)
  dangerFlags      String[]          // kode tanda bahaya yang terpicu, untuk statistik
  child            ChildProfile      @relation(fields: [childId], references: [id], onDelete: Cascade)
  episode          DiarrheaEpisode?  @relation(fields: [episodeId], references: [id], onDelete: SetNull)
  @@index([childId, recordedAt])
}

model DiarrheaEpisode {             // dimulai & diakhiri manual oleh pengguna
  id              String    @id @default(cuid())
  childId         String
  startedAt       DateTime
  endedAt         DateTime?
  // rencana perawatan: DIISI PENGGUNA sesuai instruksi tenaga kesehatan, bukan dihitung sistem
  zincDays        Int?
  fluidTargetMl   Int?
  instructionNote String?   @db.VarChar(1000)
  child           ChildProfile @relation(fields: [childId], references: [id], onDelete: Cascade)
  entries         TrackerEntry[]
  careLogs        CareLog[]
  @@index([childId, endedAt])
}

model CareLog {                     // pemberian oralit/cairan/zinc yang dicatat ibu
  id        String      @id @default(cuid())
  episodeId String
  type      CareLogType
  amountMl  Int?        // untuk ORALIT/FLUID
  givenAt   DateTime
  episode   DiarrheaEpisode @relation(fields: [episodeId], references: [id], onDelete: Cascade)
  @@index([episodeId, givenAt])
}

model ChecklistItem {
  id        String         @id @default(cuid())
  label     String
  order     Int
  scope     ChecklistScope @default(PREVENTION)  // EPISODE = hanya tampil saat episode aktif
  kind      ContentKind    @default(GENERAL)     // item perawatan = CLINICAL, wajib disetujui
  status    ContentStatus  @default(DRAFT)
  active    Boolean        @default(true)
}

model ChecklistDay {
  id           String   @id @default(cuid())
  userId       String
  date         DateTime @db.Date      // tanggal lokal pengguna
  checkedItems String[]               // id ChecklistItem
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, date])
}

model Reminder {
  id          String         @id @default(cuid())
  userId      String
  title       String
  description String?        @db.VarChar(500)
  dueAt       DateTime       // UTC
  repeat      ReminderRepeat @default(ONCE)
  active      Boolean        @default(true)
  completedAt DateTime?
  lastSentAt  DateTime?
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([active, dueAt])
}

model PushSubscription {
  id        String @id @default(cuid())
  userId    String
  endpoint  String @unique
  p256dh    String
  auth      String
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ── Konten ──────────────────────────────────────────────
model Topic {                       // 4 materi utama
  id           String        @id @default(cuid())
  slug         String        @unique   // mengenal-diare, pencegahan, penanganan, tanda-bahaya
  title        String
  summary      String
  coverKey     String?
  order        Int
  kind         ContentKind   @default(GENERAL)
  status       ContentStatus @default(DRAFT)
  lessons      Lesson[]
}

model Lesson {                      // submateri
  id           String        @id @default(cuid())
  topicId      String
  slug         String
  title        String
  body         Json          // blok: paragraph, image, callout, list, steps
  order        Int
  kind         ContentKind   @default(GENERAL)
  status       ContentStatus @default(DRAFT)
  references   String[]
  reviewedById String?
  approvedById String?
  approvedAt   DateTime?
  publishedAt  DateTime?
  topic        Topic         @relation(fields: [topicId], references: [id])
  @@unique([topicId, slug])
}

model LessonProgress {
  userId      String
  lessonId    String
  completedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@id([userId, lessonId])
}

model GuidanceRule {                // informasi takaran oralit/zinc per kelompok usia
  id            String        @id @default(cuid())
  subject       String        // "ORALIT" | "ZINC"
  minAgeMonths  Int
  maxAgeMonths  Int
  content       Json          // teks takaran & cara pemberian yang DITULIS dan DISETUJUI nakes
  references    String[]
  status        ContentStatus @default(DRAFT)
  approvedById  String?
  approvedAt    DateTime?
}

model FaqItem {
  id        String        @id @default(cuid())
  category  String
  question  String
  answer    String        // markdown terbatas
  order     Int
  kind      ContentKind   @default(GENERAL)
  status    ContentStatus @default(DRAFT)
}

// ── Evaluasi penelitian (terpisah dari identitas) ───────
model Participant {
  id        String   @id @default(cuid())
  code      String   @unique         // kode responden, contoh: R-0042 (BUKAN kode akses)
  userId    String?  @unique         // diputus (null) saat anonimisasi / hapus akun
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  attempts  EvalAttempt[]
}

model EvalInstrument {
  id          String     @id @default(cuid())
  phase       EvalPhase
  version     Int
  opensAt     DateTime?
  closesAt    DateTime?
  showResultsAfterClose Boolean @default(false)
  questions   EvalQuestion[]
  @@unique([phase, version])
}

model EvalQuestion {
  id           String           @id @default(cuid())
  instrumentId String
  order        Int
  section      String?          // bagian/dimensi untuk subskor, misal "Pengetahuan", "Sikap"
  type         EvalQuestionType
  prompt       String
  required     Boolean          @default(true)
  points       Int              @default(1)    // bobot CHOICE/TEXT; SCALE memakai nilai skala
  scored       Boolean          @default(true) // false = isian terbuka yang tidak dinilai

  // ── dikirim ke client ──
  options      Json?            // CHOICE: [{id, label}]
  scaleMin     Int?             // SCALE: default 1
  scaleMax     Int?             // SCALE: default 5
  scaleLabels  Json?            // SCALE: {"1": "Sangat Tidak Setuju", ..., "5": "Sangat Setuju"}
  textVariant  String?          // TEXT: "SHORT" | "LONG"

  // ── TIDAK PERNAH dikirim ke client ──
  answerKey    String?          // CHOICE: id opsi benar
  reverseScored Boolean         @default(false) // SCALE: pernyataan negatif
  rubric       String?          // TEXT: contoh jawaban benar / pedoman penilai

  instrument   EvalInstrument   @relation(fields: [instrumentId], references: [id])
  answers      EvalAnswer[]
}

model EvalAttempt {
  id            String    @id @default(cuid())
  participantId String
  instrumentId  String
  startedAt     DateTime  @default(now())
  submittedAt   DateTime?
  autoScore     Int?      // jumlah skor SCALE + CHOICE, dihitung saat submit
  totalScore    Int?      // diisi setelah semua isian yang dinilai sudah dinilai
  sectionScores Json?     // {"Pengetahuan": 12, "Sikap": 38}
  participant   Participant @relation(fields: [participantId], references: [id])
  answers       EvalAnswer[]
  @@unique([participantId, instrumentId])
}

model EvalAnswer {
  id          String    @id @default(cuid())
  attemptId   String
  questionId  String
  optionId    String?   // CHOICE
  scaleValue  Int?      // SCALE (nilai mentah yang dipilih)
  textValue   String?   @db.VarChar(500)  // TEXT
  score       Int?      // null = belum dinilai (TEXT)
  scoredById  String?   // admin penilai isian
  scoredAt    DateTime?
  scoreNote   String?
  attempt     EvalAttempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question    EvalQuestion @relation(fields: [questionId], references: [id])
  @@unique([attemptId, questionId])
}

// ── Admin & analitik ────────────────────────────────────
model AuditLog {
  id        String   @id @default(cuid())
  actorId   String
  action    String   // content.publish, user.ban, report.export, ...
  target    String
  meta      Json?
  createdAt DateTime @default(now())
}

model ActivityEvent {                // untuk statistik agregat, tanpa isi data kesehatan
  id        String   @id @default(cuid())
  userId    String?
  type      String   // lesson.view, checklist.save, tracker.save, danger.alert_shown
  refId     String?
  createdAt DateTime @default(now())
  @@index([type, createdAt])
}

model SiteSetting {
  key   String @id
  value Json
}
```

Catatan:

- Waktu disimpan dalam UTC; `ChecklistDay.date` disimpan sebagai tanggal lokal pengguna (berdasarkan `User.timezone`).
- Usia anak dihitung dari `birthDate` di `lib/dates.ts`, tidak disimpan.
- Kartu Progres Penanganan di beranda dihitung di `src/server/queries/home.ts` dari `CareLog` dan rencana di `DiarrheaEpisode`: total ml hari ini, hari ke-n zinc (jumlah hari berbeda dengan log `ZINC`), dan pemberian oralit terakhir. Tidak ada label status klinis yang dihitung.
- Hapus akun: `User` dihapus → cascade ke anak, pelacak, checklist, pengingat; `Participant.userId` menjadi null sehingga data evaluasi tetap anonim.

## 8. Evaluasi dan Data Penelitian

- Saat registrasi, sistem membuat `Participant` dengan kode responden berurutan (`R-0001`; format dapat dikonfigurasi di `SiteSetting`, PRD Q4). Kode responden **bukan** kode akses: kode akses adalah kredensial login, sedangkan kode responden adalah identitas penelitian.
- Query untuk halaman soal memakai `select` eksplisit ke DTO `PublicEvalQuestion` (`id`, `order`, `section`, `type`, `prompt`, `required`, `options`, `scaleMin`, `scaleMax`, `scaleLabels`, `textVariant`). `answerKey`, `reverseScored`, dan `rubric` tidak pernah ikut terkirim.
- Jawaban disimpan otomatis per soal (upsert `EvalAnswer`, debounce 800 ms untuk isian) selama `submittedAt` null. Validasi Zod per tipe: `optionId` harus milik soal, `scaleValue` dalam rentang, `textValue` ≤ 500 karakter.
- Submit: server memvalidasi jendela waktu dan soal wajib, lalu menghitung skor otomatis (`src/server/services/eval-scoring.ts`, fungsi murni + unit test):
  - **SCALE**: `score = reverseScored ? (scaleMin + scaleMax − scaleValue) : scaleValue`.
  - **CHOICE**: `score = optionId === answerKey ? points : 0`.
  - **TEXT**: `score = null` (menunggu penilaian manual); bila `scored = false`, tidak dihitung.
  - `autoScore` dan `sectionScores` sementara disimpan; `submittedAt` diisi dan attempt menjadi read-only.
- Penilaian isian (`/admin/evaluasi/[id]/penilaian`): admin memberi skor 0..`points` per `EvalAnswer`. Saat semua isian yang dinilai pada sebuah attempt sudah terisi, `totalScore` dan `sectionScores` dihitung ulang. Penilai hanya melihat kode responden.
- Instrumen dikunci untuk diedit setelah ada attempt yang masuk (mencegah perubahan soal di tengah pengukuran). Posttest dibuat dengan "Salin dari Pretest" (soal disalin sebagai baris baru dengan id baru).
- Ekspor hasil: CSV lebar, satu baris per responden per fase. Kolom: `kode_responden, fase, mulai, selesai, Q01_jawaban, Q01_skor, …, subskor_<bagian>, skor_otomatis, skor_total`. Untuk SCALE diekspor nilai mentah dan skor (setelah dibalik).
- Posttest hanya dapat dibuka jika attempt pretest sudah submit dan `now()` di dalam jendela posttest.
- Laporan skor membaca `Participant.code` + `EvalAttempt` tanpa join ke `User`. Ekspor CSV skor berisi kode responden, fase, skor, dan waktu, dan tidak pernah berisi kode akses.
- Halaman **Responden** (`/admin/responden`) menampilkan seluruh responden: nama, nomor HP, kode akses (didekripsi di server, hanya untuk role `ADMIN`), kode responden, tanggal daftar, jumlah anak, status pretest/posttest (belum/sedang/selesai), aktivitas terakhir, dan status akun. Skor tidak ditampilkan di halaman ini. Membuka halaman, menyalin, dan membuat ulang kode akses dicatat di `AuditLog`.

## 9. Mesin Keselamatan (Tanda Bahaya)

Lokasi: `src/lib/safety/danger-signs.ts`. Fungsi murni tanpa dependensi database atau UI.

```ts
export type DangerSign =
  | "LETHARGIC"            // sangat lemas atau lesu
  | "UNABLE_TO_DRINK"      // tidak mampu minum/menyusu
  | "SUNKEN_EYES"          // mata cekung
  | "DRY_MOUTH"            // mulut kering
  | "PERSISTENT_VOMITING"  // muntah terus-menerus
  | "BLOOD_IN_STOOL"       // darah dalam tinja
  | "WORSENING";           // kondisi memburuk

export interface DangerInput {
  generalCondition?: "ACTIVE" | "FUSSY" | "LETHARGIC";
  drinkingAbility?: "NORMAL" | "REDUCED" | "UNABLE";
  bloodInStool?: boolean;
  persistentVomiting?: boolean;
  sunkenEyes?: boolean;
  dryMouth?: boolean;
  worsening?: boolean;
}

/** Mengembalikan tanda bahaya yang DILAPORKAN pengguna. Bukan diagnosis. */
export function detectDangerSigns(input: DangerInput): DangerSign[];
```

Aturan penggunaan:

- Dipanggil di server (Server Action pelacak/kalkulator) **dan** di client (umpan balik instan); hasil server adalah sumber kebenaran.
- Kalkulator: jika `detectDangerSigns(...)` tidak kosong → kembalikan `{ kind: "danger", signs }` dan **tidak** membaca `GuidanceRule`.
- Pelacak: catatan tetap disimpan, lalu respons membawa `signs` untuk menampilkan `DangerAlert`; event `danger.alert_shown` dicatat.
- Fungsi hanya memetakan input yang dilaporkan ke daftar tanda; tidak menghitung skor dehidrasi dan tidak mengeluarkan label klinis.
- Teks setiap tanda dan pesan rujukan berasal dari konten tanda bahaya yang disetujui; fallback teks statis ada di `src/content/copy/danger.ts`.
- Ambang "muntah terus-menerus" pada pelacak ditentukan oleh peninjau klinis dan disimpan di `SiteSetting` (`danger.vomitThreshold`), tidak ditebak oleh developer.
- Setiap perubahan wajib lulus `danger-signs.test.ts` (tabel kasus: setiap tanda tunggal, kombinasi, input kosong).

## 10. Alur Konten dan Persetujuan Klinis

```
DRAFT ──(admin kirim)──▶ IN_REVIEW ──(peninjau klinis setuju)──▶ APPROVED ──(admin terbitkan)──▶ PUBLISHED
  ▲                          │                                                                    │
  └──────(minta revisi)──────┘                                     ARCHIVED ◀──(arsipkan)─────────┘
```

- Konten `kind = GENERAL` boleh langsung `DRAFT → PUBLISHED` oleh admin.
- Konten `kind = CLINICAL` (materi Penanganan, Tanda Bahaya, FAQ oralit/zinc/dehidrasi, seluruh `GuidanceRule`) wajib melewati `APPROVED` oleh pengguna dengan `isClinicalReviewer`; transisi diperiksa di server (`src/server/actions/content.ts`).
- Mengubah konten klinis yang sudah `PUBLISHED` membuat versi draft baru; versi terbit tetap tampil sampai revisi disetujui.
- Setiap transisi status dicatat di `AuditLog`.
- Isi materi disimpan sebagai **blok JSON** (paragraph, heading, image, callout, list, steps) yang dirender oleh komponen sendiri, sehingga tidak ada HTML mentah dari admin yang dirender (aman dari XSS).
- Ilustrasi diunggah ke object storage lewat presigned URL; hanya `image/png|jpeg|webp|svg+xml` (SVG disanitasi) maks 2 MB.
- Halaman edukasi dan `/tanda-bahaya` dirender statis dengan revalidasi on-demand (`revalidatePath`) saat konten diterbitkan.

## 11. Pengingat dan Notifikasi

1. Pengguna membuat `Reminder` (waktu dikonversi dari zona lokal ke UTC).
2. Pengguna dapat mengaktifkan notifikasi → browser meminta izin → `PushSubscription` disimpan via `/api/push/subscribe`.
3. Cron setiap 1–5 menit memanggil `/api/cron/reminders` (header `Authorization: Bearer CRON_SECRET`):
   - Ambil `Reminder` aktif dengan `dueAt <= now()` dan belum terkirim untuk jadwal ini.
   - Kirim web push ke semua subscription pengguna (library `web-push`); hapus subscription yang mengembalikan 404/410.
   - `ONCE` → tandai terkirim; `DAILY` → majukan `dueAt` +1 hari.
4. Fallback in-app: beranda menampilkan pengingat yang jatuh tempo hari ini.
5. Isi notifikasi tidak memuat data kesehatan rinci (cukup judul pengingat).

Catatan iOS: web push di Safari iOS hanya bekerja jika website ditambahkan ke Home Screen (PWA). Tampilkan petunjuk "Tambahkan ke Layar Utama" bagi pengguna iOS.

## 12. Keamanan

| Area | Implementasi |
|---|---|
| Transport | HTTPS wajib, HSTS |
| Header | CSP ketat (`default-src 'self'`, gambar dari domain storage), `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` |
| CSRF | Server Actions memverifikasi Origin bawaan Next.js; cookie `SameSite=Lax` |
| Otorisasi | Guard server di setiap action/query; uji e2e akses lintas akun |
| Validasi | Zod di semua input server; batas panjang teks |
| Rate limit | Login kode akses, login admin, registrasi, submit form (in-memory untuk satu instance; Redis/Upstash bila multi-instance) |
| Password admin | Hash scrypt (`node:crypto`), minimal 12 karakter; tidak pernah di-log |
| Kode akses | HMAC-SHA256 + pepper untuk login, AES-256-GCM untuk tampilan; kunci terpisah di env; dapat dibuat ulang bila bocor |
| Logging | Logger terstruktur dengan redaksi PII (`phoneNumber`, `email`, `accessCode`, `nickname`, `notes`) |
| Audit | `AuditLog` untuk aksi admin dan ekspor data |
| Secrets | Variabel lingkungan; tidak ada secret di repo |
| Backup | Backup database harian terenkripsi, retensi 14 hari, uji restore sebelum uji coba |
| Retensi | Cron `/api/cron/retention` menganonimkan/menghapus data sesuai masa simpan yang ditetapkan (PRD Q5) |

## 13. Lingkungan dan Deployment

| Lingkungan | Tujuan |
|---|---|
| Local | `npm run db:local` (MongoDB replica set lewat `mongodb-memory-server`, data di `.mongo-data/`); email mode console (tautan reset password admin ditulis ke terminal) |
| Staging | Data dummy, uji validasi materi oleh nakes, uji usability |
| Production | Uji coba penelitian |

Opsi hosting (dipilih berdasarkan PRD Q7):

- **A. VPS di Indonesia** (Docker: Next.js standalone + MongoDB replica set + Caddy untuk TLS, cron sistem). Data tetap di dalam negeri; perawatan server dan backup MongoDB mandiri.
- **B. Managed** (Vercel/VPS untuk Next.js + **MongoDB Atlas** + R2). Paling mudah dioperasikan dan Atlas sudah replica set. Pilih region Atlas terdekat (cek ketersediaan region Jakarta); data di luar Indonesia perlu dinilai terhadap UU PDP dan persetujuan etik. Batasi akses jaringan Atlas (IP allowlist) dan pakai user database khusus aplikasi.

Variabel lingkungan utama:

```
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
EMAIL_PROVIDER=console|resend|smtp
EMAIL_API_KEY=
EMAIL_FROM=
ACCESS_CODE_PEPPER=          # kunci HMAC kode akses (32 byte acak)
ACCESS_CODE_ENC_KEY=         # kunci AES-256-GCM (32 byte, base64)
ADMIN_SEED_EMAIL=
STORAGE_ENDPOINT=  STORAGE_BUCKET=  STORAGE_ACCESS_KEY=  STORAGE_SECRET_KEY=
VAPID_PUBLIC_KEY=  VAPID_PRIVATE_KEY=  VAPID_SUBJECT=mailto:
CRON_SECRET=
APP_TIMEZONE=Asia/Jakarta
```

CI (GitHub Actions): lint → typecheck → unit test → build → e2e (Playwright terhadap MongoDB replica set dari `mongodb-memory-server`) pada setiap pull request.

## 14. Strategi Pengujian

| Jenis | Cakupan |
|---|---|
| Unit (Vitest) | `lib/safety` (wajib 100% cabang), perhitungan usia, normalisasi nomor HP, generator dan normalisasi kode akses, enkripsi/dekripsi kode, penilaian skor evaluasi (skala termasuk skor terbalik, pilihan, isian manual, subskor), transisi status konten, perhitungan progres penanganan |
| Komponen | `DangerAlert`, form pelacak, quiz (tidak membocorkan kunci) |
| Integrasi | Server Actions dengan database uji: kepemilikan data, aturan transisi konten klinis |
| E2E (Playwright) | Daftar dengan nama + nomor HP → kode akses tampil → logout → masuk dengan kode → onboarding anak → beranda; nomor HP ganda ditolak; login admin lewat tautan footer; admin melihat dan membuat ulang kode akses responden; responden tidak dapat membuka `/admin`; pelacak dengan tanda bahaya; kalkulator berhenti saat tanda bahaya; pretest → posttest; `/tanda-bahaya` tanpa login; admin menerbitkan materi |
| Responsif | Snapshot viewport 360, 768, 1280 px |
| Aksesibilitas | `@axe-core/playwright` pada halaman utama |
| Keamanan | Uji IDOR (akses `childId` milik orang lain), uji payload evaluasi tidak mengandung `answerKey`, ekspor skor tidak mengandung kode akses, tebakan kode akses beruntun terkena rate limit |

## 15. Observability

- Error tracking (Sentry atau setara) dengan scrubbing PII.
- Health check `/api/health` (cek koneksi database).
- Metrik produk dihitung dari `ActivityEvent` di dashboard admin, bukan dari analitik pihak ketiga, untuk menjaga privasi.

## 16. Keputusan Arsitektur (ADR ringkas)

| # | Keputusan | Alternatif yang ditolak | Alasan |
|---|---|---|---|
| 001 | Monolit Next.js untuk user + admin | Backend terpisah (Laravel/Express) + SPA | Tim kecil, satu deploy, type sharing |
| 002 | Takaran disimpan sebagai konten yang disetujui, bukan rumus | Kalkulator berbasis rumus di kode | Keselamatan; perubahan pedoman tidak butuh deploy; jejak persetujuan |
| 003 | Data evaluasi via `Participant` terpisah dari `User` | Kolom skor di `User` | Pemisahan identitas untuk penelitian, anonimisasi mudah |
| 004 | Konten materi sebagai blok JSON | HTML/MDX dari admin | Aman dari XSS, mudah dirender konsisten |
| 005 | Web Push untuk pengingat | SMS/WhatsApp | Tanpa biaya per pesan; WA dapat ditambah kemudian |
| 006 | Auth buatan sendiri (session database + cookie) | Better Auth, Auth.js | Library auth umumnya mewajibkan email pada setiap akun, sedangkan responden hanya punya nomor HP. Kebutuhannya kecil (kode akses + email/password admin), jadi lebih jelas ditulis sendiri dengan `node:crypto` |
| 007 | Responden masuk dengan kode akses acak, disimpan HMAC + terenkripsi | Password; magic link email; kode berurutan | Permintaan peneliti: mudah bagi ibu dan admin dapat membantu responden yang lupa. Kode 8 angka acak mudah diketik di keyboard angka, dengan rate limit login sebagai pelindung dari tebakan; enkripsi memungkinkan admin melihat kode tanpa menyimpan teks asli |
| 008 | Kode responden terpisah dari kode akses | Satu kode untuk login dan penelitian | Ekspor data penelitian tidak membocorkan kredensial login |
| 009 | Responden daftar hanya dengan nama + nomor HP, tanpa email dan tanpa OTP | Email wajib; OTP SMS/WhatsApp | Paling sederhana bagi ibu dan tanpa biaya OTP; pemulihan kode lewat admin |
| 011 | MongoDB + Prisma 6.19 | PostgreSQL + Prisma 7; MongoDB + Mongoose | Permintaan tim proyek memakai MongoDB. Prisma 7 belum punya driver adapter MongoDB; Prisma 6 tetap type-safe dan kode query hampir tidak berubah, dibanding menulis ulang lapisan data dengan Mongoose |
| 010 | `cacheComponents` dimatikan; semua halaman dirender dinamis | Cache Components (default template Next 16) | Hampir semua halaman bersifat pribadi per pengguna; data kesehatan tidak boleh di-cache di server; model render lebih sederhana untuk tim kecil |

Simpan ADR lengkap di `docs/adr/NNN-judul.md` saat keputusan berubah.
