import { Link, Route, Routes } from 'react-router';
import { LoginPage } from '../features/auth';
import { DashboardPage } from '../features/dashboard';
import { DesignSystemPage } from '../features/design-system';
import { FacilitiesPage } from '../features/facilities';
import { LoansPage } from '../features/loans';
import { MindMappingPage } from '../features/mind-mapping';
import { SchedulingPage } from '../features/scheduling';
import { Navbar } from '../shared/ui';

export function App() {
  return (
    <>
      <Navbar
        brand={
          <Link
            to="/"
            style={{
              color: '#ffffff',
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
      >
        {/* Isian navigasi dikosongkan sementara sesuai arahan */}
      </Navbar>

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1>FRIDAY</h1>
                <p>The independent React application is ready.</p>
                <p>
                  Sistem Informasi Akademik, Peminjaman Ruangan &amp; Barang,
                  serta Mind Mapping Jadwal UPI Kampus Cibiru.
                </p>
              </>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/scheduling" element={<SchedulingPage />} />
          <Route path="/mind-mapping" element={<MindMappingPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route
            path="*"
            element={
              <>
                <h1>Page not found</h1>
                <Link to="/">Return home</Link>
              </>
            }
          />
        </Routes>
      </main>
    </>
  );
}
