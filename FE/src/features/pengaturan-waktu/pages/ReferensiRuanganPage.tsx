import { useState } from 'react';
import { useJadwalStore } from '../../../shared/jadwal';
import { Badge, Button, Card, Input } from '../../../shared/ui';

export function ReferensiRuanganPage() {
  const { rooms } = useJadwalStore();
  const [gedungFilter, setGedungFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = rooms.filter((r) => {
    if (gedungFilter !== 'ALL' && r.gedung !== gedungFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      r.kode.toLowerCase().includes(q) ||
      r.label.toLowerCase().includes(q) ||
      String(r.urutan) === q
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <Badge tone="primary">Pengaturan • Lampiran A</Badge>
        <h4 style={{ marginTop: '0.35rem', marginBottom: '0.25rem' }}>
          Referensi 37 Ruangan Perkuliahan
        </h4>
        <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
          Daftar 37 ruangan resmi UPI Kampus Cibiru (Gedung B 1–18, Gedung E
          19–22, serta Smart Class &amp; Lab 23–37).
        </p>
      </header>

      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              ['ALL', 'Semua 37 Ruangan'],
              ['Gedung B', 'Gedung B (1–18)'],
              ['Gedung E', 'Gedung E (19–22)'],
              ['Smart Class & Lab', 'Smart Class & Lab (23–37)'],
            ].map(([val, label]) => (
              <Button
                key={val}
                size="sm"
                variant={gedungFilter === val ? 'primary' : 'outline'}
                onClick={() => setGedungFilter(val)}
              >
                {label}
              </Button>
            ))}
          </div>

          <div style={{ minWidth: '240px' }}>
            <Input
              aria-label="Cari ruangan"
              placeholder="Cari kode atau label ruangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Urutan</th>
                <th>Kode Ruangan</th>
                <th>Label / Kategori</th>
                <th>Kelompok Gedung</th>
                <th>Alokasi Generator</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>#{r.urutan}</strong>
                  </td>
                  <td>
                    <strong>{r.kode}</strong>
                  </td>
                  <td>{r.label}</td>
                  <td>
                    <Badge
                      tone={
                        r.gedung === 'Gedung B'
                          ? 'primary'
                          : r.gedung === 'Gedung E'
                            ? 'secondary'
                            : 'accent'
                      }
                    >
                      {r.gedung}
                    </Badge>
                  </td>
                  <td>
                    {r.urutan <= 22 ? (
                      <Badge tone="success">
                        Otomatis (Tahap 1 Kelas Biasa &amp; Tahap 2 Lab)
                      </Badge>
                    ) : (
                      <Badge tone="secondary">
                        Dikosongkan Generator (Atur Manual Drag &amp; Drop)
                      </Badge>
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
