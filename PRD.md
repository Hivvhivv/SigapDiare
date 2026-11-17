# PRD: SIGAP DIARE

**Sahabat Ayah Bunda untuk Cegah dan Tangani Diare pada Si Kecil**

> Tagline asli dokumen master: "Sahabat Ibu untuk …". Diperluas agar juga menyapa ayah dan pengasuh lain (ubah di `src/content/copy/site.ts` bila perlu).

| Atribut | Nilai |
|---|---|
| Jenis produk | Website edukasi kesehatan dan pemantauan kondisi anak |
| Platform | Responsive web (mobile-first, desktop) |
| Bahasa | Bahasa Indonesia |
| Akses | Responden: daftar dengan nama + nomor HP, masuk dengan kode akses. Admin: email + password. Halaman tanda bahaya publik |
| Status dokumen | Draft v1.0 |

---

## 1. Ringkasan

SIGAP DIARE membantu ibu dan pengasuh balita memahami, mencegah, dan melakukan penanganan awal diare. Pengguna dapat membaca materi edukasi, mencatat kondisi anak, menjalankan checklist pencegahan harian, membuat pengingat, dan mengikuti evaluasi pengetahuan (pretest/posttest) yang menjadi bagian dari penelitian.

Empat pilar produk: **Edukasi**, **Pencegahan**, **Pemantauan**, **Evaluasi**.

## 2. Masalah

- Ibu kesulitan menemukan informasi diare balita yang terpercaya, ringkas, dan mudah dipahami.
- Tanda bahaya sering terlambat dikenali sehingga rujukan tertunda.
- Kebiasaan pencegahan (cuci tangan, air bersih, kebersihan makanan) tidak terpantau secara rutin.
- Saat anak diare, ibu tidak punya catatan terstruktur untuk disampaikan ke tenaga kesehatan.

## 3. Tujuan

| # | Tujuan | Indikator |
|---|---|---|
| G1 | Meningkatkan pengetahuan ibu tentang diare balita | Kenaikan skor posttest dibanding pretest |
| G2 | Ibu mengenali tanda bahaya | Halaman tanda bahaya dapat dicapai ≤ 1 klik dari mana pun |
| G3 | Membangun kebiasaan pencegahan | Proporsi pengguna yang mengisi checklist ≥ 3 hari/minggu |
| G4 | Pencatatan kondisi anak saat diare | Jumlah catatan pelacak per episode |
| G5 | Penanganan awal sesuai pedoman LINTAS DIARE | Materi penanganan diselesaikan |

## 4. Non-Goals

SIGAP DIARE **bukan**:

- Alat diagnosis diare atau penentu derajat dehidrasi.
- Pengganti pemeriksaan dokter atau resep.
- Pemberi rekomendasi antibiotik atau obat secara otomatis.
- Layanan telekonsultasi atau chat dengan tenaga kesehatan (di luar cakupan v1).
- Aplikasi native (v1 adalah web responsif; PWA opsional untuk notifikasi).

## 5. Pengguna

### 5.1 Ibu / Pengasuh (responden, pengguna utama)

- Memiliki anak usia balita (0–59 bulan).
- Mayoritas mengakses lewat smartphone, sebagian dengan koneksi terbatas.
- Literasi kesehatan bervariasi; butuh bahasa sederhana, kalimat pendek, dan ilustrasi.
- Kebutuhan: tahu apa yang harus dilakukan sekarang, kapan harus ke fasilitas kesehatan.

### 5.2 Administrator (dua role: Admin dan Super Admin)

| Role | Wewenang |
|---|---|
| **Admin** | Dashboard, daftar responden beserta kode aksesnya, evaluasi (susun soal, jadwal, penilaian isian, ekspor), dan menu pengelolaan konten |
| **Super Admin** | Semua wewenang Admin, ditambah **Kelola Admin**: menambah admin/super admin, menaikkan/menurunkan role, menonaktifkan, reset password, menandai peninjau klinis |

- Peneliti/pengelola konten.
- Masuk dengan email + password melalui tautan "Login Admin" di bawah footer.
- Admin baru menerima password sementara (tampil sekali) dan wajib menggantinya saat pertama masuk.
- Harus selalu ada minimal satu Super Admin aktif; Super Admin tidak dapat menonaktifkan atau menurunkan role dirinya sendiri.

### 5.3 Peninjau Klinis (sub-peran admin)

- Dokter/tenaga kesehatan berwenang.
- Menyetujui konten klinis (oralit, zinc, ASI/makanan, tanda bahaya, takaran) sebelum terbit.

## 6. Cakupan Rilis

| Rilis | Isi |
|---|---|
| **MVP (uji coba penelitian)** | Auth, profil anak, beranda, 4 materi edukasi, halaman tanda bahaya publik, checklist harian, pelacak diare, FAQ, pretest/posttest, admin (konten, evaluasi, pengguna, laporan dasar) |
| **v1.1** | Kalkulator & panduan takaran (setelah konten takaran disetujui), pengingat SIGAP dengan web push |
| **Nanti** | Notifikasi WhatsApp/SMS, ekspor PDF catatan pelacak untuk dibawa ke puskesmas, mode offline |

> Kalkulator ditempatkan di v1.1 karena bergantung pada konten takaran yang harus disetujui tenaga kesehatan terlebih dahulu. Jika konten sudah siap, fitur dapat dipindah ke MVP.

---

## 7. Kebutuhan Fungsional

Prioritas: **P0** = wajib MVP, **P1** = penting, **P2** = dapat ditunda.

### 7.1 Autentikasi dan Akun (AUTH)

Ada dua jenis login:

| Peran | Pendaftaran | Masuk |
|---|---|---|
| Responden (ibu/pengasuh) | Mendaftar sendiri dengan nama + nomor HP; kode akses langsung tampil di layar setelah daftar | **Kode akses** yang didapat saat mendaftar |
| Administrator | Dibuat oleh admin lain atau seed awal (tidak ada daftar publik) | Email + password di `/admin/masuk` |

Alur responden:

- **Pertama kali:** Buka website → Daftar (nama, nomor HP, setujui privasi) → **kode akses tampil di layar** → simpan/salin kode → isi profil anak → Beranda.
- **Berikutnya:** Buka website → Masuk → ketik kode akses → Beranda.

Admin tidak membuatkan akun responden; semua responden mendaftar sendiri.

| ID | Kebutuhan | Prioritas |
|---|---|---|
| AUTH-01 | Halaman awal publik menampilkan logo, deskripsi, tombol Masuk, Daftar, dan akses ke Tanda Bahaya tanpa login | P0 |
| AUTH-02 | Registrasi responden **hanya** nama lengkap dan nomor HP (satu nomor untuk satu akun), plus persetujuan kebijakan privasi (checkbox wajib). Tanpa email | P0 |
| AUTH-03 | Setelah registrasi, sistem membuat kode akses unik dan menampilkannya di layar (tombol Salin, anjuran screenshot/mencatat kode) | P0 |
| AUTH-04 | Responden masuk dengan memasukkan kode akses | P0 |
| AUTH-05 | Lupa kode akses: halaman Lupa Kode berisi tombol **Hubungi Admin via WhatsApp**. Admin mencari responden berdasarkan nomor HP, memastikan identitas (misalnya pesan datang dari nomor terdaftar), lalu memberikan kode atau membuat kode baru | P0 |
| AUTH-06 | Responden dapat melihat kode aksesnya di halaman Profil | P0 |
| AUTH-07 | Admin masuk dengan email + password melalui tautan **Login Admin** di bawah footer (`/admin/masuk`) | P0 |
| AUTH-08 | Pemulihan password admin melalui email | P1 |
| AUTH-09 | Logout | P0 |
| AUTH-10 | Pengguna dapat menghapus akun beserta seluruh data anak dan pemantauan | P0 |
| AUTH-11 | Pengaturan akun responden: ubah nama dan nomor HP | P1 |

Ketentuan kode akses:

- **8 angka acak** (tanpa huruf), ditampilkan dalam dua kelompok, contoh `1234-5678`. Input memakai keyboard angka di HP dan mengabaikan spasi/tanda hubung.
- Acak, bukan nomor urut. Karena hanya angka (10⁸ kombinasi), keamanan dari tebakan beruntun bergantung pada pembatasan percobaan login.
- Satu kode untuk satu akun. Admin dapat membuat ulang kode; kode lama langsung tidak berlaku dan semua sesi responden tersebut berakhir.
- Percobaan login dibatasi (rate limit) untuk mencegah tebakan beruntun.
- Kode akses berbeda dari **kode responden** (`R-0001`) yang dipakai pada data dan ekspor penelitian, agar file ekspor tidak berisi kredensial login.

Validasi: nomor HP wajib, berformat Indonesia (`08…` / `+628…`), dinormalisasi ke `+628…`, dan unik. Jika nomor sudah terdaftar: "Nomor HP ini sudah terdaftar. Silakan masuk dengan kode akses, atau hubungi admin bila lupa kode." Password admin minimal 12 karakter.

### 7.2 Profil Anak (CHILD)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| CHILD-01 | Setelah registrasi pertama, pengguna diarahkan ke formulir profil anak | P0 |
| CHILD-02 | Field: nama panggilan, tanggal lahir, jenis kelamin, berat badan (opsional) | P0 |
| CHILD-03 | Satu akun dapat memiliki lebih dari satu anak; ada pemilih anak aktif | P0 |
| CHILD-04 | Ubah dan hapus profil anak | P0 |
| CHILD-05 | Avatar anak (pilihan ilustrasi bawaan; unggah foto opsional) | P2 |

Usia dihitung dari tanggal lahir dan ditampilkan dalam tahun + bulan.

### 7.3 Beranda / Dashboard (HOME)

| ID | Kebutuhan | Prioritas |
|---|---|---|
Tata letak mengikuti mockup beranda (lihat DESIGN.md §7.2).

| ID | Kebutuhan | Prioritas |
|---|---|---|
| HOME-01 | Header: logo; menu Beranda, Edukasi Diare, Fitur & Pemantauan, Evaluasi Pengetahuan, FAQ; tombol merah **Tanda Bahaya**; ikon lonceng pengingat; avatar + nama pengguna | P0 |
| HOME-02 | Bar profil anak aktif: avatar, nama, chip "Anak Aktif", usia, berat badan (bila diisi), hari ke-n pemantauan (bila ada episode aktif), tombol **Ganti Anak** | P0 |
| HOME-03 | Hero: "Selamat Datang Kembali, Bunda {nama}!", deskripsi singkat dengan nama anak, ringkasan catatan terakhir (waktu, frekuensi BAB, konsistensi), tombol **Catat Kondisi Hari Ini** dan **Panduan Cepat LINTAS DIARE**, ilustrasi ibu menggendong anak. Jika catatan terakhir memicu tanda bahaya, ringkasan diganti `DangerAlert` | P0 |
| HOME-04 | Section **Progres Penanganan Hari Ini** (hanya saat ada episode diare aktif): kartu Cairan & Oralit, Zinc, Pemberian Oralit; tautan Lihat Grafik Lengkap. Tanpa episode aktif: kartu ajakan "Mulai Pemantauan Diare" | P1 |
| HOME-05 | **Akses Cepat Fitur Utama**: 10 kartu (Mengenal Diare, Pencegahan Diare, 5 LINTAS DIARE, Tanda Bahaya, Panduan Takaran, Checklist Harian, Pelacak Diare, Pengingat SIGAP, Tanya Jawab (FAQ), Evaluasi Ibu); kartu Tanda Bahaya berlatar merah muda | P0 |
| HOME-06 | **Ceklis Rutin Hari Ini**: item checklist hari ini, penanda "x/y Selesai", tombol Simpan | P0 |
| HOME-07 | Kartu **Kapan Harus ke Dokter / Puskesmas?** (merah muda): daftar tanda bahaya singkat + tombol **Cek Pedoman Bahaya Lengkap** | P0 |
| HOME-08 | Kartu artikel pilihan (contoh: "MPASI Higienis & Nutrisi Lanjutan") dengan tautan Baca Selengkapnya | P2 |
| HOME-09 | Banner **Uji Pemahaman Bunda Sekarang** dengan tombol ke pretest/posttest yang sedang dibuka; disembunyikan bila tidak ada evaluasi yang aktif | P0 |
| HOME-10 | Footer dan tautan Login Admin (lihat 7.14) | P0 |

Penyesuaian terhadap mockup demi keselamatan (wajib, lihat §8):

- Label otomatis "Hidrasi Aman" dan "Kondisi Membaik" **tidak dipakai**; kartu menampilkan data yang dicatat apa adanya.
- Angka takaran pada mockup (ml oralit per BAB cair, mg zinc, sachet per ml air) tidak ditulis di kode; teksnya diambil dari `GuidanceRule` yang disetujui atau dari rencana perawatan yang diisi ibu sesuai instruksi tenaga kesehatan (TRACK-09).
- "Kalkulator Dosis" diberi nama **Panduan Takaran**.

### 7.4 Edukasi (EDU)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| EDU-01 | Halaman daftar materi: judul "Edukasi Kesehatan Anak", deskripsi, 4 kartu materi dengan ilustrasi dan tombol Pelajari Materi | P0 |
| EDU-02 | Setiap materi terdiri atas submateri berurutan dengan navigasi Sebelumnya/Selanjutnya | P0 |
| EDU-03 | Setiap materi diakhiri rangkuman dan tautan materi berikutnya | P0 |
| EDU-04 | Progres baca per submateri disimpan per pengguna | P1 |
| EDU-05 | Materi dapat diulang kapan saja | P0 |
| EDU-06 | Tautan ke Tanda Bahaya selalu terlihat di setiap halaman materi | P0 |

Isi materi:

1. **Mengenal Diare**: pengertian, penyebab, cara penularan, tanda dan gejala, dampak, risiko dehidrasi. Ilustrasi: perbandingan BAB normal vs diare, sistem pencernaan, penyebab.
2. **Pencegahan Diare**: cuci tangan pakai sabun, kebersihan makanan, air bersih, kebersihan lingkungan, kebersihan peralatan makan, ASI eksklusif dan makanan sesuai usia, vaksinasi rotavirus. Ilustrasi: langkah cuci tangan, menyiapkan makanan bersih, air bersih.
3. **Penanganan Diare (LINTAS DIARE)**: oralit, zinc, lanjutkan ASI dan makanan, antibiotik rasional sesuai indikasi, nasihat kepada ibu. Tiap bagian memuat: fungsi, ilustrasi, cara penerapan, hal yang perlu diperhatikan, kapan berkonsultasi. **Tidak memuat dosis sebagai keputusan otomatis.**
4. **Tanda Bahaya Diare**: sangat lemas/lesu, tidak mampu minum/menyusu, mata cekung, mulut kering, muntah terus-menerus, darah dalam tinja, kondisi memburuk.

Teks pembuka tiap materi ada di Lampiran A.

### 7.5 Tanda Bahaya (DANGER)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| DANGER-01 | Halaman `/tanda-bahaya` dapat diakses tanpa login | P0 |
| DANGER-02 | Tombol/tautan Tanda Bahaya tersedia di header/nav semua halaman (maks. 1 klik) | P0 |
| DANGER-03 | Setiap tanda ditampilkan dengan ikon, teks, dan warna (bukan warna saja) | P0 |
| DANGER-04 | Pesan rujukan jelas: segera bawa anak ke fasilitas kesehatan terdekat | P0 |
| DANGER-05 | Komponen `DangerAlert` yang sama dipakai oleh Pelacak, Kalkulator, dan halaman publik | P0 |

### 7.6 Kalkulator dan Panduan Takaran (CALC)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| CALC-01 | Formulir: usia anak (otomatis dari profil, dapat diubah), berat badan (opsional), kondisi anak, pertanyaan skrining tanda bahaya | P1 |
| CALC-02 | Skrining tanda bahaya dijalankan **sebelum** hasil. Jika ada tanda bahaya: tampilkan `DangerAlert`, jangan tampilkan hasil takaran | P1 |
| CALC-03 | Hasil menampilkan informasi oralit dan zinc sesuai kelompok usia dari konten `GuidanceRule` yang telah disetujui | P1 |
| CALC-04 | Hasil memuat cara pemberian yang aman, catatan penting, dan kapan perlu pemeriksaan | P1 |
| CALC-05 | Disclaimer permanen: "Bukan alat diagnosis atau pengganti pemeriksaan tenaga kesehatan" | P1 |
| CALC-06 | Jika belum ada konten yang disetujui untuk kelompok usia tertentu, tampilkan pesan untuk berkonsultasi, bukan nilai default | P1 |

### 7.7 Checklist Harian (CHECK)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| CHECK-01 | Judul "Checklist Pencegahan Harian", deskripsi ajakan | P0 |
| CHECK-02 | Item default: cuci tangan sebelum menyiapkan makanan, sebelum makan, setelah BAB/ganti popok; kebersihan makanan; air bersih; bersihkan peralatan makan; kebersihan lingkungan | P0 |
| CHECK-03 | Simpan checklist per pengguna per tanggal; reset otomatis setiap hari (zona waktu Asia/Jakarta, dapat diatur) | P0 |
| CHECK-04 | Setelah simpan, tampilkan ringkasan (x dari 7 kebiasaan) dengan nada positif | P0 |
| CHECK-05 | Riwayat checklist (tampilan kalender/minggu) | P0 |
| CHECK-06 | Item checklist dikelola admin | P1 |
| CHECK-07 | Saat ada episode diare aktif, checklist menampilkan item perawatan tambahan (memberi zinc, menyiapkan oralit baru, memperbanyak menyusui). Teks item berasal dari konten klinis yang disetujui, tanpa angka dosis yang ditulis di kode | P1 |

### 7.8 Pelacak Diare (TRACK)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| TRACK-01 | Catatan per anak: tanggal & waktu, frekuensi BAB, konsistensi tinja, darah pada tinja (ya/tidak), frekuensi muntah, kemampuan minum/menyusu, kondisi umum, catatan tambahan | P0 |
| TRACK-02 | Formulir ringkas: field wajib hanya tanggal, frekuensi BAB, konsistensi | P0 |
| TRACK-03 | Simpan → masuk riwayat; riwayat diurutkan per tanggal dengan ringkasan frekuensi BAB (grafik sederhana) | P0 |
| TRACK-04 | Detail, ubah, dan hapus catatan | P0 |
| TRACK-05 | Jika catatan mengandung indikator tanda bahaya (darah pada tinja, tidak mampu minum/menyusu, sangat lemas, muntah terus-menerus, kondisi memburuk), tampilkan `DangerAlert` segera setelah simpan | P0 |
| TRACK-06 | Tidak ada label diagnosis atau derajat dehidrasi pada riwayat | P0 |
| TRACK-07 | Ekspor ringkasan catatan untuk ditunjukkan ke tenaga kesehatan | P2 |
| TRACK-08 | Episode diare: dimulai manual oleh pengguna ("Mulai Pemantauan") dan diakhiri manual ("Si kecil sudah pulih"); catatan saat episode aktif terhubung ke episode tersebut | P1 |
| TRACK-09 | Rencana perawatan per episode, diisi pengguna sesuai instruksi tenaga kesehatan: lama pemberian zinc (hari), target cairan harian (opsional), catatan instruksi | P1 |
| TRACK-10 | Catat pemberian: oralit/cairan (ml, waktu) dan zinc (sudah diberikan hari ini). Dipakai untuk kartu Progres Penanganan di beranda | P1 |

### 7.9 Pengingat SIGAP (REMIND)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| REMIND-01 | Field: nama pengingat, tanggal, jam, pengulangan (sekali/harian), keterangan, status aktif/selesai | P1 |
| REMIND-02 | Template contoh: kebersihan tangan, menyiapkan oralit sesuai instruksi, jadwal kontrol | P1 |
| REMIND-03 | Notifikasi in-app (daftar pengingat jatuh tempo di beranda) | P1 |
| REMIND-04 | Notifikasi web push jika pengguna mengizinkan | P1 |
| REMIND-05 | Pengingat obat/suplemen hanya berupa teks instruksi yang diketik pengguna; sistem tidak menyarankan dosis | P1 |

### 7.10 Evaluasi Pengetahuan (EVAL)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| EVAL-01 | Dua tahap: Pretest dan Posttest, dengan teks pembuka sesuai Lampiran A | P0 |
| EVAL-02 | Setiap responden memiliki **kode responden** (`R-0001`) yang dibuat saat registrasi; jawaban disimpan dengan kode ini, terpisah dari identitas dan kode akses | P0 |
| EVAL-03 | Navigasi Sebelumnya/Selanjutnya, indikator progres, jawaban tersimpan otomatis | P0 |
| EVAL-04 | Konfirmasi sebelum kirim; setelah dikirim jawaban tidak dapat diubah | P0 |
| EVAL-05 | Jadwal: admin mengatur jendela waktu pretest dan posttest; posttest terkunci sampai pretest selesai dan jendela posttest dibuka | P0 |
| EVAL-06 | Kunci jawaban tidak dikirim ke client; skor/pembahasan hanya tampil setelah jendela pengukuran ditutup (jika diaktifkan) | P0 |
| EVAL-07 | Riwayat hasil evaluasi milik pengguna | P1 |
| EVAL-08 | Instrumen pretest dan posttest mengikuti desain penelitian dan tidak diganti dengan kuis latihan | P0 |
| EVAL-09 | Instrumen mendukung tiga tipe soal: **Skala**, **Pilihan**, dan **Isian** (lihat tabel di bawah); satu instrumen boleh mencampur ketiganya | P0 |
| EVAL-10 | Soal dapat dikelompokkan per bagian/dimensi (misal "Pengetahuan", "Sikap", "Perilaku") untuk subskor | P0 |
| EVAL-11 | Soal dapat ditandai wajib/opsional; "Selesai" hanya aktif bila semua soal wajib terjawab | P0 |
| EVAL-12 | Halaman tinjauan sebelum kirim: daftar soal dengan status terjawab/belum, dapat lompat ke soal tertentu | P0 |

Tipe soal:

| Tipe | Tampilan untuk responden | Pengaturan admin | Penilaian |
|---|---|---|---|
| **Skala** (Likert) | Pernyataan + pilihan bertingkat, misal 1–5 "Sangat Tidak Setuju" s.d. "Sangat Setuju" | Rentang (min–maks, default 1–5), label tiap titik, **skor terbalik** untuk pernyataan negatif | Otomatis: nilai yang dipilih (dibalik bila skor terbalik) |
| **Pilihan** (pilihan ganda / benar-salah) | Pertanyaan + 2–6 pilihan, pilih satu | Teks pilihan, kunci jawaban, bobot poin (default 1) | Otomatis: benar = bobot, salah = 0 |
| **Isian** | Pertanyaan + kotak teks (singkat atau panjang, maks. 500 karakter) | Jenis isian (singkat/panjang), contoh jawaban benar untuk penilai, bobot poin; atau tandai "tidak dinilai" untuk pertanyaan terbuka | **Manual** oleh admin (0 s.d. bobot); status "Menunggu penilaian" sampai dinilai |

Skor total dan subskor per bagian dihitung server. Kunci pilihan dan contoh jawaban isian tidak pernah dikirim ke browser responden.

### 7.11 FAQ (FAQ)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FAQ-01 | Accordion pertanyaan, dikelompokkan: Seputar Diare, Pencegahan, Penanganan, Penggunaan Website | P0 |
| FAQ-02 | 10 pertanyaan awal (Lampiran B) | P0 |
| FAQ-03 | Kontak bantuan pengelola | P0 |
| FAQ-04 | Pencarian FAQ | P2 |

### 7.12 Profil Pengguna (PROFILE)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| PROFILE-01 | Info ibu/pengasuh, **kode akses** (tersembunyi, tombol Tampilkan dan Salin), daftar profil anak, riwayat aktivitas (materi dibaca, checklist, catatan pelacak, evaluasi) | P0 |
| PROFILE-02 | Pengaturan akun, kebijakan privasi, hapus akun, keluar | P0 |

### 7.13 Administrator (ADMIN)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| ADMIN-01 | Area admin terpisah (`/admin`) dengan role `ADMIN`; login email + password di `/admin/masuk` | P0 |
| ADMIN-02 | Dashboard: jumlah akun, profil anak, akses edukasi, pengguna aktif (7/30 hari), penyelesaian pretest/posttest | P0 |
| ADMIN-03 | Kelola Edukasi: tambah/ubah materi & submateri, unggah ilustrasi, atur urutan, draft, publikasi | P0 |
| ADMIN-04 | Kelola Panduan: oralit, zinc, ASI & makanan, tanda bahaya, aturan takaran, sumber referensi | P0 |
| ADMIN-05 | Konten klinis wajib melewati persetujuan peninjau klinis sebelum terbit; tercatat siapa dan kapan menyetujui | P0 |
| ADMIN-06 | Kelola Checklist: item, urutan, aktif/nonaktif | P1 |
| ADMIN-07 | Kelola FAQ: kategori, pertanyaan, jawaban, urutan | P0 |
| ADMIN-08 | Kelola Evaluasi: susun instrumen pretest/posttest dengan soal tipe Skala, Pilihan, dan Isian; atur bagian, urutan, wajib/opsional, kunci, bobot, skor terbalik; pratinjau sebagai responden; **salin pretest menjadi posttest**; atur jadwal buka/tutup. Soal terkunci (tidak bisa diubah) setelah ada jawaban masuk | P0 |
| ADMIN-08a | Penilaian Isian: daftar jawaban isian per soal, hanya ditampilkan dengan kode responden; admin memberi nilai 0 s.d. bobot dan catatan opsional; progres "x dari y sudah dinilai" | P0 |
| ADMIN-08b | Ekspor hasil evaluasi CSV format lebar (satu baris per responden per fase): kode responden, fase, waktu, jawaban tiap soal, skor tiap soal, subskor per bagian, skor total. Siap diolah di SPSS/Excel | P0 |
| ADMIN-09 | **Manajemen Responden**: tabel seluruh responden berisi nama, nomor HP, **kode akses**, kode responden, tanggal daftar, jumlah anak, status pretest/posttest, aktivitas terakhir, status akun; pencarian (nama/nomor HP/kode) dan filter; salin kode akses; buat ulang kode akses; aktifkan/nonaktifkan akun; ekspor daftar responden. Membuka daftar, menyalin, dan membuat ulang kode dicatat di audit log | P0 |
| ADMIN-10 | Laporan: statistik penggunaan, aktivitas, ringkasan evaluasi per kode responden (tanpa identitas dan tanpa kode akses); ekspor CSV | P0 |
| ADMIN-11 | Pengaturan Website: kontak bantuan (termasuk nomor WhatsApp admin untuk halaman Lupa Kode), teks kebijakan privasi, zona waktu | P0 |
| ADMIN-12 | Audit log untuk aksi admin (ubah konten, publikasi, ubah status akun, lihat/buat ulang kode akses, ekspor data) | P0 |
| ADMIN-13 | **Kelola Admin (khusus Super Admin)**: tambah admin dengan role Admin/Super Admin (password sementara tampil sekali, wajib diganti saat masuk pertama), naik/turunkan role, tandai peninjau klinis, reset password, nonaktifkan/aktifkan. Semua aksi dicatat di audit log | P0 |
| ADMIN-14 | **Akun Saya**: setiap admin dapat mengganti password sendiri; semua sesi lain dikeluarkan | P0 |
### 7.14 Footer dan Login Admin (FOOT)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FOOT-01 | Footer 4 kolom: identitas SIGAP DIARE + deskripsi; Edukasi & Penanganan (tautan materi); Fitur Pendamping (tautan fitur); Layanan Darurat (kartu hotline 119 dan anjuran ke fasilitas kesehatan terdekat) | P0 |
| FOOT-02 | Bar bawah: hak cipta, Bantuan, Kebijakan Privasi | P0 |
| FOOT-03 | Tepat di bawah footer: tautan kecil **Login Admin** menuju `/admin/masuk` | P0 |
| FOOT-04 | Footer tampil di halaman responden dan halaman publik (landing, masuk, daftar, tanda bahaya); tidak tampil di area admin | P0 |

---

## 8. Kebutuhan Keselamatan Medis

Sistem **tidak boleh**:

- Menentukan diagnosis diare secara otomatis.
- Menentukan derajat dehidrasi sebagai diagnosis mandiri.
- Mengganti resep dokter.
- Memberikan rekomendasi antibiotik otomatis.
- Menunda rujukan karena pengguna harus mengisi formulir.
- Menganggap catatan pemantauan sebagai pengganti pemeriksaan klinis.

Sistem **harus**:

- Menampilkan pesan keselamatan dan anjuran pemeriksaan segera bila input mengarah ke tanda bahaya.
- Menampilkan disclaimer pada Kalkulator, Pelacak, dan materi Penanganan.
- Menampilkan konten oralit, zinc, dan penanganan hanya setelah ditinjau tenaga kesehatan berwenang.
- Mencantumkan sumber referensi pada materi klinis.

## 9. Kebutuhan Privasi dan Keamanan

| Kelompok data | Isi |
|---|---|
| Data akun responden | Nama, nomor HP, kode akses (HMAC + terenkripsi), kode responden, ID akun |
| Data akun admin | Nama, email, hash password, peran |
| Data anak & pemantauan | Nama panggilan, tanggal lahir, jenis kelamin, berat badan (opsional), catatan pelacak, checklist, riwayat penggunaan |
| Data evaluasi | Kode responden, jawaban, skor, waktu pengerjaan |

Ketentuan:

- Persetujuan eksplisit sebelum pengumpulan data (saat registrasi), dengan versi kebijakan privasi tercatat.- Minimisasi data: tidak meminta data yang tidak diperlukan.
- HTTPS di semua lingkungan publik.
- Password admin di-hash (scrypt). Kode akses responden disimpan sebagai HMAC (untuk pencocokan login) dan terenkripsi AES-256-GCM (agar dapat ditampilkan kepada pemilik dan admin); keduanya tidak pernah di-log.
- Kode akses hanya terlihat oleh pemilik akun dan admin; akses admin ke daftar kode dicatat di audit log.
- Akses data anak dibatasi pada pemiliknya; admin melihat data agregat kecuali kewenangan khusus.
- Data evaluasi dipisahkan dari identitas; laporan penelitian memakai kode responden (bukan kode akses).
- Masa simpan data ditetapkan (lihat Pertanyaan Terbuka) dan data dihapus/dianonimkan setelahnya.
- Hapus akun menghapus data akun dan data anak; data evaluasi yang sudah dianonimkan dapat dipertahankan sesuai persetujuan penelitian.
- Mengacu pada UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (data kesehatan termasuk data pribadi yang bersifat spesifik).

## 10. Kebutuhan Non-Fungsional

| Area | Kebutuhan |
|---|---|
| Responsif | Berfungsi baik pada lebar 360 px hingga desktop 1440 px |
| Performa | LCP < 2,5 detik di 4G; halaman tanda bahaya ringan dan dapat di-cache |
| Aksesibilitas | WCAG 2.1 AA: kontras, label form, fokus keyboard, target sentuh ≥ 44 px |
| Keterbacaan | Teks isi 17–19 px, kalimat pendek, istilah medis dijelaskan |
| Ketersediaan | Uptime ≥ 99% selama periode penelitian |
| Browser | Chrome Android, Safari iOS, Chrome/Edge/Firefox desktop (2 versi terakhir) |
| Bahasa | Seluruh UI Bahasa Indonesia |

## 11. Prinsip UX

- Navigasi sederhana, maksimal 3 klik ke fitur mana pun.
- Formulir pendek; field opsional jelas ditandai.
- Setiap fitur memiliki petunjuk singkat di bagian atas.
- Tanda bahaya memakai ikon + teks, bukan warna saja.
- Tombol kembali selalu tersedia.

## 12. Acceptance Criteria (siap uji coba)

1. Responden dapat mendaftar dengan nama dan nomor HP, melihat kode akses di layar, masuk dengan kode akses, dan logout; responden yang lupa kode dapat dibantu admin lewat WhatsApp.
2. Pengguna dapat membuat, mengubah, dan menghapus profil anak (lebih dari satu).
3. Semua menu utama (Beranda, Edukasi, Fitur, FAQ, Profil) dapat diakses.
4. Keempat materi edukasi dapat dibaca dengan baik di HP dan laptop.
5. Ilustrasi tampil dengan benar dan memiliki teks alternatif.
6. Checklist menyimpan pilihan per hari dan riwayatnya dapat dilihat.
7. Pelacak menyimpan catatan, menampilkan riwayat, dan memunculkan peringatan tanda bahaya.
8. Pengingat berfungsi sesuai pengaturan (in-app; push bila diizinkan).
9. FAQ menampilkan jawaban melalui accordion.
10. Evaluasi menyimpan jawaban dengan kode responden dan menjaga kerahasiaan kunci jawaban.
11. Halaman tanda bahaya dapat dibuka tanpa login dan dicapai ≤ 1 klik dari setiap halaman.
12. Lulus uji responsif pada 360 px, 768 px, 1280 px.
13. Admin dapat masuk dengan email + password lewat tautan Login Admin di bawah footer, mengelola konten dan evaluasi, serta melihat seluruh responden beserta kode aksesnya.
14. Data pengguna terlindungi (uji akses lintas akun gagal, password ter-hash, HTTPS).
15. Seluruh materi klinis memiliki catatan persetujuan tenaga kesehatan.

## 13. Metrik

- Jumlah registrasi dan profil anak.
- Pengguna aktif mingguan.
- Tingkat penyelesaian materi per topik.
- Frekuensi pengisian checklist.
- Jumlah catatan pelacak dan jumlah peringatan tanda bahaya yang tampil.
- Tingkat penyelesaian pretest dan posttest; selisih skor.

## 14. Pertanyaan Terbuka

| # | Pertanyaan | Pemilik |
|---|---|---|
| Q1 | ~~Apakah peneliti juga dapat membuat akun responden dari panel admin?~~ **Terjawab: tidak.** Responden selalu mendaftar sendiri dan mendapat kode akses di layar. | Peneliti |
| Q2 | Siapa peninjau klinis yang menyetujui konten oralit, zinc, dan takaran? Pedoman acuan mana (Kemenkes LINTAS DIARE, MTBS, WHO)? | Peneliti |
| Q3 | Instrumen pretest/posttest: ~~format jawaban~~ (**terjawab**: Skala, Pilihan, Isian, EVAL-09). Masih perlu: isi dan jumlah soal per bagian, dan apakah skor ditampilkan ke responden setelah evaluasi ditutup? | Peneliti |
| Q4 | Format kode responden: otomatis berurutan (`R-0001`) atau mengikuti penomoran peneliti? | Peneliti |
| Q5 | Masa simpan data setelah penelitian selesai? | Peneliti / komite etik |
| Q6 | Apakah ada persetujuan etik (ethical clearance) yang menentukan bentuk informed consent di website? | Peneliti |
| Q7 | Domain dan hosting (anggaran, lokasi server di Indonesia?) | Tim proyek |
| Q8 | Siapa yang menyediakan ilustrasi (ilustrator, aset bebas lisensi)? | Tim desain |
| Q9 | ~~Perlukah pemulihan kode otomatis lewat OTP WhatsApp/SMS?~~ **Terjawab: tidak.** Pemulihan kode hanya lewat admin. | Tim proyek |

---

## Lampiran A. Teks Kunci

- **Hero beranda (sudah login):** "Selamat pagi/siang/sore/malam, {nama depan}!" (sesuai jam WIB) / "Semoga {nama anak} sehat dan ceria hari ini. Yuk, cek kebiasaan sehat di rumah dan catat kondisi si kecil bila ada keluhan."
- **Hero landing (belum login):** "Selamat Datang di SIGAP DIARE!" / "Sahabat Ayah Bunda untuk Cegah dan Tangani Diare pada Si Kecil." / "Pelajari informasi penting seputar diare pada anak, mulai dari mengenali gejala, mencegah penularan, hingga memahami langkah penanganan awal yang tepat."
- **Banner tanda bahaya:** "Kenali Tanda Bahaya Diare!" / "Jika anak tampak sangat lemas, tidak mampu minum atau menyusu, atau menunjukkan tanda dehidrasi berat, segera cari pertolongan medis."
- **Mengenal Diare:** "Apa Itu Diare?" / "Diare merupakan kondisi ketika anak mengalami buang air besar dengan konsistensi tinja lebih cair atau lembek dan frekuensinya lebih sering dari biasanya. Diare dapat disebabkan oleh infeksi virus, bakteri, atau parasit."
- **Pencegahan:** "Cegah Diare Dimulai dari Rumah!" / "Menjaga kebersihan tangan, makanan, air, dan lingkungan merupakan langkah penting untuk membantu mencegah diare pada anak."
- **Penanganan:** "Bagaimana Menangani Diare pada Anak?" / "Ketika anak mengalami diare, hal penting yang perlu diperhatikan adalah mencegah kehilangan cairan tubuh. Ibu perlu mengetahui cara pemberian oralit, pentingnya zinc sesuai anjuran tenaga kesehatan, dan tetap melanjutkan pemberian ASI serta makanan sesuai usia anak."
- **Tanda Bahaya:** "Kenali Tanda Bahaya Diare!" / "Sebagian kondisi diare dapat menyebabkan kehilangan cairan tubuh. Ibu perlu mengetahui tanda bahaya agar dapat segera membawa anak ke fasilitas kesehatan."
- **Kalkulator:** "Masukkan informasi anak untuk melihat panduan edukasi yang relevan."
- **Checklist:** "Yuk, pastikan kebiasaan sehat berikut dilakukan setiap hari!"
- **Pelacak:** "Catat kondisi si kecil untuk membantu Anda memantau perubahan dari waktu ke waktu."
- **Pretest:** "Sebelum mulai mempelajari materi, silakan jawab beberapa pertanyaan berikut untuk mengetahui pengetahuan awal Anda mengenai diare pada anak."
- **Posttest:** "Selamat! Anda telah mempelajari materi SIGAP DIARE. Silakan jawab kembali pertanyaan berikut sesuai pengetahuan Anda setelah mengikuti edukasi."

## Lampiran B. FAQ Awal

1. Apa yang dimaksud dengan diare?
2. Apa penyebab diare pada anak?
3. Bagaimana cara mencegah diare?
4. Apa fungsi oralit?
5. Mengapa zinc diberikan pada anak diare?
6. Apakah ASI tetap diberikan saat anak diare?
7. Bagaimana mengenali tanda dehidrasi?
8. Kapan anak harus dibawa ke fasilitas kesehatan?
9. Bagaimana cara menggunakan website?
10. Bagaimana menghubungi pengelola?
