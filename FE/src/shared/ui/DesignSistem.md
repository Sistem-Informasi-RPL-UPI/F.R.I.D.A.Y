# FRIDAY UI Design System & Component Library

Standar desain visual dan library komponen UI resmi untuk tim pengembang frontend repositori `F.R.I.D.A.Y` (**Sistem Informasi Akademik, Peminjaman Fasilitas & Mind Mapping Jadwal UPI Kampus Cibiru**).

Design system ini mengacu pada acuan visual master [Group 60.png](file:///d:/nitip/Group%2060.png).

---

## Daftar Isi (Index)

Mengikuti struktur indeks master desain:

1. [01. Logo](#01-logo)
2. [02. Colors (Color Palette)](#02-colors)
3. [03. Typography](#03-typography)
4. [04. Grid System](#04-grid-system)
5. [05. Spacing](#05-spacing)
6. [06. Component System](#06-component-system)
7. [07. Visual Elements](#07-visual-elements)
8. [Rekomendasi Library yang Relevan & Sesuai](#rekomendasi-library-yang-relevan--sesuai)
9. [Aturan Penggunaan & Kompatibilitas](#aturan-penggunaan--kompatibilitas)

---

## 01. Logo

- **Wordmark:** Menggunakan tipografi **Lexend** (Weight: Bold `700`, tracking/letter-spacing `-0.02em`).
- **Kombinasi Warna:**
  - Latar terang (`#FFFFFF` / `#F2F7FF`): Teks berwarna Vibrant Blue (`#0101B7`).
  - Latar gelap / Header bar (`#0101B7`): Teks berwarna Pure White (`#FFFFFF`).
- **Clearance:** Berikan ruang kosong (_safe area_) minimal `16px` (`var(--space-4)`) di sekitar logo pada navigasi maupun sidebar.

---

## 02. Colors

Seluruh warna dikelola terpusat melalui variabel CSS di [tokens.css](./tokens.css). Dilarang keras menuliskan kode HEX langsung di komponen fitur (`src/features/*`).

### Brand Palette

| Nama Token          | Nama Warna       | Kode HEX  | Peran & Penggunaan                                               |
| ------------------- | ---------------- | --------- | ---------------------------------------------------------------- |
| `--color-primary`   | **Vibrant Blue** | `#0101B7` | Brand header, tombol aksi utama (CTA), tautan aktif              |
| `--color-secondary` | **Dreamy**       | `#8DCCF1` | Aksi sekunder, badge informasi, highlight jadwal                 |
| `--color-accent`    | **WarmY**        | `#FFD166` | Aksen penarik perhatian, status menunggu persetujuan (_pending_) |
| `--color-neutral`   | **Alice**        | `#F2F7FF` | Latar belakang (_background_) halaman web aplikasi               |
| `--color-surface`   | **Pure White**   | `#FFFFFF` | Latar kartu (_Card_), modal dialog, dan tabel                    |

### Ink & Borders

| Token CSS               | Nama          | Kode HEX  | Peran                                     |
| ----------------------- | ------------- | --------- | ----------------------------------------- |
| `--color-ink-primary`   | Deep Navy     | `#0B2239` | Teks judul (_Heading_) dan paragraf utama |
| `--color-ink-secondary` | Slate Medium  | `#475569` | Paragraf sekunder, penjelasan             |
| `--color-ink-muted`     | Slate Light   | `#64748B` | Label form, hint, placeholder, metadata   |
| `--color-ink-inverse`   | Pure White    | `#FFFFFF` | Teks di atas warna primary / banner       |
| `--color-border`        | Ice Border    | `#DCE6F5` | Garis pemisah (_divider_), border kartu   |
| `--color-border-strong` | Border Strong | `#B8CAE6` | Border input dan elemen interaktif        |

### Semantic Status

- **Success:** `--color-success` (`#15803D`) / Soft: `--color-success-soft` (`#DCFCE7`)
- **Warning:** `--color-warning` (`#B45309`) / Soft: `--color-warning-soft` (`#FEF3C7`)
- **Danger:** `--color-danger` (`#B91C1C`) / Soft: `--color-danger-soft` (`#FEE2E2`)
- **Info:** `--color-info` (`#0369A1`) / Soft: `--color-info-soft` (`#E0F2FE`)

---

## 03. Typography

Tipografi menggunakan kombinasi dua font Google Fonts: **Lexend** untuk display/heading dan **Plus Jakarta Sans** untuk body text.

### Heading — `Lexend`

| Tingkat       | Ukuran (px / rem)  | Line Height (px / rem) | Variabel CSS                      |
| ------------- | ------------------ | ---------------------- | --------------------------------- |
| **Heading 1** | `56px` (`3.5rem`)  | `61.6px` (`3.85rem`)   | `--text-h1-size` / `--text-h1-lh` |
| **Heading 2** | `48px` (`3rem`)    | `52.8px` (`3.3rem`)    | `--text-h2-size` / `--text-h2-lh` |
| **Heading 3** | `40px` (`2.5rem`)  | `44px` (`2.75rem`)     | `--text-h3-size` / `--text-h3-lh` |
| **Heading 4** | `32px` (`2rem`)    | `35.2px` (`2.2rem`)    | `--text-h4-size` / `--text-h4-lh` |
| **Heading 5** | `24px` (`1.5rem`)  | `26.4px` (`1.65rem`)   | `--text-h5-size` / `--text-h5-lh` |
| **Heading 6** | `20px` (`1.25rem`) | `22px` (`1.375rem`)    | `--text-h6-size` / `--text-h6-lh` |

### Body — `Plus Jakarta Sans`

| Varian          | Ukuran               | Bobot yang Didukung                      | Variabel CSS          |
| --------------- | -------------------- | ---------------------------------------- | --------------------- |
| **Large Text**  | `24px` (`1.5rem`)    | Medium (500), Regular (400), Light (300) | `--text-body-lg-size` |
| **Normal Text** | `16px` (`1rem`)      | Medium (500), Regular (400), Light (300) | `--text-body-md-size` |
| **Small Text**  | `13px` (`0.8125rem`) | Medium (500), Regular (400), Light (300) | `--text-body-sm-size` |

> **Perhatian Khusus (Offline & E2E Testing):**
> Pengujian Playwright pada starter ini mewajibkan **nol request eksternal** (`externalRequests === []`). Oleh karena itu, font tidak boleh dimuat via tag CDN `<link>` Google Fonts di `index.html`. Font harus dibundel lokal (lihat rekomendasi `@fontsource` di bawah).

---

## 04. Grid System

- Container utama: `.ds-container` (lebar maksimal `1200px` / `--container-max`).
- Grid: `.ds-grid` (CSS Grid 12 kolom dengan _gutter_ `24px` / `--grid-gutter`).
- Kolom responsif:
  - `.ds-col-12` (lebar penuh 12 kolom)
  - `.ds-col-6` (setengah lebar / 6 kolom)
  - `.ds-col-4` (sepertiga lebar / 4 kolom)
  - `.ds-col-3` (seperempat lebar / 3 kolom)
- Pada viewport layar ponsel (`<= 768px`), kolom otomatis menumpuk menjadi 12 kolom penuh (_full width_).

---

## 05. Spacing

Skala modular berbasis kelipatan **4px**:

- `--space-1`: `4px` (`0.25rem`)
- `--space-2`: `8px` (`0.5rem`)
- `--space-3`: `12px` (`0.75rem`)
- `--space-4`: `16px` (`1rem`)
- `--space-6`: `24px` (`1.5rem`)
- `--space-8`: `32px` (`2rem`)
- `--space-12`: `48px` (`3rem`)
- `--space-16`: `64px` (`4rem`)
- `--space-20`: `80px` (`5rem`)
- `--space-24`: `96px` (`6rem`)

---

## 06. Component System

Semua komponen siap pakai diekspor melalui satu pintu masuk: `src/shared/ui/index.ts`.

### 1. `Navbar`

Komponen bilah navigasi atas (_top bar_) dengan latar belakang Vibrant Blue (`--color-primary`), brand logo Lexend, dan area konten/navigasi yang fleksibel.

```tsx
import { Navbar } from '@/shared/ui';
import { Link } from 'react-router';

// Penggunaan dasar (isian menu dapat dikosongkan terlebih dahulu):
<Navbar
  brand={
    <Link to="/" className="ds-navbar__brand">
      FRIDAY
    </Link>
  }
>
  {/* Isian navigasi dikosongkan atau diisi link/menu */}
</Navbar>;
```

### 2. `Button`

Tombol interaktif dengan 5 varian dan 3 ukuran:

- Varian: `primary`, `secondary`, `accent`, `outline`, `danger`
- Ukuran: `sm`, `md`, `lg`

```tsx
import { Button } from '@/shared/ui';

<Button variant="primary" size="md">Simpan Jadwal</Button>
<Button variant="outline" size="sm">Batal</Button>
```

### 3. `Card`

Wadah konten dengan latar putih (`--color-surface`), border radius `16px`, dan drop-shadow halus (`--shadow-md`).

```tsx
import { Card } from '@/shared/ui';

<Card>
  <h5>Judul Kartu</h5>
  <p>Isi konten kartu...</p>
</Card>;
```

### 4. `Badge`

Indikator status atau label kategori dalam bentuk pil (_pill radius_):

- Tone: `primary`, `secondary`, `accent`, `success`, `danger`

```tsx
import { Badge } from '@/shared/ui';

<Badge tone="success">Disetujui</Badge>
<Badge tone="accent">Menunggu Persetujuan</Badge>
```

### 5. `FormField` & `Input`

Komponen input formulir aksesibel yang terintegrasi dengan label dan pesan error (`role="alert"`).

```tsx
import { FormField, Input } from '@/shared/ui';

<FormField label="Kode Ruangan" error={errors.code?.message} required>
  <Input placeholder="Contoh: R.204" />
</FormField>;
```

### 6. `Alert`

Banner notifikasi dan umpan balik pengguna:

- Tone: `info`, `success`, `warning`, `danger`

```tsx
import { Alert } from '@/shared/ui';

<Alert tone="warning">Jadwal bertabrakan dengan mata kuliah lain!</Alert>;
```

---

## 07. Visual Elements

### Border Radius

- `--radius-sm` (`8px`): Elemen form (Input, Select, Textarea).
- `--radius-md` (`12px`): Tombol (`Button`), banner notifikasi (`Alert`).
- `--radius-lg` (`16px`): Kartu (`Card`), dialog box, modal.
- `--radius-xl` (`24px`): Panel besar, drawer.
- `--radius-pill` (`9999px`): Status Badge, pill tab.

### Elevation (Box Shadow)

- `--shadow-sm`: `0 2px 8px rgba(11, 34, 57, 0.06)` — Elemen datar dengan pemisah halus.
- `--shadow-md`: `0 8px 24px rgba(11, 34, 57, 0.08)` — Kartu standar dan dropdown menu.
- `--shadow-lg`: `0 16px 40px rgba(1, 1, 183, 0.12)` — Modal, popover, dan elemen fokus mengapung.

### Transisi

- `--transition-fast`: `150ms cubic-bezier(0.2, 0.8, 0.2, 1)` — Untuk _hover_, _focus_, dan _active state_.

---

## Rekomendasi Library yang Relevan & Sesuai

Berdasarkan arsitektur proyek (React 19, TypeScript, Vite, Tailwind/CSS Tokens murni, kepatuhan Playwright E2E tanpa request eksternal), berikut daftar library yang **sangat relevan** dan direkomendasikan untuk pengembangan sistem UI:

### 1. Tipografi & Offline Font Bundling (Prioritas Tinggi)

- **`@fontsource/lexend`** dan **`@fontsource/plus-jakarta-sans`**
  - **Relevansi:** Sesuai acuan tipografi di `Group 60.png`.
  - **Alasan Teknis:** Playwright E2E test memvalidasi `externalRequests === []`. Memuat Google Fonts lewat CDN luar akan menggagalkan tes. Fontsource membundel file `.woff2` langsung ke dalam Vite `dist/` sebagai aset lokal statis sehingga 100% offline dan performan tinggi.
  - **Pemasangan:** `npm install @fontsource/lexend @fontsource/plus-jakarta-sans` lalu import di `src/styles.css`.

### 2. Icon Library (Prioritas Tinggi)

- **`lucide-react`**
  - **Relevansi:** Ikon untuk navigasi Navbar, tombol aksi, filter tabel, dan status.
  - **Alasan Teknis:** Ringan, mendukung tree-shaking otomatis (hanya ikon yang diimpor yang masuk bundle), konsisten dengan stroke 2px yang cocok dengan estetika Lexend & Plus Jakarta Sans, serta kompatibel penuh dengan React 19.
  - **Pemasangan:** `npm install lucide-react`.

### 3. Headless UI / Primitives Aksesibel (Rekomendasi untuk Komponen Lanjutan)

- **`@radix-ui/react-navigation-menu`**, **`@radix-ui/react-dropdown-menu`**, **`@radix-ui/react-dialog`**
  - **Relevansi:** Komponen navbar responsif, dropdown profil pengguna, modal konfirmasi peminjaman barang/ruangan.
  - **Alasan Teknis:** Menyediakan logika aksesibilitas WAI-ARIA lengkap, navigasi keyboard (panah, Esc, Tab), dan focus management tanpa memaksakan style CSS apa pun. Sangat cocok diterapkan di atas token CSS murni kita (`.ds-navbar`, `.ds-card`, dll).
  - **Alternatif:** `@headlessui/react` (jika ingin alternatif setara).

### 4. Utility Penggabungan Class CSS (Rekomendasi Helper)

- **`clsx`**
  - **Relevansi:** Menggabungkan class name secara kondisional pada komponen UI (misal: aktif pada tautan navigasi, disabled, error).
  - **Alasan Teknis:** Ukuran sangat kecil (< 1 KB), tanpa dependensi eksternal, dan aman dari overhead performa.
  - **Pemasangan:** `npm install clsx`.

### 5. Form & Client Validation (Sesuai Standar `AGENTS.md`)

- **`react-hook-form`** & **`zod`** & **`@hookform/resolvers`**
  - **Relevansi:** Formulir input peminjaman ruangan/barang, otentikasi login, serta input filter penjadwalan.
  - **Alasan Teknis:** Sudah masuk daftar _approved stack_ di `AGENTS.md`. Memisahkan state form dari re-render berlebih pada React 19.

---

## Aturan Penggunaan & Kompatibilitas

1. **Arah Ketergantungan (_Dependency Flow_):**
   - Komponen di `src/shared/ui/` bersifat independen. Komponen shared dilarang mengimpor modul dari `src/features/` atau `src/app/`.
2. **Kustomisasi & Ekstensi:**
   - Gunakan prop `className` dan `style` untuk penyesuaian tata letak (margin/flex).
   - Jangan mengubah token inti (`--color-primary`, dll) di tingkat lokal komponen fitur tanpa persetujuan arsitektur.
3. **Pratinjau Langsung (_Showcase_):**
   - Jalankan `npm run dev` pada direktori `FE/` dan buka rute `/design-system` pada peramban untuk melihat seluruh katalog token warna, tipografi, dan varian komponen UI secara visual.
