import {
  Bell,
  Building2,
  HelpCircle,
  History,
  LayoutGrid,
  LogOut,
  Package,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { Link, NavLink } from 'react-router';

export interface MahasiswaSidebarProps {
  onLogout?: () => void;
}

interface SidebarNavItem {
  to: string;
  label: string;
  Icon: LucideIcon;
  end?: boolean;
  badge?: string;
}

const NAV_ITEMS: readonly SidebarNavItem[] = [
  {
    to: '/',
    label: 'Dashboard',
    Icon: LayoutGrid,
    end: true,
  },
  {
    to: '/peminjaman-barang',
    label: 'Peminjaman Barang',
    Icon: Package,
  },
  {
    to: '/peminjaman-ruangan',
    label: 'Peminjaman Ruangan',
    Icon: Building2,
  },
  {
    to: '/riwayat-peminjaman',
    label: 'Riwayat Peminjaman',
    Icon: History,
  },
  {
    to: '/notifikasi',
    label: 'Notifikasi/Log Aktivitas',
    Icon: Bell,
    badge: '3',
  },
  {
    to: '/pengaturan-akun',
    label: 'Pengaturan Akun',
    Icon: Settings,
  },
];

export function MahasiswaSidebar({ onLogout }: MahasiswaSidebarProps) {
  return (
    <aside className="mhs-sidebar" aria-label="Sidebar Navigasi Mahasiswa">
      <div className="mhs-sidebar__top">
        {/* Brand Header */}
        <Link to="/" className="mhs-sidebar__brand">
          <div className="mhs-sidebar__logo-box" aria-hidden="true">
            F
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
          {NAV_ITEMS.map(({ to, label, Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `mhs-sidebar__nav-item ${isActive ? 'mhs-sidebar__nav-item--active' : ''}`
              }
            >
              <span className="mhs-sidebar__nav-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.9} />
              </span>
              <span className="mhs-sidebar__nav-label">{label}</span>
              {badge && <span className="mhs-sidebar__badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mhs-sidebar__bottom">
        {/* Help Card */}
        <div className="mhs-help-card">
          <div className="mhs-help-card__icon" aria-hidden="true">
            <HelpCircle size={16} strokeWidth={2} />
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
          <LogOut size={18} strokeWidth={1.9} aria-hidden="true" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
