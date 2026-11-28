import { Link } from 'react-router';
import { Badge, Button, Card } from '../../../shared/ui';

export function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <Badge tone="primary">UPI Kampus Cibiru</Badge>
        <h2 style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
          Dashboard Akademik & Fasilitas
        </h2>
        <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
          Akses cepat layanan peminjaman ruangan & barang, penjadwalan kuliah,
          dan Mind Mapping jadwal kampus.
        </p>
      </header>

      <div className="ds-grid">
        <div className="ds-col-4">
          <Card>
            <h6>Peminjaman Ruangan & Barang</h6>
            <p style={{ color: 'var(--color-ink-secondary)' }}>
              Ajukan peminjaman ruangan atau inventaris kampus serta pantau
              status persetujuan admin.
            </p>
            <Link to="/loans">
              <Button variant="primary" size="sm">
                Buka Peminjaman
              </Button>
            </Link>
          </Card>
        </div>

        <div className="ds-col-4">
          <Card>
            <h6>Penjadwalan Akademik</h6>
            <p style={{ color: 'var(--color-ink-secondary)' }}>
              Kelola kebutuhan jadwal, validasi hard & soft constraints, dan
              approval jadwal semester.
            </p>
            <Link to="/scheduling">
              <Button variant="secondary" size="sm">
                Kelola Jadwal
              </Button>
            </Link>
          </Card>
        </div>

        <div className="ds-col-4">
          <Card>
            <h6>Mind Mapping & Ekspor Offline</h6>
            <p style={{ color: 'var(--color-ink-secondary)' }}>
              Lihat matriks jadwal per gedung maupun seluruh kampus dan unduh
              HTML offline mandiri.
            </p>
            <Link to="/mind-mapping">
              <Button variant="accent" size="sm">
                Buka Mind Mapping
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
