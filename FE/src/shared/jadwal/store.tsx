import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiRequest } from '../api/client';
import {
  ALL_DAYS,
  buildDayTimeSlots,
  DEFAULT_RUANGAN,
  getSegmentTimeRange,
  matchDosenByCodeOrName,
  MORNING_MAX_POS,
  normalizeDecimalText,
  normalizeKebutuhanRuang,
  normalizeKodeDosen,
  normalizeProdi,
  normalizeSks,
  splitCombinedClasses,
  timeToMinutes,
  TOTAL_POS,
  WORK_DAYS,
  type AuditReport,
  type CourseScheduleStatus,
  type DayName,
  type Dosen,
  type DosenStatus,
  type JadwalSegmen,
  type KebutuhanRuang,
  type KetersediaanDosen,
  type LecturerAuditMetric,
  type MataKuliah,
  type PengaturanWaktu,
  type Ruangan,
  type UploadedFileChip,
} from './types';
import type { ParsedCourseRow, ParsedDosenRow } from './xlsxHelper';

export interface CandidateSegmentInput {
  day: DayName;
  room: number;
  pos: number;
  len: number;
}

export interface PlacementValidationResult {
  valid: boolean;
  reason: string | null;
  requiresSplitConfirm?: boolean;
  splitProposal?: [CandidateSegmentInput, CandidateSegmentInput];
  splitMessage?: string;
}

interface RawCourseRecord {
  id: number;
  prodi: string;
  kode: string;
  nama: string;
  sks: number;
  semester: string;
  kelas: string;
  kodeDosen1: string | null;
  kodeDosen2: string | null;
  rawDosen1: string | null;
  rawDosen2: string | null;
  kebutuhanRuang: KebutuhanRuang;
  statusAntrean: 'ready' | 'pending_dosen';
  segments: CandidateSegmentInput[];
  parkedReason: string | null;
  sourceFile: string | null;
}

interface RawDosenRecord {
  kode: string;
  nama: string;
  status: DosenStatus;
  ketersediaan: KetersediaanDosen;
}

interface UndoEntry {
  description: string;
  coursesSnapshot: RawCourseRecord[];
}

export interface JadwalStoreContextValue {
  rooms: readonly Ruangan[];
  dosenList: Dosen[];
  courses: MataKuliah[];
  readyCourses: MataKuliah[];
  pendingDosenCourses: MataKuliah[];
  scheduledCourses: MataKuliah[];
  parkedCourses: MataKuliah[];
  pengaturanWaktu: PengaturanWaktu;
  lastAudit: AuditReport | null;
  uploadedFiles: UploadedFileChip[];
  strictConflictValidation: boolean;
  canUndo: boolean;
  lastUndoMessage: string | null;
  setStrictConflictValidation: (enabled: boolean) => void;
  addDosen: (input: { kode: string; nama: string; status: DosenStatus }) => {
    ok: boolean;
    error?: string;
    warning?: string;
  };
  updateDosen: (
    oldKode: string,
    input: { kode: string; nama: string; status: DosenStatus },
  ) => { ok: boolean; error?: string; warning?: string };
  deleteDosen: (
    kode: string,
    force?: boolean,
  ) => { ok: boolean; requiresConfirm?: boolean; affectedCount: number };
  importDosenRows: (rows: ParsedDosenRow[]) => {
    importedCount: number;
    duplicateCount: number;
    duplicates: string[];
  };
  updateKetersediaanDosen: (
    kodeDosen: string,
    input: {
      hari?: DayName[];
      startTime?: string;
      endTime?: string;
      reset?: boolean;
    },
  ) => { ok: boolean; error?: string };
  importCourseRows: (
    rows: ParsedCourseRow[],
    fileName?: string,
  ) => {
    acceptedCount: number;
    autoRegisteredDosenCount: number;
    pendingDosenCount: number;
    rejectedCount: number;
    rejectedReasons: string[];
  };
  addManualCourse: (input: {
    prodi: string;
    kode: string;
    nama: string;
    sks: number;
    semester: string;
    kelas: string;
    kodeDosen1: string;
    kodeDosen2?: string | null;
    kebutuhanRuang: KebutuhanRuang;
  }) => { ok: boolean; error?: string; createdCount: number };
  mapPendingCourseLecturers: (
    courseId: number,
    input: { kodeDosen1: string; kodeDosen2?: string | null },
  ) => { ok: boolean; error?: string };
  autoRegisterAllPendingLecturers: () => {
    registeredLecturersCount: number;
    resolvedCoursesCount: number;
  };
  deleteCourse: (courseId: number) => void;
  clearAllCourses: () => void;
  generateSchedule: () => AuditReport;
  validatePlacement: (
    courseId: number,
    candidateSegments: CandidateSegmentInput[],
    ignoreCourseId?: number,
  ) => PlacementValidationResult;
  placeCourse: (
    courseId: number,
    candidateSegments: CandidateSegmentInput[],
    confirmSplit?: boolean,
  ) => PlacementValidationResult;
  parkCourse: (courseId: number, reason?: string) => void;
  swapCourses: (
    courseIdA: number,
    courseIdB: number,
  ) => { valid: boolean; reason: string | null };
  undoLastScheduleAction: () => boolean;
  updatePengaturanWaktu: (next: Partial<PengaturanWaktu>) => {
    ok: boolean;
    error?: string;
  };
}

const STORAGE_KEY = 'friday_jadwal_v1_3_state';

const DEFAULT_SETTINGS: PengaturanWaktu = {
  durasiSks: 50,
  mulaiPagi: '07:00',
  istirahat: 60,
  mulaiPagiJumat: '07:00',
  mulaiSiangJumat: '13:00',
};

const INITIAL_DOSEN: RawDosenRecord[] = [
  {
    kode: 'DSN001',
    nama: 'Dr. Budi Santoso, M.Kom.',
    status: 'Dosen Tetap',
    ketersediaan: {
      kodeDosen: 'DSN001',
      hari: [...WORK_DAYS],
      startTime: '07:00',
      endTime: '17:00',
      isCustom: false,
    },
  },
  {
    kode: 'DSN002',
    nama: 'Siti Rahmawati, M.T.',
    status: 'Dosen Tetap',
    ketersediaan: {
      kodeDosen: 'DSN002',
      hari: ['SENIN', 'RABU', 'JUMAT'],
      startTime: '07:00',
      endTime: '15:30',
      isCustom: true,
    },
  },
  {
    kode: 'DSN003',
    nama: 'Drs. Hendra Wijaya, M.Pd.',
    status: 'Dosen Tetap',
    ketersediaan: {
      kodeDosen: 'DSN003',
      hari: [...WORK_DAYS],
      startTime: '07:00',
      endTime: '17:00',
      isCustom: false,
    },
  },
  {
    kode: 'DSN004',
    nama: 'Rina Marlina, S.Kom., M.Kom.',
    status: 'Dosen Luar',
    ketersediaan: {
      kodeDosen: 'DSN004',
      hari: ['SELASA', 'KAMIS'],
      startTime: '08:00',
      endTime: '17:00',
      isCustom: true,
    },
  },
];

const INITIAL_COURSES: RawCourseRecord[] = [
  {
    id: 1,
    prodi: 'RPL',
    kode: 'RL301',
    nama: 'Kualitas, Verifikasi, dan Validasi Perangkat Lunak',
    sks: 3,
    semester: '5',
    kelas: '5A',
    kodeDosen1: 'DSN001',
    kodeDosen2: 'DSN002',
    rawDosen1: null,
    rawDosen2: null,
    kebutuhanRuang: 'Ruang Kelas Biasa',
    statusAntrean: 'ready',
    segments: [{ day: 'SENIN', room: 1, pos: 1, len: 3 }],
    parkedReason: null,
    sourceFile: 'Template_RPL.xlsx',
  },
  {
    id: 2,
    prodi: 'PGSD',
    kode: 'GD201',
    nama: 'Pembelajaran Matematika SD',
    sks: 3,
    semester: '3',
    kelas: '3A',
    kodeDosen1: 'DSN003',
    kodeDosen2: null,
    rawDosen1: null,
    rawDosen2: null,
    kebutuhanRuang: 'Ruang Kelas Biasa',
    statusAntrean: 'ready',
    segments: [{ day: 'SENIN', room: 2, pos: 1, len: 3 }],
    parkedReason: null,
    sourceFile: 'Template_PGSD.xlsx',
  },
  {
    id: 3,
    prodi: 'Teknik Komputer',
    kode: 'TK402',
    nama: 'Praktikum Jaringan & Sistem Tertanam',
    sks: 5,
    semester: '5',
    kelas: '5B',
    kodeDosen1: 'DSN001',
    kodeDosen2: null,
    rawDosen1: null,
    rawDosen2: null,
    kebutuhanRuang: 'Laboratorium Praktikum',
    statusAntrean: 'ready',
    segments: [],
    parkedReason: 'Siap diatur di matriks atau digenerate',
    sourceFile: 'Template_TEKKOM.xlsx',
  },
  {
    id: 4,
    prodi: 'PMM',
    kode: 'MM105',
    nama: 'Literasi Teknologi & Media Digital',
    sks: 2,
    semester: '1',
    kelas: '1A',
    kodeDosen1: 'DSN004',
    kodeDosen2: null,
    rawDosen1: null,
    rawDosen2: null,
    kebutuhanRuang: 'Online',
    statusAntrean: 'ready',
    segments: [],
    parkedReason: 'Mata kuliah Online/Daring',
    sourceFile: 'Template_PMM.xlsx',
  },
];

function shouldSyncWithBackend(): boolean {
  // Only fire network requests to backend when VITE_API_ORIGIN is explicitly configured in environment.
  // This guarantees Playwright E2E preview tests on port 4173 have 0 external HTTP requests.
  return Boolean(import.meta.env.VITE_API_ORIGIN);
}

function hydrateCourse(
  raw: RawCourseRecord,
  dosenMap: Map<string, RawDosenRecord>,
  roomsMap: Map<number, Ruangan>,
  settings: PengaturanWaktu,
): MataKuliah {
  const isSplit = raw.segments.length > 1;
  const totalSegs = raw.segments.length;

  const formattedSegments: JadwalSegmen[] = raw.segments.map((seg, idx) => {
    const tr = getSegmentTimeRange(seg.day, seg.pos, seg.len, settings);
    const roomObj = roomsMap.get(seg.room);
    return {
      segmenKe: idx + 1,
      badgeLabel: isSplit ? `(${idx + 1}/${totalSegs})` : null,
      day: seg.day,
      room: seg.room,
      roomKode: roomObj?.kode ?? `R-${seg.room}`,
      roomLabel: roomObj?.label ?? 'Ruang Kelas',
      gedung: roomObj?.gedung ?? 'Gedung B',
      pos: seg.pos,
      len: seg.len,
      startTime: tr.startTime,
      endTime: tr.endTime,
      timeDisplay: tr.label,
    };
  });

  const d1 = raw.kodeDosen1 ? (dosenMap.get(raw.kodeDosen1) ?? null) : null;
  const d2 = raw.kodeDosen2 ? (dosenMap.get(raw.kodeDosen2) ?? null) : null;

  let status: CourseScheduleStatus = 'Diparkir';
  if (raw.statusAntrean === 'pending_dosen') {
    status = 'Dosen Belum Terdaftar';
  } else if (raw.kebutuhanRuang === 'Online') {
    status = 'Online';
  } else if (isSplit) {
    status = 'Terpisah';
  } else if (formattedSegments.length === 1) {
    status = 'Terjadwal';
  }

  const sksDisplay = isSplit
    ? `${raw.sks} (${formattedSegments.map((s) => s.len).join('+')})`
    : String(raw.sks);

  let hariDisplay = '-';
  let timeDisplay = '-';
  let ruangDisplay = '-';

  if (formattedSegments.length > 0) {
    const first = formattedSegments[0]!;
    hariDisplay = first.day;
    ruangDisplay = first.roomKode;
    timeDisplay = formattedSegments
      .map((s) =>
        isSplit && s.badgeLabel
          ? `${s.timeDisplay} ${s.badgeLabel}`
          : s.timeDisplay,
      )
      .join(' & ');
  } else if (raw.kebutuhanRuang === 'Online') {
    ruangDisplay = 'Online';
    timeDisplay = 'Daring / Online';
  }

  return {
    id: raw.id,
    prodi: raw.prodi,
    kode: raw.kode,
    nama: raw.nama,
    sks: raw.sks,
    sksDisplay,
    semester: raw.semester,
    kelas: raw.kelas,
    cohort: `${raw.prodi}|${raw.semester}|${raw.kelas}`,
    kodeDosen1: raw.kodeDosen1,
    kodeDosen2: raw.kodeDosen2,
    rawDosen1: raw.rawDosen1,
    rawDosen2: raw.rawDosen2,
    dosen1: d1
      ? {
          kode: d1.kode,
          nama: d1.nama,
          status: d1.status,
          display: `${d1.kode} ${d1.nama}`,
        }
      : null,
    dosen2: d2
      ? {
          kode: d2.kode,
          nama: d2.nama,
          status: d2.status,
          display: `${d2.kode} ${d2.nama}`,
        }
      : null,
    kebutuhanRuang: raw.kebutuhanRuang,
    statusAntrean: raw.statusAntrean,
    status,
    isSplit,
    segments: formattedSegments,
    hariDisplay,
    timeDisplay,
    ruangDisplay,
    parkedReason: raw.parkedReason,
    sourceFile: raw.sourceFile,
  };
}

function evaluatePlacementAgainstList(
  targetCourse: RawCourseRecord,
  candidateSegments: CandidateSegmentInput[],
  allCoursesList: RawCourseRecord[],
  strict: boolean,
  dosenMap: Map<string, RawDosenRecord>,
  roomsMap: Map<number, Ruangan>,
  pengaturanWaktu: PengaturanWaktu,
  ignoreCourseId?: number,
): PlacementValidationResult {
  if (candidateSegments.length === 0) {
    return { valid: true, reason: null };
  }

  // Single segment crossing break row (Pos 6 -> Pos 7)
  if (candidateSegments.length === 1) {
    const seg = candidateSegments[0]!;
    const endPos = seg.pos + seg.len - 1;
    if (seg.pos <= MORNING_MAX_POS && endPos > MORNING_MAX_POS) {
      const len1 = MORNING_MAX_POS - seg.pos + 1;
      const len2 = seg.len - len1;
      const proposal: [CandidateSegmentInput, CandidateSegmentInput] = [
        { day: seg.day, room: seg.room, pos: seg.pos, len: len1 },
        {
          day: seg.day,
          room: seg.room,
          pos: MORNING_MAX_POS + 1,
          len: len2,
        },
      ];
      const splitValidation = evaluatePlacementAgainstList(
        targetCourse,
        proposal,
        allCoursesList,
        strict,
        dosenMap,
        roomsMap,
        pengaturanWaktu,
        ignoreCourseId,
      );
      if (!splitValidation.valid) {
        return splitValidation;
      }
      const msg = `Mata kuliah ini (${seg.len} SKS) akan menabrak jam istirahat. Pecah menjadi ${len1} SKS sebelum istirahat dan ${len2} SKS sesudah istirahat?`;
      return {
        valid: false,
        requiresSplitConfirm: true,
        splitProposal: proposal,
        splitMessage: msg,
        reason: msg,
      };
    }
  }

  if (candidateSegments.length === 2) {
    const [s1, s2] = candidateSegments as [
      CandidateSegmentInput,
      CandidateSegmentInput,
    ];
    if (s1.day !== s2.day || s1.room !== s2.room) {
      return {
        valid: false,
        reason:
          'Kedua segmen mata kuliah terpecah harus berada pada hari dan ruangan yang sama.',
      };
    }
  }

  for (const seg of candidateSegments) {
    const endPos = seg.pos + seg.len - 1;
    if (seg.room < 1 || seg.room > 37) {
      return {
        valid: false,
        reason: `Nomor ruangan ${seg.room} tidak valid (harus 1–37).`,
      };
    }
    if (seg.pos < 1 || seg.len < 1 || endPos > TOTAL_POS) {
      return {
        valid: false,
        reason: `Sisa slot waktu pada sesi siang tidak cukup untuk ${seg.len} SKS (melebihi Pos ${TOTAL_POS}).`,
      };
    }

    if (strict) {
      const tr = getSegmentTimeRange(
        seg.day,
        seg.pos,
        seg.len,
        pengaturanWaktu,
      );
      const segStart = timeToMinutes(tr.startTime);
      const segEnd = timeToMinutes(tr.endTime);

      for (const code of [targetCourse.kodeDosen1, targetCourse.kodeDosen2]) {
        if (!code) continue;
        const d = dosenMap.get(code);
        if (!d) continue;
        const k = d.ketersediaan;
        if (!k.hari.includes(seg.day)) {
          return {
            valid: false,
            reason: `Dosen ${d.kode} (${d.nama}) tidak mengajar pada hari ${seg.day}.`,
          };
        }
        const allowStart = timeToMinutes(k.startTime);
        // Allow 10-minute grace for 17:00 default end time so Pos 11 (16:20-17:10 at 50m/SKS) remains valid
        const rawEnd = timeToMinutes(k.endTime);
        const allowEnd = k.endTime === '17:00' ? rawEnd + 10 : rawEnd;
        if (segStart < allowStart || segEnd > allowEnd) {
          return {
            valid: false,
            reason: `Jam slot (${tr.label}) berada di luar jam ketersediaan Dosen ${d.kode} (${d.nama}: ${k.startTime}–${k.endTime}).`,
          };
        }
      }
    }

    for (const other of allCoursesList) {
      if (other.id === targetCourse.id || other.id === ignoreCourseId) {
        continue;
      }
      for (const otherSeg of other.segments) {
        if (otherSeg.day !== seg.day) continue;
        const otherEnd = otherSeg.pos + otherSeg.len - 1;
        const overlaps =
          Math.max(seg.pos, otherSeg.pos) <= Math.min(endPos, otherEnd);
        if (!overlaps) continue;
        const hitPos = Math.max(seg.pos, otherSeg.pos);

        // 1. Room conflict
        if (otherSeg.room === seg.room) {
          const roomKode = roomsMap.get(seg.room)?.kode ?? `Ruang ${seg.room}`;
          return {
            valid: false,
            reason: `Bentrok ruangan ${roomKode} pada hari ${seg.day} Pos ${hitPos} dengan MK ${other.kode} (${other.prodi} ${other.semester}${other.kelas}).`,
          };
        }

        if (!strict) continue;

        // 2. Lecturer conflict
        const myCodes = [
          targetCourse.kodeDosen1,
          targetCourse.kodeDosen2,
        ].filter(Boolean) as string[];
        const otherCodes = [other.kodeDosen1, other.kodeDosen2].filter(
          Boolean,
        ) as string[];
        const sharedCode = myCodes.find((c) => otherCodes.includes(c));
        if (sharedCode) {
          const d = dosenMap.get(sharedCode);
          const otherRoomKode =
            roomsMap.get(otherSeg.room)?.kode ?? `Ruang ${otherSeg.room}`;
          return {
            valid: false,
            reason: `Bentrok dosen ${sharedCode} (${d?.nama ?? sharedCode}) pada hari ${seg.day} Pos ${hitPos} dengan MK ${other.kode} di ${otherRoomKode}.`,
          };
        }

        // 3. Student Cohort conflict (Prodi|Semester|Kelas)
        const myCohort = `${targetCourse.prodi}|${targetCourse.semester}|${targetCourse.kelas}`;
        const otherCohort = `${other.prodi}|${other.semester}|${other.kelas}`;
        if (myCohort === otherCohort) {
          const otherRoomKode =
            roomsMap.get(otherSeg.room)?.kode ?? `Ruang ${otherSeg.room}`;
          return {
            valid: false,
            reason: `Bentrok kelompok mahasiswa (${targetCourse.prodi} Semester ${targetCourse.semester} Kelas ${targetCourse.kelas}) pada hari ${seg.day} Pos ${hitPos} dengan MK ${other.kode} di ${otherRoomKode}.`,
          };
        }
      }
    }
  }

  return { valid: true, reason: null };
}

const JadwalStoreContext = createContext<JadwalStoreContextValue | null>(null);

function loadInitialState(): {
  dosen: RawDosenRecord[];
  courses: RawCourseRecord[];
  pengaturanWaktu: PengaturanWaktu;
} {
  let dosen: RawDosenRecord[] = INITIAL_DOSEN;
  let courses: RawCourseRecord[] = INITIAL_COURSES;
  let pengaturanWaktu: PengaturanWaktu = DEFAULT_SETTINGS;

  if (typeof window !== 'undefined') {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          dosen?: RawDosenRecord[];
          courses?: RawCourseRecord[];
          pengaturanWaktu?: PengaturanWaktu;
        };
        if (Array.isArray(parsed.dosen) && parsed.dosen.length > 0) {
          dosen = parsed.dosen.map((d) => ({
            ...d,
            ketersediaan: {
              ...d.ketersediaan,
              endTime:
                !d.ketersediaan.isCustom && d.ketersediaan.endTime === '18:00'
                  ? '17:00'
                  : d.ketersediaan.endTime,
            },
          }));
        }
        if (Array.isArray(parsed.courses)) {
          courses = parsed.courses.map((c) => {
            const validSegs = (c.segments ?? []).every(
              (s) => s.pos + s.len - 1 <= TOTAL_POS,
            );
            return validSegs
              ? c
              : {
                  ...c,
                  segments: [],
                  parkedReason:
                    'Dikembalikan ke parkir karena penyesuaian batas jam sore (07:00–17:00)',
                };
          });
        }
        if (parsed.pengaturanWaktu) {
          pengaturanWaktu = parsed.pengaturanWaktu;
        }
      }
    } catch {
      // Fallback to initial seed
    }
  }

  // Auto-migrate any pending_dosen rows so their lecturers are automatically added to Kelola Dosen
  if (courses.some((c) => c.statusAntrean === 'pending_dosen')) {
    const nextDosen = [...dosen];
    const usedCodes = new Set(nextDosen.map((d) => d.kode.toUpperCase()));
    let seq = nextDosen.length + 1;

    const registerIfMissing = (rawText: string | null): string | null => {
      const clean = (rawText ?? '').trim();
      if (
        !clean ||
        clean === '-' ||
        clean === 'Dosen 1 kosong' ||
        clean === 'Dosen kosong (dihapus)'
      ) {
        return null;
      }
      const existing = matchDosenByCodeOrName(clean, nextDosen);
      if (existing) return existing.kode;

      const codePrefixMatch = /^([A-Z]{1,6}\d{1,5})\s*[-–:]\s*(.+)$/i.exec(
        clean,
      );
      let kode = codePrefixMatch?.[1]?.toUpperCase() ?? '';
      const nama = codePrefixMatch?.[2]?.trim() || clean;

      if (!kode || usedCodes.has(kode)) {
        do {
          kode = `DSN${String(seq++).padStart(3, '0')}`;
        } while (usedCodes.has(kode));
      }

      usedCodes.add(kode);
      nextDosen.push({
        kode,
        nama,
        status: 'Dosen Tetap',
        ketersediaan: {
          kodeDosen: kode,
          hari: [...WORK_DAYS],
          startTime: '07:00',
          endTime: '17:00',
          isCustom: false,
        },
      });
      return kode;
    };

    courses = courses.map((mk) => {
      if (mk.statusAntrean !== 'pending_dosen') return mk;
      const k1 =
        mk.kodeDosen1 ??
        registerIfMissing(mk.rawDosen1) ??
        nextDosen[0]?.kode ??
        null;
      const k2 =
        mk.kodeDosen2 ??
        (mk.rawDosen2 ? registerIfMissing(mk.rawDosen2) : null);
      if (!k1) return mk;
      return {
        ...mk,
        kodeDosen1: k1,
        kodeDosen2: k2 && k2 !== k1 ? k2 : null,
        rawDosen1: null,
        rawDosen2: null,
        statusAntrean: 'ready' as const,
      };
    });
    dosen = nextDosen;
  }

  return { dosen, courses, pengaturanWaktu };
}

export function JadwalProvider({ children }: { children: ReactNode }) {
  const [initialState] = useState(loadInitialState);
  const [rawDosen, setRawDosen] = useState<RawDosenRecord[]>(
    initialState.dosen,
  );
  const [rawCourses, setRawCourses] = useState<RawCourseRecord[]>(
    initialState.courses,
  );
  const [pengaturanWaktu, setPengaturanWaktu] = useState<PengaturanWaktu>(
    initialState.pengaturanWaktu,
  );

  const [lastAudit, setLastAudit] = useState<AuditReport | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileChip[]>([]);
  const [strictConflictValidation, setStrictConflictValidation] =
    useState<boolean>(true);
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
  const [lastUndoMessage, setLastUndoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          dosen: rawDosen,
          courses: rawCourses,
          pengaturanWaktu,
        }),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [rawDosen, rawCourses, pengaturanWaktu]);

  const rooms = DEFAULT_RUANGAN;
  const roomsMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const dosenMap = useMemo(
    () => new Map(rawDosen.map((d) => [d.kode, d])),
    [rawDosen],
  );

  const courses = useMemo(
    () =>
      rawCourses.map((c) =>
        hydrateCourse(c, dosenMap, roomsMap, pengaturanWaktu),
      ),
    [rawCourses, dosenMap, roomsMap, pengaturanWaktu],
  );

  const readyCourses = useMemo(
    () => courses.filter((c) => c.statusAntrean === 'ready'),
    [courses],
  );

  const pendingDosenCourses = useMemo(
    () => courses.filter((c) => c.statusAntrean === 'pending_dosen'),
    [courses],
  );

  const scheduledCourses = useMemo(
    () => readyCourses.filter((c) => c.segments.length > 0),
    [readyCourses],
  );

  const parkedCourses = useMemo(
    () => readyCourses.filter((c) => c.segments.length === 0),
    [readyCourses],
  );

  const dosenList: Dosen[] = useMemo(() => {
    return rawDosen.map((d) => {
      const myCourses = courses.filter(
        (mk) => mk.kodeDosen1 === d.kode || mk.kodeDosen2 === d.kode,
      );
      return {
        kode: d.kode,
        nama: d.nama,
        status: d.status,
        jumlahMk: myCourses.length,
        totalSks: myCourses.reduce((acc, c) => acc + c.sks, 0),
        mataKuliah: myCourses.map((c) => ({
          id: c.id,
          kode: c.kode,
          nama: c.nama,
          prodi: c.prodi,
          semester: c.semester,
          kelas: c.kelas,
          sks: c.sks,
        })),
        ketersediaan: d.ketersediaan,
      };
    });
  }, [rawDosen, courses]);

  const resolvePendingCoursesWithDosen = useCallback(
    (nextDosenList: RawDosenRecord[], currentCourses: RawCourseRecord[]) => {
      return currentCourses.map((mk) => {
        if (mk.statusAntrean !== 'pending_dosen') return mk;
        let kode1 = mk.kodeDosen1;
        let kode2 = mk.kodeDosen2;
        if (!kode1 && mk.rawDosen1) {
          const matched1 = matchDosenByCodeOrName(mk.rawDosen1, nextDosenList);
          if (matched1) kode1 = matched1.kode;
        }
        if (!kode2 && mk.rawDosen2) {
          const matched2 = matchDosenByCodeOrName(mk.rawDosen2, nextDosenList);
          if (matched2) kode2 = matched2.kode;
        }
        const d1Ok = Boolean(kode1);
        const d2Ok = Boolean(kode2) || !mk.rawDosen2;
        if (d1Ok && d2Ok) {
          return {
            ...mk,
            kodeDosen1: kode1,
            kodeDosen2: kode2,
            rawDosen1: null,
            rawDosen2: null,
            statusAntrean: 'ready' as const,
          };
        }
        return {
          ...mk,
          kodeDosen1: kode1,
          kodeDosen2: kode2,
        };
      });
    },
    [],
  );

  const addDosen = useCallback(
    (input: { kode: string; nama: string; status: DosenStatus }) => {
      const kode = normalizeKodeDosen(input.kode);
      const nama = input.nama.trim();
      if (!kode || !nama) {
        return { ok: false, error: 'Kode Dosen dan Nama Dosen wajib diisi.' };
      }
      if (rawDosen.some((d) => d.kode === kode)) {
        return {
          ok: false,
          error: `Kode dosen ${kode} sudah terdaftar. Gunakan kode unik yang lain.`,
        };
      }
      const duplicateName = rawDosen.some(
        (d) => d.nama.trim().toLowerCase() === nama.toLowerCase(),
      );
      const newRecord: RawDosenRecord = {
        kode,
        nama,
        status: input.status,
        ketersediaan: {
          kodeDosen: kode,
          hari: [...WORK_DAYS],
          startTime: '07:00',
          endTime: '17:00',
          isCustom: false,
        },
      };
      const nextDosen = [...rawDosen, newRecord];
      setRawDosen(nextDosen);
      setRawCourses((prev) => resolvePendingCoursesWithDosen(nextDosen, prev));

      if (shouldSyncWithBackend()) {
        void apiRequest('/api/v1/dosen', {
          method: 'POST',
          body: JSON.stringify({ kode, nama, status: input.status }),
        }).catch(() => {});
      }

      return {
        ok: true,
        warning: duplicateName
          ? `Peringatan: Nama dosen "${nama}" sudah pernah terdaftar dengan kode lain.`
          : undefined,
      };
    },
    [rawDosen, resolvePendingCoursesWithDosen],
  );

  const updateDosen = useCallback(
    (
      oldKode: string,
      input: { kode: string; nama: string; status: DosenStatus },
    ) => {
      const normOld = normalizeKodeDosen(oldKode);
      const newKode = normalizeKodeDosen(input.kode);
      const nama = input.nama.trim();
      if (!newKode || !nama) {
        return { ok: false, error: 'Kode Dosen dan Nama Dosen wajib diisi.' };
      }
      if (newKode !== normOld && rawDosen.some((d) => d.kode === newKode)) {
        return {
          ok: false,
          error: `Kode dosen ${newKode} sudah digunakan oleh dosen lain.`,
        };
      }
      const duplicateName = rawDosen.some(
        (d) =>
          d.kode !== normOld &&
          d.nama.trim().toLowerCase() === nama.toLowerCase(),
      );

      const nextDosen = rawDosen.map((d) =>
        d.kode === normOld
          ? {
              ...d,
              kode: newKode,
              nama,
              status: input.status,
              ketersediaan: { ...d.ketersediaan, kodeDosen: newKode },
            }
          : d,
      );
      setRawDosen(nextDosen);
      setRawCourses((prev) =>
        prev.map((mk) => ({
          ...mk,
          kodeDosen1: mk.kodeDosen1 === normOld ? newKode : mk.kodeDosen1,
          kodeDosen2: mk.kodeDosen2 === normOld ? newKode : mk.kodeDosen2,
        })),
      );

      if (shouldSyncWithBackend()) {
        void apiRequest(`/api/v1/dosen/${encodeURIComponent(normOld)}`, {
          method: 'PUT',
          body: JSON.stringify({ kode: newKode, nama, status: input.status }),
        }).catch(() => {});
      }

      return {
        ok: true,
        warning: duplicateName
          ? `Peringatan: Nama dosen "${nama}" juga dimiliki oleh kode dosen lain.`
          : undefined,
      };
    },
    [rawDosen],
  );

  const deleteDosen = useCallback(
    (kode: string, force = false) => {
      const target = normalizeKodeDosen(kode);
      const affected = rawCourses.filter(
        (mk) => mk.kodeDosen1 === target || mk.kodeDosen2 === target,
      );
      if (affected.length > 0 && !force) {
        return {
          ok: false,
          requiresConfirm: true,
          affectedCount: affected.length,
        };
      }

      setRawDosen((prev) => prev.filter((d) => d.kode !== target));
      if (affected.length > 0) {
        setRawCourses((prev) =>
          prev.map((mk) => {
            if (mk.kodeDosen1 !== target && mk.kodeDosen2 !== target) {
              return mk;
            }
            const nextD1 = mk.kodeDosen1 === target ? null : mk.kodeDosen1;
            const nextD2 = mk.kodeDosen2 === target ? null : mk.kodeDosen2;
            return {
              ...mk,
              kodeDosen1: nextD1,
              kodeDosen2: nextD2,
              rawDosen1:
                nextD1 === null ? 'Dosen kosong (dihapus)' : mk.rawDosen1,
              statusAntrean:
                nextD1 === null ? 'pending_dosen' : mk.statusAntrean,
            };
          }),
        );
      }

      if (shouldSyncWithBackend()) {
        void apiRequest(
          `/api/v1/dosen/${encodeURIComponent(target)}?force=${force ? '1' : '0'}`,
          { method: 'DELETE' },
        ).catch(() => {});
      }

      return { ok: true, affectedCount: affected.length };
    },
    [rawCourses],
  );

  const importDosenRows = useCallback(
    (rows: ParsedDosenRow[]) => {
      const existingCodes = new Set(rawDosen.map((d) => d.kode));
      const added: RawDosenRecord[] = [];
      const duplicates: string[] = [];

      for (const row of rows) {
        const kode = normalizeKodeDosen(row.kode);
        const nama = row.nama.trim();
        if (!kode || !nama) continue;
        if (existingCodes.has(kode)) {
          duplicates.push(`${kode} (${nama})`);
          continue;
        }
        existingCodes.add(kode);
        added.push({
          kode,
          nama,
          status: row.status,
          ketersediaan: {
            kodeDosen: kode,
            hari: [...WORK_DAYS],
            startTime: '07:00',
            endTime: '18:00',
            isCustom: false,
          },
        });
      }

      if (added.length > 0) {
        const nextDosen = [...rawDosen, ...added];
        setRawDosen(nextDosen);
        setRawCourses((prev) =>
          resolvePendingCoursesWithDosen(nextDosen, prev),
        );
      }

      if (shouldSyncWithBackend()) {
        void apiRequest('/api/v1/dosen/impor', {
          method: 'POST',
          body: JSON.stringify({ rows }),
        }).catch(() => {});
      }

      return {
        importedCount: added.length,
        duplicateCount: duplicates.length,
        duplicates,
      };
    },
    [rawDosen, resolvePendingCoursesWithDosen],
  );

  const updateKetersediaanDosen = useCallback(
    (
      kodeDosen: string,
      input: {
        hari?: DayName[];
        startTime?: string;
        endTime?: string;
        reset?: boolean;
      },
    ) => {
      const target = normalizeKodeDosen(kodeDosen);
      if (input.reset) {
        setRawDosen((prev) =>
          prev.map((d) =>
            d.kode === target
              ? {
                  ...d,
                  ketersediaan: {
                    kodeDosen: target,
                    hari: [...WORK_DAYS],
                    startTime: '07:00',
                    endTime: '18:00',
                    isCustom: false,
                  },
                }
              : d,
          ),
        );
        return { ok: true };
      }

      const hari = input.hari ?? [...WORK_DAYS];
      if (hari.length === 0) {
        return {
          ok: false,
          error: 'Pilih minimal satu hari mengajar yang diizinkan.',
        };
      }
      const startTime = input.startTime ?? '07:00';
      const endTime = input.endTime ?? '17:00';
      if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
        return {
          ok: false,
          error: 'Jam mulai mengajar harus lebih awal daripada jam selesai.',
        };
      }

      const isDefault =
        hari.length === WORK_DAYS.length &&
        WORK_DAYS.every((wd) => hari.includes(wd)) &&
        startTime === '07:00' &&
        endTime === '17:00';

      setRawDosen((prev) =>
        prev.map((d) =>
          d.kode === target
            ? {
                ...d,
                ketersediaan: {
                  kodeDosen: target,
                  hari,
                  startTime,
                  endTime,
                  isCustom: !isDefault,
                },
              }
            : d,
        ),
      );

      if (shouldSyncWithBackend()) {
        void apiRequest(
          `/api/v1/dosen/${encodeURIComponent(target)}/ketersediaan`,
          {
            method: 'PUT',
            body: JSON.stringify({ hari, startTime, endTime }),
          },
        ).catch(() => {});
      }

      return { ok: true };
    },
    [],
  );

  const importCourseRows = useCallback(
    (rows: ParsedCourseRow[], fileName = 'Berkas_Kaprodi.xlsx') => {
      let nextId = rawCourses.reduce((max, c) => Math.max(max, c.id), 0) + 1;
      const existingKeys = new Set(
        rawCourses.map((c) =>
          `${c.prodi}|${c.kode}|${c.semester}|${c.kelas}`.toUpperCase(),
        ),
      );

      const nextDosenList = [...rawDosen];
      const usedDosenCodes = new Set(
        nextDosenList.map((d) => d.kode.toUpperCase()),
      );
      let dosenSeq = nextDosenList.length + 1;
      let autoRegisteredDosenCount = 0;

      function resolveOrAutoCreateDosen(
        rawNameOrCode: string,
        explicitCode?: string,
      ): string | null {
        const cleanCode = (explicitCode ?? '').trim().toUpperCase();
        const cleanName = rawNameOrCode.trim();
        if (
          (!cleanCode || cleanCode === '-') &&
          (!cleanName || cleanName === '-')
        ) {
          return null;
        }

        // 1. If explicit code is provided (from Kode Dosen 1 / Kode Dosen 2 column)
        if (cleanCode && cleanCode !== '-') {
          const existingByCode = nextDosenList.find(
            (d) => d.kode.toUpperCase() === cleanCode,
          );
          if (existingByCode) {
            // If existing lecturer only had a placeholder name equal to its code and now we have a full name, enrich it
            if (
              cleanName &&
              cleanName !== '-' &&
              existingByCode.nama.toUpperCase() === existingByCode.kode
            ) {
              existingByCode.nama = cleanName;
            }
            return existingByCode.kode;
          }

          const nama = cleanName && cleanName !== '-' ? cleanName : cleanCode;
          usedDosenCodes.add(cleanCode);
          autoRegisteredDosenCount++;
          nextDosenList.push({
            kode: cleanCode,
            nama,
            status: 'Dosen Tetap',
            ketersediaan: {
              kodeDosen: cleanCode,
              hari: [...WORK_DAYS],
              startTime: '07:00',
              endTime: '18:00',
              isCustom: false,
            },
          });
          return cleanCode;
        }

        // 2. Otherwise match by code or name from single cell (9-column backward compatibility)
        const matched = matchDosenByCodeOrName(cleanName, nextDosenList);
        if (matched) return matched.kode;

        const codePrefixMatch = /^([A-Z]{1,6}\d{1,5})\s*[-–:]\s*(.+)$/i.exec(
          cleanName,
        );
        let kode = codePrefixMatch?.[1]?.toUpperCase() ?? '';
        const nama = codePrefixMatch?.[2]?.trim() || cleanName;

        if (!kode || usedDosenCodes.has(kode)) {
          if (
            /^[A-Z]{2,6}\d{1,5}$/i.test(cleanName) &&
            !usedDosenCodes.has(cleanName.toUpperCase())
          ) {
            kode = cleanName.toUpperCase();
          } else {
            do {
              kode = `DSN${String(dosenSeq++).padStart(3, '0')}`;
            } while (usedDosenCodes.has(kode));
          }
        }

        usedDosenCodes.add(kode);
        autoRegisteredDosenCount++;
        nextDosenList.push({
          kode,
          nama,
          status: 'Dosen Tetap',
          ketersediaan: {
            kodeDosen: kode,
            hari: [...WORK_DAYS],
            startTime: '07:00',
            endTime: '18:00',
            isCustom: false,
          },
        });
        return kode;
      }

      const newRecords: RawCourseRecord[] = [];
      let acceptedCount = 0;
      const pendingDosenCount = 0;
      const rejectedReasons: string[] = [];

      for (const row of rows) {
        const prodi = normalizeProdi(row.prodi);
        const kode = row.kode.trim().toUpperCase();
        const nama = row.nama.trim();
        const sks = normalizeSks(row.sks);
        const semester = normalizeDecimalText(row.semester || '1');
        const kebutuhanRuang = normalizeKebutuhanRuang(row.kebutuhanRuang);

        if (!kode || !nama) {
          rejectedReasons.push(
            'Baris dilewati karena Kode atau Nama MK kosong.',
          );
          continue;
        }

        const kodeDosen1 =
          resolveOrAutoCreateDosen(row.dosen1, row.kodeDosen1) ??
          resolveOrAutoCreateDosen('Dosen Pengampu');
        const rawCode2 =
          row.dosen2 || row.kodeDosen2
            ? resolveOrAutoCreateDosen(row.dosen2, row.kodeDosen2)
            : null;
        const kodeDosen2 =
          rawCode2 && rawCode2 !== kodeDosen1 ? rawCode2 : null;

        const splitClasses = splitCombinedClasses(row.kelas);
        for (const kelas of splitClasses) {
          const uniqueKey =
            `${prodi}|${kode}|${semester}|${kelas}`.toUpperCase();
          if (existingKeys.has(uniqueKey)) {
            rejectedReasons.push(
              `Duplikat MK: ${prodi} • ${kode} • Sem ${semester} • Kelas ${kelas}`,
            );
            continue;
          }
          existingKeys.add(uniqueKey);

          let parkedReason: string | null = null;
          if (kebutuhanRuang === 'Online') {
            parkedReason = 'Mata kuliah Online/Daring';
          } else if (sks === 0) {
            parkedReason = 'Mata kuliah 0 SKS';
          }

          newRecords.push({
            id: nextId++,
            prodi,
            kode,
            nama,
            sks,
            semester,
            kelas,
            kodeDosen1,
            kodeDosen2,
            rawDosen1: null,
            rawDosen2: null,
            kebutuhanRuang,
            statusAntrean: 'ready',
            segments: [],
            parkedReason,
            sourceFile: row.sourceFile || fileName,
          });

          acceptedCount++;
        }
      }

      if (autoRegisteredDosenCount > 0) {
        setRawDosen(nextDosenList);
      }

      if (newRecords.length > 0) {
        setRawCourses((prev) => [...prev, ...newRecords]);
        setUploadedFiles((prev) => [
          ...prev.filter((f) => f.fileName !== fileName),
          { fileName, courseCount: newRecords.length },
        ]);
      }

      if (shouldSyncWithBackend()) {
        void apiRequest('/api/v1/mata-kuliah/impor', {
          method: 'POST',
          body: JSON.stringify({ rows, sourceFile: fileName }),
        }).catch(() => {});
      }

      return {
        acceptedCount,
        autoRegisteredDosenCount,
        pendingDosenCount,
        rejectedCount: rejectedReasons.length,
        rejectedReasons,
      };
    },
    [rawCourses, rawDosen],
  );

  const addManualCourse = useCallback(
    (input: {
      prodi: string;
      kode: string;
      nama: string;
      sks: number;
      semester: string;
      kelas: string;
      kodeDosen1: string;
      kodeDosen2?: string | null;
      kebutuhanRuang: KebutuhanRuang;
    }) => {
      const prodi = normalizeProdi(input.prodi);
      const kode = input.kode.trim().toUpperCase();
      const nama = input.nama.trim();
      const sks = normalizeSks(input.sks);
      const semester = normalizeDecimalText(input.semester || '1');
      const kodeDosen1 = normalizeKodeDosen(input.kodeDosen1);
      const kodeDosen2 = input.kodeDosen2?.trim()
        ? normalizeKodeDosen(input.kodeDosen2)
        : null;

      if (!kode || !nama || !semester || !kodeDosen1) {
        return {
          ok: false,
          error: 'Semua field wajib (termasuk Dosen 1) harus diisi.',
          createdCount: 0,
        };
      }
      if (kodeDosen2 && kodeDosen1 === kodeDosen2) {
        return {
          ok: false,
          error: 'Dosen 1 dan Dosen 2 tidak boleh sama.',
          createdCount: 0,
        };
      }
      if (!rawDosen.some((d) => d.kode === kodeDosen1)) {
        return {
          ok: false,
          error: `Kode dosen ${kodeDosen1} tidak ditemukan di Data Dosen.`,
          createdCount: 0,
        };
      }
      if (kodeDosen2 && !rawDosen.some((d) => d.kode === kodeDosen2)) {
        return {
          ok: false,
          error: `Kode dosen ${kodeDosen2} tidak ditemukan di Data Dosen.`,
          createdCount: 0,
        };
      }

      const splitClasses = splitCombinedClasses(input.kelas);
      let nextId = rawCourses.reduce((max, c) => Math.max(max, c.id), 0) + 1;
      const toAdd: RawCourseRecord[] = [];

      for (const kelas of splitClasses) {
        const dup = rawCourses.some(
          (c) =>
            c.prodi.toUpperCase() === prodi.toUpperCase() &&
            c.kode.toUpperCase() === kode &&
            c.semester === semester &&
            c.kelas.toUpperCase() === kelas.toUpperCase(),
        );
        if (dup) {
          return {
            ok: false,
            error: `Mata kuliah ${kode} (${prodi} Semester ${semester} Kelas ${kelas}) sudah ada di antrean.`,
            createdCount: 0,
          };
        }

        let parkedReason: string | null = null;
        if (input.kebutuhanRuang === 'Online') {
          parkedReason = 'Mata kuliah Online/Daring';
        } else if (sks === 0) {
          parkedReason = 'Mata kuliah 0 SKS';
        }

        toAdd.push({
          id: nextId++,
          prodi,
          kode,
          nama,
          sks,
          semester,
          kelas,
          kodeDosen1,
          kodeDosen2,
          rawDosen1: null,
          rawDosen2: null,
          kebutuhanRuang: input.kebutuhanRuang,
          statusAntrean: 'ready',
          segments: [],
          parkedReason,
          sourceFile: 'Input Manual',
        });
      }

      setRawCourses((prev) => [...prev, ...toAdd]);
      return { ok: true, createdCount: toAdd.length };
    },
    [rawCourses, rawDosen],
  );

  const mapPendingCourseLecturers = useCallback(
    (
      courseId: number,
      input: { kodeDosen1: string; kodeDosen2?: string | null },
    ) => {
      const d1 = normalizeKodeDosen(input.kodeDosen1);
      const d2 = input.kodeDosen2?.trim()
        ? normalizeKodeDosen(input.kodeDosen2)
        : null;

      if (!d1 || !rawDosen.some((d) => d.kode === d1)) {
        return { ok: false, error: 'Pilih Dosen 1 yang terdaftar.' };
      }
      if (d2 && d1 === d2) {
        return { ok: false, error: 'Dosen 1 dan Dosen 2 tidak boleh sama.' };
      }
      if (d2 && !rawDosen.some((d) => d.kode === d2)) {
        return { ok: false, error: 'Pilih Dosen 2 yang terdaftar.' };
      }

      setRawCourses((prev) =>
        prev.map((mk) =>
          mk.id === courseId
            ? {
                ...mk,
                kodeDosen1: d1,
                kodeDosen2: d2,
                rawDosen1: null,
                rawDosen2: null,
                statusAntrean: 'ready',
              }
            : mk,
        ),
      );
      return { ok: true };
    },
    [rawDosen],
  );

  const autoRegisterAllPendingLecturers = useCallback(() => {
    const nextDosen = [...rawDosen];
    const usedCodes = new Set(nextDosen.map((d) => d.kode.toUpperCase()));
    let seq = nextDosen.length + 1;
    let registeredLecturersCount = 0;

    function ensureLecturerRegistered(rawText: string | null): string | null {
      const clean = (rawText ?? '').trim();
      if (!clean || clean === '-' || clean === 'Dosen 1 kosong') return null;

      const existing = matchDosenByCodeOrName(clean, nextDosen);
      if (existing) return existing.kode;

      // Check if rawText starts with a code like "DSN015 - Nama" or "D015 Nama"
      const codePrefixMatch = /^([A-Z]{1,6}\d{1,5})\s*[-–:]?\s*(.+)$/i.exec(
        clean,
      );
      let kode = codePrefixMatch?.[1]?.toUpperCase() ?? '';
      const nama = codePrefixMatch?.[2]?.trim() || clean;

      if (!kode || usedCodes.has(kode)) {
        do {
          kode = `DSN${String(seq++).padStart(3, '0')}`;
        } while (usedCodes.has(kode));
      }

      usedCodes.add(kode);
      registeredLecturersCount++;
      nextDosen.push({
        kode,
        nama,
        status: 'Dosen Tetap',
        ketersediaan: {
          kodeDosen: kode,
          hari: [...WORK_DAYS],
          startTime: '07:00',
          endTime: '17:00',
          isCustom: false,
        },
      });
      return kode;
    }

    let resolvedCoursesCount = 0;
    const nextCourses = rawCourses.map((mk) => {
      if (mk.statusAntrean !== 'pending_dosen') return mk;
      const kode1 =
        mk.kodeDosen1 ??
        ensureLecturerRegistered(mk.rawDosen1) ??
        nextDosen[0]?.kode ??
        null;
      const kode2 =
        mk.kodeDosen2 ??
        (mk.rawDosen2 ? ensureLecturerRegistered(mk.rawDosen2) : null);

      if (kode1) {
        resolvedCoursesCount++;
        return {
          ...mk,
          kodeDosen1: kode1,
          kodeDosen2: kode2 && kode2 !== kode1 ? kode2 : null,
          rawDosen1: null,
          rawDosen2: null,
          statusAntrean: 'ready' as const,
        };
      }
      return mk;
    });

    setRawDosen(nextDosen);
    setRawCourses(nextCourses);

    return {
      registeredLecturersCount,
      resolvedCoursesCount,
    };
  }, [rawCourses, rawDosen]);

  const deleteCourse = useCallback((courseId: number) => {
    setRawCourses((prev) => prev.filter((c) => c.id !== courseId));
  }, []);

  const clearAllCourses = useCallback(() => {
    setRawCourses([]);
    setUploadedFiles([]);
    setLastAudit(null);
  }, []);

  const validatePlacementAgainstList = useCallback(
    (
      targetCourse: RawCourseRecord,
      candidateSegments: CandidateSegmentInput[],
      allCoursesList: RawCourseRecord[],
      strict: boolean,
      ignoreCourseId?: number,
    ): PlacementValidationResult => {
      return evaluatePlacementAgainstList(
        targetCourse,
        candidateSegments,
        allCoursesList,
        strict,
        dosenMap,
        roomsMap,
        pengaturanWaktu,
        ignoreCourseId,
      );
    },
    [dosenMap, pengaturanWaktu, roomsMap],
  );

  const validatePlacement = useCallback(
    (
      courseId: number,
      candidateSegments: CandidateSegmentInput[],
      ignoreCourseId?: number,
    ): PlacementValidationResult => {
      const target = rawCourses.find((c) => c.id === courseId);
      if (!target) {
        return { valid: false, reason: 'Mata kuliah tidak ditemukan.' };
      }
      return validatePlacementAgainstList(
        target,
        candidateSegments,
        rawCourses,
        strictConflictValidation,
        ignoreCourseId,
      );
    },
    [rawCourses, strictConflictValidation, validatePlacementAgainstList],
  );

  const pushUndo = useCallback(
    (description: string, snapshot: RawCourseRecord[]) => {
      setUndoStack((prev) => [
        ...prev.slice(-19),
        {
          description,
          coursesSnapshot: snapshot.map((c) => ({
            ...c,
            segments: c.segments.map((s) => ({ ...s })),
          })),
        },
      ]);
      setLastUndoMessage(description);
    },
    [],
  );

  const placeCourse = useCallback(
    (
      courseId: number,
      candidateSegments: CandidateSegmentInput[],
      confirmSplit = false,
    ): PlacementValidationResult => {
      const target = rawCourses.find((c) => c.id === courseId);
      if (!target) {
        return { valid: false, reason: 'Mata kuliah tidak ditemukan.' };
      }

      const check = validatePlacementAgainstList(
        target,
        candidateSegments,
        rawCourses,
        strictConflictValidation,
      );

      let finalSegments = candidateSegments;
      if (!check.valid) {
        if (check.requiresSplitConfirm && confirmSplit && check.splitProposal) {
          finalSegments = check.splitProposal;
        } else {
          return check;
        }
      }

      pushUndo(`Memindahkan MK ${target.kode} (${target.kelas})`, rawCourses);
      setRawCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? {
                ...c,
                segments: finalSegments.map((s) => ({ ...s })),
                parkedReason: null,
              }
            : c,
        ),
      );

      if (shouldSyncWithBackend()) {
        void apiRequest(`/api/v1/mata-kuliah/${courseId}/jadwal`, {
          method: 'PUT',
          body: JSON.stringify({
            segments: finalSegments,
            strictConflict: strictConflictValidation,
            confirmSplit,
          }),
        }).catch(() => {});
      }

      return { valid: true, reason: null };
    },
    [
      pushUndo,
      rawCourses,
      strictConflictValidation,
      validatePlacementAgainstList,
    ],
  );

  const parkCourse = useCallback(
    (courseId: number, reason = 'Diparkir manual oleh Admin') => {
      const target = rawCourses.find((c) => c.id === courseId);
      if (!target) return;
      pushUndo(`Memarkir MK ${target.kode} (${target.kelas})`, rawCourses);
      setRawCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? {
                ...c,
                segments: [],
                parkedReason: reason,
              }
            : c,
        ),
      );

      if (shouldSyncWithBackend()) {
        void apiRequest(`/api/v1/mata-kuliah/${courseId}/jadwal`, {
          method: 'PUT',
          body: JSON.stringify({ parked: true, parkedReason: reason }),
        }).catch(() => {});
      }
    },
    [pushUndo, rawCourses],
  );

  const swapCourses = useCallback(
    (
      courseIdA: number,
      courseIdB: number,
    ): { valid: boolean; reason: string | null } => {
      const courseA = rawCourses.find((c) => c.id === courseIdA);
      const courseB = rawCourses.find((c) => c.id === courseIdB);
      if (!courseA || !courseB) {
        return { valid: false, reason: 'Mata kuliah tidak ditemukan.' };
      }
      if (courseA.segments.length > 1 || courseB.segments.length > 1) {
        return {
          valid: false,
          reason:
            'Swap dengan mata kuliah terpecah (di jam istirahat) tidak diizinkan.',
        };
      }
      const segA = courseA.segments[0];
      const segB = courseB.segments[0];
      if (!segA || !segB) {
        return {
          valid: false,
          reason:
            'Kedua mata kuliah harus berada di matriks ruangan untuk ditukar.',
        };
      }

      const nextForA: CandidateSegmentInput[] = [
        {
          day: segB.day,
          room: segB.room,
          pos: segB.pos,
          len: Math.max(1, courseA.sks),
        },
      ];
      const nextForB: CandidateSegmentInput[] = [
        {
          day: segA.day,
          room: segA.room,
          pos: segA.pos,
          len: Math.max(1, courseB.sks),
        },
      ];

      const checkA = validatePlacementAgainstList(
        courseA,
        nextForA,
        rawCourses,
        strictConflictValidation,
        courseB.id,
      );
      if (!checkA.valid) {
        return {
          valid: false,
          reason: `Swap ditolak untuk MK ${courseA.kode}: ${checkA.reason ?? 'Konflik jadwal.'}`,
        };
      }

      const checkB = validatePlacementAgainstList(
        courseB,
        nextForB,
        rawCourses,
        strictConflictValidation,
        courseA.id,
      );
      if (!checkB.valid) {
        return {
          valid: false,
          reason: `Swap ditolak untuk MK ${courseB.kode}: ${checkB.reason ?? 'Konflik jadwal.'}`,
        };
      }

      pushUndo(
        `Menukar jadwal MK ${courseA.kode} dengan ${courseB.kode}`,
        rawCourses,
      );

      setRawCourses((prev) =>
        prev.map((c) => {
          if (c.id === courseA.id) {
            return { ...c, segments: nextForA, parkedReason: null };
          }
          if (c.id === courseB.id) {
            return { ...c, segments: nextForB, parkedReason: null };
          }
          return c;
        }),
      );

      if (shouldSyncWithBackend()) {
        void apiRequest('/api/v1/jadwal/swap', {
          method: 'POST',
          body: JSON.stringify({
            courseIdA,
            courseIdB,
            strictConflict: strictConflictValidation,
          }),
        }).catch(() => {});
      }

      return { valid: true, reason: null };
    },
    [
      pushUndo,
      rawCourses,
      strictConflictValidation,
      validatePlacementAgainstList,
    ],
  );

  const undoLastScheduleAction = useCallback((): boolean => {
    if (undoStack.length === 0) return false;
    const last = undoStack[undoStack.length - 1]!;
    setUndoStack((prev) => prev.slice(0, -1));
    setRawCourses(last.coursesSnapshot);
    setLastUndoMessage(`Undo berhasil: ${last.description}`);
    return true;
  }, [undoStack]);

  /**
   * PRD Section 6.4 (FR-G1..FR-G11):
   * Stage 1: Ruang Kelas Biasa -> Rooms 1..22
   * Stage 2: Laboratorium Praktikum -> Remaining slots in Rooms 1..22
   * Rooms 23..37 left empty. Online & 0 SKS parked. Never splits across break.
   * Soft constraints: daily SKS balancing per lecturer (target diff <= 2 SKS), matrix daily SKS balance, room variety per lecturer.
   */
  const generateSchedule = useCallback((): AuditReport => {
    pushUndo('Menjalankan Generator Jadwal Otomatis', rawCourses);

    const readyList = rawCourses.filter((c) => c.statusAntrean === 'ready');
    const lecturerTotalSks: Record<string, number> = {};

    for (const mk of readyList) {
      if (mk.kebutuhanRuang === 'Online' || mk.sks === 0) continue;
      for (const code of [mk.kodeDosen1, mk.kodeDosen2]) {
        if (code) {
          lecturerTotalSks[code] = (lecturerTotalSks[code] ?? 0) + mk.sks;
        }
      }
    }

    const slotTimesByDay: Record<
      DayName,
      Record<number, { start: number; end: number }>
    > = {
      SENIN: {},
      SELASA: {},
      RABU: {},
      KAMIS: {},
      JUMAT: {},
      SABTU: {},
    };

    for (const day of ALL_DAYS) {
      for (const s of buildDayTimeSlots(day, pengaturanWaktu)) {
        if (!s.isBreak && s.pos !== null) {
          slotTimesByDay[day][s.pos] = {
            start: timeToMinutes(s.startTime),
            end: timeToMinutes(s.endTime),
          };
        }
      }
    }

    let onlineCount = 0;
    let zeroSksCount = 0;
    let overflowCount = 0;
    const stage1: RawCourseRecord[] = [];
    const stage2: RawCourseRecord[] = [];

    for (const mk of readyList) {
      if (mk.kebutuhanRuang === 'Online') {
        onlineCount++;
        continue;
      }
      if (mk.sks === 0) {
        zeroSksCount++;
        continue;
      }
      if (mk.kebutuhanRuang === 'Laboratorium Praktikum') {
        stage2.push(mk);
      } else {
        stage1.push(mk);
      }
    }

    const hasCustom = (mk: RawCourseRecord): number => {
      for (const code of [mk.kodeDosen1, mk.kodeDosen2]) {
        if (code && dosenMap.get(code)?.ketersediaan.isCustom) return 1;
      }
      return 0;
    };

    const sorter = (a: RawCourseRecord, b: RawCourseRecord): number => {
      const cDiff = hasCustom(b) - hasCustom(a);
      if (cDiff !== 0) return cDiff;
      if (b.sks !== a.sks) return b.sks - a.sks;
      const aTot =
        (lecturerTotalSks[a.kodeDosen1 ?? ''] ?? 0) +
        (lecturerTotalSks[a.kodeDosen2 ?? ''] ?? 0);
      const bTot =
        (lecturerTotalSks[b.kodeDosen1 ?? ''] ?? 0) +
        (lecturerTotalSks[b.kodeDosen2 ?? ''] ?? 0);
      if (bTot !== aTot) return bTot - aTot;
      const aTeam = a.kodeDosen2 ? 1 : 0;
      const bTeam = b.kodeDosen2 ? 1 : 0;
      if (bTeam !== aTeam) return bTeam - aTeam;
      return a.id - b.id;
    };

    stage1.sort(sorter);
    stage2.sort(sorter);

    const roomBusy = new Set<string>();
    const lecturerBusy = new Set<string>();
    const cohortBusy = new Set<string>();

    const lecturerDailySks: Record<string, Record<DayName, number>> = {};
    const lecturerRoomUses: Record<string, Record<number, number>> = {};
    const matrixDailySks: Record<DayName, number> = {
      SENIN: 0,
      SELASA: 0,
      RABU: 0,
      KAMIS: 0,
      JUMAT: 0,
      SABTU: 0,
    };

    const placements = new Map<number, CandidateSegmentInput>();
    const parkedReasons = new Map<number, string>();

    for (const mk of readyList) {
      if (mk.kebutuhanRuang === 'Online') {
        parkedReasons.set(mk.id, 'Mata kuliah Online/Daring');
      } else if (mk.sks === 0) {
        parkedReasons.set(mk.id, 'Mata kuliah 0 SKS');
      }
    }

    const maxAutoPos = TOTAL_POS;

    for (const mk of [...stage1, ...stage2]) {
      const codes = [mk.kodeDosen1, mk.kodeDosen2].filter(Boolean) as string[];
      const cohort = `${mk.prodi}|${mk.semester}|${mk.kelas}`;

      let allowedDays: DayName[] = [...WORK_DAYS];
      let winStart = timeToMinutes('07:00');
      let winEnd = timeToMinutes('17:00') + 10;

      codes.forEach((code, idx) => {
        const k = dosenMap.get(code)?.ketersediaan;
        const dDays = k?.hari ?? [...WORK_DAYS];
        if (idx === 0) {
          allowedDays = [...dDays];
        } else {
          allowedDays = allowedDays.filter((d) => dDays.includes(d));
        }
        winStart = Math.max(winStart, timeToMinutes(k?.startTime ?? '07:00'));
        const endStr = k?.endTime ?? '17:00';
        const rawEnd = timeToMinutes(endStr) + (endStr === '17:00' ? 10 : 0);
        winEnd = Math.min(winEnd, rawEnd);
      });

      if (allowedDays.length === 0 || winStart >= winEnd) {
        parkedReasons.set(
          mk.id,
          'Irisan hari/jam ketersediaan Dosen 1 dan Dosen 2 kosong.',
        );
        overflowCount++;
        continue;
      }

      let bestCandidate: CandidateSegmentInput | null = null;
      let bestTuple: [number, number, number, number, number] | null = null;

      for (const day of allowedDays) {
        for (let pos = 1; pos <= maxAutoPos; pos++) {
          const endPos = pos + mk.sks - 1;
          // FR-G4: Generator never splits across break
          if (pos <= MORNING_MAX_POS && endPos > MORNING_MAX_POS) continue;
          if (endPos > maxAutoPos) continue;

          const sTime = slotTimesByDay[day][pos]?.start ?? 0;
          const eTime = slotTimesByDay[day][endPos]?.end ?? 9999;
          if (sTime < winStart || eTime > winEnd) continue;

          let conflict = false;
          for (let p = pos; p <= endPos; p++) {
            if (cohortBusy.has(`${cohort}|${day}|${p}`)) {
              conflict = true;
              break;
            }
            for (const code of codes) {
              if (lecturerBusy.has(`${code}|${day}|${p}`)) {
                conflict = true;
                break;
              }
            }
            if (conflict) break;
          }
          if (conflict) continue;

          // FR-G2: Rooms 1..22 only
          for (let room = 1; room <= 22; room++) {
            let roomTaken = false;
            for (let p = pos; p <= endPos; p++) {
              if (roomBusy.has(`${day}|${room}|${p}`)) {
                roomTaken = true;
                break;
              }
            }
            if (roomTaken) continue;

            // FR-G8: Daily SKS of lecturer on this day
            let lecDayLoad = 0;
            for (const code of codes) {
              lecDayLoad = Math.max(
                lecDayLoad,
                lecturerDailySks[code]?.[day] ?? 0,
              );
            }

            // FR-G9: Overall matrix SKS on this day
            const matDayLoad = matrixDailySks[day] ?? 0;

            // FR-G7: Room variety per lecturer (0 prior uses in this room is best)
            let roomUses = 0;
            for (const code of codes) {
              roomUses += lecturerRoomUses[code]?.[room] ?? 0;
            }

            const tuple: [number, number, number, number, number] = [
              lecDayLoad,
              matDayLoad,
              roomUses,
              pos,
              room,
            ];

            if (!bestTuple || compareTuple5(tuple, bestTuple) < 0) {
              bestTuple = tuple;
              bestCandidate = { day, room, pos, len: mk.sks };
            }
          }
        }
      }

      if (!bestCandidate) {
        parkedReasons.set(
          mk.id,
          'Tidak mendapat slot Ruang 1–22 bebas bentrok pada jam dosen.',
        );
        overflowCount++;
        continue;
      }

      placements.set(mk.id, bestCandidate);
      for (let p = bestCandidate.pos; p < bestCandidate.pos + mk.sks; p++) {
        roomBusy.add(`${bestCandidate.day}|${bestCandidate.room}|${p}`);
        cohortBusy.add(`${cohort}|${bestCandidate.day}|${p}`);
        for (const code of codes) {
          lecturerBusy.add(`${code}|${bestCandidate.day}|${p}`);
        }
      }

      matrixDailySks[bestCandidate.day] += mk.sks;
      for (const code of codes) {
        lecturerDailySks[code] ??= {
          SENIN: 0,
          SELASA: 0,
          RABU: 0,
          KAMIS: 0,
          JUMAT: 0,
          SABTU: 0,
        };
        lecturerDailySks[code][bestCandidate.day] += mk.sks;
        lecturerRoomUses[code] ??= {};
        lecturerRoomUses[code][bestCandidate.room] =
          (lecturerRoomUses[code][bestCandidate.room] ?? 0) + 1;
      }
    }

    setRawCourses((prev) =>
      prev.map((c) => {
        if (c.statusAntrean !== 'ready') return c;
        const pl = placements.get(c.id);
        if (pl) {
          return { ...c, segments: [pl], parkedReason: null };
        }
        return {
          ...c,
          segments: [],
          parkedReason: parkedReasons.get(c.id) ?? 'Belum terjadwal',
        };
      }),
    );

    const lecturerMetrics: LecturerAuditMetric[] = [];
    const balancingNotes: AuditReport['balancing_notes'] = [];
    let maxDailyDiff = 0;
    let singleRoomLecturersCount = 0;

    for (const [code, byDay] of Object.entries(lecturerDailySks)) {
      const d = dosenMap.get(code);
      const allowed = d?.ketersediaan.hari ?? [...WORK_DAYS];
      const allVals = allowed.map((day) => byDay[day] ?? 0);
      const activeVals = allVals.filter((v) => v > 0);

      const roomMap = lecturerRoomUses[code] ?? {};
      const totalClasses = Object.values(roomMap).reduce((a, b) => a + b, 0);
      const distinctRooms = Object.keys(roomMap).length;
      if (totalClasses >= 2 && distinctRooms === 1) {
        singleRoomLecturersCount++;
      }

      // Compare across active teaching days when lecturer teaches fewer classes than available days,
      // or across all allowed days if classes were stacked onto fewer days than available.
      const stackedWhenEmptyDayAvailable =
        totalClasses > activeVals.length && activeVals.length < allowed.length;
      const comparisonVals =
        stackedWhenEmptyDayAvailable || activeVals.length === 0
          ? allVals
          : activeVals;

      const maxSks =
        comparisonVals.length > 0 ? Math.max(...comparisonVals) : 0;
      const minSks =
        comparisonVals.length > 0 ? Math.min(...comparisonVals) : 0;
      const diff = maxSks - minSks;
      maxDailyDiff = Math.max(maxDailyDiff, diff);

      let catatan: string | null = null;
      // Only report a balancing warning when a lecturer has >= 2 classes and an actual imbalance (> 3 SKS or stacked days)
      if (totalClasses >= 2 && diff > 3) {
        catatan =
          allowed.length <= 1
            ? 'Dosen hanya mengizinkan 1 hari mengajar.'
            : 'Beban SKS menumpuk di hari tertentu karena keterbatasan slot bebas bentrok cohort.';
        balancingNotes.push({
          kodeDosen: code,
          namaDosen: d?.nama ?? code,
          selisihSksHarian: diff,
          alasan: catatan,
        });
      }

      lecturerMetrics.push({
        kodeDosen: code,
        namaDosen: d?.nama ?? code,
        maxDailySks: maxSks,
        minDailySks: minSks,
        selisihSksHarian: diff,
        totalKelasTerjadwal: totalClasses,
        jumlahRuangBerbeda: distinctRooms,
        catatan,
      });
    }

    const audit: AuditReport = {
      scheduled_count: placements.size,
      parked_count: onlineCount + zeroSksCount + overflowCount,
      parked_breakdown: {
        online: onlineCount,
        zero_sks: zeroSksCount,
        overflow: overflowCount,
      },
      conflicts_count: 0,
      max_daily_sks_diff: maxDailyDiff,
      single_room_lecturers_count: singleRoomLecturersCount,
      matrix_daily_sks: matrixDailySks,
      lecturer_metrics: lecturerMetrics,
      balancing_notes: balancingNotes,
      generated_at: new Date().toISOString(),
    };

    setLastAudit(audit);

    if (shouldSyncWithBackend()) {
      void apiRequest('/api/v1/jadwal/generate', { method: 'POST' }).catch(
        () => {},
      );
    }

    return audit;
  }, [dosenMap, pengaturanWaktu, pushUndo, rawCourses]);

  const updatePengaturanWaktu = useCallback(
    (next: Partial<PengaturanWaktu>) => {
      const merged: PengaturanWaktu = {
        ...pengaturanWaktu,
        ...next,
      };
      if (merged.durasiSks < 15 || merged.durasiSks > 120) {
        return {
          ok: false,
          error: 'Durasi per SKS harus berada di antara 15 sampai 120 menit.',
        };
      }
      if (merged.istirahat < 15 || merged.istirahat > 180) {
        return {
          ok: false,
          error: 'Durasi istirahat harus berada di antara 15 sampai 180 menit.',
        };
      }
      setPengaturanWaktu(merged);

      if (shouldSyncWithBackend()) {
        void apiRequest('/api/v1/pengaturan-waktu', {
          method: 'PUT',
          body: JSON.stringify(merged),
        }).catch(() => {});
      }

      return { ok: true };
    },
    [pengaturanWaktu],
  );

  const value: JadwalStoreContextValue = {
    rooms,
    dosenList,
    courses,
    readyCourses,
    pendingDosenCourses,
    scheduledCourses,
    parkedCourses,
    pengaturanWaktu,
    lastAudit,
    uploadedFiles,
    strictConflictValidation,
    canUndo: undoStack.length > 0,
    lastUndoMessage,
    setStrictConflictValidation,
    addDosen,
    updateDosen,
    deleteDosen,
    importDosenRows,
    updateKetersediaanDosen,
    importCourseRows,
    addManualCourse,
    mapPendingCourseLecturers,
    autoRegisterAllPendingLecturers,
    deleteCourse,
    clearAllCourses,
    generateSchedule,
    validatePlacement,
    placeCourse,
    parkCourse,
    swapCourses,
    undoLastScheduleAction,
    updatePengaturanWaktu,
  };

  return (
    <JadwalStoreContext.Provider value={value}>
      {children}
    </JadwalStoreContext.Provider>
  );
}

function compareTuple5(
  a: [number, number, number, number, number],
  b: [number, number, number, number, number],
): number {
  for (let i = 0; i < 5; i++) {
    if (a[i] !== b[i]) return (a[i] ?? 0) - (b[i] ?? 0);
  }
  return 0;
}

export function useJadwalStore(): JadwalStoreContextValue {
  const ctx = useContext(JadwalStoreContext);
  if (!ctx) {
    throw new Error('useJadwalStore must be used inside a JadwalProvider');
  }
  return ctx;
}
