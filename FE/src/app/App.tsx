import { Link, Navigate, Route, Routes } from 'react-router';
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
import { MindMappingPage } from '../features/mind-mapping';
import {
  ReferensiRuanganPage,
  SettingWaktuPage,
} from '../features/pengaturan-waktu';
import { SchedulingPage } from '../features/scheduling';
import { JadwalProvider } from '../shared/jadwal';
import { AdminLayout, Badge, Button, Card, Navbar } from '../shared/ui';

export function App() {
  return (
    <JadwalProvider>
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
      >
        {/* Navigasi utama fitur penjadwalan berada pada Sidebar kiri AdminLayout (/admin/...) */}
      </Navbar>

      <Routes>
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

        {/* Public / Root & Existing Foundation Routes */}
        <Route
          path="/"
          element={
            <main>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                }}
              >
                <div>
                  <Badge tone="primary">
                    UPI Kampus Cibiru • Mind Mapping Jadwal 2023/2024 (v1.3)
                  </Badge>
                  <h1 style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                    FRIDAY
                  </h1>
                  <p>The independent React application is ready.</p>
                  <p style={{ color: 'var(--color-ink-secondary)' }}>
                    Sistem Penyusunan &amp; Mind Mapping Jadwal Perkuliahan 37
                    Ruangan Bebas Bentrok — Laravel 13 REST API + React 19 SPA.
                  </p>
                </div>

                <div className="ds-grid">
                  <div className="ds-col-4">
                    <Card>
                      <h5>1. Data &amp; Ketersediaan Dosen</h5>
                      <p style={{ color: 'var(--color-ink-secondary)' }}>
                        Kelola master kode dosen unik, impor berkas dosen, dan
                        atur preferensi hari/jam mengajar.
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to="/admin/dosen">
                          <Button variant="primary" size="sm">
                            Kelola Dosen
                          </Button>
                        </Link>
                        <Link to="/admin/dosen/ketersediaan">
                          <Button variant="outline" size="sm">
                            Ketersediaan
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </div>

                  <div className="ds-col-4">
                    <Card>
                      <h5>2. Integrator &amp; Generator</h5>
                      <p style={{ color: 'var(--color-ink-secondary)' }}>
                        Unduh template Excel Kaprodi, impor multi-berkas, pecah
                        kelas gabungan, dan jalankan Generator otomatis.
                      </p>
                      <Link to="/admin/integrator">
                        <Button variant="primary" size="sm">
                          Buka Integrator &amp; Generator
                        </Button>
                      </Link>
                    </Card>
                  </div>

                  <div className="ds-col-4">
                    <Card>
                      <h5>3. Matriks 37 Ruangan &amp; Rekap</h5>
                      <p style={{ color: 'var(--color-ink-secondary)' }}>
                        Rapikan jadwal lewat drag &amp; drop, swap, pecah di jam
                        istirahat, tinjau Daftar MK, dan ekspor offline.
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to="/admin/jadwal/matriks">
                          <Button variant="primary" size="sm">
                            Matriks 37 Ruangan
                          </Button>
                        </Link>
                        <Link to="/admin/daftar-mata-kuliah">
                          <Button variant="outline" size="sm">
                            Daftar MK
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </main>
          }
        />
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
