import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { useJadwalStore } from '../jadwal';
import { Badge } from './Badge';
import { Button } from './Button';

export function AdminLayout() {
  const location = useLocation();
  const { pendingDosenCourses, parkedCourses } = useJadwalStore();

  const isMatrixPage = location.pathname.startsWith('/admin/jadwal/matriks');
  const [collapseOverrides, setCollapseOverrides] = useState<
    Record<string, boolean>
  >({});
  const [drawerOpenPath, setDrawerOpenPath] = useState<string | null>(null);

  // PRD Section 3B: Auto-collapse sidebar when entering /admin/jadwal/matriks
  const collapsed = collapseOverrides[location.pathname] ?? isMatrixPage;
  const mobileDrawerOpen = drawerOpenPath === location.pathname;

  const pendingDosenCount = pendingDosenCourses.length;
  const parkedCount = parkedCourses.length;

  const isActive = (path: string) => location.pathname === path;

  function handleToggleCollapse() {
    setCollapseOverrides((prev) => ({
      ...prev,
      [location.pathname]: !collapsed,
    }));
  }

  function handleToggleMobileDrawer() {
    setDrawerOpenPath((prev) =>
      prev === location.pathname ? null : location.pathname,
    );
  }

  return (
    <div className="ds-admin-layout">
      <aside
        aria-label="Sidebar Navigasi Admin"
        className={`ds-sidebar ${collapsed ? 'ds-sidebar--collapsed' : ''} ${
          mobileDrawerOpen ? 'ds-sidebar--drawer-open' : ''
        }`.trim()}
      >
        <div>
          <div className="ds-sidebar__header">
            {!collapsed && (
              <div>
                <Badge tone="primary">Admin Akademik</Badge>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    marginTop: '0.25rem',
                    color: 'var(--color-ink-primary)',
                  }}
                >
                  Jadwal 2023/2024
                </div>
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              aria-label={collapsed ? 'Buka Sidebar' : 'Lipat Sidebar'}
              title={collapsed ? 'Buka Sidebar' : 'Lipat Sidebar'}
              onClick={handleToggleCollapse}
            >
              {collapsed ? '»' : '«'}
            </Button>
          </div>

          {/* Grup 1: Data Dosen */}
          <div className="ds-sidebar__group">
            {!collapsed && (
              <div className="ds-sidebar__group-title">Data Dosen</div>
            )}
            <Link
              to="/admin/dosen"
              title="Kelola Dosen"
              className={`ds-sidebar__link ${
                isActive('/admin/dosen') ? 'ds-sidebar__link--active' : ''
              }`}
            >
              <span className="ds-sidebar__link-main">
                <span className="ds-sidebar__icon">DS</span>
                {!collapsed && <span>Kelola Dosen</span>}
              </span>
            </Link>

            <Link
              to="/admin/dosen/ketersediaan"
              title="Ketersediaan Dosen"
              className={`ds-sidebar__link ${
                isActive('/admin/dosen/ketersediaan')
                  ? 'ds-sidebar__link--active'
                  : ''
              }`}
            >
              <span className="ds-sidebar__link-main">
                <span className="ds-sidebar__icon">KT</span>
                {!collapsed && <span>Ketersediaan Dosen</span>}
              </span>
            </Link>
          </div>

          {/* Grup 2: Penjadwalan */}
          <div className="ds-sidebar__group">
            {!collapsed && (
              <div className="ds-sidebar__group-title">Penjadwalan</div>
            )}
            <Link
              to="/admin/integrator"
              title="Integrator & Generator"
              className={`ds-sidebar__link ${
                isActive('/admin/integrator') ? 'ds-sidebar__link--active' : ''
              }`}
            >
              <span className="ds-sidebar__link-main">
                <span className="ds-sidebar__icon">IG</span>
                {!collapsed && <span>Integrator &amp; Generator</span>}
              </span>
              {pendingDosenCount > 0 && (
                <span
                  className="ds-sidebar__badge ds-sidebar__badge--danger"
                  title={`${pendingDosenCount} baris menunggu pemetaan dosen`}
                >
                  {pendingDosenCount}
                </span>
              )}
            </Link>

            <Link
              to="/admin/jadwal/matriks"
              title="Matriks Mind Mapping"
              className={`ds-sidebar__link ${
                isActive('/admin/jadwal/matriks')
                  ? 'ds-sidebar__link--active'
                  : ''
              }`}
            >
              <span className="ds-sidebar__link-main">
                <span className="ds-sidebar__icon">MM</span>
                {!collapsed && <span>Matriks Mind Mapping</span>}
              </span>
              {parkedCount > 0 && (
                <span
                  className="ds-sidebar__badge ds-sidebar__badge--accent"
                  title={`${parkedCount} mata kuliah berada di panel parkir`}
                >
                  {parkedCount}
                </span>
              )}
            </Link>
          </div>

          {/* Menu Mandiri: Daftar Mata Kuliah (dipisahkan dengan divider) */}
          <div className="ds-sidebar__divider" role="separator" />
          <div className="ds-sidebar__group">
            <Link
              to="/admin/daftar-mata-kuliah"
              title="Daftar Mata Kuliah"
              className={`ds-sidebar__link ${
                isActive('/admin/daftar-mata-kuliah')
                  ? 'ds-sidebar__link--active'
                  : ''
              }`}
            >
              <span className="ds-sidebar__link-main">
                <span className="ds-sidebar__icon">MK</span>
                {!collapsed && <span>Daftar Mata Kuliah</span>}
              </span>
            </Link>
          </div>
          <div className="ds-sidebar__divider" role="separator" />

          {/* Grup 4: Pengaturan */}
          <div className="ds-sidebar__group">
            {!collapsed && (
              <div className="ds-sidebar__group-title">Pengaturan</div>
            )}
            <Link
              to="/admin/pengaturan/waktu"
              title="Setting Waktu"
              className={`ds-sidebar__link ${
                isActive('/admin/pengaturan/waktu')
                  ? 'ds-sidebar__link--active'
                  : ''
              }`}
            >
              <span className="ds-sidebar__link-main">
                <span className="ds-sidebar__icon">SW</span>
                {!collapsed && <span>Setting Waktu</span>}
              </span>
            </Link>

            <Link
              to="/admin/pengaturan/ruangan"
              title="Referensi Ruangan"
              className={`ds-sidebar__link ${
                isActive('/admin/pengaturan/ruangan')
                  ? 'ds-sidebar__link--active'
                  : ''
              }`}
            >
              <span className="ds-sidebar__link-main">
                <span className="ds-sidebar__icon">37</span>
                {!collapsed && <span>Referensi Ruangan</span>}
              </span>
            </Link>
          </div>
        </div>

        {!collapsed && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-muted)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-body-sm-size)',
            }}
          >
            <strong>UPI Kampus Cibiru</strong>
            <div style={{ color: 'var(--color-ink-muted)', marginTop: '2px' }}>
              37 Ruangan • Bebas Bentrok
            </div>
          </div>
        )}
      </aside>

      <div className="ds-admin-workspace">
        <div
          className="ds-mobile-drawer-toggle"
          style={{ marginBottom: '1rem' }}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleMobileDrawer}
          >
            {mobileDrawerOpen ? 'Tutup Menu Navigasi' : '☰ Menu Admin'}
          </Button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
