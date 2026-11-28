import { Link, Navigate, Route, Routes, useLocation } from 'react-router';
import { LoginPage } from '../features/auth';
import { DaftarMataKuliahPage } from '../features/daftar-mata-kuliah';
import { DashboardPage } from '../features/dashboard';
import { DesignSystemPage } from '../features/design-system';
import { KelolaDosenPage } from '../features/dosen';
import { FacilitiesPage } from '../features/facilities';
import { IntegratorPage } from '../features/integrator';
import { JadwalMatriksPage } from '../features/jadwal-matriks';
import { KetersediaanDosenPage } from '../features/ketersediaan-dosen';
import { LoansPage } from '../features/loans';
import {
  MahasiswaDashboardPage,
  NotifikasiAktivitasPage,
  PeminjamanBarangPage,
  PeminjamanRuanganPage,
  PengaturanAkunPage,
  RiwayatPeminjamanPage,
} from '../features/mahasiswa';
import { MindMappingPage } from '../features/mind-mapping';
import {
  ReferensiRuanganPage,
  SettingWaktuPage,
} from '../features/pengaturan-waktu';
import { SchedulingPage } from '../features/scheduling';
import { JadwalProvider } from '../shared/jadwal';
import { AdminLayout, Button, MahasiswaLayout, Navbar } from '../shared/ui';

export function App() {
  const location = useLocation();

  // Portal Mahasiswa menampilkan layout sidebar mandiri (light theme 1440w) tanpa Navbar ganda
  const isStudentRoute =
    location.pathname === '/' ||
    location.pathname === '/peminjaman-barang' ||
    location.pathname === '/peminjaman-ruangan' ||
    location.pathname === '/riwayat-peminjaman' ||
    location.pathname === '/notifikasi' ||
    location.pathname === '/pengaturan-akun';

  return (
    <JadwalProvider>
      {!isStudentRoute && (
        <Navbar
          brand={
            <Link
              to="/"
              style={{
                color: 'var(--color-ink-inverse)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.25rem',
                letterSpacing: '-0.02em',
                textDecoration: 'none',
              }}
            >
              FRIDAY
            </Link>
          }
          actions={
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link to="/admin/dosen">
                <Button size="sm" variant="secondary">
                  Area Admin Jadwal
                </Button>
              </Link>
              <Link to="/design-system">
                <Button size="sm" variant="accent">
                  Design System
                </Button>
              </Link>
            </div>
          }
        />
      )}

      <Routes>
        {/* Tampilan Mahasiswa (Default saat aplikasi dibuka - Sesuai Mockup 1440w Light) */}
        <Route element={<MahasiswaLayout />}>
          <Route index element={<MahasiswaDashboardPage />} />
          <Route path="peminjaman-barang" element={<PeminjamanBarangPage />} />
          <Route
            path="peminjaman-ruangan"
            element={<PeminjamanRuanganPage />}
          />
          <Route
            path="riwayat-peminjaman"
            element={<RiwayatPeminjamanPage />}
          />
          <Route path="notifikasi" element={<NotifikasiAktivitasPage />} />
          <Route path="pengaturan-akun" element={<PengaturanAkunPage />} />
        </Route>

        {/* Multi-page Admin Workspace with Left Sidebar (PRD v1.3 Section 3B) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dosen" replace />} />
          <Route path="dosen" element={<KelolaDosenPage />} />
          <Route
            path="dosen/ketersediaan"
            element={<KetersediaanDosenPage />}
          />
          <Route path="integrator" element={<IntegratorPage />} />
          <Route path="jadwal/matriks" element={<JadwalMatriksPage />} />
          <Route path="daftar-mata-kuliah" element={<DaftarMataKuliahPage />} />
          <Route path="pengaturan/waktu" element={<SettingWaktuPage />} />
          <Route path="pengaturan/ruangan" element={<ReferensiRuanganPage />} />
        </Route>

        <Route
          path="/login"
          element={
            <main>
              <LoginPage />
            </main>
          }
        />
        <Route
          path="/dashboard"
          element={
            <main>
              <DashboardPage />
            </main>
          }
        />
        <Route
          path="/loans"
          element={
            <main>
              <LoansPage />
            </main>
          }
        />
        <Route
          path="/facilities"
          element={
            <main>
              <FacilitiesPage />
            </main>
          }
        />
        <Route
          path="/scheduling"
          element={
            <main>
              <SchedulingPage />
            </main>
          }
        />
        <Route
          path="/mind-mapping"
          element={
            <main>
              <MindMappingPage />
            </main>
          }
        />
        <Route
          path="/design-system"
          element={
            <main>
              <DesignSystemPage />
            </main>
          }
        />
        <Route
          path="*"
          element={
            <main>
              <h1>Page not found</h1>
              <Link to="/">Return home</Link>
            </main>
          }
        />
      </Routes>
    </JadwalProvider>
  );
}
