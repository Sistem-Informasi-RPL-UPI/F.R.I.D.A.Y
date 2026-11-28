import { useMemo, useState, type FormEvent } from 'react';
import {
  buildDayTimeSlots,
  useJadwalStore,
  type DayName,
} from '../../../shared/jadwal';
import {
  Alert,
  Badge,
  Button,
  Card,
  FormField,
  Input,
} from '../../../shared/ui';

export function SettingWaktuPage() {
  const { pengaturanWaktu, updatePengaturanWaktu } = useJadwalStore();

  const [durasiSks, setDurasiSks] = useState<number>(pengaturanWaktu.durasiSks);
  const [mulaiPagi, setMulaiPagi] = useState<string>(pengaturanWaktu.mulaiPagi);
  const [istirahat, setIstirahat] = useState<number>(pengaturanWaktu.istirahat);
  const [mulaiPagiJumat, setMulaiPagiJumat] = useState<string>(
    pengaturanWaktu.mulaiPagiJumat,
  );
  const [mulaiSiangJumat, setMulaiSiangJumat] = useState<string>(
    pengaturanWaktu.mulaiSiangJumat,
  );
  const [previewDay, setPreviewDay] = useState<DayName>('SENIN');
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'danger';
    text: string;
  } | null>(null);

  const previewSlots = useMemo(
    () =>
      buildDayTimeSlots(previewDay, {
        durasiSks: Math.max(15, Math.min(120, durasiSks || 50)),
        mulaiPagi,
        istirahat: Math.max(15, istirahat || 60),
        mulaiPagiJumat,
        mulaiSiangJumat,
      }),
    [
      durasiSks,
      istirahat,
      mulaiPagi,
      mulaiPagiJumat,
      mulaiSiangJumat,
      previewDay,
    ],
  );

  function handleApply(e: FormEvent) {
    e.preventDefault();
    const res = updatePengaturanWaktu({
      durasiSks,
      mulaiPagi,
      istirahat,
      mulaiPagiJumat,
      mulaiSiangJumat,
    });
    if (!res.ok) {
      setFeedback({
        tone: 'danger',
        text: res.error ?? 'Gagal menyimpan pengaturan waktu.',
      });
      return;
    }
    setFeedback({
      tone: 'success',
      text: `Setting waktu diterapkan (${durasiSks} menit/SKS). Seluruh label jam di Matriks Mind Mapping, Panel Parkir, Segmen Terpecah, dan Daftar Mata Kuliah telah dihitung ulang secara sinkron.`,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <Badge tone="primary">Pengaturan • 6.8</Badge>
        <h4 style={{ marginTop: '0.35rem', marginBottom: '0.25rem' }}>
          Setting Waktu Perkuliahan
        </h4>
        <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
          Konfigurasi durasi menit per SKS (15–120m), jam mulai pagi, durasi
          istirahat, dan jadwal khusus hari Jumat.
        </p>
      </header>

      {feedback && <Alert tone={feedback.tone}>{feedback.text}</Alert>}

      <div className="ds-grid">
        <div className="ds-col-6">
          <Card>
            <h6>Parameter Waktu &amp; Preset</h6>
            <form
              onSubmit={handleApply}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div>
                <div
                  className="ds-field__label"
                  style={{ marginBottom: '0.4rem' }}
                >
                  Preset Durasi per SKS (FR-T1)
                </div>
                <div
                  style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
                >
                  {[50, 45, 40, 60].map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      size="sm"
                      variant={durasiSks === preset ? 'primary' : 'outline'}
                      onClick={() => setDurasiSks(preset)}
                    >
                      {preset}m / SKS
                    </Button>
                  ))}
                </div>
              </div>

              <FormField id="sw-durasi" label="Durasi per SKS (15–120 menit)">
                <Input
                  id="sw-durasi"
                  type="number"
                  min={15}
                  max={120}
                  value={durasiSks}
                  onChange={(e) => setDurasiSks(Number(e.target.value))}
                  required
                />
              </FormField>

              <div className="ds-grid">
                <div className="ds-col-6">
                  <FormField
                    id="sw-mulai-pagi"
                    label="Jam Mulai Pagi (Senin–Kamis & Sabtu)"
                  >
                    <Input
                      id="sw-mulai-pagi"
                      type="time"
                      value={mulaiPagi}
                      onChange={(e) => setMulaiPagi(e.target.value)}
                      required
                    />
                  </FormField>
                </div>
                <div className="ds-col-6">
                  <FormField id="sw-istirahat" label="Durasi Istirahat (Menit)">
                    <Input
                      id="sw-istirahat"
                      type="number"
                      min={15}
                      max={180}
                      value={istirahat}
                      onChange={(e) => setIstirahat(Number(e.target.value))}
                      required
                    />
                  </FormField>
                </div>
              </div>

              <div className="ds-grid">
                <div className="ds-col-6">
                  <FormField
                    id="sw-pagi-jumat"
                    label="Jam Mulai Pagi (Khusus Jumat)"
                  >
                    <Input
                      id="sw-pagi-jumat"
                      type="time"
                      value={mulaiPagiJumat}
                      onChange={(e) => setMulaiPagiJumat(e.target.value)}
                      required
                    />
                  </FormField>
                </div>
                <div className="ds-col-6">
                  <FormField
                    id="sw-siang-jumat"
                    label="Jam Mulai Siang Jumat (Setelah Sholat Jumat)"
                  >
                    <Input
                      id="sw-siang-jumat"
                      type="time"
                      value={mulaiSiangJumat}
                      onChange={(e) => setMulaiSiangJumat(e.target.value)}
                      required
                    />
                  </FormField>
                </div>
              </div>

              <Button type="submit" variant="primary">
                Terapkan &amp; Hitung Ulang Semua Slot Waktu
              </Button>
            </form>
          </Card>
        </div>

        <div className="ds-col-6">
          <Card>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <h6 style={{ margin: 0 }}>Pratinjau Kalkulasi Pos Waktu</h6>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <Button
                  size="sm"
                  variant={previewDay === 'SENIN' ? 'primary' : 'outline'}
                  onClick={() => setPreviewDay('SENIN')}
                >
                  Senin–Kamis / Sabtu
                </Button>
                <Button
                  size="sm"
                  variant={previewDay === 'JUMAT' ? 'primary' : 'outline'}
                  onClick={() => setPreviewDay('JUMAT')}
                >
                  Khusus Jumat
                </Button>
              </div>
            </div>

            <div className="ds-table-wrap">
              <table className="ds-table">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Sesi</th>
                    <th>Rentang Jam</th>
                  </tr>
                </thead>
                <tbody>
                  {previewSlots.map((s, idx) => (
                    <tr
                      key={idx}
                      style={
                        s.isBreak
                          ? {
                              backgroundColor: 'var(--color-accent-soft)',
                              fontWeight: 700,
                            }
                          : undefined
                      }
                    >
                      <td>{s.isBreak ? '-' : `Pos ${s.pos}`}</td>
                      <td>
                        {s.isBreak ? (
                          <Badge tone="accent">ISTIRAHAT</Badge>
                        ) : s.session === 'pagi' ? (
                          <Badge tone="primary">Sesi Pagi</Badge>
                        ) : (
                          <Badge tone="secondary">Sesi Siang/Sore</Badge>
                        )}
                      </td>
                      <td>
                        <strong>{s.label}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
