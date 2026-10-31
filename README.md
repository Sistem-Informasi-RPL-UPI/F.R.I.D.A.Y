# F.R.I.D.A.Y. — Sistem Informasi

**F.R.I.D.A.Y.** merupakan aplikasi berbasis web yang dikembangkan untuk mendukung proses layanan administrasi mahasiswa melalui sistem digital yang terintegrasi dengan aplikasi utama.

Pengembangan F.R.I.D.A.Y. berfokus pada layanan pengajuan surat, peminjaman barang, dan peminjaman ruangan. Aplikasi ini juga dipersiapkan untuk mendukung integrasi Single Sign-On (SSO) dengan sistem pusat agar pengguna dapat mengakses beberapa aplikasi dalam satu ekosistem menggunakan mekanisme autentikasi terintegrasi.

---

## 📌 Daftar Isi

1. [Tentang Proyek](#-tentang-proyek)
2. [Tujuan Pengembangan](#-tujuan-pengembangan)
3. [Ruang Lingkup dan Fitur](#-ruang-lingkup-dan-fitur)
4. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
5. [Arsitektur dan Integrasi Sistem](#-arsitektur-dan-integrasi-sistem)
6. [Struktur Repository](#-struktur-repository)
7. [Persyaratan Sistem](#-persyaratan-sistem)
8. [Panduan Instalasi](#-panduan-instalasi)
9. [Konfigurasi Database](#-konfigurasi-database)
10. [Menjalankan Aplikasi](#-menjalankan-aplikasi)
11. [Struktur Branch Git](#-struktur-branch-git)
12. [Alur Kerja Pengembangan](#-alur-kerja-pengembangan)
13. [Konvensi Commit](#-konvensi-commit)
14. [Panduan Kontribusi](#-panduan-kontribusi)
15. [Status Pengembangan](#-status-pengembangan)

---

## 📖 Tentang Proyek

F.R.I.D.A.Y. dikembangkan sebagai salah satu aplikasi dalam ekosistem Sistem Informasi yang mengintegrasikan beberapa aplikasi hasil pengembangan kelompok.

Aplikasi ini berperan dalam menyediakan layanan administrasi dan fasilitas bagi mahasiswa melalui platform digital. Dengan adanya sistem ini, proses pengajuan surat serta peminjaman barang dan ruangan diharapkan dapat dilakukan secara lebih terstruktur, terdokumentasi, dan mudah dikelola.

F.R.I.D.A.Y. tidak berdiri sebagai aplikasi yang terpisah dari ekosistem utama, melainkan dipersiapkan untuk terhubung dengan aplikasi pusat melalui mekanisme Single Sign-On (SSO).

## 🎯 Tujuan Pengembangan

Pengembangan F.R.I.D.A.Y. memiliki beberapa tujuan utama:

- Mendigitalisasi proses layanan pengajuan surat bagi mahasiswa.
- Mempermudah proses peminjaman barang dan ruangan.
- Menyediakan pengelolaan data pengajuan serta peminjaman secara terstruktur.
- Mendukung proses administrasi yang lebih efektif dan terdokumentasi.
- Mengintegrasikan autentikasi pengguna dengan sistem pusat melalui mekanisme SSO.
- Mendukung terbentuknya ekosistem aplikasi yang saling terintegrasi.

## 🚀 Ruang Lingkup dan Fitur

Pengembangan F.R.I.D.A.Y. mencakup tiga modul utama dan satu bagian integrasi sistem.

### 1. Modul Pengajuan Surat

Modul ini ditujukan untuk mendukung proses layanan administrasi berupa pengajuan surat oleh mahasiswa.

Ruang lingkup pengembangan meliputi:
- Pengajuan permohonan surat secara digital.
- Pengisian data dan kebutuhan pengajuan surat.
- Pengelolaan data permohonan surat.
- Pemantauan status pengajuan.
- Pengelolaan proses permohonan oleh pihak yang berwenang.

### 2. Modul Peminjaman Barang

Modul ini digunakan untuk mendukung proses peminjaman barang atau inventaris yang tersedia.

Ruang lingkup pengembangan meliputi:
- Penyajian informasi barang yang dapat dipinjam.
- Pengajuan peminjaman barang.
- Pengelolaan data peminjaman.
- Pemantauan status permohonan peminjaman.
- Pengelolaan informasi ketersediaan dan pengembalian barang.

### 3. Modul Peminjaman Ruangan

Modul ini digunakan untuk mendukung proses pengajuan peminjaman ruangan sesuai kebutuhan kegiatan mahasiswa.

Ruang lingkup pengembangan meliputi:
- Penyajian informasi ruangan yang tersedia.
- Pengajuan peminjaman ruangan.
- Pengelolaan jadwal peminjaman.
- Pemantauan status permohonan.
- Pengelolaan informasi ketersediaan ruangan.

### 4. Modul Integrasi SSO

Modul ini disiapkan untuk menghubungkan F.R.I.D.A.Y. dengan aplikasi pusat dalam ekosistem Sistem Informasi.

Ruang lingkup pengembangan meliputi:
- Integrasi mekanisme autentikasi dengan sistem pusat.
- Pengelolaan proses autentikasi pengguna melalui SSO.
- Penyesuaian akses pengguna berdasarkan informasi autentikasi dan otorisasi yang disepakati.
- Koordinasi pertukaran informasi autentikasi dengan aplikasi pusat.

**Catatan:** Detail protokol, mekanisme pertukaran token, serta konfigurasi integrasi SSO akan mengikuti kesepakatan teknis dengan tim pengembang aplikasi pusat.

---

## 🛠️ Teknologi yang Digunakan

Berikut merupakan teknologi utama yang digunakan dalam pengembangan F.R.I.D.A.Y.

| Teknologi | Kegunaan |
|---|---|
| PHP 8.5.6 | Bahasa pemrograman backend |
| Laravel 13 | Framework pengembangan aplikasi web |
| MySQL | Sistem manajemen basis data |
| HTML5 | Struktur halaman web |
| CSS3 | Pengaturan tampilan antarmuka |
| JavaScript | Interaktivitas halaman web |
| Vite | Asset bundling dan frontend development |
| npm | Pengelolaan dependency frontend |
| Composer | Pengelolaan dependency PHP |
| Git | Version control |
| GitHub | Kolaborasi dan pengelolaan repository |
| Visual Studio Code | Lingkungan pengembangan |

---

## 🏗️ Arsitektur dan Integrasi Sistem

F.R.I.D.A.Y. merupakan bagian dari ekosistem aplikasi yang dikembangkan oleh beberapa kelompok dalam proyek Sistem Informasi.

Secara umum, konsep integrasi sistem direncanakan sebagai berikut:

```text
                  SISTEM PUSAT
                       |
              Single Sign-On (SSO)
                       |
          +------------+------------+
          |                         |
     Autentikasi               Aplikasi Lain
          |
      F.R.I.D.A.Y.
          |
    +-----+-------------------+
    |             |           |
Pengajuan      Peminjaman   Peminjaman
 Surat           Barang      Ruangan
    |             |           |
    +-------------+-----------+
                  |
             Database
                MySQL
```

Diagram tersebut merupakan gambaran konseptual integrasi sistem. Implementasi komunikasi dan autentikasi antaraplikasi akan disesuaikan dengan rancangan teknis sistem pusat.

---

## 📁 Struktur Repository

Struktur direktori utama proyek F.R.I.D.A.Y. mengikuti standar struktur aplikasi Laravel.

```text
F.R.I.D.A.Y/
│
├── app/
│   ├── Http/
│   │   └── Controllers/
│   ├── Models/
│   └── Providers/
│
├── bootstrap/
│   └── app.php
│
├── config/
│
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
│
├── public/
│
├── resources/
│   ├── css/
│   ├── js/
│   └── views/
│
├── routes/
│   ├── console.php
│   └── web.php
│
├── storage/
│
├── tests/
│   ├── Feature/
│   └── Unit/
│
├── .env.example
├── .gitignore
├── artisan
├── composer.json
├── package.json
├── phpunit.xml
└── vite.config.js
```

**Keterangan direktori:**

| Direktori/File | Fungsi |
|---|---|
| `app/` | Menyimpan kode utama aplikasi, seperti controller, model, dan provider. |
| `bootstrap/` | Menyimpan konfigurasi awal dan proses bootstrap Laravel. |
| `config/` | Menyimpan konfigurasi aplikasi. |
| `database/` | Menyimpan migration, factory, dan seeder database. |
| `public/` | Direktori publik sebagai titik masuk aplikasi dan penyimpanan aset publik. |
| `resources/` | Menyimpan file frontend, seperti CSS, JavaScript, dan Blade views. |
| `routes/` | Mendefinisikan rute aplikasi. |
| `storage/` | Menyimpan file hasil proses aplikasi, cache, log, dan kebutuhan penyimpanan lainnya. |
| `tests/` | Menyimpan pengujian aplikasi. |
| `.env.example` | Template konfigurasi environment untuk setiap pengembang. |
| `composer.json` | Konfigurasi dependency PHP. |
| `package.json` | Konfigurasi dependency frontend. |

---

## 💻 Persyaratan Sistem

Sebelum menjalankan aplikasi, pastikan perangkat telah memiliki perangkat lunak berikut:

- PHP dengan versi yang kompatibel dengan Laravel 13.
- Composer.
- MySQL Server.
- Node.js dan npm.
- Git.
- Visual Studio Code atau editor kode lainnya.

Ekstensi PHP yang dibutuhkan harus mengikuti persyaratan pada `composer.json` proyek.

---

## ⚙️ Panduan Instalasi

Ikuti langkah-langkah berikut untuk menjalankan F.R.I.D.A.Y. di lingkungan lokal.

### 1. Clone Repository

Buka terminal atau PowerShell, kemudian jalankan:

```bash
git clone https://github.com/Sistem-Informasi-RPL-UPI/F.R.I.D.A.Y.git
```

Masuk ke direktori proyek:

```bash
cd F.R.I.D.A.Y
```

### 2. Install Dependency PHP

Jalankan perintah:

```bash
composer install
```

Perintah ini digunakan untuk mengunduh dan memasang seluruh dependency PHP yang dibutuhkan aplikasi.

### 3. Install Dependency Frontend

Jalankan:

```bash
npm install
```

### 4. Buat File Environment

Salin file `.env.example` menjadi `.env`.

Untuk Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

File `.env` digunakan untuk menyimpan konfigurasi lokal aplikasi, seperti koneksi database dan application key.

### 5. Generate Application Key

Jalankan:

```bash
php artisan key:generate
```

Perintah ini akan menghasilkan application key yang digunakan Laravel untuk kebutuhan enkripsi aplikasi.

### 6. Konfigurasi Database

Buat database baru melalui MySQL, kemudian sesuaikan konfigurasi pada file `.env`.

Contoh konfigurasi:

```env
APP_NAME="F.R.I.D.A.Y."
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=friday_db
DB_USERNAME=root
DB_PASSWORD=
```

Sesuaikan nama database, username, dan password dengan konfigurasi MySQL pada perangkat masing-masing.

### 7. Jalankan Migration

Setelah database berhasil dikonfigurasi, jalankan:

```bash
php artisan migrate
```

Perintah tersebut digunakan untuk membuat tabel berdasarkan file migration yang tersedia di proyek.

### 8. Build Frontend Assets

Jalankan:

```bash
npm run build
```

Proses ini digunakan untuk membangun aset frontend agar dapat digunakan oleh aplikasi.

---

## 🗄️ Konfigurasi Database

F.R.I.D.A.Y. menggunakan MySQL sebagai sistem manajemen basis data.

Setiap anggota kelompok perlu membuat database lokal masing-masing dengan nama yang sesuai dengan konfigurasi `.env`.

Contoh pembuatan database:

```sql
CREATE DATABASE friday_db;
```

Untuk menjalankan migration:

```bash
php artisan migrate
```

Untuk melihat status migration:

```bash
php artisan migrate:status
```

**Perhatian:** Jangan memasukkan file `.env` ke dalam repository. Setiap anggota harus menggunakan file `.env` lokal masing-masing.

---

## ▶️ Menjalankan Aplikasi

Setelah seluruh proses instalasi selesai, jalankan aplikasi menggunakan dua terminal.

**Terminal 1 — Menjalankan Laravel**

```bash
php artisan serve
```

Secara default aplikasi dapat diakses melalui:

```text
http://127.0.0.1:8000
```

**Terminal 2 — Menjalankan Vite**

```bash
npm run dev
```

Vite digunakan untuk menjalankan proses frontend development dan menyediakan aset yang dibutuhkan selama pengembangan.

Untuk kebutuhan build aset tanpa development server, gunakan:

```bash
npm run build
```

---

## 🌿 Struktur Branch Git

Repository F.R.I.D.A.Y. menggunakan strategi branching untuk memisahkan pengembangan fitur, integrasi, dan kode utama aplikasi.

Berikut branch yang digunakan:

| Branch | Fungsi |
|---|---|
| `main` | Menyimpan versi utama aplikasi yang telah melalui proses integrasi dan pengujian. |
| `develop` | Menjadi branch utama untuk menggabungkan seluruh pengembangan fitur. |
| `feature/pengajuan-surat` | Pengembangan modul pengajuan surat. |
| `feature/peminjaman-barang` | Pengembangan modul peminjaman barang. |
| `feature/peminjaman-ruangan` | Pengembangan modul peminjaman ruangan. |
| `feature/integrasi-sso` | Pengembangan integrasi Single Sign-On. |

**Alur penggabungan branch:**

```text
                    main
                      |
                   develop
                      |
      +---------------+---------------+
      |               |               |
 pengajuan-surat  peminjaman-      peminjaman-
                   barang            ruangan
                      |
                integrasi-sso
```

Setiap branch fitur dikembangkan secara terpisah, kemudian perubahan yang telah selesai akan diajukan melalui Pull Request menuju branch `develop`.

Setelah seluruh fitur berhasil diintegrasikan dan melalui pengujian, perubahan pada `develop` dapat diajukan menuju `main`.

---

## 🔄 Alur Kerja Pengembangan

Agar pengembangan berjalan terstruktur dan tidak menimbulkan konflik kode, setiap anggota wajib mengikuti alur kerja Git berikut.

### 1. Clone Repository

Setiap anggota melakukan clone repository ke perangkat masing-masing:

```bash
git clone https://github.com/Sistem-Informasi-RPL-UPI/F.R.I.D.A.Y.git
```

### 2. Masuk ke Branch Fitur

Pindah ke branch sesuai pembagian tugas.

Contoh untuk pengembangan pengajuan surat:

```bash
git switch feature/pengajuan-surat
```

Untuk melihat seluruh branch:

```bash
git branch -a
```

### 3. Sinkronisasi Sebelum Memulai Pekerjaan

Sebelum mulai mengembangkan fitur, pastikan branch lokal telah mendapatkan perubahan terbaru:

```bash
git fetch origin
git switch feature/pengajuan-surat
git pull origin feature/pengajuan-surat
```

Jika terdapat pembaruan terbaru dari `develop`, integrasikan ke branch fitur masing-masing dengan:

```bash
git merge origin/develop
```

### 4. Melakukan Pengembangan

Anggota dapat mulai mengembangkan fitur sesuai tanggung jawab pada branch masing-masing.

Pastikan perubahan yang dibuat tidak mengganggu modul lain.

### 5. Commit Perubahan

Setelah melakukan perubahan, periksa status repository:

```bash
git status
```

Tambahkan perubahan:

```bash
git add .
```

Buat commit:

```bash
git commit -m "feat: add student letter request module"
```

### 6. Push ke GitHub

Kirim perubahan ke branch fitur masing-masing:

```bash
git push origin feature/pengajuan-surat
```

Sesuaikan nama branch dengan fitur yang dikerjakan.

### 7. Membuat Pull Request

Setelah perubahan berhasil di-push:

1. Buka repository F.R.I.D.A.Y. di GitHub.
2. Masuk ke menu **Pull Requests**.
3. Klik **New Pull Request**.
4. Pilih branch fitur sebagai source branch.
5. Pilih `develop` sebagai target branch.
6. Jelaskan perubahan yang dilakukan.
7. Ajukan Pull Request untuk ditinjau.

### 8. Review dan Merge

Pull Request perlu diperiksa oleh penanggung jawab atau anggota yang ditunjuk sebelum digabungkan ke `develop`.

Setelah perubahan dinyatakan sesuai dan tidak menimbulkan masalah, Pull Request dapat di-merge.

**Ketentuan penting:**

- Jangan mengembangkan fitur langsung pada branch `main`.
- Hindari melakukan pengembangan langsung pada branch `develop`.
- Setiap fitur harus dikerjakan pada branch masing-masing.
- Jangan melakukan force push tanpa koordinasi.
- Jangan mengunggah file `.env`, kredensial, atau informasi rahasia lainnya.
- Selalu sinkronkan branch sebelum memulai pekerjaan.
- Hindari menggabungkan perubahan tanpa proses review.

---

## 📝 Konvensi Commit

Untuk menjaga konsistensi riwayat perubahan, repository menggunakan format pesan commit berikut:

```text
<type>: <deskripsi perubahan>
```

Jenis commit yang digunakan:

| Type | Keterangan | Contoh |
|---|---|---|
| `feat` | Menambahkan fitur baru. | `feat: add room borrowing module` |
| `fix` | Memperbaiki bug. | `fix: resolve letter submission error` |
| `docs` | Mengubah dokumentasi. | `docs: update project README` |
| `refactor` | Merapikan atau memperbaiki struktur kode tanpa mengubah fungsi utama. | `refactor: simplify request controller` |
| `style` | Mengubah format atau tampilan kode tanpa mengubah logika. | `style: update form layout` |
| `test` | Menambahkan atau memperbarui pengujian. | `test: add letter request validation tests` |
| `chore` | Perubahan konfigurasi atau kebutuhan pemeliharaan proyek. | `chore: update dependencies` |

Gunakan deskripsi yang singkat, jelas, dan menggambarkan perubahan yang dilakukan.

---

## 🤝 Panduan Kontribusi

Seluruh anggota tim diharapkan mengikuti ketentuan berikut selama proses pengembangan:

1. Memahami ruang lingkup fitur yang menjadi tanggung jawab masing-masing.
2. Menggunakan branch sesuai pembagian tugas.
3. Mengikuti standar penulisan kode dan struktur Laravel.
4. Menjaga konsistensi penamaan file, class, method, dan database.
5. Melakukan pengujian terhadap fitur sebelum mengajukan Pull Request.
6. Melakukan koordinasi apabila terdapat perubahan yang berpotensi memengaruhi modul lain.
7. Menuliskan pesan commit yang jelas dan informatif.
8. Menjaga keamanan konfigurasi serta data sensitif aplikasi.

Setiap perubahan yang dikembangkan harus melalui proses integrasi agar seluruh modul tetap berjalan secara konsisten.

---

## 📊 Status Pengembangan

Berikut merupakan gambaran status pengembangan F.R.I.D.A.Y. berdasarkan tahap proyek saat ini.

| Komponen | Status |
|---|---|
| Inisialisasi repository GitHub | Selesai |
| Setup Laravel 13 | Selesai |
| Konfigurasi koneksi MySQL lokal | Selesai |
| Pembuatan branch pengembangan | Selesai |
| Sinkronisasi branch fitur dengan `develop` | Selesai |
| Modul pengajuan surat | Dalam pengembangan |
| Modul peminjaman barang | Dalam pengembangan |
| Modul peminjaman ruangan | Dalam pengembangan |
| Integrasi SSO | Menunggu kesepakatan teknis dan pengembangan |
| Integrasi keseluruhan modul | Belum dimulai |
| Pengujian sistem secara menyeluruh | Belum dimulai |

Status pada tabel dapat diperbarui seiring perkembangan implementasi proyek.

---

## 🔐 Keamanan dan Pengelolaan Environment

Beberapa ketentuan terkait keamanan proyek:

- File `.env` hanya digunakan pada lingkungan lokal masing-masing pengembang.
- Jangan mengunggah password database, application key, API key, atau token autentikasi ke GitHub.
- Gunakan `.env.example` sebagai template konfigurasi.
- Pastikan file `.env` tetap tercantum dalam `.gitignore`.
- Jangan mengubah konfigurasi bersama tanpa koordinasi dengan anggota tim.

---

## 👥 Tim Pengembang

**Proyek:** F.R.I.D.A.Y. — Sistem Informasi  
**Repository:** [Sistem-Informasi-RPL-UPI/F.R.I.D.A.Y.](https://github.com/Sistem-Informasi-RPL-UPI/F.R.I.D.A.Y)  
**Platform:** GitHub  
**Framework:** Laravel 13  
**Database:** MySQL

Proyek ini dikembangkan secara kolaboratif oleh tim mahasiswa dalam rangka pengerjaan proyek mata kuliah Sistem Informasi.

---

## 📚 Referensi

- [Dokumentasi Resmi Laravel](https://laravel.com/docs)
- [Dokumentasi PHP](https://www.php.net/docs.php)
- [Dokumentasi MySQL](https://dev.mysql.com/doc/)
- [Dokumentasi Git](https://git-scm.com/doc)
- [Dokumentasi GitHub](https://docs.github.com/)

---

**F.R.I.D.A.Y. — Integrated Student Information Services.**
