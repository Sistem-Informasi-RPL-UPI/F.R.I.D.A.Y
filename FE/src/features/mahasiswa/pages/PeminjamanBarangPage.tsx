import { Package } from 'lucide-react';
import { Link } from 'react-router';

export function PeminjamanBarangPage() {
  return (
    <div className="mhs-placeholder-page">
      <div className="mhs-placeholder-page__header">
        <h3 className="mhs-placeholder-page__title">
          Peminjaman Barang &amp; Alat Lab
        </h3>
        <p className="mhs-placeholder-page__desc">
          Layanan peminjaman perangkat laboratorium, proyektor, dan sarana
          perkuliahan RPL.
        </p>
      </div>

      <div className="mhs-placeholder-page__card">
        <div className="mhs-placeholder-page__icon" aria-hidden="true">
          <Package size={26} strokeWidth={1.9} />
        </div>
        <h4>Belum ada pengajuan peminjaman barang</h4>
        <p>
          Halaman ini siap dihubungkan dengan katalog ketersediaan alat dan
          laboratorium.
        </p>
        <Link to="/" className="mhs-placeholder-page__btn">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
