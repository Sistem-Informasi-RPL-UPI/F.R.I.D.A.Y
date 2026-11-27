export type RoomDef = {
  no: number
  code: string
  label: string
  buildingId: "gedung-b" | "gedung-e" | "lab"
  buildingName: string
  isLab: boolean
}

export type BuildingGroupDef = {
  id: "all" | "gedung-b" | "gedung-e" | "lab"
  name: string
  rooms: string[]
}

export type TimeSettings = {
  sksMinutes: number // 15 - 120, default 50
  regStart: string // "HH:MM", default "07:00" (Senin-Kamis & Sabtu)
  regBreakMinutes: number // default 60
  friStart: string // "HH:MM", default "07:00" (Jumat pagi)
  friAfternoonStart: string // "HH:MM", default "13:00" (Jumat siang setelah Sholat Jumat)
}

export type SlotDef = {
  slot: number | string
  pos: number | null
  time: string
  start: string // "HH:MM"
  end: string // "HH:MM"
  is_break: boolean
  label?: string
}

export type MappedCourse = {
  id: string
  day: string
  start_pos: number
  end_pos: number
  start_row: number
  end_row: number
  start_time: string
  end_time: string
  time_display: string
  building: string
  room: string
  course_code: string
  class_name: string
  display_label: string
  course_name: string
  prodi: string
  sks: string
  semester: string
  lecturer_1: string
  lecturer_2: string
  room_requirement?: string
  lecturer_codes?: string[]
  // Stored previous position when parked so "Kembalikan" can restore it
  prev_day?: string
  prev_room?: string
  prev_start_pos?: number
  prev_end_pos?: number
  park_reason?: string
}

export type MindMappingData = {
  metadata: {
    title: string
    institution: string
    campus: string
    period: string
    academic_year: string
    version: string
    approval_status: string
    approved_by: string
    generated_at: string
    total_courses: number
    total_rooms: number
    total_buildings: number
    days: string[]
  }
  time_settings: TimeSettings
  programs: Array<{ code: string; name: string; color: string }>
  room_defs: RoomDef[]
  buildings: BuildingGroupDef[]
  rooms: string[]
  days_slots: Record<string, SlotDef[]>
  courses: MappedCourse[]
  parked_courses: MappedCourse[]
  matrix_cells: Record<string, string>
}

export type LecturerConstraint = {
  allowedDays: string[]
  startTime: string // "HH:MM"
  endTime: string // "HH:MM"
}

export const DAYS_6 = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
export const WORK_DAYS_5 = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]

export const DEFAULT_TIME_SETTINGS: TimeSettings = {
  sksMinutes: 50,
  regStart: "07:00",
  regBreakMinutes: 60,
  friStart: "07:00",
  friAfternoonStart: "13:00",
}

export const ROOMS_37: RoomDef[] = [
  // Ruang Kelas Gedung B (1-18)
  { no: 1, code: "B2.002", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 2, code: "B2.006", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 3, code: "B2.007", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 4, code: "B3.001", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 5, code: "B3.002", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 6, code: "B3.006", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 7, code: "B3.007", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 8, code: "B4.001", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 9, code: "B4.002", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 10, code: "B4.006", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 11, code: "B5.000", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 12, code: "B5.001", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 13, code: "B5.002", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 14, code: "B5.005", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 15, code: "B5.006", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 16, code: "B5.007", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 17, code: "B5.008", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  { no: 18, code: "B5.009", label: "Ruang Kelas", buildingId: "gedung-b", buildingName: "Ruang Kelas Gedung B", isLab: false },
  // Ruang Kelas Gedung E (19-22)
  { no: 19, code: "E3.000", label: "Ruang Kelas", buildingId: "gedung-e", buildingName: "Ruang Kelas Gedung E", isLab: false },
  { no: 20, code: "E3.001", label: "Ruang Kelas", buildingId: "gedung-e", buildingName: "Ruang Kelas Gedung E", isLab: false },
  { no: 21, code: "E3.002", label: "Ruang Kelas", buildingId: "gedung-e", buildingName: "Ruang Kelas Gedung E", isLab: false },
  { no: 22, code: "E3.003", label: "Ruang Kelas", buildingId: "gedung-e", buildingName: "Ruang Kelas Gedung E", isLab: false },
  // Smart Class & Laboratorium (23-37)
  { no: 23, code: "F1.001", label: "SMART CLASS", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
  { no: 24, code: "E2.005", label: "LABKOM RPL", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
  { no: 25, code: "E2.001", label: "LABKOM PGSD", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
  { no: 26, code: "A3.006", label: "LABKOM MULTIMEDIA", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
  { no: 27, code: "E1.004", label: "LAB ROBOTIKA", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
  { no: 28, code: "F1.003", label: "LAB IPA", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
  { no: 29, code: "D1.001", label: "LAB. IPS", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
  { no: 30, code: "D1.002", label: "Ruang Kajian PGPAUD", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
  { no: 31, code: "D1.003", label: "LAB. PGPAUD", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
  { no: 32, code: "D1.004", label: "LAB. BAHASA", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
  { no: 33, code: "D1.005", label: "LAB. Matematika", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
  { no: 34, code: "D1.006", label: "R. Kuliah Lab. Matematika", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
  { no: 35, code: "A3.012", label: "LAB. Inovasi Teknologi dan Media Digital", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
  { no: 36, code: "A3.011", label: "LAB. Studio Foto", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
  { no: 37, code: "A3.010", label: "LAB. AUDIO", buildingId: "lab", buildingName: "Smart Class & Laboratorium", isLab: true },
]

export const CLASSROOM_CODES_1_22 = ROOMS_37.filter((r) => !r.isLab).map((r) => r.code)
export const LAB_CODES_23_37 = ROOMS_37.filter((r) => r.isLab).map((r) => r.code)
export const ALL_ROOM_CODES_37 = ROOMS_37.map((r) => r.code)

export const BUILDINGS_37: BuildingGroupDef[] = [
  { id: "all", name: "Semua Ruangan", rooms: ALL_ROOM_CODES_37 },
  { id: "gedung-b", name: "Ruang Kelas Gedung B (1–18)", rooms: ROOMS_37.filter((r) => r.buildingId === "gedung-b").map((r) => r.code) },
  { id: "gedung-e", name: "Ruang Kelas Gedung E (19–22)", rooms: ROOMS_37.filter((r) => r.buildingId === "gedung-e").map((r) => r.code) },
  { id: "lab", name: "Smart Class & Laboratorium (23–37)", rooms: LAB_CODES_23_37 },
]

export const PROGRAMS_LIST = [
  { code: "PGSD", name: "Pendidikan Guru Sekolah Dasar", color: "emerald" },
  { code: "PGPAUD", name: "Pendidikan Guru PAUD", color: "amber" },
  { code: "RPL", name: "Rekayasa Perangkat Lunak", color: "blue" },
  { code: "P. Multimedia", name: "Pendidikan Multimedia", color: "purple" },
  { code: "TEKOM", name: "Teknik Komputer", color: "rose" },
  { code: "MKDU / Umum", name: "Mata Kuliah Dasar Umum / Lintas Prodi", color: "indigo" },
]

export function getRoomDef(code: string): RoomDef | undefined {
  return ROOMS_37.find((r) => r.code === code)
}

export function timeToMinutes(hhmm: string): number {
  const clean = (hhmm || "07:00").replace(".", ":").trim()
  const [hStr, mStr] = clean.split(":")
  const h = parseInt(hStr || "0", 10)
  const m = parseInt(mStr || "0", 10)
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m)
}

export function minutesToColon(totalMin: number): string {
  const safe = Math.max(0, totalMin)
  const h = Math.floor(safe / 60) % 24
  const m = safe % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function minutesToDot(totalMin: number): string {
  return minutesToColon(totalMin).replace(":", ".")
}

export function buildDaysSlots(settingsInput?: Partial<TimeSettings>): Record<string, SlotDef[]> {
  const settings: TimeSettings = {
    sksMinutes: Math.min(120, Math.max(15, Number(settingsInput?.sksMinutes) || DEFAULT_TIME_SETTINGS.sksMinutes)),
    regStart: settingsInput?.regStart || DEFAULT_TIME_SETTINGS.regStart,
    regBreakMinutes: Math.max(0, Number(settingsInput?.regBreakMinutes ?? DEFAULT_TIME_SETTINGS.regBreakMinutes)),
    friStart: settingsInput?.friStart || DEFAULT_TIME_SETTINGS.friStart,
    friAfternoonStart: settingsInput?.friAfternoonStart || DEFAULT_TIME_SETTINGS.friAfternoonStart,
  }

  const buildRegularDay = (afternoonSlotsCount: number): SlotDef[] => {
    const slots: SlotDef[] = []
    let cursor = timeToMinutes(settings.regStart)
    // Morning: Pos 1 - 6
    for (let pos = 1; pos <= 6; pos++) {
      const start = cursor
      const end = cursor + settings.sksMinutes
      slots.push({
        slot: pos,
        pos,
        time: `${minutesToDot(start)} - ${minutesToDot(end)}`,
        start: minutesToColon(start),
        end: minutesToColon(end),
        is_break: false,
      })
      cursor = end
    }
    // Break
    if (settings.regBreakMinutes > 0) {
      const bStart = cursor
      const bEnd = cursor + settings.regBreakMinutes
      slots.push({
        slot: "break",
        pos: null,
        time: `${minutesToDot(bStart)} - ${minutesToDot(bEnd)}`,
        start: minutesToColon(bStart),
        end: minutesToColon(bEnd),
        is_break: true,
        label: "ISTIRAHAT / BREAK",
      })
      cursor = bEnd
    }
    // Afternoon: Pos 7 .. 6 + afternoonSlotsCount
    for (let i = 1; i <= afternoonSlotsCount; i++) {
      const pos = 6 + i
      const start = cursor
      const end = cursor + settings.sksMinutes
      slots.push({
        slot: pos,
        pos,
        time: `${minutesToDot(start)} - ${minutesToDot(end)}`,
        start: minutesToColon(start),
        end: minutesToColon(end),
        is_break: false,
      })
      cursor = end
    }
    return slots
  }

  const buildFriday = (): SlotDef[] => {
    const slots: SlotDef[] = []
    let cursor = timeToMinutes(settings.friStart)
    // Morning: Pos 1 - 5
    for (let pos = 1; pos <= 5; pos++) {
      const start = cursor
      const end = cursor + settings.sksMinutes
      slots.push({
        slot: pos,
        pos,
        time: `${minutesToDot(start)} - ${minutesToDot(end)}`,
        start: minutesToColon(start),
        end: minutesToColon(end),
        is_break: false,
      })
      cursor = end
    }
    // Sholat Jumat Break until friAfternoonStart
    const aftStart = Math.max(cursor, timeToMinutes(settings.friAfternoonStart))
    if (aftStart > cursor) {
      slots.push({
        slot: "break-jumat",
        pos: null,
        time: `${minutesToDot(cursor)} - ${minutesToDot(aftStart)}`,
        start: minutesToColon(cursor),
        end: minutesToColon(aftStart),
        is_break: true,
        label: "ISTIRAHAT / SHOLAT JUM'AT",
      })
    }
    cursor = aftStart
    // Afternoon: Pos 6 - 13 (8 slots)
    for (let i = 0; i < 8; i++) {
      const pos = 6 + i
      const start = cursor
      const end = cursor + settings.sksMinutes
      slots.push({
        slot: pos,
        pos,
        time: `${minutesToDot(start)} - ${minutesToDot(end)}`,
        start: minutesToColon(start),
        end: minutesToColon(end),
        is_break: false,
      })
      cursor = end
    }
    return slots
  }

  return {
    Senin: buildRegularDay(8),  // Pos 1-6, Break, Pos 7-14
    Selasa: buildRegularDay(8), // Pos 1-6, Break, Pos 7-14
    Rabu: buildRegularDay(6),   // Pos 1-6, Break, Pos 7-12
    Kamis: buildRegularDay(6),  // Pos 1-6, Break, Pos 7-12
    Jumat: buildFriday(),       // Pos 1-5, Sholat Jumat, Pos 6-13
    Sabtu: buildRegularDay(8),  // Pos 1-6, Break, Pos 7-14
  }
}

export function createEmptyMindMappingData(settingsInput?: Partial<TimeSettings>): MindMappingData {
  const time_settings: TimeSettings = {
    ...DEFAULT_TIME_SETTINGS,
    ...settingsInput,
  }
  return {
    metadata: {
      title: "MIND MAPPING JADWAL PERKULIAHAN",
      institution: "UNIVERSITAS PENDIDIKAN INDONESIA",
      campus: "UPI KAMPUS CIBIRU",
      period: "Semester Ganjil",
      academic_year: "2023/2024",
      version: "v2.0.0-template-37",
      approval_status: "Siap Digenerate & Diatur",
      approved_by: "Admin Akademik UPI Kampus Cibiru",
      generated_at: "Belum digenerate",
      total_courses: 0,
      total_rooms: 37,
      total_buildings: 3,
      days: [...DAYS_6],
    },
    time_settings,
    programs: PROGRAMS_LIST,
    room_defs: ROOMS_37,
    buildings: BUILDINGS_37,
    rooms: ALL_ROOM_CODES_37,
    days_slots: buildDaysSlots(time_settings),
    courses: [],
    parked_courses: [],
    matrix_cells: {},
  }
}

/**
 * Splits combined class labels into individual class names.
 * Examples:
 *  - "3A & B" -> ["3A", "3B"]
 *  - "3A, 3B" -> ["3A", "3B"]
 *  - "3A / 3B" -> ["3A", "3B"]
 *  - "A dan B" (semester="3") -> ["3A", "3B"]
 *  - "7 ABADXXI" -> ["7 ABADXXI"] (not split)
 */
export function splitCombinedClasses(rawClass: string, semester?: string): string[] {
  const trimmed = (rawClass || "").trim()
  if (!trimmed) {
    return [semester ? `${semester}A` : "A"]
  }

  // Only split when explicit combinators exist: &, /, +, comma, " dan ", " and "
  const hasCombinator = /(&|,|\/|\+|\bdan\b|\band\b)/i.test(trimmed)
  if (!hasCombinator) {
    return [trimmed]
  }

  const rawParts = trimmed
    .split(/\s*(?:&|,|\/|\+|\bdan\b|\band\b)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean)

  if (rawParts.length <= 1) {
    return [trimmed]
  }

  // Detect leading semester digit from first part or semester param
  const semDigitFromParam = (semester || "").match(/\d+/)?.[0] || ""
  const firstPrefixMatch = rawParts[0].match(/^(\d+)\s*/)
  const sharedPrefix = firstPrefixMatch ? firstPrefixMatch[1] : semDigitFromParam

  const result: string[] = []
  const seen = new Set<string>()
  for (const part of rawParts) {
    let normalized = part.replace(/\s+/g, " ").trim()
    // If part is just a letter like "B" or "C" and we have a semester prefix (e.g. "3"), turn into "3B"
    if (sharedPrefix && /^[A-Za-z]{1,2}$/.test(normalized)) {
      normalized = `${sharedPrefix}${normalized.toUpperCase()}`
    } else if (/^\d+[a-z]$/.test(normalized)) {
      normalized = normalized.toUpperCase()
    }
    if (!seen.has(normalized.toUpperCase())) {
      seen.add(normalized.toUpperCase())
      result.push(normalized)
    }
  }

  return result.length > 0 ? result : [trimmed]
}

/**
 * Normalizes student cohort key by combining Prodi + Semester + Class letter/suffix.
 * e.g. PGSD + sem "3" + class "3B" -> "PGSD|3|B"
 *      PGSD + sem "3" + class "B"  -> "PGSD|3|B"
 *      PGSD + sem "1" + class "1B" -> "PGSD|1|B" (does NOT conflict with PGSD|3|B)
 */
export function getCohortKey(prodi: string, semester: string, className: string): string {
  const normProdi = (prodi || "UMUM").trim().toUpperCase()
  const rawClass = (className || "").trim().toUpperCase()
  const semFromParam = (semester || "").trim().match(/\d+/)?.[0] || ""
  const semFromClass = rawClass.match(/^(\d+)/)?.[1] || ""
  const effectiveSem = semFromParam || semFromClass || "0"
  const classSuffix = semFromClass ? rawClass.slice(semFromClass.length).trim() : rawClass
  return `${normProdi}|${effectiveSem}|${classSuffix || rawClass}`
}

export function rebuildMatrixCells(courses: MappedCourse[], daysSlots: Record<string, SlotDef[]>): Record<string, string> {
  const cells: Record<string, string> = {}
  courses.forEach((course) => {
    const slots = daysSlots[course.day] || []
    for (let pos = course.start_pos; pos <= course.end_pos; pos++) {
      const slotDef = slots.find((s) => !s.is_break && s.pos === pos)
      if (slotDef) {
        cells[`${course.day}|${slotDef.time}|${course.room}`] = course.id
      }
    }
  })
  return cells
}

export function syncCourseTimesWithSlots(course: MappedCourse, daysSlots: Record<string, SlotDef[]>): MappedCourse {
  const day = course.day && daysSlots[course.day] ? course.day : "Senin"
  const slots = daysSlots[day] || []
  const firstSlot = slots.find((s) => !s.is_break && s.pos === course.start_pos)
  const lastSlot = slots.find((s) => !s.is_break && s.pos === course.end_pos)
  if (!firstSlot || !lastSlot) {
    return course
  }
  const startDot = firstSlot.start.replace(":", ".")
  const endDot = lastSlot.end.replace(":", ".")
  return {
    ...course,
    start_time: startDot,
    end_time: endDot,
    time_display: `${startDot} - ${endDot}`,
  }
}

export function recalculateMindMappingTimes(data: MindMappingData, newSettings: TimeSettings): MindMappingData {
  const sanitized: TimeSettings = {
    sksMinutes: Math.min(120, Math.max(15, Number(newSettings.sksMinutes) || 50)),
    regStart: newSettings.regStart || "07:00",
    regBreakMinutes: Math.max(0, Number(newSettings.regBreakMinutes ?? 60)),
    friStart: newSettings.friStart || "07:00",
    friAfternoonStart: newSettings.friAfternoonStart || "13:00",
  }
  const days_slots = buildDaysSlots(sanitized)
  const courses = (data.courses || []).map((c) => syncCourseTimesWithSlots(c, days_slots))
  const parked_courses = (data.parked_courses || []).map((c) => {
    if (c.prev_day && c.prev_start_pos && c.prev_end_pos) {
      const updated = syncCourseTimesWithSlots(
        { ...c, day: c.prev_day, start_pos: c.prev_start_pos, end_pos: c.prev_end_pos },
        days_slots
      )
      return {
        ...c,
        start_time: updated.start_time,
        end_time: updated.end_time,
        time_display: updated.time_display,
      }
    }
    return syncCourseTimesWithSlots(c, days_slots)
  })
  const matrix_cells = rebuildMatrixCells(courses, days_slots)

  return {
    ...data,
    time_settings: sanitized,
    days_slots,
    courses,
    parked_courses,
    matrix_cells,
  }
}

/**
 * Normalizes any loaded MindMappingData (e.g., from localStorage) to the 37-room 2023/2024 schema,
 * splits any combined classes, and ensures valid room codes / slots.
 */
export function normalizeLoadedMindMappingData(raw: any): MindMappingData {
  if (!raw || typeof raw !== "object") {
    return createEmptyMindMappingData()
  }

  // If old 30-room data (e.g., contains C1 or total_rooms !== 37), start fresh with empty 37-room template
  if (!Array.isArray(raw.rooms) || raw.rooms.length !== 37 || !raw.rooms.includes("B2.002")) {
    return createEmptyMindMappingData()
  }

  const time_settings: TimeSettings = {
    ...DEFAULT_TIME_SETTINGS,
    ...(raw.time_settings || {}),
  }
  const days_slots = buildDaysSlots(time_settings)

  const normalizedCourses: MappedCourse[] = []
  const normalizedParked: MappedCourse[] = []

  const processCourse = (c: any, isParked: boolean) => {
    const classes = splitCombinedClasses(c.class_name || "", c.semester || "")
    classes.forEach((cls, idx) => {
      const id = idx === 0 ? c.id : `${c.id}-S${idx + 1}`
      const sksNum = Math.max(1, parseInt(String(c.sks || "2"), 10) || 2)
      const startPos = Number(c.start_pos) || Math.max(1, (Number(c.start_row) || 6) - 5)
      const endPos = Number(c.end_pos) || startPos + sksNum - 1
      const roomDef = getRoomDef(c.room)
      const base: MappedCourse = {
        ...c,
        id,
        class_name: cls,
        display_label: `${c.course_code} - ${cls}`,
        start_pos: startPos,
        end_pos: endPos,
        start_row: startPos + 5,
        end_row: endPos + 5,
        building: roomDef ? roomDef.buildingName : (c.building || "Ruang Kelas Gedung B"),
      }
      const synced = syncCourseTimesWithSlots(base, days_slots)
      // If split produced extra class(es), park the extra ones so they don't collide on the same cell
      if (isParked || idx > 0 || !roomDef) {
        normalizedParked.push({
          ...synced,
          park_reason: idx > 0 ? "Hasil pemisahan kelas gabungan" : (c.park_reason || "Diparkir sementara"),
        })
      } else {
        normalizedCourses.push(synced)
      }
    })
  }

  ;(raw.courses || []).forEach((c: any) => processCourse(c, false))
  ;(raw.parked_courses || []).forEach((c: any) => processCourse(c, true))

  const matrix_cells = rebuildMatrixCells(normalizedCourses, days_slots)

  return {
    metadata: {
      ...createEmptyMindMappingData(time_settings).metadata,
      ...(raw.metadata || {}),
      total_courses: normalizedCourses.length,
      total_rooms: 37,
      total_buildings: 3,
      days: [...DAYS_6],
    },
    time_settings,
    programs: PROGRAMS_LIST,
    room_defs: ROOMS_37,
    buildings: BUILDINGS_37,
    rooms: ALL_ROOM_CODES_37,
    days_slots,
    courses: normalizedCourses,
    parked_courses: normalizedParked,
    matrix_cells,
  }
}

export function getProdiPalette(prodi: string): { bg: string; border: string; text: string; cssClass: string } {
  const p = (prodi || "").toLowerCase()
  if (p.includes("pgsd")) return { bg: "#dcfce7", border: "#16a34a", text: "#14532d", cssClass: "card-pgsd" }
  if (p.includes("pgpaud") || p.includes("paud")) return { bg: "#fef3c7", border: "#d97706", text: "#78350f", cssClass: "card-pgpaud" }
  if (p.includes("rpl")) return { bg: "#dbeafe", border: "#2563eb", text: "#1e3a8a", cssClass: "card-rpl" }
  if (p.includes("multi") || p.includes("pmm")) return { bg: "#f3e8ff", border: "#9333ea", text: "#581c87", cssClass: "card-pmm" }
  if (p.includes("tekom") || p.includes("tekkom") || p.includes("komputer")) return { bg: "#ffe4e6", border: "#e11d48", text: "#881337", cssClass: "card-tekom" }
  return { bg: "#e0e7ff", border: "#4f46e5", text: "#312e81", cssClass: "card-umum" }
}

function escapeCsvCell(val: string | number | undefined | null): string {
  const str = String(val ?? "")
  return `"${str.replace(/"/g, '""')}"`
}

/**
 * Generates dynamic Excel-ready CSV from the latest Mind Mapping state:
 * - 3 room header rows (Label/Nama Ruang, Kode Ruang, Nomor 1-37)
 * - Full matrix rows (HARI;JAM;Pos;...)
 * - Course details summary table (+ parked courses)
 */
export function exportMindMappingCsv(data: MindMappingData): void {
  const roomDefs = data.room_defs || ROOMS_37
  const days = data.metadata?.days || DAYS_6
  const lines: string[] = []

  // Title rows
  lines.push(escapeCsvCell(`JADWAL PERKULIAHAN - ${data.metadata.campus} (${data.metadata.period} ${data.metadata.academic_year})`))
  lines.push(escapeCsvCell(`Versi: ${data.metadata.version} | Durasi 1 SKS: ${data.time_settings.sksMinutes} Menit | Generate: ${data.metadata.generated_at}`))
  lines.push("")

  // 3 Header Rows
  lines.push(["HARI", "JAM", "Pos", ...roomDefs.map((r) => r.label)].map(escapeCsvCell).join(";"))
  lines.push(["", "", "", ...roomDefs.map((r) => r.code)].map(escapeCsvCell).join(";"))
  lines.push(["", "", "", ...roomDefs.map((r) => r.no)].map(escapeCsvCell).join(";"))

  // Matrix Body
  days.forEach((day) => {
    const slots = data.days_slots[day] || []
    slots.forEach((slot, idx) => {
      const dayCol = idx === 0 ? day.toUpperCase() : ""
      const posCol = slot.is_break ? "" : String(slot.pos ?? "")
      if (slot.is_break) {
        const breakCells = roomDefs.map((_, rIdx) => (rIdx === 0 ? (slot.label || "ISTIRAHAT") : ""))
        lines.push([dayCol, slot.time, posCol, ...breakCells].map(escapeCsvCell).join(";"))
      } else {
        const rowCells = roomDefs.map((r) => {
          const cid = data.matrix_cells[`${day}|${slot.time}|${r.code}`]
          if (!cid) return ""
          const c = data.courses.find((item) => item.id === cid)
          if (!c) return ""
          return `${c.course_code} - ${c.class_name} | ${c.course_name} (${c.sks} SKS) | ${c.lecturer_1}${c.lecturer_2 ? " / " + c.lecturer_2 : ""}`
        })
        lines.push([dayCol, slot.time, posCol, ...rowCells].map(escapeCsvCell).join(";"))
      }
    })
  })

  // Course Details Section
  lines.push("")
  lines.push(escapeCsvCell("DAFTAR RINCIAN MATA KULIAH TERPETAKAN"))
  lines.push(["No", "Status", "Prodi", "Kode MK", "Nama Mata Kuliah", "SKS", "Semester", "Kelas", "Hari", "Jam", "Pos", "Kode Ruang", "Nama Ruang/Lab", "Dosen 1", "Dosen 2"].map(escapeCsvCell).join(";"))

  let num = 1
  data.courses.forEach((c) => {
    const rDef = getRoomDef(c.room)
    lines.push([
      num++,
      "Terjadwal",
      c.prodi,
      c.course_code,
      c.course_name,
      c.sks,
      c.semester,
      c.class_name,
      c.day,
      c.time_display,
      `${c.start_pos}-${c.end_pos}`,
      c.room,
      rDef ? rDef.label : c.building,
      c.lecturer_1,
      c.lecturer_2 || "",
    ].map(escapeCsvCell).join(";"))
  })

  ;(data.parked_courses || []).forEach((c) => {
    lines.push([
      num++,
      "Parkir Sementara",
      c.prodi,
      c.course_code,
      c.course_name,
      c.sks,
      c.semester,
      c.class_name,
      c.prev_day || "-",
      c.time_display || "-",
      "-",
      c.prev_room || "-",
      c.park_reason || "Parkir Sementara",
      c.lecturer_1,
      c.lecturer_2 || "",
    ].map(escapeCsvCell).join(";"))
  })

  const csvContent = "\uFEFF" + lines.join("\r\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `MAP_JADWAL_UPI_CIBIRU_${(data.metadata.academic_year || "2023-2024").replace("/", "-")}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = (text || "").split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ""
  for (const w of words) {
    const test = current ? `${current} ${w}` : w
    if (ctx.measureText(test).width <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = w
      if (lines.length >= maxLines) break
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current)
  }
  if (lines.length === maxLines && words.length > 0) {
    const last = lines[maxLines - 1]
    if (ctx.measureText(last).width > maxWidth) {
      let trimmed = last
      while (trimmed.length > 3 && ctx.measureText(trimmed + "…").width > maxWidth) {
        trimmed = trimmed.slice(0, -1)
      }
      lines[maxLines - 1] = trimmed + "…"
    }
  }
  return lines
}

/**
 * Renders full matrix table to HTML5 Canvas at 2x Ultra-HD scale (PNG or JPG)
 * respecting active building & day filters.
 */
export function exportMindMappingImage(
  data: MindMappingData,
  options: { format: "png" | "jpeg"; selectedBuilding: string; selectedDay: string }
): void {
  const building = data.buildings.find((b) => b.id === options.selectedBuilding) || data.buildings[0]
  const activeRoomCodes = building ? building.rooms : data.rooms
  const activeRooms = activeRoomCodes
    .map((code) => getRoomDef(code))
    .filter((r): r is RoomDef => Boolean(r))
  const days = options.selectedDay === "all" ? (data.metadata.days || DAYS_6) : [options.selectedDay]

  const scale = 2
  const padding = 24
  const titleHeight = 74
  const legendHeight = 32
  const headerRow1H = 38
  const headerRow2H = 26
  const headerRow3H = 22
  const headerTotalH = headerRow1H + headerRow2H + headerRow3H
  const dayColW = 68
  const jamColW = 104
  const posColW = 38
  const roomColW = 134
  const slotRowH = 44
  const breakRowH = 26

  // Compute total rows height
  let bodyHeight = 0
  days.forEach((day) => {
    const slots = data.days_slots[day] || []
    slots.forEach((s) => {
      bodyHeight += s.is_break ? breakRowH : slotRowH
    })
  })

  const tableW = dayColW + jamColW + posColW + activeRooms.length * roomColW
  const logicalW = tableW + padding * 2
  const logicalH = padding * 2 + titleHeight + legendHeight + headerTotalH + bodyHeight + 20

  const canvas = document.createElement("canvas")
  canvas.width = Math.ceil(logicalW * scale)
  canvas.height = Math.ceil(logicalH * scale)
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.scale(scale, scale)

  // Background
  ctx.fillStyle = "#0b1120"
  ctx.fillRect(0, 0, logicalW, logicalH)

  // Title Header
  ctx.fillStyle = "#f8fafc"
  ctx.font = "bold 20px 'Segoe UI', Arial, sans-serif"
  ctx.fillText(
    `MIND MAPPING JADWAL PERKULIAHAN — ${data.metadata.campus} (${data.metadata.period} ${data.metadata.academic_year})`,
    padding,
    padding + 26
  )
  ctx.fillStyle = "#94a3b8"
  ctx.font = "12px 'Segoe UI', Arial, sans-serif"
  ctx.fillText(
    `Filter: ${building?.name || "Semua Ruangan"} (${activeRooms.length} Ruang) • Hari: ${options.selectedDay === "all" ? "Senin–Sabtu" : options.selectedDay} • 1 SKS = ${data.time_settings.sksMinutes} Menit • Total MK Terjadwal: ${data.courses.length}`,
    padding,
    padding + 48
  )

  // Legend
  const legendY = padding + titleHeight - 4
  const legendItems = [
    { label: "PGSD", bg: "#dcfce7", border: "#16a34a" },
    { label: "PGPAUD", bg: "#fef3c7", border: "#d97706" },
    { label: "RPL", bg: "#dbeafe", border: "#2563eb" },
    { label: "P. Multimedia", bg: "#f3e8ff", border: "#9333ea" },
    { label: "Teknik Komputer", bg: "#ffe4e6", border: "#e11d48" },
    { label: "MKDU / Umum", bg: "#e0e7ff", border: "#4f46e5" },
  ]
  let lx = padding
  ctx.font = "bold 11px 'Segoe UI', Arial, sans-serif"
  legendItems.forEach((item) => {
    ctx.fillStyle = item.bg
    ctx.fillRect(lx, legendY, 14, 14)
    ctx.strokeStyle = item.border
    ctx.lineWidth = 1.5
    ctx.strokeRect(lx, legendY, 14, 14)
    ctx.fillStyle = "#e2e8f0"
    ctx.fillText(item.label, lx + 20, legendY + 11)
    lx += ctx.measureText(item.label).width + 38
  })

  const tableTop = padding + titleHeight + legendHeight
  const tableLeft = padding

  // Draw Left Sticky Header Columns (HARI, JAM, Pos) spanning 3 rows
  const drawHeaderCell = (x: number, y: number, w: number, h: number, bg: string, color: string, text: string, font: string) => {
    ctx.fillStyle = bg
    ctx.fillRect(x, y, w, h)
    ctx.strokeStyle = "#334155"
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, w, h)
    ctx.fillStyle = color
    ctx.font = font
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    const wrapped = wrapCanvasText(ctx, text, w - 8, 2)
    const lineH = 12
    const startY = y + h / 2 - ((wrapped.length - 1) * lineH) / 2
    wrapped.forEach((line, i) => {
      ctx.fillText(line, x + w / 2, startY + i * lineH)
    })
  }

  drawHeaderCell(tableLeft, tableTop, dayColW, headerTotalH, "#1e293b", "#f8fafc", "HARI", "bold 11px 'Segoe UI', Arial, sans-serif")
  drawHeaderCell(tableLeft + dayColW, tableTop, jamColW, headerTotalH, "#1e293b", "#f8fafc", "JAM", "bold 11px 'Segoe UI', Arial, sans-serif")
  drawHeaderCell(tableLeft + dayColW + jamColW, tableTop, posColW, headerTotalH, "#1e293b", "#f8fafc", "Pos", "bold 11px 'Segoe UI', Arial, sans-serif")

  // Draw 3 Room Header Rows
  activeRooms.forEach((room, idx) => {
    const rx = tableLeft + dayColW + jamColW + posColW + idx * roomColW
    const row1Bg = room.isLab ? "#312e81" : room.buildingId === "gedung-e" ? "#1e3a5f" : "#1e293b"
    drawHeaderCell(rx, tableTop, roomColW, headerRow1H, row1Bg, "#e2e8f0", room.label, "bold 10px 'Segoe UI', Arial, sans-serif")
    drawHeaderCell(rx, tableTop + headerRow1H, roomColW, headerRow2H, "#0f172a", "#38bdf8", room.code, "bold 11px 'Segoe UI', Arial, sans-serif")
    drawHeaderCell(rx, tableTop + headerRow1H + headerRow2H, roomColW, headerRow3H, "#090e1a", "#94a3b8", String(room.no), "bold 10px 'Segoe UI', Arial, sans-serif")
  })

  // Draw Body
  let curY = tableTop + headerTotalH
  days.forEach((day) => {
    const slots = data.days_slots[day] || []
    const dayStartY = curY
    let dayH = 0
    const slotYMap: Record<number, { y: number; h: number }> = {}

    slots.forEach((slot) => {
      const rh = slot.is_break ? breakRowH : slotRowH
      if (!slot.is_break && slot.pos !== null) {
        slotYMap[slot.pos] = { y: curY, h: rh }
      }
      // JAM col
      drawHeaderCell(tableLeft + dayColW, curY, jamColW, rh, slot.is_break ? "#1e293b" : "#0f172a", slot.is_break ? "#fbbf24" : "#cbd5e1", slot.time, "bold 10px 'Segoe UI', Arial, sans-serif")
      // Pos col
      drawHeaderCell(tableLeft + dayColW + jamColW, curY, posColW, rh, slot.is_break ? "#1e293b" : "#0f172a", "#94a3b8", slot.is_break ? "" : String(slot.pos ?? ""), "bold 10px 'Segoe UI', Arial, sans-serif")

      if (slot.is_break) {
        drawHeaderCell(
          tableLeft + dayColW + jamColW + posColW,
          curY,
          activeRooms.length * roomColW,
          rh,
          "#1e293b",
          "#fbbf24",
          slot.label || "ISTIRAHAT / BREAK",
          "bold 11px 'Segoe UI', Arial, sans-serif"
        )
      } else {
        // Draw empty grid cells
        activeRooms.forEach((_, rIdx) => {
          const rx = tableLeft + dayColW + jamColW + posColW + rIdx * roomColW
          ctx.fillStyle = "#020617"
          ctx.fillRect(rx, curY, roomColW, rh)
          ctx.strokeStyle = "#1e293b"
          ctx.lineWidth = 1
          ctx.strokeRect(rx, curY, roomColW, rh)
        })
      }

      curY += rh
      dayH += rh
    })

    // Day merged column
    drawHeaderCell(tableLeft, dayStartY, dayColW, dayH, "#0f172a", "#f8fafc", day.toUpperCase(), "bold 11px 'Segoe UI', Arial, sans-serif")

    // Draw courses for this day
    const dayCourses = data.courses.filter((c) => c.day === day)
    dayCourses.forEach((course) => {
      const rIdx = activeRooms.findIndex((r) => r.code === course.room)
      if (rIdx === -1) return
      const startInfo = slotYMap[course.start_pos]
      const endInfo = slotYMap[course.end_pos]
      if (!startInfo || !endInfo) return

      const rx = tableLeft + dayColW + jamColW + posColW + rIdx * roomColW + 2
      const ry = startInfo.y + 2
      const rw = roomColW - 4
      const rh = endInfo.y + endInfo.h - startInfo.y - 4

      const pal = getProdiPalette(course.prodi)
      ctx.fillStyle = pal.bg
      ctx.fillRect(rx, ry, rw, rh)
      ctx.strokeStyle = pal.border
      ctx.lineWidth = 2
      ctx.strokeRect(rx, ry, rw, rh)
      // Left accent bar
      ctx.fillStyle = pal.border
      ctx.fillRect(rx, ry, 4, rh)

      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      ctx.fillStyle = pal.text

      // Line 1: Code - Class (SKS)
      ctx.font = "bold 10px 'Segoe UI', Arial, sans-serif"
      ctx.fillText(`${course.course_code} • ${course.class_name} (${course.sks} SKS)`, rx + 8, ry + 5, rw - 12)

      // Line 2-3: Course Name
      ctx.font = "600 9.5px 'Segoe UI', Arial, sans-serif"
      const nameLines = wrapCanvasText(ctx, course.course_name, rw - 12, rh >= 80 ? 3 : 2)
      let ty = ry + 19
      nameLines.forEach((line) => {
        ctx.fillText(line, rx + 8, ty, rw - 12)
        ty += 12
      })

      // Lecturer
      ctx.font = "9px 'Segoe UI', Arial, sans-serif"
      ctx.fillStyle = "#334155"
      const lecLines = wrapCanvasText(ctx, course.lecturer_1, rw - 12, 2)
      lecLines.forEach((line) => {
        if (ty + 10 < ry + rh) {
          ctx.fillText(line, rx + 8, ty + 2, rw - 12)
          ty += 11
        }
      })
    })

    // Day separator line
    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(tableLeft, curY)
    ctx.lineTo(tableLeft + tableW, curY)
    ctx.stroke()
  })

  const mime = options.format === "jpeg" ? "image/jpeg" : "image/png"
  const ext = options.format === "jpeg" ? "jpg" : "png"
  const dataUrl = canvas.toDataURL(mime, 0.96)
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = `MIND_MAPPING_UPI_CIBIRU_${(data.metadata.academic_year || "2023-2024").replace("/", "-")}_${options.selectedBuilding}_${options.selectedDay}.${ext}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Generates a completely self-contained Offline HTML string (zero external CDN links)
 * embedding the latest MindMappingData state, with 37 rooms, 3-row headers, HARI/JAM/Pos,
 * Senin-Sabtu, Setting Waktu modal, and CSV / PNG HD / JPG HD downloads.
 */
export function generateDynamicOfflineHtml(data: MindMappingData): string {
  const safeJson = JSON.stringify(data).replace(/</g, "\\u003c")
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mind Mapping Jadwal Perkuliahan - UPI Kampus Cibiru</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --font-main: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --bg-body: #0b1120;
  --bg-surface: #1e293b;
  --bg-card: #0f172a;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #334155;
  --primary: #3b82f6;
  --cell-font-size: 11px;
}
body.size-sm { --cell-font-size: 10px; }
body.size-md { --cell-font-size: 11px; }
body.size-lg { --cell-font-size: 13px; }
body { font-family: var(--font-main); background: var(--bg-body); color: var(--text-main); min-height: 100vh; display: flex; flex-direction: column; }
.tv-header { background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid #334155; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; position: sticky; top: 0; z-index: 100; }
.brand-section { display: flex; align-items: center; gap: 12px; }
.brand-badge { background: linear-gradient(135deg, #ef4444, #b91c1c); color: #fff; width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; }
.brand-title h1 { font-size: 17px; font-weight: 700; color: #fff; }
.brand-title p { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.header-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.btn-ctrl { background: #334155; color: #f1f5f9; border: 1px solid #475569; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.btn-ctrl:hover { background: #475569; }
.btn-primary { background: #2563eb; border-color: #3b82f6; color: #fff; }
.btn-primary:hover { background: #1d4ed8; }
.filter-bar { background: #0f172a; border-bottom: 1px solid var(--border-color); padding: 8px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.tabs-group, .day-filters { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.tab-btn { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
.tab-btn.active { background: #3b82f6; color: #fff; border-color: #60a5fa; }
.day-btn { background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }
.day-btn.active { background: #10b981; color: #fff; border-color: #34d399; }
.search-box input { background: #1e293b; border: 1px solid #334155; color: #f8fafc; padding: 6px 12px; border-radius: 6px; font-size: 12px; width: 200px; }
.legend-bar { background: #090e1a; border-bottom: 1px solid #1e293b; padding: 6px 20px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; font-size: 11px; }
.legend-item { display: inline-flex; align-items: center; gap: 5px; font-weight: 600; }
.legend-dot { width: 10px; height: 10px; border-radius: 3px; border: 1px solid currentColor; }
.matrix-container { flex: 1; overflow: auto; background: #020617; }
table.matrix-table { border-collapse: separate; border-spacing: 0; width: max-content; min-width: 100%; font-size: var(--cell-font-size); }
.matrix-table thead { position: sticky; top: 0; z-index: 40; }
.matrix-table th, .matrix-table td { border-right: 1px solid #1e293b; border-bottom: 1px solid #1e293b; padding: 4px 6px; vertical-align: middle; }
.matrix-table thead tr:nth-child(1) th { background: #1e293b; color: #e2e8f0; font-size: 11px; font-weight: 700; text-align: center; padding: 6px; }
.matrix-table thead tr:nth-child(2) th { background: #0f172a; color: #38bdf8; font-size: 11px; font-weight: 700; text-align: center; min-width: 120px; }
.matrix-table thead tr:nth-child(3) th { background: #090e1a; color: #94a3b8; font-size: 10px; font-weight: 700; text-align: center; }
.sticky-1 { position: sticky; left: 0; z-index: 20; background: #0f172a !important; width: 68px; min-width: 68px; text-align: center; font-weight: 800; }
.sticky-2 { position: sticky; left: 68px; z-index: 20; background: #0f172a !important; width: 102px; min-width: 102px; text-align: center; font-weight: 600; color: #cbd5e1; }
.sticky-3 { position: sticky; left: 170px; z-index: 20; background: #0f172a !important; width: 38px; min-width: 38px; text-align: center; font-weight: 700; color: #94a3b8; }
thead .sticky-1, thead .sticky-2, thead .sticky-3 { z-index: 60; background: #1e293b !important; color: #f8fafc !important; }
.row-break td { background: #1e293b; color: #fbbf24; text-align: center; font-weight: 700; padding: 6px; }
.day-divider td { border-top: 2px solid #475569; }
.course-card { border-radius: 6px; padding: 5px 7px; border-left: 4px solid #3b82f6; cursor: pointer; text-align: left; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
.course-card .lbl { font-weight: 800; font-size: 11px; }
.course-card .nm { font-weight: 600; font-size: 10px; opacity: 0.92; }
.course-card .lec { font-size: 9.5px; opacity: 0.8; }
.card-pgsd { background: #dcfce7; border-left-color: #16a34a; color: #14532d; }
.card-pgpaud { background: #fef3c7; border-left-color: #d97706; color: #78350f; }
.card-rpl { background: #dbeafe; border-left-color: #2563eb; color: #1e3a8a; }
.card-pmm { background: #f3e8ff; border-left-color: #9333ea; color: #581c87; }
.card-tekom { background: #ffe4e6; border-left-color: #e11d48; color: #881337; }
.card-umum { background: #e0e7ff; border-left-color: #4f46e5; color: #312e81; }
.tv-footer { background: #0f172a; border-top: 1px solid #334155; padding: 8px 20px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; flex-wrap: wrap; gap: 8px; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(2,6,23,0.75); display: none; align-items: center; justify-content: center; z-index: 200; padding: 16px; }
.modal-backdrop.open { display: flex; }
.modal-card { background: #0f172a; border: 1px solid #334155; border-radius: 12px; width: 100%; max-width: 540px; overflow: hidden; color: #f8fafc; }
.modal-head { padding: 14px 18px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
.modal-close { background: transparent; border: none; color: #94a3b8; font-size: 22px; cursor: pointer; }
.modal-body { padding: 16px 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; }
.detail-item { background: #1e293b; padding: 8px 10px; border-radius: 8px; }
.detail-item.full { grid-column: 1 / -1; }
.detail-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
.detail-val { font-size: 13px; color: #f8fafc; font-weight: 600; }
.form-row { margin-bottom: 12px; }
.form-row label { display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px; }
.form-row input { width: 100%; background: #1e293b; border: 1px solid #475569; color: #fff; padding: 7px 10px; border-radius: 6px; font-size: 13px; }
.preset-btns { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
</style>
</head>
<body class="size-md">
<header class="tv-header">
  <div class="brand-section">
    <div class="brand-badge">UPI</div>
    <div class="brand-title">
      <h1>MIND MAPPING JADWAL PERKULIAHAN</h1>
      <p id="headerSubtitle">UPI KAMPUS CIBIRU &bull; 37 Ruangan (2023/2024)</p>
    </div>
  </div>
  <div class="header-controls">
    <button class="btn-ctrl" onclick="openTimeModal()">&#9201;&#65039; Setting Waktu</button>
    <button class="btn-ctrl" onclick="downloadCsv()">&#128202; Unduh CSV (Excel)</button>
    <button class="btn-ctrl" onclick="downloadImage('png')">&#128444;&#65039; Unduh PNG (HD)</button>
    <button class="btn-ctrl" onclick="downloadImage('jpeg')">&#128248; Unduh JPG (HD)</button>
    <button class="btn-ctrl btn-primary" onclick="toggleFullscreen()">&#9974; Fullscreen TV</button>
  </div>
</header>

<div class="filter-bar">
  <div class="tabs-group" id="buildingTabs"></div>
  <div class="day-filters" id="dayFilters">
    <button class="day-btn active" onclick="setDayFilter('all', this)">Senin–Sabtu</button>
    <button class="day-btn" onclick="setDayFilter('Senin', this)">Senin</button>
    <button class="day-btn" onclick="setDayFilter('Selasa', this)">Selasa</button>
    <button class="day-btn" onclick="setDayFilter('Rabu', this)">Rabu</button>
    <button class="day-btn" onclick="setDayFilter('Kamis', this)">Kamis</button>
    <button class="day-btn" onclick="setDayFilter('Jumat', this)">Jumat</button>
    <button class="day-btn" onclick="setDayFilter('Sabtu', this)">Sabtu</button>
  </div>
  <div class="search-box">
    <input type="text" id="searchInput" placeholder="Cari MK, kelas, dosen, ruang..." oninput="renderMatrix()">
  </div>
</div>

<div class="legend-bar">
  <strong style="color:#64748b">PRODI:</strong>
  <span class="legend-item" style="color:#22c55e"><span class="legend-dot" style="background:#dcfce7"></span>PGSD</span>
  <span class="legend-item" style="color:#f59e0b"><span class="legend-dot" style="background:#fef3c7"></span>PGPAUD</span>
  <span class="legend-item" style="color:#3b82f6"><span class="legend-dot" style="background:#dbeafe"></span>RPL</span>
  <span class="legend-item" style="color:#a855f7"><span class="legend-dot" style="background:#f3e8ff"></span>P. Multimedia</span>
  <span class="legend-item" style="color:#f43f5e"><span class="legend-dot" style="background:#ffe4e6"></span>Teknik Komputer</span>
  <span class="legend-item" style="color:#6366f1"><span class="legend-dot" style="background:#e0e7ff"></span>MKDU / Umum</span>
</div>

<main class="matrix-container">
  <table class="matrix-table">
    <thead id="matrixThead"></thead>
    <tbody id="matrixTbody"></tbody>
  </table>
</main>

<footer class="tv-footer">
  <div id="footerMeta">UPI KAMPUS CIBIRU &bull; Mode Offline Standalone</div>
  <div>37 Ruangan (Gedung B, Gedung E, Smart Class &amp; Laboratorium)</div>
</footer>

<!-- Course Detail Modal -->
<div class="modal-backdrop" id="detailModal" onclick="if(event.target===this)this.classList.remove('open')">
  <div class="modal-card">
    <div class="modal-head">
      <h3 id="mTitle">Detail Perkuliahan</h3>
      <button class="modal-close" onclick="document.getElementById('detailModal').classList.remove('open')">&times;</button>
    </div>
    <div class="modal-body">
      <div class="detail-item full"><div class="detail-label">Mata Kuliah</div><div class="detail-val" id="mCourse">-</div></div>
      <div class="detail-item"><div class="detail-label">Kode &amp; Kelas</div><div class="detail-val" id="mCodeClass">-</div></div>
      <div class="detail-item"><div class="detail-label">Program Studi</div><div class="detail-val" id="mProdi">-</div></div>
      <div class="detail-item"><div class="detail-label">Semester / SKS</div><div class="detail-val" id="mSks">-</div></div>
      <div class="detail-item"><div class="detail-label">Ruangan</div><div class="detail-val" id="mRoom">-</div></div>
      <div class="detail-item full"><div class="detail-label">Hari &amp; Jam</div><div class="detail-val" id="mTime">-</div></div>
      <div class="detail-item full"><div class="detail-label">Dosen Pengampu 1</div><div class="detail-val" id="mL1">-</div></div>
      <div class="detail-item full" id="mL2Wrap" style="display:none"><div class="detail-label">Dosen Pengampu 2</div><div class="detail-val" id="mL2">-</div></div>
    </div>
  </div>
</div>

<!-- Time Settings Modal -->
<div class="modal-backdrop" id="timeModal" onclick="if(event.target===this)this.classList.remove('open')">
  <div class="modal-card">
    <div class="modal-head">
      <h3>&#9201;&#65039; Setting Waktu Perkuliahan</h3>
      <button class="modal-close" onclick="document.getElementById('timeModal').classList.remove('open')">&times;</button>
    </div>
    <div style="padding:18px">
      <div class="form-row">
        <label>Durasi per 1 SKS (Menit, 15–120)</label>
        <input type="number" id="tsSks" min="15" max="120" value="50">
        <div class="preset-btns">
          <button class="btn-ctrl" onclick="document.getElementById('tsSks').value=50">50m</button>
          <button class="btn-ctrl" onclick="document.getElementById('tsSks').value=45">45m</button>
          <button class="btn-ctrl" onclick="document.getElementById('tsSks').value=40">40m</button>
          <button class="btn-ctrl" onclick="document.getElementById('tsSks').value=60">60m</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-row">
          <label>Senin–Kamis (&amp; Sabtu): Jam Mulai Pagi</label>
          <input type="time" id="tsRegStart" value="07:00">
        </div>
        <div class="form-row">
          <label>Senin–Kamis: Durasi Istirahat (Menit)</label>
          <input type="number" id="tsRegBreak" min="0" max="180" value="60">
        </div>
        <div class="form-row">
          <label>Khusus Jumat: Jam Mulai Pagi</label>
          <input type="time" id="tsFriStart" value="07:00">
        </div>
        <div class="form-row">
          <label>Khusus Jumat: Mulai Siang (Usai Sholat Jumat)</label>
          <input type="time" id="tsFriAft" value="13:00">
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px">
        <button class="btn-ctrl" onclick="document.getElementById('timeModal').classList.remove('open')">Batal</button>
        <button class="btn-ctrl btn-primary" onclick="applyTimeSettings()">Terapkan &amp; Hitung Ulang</button>
      </div>
    </div>
  </div>
</div>

<script>
let SCHEDULE_DATA = ${safeJson};
let activeBuilding = 'all';
let activeDay = 'all';

function timeToMin(hhmm) {
  const parts = String(hhmm || '07:00').replace('.', ':').split(':');
  return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
}
function minToColon(m) {
  return String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}
function minToDot(m) { return minToColon(m).replace(':', '.'); }

function buildSlots(ts) {
  const sks = Math.min(120, Math.max(15, parseInt(ts.sksMinutes, 10) || 50));
  const regStart = timeToMin(ts.regStart || '07:00');
  const regBreak = Math.max(0, parseInt(ts.regBreakMinutes, 10) || 0);
  const friStart = timeToMin(ts.friStart || '07:00');
  const friAft = timeToMin(ts.friAfternoonStart || '13:00');
  function reg(aftCount) {
    const arr = []; let cur = regStart;
    for (let p = 1; p <= 6; p++) { arr.push({ slot: p, pos: p, time: minToDot(cur) + ' - ' + minToDot(cur + sks), start: minToColon(cur), end: minToColon(cur + sks), is_break: false }); cur += sks; }
    if (regBreak > 0) { arr.push({ slot: 'break', pos: null, time: minToDot(cur) + ' - ' + minToDot(cur + regBreak), start: minToColon(cur), end: minToColon(cur + regBreak), is_break: true, label: 'ISTIRAHAT / BREAK' }); cur += regBreak; }
    for (let i = 1; i <= aftCount; i++) { const p = 6 + i; arr.push({ slot: p, pos: p, time: minToDot(cur) + ' - ' + minToDot(cur + sks), start: minToColon(cur), end: minToColon(cur + sks), is_break: false }); cur += sks; }
    return arr;
  }
  function fri() {
    const arr = []; let cur = friStart;
    for (let p = 1; p <= 5; p++) { arr.push({ slot: p, pos: p, time: minToDot(cur) + ' - ' + minToDot(cur + sks), start: minToColon(cur), end: minToColon(cur + sks), is_break: false }); cur += sks; }
    const aft = Math.max(cur, friAft);
    if (aft > cur) { arr.push({ slot: 'break-jumat', pos: null, time: minToDot(cur) + ' - ' + minToDot(aft), start: minToColon(cur), end: minToColon(aft), is_break: true, label: "ISTIRAHAT / SHOLAT JUM'AT" }); }
    cur = aft;
    for (let i = 0; i < 8; i++) { const p = 6 + i; arr.push({ slot: p, pos: p, time: minToDot(cur) + ' - ' + minToDot(cur + sks), start: minToColon(cur), end: minToColon(cur + sks), is_break: false }); cur += sks; }
    return arr;
  }
  return { Senin: reg(8), Selasa: reg(8), Rabu: reg(6), Kamis: reg(6), Jumat: fri(), Sabtu: reg(8) };
}

function openTimeModal() {
  const ts = SCHEDULE_DATA.time_settings || { sksMinutes: 50, regStart: '07:00', regBreakMinutes: 60, friStart: '07:00', friAfternoonStart: '13:00' };
  document.getElementById('tsSks').value = ts.sksMinutes;
  document.getElementById('tsRegStart').value = ts.regStart;
  document.getElementById('tsRegBreak').value = ts.regBreakMinutes;
  document.getElementById('tsFriStart').value = ts.friStart;
  document.getElementById('tsFriAft').value = ts.friAfternoonStart;
  document.getElementById('timeModal').classList.add('open');
}

function applyTimeSettings() {
  const ts = {
    sksMinutes: Math.min(120, Math.max(15, parseInt(document.getElementById('tsSks').value, 10) || 50)),
    regStart: document.getElementById('tsRegStart').value || '07:00',
    regBreakMinutes: Math.max(0, parseInt(document.getElementById('tsRegBreak').value, 10) || 0),
    friStart: document.getElementById('tsFriStart').value || '07:00',
    friAfternoonStart: document.getElementById('tsFriAft').value || '13:00'
  };
  SCHEDULE_DATA.time_settings = ts;
  SCHEDULE_DATA.days_slots = buildSlots(ts);
  const cells = {};
  (SCHEDULE_DATA.courses || []).forEach(c => {
    const slots = SCHEDULE_DATA.days_slots[c.day] || [];
    const s1 = slots.find(s => !s.is_break && s.pos === c.start_pos);
    const s2 = slots.find(s => !s.is_break && s.pos === c.end_pos);
    if (s1 && s2) {
      c.start_time = s1.start.replace(':', '.');
      c.end_time = s2.end.replace(':', '.');
      c.time_display = c.start_time + ' - ' + c.end_time;
    }
    for (let p = c.start_pos; p <= c.end_pos; p++) {
      const sd = slots.find(s => !s.is_break && s.pos === p);
      if (sd) cells[c.day + '|' + sd.time + '|' + c.room] = c.id;
    }
  });
  SCHEDULE_DATA.matrix_cells = cells;
  document.getElementById('timeModal').classList.remove('open');
  renderMatrix();
}

function getProdiStyle(prodi) {
  const p = (prodi || '').toLowerCase();
  if (p.includes('pgsd')) return { cls: 'card-pgsd', bg: '#dcfce7', border: '#16a34a', text: '#14532d' };
  if (p.includes('pgpaud') || p.includes('paud')) return { cls: 'card-pgpaud', bg: '#fef3c7', border: '#d97706', text: '#78350f' };
  if (p.includes('rpl')) return { cls: 'card-rpl', bg: '#dbeafe', border: '#2563eb', text: '#1e3a8a' };
  if (p.includes('multi') || p.includes('pmm')) return { cls: 'card-pmm', bg: '#f3e8ff', border: '#9333ea', text: '#581c87' };
  if (p.includes('tekom') || p.includes('tekkom') || p.includes('komputer')) return { cls: 'card-tekom', bg: '#ffe4e6', border: '#e11d48', text: '#881337' };
  return { cls: 'card-umum', bg: '#e0e7ff', border: '#4f46e5', text: '#312e81' };
}

function getActiveRoomDefs() {
  const b = (SCHEDULE_DATA.buildings || []).find(x => x.id === activeBuilding) || SCHEDULE_DATA.buildings[0];
  const codes = b ? b.rooms : SCHEDULE_DATA.rooms;
  return codes.map(code => (SCHEDULE_DATA.room_defs || []).find(r => r.code === code)).filter(Boolean);
}

function renderBuildingTabs() {
  const wrap = document.getElementById('buildingTabs');
  wrap.innerHTML = '';
  (SCHEDULE_DATA.buildings || []).forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (activeBuilding === b.id ? ' active' : '');
    btn.textContent = b.name + ' (' + b.rooms.length + ')';
    btn.onclick = () => { activeBuilding = b.id; renderBuildingTabs(); renderMatrix(); };
    wrap.appendChild(btn);
  });
}

function setDayFilter(day, el) {
  activeDay = day;
  document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderMatrix();
}

function renderMatrix() {
  const rooms = getActiveRoomDefs();
  const days = activeDay === 'all' ? (SCHEDULE_DATA.metadata.days || ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']) : [activeDay];
  const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();

  document.getElementById('headerSubtitle').textContent = SCHEDULE_DATA.metadata.campus + ' • ' + SCHEDULE_DATA.metadata.period + ' ' + SCHEDULE_DATA.metadata.academic_year + ' • 1 SKS = ' + (SCHEDULE_DATA.time_settings ? SCHEDULE_DATA.time_settings.sksMinutes : 50) + ' Menit';
  document.getElementById('footerMeta').textContent = 'Periode: ' + SCHEDULE_DATA.metadata.period + ' ' + SCHEDULE_DATA.metadata.academic_year + ' • Total MK: ' + (SCHEDULE_DATA.courses || []).length + ' • Mode Offline Standalone';

  // 3-row header
  let thead = '<tr><th class="sticky-1" rowspan="3">HARI</th><th class="sticky-2" rowspan="3">JAM</th><th class="sticky-3" rowspan="3">Pos</th>';
  rooms.forEach(r => { thead += '<th>' + r.label + '</th>'; });
  thead += '</tr><tr>';
  rooms.forEach(r => { thead += '<th>' + r.code + '</th>'; });
  thead += '</tr><tr>';
  rooms.forEach(r => { thead += '<th>' + r.no + '</th>'; });
  thead += '</tr>';
  document.getElementById('matrixThead').innerHTML = thead;

  let tbody = '';
  days.forEach((day, dIdx) => {
    const slots = SCHEDULE_DATA.days_slots[day] || [];
    const spanned = {};
    slots.forEach((slot, sIdx) => {
      const trCls = (sIdx === 0 && dIdx > 0 ? 'day-divider ' : '') + (slot.is_break ? 'row-break' : '');
      tbody += '<tr class="' + trCls + '">';
      if (sIdx === 0) tbody += '<td class="sticky-1" rowspan="' + slots.length + '">' + day.toUpperCase() + '</td>';
      tbody += '<td class="sticky-2">' + slot.time + '</td>';
      tbody += '<td class="sticky-3">' + (slot.is_break ? '' : (slot.pos || '')) + '</td>';
      if (slot.is_break) {
        tbody += '<td colspan="' + rooms.length + '">' + (slot.label || 'ISTIRAHAT') + '</td>';
      } else {
        rooms.forEach(r => {
          if (spanned[r.code] > 0) { spanned[r.code]--; return; }
          const cid = (SCHEDULE_DATA.matrix_cells || {})[day + '|' + slot.time + '|' + r.code];
          if (!cid) { tbody += '<td></td>'; return; }
          const c = (SCHEDULE_DATA.courses || []).find(x => x.id === cid);
          if (!c) { tbody += '<td></td>'; return; }
          const span = Math.max(1, (c.end_pos - c.start_pos + 1) || 1);
          if (span > 1) spanned[r.code] = span - 1;
          const st = getProdiStyle(c.prodi);
          const match = !q || (c.course_code + ' ' + c.class_name + ' ' + c.course_name + ' ' + c.lecturer_1 + ' ' + c.prodi + ' ' + c.room).toLowerCase().includes(q);
          tbody += '<td rowspan="' + span + '"><div class="course-card ' + st.cls + '" style="opacity:' + (match ? 1 : 0.2) + '" onclick="openDetail(\\'' + c.id + '\\')"><div class="lbl">' + c.course_code + ' - ' + c.class_name + ' (' + c.sks + ' SKS)</div><div class="nm">' + c.course_name + '</div><div class="lec">' + c.lecturer_1 + '</div></div></td>';
        });
      }
      tbody += '</tr>';
    });
  });
  document.getElementById('matrixTbody').innerHTML = tbody;
}

function openDetail(id) {
  const c = (SCHEDULE_DATA.courses || []).find(x => x.id === id);
  if (!c) return;
  document.getElementById('mTitle').textContent = 'Detail: ' + c.display_label;
  document.getElementById('mCourse').textContent = c.course_name + ' (' + c.course_code + ')';
  document.getElementById('mCodeClass').textContent = c.course_code + ' - Kelas ' + c.class_name;
  document.getElementById('mProdi').textContent = c.prodi;
  document.getElementById('mSks').textContent = 'Semester ' + c.semester + ' • ' + c.sks + ' SKS';
  document.getElementById('mRoom').textContent = c.room + ' (' + c.building + ')';
  document.getElementById('mTime').textContent = c.day + ', ' + c.time_display + ' WIB';
  document.getElementById('mL1').textContent = c.lecturer_1 || '-';
  if (c.lecturer_2) { document.getElementById('mL2Wrap').style.display = 'block'; document.getElementById('mL2').textContent = c.lecturer_2; }
  else { document.getElementById('mL2Wrap').style.display = 'none'; }
  document.getElementById('detailModal').classList.add('open');
}

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
  else document.exitFullscreen().catch(() => {});
}

function escCsv(v) { return '"' + String(v ?? '').replace(/"/g, '""') + '"'; }
function downloadCsv() {
  const rooms = SCHEDULE_DATA.room_defs || [];
  const days = SCHEDULE_DATA.metadata.days || ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const lines = [];
  lines.push(['HARI','JAM','Pos', ...rooms.map(r => r.label)].map(escCsv).join(';'));
  lines.push(['','','', ...rooms.map(r => r.code)].map(escCsv).join(';'));
  lines.push(['','','', ...rooms.map(r => r.no)].map(escCsv).join(';'));
  days.forEach(day => {
    (SCHEDULE_DATA.days_slots[day] || []).forEach((slot, idx) => {
      if (slot.is_break) {
        lines.push([idx===0?day.toUpperCase():'', slot.time, '', slot.label || 'ISTIRAHAT', ...rooms.slice(1).map(()=>'')].map(escCsv).join(';'));
      } else {
        const vals = rooms.map(r => {
          const cid = (SCHEDULE_DATA.matrix_cells || {})[day + '|' + slot.time + '|' + r.code];
          const c = cid ? (SCHEDULE_DATA.courses || []).find(x => x.id === cid) : null;
          return c ? (c.course_code + ' - ' + c.class_name + ' | ' + c.course_name + ' (' + c.sks + ' SKS) | ' + c.lecturer_1) : '';
        });
        lines.push([idx===0?day.toUpperCase():'', slot.time, slot.pos || '', ...vals].map(escCsv).join(';'));
      }
    });
  });
  lines.push('');
  lines.push(['No','Prodi','Kode MK','Nama MK','SKS','Semester','Kelas','Hari','Jam','Ruang','Dosen 1','Dosen 2'].map(escCsv).join(';'));
  (SCHEDULE_DATA.courses || []).forEach((c, i) => {
    lines.push([i+1, c.prodi, c.course_code, c.course_name, c.sks, c.semester, c.class_name, c.day, c.time_display, c.room, c.lecturer_1, c.lecturer_2 || ''].map(escCsv).join(';'));
  });
  const blob = new Blob(['\\uFEFF' + lines.join('\\r\\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'MAP_JADWAL_UPI_CIBIRU_2023-2024.csv'; a.click();
}

function downloadImage(fmt) {
  const rooms = getActiveRoomDefs();
  const days = activeDay === 'all' ? (SCHEDULE_DATA.metadata.days || ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']) : [activeDay];
  const scale = 2, pad = 20, titleH = 60, h1 = 34, h2 = 24, h3 = 20, hTot = h1 + h2 + h3;
  const dW = 66, jW = 100, pW = 36, rW = 130, rH = 42, bH = 24;
  let bodyH = 0;
  days.forEach(d => (SCHEDULE_DATA.days_slots[d] || []).forEach(s => bodyH += s.is_break ? bH : rH));
  const tW = dW + jW + pW + rooms.length * rW;
  const W = tW + pad * 2, H = pad * 2 + titleH + hTot + bodyH + 16;
  const canvas = document.createElement('canvas'); canvas.width = W * scale; canvas.height = H * scale;
  const ctx = canvas.getContext('2d'); ctx.scale(scale, scale);
  ctx.fillStyle = '#0b1120'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 18px Segoe UI, Arial, sans-serif';
  ctx.fillText('MIND MAPPING JADWAL PERKULIAHAN — UPI KAMPUS CIBIRU (2023/2024)', pad, pad + 24);
  ctx.fillStyle = '#94a3b8'; ctx.font = '11px Segoe UI, Arial, sans-serif';
  ctx.fillText('Filter: ' + activeBuilding + ' • Hari: ' + activeDay + ' • 1 SKS = ' + (SCHEDULE_DATA.time_settings ? SCHEDULE_DATA.time_settings.sksMinutes : 50) + ' Menit', pad, pad + 44);
  function cell(x, y, w, h, bg, fg, txt, fnt) {
    ctx.fillStyle = bg; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#334155'; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = fg; ctx.font = fnt; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(txt || ''), x + w / 2, y + h / 2, w - 6);
  }
  const top = pad + titleH;
  cell(pad, top, dW, hTot, '#1e293b', '#f8fafc', 'HARI', 'bold 11px Segoe UI, Arial');
  cell(pad + dW, top, jW, hTot, '#1e293b', '#f8fafc', 'JAM', 'bold 11px Segoe UI, Arial');
  cell(pad + dW + jW, top, pW, hTot, '#1e293b', '#f8fafc', 'Pos', 'bold 11px Segoe UI, Arial');
  rooms.forEach((r, i) => {
    const x = pad + dW + jW + pW + i * rW;
    cell(x, top, rW, h1, r.isLab ? '#312e81' : '#1e293b', '#e2e8f0', r.label, 'bold 9.5px Segoe UI, Arial');
    cell(x, top + h1, rW, h2, '#0f172a', '#38bdf8', r.code, 'bold 11px Segoe UI, Arial');
    cell(x, top + h1 + h2, rW, h3, '#090e1a', '#94a3b8', r.no, 'bold 10px Segoe UI, Arial');
  });
  let y = top + hTot;
  days.forEach(d => {
    const slots = SCHEDULE_DATA.days_slots[d] || [];
    const dStart = y, posY = {};
    slots.forEach(s => {
      const ch = s.is_break ? bH : rH;
      if (!s.is_break && s.pos) posY[s.pos] = { y, h: ch };
      cell(pad + dW, y, jW, ch, s.is_break ? '#1e293b' : '#0f172a', s.is_break ? '#fbbf24' : '#cbd5e1', s.time, 'bold 9.5px Segoe UI, Arial');
      cell(pad + dW + jW, y, pW, ch, s.is_break ? '#1e293b' : '#0f172a', '#94a3b8', s.is_break ? '' : s.pos, 'bold 10px Segoe UI, Arial');
      if (s.is_break) cell(pad + dW + jW + pW, y, rooms.length * rW, ch, '#1e293b', '#fbbf24', s.label || 'ISTIRAHAT', 'bold 10px Segoe UI, Arial');
      else rooms.forEach((_, i) => { const rx = pad + dW + jW + pW + i * rW; ctx.fillStyle = '#020617'; ctx.fillRect(rx, y, rW, ch); ctx.strokeStyle = '#1e293b'; ctx.strokeRect(rx, y, rW, ch); });
      y += ch;
    });
    cell(pad, dStart, dW, y - dStart, '#0f172a', '#f8fafc', d.toUpperCase(), 'bold 11px Segoe UI, Arial');
    (SCHEDULE_DATA.courses || []).filter(c => c.day === d).forEach(c => {
      const idx = rooms.findIndex(r => r.code === c.room);
      if (idx < 0 || !posY[c.start_pos] || !posY[c.end_pos]) return;
      const rx = pad + dW + jW + pW + idx * rW + 2, ry = posY[c.start_pos].y + 2;
      const rw = rW - 4, rh = posY[c.end_pos].y + posY[c.end_pos].h - posY[c.start_pos].y - 4;
      const st = getProdiStyle(c.prodi);
      ctx.fillStyle = st.bg; ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = st.border; ctx.strokeRect(rx, ry, rw, rh);
      ctx.fillStyle = st.border; ctx.fillRect(rx, ry, 4, rh);
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = st.text;
      ctx.font = 'bold 9.5px Segoe UI, Arial'; ctx.fillText(c.course_code + ' - ' + c.class_name + ' (' + c.sks + ' SKS)', rx + 7, ry + 4, rw - 10);
      ctx.font = '600 9px Segoe UI, Arial'; ctx.fillText(c.course_name, rx + 7, ry + 17, rw - 10);
      ctx.font = '8.5px Segoe UI, Arial'; ctx.fillStyle = '#334155'; ctx.fillText(c.lecturer_1, rx + 7, ry + 29, rw - 10);
    });
  });
  const a = document.createElement('a');
  a.href = canvas.toDataURL(fmt === 'jpeg' ? 'image/jpeg' : 'image/png', 0.96);
  a.download = 'MIND_MAPPING_UPI_CIBIRU_2023-2024.' + (fmt === 'jpeg' ? 'jpg' : 'png');
  a.click();
}

renderBuildingTabs();
renderMatrix();
</script>
</body>
</html>`
}
