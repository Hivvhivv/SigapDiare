# DESIGN.md: SIGAP DIARE Design System

Design system ini mengikuti referensi **"Pediatric Health & Caregiver Support"** (palet Primary/Secondary/Tertiary/Neutral dan Plus Jakarta Sans). Referensi tersebut **menggantikan** palet dan font pada bagian 18 dokumen desain master (biru #2879C7, Poppins/Nunito Sans). Nuansa yang diminta dokumen master tetap dipertahankan: biru cerah, banyak putih/biru pastel, hijau untuk informasi positif, kuning untuk perhatian, merah untuk tanda bahaya.

Header, beranda, dan footer mengikuti **mockup beranda** yang disetujui (§6.8, §7.2), dengan beberapa penyesuaian keselamatan yang dicatat di §7.2.

---

## 1. Prinsip Desain

1. **Tenang dan bersahabat.** Pengguna sering membuka website saat cemas karena anak sakit. Gunakan warna lembut, sudut membulat, dan kalimat menenangkan.
2. **Jelas sebelum indah.** Teks besar, kontras cukup, satu aksi utama per layar.
3. **Tanda bahaya selalu menonjol.** Merah, ikon peringatan, dan teks tegas; tidak pernah tersembunyi.
4. **Mobile-first.** Dirancang untuk layar 360 px, lalu diperluas ke desktop.
5. **Ramah literasi rendah.** Ikon disertai label, ilustrasi mendukung teks, istilah medis dijelaskan.

---

## 2. Warna

### 2.1 Palet Inti

Setiap palet memiliki skala 50–950. Skala identik dengan palet Tailwind `blue`, `sky`, `amber`, `slate`, sehingga dapat dipetakan langsung.

| Peran | Warna dasar | Skala Tailwind | Kegunaan |
|---|---|---|---|
| **Primary** | `#2563EB` | `blue` | Tombol utama, link, navigasi aktif, ikon fitur, progress |
| **Secondary** | `#0EA5E9` | `sky` | Aksen informasi, ilustrasi, chip kategori, progress sekunder |
| **Tertiary** | `#F59E0B` | `amber` | Perhatian/peringatan ringan, highlight, FAB edit |
| **Neutral** | `#1E293B` | `slate` | Teks, tombol inverted, garis, permukaan |

#### Primary (blue)

| 50 | 100 | 200 | 300 | 400 | 500 | **600** | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#EFF6FF` | `#DBEAFE` | `#BFDBFE` | `#93C5FD` | `#60A5FA` | `#3B82F6` | **`#2563EB`** | `#1D4ED8` | `#1E40AF` | `#1E3A8A` | `#172554` |

#### Secondary (sky)

| 50 | 100 | 200 | 300 | 400 | **500** | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#F0F9FF` | `#E0F2FE` | `#BAE6FD` | `#7DD3FC` | `#38BDF8` | **`#0EA5E9`** | `#0284C7` | `#0369A1` | `#075985` | `#0C4A6E` | `#082F49` |

#### Tertiary (amber)

| 50 | 100 | 200 | 300 | 400 | **500** | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#FFFBEB` | `#FEF3C7` | `#FDE68A` | `#FCD34D` | `#FBBF24` | **`#F59E0B`** | `#D97706` | `#B45309` | `#92400E` | `#78350F` | `#451A03` |

#### Neutral (slate)

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | **800** | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#F8FAFC` | `#F1F5F9` | `#E2E8F0` | `#CBD5E1` | `#94A3B8` | `#64748B` | `#475569` | `#334155` | **`#1E293B`** | `#0F172A` | `#020617` |

### 2.2 Warna Semantik (Status)

| Status | Token | Solid | Teks di atas latar terang | Latar lembut | Border | Ikon |
|---|---|---|---|---|---|---|
| Informasi umum | `info` | `#2563EB` | `#1D4ED8` | `#EFF6FF` | `#BFDBFE` | `info` |
| Positif / baik | `success` | `#16A34A` | `#15803D` | `#F0FDF4` | `#BBF7D0` | `check_circle` |
| Perhatian | `warning` | `#F59E0B` | `#B45309` | `#FFFBEB` | `#FDE68A` | `error` (segitiga) |
| **Tanda bahaya** | `danger` | `#DC2626` | `#B91C1C` | `#FEF2F2` | `#FECACA` | `emergency` / `warning` |

Status selalu ditampilkan dengan **ikon + teks + warna**, tidak pernah warna saja.

### 2.3 Permukaan (Surface)

Referensi memakai permukaan bernuansa biru (tonal), bukan abu-abu.

| Token | Hex | Kegunaan |
|---|---|---|
| `background` | `#F7F9FE` | Latar halaman |
| `surface` | `#FFFFFF` | Kartu konten utama, form, modal |
| `surface-container` | `#EAF0FC` | Kartu fitur, tile, search field, bottom nav |
| `surface-container-high` | `#DCE5F7` | Wadah pengelompokan, panel samping, area aktif |
| `outline` | `#64748B` | Border tombol outlined, border input aktif |
| `outline-variant` | `#CBD5E1` | Divider, border input default, track progress |
| `on-surface` | `#1E293B` | Teks utama |
| `on-surface-variant` | `#475569` | Teks sekunder, label, caption |

### 2.4 Aturan Kontras

| Kombinasi | Rasio | Penggunaan |
|---|---|---|
| Putih di atas `#2563EB` | 5,2 : 1 | OK untuk tombol primary |
| `#2563EB` di atas putih | 5,2 : 1 | OK untuk teks link |
| `#0EA5E9` di atas putih | 2,8 : 1 | **Jangan untuk teks.** Hanya dekorasi/ilustrasi. Teks pakai `sky-700 #0369A1` |
| `#F59E0B` di atas putih | 2,1 : 1 | **Jangan untuk teks.** Teks peringatan pakai `amber-700 #B45309` |
| Putih di atas `#B45309` | 5,0 : 1 | OK untuk FAB/ikon button tertiary |
| Putih di atas `#DC2626` | 4,8 : 1 | OK untuk tombol bahaya |
| `#1E293B` di atas `#EAF0FC` | 13 : 1 | OK |

---

## 3. Tipografi

**Satu keluarga font: Plus Jakarta Sans** (Google Fonts, karya desainer Indonesia, mendukung bobot 400–800). Dimuat via `next/font/google` dengan `display: swap`.

| Peran | Bobot | Penggunaan |
|---|---|---|
| Headline | 700 Bold | Judul halaman, judul kartu, judul section |
| Body | 400 Regular | Isi materi, deskripsi |
| Label | 600 SemiBold | Tombol, label form, tab, chip, nav |

### 3.1 Skala

Ukuran isi mengikuti kebutuhan keterbacaan dokumen master (isi 17–19 px, label 15–17 px).

| Token | Mobile (size/line-height) | Desktop (≥ 1024 px) | Bobot | Contoh |
|---|---|---|---|---|
| `display` | 32 / 40 | 40 / 48 | 700 | Hero "Selamat Datang di SIGAP DIARE!" |
| `h1` | 28 / 36 | 32 / 40 | 700 | Judul halaman |
| `h2` | 24 / 32 | 28 / 36 | 700 | Judul section / materi |
| `h3` | 20 / 28 | 22 / 30 | 700 | Judul kartu, submateri |
| `body-lg` | 18 / 30 | 19 / 32 | 400 | Isi materi edukasi |
| `body` | 17 / 28 | 17 / 28 | 400 | Teks umum, deskripsi kartu |
| `label` | 16 / 24 | 16 / 24 | 600 | Tombol, label form, nav |
| `caption` | 15 / 22 | 15 / 22 | 400 | Keterangan, timestamp, helper text |

Aturan:

- Jangan gunakan teks di bawah 15 px, kecuali label bottom nav dan eyebrow section (13–14 px), yang selalu didampingi ikon atau judul.
- Panjang baris isi materi maksimal ~68 karakter (`max-w-prose`).
- Hindari HURUF KAPITAL SEMUA untuk kalimat; hanya untuk label pendek bila perlu.

---

## 4. Spasi, Radius, Elevasi

### 4.1 Spasi

Basis 4 px. Token yang dipakai: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

- Gutter halaman: 16 px (mobile), 24 px (tablet), 32 px (desktop).
- Padding kartu: 20 px (mobile), 24 px (desktop).
- Jarak antar section: 40 px (mobile), 64 px (desktop).

### 4.2 Radius

| Token | Nilai | Penggunaan |
|---|---|---|
| `radius-sm` | 8 px | Input kecil, chip persegi |
| `radius-md` | 12 px | Input, alert inline |
| `radius-lg` | 16 px | Kartu, tile, FAB |
| `radius-xl` | 24 px | Kartu hero, modal, bottom sheet, wadah besar |
| `radius-full` | 9999 px | Tombol, search field, chip, avatar, icon button, bottom nav |

### 4.3 Elevasi

Gaya referensi datar dan tonal: hierarki dibuat dengan warna permukaan, bukan bayangan.

| Level | Penggunaan | Gaya |
|---|---|---|
| 0 | Kartu, tile | Tanpa bayangan, latar `surface-container` atau `surface` |
| 1 | Header sticky, bottom nav | `0 1px 2px rgb(15 23 42 / 0.06)` |
| 2 | Dropdown, FAB, toast | `0 4px 12px rgb(15 23 42 / 0.10)` |
| 3 | Modal, bottom sheet | `0 12px 32px rgb(15 23 42 / 0.16)` |

---

## 5. Ikon

- Implementasi memakai **`lucide-react`** (garis 2 px, sudut membulat), padanan terdekat Material Symbols Rounded di referensi. Nama ikon di tabel bawah adalah nama Material; padanan Lucide-nya: `House`, `BookOpen`, `LayoutGrid`, `CircleQuestionMark`, `UserRound`, `Info`, `Droplets`, `Pill`, `Siren`/`TriangleExclamationPoint`, `Activity`, `ListChecks`, `Calculator`, `Bell`, `ClipboardCheck`, `ArrowLeftRight`, `ShieldCheck`, `KeyRound`.
- Ukuran: 20 px (inline), 24 px (default), 32–40 px (ikon kartu fitur).
- Ikon navigasi dan aksi penting **selalu disertai label teks**.

Pemetaan ikon utama:

| Konteks | Ikon |
|---|---|
| Beranda | `home` |
| Edukasi | `menu_book` |
| Fitur | `apps` |
| FAQ | `help` |
| Profil | `person` |
| Mengenal Diare | `info` |
| Pencegahan | `clean_hands` |
| Penanganan LINTAS DIARE | `medication_liquid` |
| Tanda Bahaya | `emergency` / `warning` |
| Pelacak | `monitoring` |
| Checklist | `checklist` |
| Panduan Takaran | `calculate` |
| Ganti Anak | `swap_horiz` |
| Login Admin | `admin_panel_settings` |
| Kode akses | `key` |
| Pengingat | `notifications` |
| Evaluasi | `quiz` |

---

## 6. Komponen

### 6.1 Button

Semua tombol berbentuk pill (`radius-full`), tinggi 48 px (mobile & desktop), padding horizontal 24 px, teks `label` 600. Ikon opsional 20 px di kiri teks.

| Varian | Latar | Teks | Border | Penggunaan |
|---|---|---|---|---|
| **Primary** | `primary-600` | putih | none | Aksi utama: Mulai Belajar, Simpan Data, Masuk |
| **Secondary (tonal)** | `primary-100` | `primary-800` | none | Aksi kedua: Lihat Riwayat, Batal |
| **Inverted** | `neutral-800` | putih | none | Aksi kontras di atas latar terang/ilustrasi |
| **Outlined** | transparan | `neutral-800` | 1 px `outline` | Aksi tersier: Sebelumnya, Lihat Profil |
| **Danger** | `danger-600` | putih | none | Hapus akun, Pelajari Tanda Bahaya pada banner |
| **Text** | transparan | `primary-700` | none | Link aksi dalam kartu: "Buka" |

State: hover menggelapkan 1 tingkat skala, pressed 2 tingkat; focus ring 3 px `primary-300` dengan offset 2 px; disabled opacity 40% dan `cursor-not-allowed`.

Aturan: maksimal satu tombol Primary per area tampilan.

### 6.2 Icon Button

Lingkaran 40 px (target sentuh tetap 44 px melalui padding), ikon 20–24 px putih.

| Varian | Latar | Contoh |
|---|---|---|
| Primary | `primary-600` | Aksi umum |
| Secondary | `sky-700` | Kategori/info |
| Tertiary | `amber-700` | Tag/label |
| Danger | `danger-600` | Hapus |
| Standard | transparan, ikon `on-surface-variant` | Toolbar |

Selalu memiliki `aria-label` berbahasa Indonesia.

### 6.3 FAB

- **FAB**: kotak 56 px, `radius-lg`, latar `amber-700`, ikon putih. Dipakai untuk aksi tambah cepat (misal "Tambah Catatan" di Pelacak).
- **Extended FAB**: pill tinggi 48 px, latar `primary-600`, ikon + label putih. Dipakai saat label diperlukan (misal "Catat Hari Ini").
- Posisi mobile: kanan bawah, 16 px dari tepi, di atas bottom nav.

### 6.4 Search Field

Pill tinggi 48 px, latar `surface-container`, border 1 px `primary-200`, ikon `search` di kiri, placeholder `on-surface-variant`. Fokus: border 2 px `primary-600`. Dipakai di FAQ dan admin.

### 6.5 Form Field

- Label di atas field (bukan placeholder-sebagai-label), `label` 600.
- Input tinggi 48 px, `radius-md`, latar `surface`, border 1 px `outline-variant`; fokus border 2 px `primary-600`.
- Helper text `caption` di bawah; error: teks `danger-700` + ikon `error` + border `danger-600`.
- Field opsional diberi penanda "(opsional)" pada label.
- Pilihan sedikit (konsistensi tinja, kondisi umum, jenis kelamin) memakai **segmented/radio card** besar, bukan dropdown.
- Angka kecil (frekuensi BAB, muntah) memakai **stepper** `−` / `+` dengan angka besar di tengah.

### 6.6 Progress Bar

Tinggi 6 px, `radius-full`, track `outline-variant` 40%. Warna isi:

| Konteks | Warna |
|---|---|
| Progres materi edukasi | `primary-600` |
| Progres checklist hari ini | `sky-700` |
| Progres evaluasi (soal ke-n) | `amber-800` |

Selalu disertai teks ("3 dari 7 selesai").

### 6.7 Kartu

| Varian | Gaya | Penggunaan |
|---|---|---|
| **Feature card** | `surface`, border 1 px `outline-variant`, `radius-lg`, padding 20, isi terpusat: ikon dalam kotak membulat 48 px (`radius-md`, latar `primary-50`, ikon `primary-600`), judul `label` 600, deskripsi `caption` maks. 2 baris. Varian bahaya: latar `danger-soft`, border `danger-border`, ikon dan judul `danger-strong` | 10 kartu Akses Cepat Fitur Utama, daftar fitur |
| **Content card** | `surface`, `radius-lg`, border 1 px `outline-variant` | Materi, riwayat, form |
| **Lesson card** | `surface`, `radius-xl`, ilustrasi di atas (rasio 16:9), judul, deskripsi, progress bar, tombol "Pelajari Materi" | Daftar materi edukasi |
| **Stat card** | `surface-container`, angka besar `h2`, label `caption` | Ringkasan pemantauan, dashboard admin |
| **Child bar** | `surface`, border `outline-variant`, `radius-xl`, satu baris: avatar 48 px, nama `h3` + chip "Anak Aktif", info usia · berat · hari pemantauan (`caption`); kanan: chip "Pemantauan hari ke-n" dan tombol tonal "Ganti Anak". Mobile: dua baris | Bar profil anak di bawah header beranda |
| **Hero card** | gradien `primary-50` → `surface`, border 1 px `primary-100`, `radius-xl`, padding 32/40; nama ibu diwarnai `primary-600`; kotak ringkasan catatan terakhir (`surface`, `radius-lg`); ilustrasi di kartu bergambar `radius-xl` dengan caption | Hero beranda |
| **Progress card** | `surface`, border `outline-variant`, `radius-lg`; judul `h3`, chip netral di kanan atas, deskripsi `caption`, progress bar + teks angka di bawah | Progres Penanganan Hari Ini |
| **CTA banner** | gradien `primary-700` → `primary-600`, `radius-xl`, ikon dalam lingkaran putih transparan, judul putih `h3`, tombol putih dengan teks `primary-700` | Uji Pemahaman Bunda Sekarang |

Seluruh kartu yang dapat diklik memiliki area klik penuh dan state hover `surface-container-high`.

### 6.8 Navigasi

**Header (desktop ≥ 1024 px)**: tinggi 72 px, latar putih, elevasi 1, sticky.

- Kiri: logo SIGAP DIARE (ikon + wordmark dengan tagline kecil).
- Tengah: Beranda, Edukasi Diare, Fitur & Pemantauan, Evaluasi Pengetahuan, FAQ. Item aktif berbentuk pill `primary-600` dengan teks putih; item lain teks `on-surface-variant` dengan hover latar `surface-container`.
- Kanan: tombol pill **Tanda Bahaya** (latar `danger-soft`, border `danger-border`, ikon `emergency` dan teks `danger-strong`), icon button lonceng (pengingat, badge jumlah jatuh tempo), avatar + nama pengguna + keterangan peran ("Bunda") dengan dropdown Profil, Pengaturan, Keluar.

**Header (mobile)**: tinggi 56 px. Kiri: logo. Kanan: tombol Tanda Bahaya ringkas (ikon + "Bahaya"), lonceng, avatar.

**Bottom navigation (mobile < 1024 px)**: wadah pill `surface-container` mengambang 12 px dari bawah, 5 item: Beranda, Edukasi, Fitur, Evaluasi, FAQ (Profil lewat avatar di header). Item aktif: lingkaran 40 px `primary-600` dengan ikon putih fill. **Label teks wajib tampil di bawah setiap ikon** (13 px) untuk pengguna dengan literasi digital rendah.

**Footer** (halaman responden dan halaman publik; tidak tampil di area admin):

- Latar `surface`, border atas `outline-variant`, padding vertikal 48 px (desktop 64 px). Di mobile beri padding bawah tambahan agar tidak tertutup bottom nav.
- 4 kolom desktop, 2 kolom tablet, bertumpuk di mobile:
  1. Logo + deskripsi singkat SIGAP DIARE + catatan "Materi mengacu pada pedoman kesehatan dan ditinjau tenaga kesehatan".
  2. **Edukasi & Penanganan**: Mengenal Diare, Pencegahan Diare, Panduan LINTAS DIARE, Gejala & Tanda Bahaya.
  3. **Fitur Pendamping**: Panduan Takaran, Pelacak Diare, Checklist Harian, Pengingat SIGAP, Evaluasi Pengetahuan.
  4. **Layanan Darurat**: kartu `danger-soft` berisi ikon telepon, "Hotline Darurat 119" (tautan `tel:119`), dan "Segera ke puskesmas/rumah sakit terdekat bila ada tanda bahaya".
- Bar bawah (`caption`, `on-surface-variant`): "© 2026 SIGAP DIARE" di kiri; Bantuan · Kebijakan Privasi di kanan.
- **Login Admin**: tepat di bawah bar footer, terpusat, teks `caption` `on-surface-variant` dengan ikon `admin_panel_settings` 16 px, menuju `/admin/masuk`. Sengaja tidak menonjol.
- Jangan menampilkan logo Kemenkes atau instansi lain tanpa izin tertulis.

**Breadcrumb / Back**: setiap halaman di bawah level pertama memiliki tombol kembali (`arrow_back` + teks "Kembali") di kiri atas.

### 6.9 DangerAlert (komponen keselamatan)

Komponen paling penting. Satu komponen dipakai di semua tempat.

```
┌──────────────────────────────────────────────┐
│ [⚠ ikon 32px]  Segera Bawa Anak ke           │
│                Fasilitas Kesehatan            │
│                                               │
│  Anda mencatat: darah pada tinja.             │
│  Kondisi ini termasuk tanda bahaya diare.     │
│                                               │
│  [ 📞 Hubungi 119 ]  [ Lihat Tanda Bahaya ]   │
└──────────────────────────────────────────────┘
```

- Latar `danger-50`, border kiri 6 px `danger-600`, border lain 1 px `danger-200`, `radius-lg`.
- Judul `h3` `danger-700`; isi `body` `on-surface`.
- Menyebutkan tanda yang terdeteksi dalam bahasa sederhana.
- Tombol Danger "Hubungi 119" (`tel:119`) dan tombol Outlined "Lihat Tanda Bahaya".
- `role="alert"`; fokus dipindahkan ke alert saat muncul.
- Varian **kartu** (beranda, kolom kanan): latar `danger-50` merah muda, ikon dalam lingkaran `danger-100`, judul "Kapan Harus ke Dokter / Puskesmas?", daftar singkat tanda bahaya dengan ikon, tombol Danger penuh "Cek Pedoman Bahaya Lengkap".
- Varian **banner** (landing dan halaman edukasi): judul "Kenali Tanda Bahaya Diare!", tombol Danger "Pelajari Tanda Bahaya".

### 6.10 Callout

Kotak informasi di dalam materi. Struktur sama dengan DangerAlert namun lebih ringan (border kiri 4 px).

| Varian | Penggunaan |
|---|---|
| `info` | Penjelasan tambahan |
| `success` | Tips, kebiasaan baik, "Bagus, Bu!" |
| `warning` | "Hal yang perlu diperhatikan" |
| `danger` | "Kapan harus ke fasilitas kesehatan" |
| `disclaimer` | Latar `neutral-100`, ikon `info`: "Informasi ini bukan pengganti pemeriksaan tenaga kesehatan." |

### 6.11 Checklist Item

Baris tinggi minimum 56 px, `radius-md`, border 1 px `outline-variant`, checkbox persegi membulat 24 px, teks `body` + keterangan `caption` opsional. Tercentang (sesuai mockup): latar `primary-50`, border `primary-200`, checkbox terisi `primary-600` dengan centang putih, ikon `check` `primary-600` di kanan; teks tetap `on-surface` (tidak dicoret). Seluruh baris dapat diklik. Header kartu: judul + chip "x/y Selesai"; footer kartu: teks motivasi `caption` + tombol Text "Simpan".

### 6.12 Accordion (FAQ)

Item `surface`, `radius-lg`, border 1 px `outline-variant`, jarak 12 px. Header: pertanyaan `label` 600 ukuran 17 px + ikon `expand_more` yang berputar 180° saat terbuka. Isi: `body`, padding 20 px. Hanya satu terbuka sekaligus (opsional). Menggunakan `<button aria-expanded>`.

### 6.13 Evaluasi (Quiz)

Satu soal per layar (mudah di HP).

- Header: nama bagian (chip, misal "Pengetahuan"), "Soal 3 dari 15", progress bar `amber-800`, indikator "Tersimpan ✓" kecil setelah autosave.
- Teks soal `h3`; tanda "(wajib)" atau "(opsional)" di bawahnya (`caption`).

**Tipe Pilihan**: kartu radio penuh lebar, tinggi minimum 56 px, huruf A/B/C/D dalam lingkaran di kiri; terpilih: border 2 px `primary-600`, latar `primary-50`, lingkaran terisi `primary-600`.

**Tipe Skala**:

```
Desktop / tablet                                  Mobile (< 640 px)
Saya selalu mencuci tangan sebelum                Saya selalu mencuci tangan ...
menyiapkan makanan anak.                          ( ) 1  Sangat Tidak Setuju
                                                  ( ) 2  Tidak Setuju
 [ 1 ]   [ 2 ]   [ 3 ]   [ 4 ]   [ 5 ]            (•) 3  Ragu-ragu
Sangat                          Sangat            ( ) 4  Setuju
Tidak Setuju                    Setuju            ( ) 5  Sangat Setuju
```

- Desktop: deret tombol lingkaran 56 px, angka `label` 600; label ujung di bawah titik pertama dan terakhir (label tengah tampil sebagai tooltip dan `aria-label`). Terpilih: latar `primary-600`, angka putih.
- Mobile: daftar kartu radio vertikal, setiap titik menampilkan angka + label lengkap agar tidak salah tafsir.
- Memakai `role="radiogroup"`; dapat dipilih dengan tombol panah.
- Tidak ada indikasi bahwa soal memakai skor terbalik.

**Tipe Isian**:

- Singkat: input tinggi 48 px. Panjang: textarea minimal 4 baris, tumbuh otomatis.
- Penghitung karakter di kanan bawah ("120/500"); placeholder "Tulis jawaban Ibu di sini…".
- Autosave saat berhenti mengetik.

**Navigasi dan pengiriman**:

- Footer sticky: Outlined "Sebelumnya", Primary "Selanjutnya"; pada soal terakhir menjadi "Tinjau Jawaban".
- Soal wajib yang belum dijawab: "Selanjutnya" tetap aktif, tetapi soal ditandai di halaman tinjauan.
- **Halaman tinjauan**: grid nomor soal (terjawab = `primary-600`, belum = outline `danger`), daftar soal wajib yang belum terjawab dengan tautan "Jawab", tombol Primary "Kirim Jawaban" (nonaktif bila masih ada soal wajib kosong).
- Modal konfirmasi: "Jawaban tidak dapat diubah setelah dikirim."
- Selesai: ilustrasi + "Terima kasih, Bu! Jawaban Ibu sudah tersimpan." Tidak menampilkan benar/salah atau skor selama jendela evaluasi masih terbuka.

### 6.14 Lainnya

- **Section header**: eyebrow (huruf kapital, 13–14 px, 700, `primary-700`, tracking 0.08em) di atas judul `h2`; tautan aksi di kanan (`label`, `primary-700`, ikon `arrow_forward`), contoh "Lihat Grafik Lengkap".
- **Chip**: pill tinggi 32 px, latar `primary-100`/`sky-100`, teks `label` 14–15 px. Untuk kategori/status.
- **Badge status konten (admin)**: Draft (`neutral`), Ditinjau (`warning`), Disetujui (`info`), Terbit (`success`).
- **Toast**: kanan bawah (desktop) / atas bottom nav (mobile), `neutral-800` dengan teks putih, 4 detik.
- **Modal**: `radius-xl`, maksimal 480 px; di mobile menjadi bottom sheet.
- **Empty state**: ilustrasi kecil + kalimat ramah + tombol aksi ("Belum ada catatan. Yuk, catat kondisi si kecil hari ini.").
- **Skeleton**: `surface-container` dengan animasi pulse.

---

## 7. Layout

### 7.1 Breakpoint dan Grid

| Breakpoint | Lebar | Kolom | Gutter | Navigasi |
|---|---|---|---|---|
| `sm` | < 640 px | 4 | 16 px | Header ringkas + bottom nav |
| `md` | 640–1023 px | 8 | 24 px | Header ringkas + bottom nav |
| `lg` | ≥ 1024 px | 12 | 32 px | Header penuh |

Kontainer maksimum 1200 px; halaman bacaan materi maksimum 720 px.

### 7.2 Pola Halaman

**Beranda (mengikuti mockup)**

Desktop:

```
┌──────────────────────────────────────────────────────────────────────┐
│ Logo │ [Beranda] Edukasi Diare  Fitur & Pemantauan  Evaluasi  FAQ │   │
│      │                         [⚠ Tanda Bahaya]  🔔  (◯) Bunda Sarah │
├──────────────────────────────────────────────────────────────────────┤
│ (◯) Arka Narendra [Anak Aktif] · 2 th 3 bln · 11 kg                  │
│                                   [Pemantauan hari ke-3] [Ganti Anak] │
├──────────────────────────────────────────────────────────────────────┤
│ HERO CARD                                  │ ┌──────────────────────┐│
│ chip sapaan                                │ │ Ilustrasi ibu        ││
│ Selamat Datang Kembali, Bunda Sarah!       │ │ menggendong anak     ││
│ deskripsi singkat                          │ │ + caption            ││
│ ┌ Catatan terakhir: 08.30 · BAB 1× · Lembek┐│ └──────────────────────┘│
│ [Catat Kondisi Hari Ini] [Panduan Cepat LINTAS DIARE]                │
├──────────────────────────────────────────────────────────────────────┤
│ PEMANTAUAN · Progres Penanganan Hari Ini       Lihat Grafik Lengkap →│
│ [Cairan & Oralit]     [Zinc]               [Pemberian Oralit]        │
├──────────────────────────────────────────────────────────────────────┤
│ MENU · Akses Cepat Fitur Utama                                       │
│ [Mengenal] [Pencegahan] [5 LINTAS] [TANDA BAHAYA] [Panduan Takaran]  │
│ [Checklist] [Pelacak]   [Pengingat] [FAQ]         [Evaluasi Ibu]     │
├────────────────────────────────────────┬─────────────────────────────┤
│ Ceklis Rutin Hari Ini        [3/5]     │ Kapan Harus ke Dokter /     │
│ ☑ Cuci tangan sebelum menyiapkan makan │ Puskesmas? (merah muda)     │
│ ☑ …                                    │ • tanda bahaya singkat      │
│ ☐ …                                    │ [Cek Pedoman Bahaya Lengkap]│
│ teks motivasi              Simpan →    ├─────────────────────────────┤
│                                        │ Artikel pilihan: MPASI …    │
├────────────────────────────────────────┴─────────────────────────────┤
│ CTA BANNER: Uji Pemahaman Bunda Sekarang          [Mulai Evaluasi]   │
├──────────────────────────────────────────────────────────────────────┤
│ Footer 4 kolom (lihat §6.8)                                          │
│ © 2026 SIGAP DIARE                         Bantuan · Kebijakan Privasi│
├──────────────────────────────────────────────────────────────────────┤
│                          🛡 Login Admin                               │
└──────────────────────────────────────────────────────────────────────┘
```

Grid: hero 7/5 kolom; progres 3 kartu sama lebar; akses cepat 5 × 2; ceklis 7 kolom + kolom kanan 5 kolom.

Urutan di mobile (satu kolom):

1. Header ringkas
2. Child bar (dua baris)
3. Hero (ilustrasi di bawah teks, tinggi dibatasi 200 px)
4. Kartu **Kapan Harus ke Dokter / Puskesmas?** (dinaikkan agar terlihat tanpa banyak menggulir)
5. Progres Penanganan (kartu digeser horizontal)
6. Akses Cepat: grid 2 kolom, kartu Tanda Bahaya di baris pertama
7. Ceklis Rutin Hari Ini
8. Artikel pilihan
9. CTA banner evaluasi
10. Footer + Login Admin
11. Bottom nav

Detail isi:

- **Hero**: status ringkas berisi data catatan terakhir apa adanya. Jika catatan terakhir memicu tanda bahaya, kotak ringkasan diganti `DangerAlert`. Jika belum ada catatan: "Belum ada catatan hari ini."
- **Progres Penanganan** (hanya saat episode diare aktif; jika tidak, tampil satu kartu ajakan "Mulai Pemantauan Diare"):
  - *Cairan & Oralit Hari Ini*: total ml yang dicatat hari ini. Progress bar hanya tampil jika ibu mengisi target dari tenaga kesehatan.
  - *Zinc*: "Hari ke-n dari m" dengan m dari rencana perawatan; chip "Sudah diberikan hari ini" atau "Belum dicatat".
  - *Pemberian Oralit*: waktu dan jumlah pemberian terakhir, serta teks panduan dari konten yang disetujui.
- **Ceklis Rutin**: item pencegahan setiap hari; item perawatan muncul hanya saat episode aktif.

Penyesuaian keselamatan dari mockup (wajib):

| Di mockup | Diterapkan sebagai | Alasan |
|---|---|---|
| Chip "Hidrasi Aman" | Chip netral "Tercatat 3×" | Tidak boleh menilai status hidrasi otomatis |
| "Status Anak Saat Ini: Kondisi Membaik" | "Catatan terakhir: 08.30 · BAB 1× · Lembek" | Tidak ada penilaian klinis otomatis |
| "Setiap BAB cair, 100 ml" | Teks dari `GuidanceRule` yang disetujui untuk usia anak; bila belum ada: "Ikuti takaran dari tenaga kesehatan" | Tidak ada dosis yang ditulis di kode |
| "Memberikan tablet zinc (20 mg)" | "Memberikan zinc sesuai anjuran tenaga kesehatan" atau teks dari konten yang disetujui | Sama |
| "Siapkan 1 sachet oralit baru dalam 200 ml air" | Teks dari konten yang disetujui | Sama |
| Target "400/600 ml", "Hari ke-3 dari 10" | Target dari rencana perawatan yang diisi ibu sesuai instruksi tenaga kesehatan; tanpa target hanya tampil total | Sama |
| "Kalkulator Dosis" | "Panduan Takaran" | Fitur ini panduan edukasi, bukan peresepan |
| "sesuai protokol resmi Kementerian Kesehatan RI" | "sesuai anjuran tenaga kesehatan"; nama pedoman dicantumkan sebagai referensi di halaman materi | Hindari kesan endorsement resmi |

**Detail Materi**: tombol kembali, judul materi, progress submateri, ilustrasi, isi `body-lg` (maks. 720 px), callout, navigasi Sebelumnya/Selanjutnya sticky di bawah. Tautan "Tanda Bahaya" selalu ada di header.

**Pelacak**: ringkasan anak aktif + pemilih anak, grafik batang frekuensi BAB 7 hari (`primary-600`), daftar riwayat per tanggal, Extended FAB "Catat Kondisi".

**Kalkulator**: langkah 1 skrining tanda bahaya (pertanyaan ya/tidak besar) → langkah 2 data anak → hasil. Jika ada tanda bahaya pada langkah 1, alur berhenti dan DangerAlert tampil penuh.

**Admin**: sidebar kiri 256 px (`surface-container`), konten tabel di kanan; di mobile sidebar menjadi drawer. Admin boleh memakai teks `body` 16 px untuk tabel padat.

**Masuk responden** (`/masuk`)

- Kartu terpusat maks. 440 px di atas latar `background`, ilustrasi kecil di atas judul.
- Judul "Masuk ke SIGAP DIARE"; subjudul "Masukkan kode akses yang Anda terima saat mendaftar."
- Satu field **Kode Akses** (8 angka): tinggi 56 px, teks 22 px 700, `tracking-[0.2em]`, `tabular-nums`, rata tengah, placeholder "8 angka", `inputmode="numeric"` (keyboard angka di HP), hanya menerima angka dan otomatis menyisipkan tanda hubung setelah 4 angka (`1234-5678`), `autocomplete="off"`.
- Tombol Primary penuh "Masuk"; tautan "Lupa kode akses?" dan "Belum punya akun? Daftar".
- Error: "Kode akses tidak ditemukan. Periksa kembali atau gunakan Lupa kode akses."

**Daftar** (`/daftar`): hanya dua field, Nama Lengkap dan Nomor HP (`type="tel"`, `inputmode="tel"`, placeholder `08xxxxxxxxxx`), plus checkbox persetujuan kebijakan privasi; tombol Primary "Daftar & Dapatkan Kode Akses". Bila nomor sudah terdaftar, tampilkan error di bawah field Nomor HP dengan tautan "Masuk" dan "Lupa kode akses?".

**Pilih Anak** (`/profil/anak`, tujuan tombol "Ganti Anak" di beranda dan profil): tombol kembali ke Beranda, daftar kartu anak (avatar inisial, nama, usia, jenis kelamin; anak aktif diberi border `primary-600` + chip "Anak Aktif" + tanda "Dipilih"), tombol Primary "Pilih" pada anak lain yang langsung kembali ke Beranda, dan tombol tonal "Tambah Anak" di bawah. **Tidak ada tombol Keluar** di halaman ini; tombol Keluar di halaman Profil berada di kotak Data Ibu (atas), bukan di bawah daftar anak.

**Lupa kode** (`/lupa-kode`): ilustrasi kecil, teks "Hubungi admin SIGAP DIARE dan sebutkan nama serta nomor HP yang Anda daftarkan.", tombol Primary "Hubungi Admin via WhatsApp" (tautan `https://wa.me/{nomor}` dengan pesan awal tanpa data kesehatan), dan tombol Outlined "Kembali ke Masuk".

**Pendaftaran berhasil** (`/daftar/berhasil`)

- Ikon `check_circle` `success`, judul "Pendaftaran Berhasil!".
- Kotak kode: latar `primary-50`, border 2 px dashed `primary-300`, `radius-lg`, kode 32 px 800 `primary-700` dengan tracking lebar.
- Tombol tonal "Salin Kode"; callout `warning`: "Simpan kode ini baik-baik. Kode dipakai setiap kali masuk. Kami sarankan screenshot layar ini atau catat di buku."
- Checkbox "Saya sudah menyimpan kode akses" mengaktifkan tombol Primary "Lanjut Isi Profil Anak".

**Login Admin** (`/admin/masuk`)

- Tata letak sederhana dengan header Inverted (`neutral-800`) bertuliskan "SIGAP DIARE · Admin" agar jelas berbeda dari halaman responden.
- Field Email dan Password (tombol tampil/sembunyi), tombol Inverted penuh "Masuk sebagai Admin", tautan "Lupa password?". Tidak ada tautan Daftar.

**Admin · Responden** (`/admin/responden`)

- Toolbar: search field (nama/nomor HP/kode), filter status evaluasi dan status akun, tombol Outlined "Ekspor Daftar".
- Tabel: Nama, No. HP, **Kode Akses** (`tabular-nums`, tracking lebar, icon button salin), Kode Responden, Terdaftar, Anak, Pretest, Posttest (chip Belum/Sedang/Selesai), Aktivitas Terakhir, Status, menu aksi (Lihat Detail, Buat Ulang Kode Akses, Nonaktifkan).
- Mobile: tabel berubah menjadi daftar kartu.
- Buat ulang kode memakai modal konfirmasi: "Kode lama tidak dapat dipakai lagi dan responden akan keluar dari semua perangkat."
- Ekspor daftar responden (identitas + kode akses) adalah tombol terpisah dari ekspor skor penelitian (hanya kode responden).

**Admin · Susun Instrumen** (`/admin/evaluasi/[id]`)

- Header: nama instrumen, chip fase (Pretest/Posttest), chip status (Draft / Dibuka / Ditutup / Terkunci), tombol "Pratinjau", "Salin dari Pretest" (khusus posttest), "Atur Jadwal".
- Daftar soal dikelompokkan per bagian; setiap soal berupa kartu dengan handle geser (`drag_indicator`), nomor, chip tipe (Skala `primary`, Pilihan `sky`, Isian `amber`), teks soal, menu aksi (Ubah, Duplikat, Hapus).
- Tombol "Tambah Soal" membuka panel samping (bottom sheet di mobile) dengan pemilih tipe berupa 3 kartu besar: Skala, Pilihan, Isian. Field yang muncul sesuai tipe:
  - Skala: rentang (default 1–5), label tiap titik (preset "Setuju–Tidak Setuju", "Selalu–Tidak Pernah"), toggle "Skor terbalik".
  - Pilihan: daftar pilihan (tambah/hapus/geser), radio "Kunci" di setiap pilihan, bobot.
  - Isian: singkat/panjang, contoh jawaban untuk penilai, bobot, toggle "Tidak dinilai".
  - Umum: bagian, wajib/opsional.
- Saat instrumen terkunci, semua field read-only dengan banner `info`: "Instrumen terkunci karena sudah ada jawaban masuk."

**Admin · Penilaian Isian** (`/admin/evaluasi/[id]/penilaian`)

- Kiri: daftar soal isian dengan progres "18/40 dinilai".
- Kanan: soal + contoh jawaban (callout `info`), lalu daftar jawaban per kode responden (tanpa nama). Setiap jawaban punya input skor (stepper 0..bobot) dan catatan opsional; tombol "Simpan & Berikutnya".
- Filter: Belum dinilai / Sudah dinilai.
---

## 8. Ilustrasi dan Gambar

- Gaya: flat/semi-flat, sudut membulat, garis lembut, tanpa outline hitam tebal.
- Palet ilustrasi: primary, secondary, tertiary dalam tingkat 100–500 + warna kulit beragam.
- Tokoh: ibu (termasuk berkerudung dan tidak), anak balita, tenaga kesehatan (bidan/dokter), latar rumah dan puskesmas Indonesia.
- Ilustrasi medis (BAB normal vs diare, sistem pencernaan) dibuat skematis dan sopan, tidak realistis.
- Ilustrasi tanda bahaya menunjukkan kondisi (anak lemas, mata cekung) tanpa kesan menakutkan.
- Format SVG atau WebP; setiap gambar punya `alt` deskriptif Bahasa Indonesia.

## 9. Gaya Bahasa (Voice & Tone)

- Pengguna adalah **ayah, bunda, nenek/kakek, atau pengasuh**. Sapaan umum "Ayah/Bunda"; sapaan pribadi memakai nama depan ("Selamat pagi, Sarah!"), bukan "Bunda {nama}". Jangan menyapa hanya "Ibu".
- Hangat dan menyemangati; "si kecil" untuk anak.
- Istilah awam di sisi orang tua: "Kuis Awal/Kuis Akhir" (bukan pretest/posttest), "Nomor Peserta" (bukan kode responden), "Catatan Diare" (bukan pelacak), "Tanya Jawab" (bukan FAQ). Istilah penelitian tetap dipakai di panel admin.
- Setiap form memberi petunjuk singkat di bawah field (mis. "Kode akses berisi 8 angka…").
- Kalimat pendek (≤ 20 kata), satu gagasan per kalimat.
- Istilah medis disertai penjelasan: "dehidrasi (kekurangan cairan tubuh)".
- Pesan tanda bahaya: tegas dan langsung, tanpa menyalahkan. "Segera bawa anak ke fasilitas kesehatan terdekat."
- Hindari kalimat diagnosis: tulis "Anda mencatat darah pada tinja", bukan "Anak Anda mengalami disentri".
- Pesan keberhasilan positif dan langsung muncul saat dicentang: "Hebat, tinggal 1 lagi. Si kecil makin terlindungi!" / "Luar biasa! Semua kebiasaan sehat sudah dilakukan hari ini." (`src/lib/friendly.ts`).

## 10. Aksesibilitas

- Kontras WCAG AA (lihat §2.4).
- Target sentuh ≥ 44 × 44 px.
- Fokus keyboard terlihat (focus ring `primary-300`).
- Semua input memiliki `<label>`; error diumumkan via `aria-describedby`.
- Hormati `prefers-reduced-motion`.
- Status tidak hanya dikodekan dengan warna.
- `lang="id"` pada `<html>`.

## 11. Motion

- Durasi 150 ms (hover/press), 200–250 ms (accordion, modal), easing `cubic-bezier(0.2, 0, 0, 1)`.
- Tidak ada animasi dekoratif yang berulang.
- DangerAlert muncul tanpa animasi lambat (maksimal 150 ms).

---

## 12. Implementasi Token (Tailwind CSS v4)

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;

  /* Peran inti → skala Tailwind bawaan */
  --color-primary-50: var(--color-blue-50);
  --color-primary-100: var(--color-blue-100);
  --color-primary-200: var(--color-blue-200);
  --color-primary-300: var(--color-blue-300);
  --color-primary-600: var(--color-blue-600);   /* #2563EB */
  --color-primary-700: var(--color-blue-700);
  --color-primary-800: var(--color-blue-800);
  --color-primary: var(--color-blue-600);

  --color-secondary: var(--color-sky-500);      /* #0EA5E9 */
  --color-secondary-strong: var(--color-sky-700);

  --color-tertiary: var(--color-amber-500);     /* #F59E0B */
  --color-tertiary-strong: var(--color-amber-700);

  --color-neutral: var(--color-slate-800);      /* #1E293B */

  /* Semantik */
  --color-success: #16A34A;
  --color-success-strong: #15803D;
  --color-success-soft: #F0FDF4;
  --color-warning: #F59E0B;
  --color-warning-strong: #B45309;
  --color-warning-soft: #FFFBEB;
  --color-danger: #DC2626;
  --color-danger-strong: #B91C1C;
  --color-danger-soft: #FEF2F2;
  --color-danger-border: #FECACA;

  /* Permukaan */
  --color-background: #F7F9FE;
  --color-surface: #FFFFFF;
  --color-surface-container: #EAF0FC;
  --color-surface-container-high: #DCE5F7;
  --color-outline: #64748B;
  --color-outline-variant: #CBD5E1;
  --color-on-surface: #1E293B;
  --color-on-surface-variant: #475569;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Tipografi */
  --text-display: 2rem;      --text-display--line-height: 2.5rem;
  --text-h1: 1.75rem;        --text-h1--line-height: 2.25rem;
  --text-h2: 1.5rem;         --text-h2--line-height: 2rem;
  --text-h3: 1.25rem;        --text-h3--line-height: 1.75rem;
  --text-body-lg: 1.125rem;  --text-body-lg--line-height: 1.875rem;
  --text-body: 1.0625rem;    --text-body--line-height: 1.75rem;
  --text-label: 1rem;        --text-label--line-height: 1.5rem;
  --text-caption: 0.9375rem; --text-caption--line-height: 1.375rem;
}
```

Ukuran desktop (§3.1) diterapkan dengan prefix `lg:` pada komponen tipografi (`<Heading>`, `<Text>`), bukan dengan mengubah token.

Tema gelap tidak termasuk cakupan v1.
