# Panduan UI/UX & Implementasi Frontend (`DESIGN.md`)

Dokumen ini adalah panduan praktis desain dan rekayasa antarmuka (UI/UX) untuk Frontend **FRIDAY** (**React 19 + TypeScript + Vite**) yang terhubung dengan **Laravel REST API**. Panduan ini melengkapi referensi token & komponen pada [DesignSistem.md](./DesignSistem.md) dan [tokens.css](./tokens.css).

---

## 1. Tech Stack & Aturan Library

Gunakan hanya library resmi yang sudah terpasang di `FE/package.json`. **Dilarang** menambahkan framework CSS/UI ganda (seperti Bootstrap CSS, Bootstrap Icons CDN, MUI, atau Tailwind terpisah) maupun memuat aset dari CDN eksternal agar bundle ringan dan uji Playwright (`externalRequests === []`) selalu lulus.

| Kategori                  | Stack Resmi FRIDAY                                                                  | Kegunaan Utama                                          |
| ------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Core & Build**          | React 19 + TypeScript + Vite                                                        | Pondasi SPA dengan strict type checking                 |
| **Design Tokens & CSS**   | CSS Custom Properties (`tokens.css`) + CSS Modular (`.ds-*`, `.mhs-*`, feature CSS) | Konsistensi warna, tipografi, grid, spasi, dan state    |
| **UI Primitives**         | `src/shared/ui` + `@radix-ui/react-*` (`dialog`, `select`, `tabs`, `dropdown-menu`) | Komponen inti & overlay aksesibel WAI-ARIA              |
| **Icons**                 | `lucide-react`                                                                      | Seluruh ikon UI stroke-based (100% offline/tree-shaken) |
| **Animation**             | `motion/react`                                                                      | Transisi antar-langkah dan interaksi mikro halus        |
| **Routing**               | `react-router` (Declarative Mode)                                                   | Navigasi Portal Mahasiswa & Workspace Admin             |
| **API & Server State**    | `axios` (`src/shared/api/client.ts`) + `@tanstack/react-query`                      | Komunikasi ke Laravel REST API, caching, loading state  |
| **Forms & Validation**    | `react-hook-form` + `zod` + `@hookform/resolvers`                                   | Manajemen form dan validasi skema terstruktur           |
| **Data & Visualisasi**    | `@tanstack/react-table` + `recharts`                                                | Tabel data kompleks & grafik analitik                   |
| **Notifications & Dates** | `sonner` + `date-fns`                                                               | Toast notification & format tanggal/waktu               |
| **Class Utility**         | `clsx`                                                                              | Penggabungan nama class CSS kondisional                 |
| **Testing**               | `vitest` + `@testing-library/react` + `@playwright/test`                            | Unit test terkolokasi & End-to-End testing              |

---

## 2. Penggunaan Warna & Semantic Tokens

Semua warna wajib merujuk pada variabel CSS di [tokens.css](./tokens.css) agar konsisten di seluruh modul. **Dilarang menulis nilai HEX langsung** di file `.tsx` atau `.css` pada folder `src/features/*`.

### Pemetaan Peran Warna

| Peran UI                   | Token CSS (`tokens.css`)                                                           | Nilai Referensi                   | Kapan Digunakan                                          |
| -------------------------- | ---------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------- |
| **Primary CTA & Brand**    | `--color-primary`, `--color-primary-hover`                                         | `#0101B7`                         | Tombol aksi utama, header brand, gedung aktif terpilih   |
| **Primary Surface Tint**   | `--color-primary-soft`, `--color-primary-tint`                                     | `#E6E8FF`, `#F4F6FF`              | Highlight menu aktif, hover kartu/peta, badge kategori   |
| **Secondary & Info Brand** | `--color-secondary`, `--color-secondary-soft`                                      | `#8DCCF1`, `#E5F5FD`              | Aksi sekunder, badge informasi gedung/jadwal             |
| **Accent Highlight**       | `--color-accent`, `--color-accent-soft`                                            | `#FFD166`, `#FFF6DB`              | Penanda fokus terpilih, badge menunggu persetujuan       |
| **Page & Surface**         | `--color-neutral`, `--color-surface`, `--color-surface-muted`                      | `#F2F7FF`, `#FFFFFF`, `#F8FAFF`   | Background aplikasi, kartu, modal, header tabel          |
| **Text Hierarchy**         | `--color-ink-primary`, `--color-ink-secondary`, `--color-ink-muted`                | `#0B2239`, `#475569`, `#64748B`   | Heading, isi paragraf, hint/placeholder/metadata         |
| **Borders**                | `--color-border`, `--color-border-strong`                                          | `#DCE6F5`, `#B8CAE6`              | Garis pemisah kartu, input, outline tombol               |
| **Status Semantik**        | `--color-success`, `--color-warning`, `--color-danger`, `--color-info` (+ `-soft`) | Hijau / Amber / Merah / Biru Info | Feedback tersedia, penuh/terjadwal, error validasi, info |

---

## 3. Hierarki Tipografi

Gunakan font lokal yang sudah terpasang (`@fontsource/lexend` dan `@fontsource/plus-jakarta-sans`):

- **Heading & Display (`var(--font-heading)` — Lexend):** Untuk judul halaman (`h2`/`h3`), nama gedung/ruangan utama, angka statistik, dan stepper title. Pertahankan hanya satu `<h1>` per rute aktif (`FRIDAY` di shell utama atau judul halaman standalone) demi aksesibilitas screen reader.
- **Body & Controls (`var(--font-body)` — Plus Jakarta Sans):** Untuk deskripsi, isi tabel, label form, dan tombol.
- **Kode & Referensi (`var(--font-mono)`):** Untuk kode ruangan (`B3.001`, `E2.005`), jam jadwal (`07:00 - 09:30`), NIM/NIP, dan nomor referensi peminjaman.

| Peran di Halaman                | Ukuran / Token                                    | Weight        | Contoh Penggunaan                          |
| ------------------------------- | ------------------------------------------------- | ------------- | ------------------------------------------ |
| **Judul Section / Page Header** | `--text-h5-size` – `--text-h4-size` (`24px–32px`) | `700`         | Header halaman Peminjaman Ruangan          |
| **Judul Kartu / Modal**         | `--text-h6-size` (`20px`) atau `1.1rem`           | `700` / `600` | Judul dialog pengajuan, nama gedung        |
| **Body Default**                | `--text-body-md-size` (`16px` / `0.95rem`)        | `400`–`500`   | Deskripsi fasilitas, isi tabel             |
| **Label Form & Tab**            | `--text-body-sm-size` (`13px`–`14px`)             | `600`         | Label input `FormField`, filter kategori   |
| **Caption & Metadata**          | `12px` (`0.75rem`)                                | `500`–`600`   | Hint tanggal, catatan jam, subtitle lantai |

---

## 4. Sistem Spacing, Grid & Responsivitas (Kelipatan 4px)

Seluruh `margin`, `padding`, dan `gap` harus mengikuti skala `--space-*` berbasis **4px** (`4, 8, 12, 16, 24, 32, 48px`):

- **Padding Area Konten Portal:** `20px–36px` pada desktop (`--space-6` / `--space-8`), `16px–20px` pada mobile (`--space-4`).
- **Padding Kartu:** `--space-6` (`24px`) pada desktop, `--space-4` (`16px`) pada layar kecil.
- **Jarak Antar Section:** `--space-6` (`24px`).
- **Jarak Antar Elemen Form / Kartu:** `--space-4` (`16px`).
- **Jarak Label dengan Input:** `--space-2` (`8px`).
- **Jarak Antar Tombol (Action Group):** `--space-2` (`8px`) atau `--space-3` (`12px`).
- **Breakpoints Standar:** Mobile (`< 640px` / uji di `375px`), Tablet (`<= 768px` / `<= 1024px`), Desktop (`1200px–1440px`). Pastikan tidak ada horizontal overflow yang tidak disengaja di `375px`.

---

## 5. Border Radius, Elevation & Gaya Visual (Clean Modern UI)

Utamakan **border tipis + kontras permukaan yang bersih** dibanding bayangan tebal:

- **Kartu & Panel Utama:** `border: 1px solid var(--color-border); background: var(--color-surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-xs);`
- **Panel Besar / Kontainer Denah:** `border-radius: var(--radius-xl);` (`24px`)
- **Tombol & Alert:** `border-radius: var(--radius-md);` (`12px`)
- **Input & Select:** `border-radius: var(--radius-sm);` (`8px`)
- **Badge & Pill Filter:** `border-radius: var(--radius-pill);` (`9999px`)
- **Modal & Dialog:** `border: 1px solid var(--color-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);`

---

## 6. Aturan Komponen, Alur Multi-Langkah & Peta Interaktif

1. **Buttons (`src/shared/ui/Button`):**
   - Idealnya maksimal **1 tombol `variant="primary"`** per kartu/layar/modal untuk aksi utama agar hirarki jelas.
   - Aksi batal/kembali gunakan `variant="outline"`.
   - Aksi destruktif gunakan `variant="danger"` disertai konfirmasi eksplisit.
2. **Icons (`lucide-react`):**
   - Ukuran ikon di tombol/teks: `size={16}` (`16px`).
   - Ukuran ikon navigasi sidebar/header kartu: `size={18}`–`20` (`18px–20px`).
   - Gunakan `strokeWidth={1.75}` atau `2` secara konsisten di seluruh fitur.
3. **Alur Multi-Langkah (Wizard / Stepper):**
   - Tampilkan **Stepper indikator** yang jelas di bagian atas (`1. Pilih Gedung → 2. Pilih Lantai → 3. Hasil Ruangan`) dengan status aktif, selesai (menyertakan nilai pilihan seperti `Gedung B`, `Lantai 3`), dan terkunci/belum dipilih.
   - Izinkan pengguna kembali ke langkah sebelumnya lewat Stepper maupun tombol `Ganti Gedung` / `Ganti Lantai`.
4. **Peta / Denah Interaktif & Aksesibilitas:**
   - Elemen interaktif di atas denah SVG wajib dapat dioperasikan via **mouse maupun keyboard** (`role="button"`, `tabIndex={0}`, `aria-pressed`, dukungan `Enter` & `Space`), dan selalu sediakan **daftar kartu sinkron (dual selector)** di sampingnya agar pengguna mobile/screen-reader tetap nyaman.
   - Bedakan secara visual dan tegas antara **area aktif yang dapat dipilih** (Gedung A, B, E dengan border tegas & badge) dan **landmark non-peminjaman** (Gedung C, D, F, Asrama, UKM, Mesjid, Lapangan dalam tampilan muted non-interaktif).
5. **Forms (`react-hook-form` + `zod`):**
   - Setiap formulir peminjaman wajib memiliki validasi `zod` (termasuk cek rentang jam `endTime > startTime` dan kapasitas peserta `<= room.capacity`) dengan pesan error `role="alert"` tepat di bawah field.
   - Tombol submit menampilkan spinner `Loader2` dan status `disabled` saat memproses pengajuan.
6. **Loading & Empty States:**
   - Gunakan state skeleton/loading saat memuat data API.
   - Jika lantai belum memiliki daftar ruangan atau filter tidak menemukan hasil, tampilkan _Empty State_ yang informatif (ikon + judul + penjelasan + tombol reset/kembali).
7. **Notifications (`sonner`) & Motion (`motion/react`):**
   - Gunakan `toast.success(...)` atau `toast.error(...)` untuk feedback aksi pengguna.
   - Jaga durasi transisi `motion/react` tetap singkat (`0.2s–0.3s`) dan hormati `@media (prefers-reduced-motion: reduce)`.

---

## 7. Do & Don't Tim Frontend

- **DO:** Cek komponen di `src/shared/ui/index.ts` sebelum membuat komponen primitif baru.
- **DO:** Gunakan `clsx` untuk menggabungkan class CSS kondisional.
- **DO:** Jaga arah import `app -> features -> shared`.
- **DO:** Uji halaman di viewport mobile (`375px`) dan desktop (`1440px`), serta pastikan tidak ada request eksternal.
- **DON'T:** Jangan menuliskan kode HEX statis di `src/features/*` atau mengimpor CSS/icon dari CDN luar.
- **DON'T:** Jangan menginstal library UI tambahan tanpa persetujuan tim.
