import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useJadwalStore } from '../jadwal';
import { Button } from './Button';

interface WorkflowStep {
  stepNumber: number;
  to: string;
  label: string;
  shortDesc: string;
  iconClass: string;
  badgeCount?: number;
}

const WIZARD_SCHEDULING_PATHS = [
  '/admin/integrator',
  '/admin/dosen/ketersediaan',
  '/admin/pengaturan/waktu',
  '/admin/pengaturan/ruangan',
  '/admin/jadwal/matriks',
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pendingDosenCourses, parkedCourses, dosenList, readyCourses } =
    useJadwalStore();

  const isMatrixPage = location.pathname.startsWith('/admin/jadwal/matriks');
  const isWizardSchedulingRoute = WIZARD_SCHEDULING_PATHS.some((p) =>
    location.pathname.startsWith(p),
  );

  const [collapseOverrides, setCollapseOverrides] = useState<
    Record<string, boolean>
  >({});

  // Auto-collapse sidebar on /admin/jadwal/matriks so the 37-room matrix stays wide
  const collapsed = collapseOverrides[location.pathname] ?? isMatrixPage;

  function handleToggleCollapse() {
    setCollapseOverrides((prev) => ({
      ...prev,
      [location.pathname]: !collapsed,
    }));
  }

  // 4-step scheduling wizard order: 1. Integrator -> 2. Ketersediaan -> 3. Setting Waktu -> 4. Matriks Mind Mapping
  const workflowSteps: WorkflowStep[] = [
    {
      stepNumber: 1,
      to: '/admin/integrator',
      label: 'Integrator & Generator',
      shortDesc: `${readyCourses.length} MK Antrean`,
      iconClass: 'bi bi-cpu-fill',
      badgeCount:
        pendingDosenCourses.length > 0 ? pendingDosenCourses.length : undefined,
    },
    {
      stepNumber: 2,
      to: '/admin/dosen/ketersediaan',
      label: 'Ketersediaan Dosen',
      shortDesc: 'Hari & Jam (07:00–17:00)',
      iconClass: 'bi bi-calendar2-check-fill',
    },
    {
      stepNumber: 3,
      to: '/admin/pengaturan/waktu',
      label: 'Setting Waktu',
      shortDesc: 'Durasi SKS & 37 Ruang',
      iconClass: 'bi bi-clock-history',
    },
    {
      stepNumber: 4,
      to: '/admin/jadwal/matriks',
      label: 'Matriks Mind Mapping',
      shortDesc: '37 Ruangan • Drag & Drop',
      iconClass: 'bi bi-grid-3x3-gap-fill',
      badgeCount: parkedCourses.length > 0 ? parkedCourses.length : undefined,
    },
  ];

  const currentStepIndex = workflowSteps.findIndex((s) =>
    s.to === '/admin/pengaturan/waktu'
      ? location.pathname.startsWith('/admin/pengaturan/')
      : location.pathname === s.to,
  );
  const activeStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const activeStep = workflowSteps[activeStepIndex] ?? workflowSteps[0]!;
  const prevStep =
    activeStepIndex > 0 ? workflowSteps[activeStepIndex - 1] : null;
  const nextStep =
    activeStepIndex < workflowSteps.length - 1
      ? workflowSteps[activeStepIndex + 1]
      : null;

  const isSettingsRoute = location.pathname.startsWith('/admin/pengaturan/');

  // Dedicated Admin Sidebar menus with Kelola Dosen and Daftar Mata Kuliah separated as standalone menus
  const adminSidebarMenus = [
    {
      to: '/admin/dashboard',
      label: 'Dashboard Admin',
      iconClass: 'bi bi-grid-fill',
      end: true,
    },
    {
      to: '/admin/integrator',
      label: 'Penjadwalan & Mind Mapping',
      iconClass: 'bi bi-calendar3-range-fill',
      forceActive: isWizardSchedulingRoute,
      badge:
        parkedCourses.length > 0 ? String(parkedCourses.length) : undefined,
    },
    {
      to: '/admin/dosen',
      label: 'Kelola Dosen',
      iconClass: 'bi bi-person-badge-fill',
      end: true,
      badge: dosenList.length > 0 ? String(dosenList.length) : undefined,
    },
    {
      to: '/admin/daftar-mata-kuliah',
      label: 'Daftar Mata Kuliah',
      iconClass: 'bi bi-journal-text',
      end: true,
      badge: readyCourses.length > 0 ? String(readyCourses.length) : undefined,
    },
    {
      to: '/admin/peminjaman-barang',
      label: 'Kelola Peminjaman Barang',
      iconClass: 'bi bi-box-seam',
      badge: '1',
    },
    {
      to: '/admin/peminjaman-ruangan',
      label: 'Kelola Peminjaman Ruangan',
      iconClass: 'bi bi-building',
      badge: '1',
    },
    {
      to: '/admin/riwayat-layanan',
      label: 'Riwayat & Laporan',
      iconClass: 'bi bi-clock-history',
    },
    {
      to: '/admin/notifikasi',
      label: 'Notifikasi/Log Aktivitas',
      iconClass: 'bi bi-bell',
      badge: '2',
    },
    {
      to: '/admin/pengaturan-akun',
      label: 'Pengaturan akun',
      iconClass: 'bi bi-gear',
    },
  ];

  const adminPageTitles: Record<string, string> = {
    '/admin/dashboard': 'Dashboard Admin Akademik',
    '/admin/dosen': 'Master Data & Kelola Dosen',
    '/admin/daftar-mata-kuliah': 'Rekap Daftar Mata Kuliah',
    '/admin/peminjaman-barang': 'Kelola Peminjaman Barang',
    '/admin/peminjaman-ruangan': 'Kelola Peminjaman Ruangan',
    '/admin/riwayat-layanan': 'Riwayat & Laporan Layanan',
    '/admin/notifikasi': 'Notifikasi & Log Aktivitas',
    '/admin/pengaturan-akun': 'Pengaturan Akun Admin',
  };

  const headerTitle = isWizardSchedulingRoute
    ? 'Penjadwalan & Mind Mapping Perkuliahan'
    : (adminPageTitles[location.pathname] ?? 'Panel Admin Akademik');

  return (
    <div className="mhs-container ds-admin-layout">
      {/* Left Sidebar matching MahasiswaSidebar visual style */}
      <aside
        aria-label="Sidebar Navigasi Admin"
        className={`mhs-sidebar ${collapsed ? 'ds-sidebar--collapsed' : ''}`.trim()}
      >
        <div className="mhs-sidebar__top">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '26px',
              gap: '8px',
            }}
          >
            <Link
              to="/admin/dashboard"
              className="mhs-sidebar__brand"
              style={{ marginBottom: 0 }}
            >
              <div className="mhs-sidebar__logo-box" aria-hidden="true">
                R
              </div>
              {!collapsed && (
                <div className="mhs-sidebar__brand-text">
                  <h1 className="mhs-sidebar__brand-title">FRIDAY</h1>
                  <p className="mhs-sidebar__brand-subtitle">
                    Admin Akademik RPL
                  </p>
                </div>
              )}
            </Link>

            <button
              type="button"
              className="mhs-header__icon-btn"
              style={{ width: '34px', height: '34px', flexShrink: 0 }}
              aria-label={collapsed ? 'Buka Sidebar' : 'Lipat Sidebar'}
              title={collapsed ? 'Buka Sidebar' : 'Lipat Sidebar'}
              onClick={handleToggleCollapse}
            >
              <i
                className={
                  collapsed
                    ? 'bi bi-chevron-double-right'
                    : 'bi bi-chevron-double-left'
                }
              />
            </button>
          </div>

          {!collapsed && (
            <div className="mhs-sidebar__menu-label">MENU UTAMA ADMIN</div>
          )}
          <nav className="mhs-sidebar__nav">
            {adminSidebarMenus.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={item.label}
                className={({ isActive }) =>
                  `mhs-sidebar__nav-item ${
                    item.forceActive || isActive
                      ? 'mhs-sidebar__nav-item--active'
                      : ''
                  }`
                }
              >
                <span className="mhs-sidebar__nav-icon">
                  <i className={item.iconClass} />
                </span>
                {!collapsed && (
                  <>
                    <span className="mhs-sidebar__nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="mhs-sidebar__badge">{item.badge}</span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {!collapsed && (
          <div className="mhs-sidebar__bottom">
            <div className="mhs-help-card">
              <div className="mhs-help-card__icon" aria-hidden="true">
                <i className="bi bi-question-lg" />
              </div>
              <div className="mhs-help-card__title">Butuh bantuan?</div>
              <div className="mhs-help-card__desc">
                Hubungi pusat layanan akademik RPL.
              </div>
              <button
                type="button"
                className="mhs-help-card__btn"
                onClick={() => navigate('/admin/pengaturan/ruangan')}
              >
                Referensi 37 Ruangan
              </button>
            </div>

            <button
              type="button"
              className="mhs-sidebar__logout-btn"
              onClick={() => navigate('/')}
            >
              <i className="bi bi-box-arrow-right" />
              <span>Keluar</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area matching MahasiswaLayout */}
      <div className="mhs-main-area">
        <header className="mhs-header">
          <div className="mhs-header__left">
            <span className="mhs-header__subtitle">
              {isWizardSchedulingRoute
                ? `Sistem Informasi RPL • Tahap ${activeStep.stepNumber} dari ${workflowSteps.length}`
                : 'Sistem Informasi RPL • Panel Admin'}
            </span>
            <div className="mhs-header__title">{headerTitle}</div>
          </div>

          <div className="mhs-header__right">
            <Link to="/" className="mhs-header__admin-link">
              <span className="mhs-header__admin-badge">
                <i className="bi bi-mortarboard-fill" /> Lihat Portal Mahasiswa
              </span>
            </Link>

            <button
              type="button"
              className="mhs-header__icon-btn"
              aria-label="Notifikasi"
              onClick={() => navigate('/admin/notifikasi')}
            >
              <i className="bi bi-bell" />
              <span className="mhs-header__icon-dot" />
            </button>

            <div className="mhs-header__profile">
              <div className="mhs-header__avatar" aria-hidden="true">
                AD
              </div>
              <div className="mhs-header__user-info">
                <span className="mhs-header__user-name">Admin Akademik</span>
                <span className="mhs-header__user-meta">
                  Administrator - RPL
                </span>
              </div>
              <i className="bi bi-chevron-right mhs-header__chevron" />
            </div>
          </div>
        </header>

        <main className="mhs-content">
          {/* 4-Step Wizard Bar appears specifically on the Penjadwalan & Mind Mapping workflow */}
          {isWizardSchedulingRoute && (
            <div className="mhs-wizard-bar">
              <div
                className="mhs-wizard-steps"
                role="navigation"
                aria-label="Tahapan Penyusunan Jadwal"
              >
                {workflowSteps.map((step, idx) => {
                  const isCurrent = idx === activeStepIndex;
                  const isDone = idx < activeStepIndex;
                  return (
                    <Link
                      key={step.to}
                      to={step.to}
                      className={`mhs-wizard-step ${
                        isCurrent
                          ? 'mhs-wizard-step--active'
                          : isDone
                            ? 'mhs-wizard-step--done'
                            : ''
                      }`}
                    >
                      <span className="mhs-wizard-step__num">
                        <i className={step.iconClass} />
                      </span>
                      <span className="mhs-wizard-step__info">
                        <span className="mhs-wizard-step__label">
                          {step.stepNumber}. {step.label}
                        </span>
                        <span className="mhs-wizard-step__desc">
                          {step.shortDesc}
                        </span>
                      </span>
                      {step.badgeCount !== undefined && (
                        <span className="mhs-wizard-step__badge">
                          {step.badgeCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="mhs-wizard-actions">
                {prevStep ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(prevStep.to)}
                  >
                    <i className="bi bi-arrow-left" /> Sebelumnya:{' '}
                    {prevStep.label}
                  </Button>
                ) : (
                  <span />
                )}

                {nextStep && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(nextStep.to)}
                  >
                    Selanjutnya: {nextStep.label}{' '}
                    <i className="bi bi-arrow-right" />
                  </Button>
                )}
              </div>

              {isSettingsRoute && (
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <Link to="/admin/pengaturan/waktu">
                    <Button
                      size="sm"
                      variant={
                        location.pathname === '/admin/pengaturan/waktu'
                          ? 'primary'
                          : 'outline'
                      }
                    >
                      <i className="bi bi-clock" /> Setting Waktu (07:00–17:00)
                    </Button>
                  </Link>
                  <Link to="/admin/pengaturan/ruangan">
                    <Button
                      size="sm"
                      variant={
                        location.pathname === '/admin/pengaturan/ruangan'
                          ? 'primary'
                          : 'outline'
                      }
                    >
                      <i className="bi bi-building" /> Referensi 37 Ruangan
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          <Outlet />

          {isWizardSchedulingRoute && (
            <div className="mhs-wizard-footer">
              <div>
                {prevStep && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(prevStep.to)}
                  >
                    <i className="bi bi-arrow-left" /> Kembali ke{' '}
                    {prevStep.label}
                  </Button>
                )}
              </div>
              <div>
                {nextStep && (
                  <Button
                    variant="primary"
                    onClick={() => navigate(nextStep.to)}
                  >
                    Lanjut ke Langkah {nextStep.stepNumber}: {nextStep.label}{' '}
                    <i className="bi bi-arrow-right" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
