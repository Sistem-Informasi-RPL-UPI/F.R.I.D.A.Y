import { ArrowUp, Bell, ChevronRight } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';
import { MahasiswaSidebar } from './MahasiswaSidebar';

export function MahasiswaLayout() {
  const location = useLocation();

  // Dynamic header titles based on pathname
  const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/peminjaman-barang': 'Peminjaman Barang',
    '/peminjaman-ruangan': 'Peminjaman Ruangan',
    '/riwayat-peminjaman': 'Riwayat Peminjaman',
    '/notifikasi': 'Notifikasi & Log Aktivitas',
    '/pengaturan-akun': 'Pengaturan Akun',
  };

  const currentTitle = pageTitles[location.pathname] ?? 'Portal Mahasiswa';

  return (
    <div className="mhs-container">
      <MahasiswaSidebar />

      <div className="mhs-main-area">
        {/* Top Header / Navbar */}
        <header className="mhs-header">
          <div className="mhs-header__left">
            <span className="mhs-header__subtitle">Sistem Informasi RPL</span>
            <h2 className="mhs-header__title">{currentTitle}</h2>
          </div>

          <div className="mhs-header__right">
            {/* Shortcut switch to admin for convenience */}
            <Link to="/admin/dosen" className="mhs-header__admin-link">
              <span className="mhs-header__admin-badge">Area Admin Jadwal</span>
            </Link>

            {/* Notification bell button */}
            <button
              type="button"
              className="mhs-header__icon-btn"
              aria-label="Notifikasi"
              onClick={() => alert('Tidak ada notifikasi baru.')}
            >
              <Bell size={18} strokeWidth={1.9} aria-hidden="true" />
              <span className="mhs-header__icon-dot" />
            </button>

            {/* User Profile Pill */}
            <div className="mhs-header__profile">
              <div className="mhs-header__avatar" aria-hidden="true">
                AR
              </div>
              <div className="mhs-header__user-info">
                <span className="mhs-header__user-name">Alya Rahmadani</span>
                <span className="mhs-header__user-meta">
                  Mahasiswa - 2201024
                </span>
              </div>
              <ChevronRight
                size={14}
                strokeWidth={2}
                className="mhs-header__chevron"
                aria-hidden="true"
              />
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="mhs-content">
          <Outlet />
        </main>

        {/* Bottom Floating Action Shortcut */}
        <button
          type="button"
          className="mhs-floating-btn"
          aria-label="Kembali ke atas"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Scroll ke atas"
        >
          <ArrowUp size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
