import { useMemo, useState } from 'react';
import {
  ALL_DAYS,
  useJadwalStore,
  WORK_DAYS,
  type DayName,
  type Dosen,
} from '../../../shared/jadwal';
import {
  Alert,
  Badge,
  Button,
  Card,
  FormField,
  Input,
} from '../../../shared/ui';

type FilterMode = 'ALL' | 'CUSTOM' | 'FLEXIBLE' | 'LUAR';

export function KetersediaanDosenPage() {
  const { dosenList, updateKetersediaanDosen } = useJadwalStore();

  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [hideWithoutCourses, setHideWithoutCourses] = useState<boolean>(true);
  const [search, setSearch] = useState('');

  const [activeDosen, setActiveDosen] = useState<Dosen | null>(null);
  const [selectedDays, setSelectedDays] = useState<DayName[]>([...WORK_DAYS]);
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('17:00');
  const [modalError, setModalError] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dosenList.filter((d) => {
      if (hideWithoutCourses && d.jumlahMk === 0) return false;
      if (filterMode === 'CUSTOM' && !d.ketersediaan.isCustom) return false;
      if (filterMode === 'FLEXIBLE' && d.ketersediaan.isCustom) return false;
      if (filterMode === 'LUAR' && d.status !== 'Dosen Luar') return false;
      if (!q) return true;
      const mkMatch = d.mataKuliah.some(
        (mk) =>
          mk.kode.toLowerCase().includes(q) ||
          mk.nama.toLowerCase().includes(q),
      );
      return (
        d.kode.toLowerCase().includes(q) ||
        d.nama.toLowerCase().includes(q) ||
        mkMatch
      );
    });
  }, [dosenList, filterMode, hideWithoutCourses, search]);

  function openModal(d: Dosen) {
    setActiveDosen(d);
    setSelectedDays([...d.ketersediaan.hari]);
    setStartTime(d.ketersediaan.startTime);
    setEndTime(d.ketersediaan.endTime);
    setModalError(null);
  }

  function toggleDay(day: DayName) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function handleSaveModal() {
    if (!activeDosen) return;
    const res = updateKetersediaanDosen(activeDosen.kode, {
      hari: selectedDays,
      startTime,
      endTime,
    });
    if (!res.ok) {
      setModalError(res.error ?? 'Pengaturan waktu tidak valid.');
      return;
    }
    setSavedBanner(
      `Ketersediaan mengajar ${activeDosen.kode} (${activeDosen.nama}) berhasil disimpan.`,
    );
    setActiveDosen(null);
  }

  function handleResetFlexible() {
    if (!activeDosen) return;
    updateKetersediaanDosen(activeDosen.kode, { reset: true });
    setSavedBanner(
      `Jadwal mengajar ${activeDosen.kode} (${activeDosen.nama}) direset ke Bebas Fleksibel (Senin–Jumat 07:00–17:00).`,
    );
    setActiveDosen(null);
  }

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
          <Badge tone="primary">Data Dosen • 6.3</Badge>
          <h4 style={{ marginTop: '0.35rem', marginBottom: '0.25rem' }}>
            Ketersediaan Dosen
          </h4>
          <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
            Atur preferensi hari dan rentang jam mengajar dosen yang wajib
            dipatuhi Generator dan validasi Matriks.
          </p>
        </div>

        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: 'var(--text-body-sm-size)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={hideWithoutCourses}
            onChange={(e) => setHideWithoutCourses(e.target.checked)}
          />
          Sembunyikan dosen tanpa MK
        </label>
      </header>

      {savedBanner && <Alert tone="success">{savedBanner}</Alert>}

      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Button
              size="sm"
              variant={filterMode === 'ALL' ? 'primary' : 'outline'}
              onClick={() => setFilterMode('ALL')}
            >
              Semua Dosen
            </Button>
            <Button
              size="sm"
              variant={filterMode === 'CUSTOM' ? 'primary' : 'outline'}
              onClick={() => setFilterMode('CUSTOM')}
            >
              Punya Jadwal Khusus
            </Button>
            <Button
              size="sm"
              variant={filterMode === 'FLEXIBLE' ? 'primary' : 'outline'}
              onClick={() => setFilterMode('FLEXIBLE')}
            >
              Bebas Fleksibel
            </Button>
            <Button
              size="sm"
              variant={filterMode === 'LUAR' ? 'primary' : 'outline'}
              onClick={() => setFilterMode('LUAR')}
            >
              Dosen Luar
            </Button>
          </div>

          <div style={{ minWidth: '260px' }}>
            <Input
              aria-label="Cari dosen atau MK"
              placeholder="Cari kode, nama dosen, atau MK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="ds-grid">
        {filteredList.length === 0 ? (
          <div className="ds-col-12">
            <Card>
              <p style={{ margin: 0, color: 'var(--color-ink-muted)' }}>
                Tidak ada dosen yang cocok dengan filter saat ini.
              </p>
            </Card>
          </div>
        ) : (
          filteredList.map((d) => (
            <div key={d.kode} className="ds-col-6">
              <Card>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong>{d.kode}</strong>
                      <Badge
                        tone={
                          d.status === 'Dosen Tetap' ? 'primary' : 'secondary'
                        }
                      >
                        {d.status}
                      </Badge>
                      <Badge
                        tone={d.ketersediaan.isCustom ? 'accent' : 'success'}
                      >
                        {d.ketersediaan.isCustom
                          ? 'Jadwal Khusus'
                          : 'Bebas Fleksibel'}
                      </Badge>
                    </div>
                    <h6 style={{ margin: '0.35rem 0 0' }}>{d.nama}</h6>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openModal(d)}
                  >
                    Atur Hari &amp; Jam
                  </Button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: 'var(--text-body-sm-size)',
                    color: 'var(--color-ink-secondary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span>
                    Total SKS: <strong>{d.totalSks} SKS</strong>
                  </span>
                  <span>
                    Jumlah Kelas: <strong>{d.jumlahMk} Kelas</strong>
                  </span>
                </div>

                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-surface-muted)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--text-body-sm-size)',
                  }}
                >
                  <div>
                    <strong>Hari:</strong> {d.ketersediaan.hari.join(', ')}
                  </div>
                  <div>
                    <strong>Rentang Jam:</strong> {d.ketersediaan.startTime} –{' '}
                    {d.ketersediaan.endTime}
                  </div>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* FR-K4: Modal Pengaturan Ketersediaan Dosen */}
      {activeDosen && (
        <div className="ds-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ds-modal">
            <h5>
              Atur Ketersediaan — {activeDosen.kode} ({activeDosen.nama})
            </h5>

            {modalError && (
              <div style={{ marginBottom: '1rem' }}>
                <Alert tone="danger">{modalError}</Alert>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <div
                className="ds-field__label"
                style={{ marginBottom: '0.5rem' }}
              >
                Hari yang Diizinkan (Preset &amp; Pilihan)
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.5rem',
                }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedDays([...WORK_DAYS])}
                >
                  Senin–Jumat
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedDays(['SENIN', 'RABU', 'JUMAT'])}
                >
                  Senin, Rabu, Jumat
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedDays(['SELASA', 'KAMIS'])}
                >
                  Selasa &amp; Kamis
                </Button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {ALL_DAYS.map((day) => {
                  const active = selectedDays.includes(day);
                  return (
                    <Button
                      key={day}
                      size="sm"
                      variant={active ? 'primary' : 'outline'}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div
                className="ds-field__label"
                style={{ marginBottom: '0.5rem' }}
              >
                Preset Rentang Jam Mengajar
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.75rem',
                }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setStartTime('07:00');
                    setEndTime('17:00');
                  }}
                >
                  Semua Jam (07:00–17:00)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setStartTime('07:00');
                    setEndTime('12:00');
                  }}
                >
                  Pagi Saja (07:00–12:00)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setStartTime('13:00');
                    setEndTime('17:00');
                  }}
                >
                  Siang/Sore (13:00–17:00)
                </Button>
              </div>

              <div className="ds-grid">
                <div className="ds-col-6">
                  <FormField id="k-start-time" label="Jam Mulai">
                    <Input
                      id="k-start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </FormField>
                </div>
                <div className="ds-col-6">
                  <FormField id="k-end-time" label="Jam Selesai">
                    <Input
                      id="k-end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div
                className="ds-field__label"
                style={{ marginBottom: '0.35rem' }}
              >
                Daftar Mata Kuliah yang Diampu ({activeDosen.jumlahMk} MK •{' '}
                {activeDosen.totalSks} SKS)
              </div>
              {activeDosen.mataKuliah.length === 0 ? (
                <div
                  style={{
                    fontSize: 'var(--text-body-sm-size)',
                    color: 'var(--color-ink-muted)',
                  }}
                >
                  Belum mengampu mata kuliah pada semester ini.
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                  }}
                >
                  {activeDosen.mataKuliah.map((mk) => (
                    <Badge key={mk.id} tone="secondary">
                      {mk.prodi} {mk.semester}
                      {mk.kelas} • {mk.kode} ({mk.sks} SKS)
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <Button variant="outline" onClick={handleResetFlexible}>
                Reset ke Fleksibel
              </Button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="outline" onClick={() => setActiveDosen(null)}>
                  Batal
                </Button>
                <Button variant="primary" onClick={handleSaveModal}>
                  Selesai &amp; Simpan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
