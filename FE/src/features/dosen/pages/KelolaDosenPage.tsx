import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  parseDosenFile,
  useJadwalStore,
  type Dosen,
  type DosenStatus,
} from '../../../shared/jadwal';
import {
  Alert,
  Badge,
  Button,
  Card,
  FormField,
  Input,
} from '../../../shared/ui';

export function KelolaDosenPage() {
  const { dosenList, addDosen, updateDosen, deleteDosen, importDosenRows } =
    useJadwalStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | DosenStatus>('ALL');

  const [editingKode, setEditingKode] = useState<string | null>(null);
  const [kodeInput, setKodeInput] = useState('');
  const [namaInput, setNamaInput] = useState('');
  const [statusInput, setStatusInput] = useState<DosenStatus>('Dosen Tetap');

  const [feedback, setFeedback] = useState<{
    tone: 'info' | 'success' | 'warning' | 'danger';
    text: string;
  } | null>(null);

  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<{
    dosen: Dosen;
    affectedCount: number;
  } | null>(null);

  const stats = useMemo(() => {
    const total = dosenList.length;
    const tetap = dosenList.filter((d) => d.status === 'Dosen Tetap').length;
    const luar = dosenList.filter((d) => d.status === 'Dosen Luar').length;
    const belumMengampu = dosenList.filter((d) => d.jumlahMk === 0).length;
    return { total, tetap, luar, belumMengampu };
  }, [dosenList]);

  const filteredDosen = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dosenList.filter((d) => {
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        d.kode.toLowerCase().includes(q) ||
        d.nama.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q)
      );
    });
  }, [dosenList, search, statusFilter]);

  function resetForm() {
    setEditingKode(null);
    setKodeInput('');
    setNamaInput('');
    setStatusInput('Dosen Tetap');
  }

  function handleStartEdit(d: Dosen) {
    setEditingKode(d.kode);
    setKodeInput(d.kode);
    setNamaInput(d.nama);
    setStatusInput(d.status);
    setFeedback(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (editingKode) {
      const res = updateDosen(editingKode, {
        kode: kodeInput,
        nama: namaInput,
        status: statusInput,
      });
      if (!res.ok) {
        setFeedback({
          tone: 'danger',
          text: res.error ?? 'Gagal mengubah data dosen.',
        });
        return;
      }
      setFeedback({
        tone: res.warning ? 'warning' : 'success',
        text:
          res.warning ??
          `Data dosen ${kodeInput.trim().toUpperCase()} berhasil diperbarui.`,
      });
      resetForm();
    } else {
      const res = addDosen({
        kode: kodeInput,
        nama: namaInput,
        status: statusInput,
      });
      if (!res.ok) {
        setFeedback({
          tone: 'danger',
          text: res.error ?? 'Gagal menambah dosen.',
        });
        return;
      }
      setFeedback({
        tone: res.warning ? 'warning' : 'success',
        text:
          res.warning ??
          `Dosen ${kodeInput.trim().toUpperCase()} (${namaInput.trim()}) berhasil ditambahkan.`,
      });
      resetForm();
    }
  }

  function handleRequestDelete(d: Dosen) {
    const res = deleteDosen(d.kode, false);
    if (res.requiresConfirm) {
      setConfirmDeleteTarget({ dosen: d, affectedCount: res.affectedCount });
      return;
    }
    setFeedback({
      tone: 'info',
      text: `Dosen ${d.kode} (${d.nama}) telah dihapus.`,
    });
  }

  function handleConfirmForceDelete() {
    if (!confirmDeleteTarget) return;
    const { dosen, affectedCount } = confirmDeleteTarget;
    deleteDosen(dosen.kode, true);
    setConfirmDeleteTarget(null);
    setFeedback({
      tone: 'warning',
      text: `Dosen ${dosen.kode} (${dosen.nama}) dihapus dan dikosongkan pada ${affectedCount} mata kuliah.`,
    });
  }

  async function handleFileImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseDosenFile(file);
      const result = importDosenRows(rows);
      const dupText =
        result.duplicateCount > 0
          ? ` (${result.duplicateCount} kode duplikat dilewati tanpa menimpa data: ${result.duplicates.slice(0, 5).join(', ')})`
          : '';
      setFeedback({
        tone: result.duplicateCount > 0 ? 'warning' : 'success',
        text: `Impor ${file.name} selesai: ${result.importedCount} dosen baru ditambahkan${dupText}.`,
      });
    } catch {
      setFeedback({
        tone: 'danger',
        text: 'Gagal membaca berkas impor dosen. Pastikan format .xlsx atau .csv sesuai.',
      });
    } finally {
      e.target.value = '';
    }
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
          <Badge tone="primary">Data Dosen • 6.1</Badge>
          <h4 style={{ marginTop: '0.35rem', marginBottom: '0.25rem' }}>
            Kelola Dosen
          </h4>
          <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
            Pendaftaran master kode dosen unik, status kepegawaian, dan impor
            berkas data dosen (.xlsx / .csv).
          </p>
        </div>

        <label className="ds-btn ds-btn--secondary ds-btn--md">
          Impor Dosen (.xlsx / .csv)
          <input
            type="file"
            accept=".xlsx,.csv,.txt"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
        </label>
      </header>

      {feedback && <Alert tone={feedback.tone}>{feedback.text}</Alert>}

      {/* FR-D5: 4 Kartu Statistik */}
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
              Total Dosen
            </div>
            <h3
              style={{ margin: '0.25rem 0 0', color: 'var(--color-primary)' }}
            >
              {stats.total}
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
              Dosen Tetap
            </div>
            <h3
              style={{ margin: '0.25rem 0 0', color: 'var(--color-success)' }}
            >
              {stats.tetap}
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
              Dosen Luar
            </div>
            <h3 style={{ margin: '0.25rem 0 0', color: 'var(--color-info)' }}>
              {stats.luar}
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
              Belum Mengampu MK
            </div>
            <h3
              style={{ margin: '0.25rem 0 0', color: 'var(--color-warning)' }}
            >
              {stats.belumMengampu}
            </h3>
          </Card>
        </div>
      </div>

      {/* Form Tambah / Ubah Dosen */}
      <Card>
        <h6>
          {editingKode ? `Ubah Dosen (${editingKode})` : 'Tambah Dosen Baru'}
        </h6>
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'end',
          }}
        >
          <FormField id="dosen-kode" label="Kode Dosen (Wajib, Unik)">
            <Input
              id="dosen-kode"
              placeholder="Contoh: DSN005"
              value={kodeInput}
              onChange={(e) => setKodeInput(e.target.value.toUpperCase())}
              required
            />
          </FormField>

          <FormField id="dosen-nama" label="Nama Lengkap & Gelar (Wajib)">
            <Input
              id="dosen-nama"
              placeholder="Contoh: Dr. Ahmad Fauzi, M.Kom."
              value={namaInput}
              onChange={(e) => setNamaInput(e.target.value)}
              required
            />
          </FormField>

          <FormField id="dosen-status" label="Status Dosen">
            <select
              id="dosen-status"
              className="ds-select"
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value as DosenStatus)}
            >
              <option value="Dosen Tetap">Dosen Tetap</option>
              <option value="Dosen Luar">Dosen Luar</option>
            </select>
          </FormField>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="submit" variant="primary">
              {editingKode ? 'Simpan Perubahan' : 'Tambah Dosen'}
            </Button>
            {editingKode && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Tabel & Filter Dosen */}
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
            <Button
              size="sm"
              variant={statusFilter === 'ALL' ? 'primary' : 'outline'}
              onClick={() => setStatusFilter('ALL')}
            >
              Semua ({stats.total})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'Dosen Tetap' ? 'primary' : 'outline'}
              onClick={() => setStatusFilter('Dosen Tetap')}
            >
              Dosen Tetap ({stats.tetap})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'Dosen Luar' ? 'primary' : 'outline'}
              onClick={() => setStatusFilter('Dosen Luar')}
            >
              Dosen Luar ({stats.luar})
            </Button>
          </div>

          <div style={{ minWidth: '260px' }}>
            <Input
              aria-label="Cari dosen"
              placeholder="Cari kode atau nama dosen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Kode Dosen</th>
                <th>Nama Dosen</th>
                <th>Status</th>
                <th>Jumlah MK</th>
                <th>Total SKS</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDosen.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      color: 'var(--color-ink-muted)',
                      padding: '1.5rem',
                    }}
                  >
                    Tidak ada data dosen yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredDosen.map((d) => (
                  <tr key={d.kode}>
                    <td>
                      <strong>{d.kode}</strong>
                    </td>
                    <td>{d.nama}</td>
                    <td>
                      <Badge
                        tone={
                          d.status === 'Dosen Tetap' ? 'primary' : 'secondary'
                        }
                      >
                        {d.status}
                      </Badge>
                    </td>
                    <td>{d.jumlahMk} MK</td>
                    <td>{d.totalSks} SKS</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(d)}
                        >
                          Ubah
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRequestDelete(d)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* FR-D3: Modal Konfirmasi Hapus Dosen yang Masih Mengampu MK */}
      {confirmDeleteTarget && (
        <div className="ds-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ds-modal">
            <h5>Konfirmasi Hapus Dosen</h5>
            <p>
              Dosen{' '}
              <strong>
                {confirmDeleteTarget.dosen.kode} —{' '}
                {confirmDeleteTarget.dosen.nama}
              </strong>{' '}
              saat ini masih mengampu{' '}
              <strong>{confirmDeleteTarget.affectedCount} mata kuliah</strong>.
            </p>
            <Alert tone="warning">
              Jika dihapus, kolom dosen pada {confirmDeleteTarget.affectedCount}{' '}
              mata kuliah terdampak akan dikosongkan dan perlu dipetakan ulang
              sebelum generate jadwal.
            </Alert>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.25rem',
              }}
            >
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteTarget(null)}
              >
                Batal
              </Button>
              <Button variant="danger" onClick={handleConfirmForceDelete}>
                Hapus dan kosongkan dosen pada MK tersebut
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
