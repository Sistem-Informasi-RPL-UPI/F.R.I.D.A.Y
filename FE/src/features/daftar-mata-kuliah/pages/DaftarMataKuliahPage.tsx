import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  buildFilteredCoursesCsv,
  matchesProdiFilter,
  triggerBlobDownload,
  useJadwalStore,
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

type GroupByMode = 'NONE' | 'SEMESTER' | 'PRODI' | 'RUANGAN';

export function DaftarMataKuliahPage() {
  const navigate = useNavigate();
  const { rooms, readyCourses } = useJadwalStore();

  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');
  const [prodiFilter, setProdiFilter] = useState<string>('ALL');
  const [roomFilter, setRoomFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [groupBy, setGroupBy] = useState<GroupByMode>('NONE');
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  // FR-L1: Filter bersifat AND (Semester, Prodi, Ruangan, Pencarian)
  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return readyCourses.filter((mk) => {
      if (semesterFilter !== 'ALL' && mk.semester !== semesterFilter) {
        return false;
      }
      if (!matchesProdiFilter(mk.prodi, prodiFilter)) {
        return false;
      }
      if (roomFilter !== 'ALL') {
        if (roomFilter === 'UNASSIGNED') {
          if (mk.segments.length > 0 || mk.kebutuhanRuang === 'Online') {
            return false;
          }
        } else if (roomFilter === 'ONLINE') {
          if (mk.kebutuhanRuang !== 'Online') return false;
        } else {
          const targetRoomId = Number(roomFilter);
          if (!mk.segments.some((s) => s.room === targetRoomId)) {
            return false;
          }
        }
      }
      if (!q) return true;
      return (
        mk.kode.toLowerCase().includes(q) ||
        mk.nama.toLowerCase().includes(q) ||
        mk.prodi.toLowerCase().includes(q) ||
        mk.kelas.toLowerCase().includes(q) ||
        (mk.dosen1?.display.toLowerCase().includes(q) ?? false) ||
        (mk.dosen2?.display.toLowerCase().includes(q) ?? false)
      );
    });
  }, [prodiFilter, readyCourses, roomFilter, search, semesterFilter]);

  const totalFilteredSks = useMemo(
    () => filteredCourses.reduce((acc, c) => acc + c.sks, 0),
    [filteredCourses],
  );

  // FR-L2: Pengelompokan per Semester, Prodi, Ruangan, atau Tanpa Kelompok
  const groupedCourses = useMemo(() => {
    if (groupBy === 'NONE') {
      return [
        {
          key: 'ALL',
          title: 'Seluruh Mata Kuliah Hasil Filter',
          items: filteredCourses,
          totalSks: totalFilteredSks,
        },
      ];
    }

    const map = new Map<string, MataKuliah[]>();
    for (const mk of filteredCourses) {
      let groupKey = 'Lainnya';
      if (groupBy === 'SEMESTER') {
        groupKey = `Semester ${mk.semester}`;
      } else if (groupBy === 'PRODI') {
        groupKey = mk.prodi;
      } else if (groupBy === 'RUANGAN') {
        groupKey =
          mk.ruangDisplay !== '-'
            ? `Ruang ${mk.ruangDisplay}`
            : 'Belum Dapat Ruang';
      }
      const list = map.get(groupKey) ?? [];
      list.push(mk);
      map.set(groupKey, list);
    }

    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      title: key,
      items,
      totalSks: items.reduce((acc, c) => acc + c.sks, 0),
    }));
  }, [filteredCourses, groupBy, totalFilteredSks]);

  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleDownloadFilteredCsv() {
    const csv = buildFilteredCoursesCsv(filteredCourses);
    triggerBlobDownload(
      csv,
      'Daftar_Mata_Kuliah_Terfilter.csv',
      'text/csv;charset=utf-8;',
    );
  }

  function handleViewInMatrix(mk: MataKuliah) {
    const firstSeg = mk.segments[0];
    const params = new URLSearchParams();
    if (firstSeg) {
      params.set('hari', firstSeg.day);
      params.set('gedung', firstSeg.gedung);
    }
    params.set('highlight', String(mk.id));
    navigate(`/admin/jadwal/matriks?${params.toString()}`);
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
          <Badge tone="primary">Menu Mandiri • 6.7</Badge>
          <h4 style={{ marginTop: '0.35rem', marginBottom: '0.25rem' }}>
            Daftar Mata Kuliah
          </h4>
          <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
            Rekap seluruh mata kuliah lintas semester, prodi, dan ruangan yang
            selalu sinkron dengan Matriks Mind Mapping.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={handleDownloadFilteredCsv}
          disabled={filteredCourses.length === 0}
        >
          Unduh CSV Hasil Filter
        </Button>
      </header>

      {/* FR-L5: Empty state guidance */}
      {readyCourses.length === 0 ? (
        <Alert tone="info">
          Belum ada data mata kuliah di antrean jadwal. Silakan unggah berkas
          Kaprodi atau tambah mata kuliah di halaman{' '}
          <Link to="/admin/integrator">
            <strong>Integrator &amp; Generator (/admin/integrator)</strong>
          </Link>
          .
        </Alert>
      ) : null}

      {/* FR-L1 & FR-L2: Panel Filter AND & Pengelompokan */}
      <Card>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem',
            marginBottom: '1rem',
          }}
        >
          {['ALL', 'PGSD', 'PGPAUD', 'TEKKOM', 'RPL', 'PMM', 'MKDU'].map(
            (p) => (
              <Button
                key={p}
                size="sm"
                variant={prodiFilter === p ? 'primary' : 'outline'}
                onClick={() => setProdiFilter(p)}
              >
                {p === 'ALL' ? 'Semua Prodi' : p}
              </Button>
            ),
          )}
        </div>

        <div className="ds-grid">
          <div className="ds-col-3">
            <FormField id="f-semester" label="Filter Semester">
              <select
                id="f-semester"
                className="ds-select"
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
              >
                <option value="ALL">Semua Semester (1–8)</option>
                {['1', '2', '3', '4', '5', '6', '7', '8'].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="ds-col-3">
            <FormField id="f-ruangan" label="Filter Ruangan">
              <select
                id="f-ruangan"
                className="ds-select"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <option value="ALL">Semua Ruangan</option>
                <option value="UNASSIGNED">Belum Dapat Ruang (Parkir)</option>
                <option value="ONLINE">Online / Daring</option>
                <optgroup label="Gedung B (1–18)">
                  {rooms
                    .filter((r) => r.gedung === 'Gedung B')
                    .map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        #{r.urutan} — {r.kode}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Gedung E (19–22)">
                  {rooms
                    .filter((r) => r.gedung === 'Gedung E')
                    .map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        #{r.urutan} — {r.kode}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Smart Class & Lab (23–37)">
                  {rooms
                    .filter((r) => r.gedung === 'Smart Class & Lab')
                    .map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        #{r.urutan} — {r.kode} ({r.label})
                      </option>
                    ))}
                </optgroup>
              </select>
            </FormField>
          </div>

          <div className="ds-col-3">
            <FormField id="f-group" label="Pengelompokan">
              <select
                id="f-group"
                className="ds-select"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupByMode)}
              >
                <option value="NONE">Tanpa Kelompok</option>
                <option value="SEMESTER">Per Semester</option>
                <option value="PRODI">Per Program Studi</option>
                <option value="RUANGAN">Per Ruangan</option>
              </select>
            </FormField>
          </div>

          <div className="ds-col-3">
            <FormField id="f-search" label="Pencarian">
              <Input
                id="f-search"
                placeholder="Cari MK, kode, dosen, kelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </FormField>
          </div>
        </div>
      </Card>

      {/* FR-L4: Strip Ringkasan Hasil Filter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary-soft)',
          border: '1px solid var(--color-border-strong)',
        }}
      >
        <div>
          Menampilkan <strong>{filteredCourses.length} Mata Kuliah</strong> •
          Total Beban: <strong>{totalFilteredSks} SKS</strong>
        </div>
      </div>

      {/* FR-L2 & FR-L3: Tabel Daftar Mata Kuliah */}
      {groupedCourses.map((group) => {
        const isCollapsed = Boolean(collapsedGroups[group.key]);
        return (
          <Card key={group.key}>
            {groupBy !== 'NONE' && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: isCollapsed ? 0 : '0.75rem',
                  cursor: 'pointer',
                }}
                onClick={() => toggleGroup(group.key)}
              >
                <h6 style={{ margin: 0 }}>
                  {isCollapsed ? '▶' : '▼'} {group.title}
                </h6>
                <Badge tone="primary">
                  {group.items.length} MK • {group.totalSks} SKS
                </Badge>
              </div>
            )}

            {!isCollapsed && (
              <div className="ds-table-wrap">
                <table className="ds-table">
                  <thead>
                    <tr>
                      <th>Kode</th>
                      <th>Nama</th>
                      <th>Prodi</th>
                      <th>Semester</th>
                      <th>Kelas</th>
                      <th>SKS</th>
                      <th>Dosen 1</th>
                      <th>Dosen 2</th>
                      <th>Hari</th>
                      <th>Jam</th>
                      <th>Ruang</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={13}
                          style={{
                            textAlign: 'center',
                            color: 'var(--color-ink-muted)',
                            padding: '1.5rem',
                          }}
                        >
                          Tidak ada mata kuliah yang sesuai dengan filter.
                        </td>
                      </tr>
                    ) : (
                      group.items.map((mk) => (
                        <tr key={mk.id}>
                          <td>
                            <strong>{mk.kode}</strong>
                          </td>
                          <td>{mk.nama}</td>
                          <td>{mk.prodi}</td>
                          <td>{mk.semester}</td>
                          <td>{mk.kelas}</td>
                          <td>
                            <strong>{mk.sksDisplay}</strong>
                          </td>
                          <td>{mk.dosen1?.display ?? mk.kodeDosen1 ?? '-'}</td>
                          <td>{mk.dosen2?.display ?? mk.kodeDosen2 ?? '-'}</td>
                          <td>{mk.hariDisplay}</td>
                          <td>{mk.timeDisplay}</td>
                          <td>{mk.ruangDisplay}</td>
                          <td>
                            {mk.status === 'Online' ? (
                              <span className="ds-badge ds-badge--teal">
                                Online
                              </span>
                            ) : mk.status === 'Terpisah' ? (
                              <Badge tone="accent">Terpisah</Badge>
                            ) : mk.status === 'Terjadwal' ? (
                              <Badge tone="success">Terjadwal</Badge>
                            ) : (
                              <Badge tone="secondary">Diparkir</Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewInMatrix(mk)}
                            >
                              Lihat di Matriks
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
