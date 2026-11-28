import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { useSearchParams } from 'react-router';
import {
  ALL_DAYS,
  buildDayTimeSlots,
  buildFullMatrixCsv,
  buildOfflineHtmlDocument,
  exportMatrixImage,
  getProdiCardClass,
  triggerBlobDownload,
  useJadwalStore,
  type CandidateSegmentInput,
  type DayName,
  type JadwalSegmen,
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

type BuildingFilter = 'ALL' | 'Gedung B' | 'Gedung E' | 'Smart Class & Lab';

interface PendingSplitConfirmation {
  course: MataKuliah;
  proposal: [CandidateSegmentInput, CandidateSegmentInput];
  message: string;
}

export function JadwalMatriksPage() {
  const [searchParams] = useSearchParams();
  const {
    rooms,
    dosenList,
    readyCourses,
    parkedCourses,
    pengaturanWaktu,
    strictConflictValidation,
    canUndo,
    lastUndoMessage,
    setStrictConflictValidation,
    validatePlacement,
    placeCourse,
    parkCourse,
    swapCourses,
    undoLastScheduleAction,
  } = useJadwalStore();

  const paramDay = useMemo<'ALL' | DayName>(() => {
    const param = (searchParams.get('hari') ?? '').toUpperCase();
    return ALL_DAYS.includes(param as DayName) ? (param as DayName) : 'ALL';
  }, [searchParams]);

  const paramBuilding = useMemo<BuildingFilter>(() => {
    const param = searchParams.get('gedung');
    if (
      param === 'Gedung B' ||
      param === 'Gedung E' ||
      param === 'Smart Class & Lab'
    ) {
      return param;
    }
    return 'ALL';
  }, [searchParams]);

  const highlightedCourseId = useMemo<number | null>(() => {
    const h = Number(searchParams.get('highlight'));
    return Number.isFinite(h) && h > 0 ? h : null;
  }, [searchParams]);

  const [dayOverride, setDayFilter] = useState<'ALL' | DayName | null>(null);
  const [buildingOverride, setBuildingFilter] = useState<BuildingFilter | null>(
    null,
  );

  const dayFilter = dayOverride ?? paramDay;
  const buildingFilter = buildingOverride ?? paramBuilding;

  const [parkSearch, setParkSearch] = useState('');
  const [draggedCourseId, setDraggedCourseId] = useState<number | null>(null);
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<
    'valid' | 'invalid' | 'split' | null
  >(null);
  const [floatingAlert, setFloatingAlert] = useState<string | null>(null);
  const [pendingSplit, setPendingSplit] =
    useState<PendingSplitConfirmation | null>(null);
  const [detailCourse, setDetailCourse] = useState<MataKuliah | null>(null);

  // Quick placement inside detail modal (also enables keyboard/button placement)
  const [quickDay, setQuickDay] = useState<DayName>('SENIN');
  const [quickRoom, setQuickRoom] = useState<number>(1);
  const [quickPos, setQuickPos] = useState<number>(1);

  // FR-X7: Ctrl+Z keyboard shortcut for Undo
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoLastScheduleAction();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undoLastScheduleAction]);

  const visibleRooms = useMemo(() => {
    if (buildingFilter === 'ALL') return rooms;
    return rooms.filter((r) => r.gedung === buildingFilter);
  }, [buildingFilter, rooms]);

  const visibleDays = useMemo(() => {
    if (dayFilter === 'ALL') return ALL_DAYS;
    return [dayFilter];
  }, [dayFilter]);

  const filteredParked = useMemo(() => {
    const q = parkSearch.trim().toLowerCase();
    if (!q) return parkedCourses;
    return parkedCourses.filter(
      (c) =>
        c.kode.toLowerCase().includes(q) ||
        c.nama.toLowerCase().includes(q) ||
        c.prodi.toLowerCase().includes(q) ||
        c.kelas.toLowerCase().includes(q) ||
        (c.dosen1?.display.toLowerCase().includes(q) ?? false),
    );
  }, [parkSearch, parkedCourses]);

  // Build occupancy map: day|room|pos -> { course, segment, isStart }
  const slotOccupancy = useMemo(() => {
    const map = new Map<
      string,
      { course: MataKuliah; segment: JadwalSegmen; isStart: boolean }
    >();
    for (const mk of readyCourses) {
      for (const seg of mk.segments) {
        for (let p = seg.pos; p < seg.pos + seg.len; p++) {
          map.set(`${seg.day}|${seg.room}|${p}`, {
            course: mk,
            segment: seg,
            isStart: p === seg.pos,
          });
        }
      }
    }
    return map;
  }, [readyCourses]);

  function handleDragStart(e: DragEvent, courseId: number) {
    setDraggedCourseId(courseId);
    setFloatingAlert(null);
    e.dataTransfer.setData('text/plain', String(courseId));
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragEnd() {
    setDraggedCourseId(null);
    setHoveredSlotKey(null);
    setHoveredState(null);
  }

  function evaluateSlotTarget(
    sourceCourseId: number,
    day: DayName,
    roomId: number,
    pos: number,
  ) {
    const sourceCourse = readyCourses.find((c) => c.id === sourceCourseId);
    if (!sourceCourse) {
      return {
        mode: 'invalid' as const,
        reason: 'Mata kuliah tidak ditemukan.',
      };
    }

    const existing = slotOccupancy.get(`${day}|${roomId}|${pos}`);
    if (existing && existing.course.id !== sourceCourseId) {
      // Evaluating a SWAP
      if (sourceCourse.isSplit || existing.course.isSplit) {
        return {
          mode: 'invalid' as const,
          reason:
            'Swap dengan mata kuliah terpecah (di jam istirahat) tidak diizinkan.',
        };
      }
      const sourceSeg = sourceCourse.segments[0];
      if (!sourceSeg) {
        return {
          mode: 'invalid' as const,
          reason: `Slot ${day} Pos ${pos} di ${rooms.find((r) => r.id === roomId)?.kode ?? roomId} sudah terisi oleh MK ${existing.course.kode}.`,
        };
      }
      const checkA = validatePlacement(
        sourceCourse.id,
        [
          {
            day,
            room: roomId,
            pos: existing.segment.pos,
            len: Math.max(1, sourceCourse.sks),
          },
        ],
        existing.course.id,
      );
      if (!checkA.valid) {
        return { mode: 'invalid' as const, reason: checkA.reason };
      }
      const checkB = validatePlacement(
        existing.course.id,
        [
          {
            day: sourceSeg.day,
            room: sourceSeg.room,
            pos: sourceSeg.pos,
            len: Math.max(1, existing.course.sks),
          },
        ],
        sourceCourse.id,
      );
      if (!checkB.valid) {
        return { mode: 'invalid' as const, reason: checkB.reason };
      }
      return {
        mode: 'valid' as const,
        reason: null,
        swapTargetId: existing.course.id,
      };
    }

    // Evaluating normal drop into empty slot (or moving split course back into single/new slot)
    const len = Math.max(1, sourceCourse.sks);
    const check = validatePlacement(sourceCourse.id, [
      { day, room: roomId, pos, len },
    ]);
    if (check.valid) {
      return { mode: 'valid' as const, reason: null };
    }
    if (check.requiresSplitConfirm && check.splitProposal) {
      return {
        mode: 'split' as const,
        reason: check.reason,
        splitProposal: check.splitProposal,
        splitMessage: check.splitMessage ?? check.reason ?? '',
      };
    }
    return { mode: 'invalid' as const, reason: check.reason };
  }

  function handleSlotDragOver(
    e: DragEvent,
    day: DayName,
    roomId: number,
    pos: number,
  ) {
    e.preventDefault();
    const activeId =
      draggedCourseId ?? Number(e.dataTransfer.getData('text/plain'));
    if (!activeId) return;

    const slotKey = `${day}|${roomId}|${pos}`;
    setHoveredSlotKey(slotKey);

    const evaluation = evaluateSlotTarget(activeId, day, roomId, pos);
    setHoveredState(evaluation.mode);

    if (evaluation.mode === 'invalid' && evaluation.reason) {
      setFloatingAlert(evaluation.reason);
    } else {
      setFloatingAlert(null);
    }
  }

  function handleSlotDrop(
    e: DragEvent,
    day: DayName,
    roomId: number,
    pos: number,
  ) {
    e.preventDefault();
    const activeId =
      draggedCourseId ?? Number(e.dataTransfer.getData('text/plain'));
    setHoveredSlotKey(null);
    setHoveredState(null);
    setDraggedCourseId(null);

    if (!activeId) return;
    applyMoveToSlot(activeId, day, roomId, pos);
  }

  function applyMoveToSlot(
    courseId: number,
    day: DayName,
    roomId: number,
    pos: number,
  ) {
    const sourceCourse = readyCourses.find((c) => c.id === courseId);
    if (!sourceCourse) return;

    const evaluation = evaluateSlotTarget(courseId, day, roomId, pos);
    if (evaluation.mode === 'invalid') {
      setFloatingAlert(
        evaluation.reason ?? 'Penempatan jadwal ditolak karena konflik.',
      );
      return;
    }

    if (evaluation.mode === 'split' && evaluation.splitProposal) {
      setPendingSplit({
        course: sourceCourse,
        proposal: evaluation.splitProposal,
        message: evaluation.splitMessage,
      });
      setDetailCourse(null);
      return;
    }

    if ('swapTargetId' in evaluation && evaluation.swapTargetId) {
      const swapRes = swapCourses(courseId, evaluation.swapTargetId);
      if (!swapRes.valid) {
        setFloatingAlert(swapRes.reason ?? 'Gagal menukar mata kuliah.');
      } else {
        setFloatingAlert(null);
        setDetailCourse(null);
      }
      return;
    }

    const res = placeCourse(courseId, [
      { day, room: roomId, pos, len: Math.max(1, sourceCourse.sks) },
    ]);
    if (!res.valid) {
      setFloatingAlert(res.reason ?? 'Penempatan jadwal ditolak.');
    } else {
      setFloatingAlert(null);
      setDetailCourse(null);
    }
  }

  function handleConfirmBreakSplit() {
    if (!pendingSplit) return;
    const res = placeCourse(
      pendingSplit.course.id,
      pendingSplit.proposal,
      true,
    );
    if (!res.valid) {
      setFloatingAlert(
        res.reason ?? 'Gagal memecah mata kuliah di jam istirahat.',
      );
    } else {
      setFloatingAlert(null);
    }
    setPendingSplit(null);
  }

  function handleDropToPark(e: DragEvent) {
    e.preventDefault();
    const activeId =
      draggedCourseId ?? Number(e.dataTransfer.getData('text/plain'));
    setHoveredSlotKey(null);
    setHoveredState(null);
    setDraggedCourseId(null);
    if (!activeId) return;
    parkCourse(activeId, 'Dikembalikan ke panel parkir oleh Admin');
  }

  function openCourseDetailModal(mk: MataKuliah) {
    setDetailCourse(mk);
    const firstSeg = mk.segments[0];
    setQuickDay(firstSeg?.day ?? 'SENIN');
    setQuickRoom(firstSeg?.room ?? 1);
    setQuickPos(firstSeg?.pos ?? 1);
  }

  function handleExportCsv() {
    const csv = buildFullMatrixCsv(rooms, readyCourses, pengaturanWaktu);
    triggerBlobDownload(
      csv,
      'Matriks_Jadwal_Perkuliahan_2023_2024.csv',
      'text/csv;charset=utf-8;',
    );
  }

  function handleExportOfflineHtml() {
    const html = buildOfflineHtmlDocument(
      rooms,
      readyCourses,
      dosenList,
      pengaturanWaktu,
    );
    triggerBlobDownload(
      html,
      'Jadwal_Perkuliahan_2023_2024_Offline.html',
      'text/html;charset=utf-8;',
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
          <Badge tone="primary">Penjadwalan • 6.5, 6.6 &amp; 6.9</Badge>
          <h4 style={{ marginTop: '0.35rem', marginBottom: '0.25rem' }}>
            Matriks Mind Mapping (37 Ruangan)
          </h4>
          <p style={{ color: 'var(--color-ink-secondary)', margin: 0 }}>
            Drag &amp; drop ke slot kosong, swap antar kartu, parkir, undo
            (Ctrl+Z), pemecahan di jam istirahat, dan ekspor offline.
          </p>
        </div>

        {/* FR-E1..FR-E3: Tombol Ekspor */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Button
            size="sm"
            variant="outline"
            onClick={undoLastScheduleAction}
            disabled={!canUndo}
          >
            ↶ Undo (Ctrl+Z)
          </Button>
          <Button size="sm" variant="secondary" onClick={handleExportCsv}>
            Ekspor CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              exportMatrixImage(
                'png',
                visibleRooms,
                visibleDays,
                readyCourses,
                pengaturanWaktu,
              )
            }
          >
            Ekspor PNG HD
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              exportMatrixImage(
                'jpeg',
                visibleRooms,
                visibleDays,
                readyCourses,
                pengaturanWaktu,
              )
            }
          >
            Ekspor JPG HD
          </Button>
          <Button size="sm" variant="accent" onClick={handleExportOfflineHtml}>
            Ekspor HTML Offline
          </Button>
        </div>
      </header>

      {lastUndoMessage && <Alert tone="info">{lastUndoMessage}</Alert>}

      {/* FR-X4: Panel Parkir di Atas Matriks */}
      <Card
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropToPark}
        style={{
          border: '2px dashed var(--color-border-strong)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
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
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <Badge tone="accent">
              {parkedCourses.length} / {readyCourses.length} Diparkir
            </Badge>
            <strong>Panel Parkir Mata Kuliah</strong>
            <span
              style={{
                fontSize: 'var(--text-body-sm-size)',
                color: 'var(--color-ink-muted)',
              }}
            >
              (Seret kartu dari sini ke matriks, atau jatuhkan kartu ke area ini
              untuk memarkir)
            </span>
          </div>

          <div style={{ minWidth: '240px' }}>
            <Input
              aria-label="Cari mata kuliah di panel parkir"
              placeholder="Cari MK di panel parkir..."
              value={parkSearch}
              onChange={(e) => setParkSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredParked.length === 0 ? (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--color-border-strong)',
              textAlign: 'center',
              color: 'var(--color-ink-muted)',
              fontSize: 'var(--text-body-sm-size)',
            }}
          >
            Tidak ada mata kuliah di panel parkir. Jatuhkan kartu ke sini untuk
            memarkir sementara.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '0.6rem',
              maxHeight: '170px',
              overflowY: 'auto',
            }}
          >
            {filteredParked.map((mk) => (
              <div
                key={mk.id}
                draggable
                onDragStart={(e) => handleDragStart(e, mk.id)}
                onDragEnd={handleDragEnd}
                onClick={() => openCourseDetailModal(mk)}
                className={`ds-course-card ${getProdiCardClass(mk.prodi)} ${
                  highlightedCourseId === mk.id
                    ? 'ds-course-card--highlight'
                    : ''
                }`}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <strong>
                    {mk.prodi} {mk.semester}
                    {mk.kelas} • {mk.kode}
                  </strong>
                  <span>{mk.sks} SKS</span>
                </div>
                <div style={{ fontWeight: 600 }}>{mk.nama}</div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-ink-secondary)',
                  }}
                >
                  {mk.dosen1?.display ?? mk.kodeDosen1 ?? '-'}
                </div>
                {mk.parkedReason && (
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--color-warning)',
                      fontWeight: 600,
                    }}
                  >
                    {mk.parkedReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* FR-X2 & FR-X7: Filter Hari, Gedung, Legenda Prodi, dan Toggle Validasi Ketat */}
      <Card style={{ padding: '1rem 1.25rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            <Button
              size="sm"
              variant={dayFilter === 'ALL' ? 'primary' : 'outline'}
              onClick={() => setDayFilter('ALL')}
            >
              Semua Hari
            </Button>
            {ALL_DAYS.map((day) => (
              <Button
                key={day}
                size="sm"
                variant={dayFilter === day ? 'primary' : 'outline'}
                onClick={() => setDayFilter(day)}
              >
                {day}
              </Button>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {(
              [
                ['ALL', 'Semua 37'],
                ['Gedung B', 'Gedung B (1–18)'],
                ['Gedung E', 'Gedung E (19–22)'],
                ['Smart Class & Lab', 'Smart Class & Lab (23–37)'],
              ] as const
            ).map(([val, label]) => (
              <Button
                key={val}
                size="sm"
                variant={buildingFilter === val ? 'primary' : 'outline'}
                onClick={() => setBuildingFilter(val)}
              >
                {label}
              </Button>
            ))}
          </div>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: 'var(--text-body-sm-size)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={strictConflictValidation}
              onChange={(e) => setStrictConflictValidation(e.target.checked)}
            />
            Validasi Konflik Ketat (Dosen &amp; Semester+Kelas)
          </label>
        </div>
      </Card>

      {/* FR-X1..FR-X5: Tabel Matriks 37 Ruangan dengan 3 Header Sticky & 3 Kolom Kiri Sticky */}
      <div className="ds-matrix-scroll">
        <table className="ds-matrix-table">
          <thead>
            <tr>
              <th
                rowSpan={3}
                className="ds-matrix-sticky-top-1 ds-matrix-sticky-col-1 ds-matrix-corner"
              >
                HARI
              </th>
              <th
                rowSpan={3}
                className="ds-matrix-sticky-top-1 ds-matrix-sticky-col-2 ds-matrix-corner"
              >
                JAM
              </th>
              <th
                rowSpan={3}
                className="ds-matrix-sticky-top-1 ds-matrix-sticky-col-3 ds-matrix-corner"
              >
                Pos
              </th>
              {visibleRooms.map((r) => (
                <th key={`lbl-${r.id}`} className="ds-matrix-sticky-top-1">
                  {r.label}
                </th>
              ))}
            </tr>
            <tr>
              {visibleRooms.map((r) => (
                <th key={`kode-${r.id}`} className="ds-matrix-sticky-top-2">
                  <strong>{r.kode}</strong>
                </th>
              ))}
            </tr>
            <tr>
              {visibleRooms.map((r) => (
                <th key={`urut-${r.id}`} className="ds-matrix-sticky-top-3">
                  {r.urutan}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleDays.flatMap((day) => {
              const slots = buildDayTimeSlots(day, pengaturanWaktu);
              return slots.map((slot, sIdx) => {
                if (slot.isBreak) {
                  return (
                    <tr key={`${day}-break`} className="ds-matrix-break-row">
                      <td className="ds-matrix-sticky-col-1">
                        {sIdx === 0 ? day : ''}
                      </td>
                      <td className="ds-matrix-sticky-col-2">{slot.label}</td>
                      <td className="ds-matrix-sticky-col-3">-</td>
                      <td colSpan={visibleRooms.length}>
                        JAM ISTIRAHAT ({slot.label})
                      </td>
                    </tr>
                  );
                }

                const pos = slot.pos ?? 1;
                return (
                  <tr key={`${day}-pos-${pos}`}>
                    <td className="ds-matrix-sticky-col-1">
                      {sIdx === 0 ? day : ''}
                    </td>
                    <td className="ds-matrix-sticky-col-2">{slot.label}</td>
                    <td className="ds-matrix-sticky-col-3">{pos}</td>
                    {visibleRooms.map((room) => {
                      const slotKey = `${day}|${room.id}|${pos}`;
                      const occ = slotOccupancy.get(slotKey);
                      const isHovered = hoveredSlotKey === slotKey;
                      const hoverClass =
                        isHovered && hoveredState === 'valid'
                          ? 'ds-matrix-slot--valid'
                          : isHovered && hoveredState === 'invalid'
                            ? 'ds-matrix-slot--invalid'
                            : isHovered && hoveredState === 'split'
                              ? 'ds-matrix-slot--split'
                              : '';

                      return (
                        <td
                          key={slotKey}
                          data-testid={`slot-${day}-${room.id}-${pos}`}
                          className={`ds-matrix-slot ${hoverClass}`.trim()}
                          onDragOver={(e) =>
                            handleSlotDragOver(e, day, room.id, pos)
                          }
                          onDrop={(e) => handleSlotDrop(e, day, room.id, pos)}
                        >
                          {occ ? (
                            occ.isStart ? (
                              <div
                                draggable
                                onDragStart={(e) =>
                                  handleDragStart(e, occ.course.id)
                                }
                                onDragEnd={handleDragEnd}
                                onClick={() =>
                                  openCourseDetailModal(occ.course)
                                }
                                className={`ds-course-card ${getProdiCardClass(
                                  occ.course.prodi,
                                )} ${
                                  highlightedCourseId === occ.course.id
                                    ? 'ds-course-card--highlight'
                                    : ''
                                }`}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <strong>
                                    {occ.course.prodi} {occ.course.semester}
                                    {occ.course.kelas}
                                  </strong>
                                  {occ.segment.badgeLabel ? (
                                    <Badge tone="accent">
                                      {occ.segment.badgeLabel} Terpisah
                                    </Badge>
                                  ) : (
                                    <span>{occ.segment.len} SKS</span>
                                  )}
                                </div>
                                <div>
                                  <strong>{occ.course.kode}</strong> —{' '}
                                  {occ.course.nama}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.68rem',
                                    color: 'var(--color-ink-secondary)',
                                  }}
                                >
                                  {occ.course.dosen1?.display ??
                                    occ.course.kodeDosen1 ??
                                    '-'}
                                  {occ.course.dosen2
                                    ? ` / ${occ.course.dosen2.display}`
                                    : ''}
                                </div>
                              </div>
                            ) : (
                              <div
                                draggable
                                onDragStart={(e) =>
                                  handleDragStart(e, occ.course.id)
                                }
                                onDragEnd={handleDragEnd}
                                onClick={() =>
                                  openCourseDetailModal(occ.course)
                                }
                                className={`ds-course-card ${getProdiCardClass(
                                  occ.course.prodi,
                                )}`}
                                style={{ opacity: 0.78, fontSize: '0.68rem' }}
                              >
                                <strong>
                                  ↳ {occ.course.kode} ({occ.course.prodi}{' '}
                                  {occ.course.semester}
                                  {occ.course.kelas})
                                </strong>
                                <span>Lanjutan Pos {pos}</span>
                              </div>
                            )
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>

      {/* FR-X6: Floating Alert di Kanan Bawah (fixed; bottom: 22px; right: 22px; z-index: 9999) */}
      {floatingAlert && (
        <div
          role="alert"
          data-testid="floating-rejection-alert"
          className="ds-floating-alert"
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <div>
              <strong style={{ color: 'var(--color-danger)' }}>
                Validasi Jadwal Ditolak
              </strong>
              <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                {floatingAlert}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFloatingAlert(null)}
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* FR-S1..FR-S6: Dialog Konfirmasi Pemecahan MK di Jam Istirahat */}
      {pendingSplit && (
        <div className="ds-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ds-modal">
            <Badge tone="accent">
              Konfirmasi Pemecahan Jam Istirahat (6.6)
            </Badge>
            <h5 style={{ marginTop: '0.5rem' }}>
              Pecah Mata Kuliah di Jam Istirahat?
            </h5>
            <p>{pendingSplit.message}</p>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-body-sm-size)',
                marginBottom: '1rem',
              }}
            >
              <div>
                <strong>Segmen (1/2):</strong> {pendingSplit.proposal[0].day} •
                Pos {pendingSplit.proposal[0].pos}–
                {pendingSplit.proposal[0].pos +
                  pendingSplit.proposal[0].len -
                  1}{' '}
                ({pendingSplit.proposal[0].len} SKS sebelum istirahat)
              </div>
              <div>
                <strong>Segmen (2/2):</strong> {pendingSplit.proposal[1].day} •
                Pos {pendingSplit.proposal[1].pos}–
                {pendingSplit.proposal[1].pos +
                  pendingSplit.proposal[1].len -
                  1}{' '}
                ({pendingSplit.proposal[1].len} SKS sesudah istirahat)
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <Button variant="outline" onClick={() => setPendingSplit(null)}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleConfirmBreakSplit}>
                Ya, pecah
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FR-X3: Modal Detail Kartu MK & Penempatan Slot */}
      {detailCourse && (
        <div className="ds-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ds-modal">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Badge tone="primary">
                {detailCourse.prodi} • Semester {detailCourse.semester} • Kelas{' '}
                {detailCourse.kelas}
              </Badge>
              <Badge
                tone={
                  detailCourse.isSplit
                    ? 'accent'
                    : detailCourse.segments.length > 0
                      ? 'success'
                      : 'secondary'
                }
              >
                {detailCourse.status}
              </Badge>
            </div>

            <h5 style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
              {detailCourse.kode} — {detailCourse.nama}
            </h5>
            <p style={{ fontSize: 'var(--text-body-sm-size)', margin: 0 }}>
              Beban SKS: <strong>{detailCourse.sksDisplay} SKS</strong> •
              Kebutuhan Ruang: <strong>{detailCourse.kebutuhanRuang}</strong>
            </p>

            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-body-sm-size)',
              }}
            >
              <div>
                <strong>Dosen 1:</strong>{' '}
                {detailCourse.dosen1
                  ? `${detailCourse.dosen1.kode} — ${detailCourse.dosen1.nama} (${detailCourse.dosen1.status})`
                  : (detailCourse.kodeDosen1 ?? '-')}
              </div>
              {detailCourse.dosen2 && (
                <div style={{ marginTop: '4px' }}>
                  <strong>Dosen 2:</strong> {detailCourse.dosen2.kode} —{' '}
                  {detailCourse.dosen2.nama} ({detailCourse.dosen2.status})
                </div>
              )}
              {detailCourse.segments.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Segmen Jadwal Aktif:</strong>
                  {detailCourse.segments.map((seg) => (
                    <div key={seg.segmenKe}>
                      • {seg.badgeLabel ?? 'Segmen 1'}: {seg.day}, Ruang{' '}
                      {seg.roomKode} (#{seg.room}), Pos {seg.pos}–
                      {seg.pos + seg.len - 1} ({seg.timeDisplay})
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr
              style={{
                borderColor: 'var(--color-border)',
                margin: '1rem 0',
              }}
            />

            <h6>Pindahkan / Tempatkan ke Slot Matriks</h6>
            <div className="ds-grid" style={{ marginBottom: '1rem' }}>
              <div className="ds-col-4">
                <FormField id="q-day" label="Hari">
                  <select
                    id="q-day"
                    className="ds-select"
                    value={quickDay}
                    onChange={(e) => setQuickDay(e.target.value as DayName)}
                  >
                    {ALL_DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div className="ds-col-4">
                <FormField id="q-room" label="Ruangan (1–37)">
                  <select
                    id="q-room"
                    className="ds-select"
                    value={quickRoom}
                    onChange={(e) => setQuickRoom(Number(e.target.value))}
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        #{r.urutan} {r.kode} ({r.label})
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div className="ds-col-4">
                <FormField id="q-pos" label="Pos Awal (1–14)">
                  <select
                    id="q-pos"
                    className="ds-select"
                    value={quickPos}
                    onChange={(e) => setQuickPos(Number(e.target.value))}
                  >
                    {Array.from({ length: 14 }, (_, i) => i + 1).map((p) => (
                      <option key={p} value={p}>
                        Pos {p}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              {detailCourse.segments.length > 0 ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    parkCourse(detailCourse.id, 'Diparkir dari modal detail');
                    setDetailCourse(null);
                  }}
                >
                  Kembalikan ke Parkir
                </Button>
              ) : (
                <span />
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="outline" onClick={() => setDetailCourse(null)}>
                  Tutup
                </Button>
                <Button
                  variant="primary"
                  onClick={() =>
                    applyMoveToSlot(
                      detailCourse.id,
                      quickDay,
                      quickRoom,
                      quickPos,
                    )
                  }
                >
                  Tempatkan di Slot Ini
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
