# FRIDAY — Laravel + React Starter

Starter teknis *reusable* untuk tim pengembang yang membangun aplikasi *decoupled* **Laravel REST API** dan **React SPA**. Monorepo ini berisi dua aplikasi independen, konfigurasi MySQL untuk pengembangan dan pengujian, *smoke test*, *tools* kualitas kode, serta dokumentasi kerja tim.

---

## Mulai dari Sini

- **[Panduan Setup](docs/setup/README.md):** Pilih setup Backend, Frontend, atau keduanya beserta prasyaratnya.
- **[Backend README](BE/readme.md)** & **[Frontend README](FE/readme.md):** Daftar perintah dan tanggung jawab masing-masing aplikasi.
- **[Konfigurasi Environment](docs/setup/environment.md)** & **[Troubleshooting](docs/setup/troubleshooting.md):** Pengaturan `.env` dan solusi kendala umum.
- **[Checklist Onboarding](docs/onboarding.md)** & **[Panduan Kontribusi](CONTRIBUTING.md):** Alur bergabung dan aturan kontribusi tim.

> **Catatan untuk Kontributor Aktif:** Pertahankan file `.env`, *application key*, database, dan *dependencies* yang sudah terpasang. Perintah *initial-install* hanya untuk *checkout* baru atau instalasi ulang yang disengaja—jangan diulang pada *workspace* yang sudah berjalan.

---

## Struktur & Tech Stack

| Direktori | Tanggung Jawab | Baseline |
| :--- | :--- | :--- |
| `BE/` | Backend REST API Laravel independen (tanpa *build* aset Node.js) | Laravel 13, PHP 8.5, MySQL 8.4, Pest, Pint |
| `FE/` | Frontend SPA browser & *static build* independen | React, strict TypeScript, Vite, React Router (Declarative Mode), Vitest, Playwright, ESLint, Prettier |
| `docs/` | Arsitektur, panduan setup, standar kode, *onboarding*, dan verifikasi | [Cakupan Proyek](docs/scope.md) |

### Aturan Dasar Monorepo
- **Independensi Paket:** Jalankan `composer` di `BE/` dan `npm` di `FE/`; masing-masing aplikasi memiliki *manifest* dan *lockfile* sendiri. Tidak ada *root install*, *script* gabungan, Docker, CI/CD, atau *monorepo orchestrator*.
- **Isolasi Runtime:** Perintah Frontend tidak membutuhkan PHP, database, atau API aktif. Sebaliknya, perintah Backend tidak membutuhkan instalasi Frontend atau Node.js.
- **Pola Arsitektur:**
  - **Backend:** *Modular Monolith*.
  - **Frontend:** *Feature-Based* dengan arah ketergantungan `app -> features -> shared`.
  - Direktori modul/fitur hanya dibuat ketika fitur tersebut benar-benar dibutuhkan.
- **API & Health Check:** Versi API aplikasi menggunakan prefix `/api/v1` (belum ada *endpoint* bisnis pada starter ini). Rute `GET /up` adalah *health check* bawaan Laravel.

---

## Daftar Pemeriksaan (*Checks*)

| Root Aplikasi | Perintah | Prasyarat |
| :--- | :--- | :--- |
| `BE/` | `composer run check` | Dependensi PHP/Composer & skema MySQL test terisolasi |
| `FE/` | `npm run check` | Dependensi Node.js/npm |
| `FE/` | `npm run build` | Dependensi Node.js/npm |
| `FE/` | `npm run test:e2e` | Dependensi Node.js/npm, Chromium yang sesuai, & port `4173` kosong |

- **Server Pengembangan:** Backend berjalan di `http://localhost:8000` dan Frontend di `http://localhost:5173`.
- Detail perintah, *formatter*, pemilihan tes, dan aturan independensi tersedia di [Standar Pengembangan](docs/development/standards.md) dan [Konvensi Testing](docs/development/testing.md).

---

## Cakupan & Arsitektur

Starter ini menyediakan fondasi teknis dan *tooling* tim. Hal-hal berikut berada **di luar cakupan starter**: autentikasi (*login/register*), setup Sanctum, *roles & permissions*, dashboard, modul bisnis, skema domain spesifik, dan *production deployment*. Penambahan Docker dan CI/CD memerlukan persetujuan terpisah, serta *deployment* tetap bersifat *provider-neutral*.

**Pilihan Teknologi yang Disetujui untuk Pengembangan Selanjutnya:**
- **Autentikasi:** Sanctum SPA Cookie Authentication.
- **Frontend & Kontrak API:** Axios, TanStack Query, React Hook Form, Zod, OpenAPI 3.1.2, dan *generated TypeScript API types* (beberapa sengaja belum diinstal di starter karena belum ada fiturnya).

Pelajari rancangan lengkap beserta contoh penerapannya di [Ringkasan Arsitektur](docs/architecture/overview.md) dan daftar fitur aktual starter di [Cakupan Proyek](docs/scope.md).

---

## Verifikasi & Kolaborasi

- **Baseline Terverifikasi:** Dokumen [Verified Baseline](docs/verification/baseline.md) mencatat lingkungan terakhir saat starter diuji *end-to-end* (*clean install*, isolasi MySQL, artefak independen, *quality checks*, audit dependensi, dan batasan platform). Dokumen ini adalah *snapshot* bertanggal, bukan jaminan untuk mesin lokal saat ini.
- **Alur Git:** Seluruh kontribusi diarahkan ke branch `Develop` mengikuti [Git Workflow](docs/development/workflow.md).
- **Aturan AI Agent:** AI *coding agent* wajib membaca dan mematuhi [AGENTS.md](AGENTS.md) serta instruksi aplikasi terkait sebelum melakukan perubahan kode.
