import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  downloadKaprodiTemplate,
  KEBUTUHAN_RUANG_OPTIONS,
  matchesProdiFilter,
  parseCourseFile,
  PRODI_OPTIONS,
  useJadwalStore,
  type DosenStatus,
  type KebutuhanRuang,
  type MataKuliah,
} from '../../../shared/jadwal';
import {
  Alert,
  Badge,
  Button,
  Card,
  FormField,
  Input,
} from '../../../shared/ui';

export function IntegratorPage() {
  const navigate = useNavigate();
  const {
    dosenList,
    readyCourses,
    pendingDosenCourses,
    uploadedFiles,
    lastAudit,
    importCourseRows,
    addManualCourse,
    mapPendingCourseLecturers,
    autoRegisterAllPendingLecturers,
    addDosen,
    deleteCourse,
    clearAllCourses,
    generateSchedule,
  } = useJadwalStore();

  const [prodiFilter, setProdiFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{
    tone: 'info' | 'success' | 'warning' | 'danger';
    text: string;
  } | null>(null);

  // Manual course modal state (FR-M12)
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [mProdi, setMProdi] = useState<string>('RPL');
  const [mKode, setMKode] = useState('');
  const [mNama, setMNama] = useState('');
  const [mSks, setMSks] = useState<number>(3);
  const [mSemester, setMSemester] = useState('3');
  const [mKelas, setMKelas] = useState('3A');
  const [mDosen1, setMDosen1] = useState('');
  const [mDosen2, setMDosen2] = useState('');
  const [mDosenSearch, setMDosenSearch] = useState('');
  const [mRuang, setMRuang] = useState<KebutuhanRuang>('Ruang Kelas Biasa');
  const [manualError, setManualError] = useState<string | null>(null);

  // Mapping pending lecturer state (FR-M9)
  const [mappingCourse, setMappingCourse] = useState<MataKuliah | null>(null);
  const [mapKode1, setMapKode1] = useState('');
  const [mapKode2, setMapKode2] = useState('');
  const [newDosenKode, setNewDosenKode] = useState('');
  const [newDosenNama, setNewDosenNama] = useState('');
  const [newDosenStatus, setNewDosenStatus] =
    useState<DosenStatus>('Dosen Tetap');
  const [mapError, setMapError] = useState<string | null>(null);

  // Queue statistics (FR-M11)
  const stats = useMemo(() => {
    const totalMk = readyCourses.length;
    const totalSks = readyCourses.reduce((acc, c) => acc + c.sks, 0);
    const activeCodeSet = new Set<string>();
    for (const c of readyCourses) {
      if (c.kodeDosen1) activeCodeSet.add(c.kodeDosen1);
      if (c.kodeDosen2) activeCodeSet.add(c.kodeDosen2);
    }
    let customScheduleLecturers = 0;
    for (const code of activeCodeSet) {
      const d = dosenList.find((item) => item.kode === code);
      if (d?.ketersediaan.isCustom) customScheduleLecturers++;
    }
    const teamTeaching = readyCourses.filter((c) =>
      Boolean(c.kodeDosen2),
    ).length;

    return {
      totalMk,
      totalSks,
      dosenPengampu: activeCodeSet.size,
      customScheduleLecturers,
      teamTeaching,
    };
  }, [dosenList, readyCourses]);

  const filteredQueue = useMemo(() => {
    const q = search.trim().toLowerCase();
    return readyCourses.filter((c) => {
      if (!matchesProdiFilter(c.prodi, prodiFilter)) return false;
      if (!q) return true;
      return (
        c.kode.toLowerCase().includes(q) ||
        c.nama.toLowerCase().includes(q) ||
        c.prodi.toLowerCase().includes(q) ||
        c.kelas.toLowerCase().includes(q) ||
        (c.dosen1?.display.toLowerCase().includes(q) ?? false) ||
        (c.dosen2?.display.toLowerCase().includes(q) ?? false)
      );
    });
  }, [prodiFilter, readyCourses, search]);

  const searchableDosenOptions = useMemo(() => {
    const q = mDosenSearch.trim().toLowerCase();
    if (!q) return dosenList;
    return dosenList.filter(
      (d) =>
        d.kode.toLowerCase().includes(q) || d.nama.toLowerCase().includes(q),
    );
  }, [dosenList, mDosenSearch]);

  async function handleMultiFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    let totalAccepted = 0;
    let totalAutoDosen = 0;
    let totalRejected = 0;

    for (const file of files) {
      try {
        const rows = await parseCourseFile(file);
        const res = importCourseRows(rows, file.name);
        totalAccepted += res.acceptedCount;
        totalAutoDosen += res.autoRegisteredDosenCount;
        totalRejected += res.rejectedCount;
      } catch {
        totalRejected++;
      }
    }

    e.target.value = '';
    const autoDosenNote =
      totalAutoDosen > 0
        ? `, serta ${totalAutoDosen} dosen baru otomatis terdaftar ke Kelola Dosen`
        : '';
    setFeedback({
      tone: 'success',
      text: `Ringkasan Unggah (${files.length} berkas): ${totalAccepted} MK langsung masuk antrean siap generate${autoDosenNote}${totalRejected > 0 ? ` (${totalRejected} baris duplikat/ditolak)` : ''}.`,
    });
  }

  function handleOpenManualModal() {
    setMDosen1(dosenList[0]?.kode ?? '');
    setMDosen2('');
    setMDosenSearch('');
    setManualError(null);
    setManualModalOpen(true);
  }

  function handleSubmitManualCourse(e: FormEvent) {
    e.preventDefault();
    const res = addManualCourse({
      prodi: mProdi,
      kode: mKode,
      nama: mNama,
      sks: mSks,
      semester: mSemester,
      kelas: mKelas,
      kodeDosen1: mDosen1,
      kodeDosen2: mDosen2 || null,
      kebutuhanRuang: mRuang,
    });

    if (!res.ok) {
      setManualError(res.error ?? 'Gagal menambahkan mata kuliah.');
      return;
    }

    setManualModalOpen(false);
    setMKode('');
    setMNama('');
    setFeedback({
      tone: 'success',
      text: `Berhasil menambahkan ${res.createdCount} baris mata kuliah ke antrean.`,
    });
  }

  function openMappingModal(mk: MataKuliah) {
    setMappingCourse(mk);
    setMapKode1(mk.kodeDosen1 ?? dosenList[0]?.kode ?? '');
    setMapKode2(mk.kodeDosen2 ?? '');
    setNewDosenKode('');
    setNewDosenNama(mk.rawDosen1 ?? '');
    setMapError(null);
  }

  function handleSaveMapping() {
    if (!mappingCourse) return;
    const res = mapPendingCourseLecturers(mappingCourse.id, {
      kodeDosen1: mapKode1,
      kodeDosen2: mapKode2 || null,
    });
    if (!res.ok) {
      setMapError(res.error ?? 'Gagal memetakan dosen.');
      return;
    }
    setFeedback({
      tone: 'success',
      text: `Mata kuliah ${mappingCourse.kode} (${mappingCourse.kelas}) berhasil dipetakan dan masuk antrean siap generate.`,
    });
    setMappingCourse(null);
  }

  function handleQuickRegisterAndMap() {
    if (!mappingCourse) return;
    const addRes = addDosen({
      kode: newDosenKode,
      nama: newDosenNama,
      status: newDosenStatus,
    });
    if (!addRes.ok) {
      setMapError(addRes.error ?? 'Gagal mendaftarkan dosen baru.');
      return;
    }
    const cleanCode = newDosenKode.trim().toUpperCase();
    mapPendingCourseLecturers(mappingCourse.id, {
      kodeDosen1: cleanCode,
      kodeDosen2: mapKode2 || null,
    });
    setFeedback({
      tone: 'success',
      text: `Dosen baru ${cleanCode} (${newDosenNama}) berhasil didaftarkan dan MK ${mappingCourse.kode} masuk antrean.`,
    });
    setMappingCourse(null);
  }

  function handleRunGenerator() {
    const audit = generateSchedule();
    setFeedback({
      tone: 'success',
      text: `Generate jadwal selesai: ${audit.scheduled_count} MK terjadwal otomatis di Ruang 1–22, ${audit.parked_count} MK diparkir, ${audit.conflicts_count} bentrok.`,
    });
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
          <Badge tone="primary">Penjadwalan • 6.2 &amp; 6.4</Badge>
          <h4 style={{ marginTop: '0.35rem', marginBottom: '0.25rem' }}>
            Integrator &amp; Generator Jadwal
          </h4>
          <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
            Unduh template Kaprodi, unggah multi-berkas mata kuliah, petakan
            dosen, dan jalankan Generator jadwal awal bebas bentrok.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Button variant="outline" onClick={downloadKaprodiTemplate}>
            Unduh Template Kaprodi (.xlsx)
          </Button>
          <label className="ds-btn ds-btn--secondary ds-btn--md">
            Unggah Berkas Kaprodi (.xlsx / .csv / .txt)
            <input
              type="file"
              accept=".xlsx,.csv,.txt"
              multiple
              onChange={handleMultiFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          <Button variant="outline" onClick={handleOpenManualModal}>
            + Tambah MK Manual
          </Button>
          <Button
            variant="primary"
            onClick={handleRunGenerator}
            disabled={readyCourses.length === 0}
          >
            Generate Jadwal Otomatis
          </Button>
        </div>
      </header>

      {/* FR-M10: Banner bila Data Dosen kosong */}
      {dosenList.length === 0 && (
        <Alert tone="warning">
          <strong>Data Dosen masih kosong!</strong> Silakan daftarkan atau impor
          data dosen terlebih dahulu di halaman{' '}
          <Link to="/admin/dosen">
            <strong>Kelola Dosen (/admin/dosen)</strong>
          </Link>{' '}
          agar pencocokan dosen berjalan otomatis.
        </Alert>
      )}

      {feedback && <Alert tone={feedback.tone}>{feedback.text}</Alert>}

      {/* FR-M3: Chip berkas yang diunggah */}
      {uploadedFiles.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {uploadedFiles.map((chip) => (
            <Badge key={chip.fileName} tone="secondary">
              {chip.fileName} ({chip.courseCount} MK)
            </Badge>
          ))}
        </div>
      )}

      {/* FR-M11: 4 Kartu Statistik Antrean */}
      <div className="ds-grid">
        <div className="ds-col-3">
          <Card>
            <div
              style={{
                fontSize: 'var(--text-body-sm-size)',
                color: 'var(--color-ink-muted)',
                fontWeight: 600,
              }}
            >
              Total MK (Siap Antrean)
            </div>
            <h3
              style={{ margin: '0.25rem 0 0', color: 'var(--color-primary)' }}
            >
              {stats.totalMk}
            </h3>
          </Card>
        </div>
        <div className="ds-col-3">
          <Card>
            <div
              style={{
                fontSize: 'var(--text-body-sm-size)',
                color: 'var(--color-ink-muted)',
                fontWeight: 600,
              }}
            >
              Total SKS
            </div>
            <h3 style={{ margin: '0.25rem 0 0', color: 'var(--color-info)' }}>
              {stats.totalSks}
            </h3>
          </Card>
        </div>
        <div className="ds-col-3">
          <Card>
            <div
              style={{
                fontSize: 'var(--text-body-sm-size)',
                color: 'var(--color-ink-muted)',
                fontWeight: 600,
              }}
            >
              Dosen Pengampu
            </div>
            <h3
              style={{ margin: '0.25rem 0 0', color: 'var(--color-success)' }}
            >
              {stats.dosenPengampu}
            </h3>
            <div
              style={{
                fontSize: 'var(--text-body-sm-size)',
                color: 'var(--color-ink-muted)',
              }}
            >
              {stats.customScheduleLecturers} berjadwal khusus
            </div>
          </Card>
        </div>
        <div className="ds-col-3">
          <Card>
            <div
              style={{
                fontSize: 'var(--text-body-sm-size)',
                color: 'var(--color-ink-muted)',
                fontWeight: 600,
              }}
            >
              Team Teaching
            </div>
            <h3
              style={{ margin: '0.25rem 0 0', color: 'var(--color-warning)' }}
            >
              {stats.teamTeaching}
            </h3>
          </Card>
        </div>
      </div>

      {/* FR-G6 & FR-G11: Laporan Audit Generator */}
      {lastAudit && (
        <Card
          style={{
            borderColor: 'var(--color-primary)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
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
            <div>
              <Badge tone="success">Laporan Audit Generator (6.4)</Badge>
              <h5 style={{ margin: '0.35rem 0 0' }}>
                Hasil Penyusunan Jadwal &amp; Pemerataan Beban
              </h5>
            </div>

            <Button
              variant="primary"
              onClick={() => navigate('/admin/jadwal/matriks')}
            >
              Buka Matriks Mind Mapping (37 Ruangan) →
            </Button>
          </div>

          <div className="ds-grid">
            <div className="ds-col-3">
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-success-soft)',
                }}
              >
                <div style={{ fontSize: 'var(--text-body-sm-size)' }}>
                  MK Terjadwal (Ruang 1–22)
                </div>
                <strong style={{ fontSize: '1.35rem' }}>
                  {lastAudit.scheduled_count} MK
                </strong>
              </div>
            </div>
            <div className="ds-col-3">
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-accent-soft)',
                }}
              >
                <div style={{ fontSize: 'var(--text-body-sm-size)' }}>
                  MK Diparkir (Online: {lastAudit.parked_breakdown.online}, SKS
                  0: {lastAudit.parked_breakdown.zero_sks}, Overflow:{' '}
                  {lastAudit.parked_breakdown.overflow})
                </div>
                <strong style={{ fontSize: '1.35rem' }}>
                  {lastAudit.parked_count} MK
                </strong>
              </div>
            </div>
            <div className="ds-col-3">
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-soft)',
                }}
              >
                <div style={{ fontSize: 'var(--text-body-sm-size)' }}>
                  Bentrok Terdeteksi (Hard Constraint)
                </div>
                <strong style={{ fontSize: '1.35rem' }}>
                  {lastAudit.conflicts_count} Bentrok
                </strong>
              </div>
            </div>
            <div className="ds-col-3">
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-secondary-soft)',
                }}
              >
                <div style={{ fontSize: 'var(--text-body-sm-size)' }}>
                  Selisih SKS Harian Terbesar / Dosen 1 Ruang
                </div>
                <strong style={{ fontSize: '1.15rem' }}>
                  Maks {lastAudit.max_daily_sks_diff} SKS •{' '}
                  {lastAudit.single_room_lecturers_count} Dosen 1 Ruang
                </strong>
              </div>
            </div>
          </div>

          {lastAudit.balancing_notes.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <Alert tone="info">
                <strong>Catatan Pemerataan Harian:</strong>{' '}
                {lastAudit.balancing_notes
                  .map(
                    (n) =>
                      `${n.kodeDosen} (${n.namaDosen}, selisih ${n.selisihSksHarian} SKS: ${n.alasan})`,
                  )
                  .join(' | ')}
              </Alert>
            </div>
          )}
        </Card>
      )}

      {/* FR-M9: Baris Menunggu Dosen ("Dosen belum terdaftar") */}
      {pendingDosenCourses.length > 0 && (
        <Card style={{ borderColor: 'var(--color-danger)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <div>
              <Badge tone="danger">
                {pendingDosenCourses.length} Baris Ditahan dari Antrean
              </Badge>
              <h6 style={{ margin: '0.35rem 0 0' }}>
                Dosen Belum Terdaftar — Petakan atau Daftarkan Dosen Baru
              </h6>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                const res = autoRegisterAllPendingLecturers();
                setFeedback({
                  tone: 'success',
                  text: `Berhasil mendaftarkan ${res.registeredLecturersCount} dosen baru secara otomatis dan memasukkan ${res.resolvedCoursesCount} mata kuliah ke antrean siap generate!`,
                });
              }}
            >
              Daftarkan Semua Dosen Baru Otomatis ({pendingDosenCourses.length}{' '}
              MK)
            </Button>
          </div>

          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Prodi</th>
                  <th>Kode &amp; Nama MK</th>
                  <th>Sem/Kelas</th>
                  <th>SKS</th>
                  <th>Teks Dosen di Berkas</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingDosenCourses.map((mk) => (
                  <tr
                    key={mk.id}
                    style={{ backgroundColor: 'var(--color-danger-soft)' }}
                  >
                    <td>{mk.prodi}</td>
                    <td>
                      <strong>{mk.kode}</strong> — {mk.nama}
                    </td>
                    <td>
                      Sem {mk.semester} • {mk.kelas}
                    </td>
                    <td>{mk.sks}</td>
                    <td>
                      <div>Dosen 1: {mk.rawDosen1 ?? mk.kodeDosen1 ?? '-'}</div>
                      {mk.rawDosen2 && <div>Dosen 2: {mk.rawDosen2}</div>}
                    </td>
                    <td>
                      <Badge tone="danger">Dosen belum terdaftar</Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => openMappingModal(mk)}
                        >
                          Petakan / Daftarkan Dosen
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => deleteCourse(mk.id)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tabel Antrean Mata Kuliah */}
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {['ALL', 'PGSD', 'PGPAUD', 'TEKKOM', 'RPL', 'PMM'].map((p) => (
              <Button
                key={p}
                size="sm"
                variant={prodiFilter === p ? 'primary' : 'outline'}
                onClick={() => setProdiFilter(p)}
              >
                {p === 'ALL' ? 'Semua Prodi' : p}
              </Button>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <Input
              aria-label="Cari mata kuliah di antrean"
              placeholder="Cari MK, kode, dosen, kelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '240px' }}
            />
            {readyCourses.length > 0 && (
              <Button size="sm" variant="danger" onClick={clearAllCourses}>
                Kosongkan Antrean
              </Button>
            )}
          </div>
        </div>

        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Prodi</th>
                <th>Kode</th>
                <th>Nama Mata Kuliah</th>
                <th>SKS</th>
                <th>Sem</th>
                <th>Kelas</th>
                <th>Dosen 1</th>
                <th>Dosen 2</th>
                <th>Kebutuhan Ruang</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      textAlign: 'center',
                      color: 'var(--color-ink-muted)',
                      padding: '1.5rem',
                    }}
                  >
                    Belum ada mata kuliah pada filter antrean ini.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((mk) => (
                  <tr key={mk.id}>
                    <td>
                      <strong>{mk.prodi}</strong>
                    </td>
                    <td>{mk.kode}</td>
                    <td>{mk.nama}</td>
                    <td>{mk.sks}</td>
                    <td>{mk.semester}</td>
                    <td>{mk.kelas}</td>
                    <td>{mk.dosen1?.display ?? mk.kodeDosen1 ?? '-'}</td>
                    <td>{mk.dosen2?.display ?? mk.kodeDosen2 ?? '-'}</td>
                    <td>
                      {mk.kebutuhanRuang === 'Online' ? (
                        <span className="ds-badge ds-badge--teal">Online</span>
                      ) : mk.kebutuhanRuang === 'Laboratorium Praktikum' ? (
                        <Badge tone="accent">Laboratorium Praktikum</Badge>
                      ) : (
                        <Badge tone="primary">Ruang Kelas Biasa</Badge>
                      )}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteCourse(mk.id)}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* FR-M12: Modal Tambah MK Manual */}
      {manualModalOpen && (
        <div className="ds-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ds-modal">
            <h5>Tambah Mata Kuliah Manual</h5>
            {manualError && (
              <div style={{ marginBottom: '0.75rem' }}>
                <Alert tone="danger">{manualError}</Alert>
              </div>
            )}
            <form
              onSubmit={handleSubmitManualCourse}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              <div className="ds-grid">
                <div className="ds-col-6">
                  <FormField id="m-prodi" label="Program Studi">
                    <select
                      id="m-prodi"
                      className="ds-select"
                      value={mProdi}
                      onChange={(e) => setMProdi(e.target.value)}
                    >
                      {PRODI_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
                <div className="ds-col-6">
                  <FormField id="m-kode" label="Kode Mata Kuliah">
                    <Input
                      id="m-kode"
                      placeholder="Contoh: RL405"
                      value={mKode}
                      onChange={(e) => setMKode(e.target.value.toUpperCase())}
                      required
                    />
                  </FormField>
                </div>
              </div>

              <FormField id="m-nama" label="Nama Mata Kuliah">
                <Input
                  id="m-nama"
                  placeholder="Contoh: Pengujian Perangkat Lunak"
                  value={mNama}
                  onChange={(e) => setMNama(e.target.value)}
                  required
                />
              </FormField>

              <div className="ds-grid">
                <div className="ds-col-4">
                  <FormField id="m-sks" label="SKS (2–5)">
                    <select
                      id="m-sks"
                      className="ds-select"
                      value={mSks}
                      onChange={(e) => setMSks(Number(e.target.value))}
                    >
                      {[2, 3, 4, 5].map((s) => (
                        <option key={s} value={s}>
                          {s} SKS
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
                <div className="ds-col-4">
                  <FormField id="m-sem" label="Semester">
                    <Input
                      id="m-sem"
                      value={mSemester}
                      onChange={(e) => setMSemester(e.target.value)}
                      required
                    />
                  </FormField>
                </div>
                <div className="ds-col-4">
                  <FormField id="m-kelas" label="Kelas (Bisa Gabungan: 3A & B)">
                    <Input
                      id="m-kelas"
                      placeholder="Contoh: 3A & B"
                      value={mKelas}
                      onChange={(e) => setMKelas(e.target.value)}
                      required
                    />
                  </FormField>
                </div>
              </div>

              <FormField id="m-search-dosen" label="Filter Cepat Pilihan Dosen">
                <Input
                  id="m-search-dosen"
                  placeholder="Ketik kode atau nama dosen..."
                  value={mDosenSearch}
                  onChange={(e) => setMDosenSearch(e.target.value)}
                />
              </FormField>

              <div className="ds-grid">
                <div className="ds-col-6">
                  <FormField id="m-dosen1" label="Dosen 1 (Wajib)">
                    <select
                      id="m-dosen1"
                      className="ds-select"
                      value={mDosen1}
                      onChange={(e) => setMDosen1(e.target.value)}
                      required
                    >
                      <option value="">-- Pilih Dosen 1 --</option>
                      {searchableDosenOptions.map((d) => (
                        <option key={d.kode} value={d.kode}>
                          {d.kode} {d.nama} ({d.status})
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
                <div className="ds-col-6">
                  <FormField id="m-dosen2" label="Dosen 2 (Opsional)">
                    <select
                      id="m-dosen2"
                      className="ds-select"
                      value={mDosen2}
                      onChange={(e) => setMDosen2(e.target.value)}
                    >
                      <option value="">-- Tanpa Dosen 2 --</option>
                      {searchableDosenOptions.map((d) => (
                        <option key={d.kode} value={d.kode}>
                          {d.kode} {d.nama} ({d.status})
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </div>

              <FormField id="m-ruang" label="Kebutuhan Ruang Kelas">
                <select
                  id="m-ruang"
                  className="ds-select"
                  value={mRuang}
                  onChange={(e) => setMRuang(e.target.value as KebutuhanRuang)}
                >
                  {KEBUTUHAN_RUANG_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </FormField>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setManualModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary">
                  Tambah ke Antrean
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FR-M9: Modal Pemetaan / Pendaftaran Dosen untuk Baris Merah */}
      {mappingCourse && (
        <div className="ds-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ds-modal">
            <h5>
              Petakan Dosen — {mappingCourse.kode} ({mappingCourse.nama})
            </h5>
            <p style={{ fontSize: 'var(--text-body-sm-size)' }}>
              Teks pada berkas:{' '}
              <strong>{mappingCourse.rawDosen1 ?? '-'}</strong>
              {mappingCourse.rawDosen2 ? ` / ${mappingCourse.rawDosen2}` : ''}
            </p>
            {mapError && (
              <div style={{ marginBottom: '0.75rem' }}>
                <Alert tone="danger">{mapError}</Alert>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              <h6>Opsi 1: Petakan ke Dosen yang Sudah Terdaftar</h6>
              <FormField id="map-d1" label="Pilih Dosen 1">
                <select
                  id="map-d1"
                  className="ds-select"
                  value={mapKode1}
                  onChange={(e) => setMapKode1(e.target.value)}
                >
                  <option value="">-- Pilih Dosen --</option>
                  {dosenList.map((d) => (
                    <option key={d.kode} value={d.kode}>
                      {d.kode} {d.nama} ({d.status})
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField id="map-d2" label="Pilih Dosen 2 (Opsional)">
                <select
                  id="map-d2"
                  className="ds-select"
                  value={mapKode2}
                  onChange={(e) => setMapKode2(e.target.value)}
                >
                  <option value="">-- Tanpa Dosen 2 --</option>
                  {dosenList.map((d) => (
                    <option key={d.kode} value={d.kode}>
                      {d.kode} {d.nama} ({d.status})
                    </option>
                  ))}
                </select>
              </FormField>
              <Button variant="primary" onClick={handleSaveMapping}>
                Simpan Pemetaan Dosen
              </Button>
            </div>

            <hr style={{ borderColor: 'var(--color-border)' }} />

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginTop: '1rem',
              }}
            >
              <h6>Opsi 2: Daftarkan sebagai Dosen Baru</h6>
              <div className="ds-grid">
                <div className="ds-col-6">
                  <FormField id="new-d-kode" label="Kode Dosen Baru">
                    <Input
                      id="new-d-kode"
                      placeholder="Contoh: DSN099"
                      value={newDosenKode}
                      onChange={(e) =>
                        setNewDosenKode(e.target.value.toUpperCase())
                      }
                    />
                  </FormField>
                </div>
                <div className="ds-col-6">
                  <FormField id="new-d-status" label="Status">
                    <select
                      id="new-d-status"
                      className="ds-select"
                      value={newDosenStatus}
                      onChange={(e) =>
                        setNewDosenStatus(e.target.value as DosenStatus)
                      }
                    >
                      <option value="Dosen Tetap">Dosen Tetap</option>
                      <option value="Dosen Luar">Dosen Luar</option>
                    </select>
                  </FormField>
                </div>
              </div>
              <FormField id="new-d-nama" label="Nama Dosen Baru">
                <Input
                  id="new-d-nama"
                  value={newDosenNama}
                  onChange={(e) => setNewDosenNama(e.target.value)}
                />
              </FormField>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <Button
                  variant="outline"
                  onClick={() => setMappingCourse(null)}
                >
                  Tutup
                </Button>
                <Button variant="secondary" onClick={handleQuickRegisterAndMap}>
                  Daftarkan Dosen &amp; Masukkan ke Antrean
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
