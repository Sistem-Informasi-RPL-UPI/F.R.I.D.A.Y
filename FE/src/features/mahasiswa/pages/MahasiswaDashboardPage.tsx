import {
  ArrowRight,
  Bell,
  Building2,
  Check,
  ChevronRight,
  Clock,
  FileText,
  Package,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router';

interface DashboardStatCard {
  id: string;
  title: string;
  count: string;
  subtext: string;
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  accentColor: string;
}

export function MahasiswaDashboardPage() {
  const statCards: readonly DashboardStatCard[] = [
    {
      id: 'surat-aktif',
      title: 'Pengajuan Surat Aktif',
      count: '2',
      subtext: '1 sedang ditinjau',
      Icon: FileText,
      iconBg: 'var(--color-primary-soft)',
      iconColor: 'var(--color-primary)',
      accentColor: 'var(--color-primary-soft)',
    },
    {
      id: 'surat-selesai',
      title: 'Surat Selesai',
      count: '8',
      subtext: 'Semester ini',
      Icon: Check,
      iconBg: 'var(--color-success-soft)',
      iconColor: 'var(--color-success)',
      accentColor: 'var(--color-success-soft)',
    },
    {
      id: 'peminjaman-aktif',
      title: 'Peminjaman Aktif',
      count: '1',
      subtext: 'Kembali 20 Juni',
      Icon: Package,
      iconBg: 'var(--color-info-soft)',
      iconColor: 'var(--color-info)',
      accentColor: 'var(--color-info-soft)',
    },
    {
      id: 'menunggu-persetujuan',
      title: 'Menunggu Persetujuan',
      count: '2',
      subtext: 'Perlu ditinjau admin',
      Icon: Clock,
      iconBg: 'var(--color-warning-soft)',
      iconColor: 'var(--color-warning)',
      accentColor: 'var(--color-warning-soft)',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      date: '12 Jun 2025',
      activity: 'Surat Pengantar Magang',
      referenceNo: 'RPL/SRT/2025/0148',
      status: 'Sedang Ditinjau',
      statusType: 'reviewing',
    },
    {
      id: '2',
      date: '10 Jun 2025',
      activity: 'Peminjaman Lab Multimedia',
      referenceNo: 'RPL/PJM/2025/0092',
      status: 'Disetujui',
      statusType: 'approved',
    },
    {
      id: '3',
      date: '28 Mei 2025',
      activity: 'Surat Keterangan Mahasiswa',
      referenceNo: 'RPL/SRT/2025/0121',
      status: 'Selesai',
      statusType: 'completed',
    },
  ];

  return (
    <div className="mhs-dashboard">
      {/* 1. Hero / Welcome Banner */}
      <section className="mhs-hero">
        <div className="mhs-hero__content">
          <div className="mhs-hero__date">RABU, 18 JUNI 2025</div>
          <h2 className="mhs-hero__title">Halo, Alya Rahmadani</h2>
          <p className="mhs-hero__subtitle">
            Pantau layanan administrasi dan peminjaman laboratoriummu dalam satu
            tempat.
          </p>
        </div>
        <div className="mhs-hero__graphic" aria-hidden="true">
          <div className="mhs-hero__circle">
            <FileText size={30} strokeWidth={1.8} />
          </div>
        </div>
      </section>

      {/* 2. Stat Cards (4 columns) */}
      <section className="mhs-stats-grid" aria-label="Statistik Layanan">
        {statCards.map(
          ({
            id,
            title,
            count,
            subtext,
            Icon,
            iconBg,
            iconColor,
            accentColor,
          }) => (
            <div key={id} className="mhs-stat-card">
              <div className="mhs-stat-card__header">
                <div
                  className="mhs-stat-card__icon"
                  style={{ backgroundColor: iconBg, color: iconColor }}
                >
                  <Icon size={18} strokeWidth={2} aria-hidden="true" />
                </div>
                <span className="mhs-stat-card__title">{title}</span>
              </div>
              <div className="mhs-stat-card__body">
                <span className="mhs-stat-card__count">{count}</span>
                <span className="mhs-stat-card__subtext">{subtext}</span>
              </div>
              <div
                className="mhs-stat-card__corner"
                style={{ backgroundColor: accentColor }}
                aria-hidden="true"
              />
            </div>
          ),
        )}
      </section>

      {/* 3. Akses Cepat Section */}
      <section className="mhs-quick-access" aria-label="Akses Cepat">
        <div className="mhs-quick-access__intro">
          <span className="mhs-quick-access__tag">AKSES CEPAT</span>
          <h3 className="mhs-quick-access__heading">
            Apa yang ingin kamu lakukan?
          </h3>
          <p className="mhs-quick-access__desc">
            Mulai pengajuan baru dengan memilih layanan di samping.
          </p>
        </div>

        <div className="mhs-quick-access__cards">
          {/* Card: Pinjam Ruangan */}
          <Link
            to="/peminjaman-ruangan"
            className="mhs-action-card mhs-action-card--primary"
          >
            <div className="mhs-action-card__icon-wrap">
              <Building2 size={20} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="mhs-action-card__info">
              <span className="mhs-action-card__title">Pinjam Ruangan</span>
              <span className="mhs-action-card__sub">
                Pilih gedung, lantai &amp; cek ketersediaan ruang
              </span>
            </div>
            <ArrowRight
              size={18}
              strokeWidth={2}
              className="mhs-action-card__arrow"
              aria-hidden="true"
            />
          </Link>

          {/* Card: Pinjam Barang / Alat */}
          <Link
            to="/peminjaman-barang"
            className="mhs-action-card mhs-action-card--outline"
          >
            <div className="mhs-action-card__icon-wrap">
              <Package size={20} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="mhs-action-card__info">
              <span className="mhs-action-card__title">
                Pinjam Barang &amp; Alat
              </span>
              <span className="mhs-action-card__sub">
                Cek inventaris peralatan laboratorium
              </span>
            </div>
            <ArrowRight
              size={18}
              strokeWidth={2}
              className="mhs-action-card__arrow"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>

      {/* 4. Bottom Grid: Aktivitas Terbaru (Left) & Informasi (Right) */}
      <div className="mhs-bottom-grid">
        {/* Left Column: Aktivitas Terbaru */}
        <section
          className="mhs-card mhs-activities"
          aria-label="Aktivitas Terbaru"
        >
          <div className="mhs-card__header">
            <div>
              <h3 className="mhs-card__title">Aktivitas Terbaru</h3>
              <p className="mhs-card__subtitle">
                Perkembangan layanan terakhirmu
              </p>
            </div>
            <Link to="/riwayat-peminjaman" className="mhs-card__action-link">
              Lihat semua
            </Link>
          </div>

          <div className="mhs-table-wrapper">
            <table className="mhs-table">
              <thead>
                <tr>
                  <th>TANGGAL</th>
                  <th>AKTIVITAS</th>
                  <th>NOMOR REFERENSI</th>
                  <th>STATUS</th>
                  <th aria-label="Aksi" />
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((row) => (
                  <tr key={row.id}>
                    <td className="mhs-table__date">{row.date}</td>
                    <td className="mhs-table__activity">{row.activity}</td>
                    <td className="mhs-table__ref">{row.referenceNo}</td>
                    <td>
                      <span
                        className={`mhs-status-badge mhs-status-badge--${row.statusType}`}
                      >
                        <span className="mhs-status-badge__dot" />
                        {row.status}
                      </span>
                    </td>
                    <td className="mhs-table__arrow-cell">
                      <ChevronRight size={16} aria-hidden="true" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column: Informasi Pengumuman */}
        <section
          className="mhs-card mhs-info-card"
          aria-label="Papan Informasi"
        >
          <div className="mhs-card__header">
            <div>
              <h3 className="mhs-card__title">Informasi</h3>
              <p className="mhs-card__subtitle">Pengumuman untukmu</p>
            </div>
            <div className="mhs-info-card__bell" aria-hidden="true">
              <Bell size={18} strokeWidth={2} />
            </div>
          </div>

          <div className="mhs-info-list">
            <article className="mhs-info-item">
              <div className="mhs-info-item__date-badge mhs-info-item__date-badge--yellow">
                17 JUN
              </div>
              <div className="mhs-info-item__content">
                <h4 className="mhs-info-item__title">
                  Penyesuaian jam layanan
                </h4>
                <p className="mhs-info-item__body">
                  Layanan administrasi hari Jumat tersedia hingga pukul 15.00
                  WIB.
                </p>
                <button
                  type="button"
                  className="mhs-info-item__link-btn"
                  onClick={() =>
                    alert(
                      'Jam Layanan: Senin-Kamis 08.00-16.00 WIB, Jumat 08.00-15.00 WIB.',
                    )
                  }
                >
                  Baca selengkapnya
                </button>
              </div>
            </article>

            <article className="mhs-info-item">
              <div className="mhs-info-item__date-badge mhs-info-item__date-badge--blue">
                14 JUN
              </div>
              <div className="mhs-info-item__content">
                <h4 className="mhs-info-item__title">
                  Pengembalian alat laboratorium
                </h4>
                <p className="mhs-info-item__body">
                  Pastikan barang dikembalikan sesuai jadwal dan dalam kondisi
                  baik.
                </p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
