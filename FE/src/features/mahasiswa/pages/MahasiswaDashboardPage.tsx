import { Link } from 'react-router';

export function MahasiswaDashboardPage() {
  const statCards = [
    {
      id: 'surat-aktif',
      title: 'Pengajuan Surat Aktif',
      count: '2',
      subtext: '1 sedang ditinjau',
      iconClass: 'bi bi-file-earmark-text',
      iconBg: '#EEF2FF',
      iconColor: '#1D2BD7',
      accentColor: '#E0E7FF',
    },
    {
      id: 'surat-selesai',
      title: 'Surat Selesai',
      count: '8',
      subtext: 'Semester ini',
      iconClass: 'bi bi-check-lg',
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      accentColor: '#D1FAE5',
    },
    {
      id: 'peminjaman-aktif',
      title: 'Peminjaman Aktif',
      count: '1',
      subtext: 'Kembali 20 Juni',
      iconClass: 'bi bi-box-seam',
      iconBg: '#F0F9FF',
      iconColor: '#0284C7',
      accentColor: '#E0F2FE',
    },
    {
      id: 'menunggu-persetujuan',
      title: 'Menunggu Persetujuan',
      count: '2',
      subtext: 'Perlu ditinjau admin',
      iconClass: 'bi bi-clock',
      iconBg: '#FFFBEB',
      iconColor: '#F59E0B',
      accentColor: '#FEF3C7',
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
            <i className="bi bi-file-earmark-text-fill" />
          </div>
        </div>
      </section>

      {/* 2. Stat Cards (4 columns) */}
      <section className="mhs-stats-grid" aria-label="Statistik Layanan">
        {statCards.map((card) => (
          <div key={card.id} className="mhs-stat-card">
            <div className="mhs-stat-card__header">
              <div
                className="mhs-stat-card__icon"
                style={{ backgroundColor: card.iconBg, color: card.iconColor }}
              >
                <i className={card.iconClass} />
              </div>
              <span className="mhs-stat-card__title">{card.title}</span>
            </div>
            <div className="mhs-stat-card__body">
              <span className="mhs-stat-card__count">{card.count}</span>
              <span className="mhs-stat-card__subtext">{card.subtext}</span>
            </div>
            <div
              className="mhs-stat-card__corner"
              style={{ backgroundColor: card.accentColor }}
              aria-hidden="true"
            />
          </div>
        ))}
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
          {/* Card: Ajukan Surat */}
          <Link
            to="/notifikasi"
            className="mhs-action-card mhs-action-card--primary"
          >
            <div className="mhs-action-card__icon-wrap">
              <i className="bi bi-file-earmark-text" />
            </div>
            <div className="mhs-action-card__info">
              <span className="mhs-action-card__title">Ajukan Surat</span>
              <span className="mhs-action-card__sub">
                Buat pengajuan surat akademik baru
              </span>
            </div>
            <i className="bi bi-arrow-right mhs-action-card__arrow" />
          </Link>

          {/* Card: Pinjam Barang / Ruangan */}
          <Link
            to="/peminjaman-barang"
            className="mhs-action-card mhs-action-card--outline"
          >
            <div className="mhs-action-card__icon-wrap">
              <i className="bi bi-box-seam" />
            </div>
            <div className="mhs-action-card__info">
              <span className="mhs-action-card__title">
                Pinjam Barang / Ruangan
              </span>
              <span className="mhs-action-card__sub">
                Cek jadwal dan ketersediaan lab
              </span>
            </div>
            <i className="bi bi-arrow-right mhs-action-card__arrow" />
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
                      <i className="bi bi-chevron-right" />
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
              <i className="bi bi-bell" />
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
