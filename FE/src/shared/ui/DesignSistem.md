# FRIDAY UI Design System & Component Library

Standar desain visual, token CSS, dan pustaka komponen UI resmi untuk repositori `F.R.I.D.A.Y` (**Sistem Informasi Akademik, Peminjaman Fasilitas & Mind Mapping Jadwal UPI Kampus Cibiru**).

Dokumen ini menjadi referensi tunggal (**Source of Truth**) bersama [tokens.css](./tokens.css) dan panduan implementasi UI/UX di [design_system_ui_guidelines.md](./design_system_ui_guidelines.md).

---

## Daftar Isi (Index)

1. [01. Logo & Identitas Brand](#01-logo--identitas-brand)
2. [02. Colors (Color Tokens)](#02-colors-color-tokens)
3. [03. Typography](#03-typography)
4. [04. Grid System](#04-grid-system)
5. [05. Spacing](#05-spacing)
6. [06. Component System](#06-component-system)
7. [07. Visual Elements (Radius, Elevation & Motion)](#07-visual-elements-radius-elevation--motion)
8. [08. Stack Library Resmi & Terpasang](#08-stack-library-resmi--terpasang)
9. [09. Aturan Penggunaan & Kompatibilitas](#09-aturan-penggunaan--kompatibilitas)

---

## 01. Logo & Identitas Brand

- **Wordmark:** Menggunakan tipografi **Lexend** (Weight: Bold `700`, `letter-spacing: -0.02em`).
- **Kombinasi Warna:**
  - Latar terang (`#FFFFFF` / `#F2F7FF`): Teks berwarna Vibrant Blue (`#0101B7`) atau Deep Navy (`#0B2239`).
  - Latar gelap / Header bar (`#0101B7`): Teks berwarna Pure White (`#FFFFFF`).
- **Clearance:** Berikan ruang kosong (_safe area_) minimal `16px` (`var(--space-4)`) di sekitar logo pada navigasi atas maupun sidebar.

---

## 02. Colors (Color Tokens)

Seluruh warna dikelola terpusat melalui CSS Custom Properties di [tokens.css](./tokens.css). **Dilarang keras menuliskan kode HEX langsung di komponen fitur (`src/features/*`) atau file CSS halaman fitur.**

### Brand Palette

| Nama Token               | Nama Warna       | Kode HEX  | Peran & Penggunaan                                                  |
| ------------------------ | ---------------- | --------- | ------------------------------------------------------------------- |
| `--color-primary`        | **Vibrant Blue** | `#0101B7` | Brand header, tombol aksi utama (CTA), elemen terpilih, link aktif  |
| `--color-primary-hover`  | Primary Hover    | `#000094` | State hover tombol utama & elemen interaktif primer                 |
| `--color-primary-active` | Primary Active   | `#000073` | State active/pressed tombol utama                                   |
| `--color-primary-soft`   | Primary Soft     | `#E6E8FF` | Latar item navigasi aktif, badge primary, highlight hover peta      |
| `--color-primary-tint`   | Primary Tint     | `#F4F6FF` | Latar kartu bantuan sidebar & highlight ringan                      |
| `--color-secondary`      | **Dreamy**       | `#8DCCF1` | Aksi sekunder, badge informasi, highlight jadwal                    |
| `--color-secondary-soft` | Secondary Soft   | `#E5F5FD` | Latar badge sekunder                                                |
| `--color-accent`         | **WarmY**        | `#FFD166` | Aksen penarik perhatian, cincin sorot pilihan aktif, status pending |
| `--color-accent-soft`    | Accent Soft      | `#FFF6DB` | Latar badge warning ringan & baris istirahat matriks                |
| `--color-neutral`        | **Alice**        | `#F2F7FF` | Latar belakang utama halaman web aplikasi                           |
| `--color-surface`        | **Pure White**   | `#FFFFFF` | Latar kartu (`Card`), modal dialog, sidebar, dan tabel              |
| `--color-surface-muted`  | Surface Muted    | `#F8FAFF` | Header tabel, area kontainer sekunder, panel ringkasan              |

### Ink & Borders

| Token CSS               | Nama          | Kode HEX  | Peran                                     |
| ----------------------- | ------------- | --------- | ----------------------------------------- |
| `--color-ink-primary`   | Deep Navy     | `#0B2239` | Teks judul (_Heading_) dan paragraf utama |
| `--color-ink-secondary` | Slate Medium  | `#475569` | Paragraf sekunder, penjelasan, subjudul   |
| `--color-ink-muted`     | Slate Light   | `#64748B` | Label form, hint, placeholder, metadata   |
| `--color-ink-inverse`   | Pure White    | `#FFFFFF` | Teks di atas warna primary / banner       |
| `--color-border`        | Ice Border    | `#DCE6F5` | Garis pemisah (_divider_), border kartu   |
| `--color-border-strong` | Border Strong | `#B8CAE6` | Border input, tombol outline, kontainer   |

### Semantic Status

- **Success:** `--color-success` (`#15803D`) / Soft: `--color-success-soft` (`#DCFCE7`)
- **Warning:** `--color-warning` (`#B45309`) / Soft: `--color-warning-soft` (`#FEF3C7`)
- **Danger:** `--color-danger` (`#B91C1C`) / Soft: `--color-danger-soft` (`#FEE2E2`)
- **Info:** `--color-info` (`#0369A1`) / Soft: `--color-info-soft` (`#E0F2FE`)

### Program Studi Semantic Palette (Jadwal & Matriks)

| Prodi               | Token Utama            | Token Soft                  | Token Border                  |
| ------------------- | ---------------------- | --------------------------- | ----------------------------- |
| **PGSD**            | `--color-prodi-pgsd`   | `--color-prodi-pgsd-soft`   | `--color-prodi-pgsd-border`   |
| **PGPAUD**          | `--color-prodi-pgpaud` | `--color-prodi-pgpaud-soft` | `--color-prodi-pgpaud-border` |
| **RPL**             | `--color-prodi-rpl`    | `--color-prodi-rpl-soft`    | `--color-prodi-rpl-border`    |
| **PMM**             | `--color-prodi-pmm`    | `--color-prodi-pmm-soft`    | `--color-prodi-pmm-border`    |
| **Teknik Komputer** | `--color-prodi-tekkom` | `--color-prodi-tekkom-soft` | `--color-prodi-tekkom-border` |
| **MKDU**            | `--color-prodi-mkdu`   | `--color-prodi-mkdu-soft`   | `--color-prodi-mkdu-border`   |
| **Online / Daring** | `--color-online-teal`  | `--color-online-teal-soft`  | `--color-online-teal-border`  |

### Campus Map Palette (Denah Kampus)

Token khusus visualisasi denah vektor interaktif di `tokens.css`:

- Kanvas & jalan: `--map-bg` (`#EEF4FC`), `--map-grid` (`#DCE6F5`), `--map-road` (`#FFFFFF`), `--map-road-stroke` (`#CFDCF0`)
- Ruang terbuka & perairan: `--map-park-fill` / `--map-park-stroke`, `--map-court-fill` / `--map-court-stroke`, `--map-water-fill` / `--map-water-stroke`
- Gedung non-peminjaman & fasilitas pendukung: `--map-inactive-fill` / `--map-inactive-stroke` / `--map-inactive-ink`, `--map-facility-fill` / `--map-facility-stroke` / `--map-facility-ink`

---

## 03. Typography

Tipografi menggunakan font lokal yang dibundel via `@fontsource`: **Lexend** (`--font-heading`) untuk display/heading, **Plus Jakarta Sans** (`--font-body`) untuk teks antarmuka & paragraf, serta `--font-mono` untuk kode ruangan, NIM/NIP, dan nomor referensi.

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

| Varian          | Ukuran               | Bobot yang Didukung                                      | Variabel CSS          |
| --------------- | -------------------- | -------------------------------------------------------- | --------------------- |
| **Large Text**  | `24px` (`1.5rem`)    | SemiBold (600), Medium (500), Regular (400), Light (300) | `--text-body-lg-size` |
| **Normal Text** | `16px` (`1rem`)      | SemiBold (600), Medium (500), Regular (400), Light (300) | `--text-body-md-size` |
| **Small Text**  | `13px` (`0.8125rem`) | SemiBold (600), Medium (500), Regular (400), Light (300) | `--text-body-sm-size` |

> **Aturan Offline & Playwright E2E:**
> Pengujian E2E mewajibkan **nol request eksternal** (`externalRequests === []`). Font dan ikon **dilarang** dimuat via CDN eksternal di `index.html`. Gunakan `@fontsource/lexend`, `@fontsource/plus-jakarta-sans` (diimpor di `src/styles.css`), dan `lucide-react` untuk ikon.

---

## 04. Grid System

- Container utama: `.ds-container` (lebar maksimal `1200px` / `--container-max`).
- Grid: `.ds-grid` (CSS Grid 12 kolom dengan _gutter_ `24px` / `--grid-gutter`).
- Kolom responsif:
  - `.ds-col-12` (lebar penuh 12 kolom)
  - `.ds-col-6` (setengah lebar / 6 kolom)
  - `.ds-col-4` (sepertiga lebar / 4 kolom)
  - `.ds-col-3` (seperempat lebar / 3 kolom)
- Pada viewport layar ponsel (`<= 768px`), kolom `.ds-col-6`, `.ds-col-4`, dan `.ds-col-3` otomatis menumpuk menjadi 12 kolom penuh (_full width_).

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

Semua komponen shared diekspor melalui satu pintu masuk: `src/shared/ui/index.ts`.

### 1. `Navbar`

Bilah navigasi atas (`role="banner"`) dengan latar belakang Vibrant Blue (`--color-primary`), slot `brand`, `children` (area nav), dan `actions`.

```tsx
import { Link } from 'react-router';
import { Button, Navbar } from '../shared/ui';

<Navbar
  brand={
    <Link to="/" className="ds-navbar__brand">
      FRIDAY
    </Link>
  }
  actions={
    <Link to="/design-system">
      <Button size="sm" variant="accent">
        Design System
      </Button>
    </Link>
  }
/>;
```

### 2. `Button`

Tombol interaktif dengan 5 varian dan 3 ukuran (`type` default `"button"`):

- Varian: `primary`, `secondary`, `accent`, `outline`, `danger`
- Ukuran: `sm`, `md`, `lg`

```tsx
import { Button } from '../shared/ui';

<Button variant="primary" size="md">Simpan Jadwal</Button>
<Button variant="outline" size="sm">Batal</Button>
```

### 3. `Card`

Wadah konten dengan latar putih (`--color-surface`), border `1px solid var(--color-border)`, border radius `16px`, dan drop-shadow halus (`--shadow-md`).

```tsx
import { Card } from '../shared/ui';

<Card>
  <h5>Judul Kartu</h5>
  <p>Isi konten kartu...</p>
</Card>;
```

### 4. `Badge`

Indikator status atau label kategori dalam bentuk pil (`--radius-pill`):

- Tone: `primary`, `secondary`, `accent`, `success`, `danger`

```tsx
import { Badge } from '../shared/ui';

<Badge tone="success">Disetujui</Badge>
<Badge tone="accent">Menunggu Persetujuan</Badge>
```

### 5. `FormField` & `Input`

Komponen input formulir aksesibel yang menghubungkan `label` (`htmlFor={id}`), input (`hasError` opsional), dan pesan error (`role="alert"`).

```tsx
import { FormField, Input } from '../shared/ui';

<FormField id="room-code" label="Kode Ruangan" error={errors.code?.message}>
  <Input
    id="room-code"
    hasError={Boolean(errors.code)}
    placeholder="Contoh: B3.001"
  />
</FormField>;
```

### 6. `Alert`

Banner notifikasi dan umpan balik pengguna (`role="status"`):

- Tone: `info`, `success`, `warning`, `danger`

```tsx
import { Alert } from '../shared/ui';

<Alert tone="warning">Jadwal bertabrakan dengan mata kuliah lain!</Alert>;
```

### 7. Layout Shells (`MahasiswaLayout`, `MahasiswaSidebar`, `AdminLayout`)

- `MahasiswaLayout` + `MahasiswaSidebar`: Portal mahasiswa dengan sidebar kiri tetap, header dinamis per rute, dan area konten `<Outlet />`.
- `AdminLayout`: Workspace admin multi-halaman dengan sidebar yang mendukung mode lipat (_collapsible_) dan drawer mobile.

---

## 07. Visual Elements (Radius, Elevation & Motion)

### Border Radius

- `--radius-sm` (`8px`): Elemen form (`Input`, `Select`, `Textarea`).
- `--radius-md` (`12px`): Tombol (`Button`), banner notifikasi (`Alert`), item sidebar.
- `--radius-lg` (`16px`): Kartu (`Card`), dialog box, modal.
- `--radius-xl` (`24px`): Panel besar, hero banner, kontainer peta utama.
- `--radius-pill` (`9999px`): Status `Badge`, pill filter, stepper tag.

### Elevation (Box Shadow)

- `--shadow-xs`: `0 1px 2px rgba(11, 34, 57, 0.05)` — Kartu datar modern dengan border tipis.
- `--shadow-sm`: `0 2px 8px rgba(11, 34, 57, 0.06)` — Elemen dengan pemisah halus.
- `--shadow-md`: `0 8px 24px rgba(11, 34, 57, 0.08)` — Kartu standar dan dropdown menu.
- `--shadow-lg`: `0 16px 40px rgba(1, 1, 183, 0.12)` — Modal, popover, dan elemen fokus mengapung.

### Transisi

- `--transition-fast`: `150ms cubic-bezier(0.2, 0.8, 0.2, 1)` — Untuk _hover_, _focus_, dan _active state_.
- `--transition-base`: `220ms cubic-bezier(0.2, 0.8, 0.2, 1)` — Untuk perpindahan langkah wizard dan seleksi peta.

---

## 08. Stack Library Resmi & Terpasang

Seluruh library berikut sudah terpasang di `FE/package.json` dan siap dipakai langsung:

| Kategori                  | Library Terpasang                                                              | Peran di FRIDAY                              |
| ------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------- |
| **Core & Build**          | React 19 + TypeScript + Vite                                                   | Pondasi SPA dengan strict TypeScript         |
| **Fonts (Offline)**       | `@fontsource/lexend`, `@fontsource/plus-jakarta-sans`                          | Bundel lokal `.woff2` tanpa CDN              |
| **Icons**                 | `lucide-react`                                                                 | Seluruh ikon UI stroke-based yang konsisten  |
| **Primitives / Dialog**   | `@radix-ui/react-dialog`, `tabs`, `select`, `dropdown-menu`, `navigation-menu` | Modal, tabs, select aksesibel (WAI-ARIA)     |
| **Animation**             | `motion` (`motion/react`)                                                      | Transisi antar-step & interaksi mikro halus  |
| **Routing**               | `react-router` (Declarative Mode)                                              | Navigasi Portal Mahasiswa & Admin            |
| **API & Server State**    | `axios` + `@tanstack/react-query`                                              | Komunikasi REST API & caching state server   |
| **Forms & Validation**    | `react-hook-form` + `zod` + `@hookform/resolvers`                              | Validasi skema form tanpa re-render berlebih |
| **Data Tables & Charts**  | `@tanstack/react-table` + `recharts`                                           | Tabel data kompleks & grafik dashboard       |
| **Notifications & Dates** | `sonner` + `date-fns`                                                          | Toast feedback & utilitas format tanggal     |
| **Class Helper**          | `clsx`                                                                         | Penggabungan class CSS kondisional           |
| **Testing**               | `vitest` + `@testing-library/react` + `@playwright/test`                       | Unit testing & E2E testing                   |

---

## 09. Aturan Penggunaan & Kompatibilitas

1. **Arah Ketergantungan (_Dependency Flow_):**
   - `app -> features -> shared`. Modul di `src/shared/` dilarang mengimpor dari `src/features/` atau `src/app/`.
2. **Kustomisasi & Ekstensi:**
   - Gunakan token CSS dari `tokens.css` serta prop `className`/`style` pada komponen shared.
   - Jangan mengubah nilai token inti (`--color-primary`, dll.) di tingkat lokal komponen fitur.
3. **Pratinjau Langsung (_Showcase_):**
   - Jalankan `npm run dev` pada direktori `FE/` dan buka `/design-system` untuk melihat katalog warna, tipografi, dan komponen UI.
