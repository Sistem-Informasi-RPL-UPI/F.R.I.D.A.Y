# 🚀 F.R.I.D.A.Y Frontend

Frontend SPA untuk Sistem Informasi Akademik, Peminjaman Fasilitas, & Mind Mapping Jadwal UPI Kampus Cibiru.

Dibangun dengan: **React 19**, **TypeScript**, **Vite**, dan **Tailwind CSS**.

🔗 **Referensi Desain:** [DESIGN.md](../docs/DESIGN.md)

---

## 🛠 Prasyarat & Lingkungan

Pastikan lingkungan pengembangan Anda sesuai dengan spesifikasi berikut:

- **Node.js**: `^24.22.1 || ^26.0.0`
- **npm**: `>=11 <13`
- **Git**

---

## 📂 Struktur Direktori & Arsitektur

Struktur folder mengikuti pola **Feature-Sliced Design (FSD)** sederhana:

```text
src/
├── app/          # Konfigurasi utama: Router, App root, Providers
├── features/     # Fitur bisnis: auth, loans, dashboard, dll.
└── shared/       # Kode reusable: API client, UI components, utilities
```

### ⚠️ Aturan Ketergantungan (Dependency Rule)

**`app` → `features` → `shared`**

- Komponen di `shared` **DILARANG** mengimpor dari `features` atau `app`.
- Komponen di `features` **DILARANG** mengimpor dari `app`.
- Akses antar fitur dilakukan melalui _entry point_ publik yang ditentukan.

---

## 📦 Dependencies Utama

| Kategori          | Library                            | Kegunaan                    |
| :---------------- | :--------------------------------- | :-------------------------- |
| **Core**          | `react`, `react-dom`               | Framework UI utama          |
| **Routing**       | `react-router`                     | Pengelola navigasi          |
| **Data Fetching** | `@tanstack/react-query`            | Server state (GET/POST/etc) |
| **API**           | `axios`                            | Instance API terpusat       |
| **Form**          | `react-hook-form`, `zod`           | Validasi & form state       |
| **UI**            | `@radix-ui/react-*`                | Komponen aksesibel          |
| **Utils**         | `date-fns`, `clsx`, `lucide-react` | Helper fungsi               |
| **Visual**        | `recharts`, `@xyflow/react`        | Chart & Mind Mapping        |
| **Feedback**      | `sonner`                           | Toast notifications         |

---

## ⚙️ Workflow Tim

### A. Setup Awal (Setelah `git clone`)

1. `cd FE`
2. `npm install`
3. Salin `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```
4. Pastikan `VITE_API_URL` terkonfigurasi (default: `http://localhost:8000/api`).
5. `npm run dev` untuk memulai.
6. Akses `/design-system` untuk melihat katalog komponen yang tersedia.

### B. Membuat Halaman / Fitur Baru

1. Buat folder di `src/features/<nama-fitur>/`.
2. Gunakan komponen dari `src/shared/ui/` (dilarang _hardcode_ style/warna).
3. **Contoh Pemakaian:**
   ```tsx
   import { Card, Button } from '@/shared/ui';
   import { toast } from 'sonner';

   export function MyFeature() {
     return (
       <Card>
         <Button onClick={() => toast.success('Berhasil!')}>Klik</Button>
       </Card>
     );
   }
   ```
4. Daftarkan rute baru di `src/app/`.

### C. Mengakses Laravel REST API

Wajib menggunakan instance `apiClient` dari `src/shared/api/axios.ts`.

**Contoh `useQuery`:**

```tsx
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/axios';

export function useData() {
  return useQuery({
    queryKey: ['data'],
    queryFn: () => apiClient.get('/endpoint').then((res) => res.data),
  });
}
```

### D. Mengelola Dependency Baru

1. **Verifikasi**: Cek tabel Dependencies di atas. Hindari duplikasi library.
2. **Install**: Jalankan `npm install <nama-package>`.
3. **Komitmen**: Commit `package.json` dan `package-lock.json` bersamaan.
4. **Troubleshooting (Safe Reset)**:
   ```bash
   rm -rf node_modules && npm ci
   ```

### E. Checklist Sebelum PR

- [ ] `npm run check` (typecheck, lint, format, unit test) lulus 100%.
- [ ] `npm run test:e2e` lulus (tanpa request eksternal).
- [ ] Tidak ada _hardcode_ warna HEX (gunakan `tokens.css`).
- [ ] Dokumentasi komponen baru (jika ada) di `/design-system`.

---

## 📜 Daftar Perintah (NPM Scripts)

| Script             | Fungsi                                         |
| :----------------- | :--------------------------------------------- |
| `npm run dev`      | Jalankan server pengembangan                   |
| `npm run check`    | Jalankan full check (type, lint, format, test) |
| `npm run build`    | Build aplikasi untuk produksi                  |
| `npm run preview`  | Preview hasil build                            |
| `npm run test`     | Unit test (Vitest)                             |
| `npm run test:e2e` | End-to-End test (Playwright)                   |
