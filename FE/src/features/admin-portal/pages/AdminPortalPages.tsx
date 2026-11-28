import { useState } from 'react';
import { Link } from 'react-router';
import { useJadwalStore } from '../../../shared/jadwal';
import { Badge, Button, Card, Input } from '../../../shared/ui';

interface LoanSubmission {
  id: string;
  studentName: string;
  nim: string;
  itemOrRoom: string;
  category: 'Barang' | 'Ruangan';
  purpose: string;
  dateText: string;
  timeText: string;
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Selesai';
}

const INITIAL_SUBMISSIONS: LoanSubmission[] = [
  {
    id: 'RPL/PJM/2025/0098',
    studentName: 'Alya Rahmadani',
    nim: '2201024',
    itemOrRoom: 'E2.005 — LABKOM RPL',
    category: 'Ruangan',
    purpose: 'Praktikum Mandiri & UAT Proyek RPL',
    dateText: '20 Jun 2025',
    timeText: '13:00 - 15:30',
    status: 'Menunggu Persetujuan',
  },
  {
    id: 'RPL/PJM/2025/0095',
    studentName: 'Bima Sakti Pratama',
    nim: '2201041',
    itemOrRoom: 'Proyektor Epson EB-X500 + Kabel HDMI',
    category: 'Barang',
    purpose: 'Seminar Proposal Tugas Akhir',
    dateText: '19 Jun 2025',
    timeText: '08:40 - 11:10',
    status: 'Menunggu Persetujuan',
  },
  {
    id: 'RPL/PJM/2025/0092',
    studentName: 'Alya Rahmadani',
    nim: '2201024',
    itemOrRoom: 'A3.006 — LABKOM MULTIMEDIA',
    category: 'Ruangan',
    purpose: 'Workshop UI/UX Himpunan RPL',
    dateText: '10 Jun 2025',
    timeText: '13:00 - 16:20',
    status: 'Disetujui',
  },
  {
    id: 'RPL/PJM/2025/0084',
    studentName: 'Dinda Kirana',
    nim: '2104812',
    itemOrRoom: 'Kamera Sony Alpha A6400 (Lab Studio Foto)',
    category: 'Barang',
    purpose: 'Dokumentasi Pameran Inovasi Digital',
    dateText: '02 Jun 2025',
    timeText: '07:50 - 12:00',
    status: 'Selesai',
  },
];

export function AdminDashboardPage() {
  const { dosenList, readyCourses, scheduledCourses, parkedCourses, rooms } =
    useJadwalStore();
  const [submissions, setSubmissions] =
    useState<LoanSubmission[]>(INITIAL_SUBMISSIONS);

  const pendingCount = submissions.filter(
    (s) => s.status === 'Menunggu Persetujuan',
  ).length;

  function handleDecision(
    id: string,
    nextStatus: 'Disetujui' | 'Ditolak',
  ): void {
    setSubmissions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item,
      ),
    );
  }

  const statCards = [
    {
      id: 'jadwal-mk',
      title: 'MK Terjadwal di Matriks',
      count: `${scheduledCourses.length} / ${readyCourses.length}`,
      subtext: `${parkedCourses.length} MK berada di panel parkir`,
      iconClass: 'bi bi-calendar3-range-fill',
      iconBg: '#EEF2FF',
      iconColor: '#1D2BD7',
      accentColor: '#E0E7FF',
    },
    {
      id: 'total-dosen',
      title: 'Data Dosen Pengampu',
      count: String(dosenList.length),
      subtext: `${rooms.length} ruangan referensi aktif`,
      iconClass: 'bi bi-person-badge-fill',
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      accentColor: '#D1FAE5',
    },
    {
      id: 'pengajuan-ruang',
      title: 'Peminjaman Ruangan & Barang',
      count: String(submissions.length),
      subtext: 'Terintegrasi dengan Portal Mahasiswa',
      iconClass: 'bi bi-building-check',
      iconBg: '#F0F9FF',
      iconColor: '#0284C7',
      accentColor: '#E0F2FE',
    },
    {
      id: 'butuh-persetujuan',
      title: 'Menunggu Persetujuan Admin',
      count: String(pendingCount),
      subtext: 'Pengajuan mahasiswa perlu ditinjau',
      iconClass: 'bi bi-clock-history',
      iconBg: '#FFFBEB',
      iconColor: '#F59E0B',
      accentColor: '#FEF3C7',
    },
  ];

  return (
    <div className="mhs-dashboard">
      <section className="mhs-hero">
        <div className="mhs-hero__content">
          <div className="mhs-hero__date">
            PANEL KONTROL ADMIN AKADEMIK • UPI KAMPUS CIBIRU
          </div>
          <h2 className="mhs-hero__title">Halo, Admin Akademik</h2>
          <p className="mhs-hero__subtitle">
            Kelola penyusunan jadwal perkuliahan 37 ruangan bebas bentrok serta
            tinjau pengajuan peminjaman ruangan dan alat laboratorium dari
            mahasiswa dalam satu tempat.
          </p>
        </div>
        <div className="mhs-hero__graphic" aria-hidden="true">
          <div className="mhs-hero__circle">
            <i className="bi bi-calendar3-range-fill" />
          </div>
        </div>
      </section>

      <section className="mhs-stats-grid" aria-label="Statistik Admin">
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

      <section className="mhs-quick-access" aria-label="Akses Cepat Admin">
        <div className="mhs-quick-access__intro">
          <span className="mhs-quick-access__tag">AKSES CEPAT ADMIN</span>
          <h3 className="mhs-quick-access__heading">
            Alur Kerja Utama Akademik
          </h3>
          <p className="mhs-quick-access__desc">
            Susun jadwal semester atau verifikasi pengajuan peminjaman fasilitas
            dari mahasiswa.
          </p>
        </div>

        <div className="mhs-quick-access__cards">
          <Link
            to="/admin/integrator"
            className="mhs-action-card mhs-action-card--primary"
          >
            <div className="mhs-action-card__icon-wrap">
              <i className="bi bi-grid-3x3-gap-fill" />
            </div>
            <div className="mhs-action-card__info">
              <span className="mhs-action-card__title">
                Penjadwalan &amp; Mind Mapping
              </span>
              <span className="mhs-action-card__sub">
                Integrator, ketersediaan dosen, setting waktu &amp; matriks 37
                ruang
              </span>
            </div>
            <i className="bi bi-arrow-right mhs-action-card__arrow" />
          </Link>

          <Link
            to="/admin/peminjaman-ruangan"
            className="mhs-action-card mhs-action-card--outline"
          >
            <div className="mhs-action-card__icon-wrap">
              <i className="bi bi-building-check" />
            </div>
            <div className="mhs-action-card__info">
              <span className="mhs-action-card__title">
                Verifikasi Peminjaman Mahasiswa
              </span>
              <span className="mhs-action-card__sub">
                Setujui peminjaman ruangan &amp; barang bebas bentrok kuliah
              </span>
            </div>
            <i className="bi bi-arrow-right mhs-action-card__arrow" />
          </Link>
        </div>
      </section>

      <div className="mhs-bottom-grid">
        <section
          className="mhs-card mhs-activities"
          aria-label="Pengajuan Mahasiswa Terbaru"
        >
          <div className="mhs-card__header">
            <div>
              <h3 className="mhs-card__title">
                Pengajuan Masuk dari Portal Mahasiswa
              </h3>
              <p className="mhs-card__subtitle">
                Terintegrasi langsung dengan pengajuan peminjaman ruangan &amp;
                barang mahasiswa
              </p>
            </div>
            <Link to="/admin/riwayat-layanan" className="mhs-card__action-link">
              Lihat semua
            </Link>
          </div>

          <div className="mhs-table-wrapper">
            <table className="mhs-table">
              <thead>
                <tr>
                  <th>MAHASISWA</th>
                  <th>FASILITAS &amp; KEPERLUAN</th>
                  <th>JADWAL PINJAM</th>
                  <th>STATUS</th>
                  <th>AKSI ADMIN</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="mhs-table__activity">
                        {row.studentName}
                      </div>
                      <div className="mhs-table__date">
                        NIM {row.nim} • {row.id}
                      </div>
                    </td>
                    <td>
                      <div className="mhs-table__activity">
                        {row.itemOrRoom}
                      </div>
                      <div className="mhs-table__date">{row.purpose}</div>
                    </td>
                    <td className="mhs-table__date">
                      {row.dateText}
                      <div>{row.timeText}</div>
                    </td>
                    <td>
                      <span
                        className={`mhs-status-badge ${
                          row.status === 'Disetujui'
                            ? 'mhs-status-badge--approved'
                            : row.status === 'Menunggu Persetujuan'
                              ? 'mhs-status-badge--reviewing'
                              : 'mhs-status-badge--completed'
                        }`}
                      >
                        <span className="mhs-status-badge__dot" />
                        {row.status}
                      </span>
                    </td>
                    <td>
                      {row.status === 'Menunggu Persetujuan' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleDecision(row.id, 'Disetujui')}
                          >
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDecision(row.id, 'Ditolak')}
                          >
                            Tolak
                          </Button>
                        </div>
                      ) : (
                        <span className="mhs-table__date">Terverifikasi</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className="mhs-card mhs-info-card"
          aria-label="Status Integrasi Jadwal"
        >
          <div className="mhs-card__header">
            <div>
              <h3 className="mhs-card__title">Integrasi Sistem</h3>
              <p className="mhs-card__subtitle">
                Sinkronisasi Jadwal &amp; Peminjaman
              </p>
            </div>
            <div className="mhs-info-card__bell" aria-hidden="true">
              <i className="bi bi-shield-check" />
            </div>
          </div>

          <div className="mhs-info-list">
            <article className="mhs-info-item">
              <div className="mhs-info-item__date-badge mhs-info-item__date-badge--blue">
                37 RUANG
              </div>
              <div className="mhs-info-item__content">
                <h4 className="mhs-info-item__title">
                  Proteksi Bentrok Jadwal Kuliah
                </h4>
                <p className="mhs-info-item__body">
                  Slot ruangan yang sudah terisi jadwal perkuliahan di Matriks
                  Mind Mapping otomatis terkunci dari peminjaman mahasiswa pada
                  jam yang sama.
                </p>
              </div>
            </article>

            <article className="mhs-info-item">
              <div className="mhs-info-item__date-badge mhs-info-item__date-badge--yellow">
                07:00–17:00
              </div>
              <div className="mhs-info-item__content">
                <h4 className="mhs-info-item__title">
                  Jam Operasional Perkuliahan
                </h4>
                <p className="mhs-info-item__body">
                  Pos 1–6 (Sesi Pagi 07:00–12:00), Istirahat (12:00–13:00), dan
                  Pos 7–11 (Sesi Siang/Sore 13:00–17:00).
                </p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}

export function AdminPeminjamanBarangPage() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([
    {
      id: 'RPL/BRG/2025/001',
      mahasiswa: 'Bima Sakti Pratama (2201041)',
      barang: 'Proyektor Epson EB-X500 + HDMI',
      qty: '1 Unit',
      tanggal: '19 Jun 2025 • 08:40–11:10',
      keperluan: 'Seminar Proposal Tugas Akhir',
      status: 'Menunggu Persetujuan',
    },
    {
      id: 'RPL/BRG/2025/002',
      mahasiswa: 'Alya Rahmadani (2201024)',
      barang: 'Kit IoT Arduino & Sensor Jaringan',
      qty: '2 Set',
      tanggal: '20 Jun 2025 • 13:00–15:30',
      keperluan: 'Praktikum Sistem Tertanam',
      status: 'Disetujui',
    },
    {
      id: 'RPL/BRG/2025/003',
      mahasiswa: 'Dinda Kirana (2104812)',
      barang: 'Kamera Sony Alpha A6400 (Lab Studio Foto)',
      qty: '1 Unit',
      tanggal: '02 Jun 2025 • 07:50–12:00',
      keperluan: 'Dokumentasi Pameran Inovasi Digital',
      status: 'Dikembalikan',
    },
  ]);

  const filtered = items.filter(
    (i) =>
      !search.trim() ||
      i.mahasiswa.toLowerCase().includes(search.toLowerCase()) ||
      i.barang.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <Badge tone="primary">Terintegrasi Portal Mahasiswa</Badge>
          <h4 style={{ marginTop: '0.35rem', marginBottom: '0.25rem' }}>
            Kelola Peminjaman Barang &amp; Alat Lab
          </h4>
          <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
            Verifikasi pengajuan peminjaman perangkat laboratorium dari
            mahasiswa dan pantau pengembalian stok barang.
          </p>
        </div>

        <div style={{ minWidth: '260px' }}>
          <Input
            placeholder="Cari mahasiswa atau nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <Card>
        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th>No. Referensi</th>
                <th>Mahasiswa Peminjam</th>
                <th>Barang &amp; Jumlah</th>
                <th>Waktu Peminjaman</th>
                <th>Keperluan</th>
                <th>Status</th>
                <th>Aksi Admin</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.id}</strong>
                  </td>
                  <td>{item.mahasiswa}</td>
                  <td>
                    <strong>{item.barang}</strong> ({item.qty})
                  </td>
                  <td>{item.tanggal}</td>
                  <td>{item.keperluan}</td>
                  <td>
                    <Badge
                      tone={
                        item.status === 'Disetujui'
                          ? 'success'
                          : item.status === 'Menunggu Persetujuan'
                            ? 'accent'
                            : 'secondary'
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td>
                    {item.status === 'Menunggu Persetujuan' ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            setItems((prev) =>
                              prev.map((x) =>
                                x.id === item.id
                                  ? { ...x, status: 'Disetujui' }
                                  : x,
                              ),
                            )
                          }
                        >
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            setItems((prev) =>
                              prev.map((x) =>
                                x.id === item.id
                                  ? { ...x, status: 'Ditolak' }
                                  : x,
                              ),
                            )
                          }
                        >
                          Tolak
                        </Button>
                      </div>
                    ) : item.status === 'Disetujui' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === item.id
                                ? { ...x, status: 'Dikembalikan' }
                                : x,
                            ),
                          )
                        }
                      >
                        Tandai Dikembalikan
                      </Button>
                    ) : (
                      <span>Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function AdminPeminjamanRuanganPage() {
  const { rooms, scheduledCourses } = useJadwalStore();
  const [roomRequests, setRoomRequests] = useState([
    {
      id: 'RPL/RNG/2025/014',
      mahasiswa: 'Alya Rahmadani (2201024)',
      roomKode: 'E2.005',
      roomLabel: 'LABKOM RPL',
      hari: 'JUMAT',
      jam: '13:00 - 15:30',
      keperluan: 'Praktikum Mandiri & UAT Proyek RPL',
      status: 'Menunggu Persetujuan',
    },
    {
      id: 'RPL/RNG/2025/015',
      mahasiswa: 'Himpunan Mahasiswa RPL',
      roomKode: 'F1.001',
      roomLabel: 'SMART CLASS',
      hari: 'SABTU',
      jam: '08:40 - 12:00',
      keperluan: 'Sidang Pleno & Sharing Session Alumni',
      status: 'Disetujui',
    },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <Badge tone="primary">
            Terintegrasi Portal Mahasiswa &amp; 37 Ruangan Jadwal
          </Badge>
          <h4 style={{ marginTop: '0.35rem', marginBottom: '0.25rem' }}>
            Kelola Peminjaman Ruangan &amp; Laboratorium
          </h4>
          <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
            Tinjau pengajuan peminjaman dari mahasiswa dengan pemeriksaan
            otomatis terhadap jadwal perkuliahan di{' '}
            <strong>{rooms.length} ruangan</strong> ({scheduledCourses.length}{' '}
            MK terjadwal).
          </p>
        </div>

        <Link to="/admin/jadwal/matriks">
          <Button variant="outline" size="sm">
            Cek Matriks 37 Ruangan →
          </Button>
        </Link>
      </header>

      <Card>
        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th>No. Referensi</th>
                <th>Peminjam</th>
                <th>Ruangan</th>
                <th>Hari &amp; Jam</th>
                <th>Keperluan</th>
                <th>Cek Bentrok Kuliah</th>
                <th>Status</th>
                <th>Aksi Admin</th>
              </tr>
            </thead>
            <tbody>
              {roomRequests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <strong>{req.id}</strong>
                  </td>
                  <td>{req.mahasiswa}</td>
                  <td>
                    <strong>{req.roomKode}</strong> ({req.roomLabel})
                  </td>
                  <td>
                    {req.hari} • {req.jam}
                  </td>
                  <td>{req.keperluan}</td>
                  <td>
                    <Badge tone="success">Bebas Bentrok Kuliah</Badge>
                  </td>
                  <td>
                    <Badge
                      tone={
                        req.status === 'Disetujui'
                          ? 'success'
                          : req.status === 'Menunggu Persetujuan'
                            ? 'accent'
                            : 'danger'
                      }
                    >
                      {req.status}
                    </Badge>
                  </td>
                  <td>
                    {req.status === 'Menunggu Persetujuan' ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            setRoomRequests((prev) =>
                              prev.map((x) =>
                                x.id === req.id
                                  ? { ...x, status: 'Disetujui' }
                                  : x,
                              ),
                            )
                          }
                        >
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            setRoomRequests((prev) =>
                              prev.map((x) =>
                                x.id === req.id
                                  ? { ...x, status: 'Ditolak' }
                                  : x,
                              ),
                            )
                          }
                        >
                          Tolak
                        </Button>
                      </div>
                    ) : (
                      <span>Terverifikasi</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function AdminRiwayatLayananPage() {
  const { readyCourses, scheduledCourses, dosenList } = useJadwalStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <Badge tone="primary">Arsip &amp; Audit Layanan</Badge>
        <h4 style={{ marginTop: '0.35rem', marginBottom: '0.25rem' }}>
          Riwayat Peminjaman &amp; Penyusunan Jadwal
        </h4>
        <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
          Rekap seluruh aktivitas persetujuan peminjaman fasilitas mahasiswa
          serta riwayat publikasi jadwal perkuliahan.
        </p>
      </header>

      <Card>
        <h6>Ringkasan Semester Aktif (2023/2024)</h6>
        <p style={{ margin: 0, color: 'var(--color-ink-secondary)' }}>
          Total Dosen Terdaftar: <strong>{dosenList.length} Dosen</strong> •
          Total Mata Kuliah Antrean: <strong>{readyCourses.length} MK</strong> •
          Terjadwal di Matriks: <strong>{scheduledCourses.length} MK</strong>
        </p>
      </Card>
    </div>
  );
}

export function AdminNotifikasiPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <Badge tone="primary">Pusat Notifikasi Admin</Badge>
        <h4 style={{ marginTop: '0.35rem', marginBottom: '0.25rem' }}>
          Notifikasi &amp; Log Aktivitas Sistem
        </h4>
        <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
          Log sinkronisasi jadwal perkuliahan dan notifikasi pengajuan baru dari
          Portal Mahasiswa.
        </p>
      </header>

      <Card>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <div>
            <Badge tone="accent">Baru</Badge>{' '}
            <strong>Alya Rahmadani (2201024)</strong> mengajukan peminjaman
            ruangan <strong>E2.005 — LABKOM RPL</strong>.
          </div>
          <div>
            <Badge tone="primary">Jadwal</Badge> Konfigurasi jam perkuliahan
            aktif pada rentang <strong>07:00 – 17:00 (Pos 1–11)</strong>.
          </div>
        </div>
      </Card>
    </div>
  );
}

export function AdminPengaturanAkunPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <Badge tone="primary">Profil Administrator</Badge>
        <h4 style={{ marginTop: '0.35rem', marginBottom: '0.25rem' }}>
          Pengaturan Akun Admin Akademik
        </h4>
        <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
          Kelola identitas Admin Akademik dan parameter akses pengelolaan jadwal
          serta persetujuan peminjaman fasilitas.
        </p>
      </header>

      <Card>
        <h6>Admin Akademik — Koordinator Jadwal &amp; Laboratorium RPL</h6>
        <p style={{ margin: 0, color: 'var(--color-ink-secondary)' }}>
          Unit Kerja: Program Studi Rekayasa Perangkat Lunak, UPI Kampus Cibiru.
        </p>
      </Card>
    </div>
  );
}
