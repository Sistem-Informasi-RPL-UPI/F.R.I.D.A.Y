export type DosenStatus = 'Dosen Tetap' | 'Dosen Luar';

export type DayName = 'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT' | 'SABTU';

export const ALL_DAYS: readonly DayName[] = [
  'SENIN',
  'SELASA',
  'RABU',
  'KAMIS',
  'JUMAT',
  'SABTU',
] as const;

export const WORK_DAYS: readonly DayName[] = [
  'SENIN',
  'SELASA',
  'RABU',
  'KAMIS',
  'JUMAT',
] as const;

export type ProdiName =
  'PGSD' | 'PGPAUD' | 'Teknik Komputer' | 'RPL' | 'PMM' | 'MKDU';

export const PRODI_OPTIONS: readonly ProdiName[] = [
  'PGSD',
  'PGPAUD',
  'Teknik Komputer',
  'RPL',
  'PMM',
] as const;

export type KebutuhanRuang =
  'Ruang Kelas Biasa' | 'Laboratorium Praktikum' | 'Online';

export const KEBUTUHAN_RUANG_OPTIONS: readonly KebutuhanRuang[] = [
  'Ruang Kelas Biasa',
  'Laboratorium Praktikum',
  'Online',
] as const;

export interface KetersediaanDosen {
  kodeDosen: string;
  hari: DayName[];
  startTime: string;
  endTime: string;
  isCustom: boolean;
}

export interface DosenCourseSummary {
  id: number;
  kode: string;
  nama: string;
  prodi: string;
  semester: string;
  kelas: string;
  sks: number;
}

export interface Dosen {
  kode: string;
  nama: string;
  status: DosenStatus;
  jumlahMk: number;
  totalSks: number;
  mataKuliah: DosenCourseSummary[];
  ketersediaan: KetersediaanDosen;
}

export interface Ruangan {
  id: number;
  urutan: number;
  kode: string;
  label: string;
  gedung: 'Gedung B' | 'Gedung E' | 'Smart Class & Lab';
}

export interface JadwalSegmen {
  id?: number;
  segmenKe: number;
  badgeLabel: string | null;
  day: DayName;
  room: number;
  roomKode: string;
  roomLabel: string;
  gedung: string;
  pos: number;
  len: number;
  startTime: string;
  endTime: string;
  timeDisplay: string;
}

export type CourseScheduleStatus =
  'Terjadwal' | 'Diparkir' | 'Online' | 'Terpisah' | 'Dosen Belum Terdaftar';

export interface MataKuliah {
  id: number;
  prodi: string;
  kode: string;
  nama: string;
  sks: number;
  sksDisplay: string;
  semester: string;
  kelas: string;
  cohort: string;
  kodeDosen1: string | null;
  kodeDosen2: string | null;
  rawDosen1: string | null;
  rawDosen2: string | null;
  dosen1: {
    kode: string;
    nama: string;
    status: DosenStatus;
    display: string;
  } | null;
  dosen2: {
    kode: string;
    nama: string;
    status: DosenStatus;
    display: string;
  } | null;
  kebutuhanRuang: KebutuhanRuang;
  statusAntrean: 'ready' | 'pending_dosen';
  status: CourseScheduleStatus;
  isSplit: boolean;
  segments: JadwalSegmen[];
  hariDisplay: string;
  timeDisplay: string;
  ruangDisplay: string;
  parkedReason: string | null;
  sourceFile: string | null;
}

export interface TimeSlotRow {
  pos: number | null;
  isBreak: boolean;
  startTime: string;
  endTime: string;
  label: string;
  session: 'pagi' | 'istirahat' | 'siang';
}

export interface PengaturanWaktu {
  durasiSks: number;
  mulaiPagi: string;
  istirahat: number;
  mulaiPagiJumat: string;
  mulaiSiangJumat: string;
}

export interface LecturerAuditMetric {
  kodeDosen: string;
  namaDosen: string;
  maxDailySks: number;
  minDailySks: number;
  selisihSksHarian: number;
  totalKelasTerjadwal: number;
  jumlahRuangBerbeda: number;
  catatan: string | null;
}

export interface AuditReport {
  scheduled_count: number;
  parked_count: number;
  parked_breakdown: {
    online: number;
    zero_sks: number;
    overflow: number;
  };
  conflicts_count: number;
  max_daily_sks_diff: number;
  single_room_lecturers_count: number;
  matrix_daily_sks: Record<DayName, number>;
  lecturer_metrics: LecturerAuditMetric[];
  balancing_notes: Array<{
    kodeDosen: string;
    namaDosen: string;
    selisihSksHarian: number;
    alasan: string;
  }>;
  generated_at: string;
}

export interface UploadedFileChip {
  fileName: string;
  courseCount: number;
}

export const MORNING_MAX_POS = 6;
export const TOTAL_POS = 11;

/**
 * Exact 37 rooms from PRD Lampiran A and MAP JADWAL GANJIL 2023-2024_kosong.xlsx.
 */
export const DEFAULT_RUANGAN: readonly Ruangan[] = [
  {
    id: 1,
    urutan: 1,
    kode: 'B2.002',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 2,
    urutan: 2,
    kode: 'B2.006',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 3,
    urutan: 3,
    kode: 'B2.007',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 4,
    urutan: 4,
    kode: 'B3.001',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 5,
    urutan: 5,
    kode: 'B3.002',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 6,
    urutan: 6,
    kode: 'B3.006',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 7,
    urutan: 7,
    kode: 'B3.007',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 8,
    urutan: 8,
    kode: 'B4.001',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 9,
    urutan: 9,
    kode: 'B4.002',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 10,
    urutan: 10,
    kode: 'B4.006',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 11,
    urutan: 11,
    kode: 'B5.000',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 12,
    urutan: 12,
    kode: 'B5.001',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 13,
    urutan: 13,
    kode: 'B5.002',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 14,
    urutan: 14,
    kode: 'B5.005',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 15,
    urutan: 15,
    kode: 'B5.006',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 16,
    urutan: 16,
    kode: 'B5.007',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 17,
    urutan: 17,
    kode: 'B5.008',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 18,
    urutan: 18,
    kode: 'B5.009',
    label: 'Ruang Kelas',
    gedung: 'Gedung B',
  },
  {
    id: 19,
    urutan: 19,
    kode: 'E3.000',
    label: 'Ruang Kelas',
    gedung: 'Gedung E',
  },
  {
    id: 20,
    urutan: 20,
    kode: 'E3.001',
    label: 'Ruang Kelas',
    gedung: 'Gedung E',
  },
  {
    id: 21,
    urutan: 21,
    kode: 'E3.002',
    label: 'Ruang Kelas',
    gedung: 'Gedung E',
  },
  {
    id: 22,
    urutan: 22,
    kode: 'E3.003',
    label: 'Ruang Kelas',
    gedung: 'Gedung E',
  },
  {
    id: 23,
    urutan: 23,
    kode: 'F1.001',
    label: 'SMART CLASS',
    gedung: 'Smart Class & Lab',
  },
  {
    id: 24,
    urutan: 24,
    kode: 'E2.005',
    label: 'LABKOM RPL',
    gedung: 'Smart Class & Lab',
  },
  {
    id: 25,
    urutan: 25,
    kode: 'E2.001',
    label: 'LABKOM PGSD',
    gedung: 'Smart Class & Lab',
  },
  {
    id: 26,
    urutan: 26,
    kode: 'A3.006',
    label: 'LABKOM MULTIMEDIA',
    gedung: 'Smart Class & Lab',
  },
  {
    id: 27,
    urutan: 27,
    kode: 'E1.004',
    label: 'LAB ROBOTIKA',
    gedung: 'Smart Class & Lab',
  },
  {
    id: 28,
    urutan: 28,
    kode: 'F1.003',
    label: 'LAB IPA',
    gedung: 'Smart Class & Lab',
  },
  {
    id: 29,
    urutan: 29,
    kode: 'D1.001',
    label: 'LAB. IPS',
    gedung: 'Smart Class & Lab',
  },
  {
    id: 30,
    urutan: 30,
    kode: 'D1.002',
    label: 'Ruang Kajian PGPAUD',
    gedung: 'Smart Class & Lab',
  },
  {
    id: 31,
    urutan: 31,
    kode: 'D1.003',
    label: 'LAB. PGPAUD',
    gedung: 'Smart Class & Lab',
  },
  {
    id: 32,
    urutan: 32,
    kode: 'D1.004',
    label: 'LAB. BAHASA',
    gedung: 'Smart Class & Lab',
  },
  {
    id: 33,
    urutan: 33,
    kode: 'D1.005',
    label: 'LAB. Matematika',
    gedung: 'Smart Class & Lab',
  },
  {
    id: 34,
    urutan: 34,
    kode: 'D1.006',
    label: 'R. Kuliah Lab. Matematika',
    gedung: 'Smart Class & Lab',
  },
  {
    id: 35,
    urutan: 35,
    kode: 'A3.012',
    label: 'LAB. Inovasi Teknologi dan Media Digital',
    gedung: 'Smart Class & Lab',
  },
  {
    id: 36,
    urutan: 36,
    kode: 'A3.011',
    label: 'LAB. Studio Foto',
    gedung: 'Smart Class & Lab',
  },
  {
    id: 37,
    urutan: 37,
    kode: 'A3.010',
    label: 'LAB. AUDIO',
    gedung: 'Smart Class & Lab',
  },
] as const;

export function normalizeKodeDosen(raw: string): string {
  return raw.trim().toUpperCase();
}

export function normalizeDecimalText(raw: unknown): string {
  if (raw === null || raw === undefined) return '';
  const str = String(raw).trim();
  const match = /^(\d+)\.0+$/.exec(str);
  return match ? (match[1] ?? str) : str;
}

/**
 * FR-M5: SKS 0 sampai 6. Nilai 0, 0.0, kosong, atau teks non-angka dihitung 0 SKS (tanpa default 2).
 */
export function normalizeSks(raw: unknown): number {
  if (raw === null || raw === undefined) return 0;
  const str = String(raw).trim();
  if (str === '') return 0;
  const num = Number(str);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(6, Math.round(num)));
}

export function normalizeProdi(raw: string): string {
  const clean = raw.trim();
  const upper = clean.toUpperCase();
  if (upper === 'TEKKOM' || upper === 'TEKOM' || upper === 'TEKNIK KOMPUTER') {
    return 'Teknik Komputer';
  }
  if (upper === 'PMM' || upper === 'PENDIDIKAN MULTIMEDIA') {
    return 'PMM';
  }
  if (upper === 'PGSD') return 'PGSD';
  if (upper === 'PGPAUD') return 'PGPAUD';
  if (upper === 'RPL' || upper === 'REKAYASA PERANGKAT LUNAK') return 'RPL';
  if (upper === 'MKDU') return 'MKDU';
  return clean || 'RPL';
}

export function matchesProdiFilter(
  courseProdi: string,
  filterProdi: string,
): boolean {
  if (!filterProdi || filterProdi === 'ALL') return true;
  const normCourse = normalizeProdi(courseProdi).toUpperCase();
  const normFilter = normalizeProdi(filterProdi).toUpperCase();
  return normCourse === normFilter;
}

export function normalizeKebutuhanRuang(raw: string): KebutuhanRuang {
  const upper = raw.trim().toUpperCase();
  if (upper.includes('ONLINE') || upper.includes('DARING')) {
    return 'Online';
  }
  if (upper.includes('LAB') || upper.includes('PRAKTIKUM')) {
    return 'Laboratorium Praktikum';
  }
  return 'Ruang Kelas Biasa';
}

/**
 * FR-M7: Kelas gabungan (3A & B, 3A, 3B, 3A / 3B, A dan B, 1A + 1B) dipecah menjadi baris terpisah.
 */
export function splitCombinedClasses(rawKelas: unknown): string[] {
  const clean = normalizeDecimalText(rawKelas);
  if (!clean) return ['A'];

  const parts = clean
    .split(/\s*(?:&|,|\/|\+|\bdan\b)\s*/i)
    .map((p) => normalizeDecimalText(p).trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return [clean.toUpperCase()];
  }

  const firstMatch = /^(\d+)[A-Za-z]+$/.exec(parts[0] ?? '');
  const prefix = firstMatch?.[1] ?? '';

  const results: string[] = [];
  for (const part of parts) {
    let token = part.toUpperCase();
    if (prefix && /^[A-Z]+$/.test(token)) {
      token = `${prefix}${token}`;
    }
    if (token && !results.includes(token)) {
      results.push(token);
    }
  }

  return results.length > 0 ? results : [clean.toUpperCase()];
}

export function compactName(value: string): string {
  return value.trim().replace(/\s+/g, '').toLowerCase();
}

/**
 * FR-M8: Isi sel Dosen 1 dan Dosen 2 (kode atau nama) dicocokkan ke data dosen:
 * kode lebih dulu, lalu nama (tanpa beda huruf besar/kecil dan spasi).
 */
export function matchDosenByCodeOrName(
  raw: string | null | undefined,
  dosenList: readonly { kode: string; nama: string }[],
): { kode: string; nama: string } | null {
  const val = (raw ?? '').trim();
  if (!val || val === '-') return null;

  const upper = val.toUpperCase();
  for (const d of dosenList) {
    if (d.kode.trim().toUpperCase() === upper) {
      return d;
    }
  }

  const targetCompact = compactName(val);
  for (const d of dosenList) {
    if (compactName(d.nama) === targetCompact) {
      return d;
    }
  }

  return null;
}

export function timeToMinutes(hhmm: string): number {
  const clean = hhmm.trim().replace('.', ':');
  const [hStr, mStr] = clean.split(':');
  const h = Number(hStr ?? 7);
  const m = Number(mStr ?? 0);
  return (Number.isFinite(h) ? h : 7) * 60 + (Number.isFinite(m) ? m : 0);
}

export function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function buildDayTimeSlots(
  day: DayName,
  settings: PengaturanWaktu,
): TimeSlotRow[] {
  const durasi = Math.max(15, Math.min(120, Math.round(settings.durasiSks)));
  const isFriday = day === 'JUMAT';
  const morningStart = timeToMinutes(
    isFriday ? settings.mulaiPagiJumat : settings.mulaiPagi,
  );

  const slots: TimeSlotRow[] = [];
  let cursor = morningStart;

  for (let pos = 1; pos <= MORNING_MAX_POS; pos++) {
    const startTime = minutesToTime(cursor);
    const endTime = minutesToTime(cursor + durasi);
    slots.push({
      pos,
      isBreak: false,
      startTime,
      endTime,
      label: `${startTime} - ${endTime}`,
      session: 'pagi',
    });
    cursor += durasi;
  }

  const afternoonStart = isFriday
    ? Math.max(cursor, timeToMinutes(settings.mulaiSiangJumat))
    : cursor + Math.max(15, Math.round(settings.istirahat));

  const breakStart = minutesToTime(cursor);
  const breakEnd = minutesToTime(afternoonStart);
  slots.push({
    pos: null,
    isBreak: true,
    startTime: breakStart,
    endTime: breakEnd,
    label: `${breakStart} - ${breakEnd}`,
    session: 'istirahat',
  });

  cursor = afternoonStart;
  const maxDayEndMinutes = 17 * 60; // 17:00 sharp
  for (let pos = MORNING_MAX_POS + 1; pos <= TOTAL_POS; pos++) {
    const startTime = minutesToTime(cursor);
    const rawNext = cursor + durasi;
    const cappedNext =
      pos === TOTAL_POS &&
      cursor < maxDayEndMinutes &&
      rawNext > maxDayEndMinutes
        ? maxDayEndMinutes
        : rawNext;
    const endTime = minutesToTime(cappedNext);
    slots.push({
      pos,
      isBreak: false,
      startTime,
      endTime,
      label: `${startTime} - ${endTime}`,
      session: 'siang',
    });
    cursor = cappedNext;
  }

  return slots;
}

export function getSegmentTimeRange(
  day: DayName,
  pos: number,
  len: number,
  settings: PengaturanWaktu,
): { startTime: string; endTime: string; label: string } {
  const slots = buildDayTimeSlots(day, settings).filter((s) => !s.isBreak);
  const first = slots.find((s) => s.pos === pos);
  const lastPos = pos + Math.max(1, len) - 1;
  const last = slots.find((s) => s.pos === lastPos) ?? first;
  const startTime = first?.startTime ?? '07:00';
  const endTime = last?.endTime ?? '08:40';
  return {
    startTime,
    endTime,
    label: `${startTime} - ${endTime}`,
  };
}

export function getProdiCardClass(prodi: string): string {
  const norm = normalizeProdi(prodi).toUpperCase();
  if (norm === 'PGSD') return 'ds-course-card--pgsd';
  if (norm === 'PGPAUD') return 'ds-course-card--pgpaud';
  if (norm === 'PMM') return 'ds-course-card--pmm';
  if (norm === 'TEKNIK KOMPUTER') return 'ds-course-card--tekkom';
  if (norm === 'MKDU') return 'ds-course-card--mkdu';
  return 'ds-course-card--rpl';
}
