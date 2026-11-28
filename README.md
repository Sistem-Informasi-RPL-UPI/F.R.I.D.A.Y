# F.R.I.D.A.Y — UPI Kampus Cibiru

**F.R.I.D.A.Y** adalah sistem informasi komprehensif berbasis web yang dirancang khusus untuk lingkungan **UPI Kampus Cibiru**. Aplikasi ini mendigitalisasi dan mengintegrasikan layanan kampus ke dalam satu platform yang efisien bagi mahasiswa dan civitas akademika, dibangun menggunakan arsitektur *decoupled* **Laravel REST API** dan **React SPA**.

## Fokus Utama Aplikasi

1. **Sistem Informasi Akademik:** Menyediakan akses bagi mahasiswa untuk memantau data akademik mereka secara terpusat.
2. **Peminjaman Fasilitas:** Mengelola sistem *booking* dan peminjaman fasilitas kampus secara digital untuk mencegah bentrok jadwal.
3. **Mind Mapping Jadwal:** Visualisasi jadwal perkuliahan dalam bentuk *mind mapping* interaktif menggunakan `@xyflow/react`, membantu mahasiswa memahami alur jadwal secara lebih intuitif dibandingkan tabel konvensional.

---

## Mulai dari Sini

- **[Panduan Setup](docs/setup/README.md):** Pilih setup Backend, Frontend, atau keduanya beserta prasyaratnya.
- **[Backend README](BE/readme.md)** & **[Frontend README](FE/readme.md):** Daftar perintah, tata cara pengembangan, dan tanggung jawab masing-masing aplikasi.
- **[Design System (DESIGN.md)](docs/DESIGN.md):** Standar warna, tipografi, komponen UI modular, dan aturan styling.
- **[Konfigurasi Environment](docs/setup/environment.md)** & **[Troubleshooting](docs/setup/troubleshooting.md):** Pengaturan `.env` dan solusi kendala umum.
- **[Checklist Onboarding](docs/onboarding.md)** & **[Panduan Kontribusi](CONTRIBUTING.md):** Alur bergabung dan aturan kontribusi tim.

> **Catatan untuk Kontributor Aktif:** Pertahankan file `.env`, *application key*, database, dan *dependencies* yang sudah terpasang. Perintah *initial-install* hanya untuk *checkout* baru atau instalasi ulang yang disengaja—jangan diulang pada *workspace* yang sudah berjalan.

---

## Struktur & Tech Stack

| Direktori | Tanggung Jawab | Tech Stack |
| :--- | :--- | :--- |
| `BE/` | Backend REST API Laravel independen (tanpa *build* aset Node.js) | Laravel 13, PHP 8.5, MySQL 8.4, Pest, Pint |
| `FE/` | Frontend SPA browser & *static build* independen | React 19, TypeScript, Vite, Tailwind CSS, TanStack React Query, `@xyflow/react`, React Router, Vitest, Playwright |
| `docs/` | Arsitektur, panduan setup, design system, standar kode, dan verifikasi | [Cakupan Proyek](docs/scope.md) |

### Aturan Dasar Monorepo
- **Independensi Paket:** Jalankan `composer` di `BE/` dan `npm` di `FE/`; masing-masing aplikasi memiliki *manifest* dan *lockfile* sendiri. Tidak ada *root install*, *script* gabungan, Docker, CI/CD, atau *monorepo orchestrator*.
- **Isolasi Runtime:** Perintah Frontend tidak membutuhkan PHP, database, atau API aktif. Sebaliknya, perintah Backend tidak membutuhkan instalasi Frontend atau Node.js.
- **Pola Arsitektur:**
  - **Backend:** *Modular Monolith* dengan prefix versi API `/api/v1` (`GET /up` untuk *health check* bawaan Laravel).
  - **Frontend:** *Feature-Sliced / Feature-Based Design* dengan arah ketergantungan `app -> features -> shared` serta komponen UI modular yang terdokumentasi di `DESIGN.md`.

---

## Daftar Pemeriksaan (*Checks*)

| Root Aplikasi | Perintah | Prasyarat |
| :--- | :--- | :--- |
| `BE/` | `composer run check` | Dependensi PHP/Composer & skema MySQL test terisolasi |
| `FE/` | `npm run check` | Dependensi Node.js/npm |
| `FE/` | `npm run build` | Dependensi Node.js/npm |
| `FE/` | `npm run test:e2e` | Dependensi Node.js/npm, Chromium yang sesuai, & port `4173` kosong |

- **Server Pengembangan:** Backend berjalan di `http://localhost:8000` dan Frontend di `http://localhost:5173`.
- Detail standar kode dan konvensi pengujian tersedia di [Standar Pengembangan](docs/development/standards.md) dan [Konvensi Testing](docs/development/testing.md).

---

## Arsitektur & Kolaborasi

- **Arsitektur & Autentikasi:** Rancangan lengkap sistem tersedia di [Ringkasan Arsitektur](docs/architecture/overview.md). Autentikasi direncanakan menggunakan **Sanctum SPA Cookie Authentication**, dengan komunikasi API berbasis **Axios**, **TanStack React Query**, **React Hook Form**, dan **Zod**.
- **Baseline Terverifikasi:** Dokumen [Verified Baseline](docs/verification/baseline.md) mencatat *snapshot* terakhir saat repositori diuji *end-to-end* (*clean install*, isolasi MySQL, *quality checks*, dan audit dependensi).
- **Alur Git:** Seluruh kontribusi diarahkan ke branch `Develop` mengikuti [Git Workflow](docs/development/workflow.md).
- **Aturan AI Agent:** AI *coding agent* wajib membaca dan mematuhi [AGENTS.md](AGENTS.md) serta instruksi aplikasi terkait sebelum melakukan perubahan kode.
