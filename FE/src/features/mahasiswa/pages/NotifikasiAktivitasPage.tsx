import { Link } from 'react-router';

export function NotifikasiAktivitasPage() {
  return (
    <div className="mhs-placeholder-page">
      <div className="mhs-placeholder-page__header">
        <h3 className="mhs-placeholder-page__title">
          Notifikasi &amp; Log Aktivitas
        </h3>
        <p className="mhs-placeholder-page__desc">
          Pemberitahuan persetujuan surat, batas waktu peminjaman, dan info
          akademik terbaru.
        </p>
      </div>

      <div className="mhs-placeholder-page__card">
        <div className="mhs-placeholder-page__icon">
          <i className="bi bi-bell" />
        </div>
        <h4>Pusat Notifikasi Layanan</h4>
        <p>
          Ada 3 aktivitas layanan yang memerlukan perhatian atau baru disetujui.
        </p>
        <Link to="/" className="mhs-placeholder-page__btn">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
