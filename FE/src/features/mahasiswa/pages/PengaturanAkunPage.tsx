import { Settings } from 'lucide-react';
import { Link } from 'react-router';

export function PengaturanAkunPage() {
  return (
    <div className="mhs-placeholder-page">
      <div className="mhs-placeholder-page__header">
        <h3 className="mhs-placeholder-page__title">
          Pengaturan Akun &amp; Profil
        </h3>
        <p className="mhs-placeholder-page__desc">
          Kelola informasi identitas mahasiswa, nomor kontak, dan preferensi
          akun.
        </p>
      </div>

      <div className="mhs-placeholder-page__card">
        <div className="mhs-placeholder-page__icon" aria-hidden="true">
          <Settings size={26} strokeWidth={1.9} />
        </div>
        <h4>Profil Alya Rahmadani (2201024)</h4>
        <p>
          Data tersinkronisasi dengan sistem identitas akademik Prodi Rekayasa
          Perangkat Lunak.
        </p>
        <Link to="/" className="mhs-placeholder-page__btn">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
