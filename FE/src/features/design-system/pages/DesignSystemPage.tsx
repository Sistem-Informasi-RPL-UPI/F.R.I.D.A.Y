import { Link } from 'react-router';
import {
  Alert,
  Badge,
  Button,
  Card,
  FormField,
  Input,
} from '../../../shared/ui';

const COLOR_SWATCHES = [
  { name: 'Vibrant Blue', hex: '#0101B7', role: 'Primary' },
  { name: 'Dreamy', hex: '#8DCCF1', role: 'Secondary' },
  { name: 'WarmY', hex: '#FFD166', role: 'Accent' },
  { name: 'Alice', hex: '#F2F7FF', role: 'Neutral' },
] as const;

export function DesignSystemPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
          <Badge tone="primary">Design System v1.0</Badge>
          <h1 style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
            FRIDAY UI Tokens
          </h1>
          <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
            Referensi warna, tipografi, grid, spasi, dan komponen untuk seluruh
            anggota tim.
          </p>
        </div>
        <Link to="/">
          <Button variant="outline">Kembali ke Beranda</Button>
        </Link>
      </header>

      <section aria-labelledby="ds-colors">
        <h5 id="ds-colors">01. Color Palette</h5>
        <div className="ds-grid">
          {COLOR_SWATCHES.map((swatch) => (
            <div key={swatch.hex} className="ds-col-3">
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '6rem',
                    backgroundColor: swatch.hex,
                    borderBottom: '1px solid var(--color-border)',
                  }}
                />
                <div style={{ padding: '1rem' }}>
                  <strong>{swatch.name}</strong>
                  <div
                    style={{
                      fontSize: 'var(--text-body-sm-size)',
                      color: 'var(--color-ink-muted)',
                    }}
                  >
                    {swatch.hex}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-body-sm-size)',
                      fontWeight: 600,
                      marginTop: '0.25rem',
                    }}
                  >
                    {swatch.role}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="ds-typography">
        <h5 id="ds-typography">02. Typography (Lexend & Plus Jakarta Sans)</h5>
        <Card>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <h1>Heading 1 — 56px / 61.6px</h1>
            <h2>Heading 2 — 48px / 52.8px</h2>
            <h3>Heading 3 — 40px / 44px</h3>
            <h4>Heading 4 — 32px / 35.2px</h4>
            <h5>Heading 5 — 24px / 26.4px</h5>
            <h6>Heading 6 — 20px / 22px</h6>
            <hr style={{ width: '100%', borderColor: 'var(--color-border)' }} />
            <p style={{ fontSize: 'var(--text-body-lg-size)', margin: 0 }}>
              Large Text — 24px (Plus Jakarta Sans)
            </p>
            <p style={{ fontSize: 'var(--text-body-md-size)', margin: 0 }}>
              Normal Text — 16px (Plus Jakarta Sans)
            </p>
            <p style={{ fontSize: 'var(--text-body-sm-size)', margin: 0 }}>
              Small Text — 13px (Plus Jakarta Sans)
            </p>
          </div>
        </Card>
      </section>

      <section aria-labelledby="ds-components">
        <h5 id="ds-components">03. Component System</h5>
        <div className="ds-grid">
          <div className="ds-col-6">
            <Card>
              <h6>Buttons & Badges</h6>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="danger">Danger</Button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <Badge tone="primary">Terjadwal</Badge>
                <Badge tone="secondary">Dipinjam</Badge>
                <Badge tone="accent">Menunggu</Badge>
                <Badge tone="success">Disetujui</Badge>
                <Badge tone="danger">Konflik</Badge>
              </div>
            </Card>
          </div>

          <div className="ds-col-6">
            <Card>
              <h6>Form Field & Alert</h6>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <FormField id="ds-sample-room" label="Kode Ruangan">
                  <Input id="ds-sample-room" placeholder="Contoh: R.201" />
                </FormField>
                <Alert tone="info">
                  Gunakan token CSS dari <code>tokens.css</code> agar tampilan
                  antar-modul tetap konsisten.
                </Alert>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
