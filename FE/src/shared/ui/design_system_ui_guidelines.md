# Design System & UI Guidelines (`DESIGN.md`)

Dokumen ini adalah panduan resmi desain dan pengembangan antarmuka (UI/UX) untuk Frontend **React + TypeScript** yang terhubung dengan **Laravel REST API**. Semua anggota tim wajib mengikuti standar library, token warna, tipografi, dan _spacing_ di bawah ini agar tampilan aplikasi tetap konsisten, modern, dan mudah dirawat.

---

## 1. Tech Stack & Library Resmi (100% Gratis & Open-Source)

Semua komponen UI dan logika frontend wajib menggunakan library berikut (dilarang menginstal library UI ganda seperti MUI/Bootstrap agar _bundle_ tetap ringan dan gaya tidak bentrok):

| Kategori               | Library                         | Kegunaan Utama                                            |
| :--------------------- | :------------------------------ | :-------------------------------------------------------- |
| **Core & Build**       | React + TypeScript + Vite       | Pondasi aplikasi SPA                                      |
| **Styling**            | Tailwind CSS                    | Utility-first CSS & responsivitas                         |
| **UI Components**      | shadcn/ui                       | Komponen inti (Button, Input, Dialog, Card, dll.)         |
| **Icons**              | Lucide React                    | Seluruh ikon UI (konsisten _stroke-based_)                |
| **Animation**          | Motion (`motion/react`)         | Transisi halaman, modal, dan interaksi mikro              |
| **Routing**            | React Router                    | Navigasi antar halaman                                    |
| **API & Server State** | Axios + TanStack Query          | Komunikasi ke Laravel API, _caching_, dan _loading state_ |
| **Client State**       | Zustand                         | State global UI (sidebar, tema, sesi user)                |
| **Forms & Validation** | React Hook Form + Zod           | Manajemen form dan validasi skema                         |
| **Data Tables**        | TanStack Table                  | Tabel kompleks (_sorting, filtering, pagination_)         |
| **Charts**             | Recharts (via shadcn/ui Charts) | Visualisasi data & grafik dashboard                       |
| **Notifications**      | Sonner                          | _Toast notification_ (sukses, error, info)                |
| **Date Utilities**     | date-fns                        | Format dan manipulasi tanggal/waktu                       |
| **Testing**            | Vitest + Playwright             | Unit testing & End-to-End testing                         |

> **Sumber Komponen Tambahan (Opsional):** Jika butuh variasi komponen ekstra berbasis Tailwind + shadcn/ui, tim diperbolehkan _copy-paste_ dari **Origin UI** atau **shadcn/ui Blocks** selama tetap mengikuti token warna di dokumen ini.

---

## 2. Sistem Warna (Color Tokens)

Kita menggunakan pendekatan **Semantic Color Tokens** (bukan _hardcode_ hex seperti `#3b82f6` di dalam komponen). Gunakan class Tailwind semantik seperti `bg-primary`, `text-muted-foreground`, atau `border-border` agar **Light Mode** dan **Dark Mode** otomatis bekerja.

### Palet Utama (Light Mode & Dark Mode)

| Token / Class Tailwind | Light Mode (Hex)       | Dark Mode (Hex)        | Kegunaan                                        |
| :--------------------- | :--------------------- | :--------------------- | :---------------------------------------------- |
| `background`           | `#FFFFFF`              | `#09090B`              | Latar belakang utama halaman                    |
| `foreground`           | `#09090B`              | `#FAFAFA`              | Warna teks utama                                |
| `card`                 | `#FFFFFF`              | `#121215`              | Latar belakang Card, Modal, Popover             |
| `primary`              | `#2563EB` _(Blue 600)_ | `#3B82F6` _(Blue 500)_ | Tombol utama (CTA), link aktif, elemen fokus    |
| `primary-foreground`   | `#FFFFFF`              | `#FFFFFF`              | Teks di atas warna `primary`                    |
| `secondary`            | `#F4F4F5`              | `#27272A`              | Tombol sekunder, badge netral                   |
| `muted`                | `#F4F4F5`              | `#27272A`              | Latar belakang halus (header tabel, _skeleton_) |
| `muted-foreground`     | `#71717A`              | `#A1A1AA`              | Teks deskripsi, label bantu, _placeholder_      |
| `border`               | `#E4E4E7`              | `#27272A`              | Garis pemisah, border Card, border Input        |

### Warna Status (Feedback & Semantic)

| Status                  | Warna Utama (Hex) | Class Rekomendasi                | Kegunaan                                   |
| :---------------------- | :---------------- | :------------------------------- | :----------------------------------------- |
| **Success**             | `#16A34A`         | `text-emerald-600 bg-emerald-50` | Data tersimpan, status aktif/lunas         |
| **Warning**             | `#D97706`         | `text-amber-600 bg-amber-50`     | Peringatan, status menunggu (_pending_)    |
| **Destructive / Error** | `#DC2626`         | `bg-destructive text-white`      | Hapus data, validasi form gagal, error API |
| **Info**                | `#0284C7`         | `text-sky-600 bg-sky-50`         | Informasi sistem, tips bantuan             |

> _Catatan: Jika proyek memiliki warna brand khusus (misal hijau atau ungu), cukup ubah nilai CSS variable `--primary` di file `src/index.css`._

---

## 3. Tipografi (Typography)

### Font Family

- **Primary Font (UI & Body):** `Inter` (Google Fonts) — bersih, modern, dan sangat terbaca untuk dashboard maupun web publik.
- **Monospace Font (Kode, ID, Angka Tabel):** `JetBrains Mono` atau font mono bawaan sistem (`font-mono`).

### Skala Tipografi (Type Scale)

| Peran                  | Class Tailwind                                  | Ukuran / Line Height | Weight         | Kegunaan                               |
| :--------------------- | :---------------------------------------------- | :------------------- | :------------- | :------------------------------------- |
| **Page Title (H1)**    | `text-2xl md:text-3xl font-bold tracking-tight` | 24px – 30px          | Bold (700)     | Judul utama halaman                    |
| **Section Title (H2)** | `text-xl font-semibold tracking-tight`          | 20px / 28px          | SemiBold (600) | Judul sub-bagian atau Card besar       |
| **Card Title (H3)**    | `text-base font-semibold`                       | 16px / 24px          | SemiBold (600) | Judul Card, Modal, atau Widget         |
| **Body Default**       | `text-sm font-normal leading-relaxed`           | 14px / 22px          | Regular (400)  | Paragraf, isi tabel, teks umum         |
| **Label / Form**       | `text-sm font-medium`                           | 14px / 20px          | Medium (500)   | Label input form, menu navigasi        |
| **Caption / Helper**   | `text-xs text-muted-foreground`                 | 12px / 16px          | Regular (400)  | Teks bantuan form, _timestamp_, footer |

---

## 4. Sistem Spacing, Padding & Layout (4px Grid System)

Semua jarak (_margin, padding, gap_) wajib mengikuti kelipatan **4px** (skala standar Tailwind: `1 = 4px`, `2 = 8px`, `4 = 16px`, `6 = 24px`, `8 = 32px`). **Dilarang menggunakan nilai arbitrary** seperti `p-[13px]` atau `mt-[19px]`.

### Standar Padding & Gap

- **Page Container Padding:** `p-4 md:p-6 lg:p-8` (16px di mobile, 24px di tablet, 32px di desktop).
- **Card Padding:** `p-4 md:p-6` (24px standar untuk desktop).
- **Jarak Antar Section:** `space-y-6` atau `gap-6` (24px).
- **Jarak Antar Elemen di dalam Card / Form:** `space-y-4` atau `gap-4` (16px).
- **Jarak Label dengan Input:** `space-y-1.5` atau `gap-1.5` (6px).
- **Jarak Antar Tombol (Action Group):** `gap-2` atau `gap-3` (8px – 12px).

### Layout & Breakpoints

- **Max Width Konten Utama:** `max-w-7xl mx-auto` (1280px) untuk web publik / container terpusat.
- **Lebar Sidebar Dashboard:** `w-64` (256px) saat terbuka, `w-16` (64px) saat _collapsed_.
- **Tinggi Navbar / Topbar:** `h-16` (64px).
- **Breakpoints (Mobile-First):**
  - Default: Mobile (`< 640px`)
  - `sm`: `640px`
  - `md`: `768px` (Tablet)
  - `lg`: `1024px` (Laptop / Desktop)
  - `xl`: `1280px` (Layar lebar)

---

## 5. Border Radius, Border & Elevation (Shadow)

### Border Radius

- **Card, Modal, Dialog:** `rounded-xl` (12px)
- **Button, Input, Select, Dropdown:** `rounded-lg` (8px)
- **Badge, Tag kecil:** `rounded-md` (6px) atau `rounded-full` (pill)
- **Avatar & Icon Button bulat:** `rounded-full`

### Border & Shadow

Kita menggunakan gaya **Clean Modern UI** (utamakan border tipis dibanding shadow yang terlalu tebal):

- **Card Default:** `border border-border bg-card shadow-xs`
- **Dropdown / Popover:** `border border-border bg-popover shadow-md`
- **Modal / Dialog:** `border border-border bg-background shadow-lg`

---

## 6. Aturan Pemakaian Komponen

1. **Buttons (`shadcn/ui Button`):**
   - Hanya boleh ada **1 tombol `variant="default"` (Primary)** per layar/modal untuk aksi utama.
   - Aksi batal/kembali gunakan `variant="outline"` atau `variant="ghost"`.
   - Aksi hapus gunakan `variant="destructive"` dan wajib disertai _Confirmation Dialog_ (`AlertDialog`).
2. **Icons (`Lucide React`):**
   - Ukuran default di dalam tombol atau teks: `className="h-4 w-4"` (16px).
   - Ukuran ikon navigasi/sidebar: `className="h-5 w-5"` (20px).
   - Gunakan `strokeWidth={1.75}` atau default (`2`) secara konsisten.
3. **Forms (`React Hook Form` + `Zod`):**
   - Setiap form wajib memiliki validasi Zod dan menampilkan pesan error tepat di bawah input (`text-xs text-destructive`).
   - Tombol _Submit_ wajib berubah menjadi `disabled` dengan ikon _spinner_ (`Loader2 className="animate-spin"`) saat sedang mengirim request ke API Laravel.
4. **Loading & Empty States:**
   - Jangan tampilkan layar putih kosong saat _fetching_ data dari Laravel API. Selalu gunakan komponen `Skeleton` (dari shadcn/ui).
   - Jika data tabel kosong, tampilkan _Empty State_ yang rapi (Ikon + Judul singkat + Tombol aksi tambah data).
5. **Notifications (`Sonner`):**
   - Gunakan `toast.success("Data berhasil disimpan")` atau `toast.error("Gagal memuat data")` untuk semua feedback aksi API.
6. **Animations (`Motion`):**
   - Jaga durasi animasi tetap cepat dan halus: `duration: 0.2` sampai `0.3` detik. Hindari animasi berlebihan yang memperlambat kerja pengguna.

---

## 7. Do & Don't untuk Tim Frontend

- **DO:** Selalu cek komponen di `src/components/ui/` sebelum membuat komponen baru dari nol.
- **DO:** Gunakan helper `cn()` dari `@/lib/utils` untuk menggabungkan class Tailwind secara kondisional.
- **DO:** Pastikan semua halaman bisa diakses dengan nyaman di layar mobile (`375px`) maupun desktop (`1440px`).
- **DON'T:** Jangan menulis _inline style_ (`style={{ color: 'red' }}`) kecuali untuk nilai dinamis dari JavaScript/Chart.
- **DON'T:** Jangan menginstal library UI tambahan tanpa persetujuan tim.
