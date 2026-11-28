import { Link } from 'react-router';

export function PeminjamanRuanganPage() {
  return (
    <div className="mhs-placeholder-page">
      <div className="mhs-placeholder-page__header">
        <h3 className="mhs-placeholder-page__title">
          Peminjaman Ruangan &amp; Lab
        </h3>
        <p className="mhs-placeholder-page__desc">
          Cek ketersediaan 37 ruangan kelas, laboratorium multimedia, dan aula
          UPI Kampus Cibiru.
        </p>
      </div>

      <div className="mhs-placeholder-page__card">
        <div className="mhs-placeholder-page__icon">
          <i className="bi bi-building" />
        </div>
        <h4>Pemesanan Ruangan Kuliah &amp; Kegiatan</h4>
        <p>
          Fitur formulir peminjaman ruangan bebas bentrok akan segera terhubung.
        </p>
        <Link to="/" className="mhs-placeholder-page__btn">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
