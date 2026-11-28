import { Link, NavLink } from 'react-router';

export interface MahasiswaSidebarProps {
  onLogout?: () => void;
}

export function MahasiswaSidebar({ onLogout }: MahasiswaSidebarProps) {
  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      iconClass: 'bi bi-grid-fill',
      end: true,
    },
    {
      to: '/peminjaman-barang',
      label: 'Peminjaman Barang',
      iconClass: 'bi bi-box-seam',
    },
    {
      to: '/peminjaman-ruangan',
      label: 'Peminjaman Ruangan',
      iconClass: 'bi bi-building',
    },
    {
      to: '/riwayat-peminjaman',
      label: 'Riwayat Peminjaman',
      iconClass: 'bi bi-clock-history',
    },
    {
      to: '/notifikasi',
      label: 'Notifikasi/Log Aktivitas',
      iconClass: 'bi bi-bell',
      badge: '3',
    },
    {
      to: '/pengaturan-akun',
      label: 'Pengaturan akun',
      iconClass: 'bi bi-gear',
    },
  ];

  return (
    <aside className="mhs-sidebar" aria-label="Sidebar Navigasi Mahasiswa">
      <div className="mhs-sidebar__top">
        {/* Brand Header */}
        <Link to="/" className="mhs-sidebar__brand">
          <div className="mhs-sidebar__logo-box" aria-hidden="true">
            R
          </div>
          <div className="mhs-sidebar__brand-text">
            <h1 className="mhs-sidebar__brand-title">FRIDAY</h1>
            <p className="mhs-sidebar__brand-subtitle">
              Rekayasa Perangkat Lunak
            </p>
          </div>
        </Link>

        {/* Menu Section */}
        <div className="mhs-sidebar__menu-label">MENU UTAMA</div>
        <nav className="mhs-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `mhs-sidebar__nav-item ${isActive ? 'mhs-sidebar__nav-item--active' : ''}`
              }
            >
              <span className="mhs-sidebar__nav-icon">
                <i className={item.iconClass} />
              </span>
              <span className="mhs-sidebar__nav-label">{item.label}</span>
              {item.badge && (
                <span className="mhs-sidebar__badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mhs-sidebar__bottom">
        {/* Help Card */}
        <div className="mhs-help-card">
          <div className="mhs-help-card__icon" aria-hidden="true">
            <i className="bi bi-question-lg" />
          </div>
          <div className="mhs-help-card__title">Butuh bantuan?</div>
          <div className="mhs-help-card__desc">
            Hubungi pusat layanan akademik.
          </div>
          <button
            type="button"
            className="mhs-help-card__btn"
            onClick={() =>
              alert('Pusat Bantuan Akademik RPL: hubungi helpdesk@rpl.upi.edu')
            }
          >
            Pusat Bantuan
          </button>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          className="mhs-sidebar__logout-btn"
          onClick={onLogout ?? (() => alert('Sesi Anda telah diakhiri.'))}
        >
          <i className="bi bi-box-arrow-right" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
