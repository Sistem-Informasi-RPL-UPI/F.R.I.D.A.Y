import { Link } from 'react-router';

export function RiwayatPeminjamanPage() {
  return (
    <div className="mhs-placeholder-page">
      <div className="mhs-placeholder-page__header">
        <h3 className="mhs-placeholder-page__title">
          Riwayat Peminjaman &amp; Surat
        </h3>
        <p className="mhs-placeholder-page__desc">
          Daftar seluruh riwayat peminjaman barang, ruangan, dan berkas
          pengajuan surat Anda.
        </p>
      </div>

      <div className="mhs-placeholder-page__card">
        <div className="mhs-placeholder-page__icon">
          <i className="bi bi-clock-history" />
        </div>
        <h4>Riwayat Aktivitas Lengkap</h4>
        <p>
          Riwayat arsip semester ini dan semester sebelumnya tersimpan di sini.
        </p>
        <Link to="/" className="mhs-placeholder-page__btn">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
