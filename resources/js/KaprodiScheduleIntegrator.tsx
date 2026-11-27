import { useState, useMemo, useEffect } from "react"
import { parseXlsxFile } from "./xlsxHelper"
import {
  CLASSROOM_CODES_1_22,
  DEFAULT_TIME_SETTINGS,
  LecturerConstraint,
  MappedCourse,
  MindMappingData,
  SlotDef,
  WORK_DAYS_5,
  createEmptyMindMappingData,
  exportMindMappingCsv,
  exportMindMappingImage,
  getCohortKey,
  getRoomDef,
  normalizeLoadedMindMappingData,
  rebuildMatrixCells,
  splitCombinedClasses,
  timeToMinutes,
} from "./mindMappingUtils"

export type CourseDemand = {
  id: string
  prodi: string
  courseCode: string
  courseName: string
  sks: number
  semester: string
  className: string
  lecturer1: string
  lecturer2?: string
  roomRequirement?: "Lab Komputer" | "Lab Khusus" | "Kelas Teori" | "Bebas" | string
  preferredDays?: string[]
  sourceFile?: string
}

export type LecturerAvailability = {
  name: string
  allowedDays: string[]
  startTime: string
  endTime: string
  totalSks: number
  courseCount: number
  courses: string[]
  isRestricted: boolean
}

type Props = {
  go?: (page: string) => void
  onSchedulesUpdated?: () => void
}

const DEFAULT_CONSTRAINT: LecturerConstraint = {
  allowedDays: [...WORK_DAYS_5],
  startTime: "07:00",
  endTime: "18:00",
}

function normalizeConstraint(val: any): LecturerConstraint {
  if (!val) return { ...DEFAULT_CONSTRAINT, allowedDays: [...WORK_DAYS_5] }
  if (Array.isArray(val)) {
    return {
      allowedDays: val.length > 0 ? val : [...WORK_DAYS_5],
      startTime: "07:00",
      endTime: "18:00",
    }
  }
  return {
    allowedDays: Array.isArray(val.allowedDays) && val.allowedDays.length > 0 ? val.allowedDays : [...WORK_DAYS_5],
    startTime: val.startTime || "07:00",
    endTime: val.endTime || "18:00",
  }
}

function isConstraintRestricted(c: LecturerConstraint): boolean {
  const daysRestricted = c.allowedDays.length < WORK_DAYS_5.length
  const timeRestricted = c.startTime !== "07:00" || c.endTime !== "18:00"
  return daysRestricted || timeRestricted
}

function expandDemandClasses(d: CourseDemand): CourseDemand[] {
  const classes = splitCombinedClasses(d.className, d.semester)
  if (classes.length <= 1) {
    return [{ ...d, className: classes[0] || d.className }]
  }
  return classes.map((cls, idx) => ({
    ...d,
    id: `${d.id}-C${idx + 1}`,
    className: cls,
  }))
}

const SAMPLE_KAPRODI_DATA: CourseDemand[] = [
  // --- PRODI RPL ---
  { id: "DEM-RPL-01", prodi: "RPL", courseCode: "RL101", courseName: "Algoritma dan Pemrograman", sks: 4, semester: "1", className: "1A", lecturer1: "Dr. Dosen A, M.Kom", lecturer2: "Dosen C, M.T", roomRequirement: "Lab Komputer", sourceFile: "Template_Kaprodi_RPL.csv" },
  { id: "DEM-RPL-02", prodi: "RPL", courseCode: "RL101", courseName: "Algoritma dan Pemrograman", sks: 4, semester: "1", className: "1B", lecturer1: "Dr. Dosen A, M.Kom", roomRequirement: "Lab Komputer", sourceFile: "Template_Kaprodi_RPL.csv" },
  { id: "DEM-RPL-03", prodi: "RPL", courseCode: "RL203", courseName: "Basis Data", sks: 3, semester: "3", className: "3A", lecturer1: "Prof. Dosen B, M.T", roomRequirement: "Lab Komputer", preferredDays: ["Senin", "Rabu"], sourceFile: "Template_Kaprodi_RPL.csv" },
  { id: "DEM-RPL-04", prodi: "RPL", courseCode: "RL203", courseName: "Basis Data", sks: 3, semester: "3", className: "3B", lecturer1: "Prof. Dosen B, M.T", roomRequirement: "Lab Komputer", preferredDays: ["Senin", "Rabu"], sourceFile: "Template_Kaprodi_RPL.csv" },
  { id: "DEM-RPL-05", prodi: "RPL", courseCode: "RL205", courseName: "Pemrograman Web Lanjut", sks: 3, semester: "3", className: "3A", lecturer1: "Dosen C, M.T", roomRequirement: "Lab Komputer", sourceFile: "Template_Kaprodi_RPL.csv" },
  { id: "DEM-RPL-06", prodi: "RPL", courseCode: "RL304", courseName: "Rekayasa Kebutuhan Lunak", sks: 3, semester: "5", className: "5A", lecturer1: "Dr. Dosen D, M.Cs", roomRequirement: "Kelas Teori", sourceFile: "Template_Kaprodi_RPL.csv" },
  { id: "DEM-RPL-07", prodi: "RPL", courseCode: "RL309", courseName: "Kecerdasan Buatan & ML", sks: 3, semester: "5", className: "5A", lecturer1: "Dr. Dosen D, M.Cs", lecturer2: "Dr. Dosen A, M.Kom", roomRequirement: "Lab Komputer", sourceFile: "Template_Kaprodi_RPL.csv" },
  { id: "DEM-RPL-08", prodi: "RPL", courseCode: "RL401", courseName: "Arsitektur Perangkat Lunak", sks: 3, semester: "7", className: "7A", lecturer1: "Prof. Dosen B, M.T", roomRequirement: "Kelas Teori", preferredDays: ["Senin", "Rabu"], sourceFile: "Template_Kaprodi_RPL.csv" },
  { id: "DEM-RPL-09", prodi: "RPL", courseCode: "KU100", courseName: "Pendidikan Agama", sks: 2, semester: "1", className: "1A", lecturer1: "Dosen MKDU 1, M.Ag", roomRequirement: "Kelas Teori", sourceFile: "Template_Kaprodi_RPL.csv" },

  // --- PRODI PGSD ---
  { id: "DEM-PGSD-01", prodi: "PGSD", courseCode: "GD103", courseName: "Pendidikan Bahasa Indonesia SD", sks: 3, semester: "1", className: "1A", lecturer1: "Dr. Dosen E, M.Pd", roomRequirement: "Kelas Teori", preferredDays: ["Selasa", "Kamis"], sourceFile: "Template_Kaprodi_PGSD.csv" },
  { id: "DEM-PGSD-02", prodi: "PGSD", courseCode: "GD103", courseName: "Pendidikan Bahasa Indonesia SD", sks: 3, semester: "1", className: "1B", lecturer1: "Dr. Dosen E, M.Pd", roomRequirement: "Kelas Teori", preferredDays: ["Selasa", "Kamis"], sourceFile: "Template_Kaprodi_PGSD.csv" },
  { id: "DEM-PGSD-03", prodi: "PGSD", courseCode: "GD201", courseName: "Matematika Dasar SD", sks: 3, semester: "3", className: "3A", lecturer1: "Dosen F, M.Pd", roomRequirement: "Kelas Teori", sourceFile: "Template_Kaprodi_PGSD.csv" },
  { id: "DEM-PGSD-04", prodi: "PGSD", courseCode: "GD201", courseName: "Matematika Dasar SD", sks: 3, semester: "3", className: "3B", lecturer1: "Dosen F, M.Pd", roomRequirement: "Kelas Teori", sourceFile: "Template_Kaprodi_PGSD.csv" },
  { id: "DEM-PGSD-05", prodi: "PGSD", courseCode: "GD208", courseName: "Media Pembelajaran Digital", sks: 3, semester: "3", className: "3A", lecturer1: "Dr. Dosen E, M.Pd", lecturer2: "Dosen F, M.Pd", roomRequirement: "Lab Komputer", preferredDays: ["Selasa", "Kamis"], sourceFile: "Template_Kaprodi_PGSD.csv" },
  { id: "DEM-PGSD-06", prodi: "PGSD", courseCode: "GD302", courseName: "Praktikum Pembelajaran IPA SD", sks: 3, semester: "5", className: "5A", lecturer1: "Dr. Dosen G, M.Pd", roomRequirement: "Lab Khusus", sourceFile: "Template_Kaprodi_PGSD.csv" },
  { id: "DEM-PGSD-07", prodi: "PGSD", courseCode: "GD308", courseName: "Pembelajaran IPS SD", sks: 3, semester: "5", className: "5B", lecturer1: "Dosen H, M.Pd", roomRequirement: "Kelas Teori", sourceFile: "Template_Kaprodi_PGSD.csv" },
  { id: "DEM-PGSD-08", prodi: "PGSD", courseCode: "GD404", courseName: "Microteaching Terpadu SD", sks: 2, semester: "7", className: "7A", lecturer1: "Dr. Dosen G, M.Pd", lecturer2: "Dosen H, M.Pd", roomRequirement: "Lab Khusus", sourceFile: "Template_Kaprodi_PGSD.csv" },

  // --- PRODI PGPAUD ---
  { id: "DEM-PAUD-01", prodi: "PGPAUD", courseCode: "UD106", courseName: "Perkembangan Anak Usia Dini", sks: 3, semester: "1", className: "1A", lecturer1: "Dosen I, M.Pd", roomRequirement: "Kelas Teori", sourceFile: "Template_Kaprodi_PGPAUD.csv" },
  { id: "DEM-PAUD-02", prodi: "PGPAUD", courseCode: "UD206", courseName: "Bermain dan Permainan Edukatif", sks: 3, semester: "3", className: "3A", lecturer1: "Dr. Dosen J, M.Pd", roomRequirement: "Lab Khusus", preferredDays: ["Rabu", "Jumat"], sourceFile: "Template_Kaprodi_PGPAUD.csv" },
  { id: "DEM-PAUD-03", prodi: "PGPAUD", courseCode: "UD206", courseName: "Bermain dan Permainan Edukatif", sks: 3, semester: "3", className: "3B", lecturer1: "Dr. Dosen J, M.Pd", roomRequirement: "Lab Khusus", preferredDays: ["Rabu", "Jumat"], sourceFile: "Template_Kaprodi_PGPAUD.csv" },
  { id: "DEM-PAUD-04", prodi: "PGPAUD", courseCode: "UD305", courseName: "Seni Musik dan Gerak AUD", sks: 2, semester: "3", className: "3A", lecturer1: "Dosen K, M.Sn", roomRequirement: "Lab Khusus", sourceFile: "Template_Kaprodi_PGPAUD.csv" },
  { id: "DEM-PAUD-05", prodi: "PGPAUD", courseCode: "UD409", courseName: "Pengembangan Kognitif & Sains AUD", sks: 3, semester: "5", className: "5A", lecturer1: "Dr. Dosen J, M.Pd", lecturer2: "Dosen I, M.Pd", roomRequirement: "Kelas Teori", preferredDays: ["Rabu", "Jumat"], sourceFile: "Template_Kaprodi_PGPAUD.csv" },
  { id: "DEM-PAUD-06", prodi: "PGPAUD", courseCode: "UD500", courseName: "Manajemen PAUD Unggul", sks: 2, semester: "7", className: "7A", lecturer1: "Dosen K, M.Sn", roomRequirement: "Kelas Teori", sourceFile: "Template_Kaprodi_PGPAUD.csv" },

  // --- PRODI PMM ---
  { id: "DEM-PMM-01", prodi: "PMM", courseCode: "PM102", courseName: "Desain Grafis Komputer", sks: 3, semester: "1", className: "1A", lecturer1: "Dosen L, M.Ds", roomRequirement: "Lab Komputer", sourceFile: "Template_Kaprodi_PMM.csv" },
  { id: "DEM-PMM-02", prodi: "PMM", courseCode: "PM204", courseName: "Animasi 2D & 3D Interaktif", sks: 4, semester: "3", className: "3A", lecturer1: "Dr. Dosen M, M.Ds", roomRequirement: "Lab Komputer", preferredDays: ["Senin", "Kamis"], sourceFile: "Template_Kaprodi_PMM.csv" },
  { id: "DEM-PMM-03", prodi: "PMM", courseCode: "PM204", courseName: "Animasi 2D & 3D Interaktif", sks: 4, semester: "3", className: "3B", lecturer1: "Dr. Dosen M, M.Ds", roomRequirement: "Lab Komputer", preferredDays: ["Senin", "Kamis"], sourceFile: "Template_Kaprodi_PMM.csv" },
  { id: "DEM-PMM-04", prodi: "PMM", courseCode: "PM306", courseName: "Videografi & Sinematografi", sks: 3, semester: "3", className: "3A", lecturer1: "Dosen L, M.Ds", lecturer2: "Dr. Dosen M, M.Ds", roomRequirement: "Lab Khusus", preferredDays: ["Senin", "Kamis"], sourceFile: "Template_Kaprodi_PMM.csv" },
  { id: "DEM-PMM-05", prodi: "PMM", courseCode: "PM405", courseName: "Fotografi Digital Kreatif", sks: 3, semester: "5", className: "5A", lecturer1: "Dosen N, M.Sn", roomRequirement: "Lab Khusus", sourceFile: "Template_Kaprodi_PMM.csv" },
  { id: "DEM-PMM-06", prodi: "PMM", courseCode: "PM500", courseName: "Produksi Multimedia Pembelajaran", sks: 3, semester: "7", className: "7A", lecturer1: "Dosen N, M.Sn", roomRequirement: "Lab Komputer", sourceFile: "Template_Kaprodi_PMM.csv" },

  // --- PRODI TEKKOM ---
  { id: "DEM-TEK-01", prodi: "TEKKOM", courseCode: "CM100", courseName: "Jaringan Komputer Dasar", sks: 3, semester: "1", className: "1A", lecturer1: "Dosen O, M.T", roomRequirement: "Lab Komputer", sourceFile: "Template_Kaprodi_TEKKOM.csv" },
  { id: "DEM-TEK-02", prodi: "TEKKOM", courseCode: "CM102", courseName: "Sistem Digital & Logika", sks: 3, semester: "1", className: "1B", lecturer1: "Dosen P, M.T", roomRequirement: "Lab Khusus", sourceFile: "Template_Kaprodi_TEKKOM.csv" },
  { id: "DEM-TEK-03", prodi: "TEKKOM", courseCode: "CM204", courseName: "Sistem Tertanam & Robotika", sks: 4, semester: "3", className: "3A", lecturer1: "Dr. Dosen Q, M.Eng", roomRequirement: "Lab Khusus", preferredDays: ["Selasa", "Jumat"], sourceFile: "Template_Kaprodi_TEKKOM.csv" },
  { id: "DEM-TEK-04", prodi: "TEKKOM", courseCode: "CM204", courseName: "Sistem Tertanam & Robotika", sks: 4, semester: "3", className: "3B", lecturer1: "Dr. Dosen Q, M.Eng", roomRequirement: "Lab Khusus", preferredDays: ["Selasa", "Jumat"], sourceFile: "Template_Kaprodi_TEKKOM.csv" },
  { id: "DEM-TEK-05", prodi: "TEKKOM", courseCode: "CM307", courseName: "Keamanan Jaringan & Cyber Security", sks: 3, semester: "5", className: "5A", lecturer1: "Dosen O, M.T", lecturer2: "Dr. Dosen Q, M.Eng", roomRequirement: "Lab Komputer", preferredDays: ["Selasa", "Jumat"], sourceFile: "Template_Kaprodi_TEKKOM.csv" },
  { id: "DEM-TEK-06", prodi: "TEKKOM", courseCode: "CM400", courseName: "Cloud Computing & DevOps", sks: 3, semester: "7", className: "7A", lecturer1: "Dosen P, M.T", roomRequirement: "Lab Komputer", sourceFile: "Template_Kaprodi_TEKKOM.csv" },
]

export function KaprodiScheduleIntegrator({ go, onSchedulesUpdated }: Props) {
  const [demands, setDemands] = useState<CourseDemand[]>(() => {
    try {
      const stored = localStorage.getItem("rpl-kaprodi-demands")
      if (stored) {
        const parsed: CourseDemand[] = JSON.parse(stored)
        return parsed.flatMap(expandDemandClasses)
      }
      return SAMPLE_KAPRODI_DATA
    } catch {
      return SAMPLE_KAPRODI_DATA
    }
  })

  // Lecturer Day & Time Availability Constraints
  const [lecturerConstraints, setLecturerConstraints] = useState<Record<string, LecturerConstraint>>(() => {
    try {
      const stored = localStorage.getItem("rpl-lecturer-constraints")
      if (stored) {
        const parsed = JSON.parse(stored)
        const normalized: Record<string, LecturerConstraint> = {}
        Object.keys(parsed).forEach((k) => {
          normalized[k] = normalizeConstraint(parsed[k])
        })
        return normalized
      }
    } catch {}
    const initial: Record<string, LecturerConstraint> = {}
    SAMPLE_KAPRODI_DATA.forEach((d) => {
      if (d.preferredDays && d.preferredDays.length > 0) {
        if (!initial[d.lecturer1]) {
          initial[d.lecturer1] = { allowedDays: d.preferredDays, startTime: "07:00", endTime: "18:00" }
        }
        if (d.lecturer2 && !initial[d.lecturer2]) {
          initial[d.lecturer2] = { allowedDays: d.preferredDays, startTime: "07:00", endTime: "18:00" }
        }
      }
    })
    return initial
  })

  const [activeTab, setActiveTab] = useState<"template" | "dosen" | "matrix">("template")
  const [selectedProdiFilter, setSelectedProdiFilter] = useState("Semua")
  const [searchQuery, setSearchQuery] = useState("")
  const [lecturerSearch, setLecturerSearch] = useState("")
  const [lecturerFilter, setLecturerFilter] = useState<"all" | "restricted" | "flexible">("all")
  const [editingLecturer, setEditingLecturer] = useState<LecturerAvailability | null>(null)
  const [modalDraft, setModalDraft] = useState<LecturerConstraint>(DEFAULT_CONSTRAINT)

  const [uploadedFilesList, setUploadedFilesList] = useState<string[]>([
    "Template_Kaprodi_RPL.csv (9 MK)",
    "Template_Kaprodi_PGSD.csv (8 MK)",
    "Template_Kaprodi_PGPAUD.csv (6 MK)",
    "Template_Kaprodi_PMM.csv (6 MK)",
    "Template_Kaprodi_TEKKOM.csv (6 MK)",
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [auditReport, setAuditReport] = useState<{
    success: boolean
    totalMapped: number
    totalParked: number
    totalSks: number
    lecturerConflicts: number
    classConflicts: number
    roomConflicts: number
    timestamp: string
    details: string[]
  } | null>(null)

  const [showAddCourseModal, setShowAddCourseModal] = useState(false)
  const [newCourseDraft, setNewCourseDraft] = useState<Partial<CourseDemand>>({
    prodi: "RPL",
    courseCode: "",
    courseName: "",
    sks: 3,
    semester: "3",
    className: "3A",
    lecturer1: "",
    lecturer2: "",
    roomRequirement: "Kelas Teori",
    preferredDays: [],
  })

  useEffect(() => {
    localStorage.setItem("rpl-kaprodi-demands", JSON.stringify(demands))
  }, [demands])

  useEffect(() => {
    localStorage.setItem("rpl-lecturer-constraints", JSON.stringify(lecturerConstraints))
  }, [lecturerConstraints])

  // Load latest MindMappingData for Tab 3 exports
  const getLatestMindMappingData = (): MindMappingData => {
    try {
      const stored = localStorage.getItem("rpl-mind-mapping-data")
      if (stored) return normalizeLoadedMindMappingData(JSON.parse(stored))
    } catch {}
    return createEmptyMindMappingData()
  }

  // Extract all unique lecturers with teaching load & day/time constraints
  const lecturerList = useMemo(() => {
    const map: Record<string, { totalSks: number; courseCount: number; courses: string[] }> = {}
    demands.forEach((d) => {
      if (!map[d.lecturer1]) {
        map[d.lecturer1] = { totalSks: 0, courseCount: 0, courses: [] }
      }
      map[d.lecturer1].totalSks += d.sks
      map[d.lecturer1].courseCount += 1
      map[d.lecturer1].courses.push(`${d.prodi} • ${d.courseCode} ${d.courseName} (Sem.${d.semester} / ${d.className}, ${d.sks} SKS)`)

      if (d.lecturer2 && d.lecturer2.trim()) {
        if (!map[d.lecturer2]) {
          map[d.lecturer2] = { totalSks: 0, courseCount: 0, courses: [] }
        }
        map[d.lecturer2].totalSks += d.sks
        map[d.lecturer2].courseCount += 1
        map[d.lecturer2].courses.push(`${d.prodi} • ${d.courseCode} ${d.courseName} (Sem.${d.semester} / ${d.className}, ${d.sks} SKS) [Team]`)
      }
    })

    const list: LecturerAvailability[] = Object.keys(map).map((name) => {
      const constraint = normalizeConstraint(lecturerConstraints[name])
      return {
        name,
        allowedDays: constraint.allowedDays,
        startTime: constraint.startTime,
        endTime: constraint.endTime,
        totalSks: map[name].totalSks,
        courseCount: map[name].courseCount,
        courses: map[name].courses,
        isRestricted: isConstraintRestricted(constraint),
      }
    })

    return list.sort((a, b) => {
      if (a.isRestricted && !b.isRestricted) return -1
      if (!a.isRestricted && b.isRestricted) return 1
      return b.totalSks - a.totalSks
    })
  }, [demands, lecturerConstraints])

  const filteredLecturers = useMemo(() => {
    const q = lecturerSearch.trim().toLowerCase()
    return lecturerList.filter((l) => {
      if (lecturerFilter === "restricted" && !l.isRestricted) return false
      if (lecturerFilter === "flexible" && l.isRestricted) return false
      if (!q) return true
      return l.name.toLowerCase().includes(q) || l.courses.some((c) => c.toLowerCase().includes(q))
    })
  }, [lecturerList, lecturerSearch, lecturerFilter])

  const openLecturerModal = (lecturer: LecturerAvailability) => {
    setEditingLecturer(lecturer)
    setModalDraft({
      allowedDays: [...lecturer.allowedDays],
      startTime: lecturer.startTime,
      endTime: lecturer.endTime,
    })
  }

  const toggleDraftDay = (day: string) => {
    setModalDraft((prev) => {
      const exists = prev.allowedDays.includes(day)
      let nextDays = exists ? prev.allowedDays.filter((d) => d !== day) : [...prev.allowedDays, day]
      if (nextDays.length === 0) nextDays = [day]
      // Keep canonical weekday order
      nextDays = WORK_DAYS_5.filter((d) => nextDays.includes(d))
      return { ...prev, allowedDays: nextDays }
    })
  }

  const saveLecturerModal = () => {
    if (!editingLecturer) return
    setLecturerConstraints((prev) => ({
      ...prev,
      [editingLecturer.name]: {
        allowedDays: modalDraft.allowedDays.length > 0 ? modalDraft.allowedDays : [...WORK_DAYS_5],
        startTime: modalDraft.startTime || "07:00",
        endTime: modalDraft.endTime || "18:00",
      },
    }))
    setEditingLecturer(null)
  }

  const resetLecturerToFlexible = () => {
    setModalDraft({
      allowedDays: [...WORK_DAYS_5],
      startTime: "07:00",
      endTime: "18:00",
    })
  }

  // Download Standard XLSX Template for Kaprodi (Template Kaprodi terbaru - .xlsx)
  const downloadKaprodiTemplate = () => {
    const link = document.createElement("a")
    link.href = `/admin/schedule/download-template?v=${Date.now()}`
    link.download = "TEMPLATE_JADWAL_KAPRODI_2023-2024.xlsx"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Helper to convert parsed table rows (from .xlsx or .csv) into CourseDemand[]
  const processUploadedRows = (rows: string[][], fileName: string) => {
    const parsedDemands: CourseDemand[] = []
    let headerPassed = false

    rows.forEach((rawParts, idx) => {
      const parts = rawParts.map((p) => String(p ?? "").replace(/^"|"$/g, "").trim())
      if (parts.every((p) => p === "") || (parts[0] && parts[0].startsWith("#"))) return

      if (
        !headerPassed &&
        (parts[0].toLowerCase().includes("prodi") || parts[0].toLowerCase().includes("program"))
      ) {
        headerPassed = true
        return
      }

      if (parts.length >= 6 && (parts[1] || parts[2])) {
        const prodi = parts[0] || "Umum"
        const courseCode = parts[1] || `MK-${idx}`
        const courseName = parts[2] || "Mata Kuliah"
        const sks = parseInt(parts[3], 10) || 2
        const semester = parts[4] || "1"
        const rawClassName = parts[5] || "A"
        const lecturer1 = parts[6] || "Dosen Pengampu"
        const lecturer2 = parts[7] || ""
        const roomRequirement = parts[8] || "Ruang Kelas Biasa"
        const preferredDaysRaw = parts[9] || ""

        const preferredDays = preferredDaysRaw
          ? preferredDaysRaw
              .split(/[,/]/)
              .map((d) => d.trim())
              .filter((d) => WORK_DAYS_5.includes(d))
          : undefined

        // Automatically split combined classes (e.g. "3A & B" -> ["3A", "3B"])
        const splitClasses = splitCombinedClasses(rawClassName, semester)
        splitClasses.forEach((cls, cIdx) => {
          parsedDemands.push({
            id: `UP-${Date.now()}-${idx}-${cIdx}`,
            prodi,
            courseCode,
            courseName,
            sks,
            semester,
            className: cls,
            lecturer1,
            lecturer2: lecturer2 || undefined,
            roomRequirement,
            preferredDays,
            sourceFile: fileName,
          })
        })

        if (preferredDays && preferredDays.length > 0) {
          setLecturerConstraints((prev) => ({
            ...prev,
            [lecturer1]: {
              ...normalizeConstraint(prev[lecturer1]),
              allowedDays: preferredDays,
            },
            ...(lecturer2
              ? {
                  [lecturer2]: {
                    ...normalizeConstraint(prev[lecturer2]),
                    allowedDays: preferredDays,
                  },
                }
              : {}),
          }))
        }
      }
    })

    if (parsedDemands.length > 0) {
      setDemands((prev) => [...prev, ...parsedDemands])
      setUploadedFilesList((prev) => [...prev, `${fileName} (${parsedDemands.length} MK)`])
    } else {
      alert(`Tidak ada baris mata kuliah yang terbaca dari file "${fileName}". Pastikan kolom sesuai template.`)
    }
  }

  // Handle Multi-file Upload (.xlsx & .csv) from Kaprodi
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      const lowerName = file.name.toLowerCase()
      if (lowerName.endsWith(".xlsx")) {
        try {
          const rows = await parseXlsxFile(file)
          processUploadedRows(rows, file.name)
        } catch (err: any) {
          alert(`Gagal membaca file Excel "${file.name}": ${err?.message || "Format tidak valid"}`)
        }
      } else {
        const text = await file.text()
        const lines = text.split(/\r?\n/)
        const rows = lines
          .map((line) => line.trim())
          .filter((trimmed) => trimmed && !trimmed.startsWith("#"))
          .map((trimmed) => {
            const delimiter = trimmed.includes(";") ? ";" : ","
            return trimmed.split(delimiter)
          })
        processUploadedRows(rows, file.name)
      }
    }

    // Reset input so the same file can be re-uploaded if needed
    event.target.value = ""
  }

  const handleLoadSampleBundle = () => {
    setDemands(SAMPLE_KAPRODI_DATA)
    const initialConstraints: Record<string, LecturerConstraint> = {}
    SAMPLE_KAPRODI_DATA.forEach((d) => {
      if (d.preferredDays && d.preferredDays.length > 0) {
        initialConstraints[d.lecturer1] = { allowedDays: d.preferredDays, startTime: "07:00", endTime: "18:00" }
        if (d.lecturer2) {
          initialConstraints[d.lecturer2] = { allowedDays: d.preferredDays, startTime: "07:00", endTime: "18:00" }
        }
      }
    })
    setLecturerConstraints(initialConstraints)
    setUploadedFilesList([
      "Template_Kaprodi_RPL.csv (9 MK)",
      "Template_Kaprodi_PGSD.csv (8 MK)",
      "Template_Kaprodi_PGPAUD.csv (6 MK)",
      "Template_Kaprodi_PMM.csv (6 MK)",
      "Template_Kaprodi_TEKKOM.csv (6 MK)",
    ])
    setAuditReport(null)
  }

  // Add course demand manually (also auto-splits combined classes!)
  const handleAddCourseDemand = () => {
    if (!newCourseDraft.courseCode || !newCourseDraft.courseName || !newCourseDraft.lecturer1) return

    const semester = newCourseDraft.semester || "1"
    const splitClasses = splitCombinedClasses(newCourseDraft.className || "1A", semester)
    const newItems: CourseDemand[] = splitClasses.map((cls, idx) => ({
      id: `MAN-${Date.now()}-${idx}`,
      prodi: newCourseDraft.prodi || "RPL",
      courseCode: (newCourseDraft.courseCode || "").toUpperCase(),
      courseName: newCourseDraft.courseName || "",
      sks: Number(newCourseDraft.sks) || 3,
      semester,
      className: cls,
      lecturer1: newCourseDraft.lecturer1 || "",
      lecturer2: newCourseDraft.lecturer2 ? newCourseDraft.lecturer2 : undefined,
      roomRequirement: newCourseDraft.roomRequirement || "Kelas Teori",
      preferredDays:
        newCourseDraft.preferredDays && newCourseDraft.preferredDays.length > 0
          ? newCourseDraft.preferredDays
          : undefined,
      sourceFile: "Input Manual Admin",
    }))

    setDemands((prev) => [...newItems, ...prev])
    setShowAddCourseModal(false)
    setNewCourseDraft({
      prodi: "RPL",
      courseCode: "",
      courseName: "",
      sks: 3,
      semester: "3",
      className: "3A",
      lecturer1: "",
      lecturer2: "",
      roomRequirement: "Kelas Teori",
      preferredDays: [],
    })
  }

  const handleRemoveDemand = (id: string) => {
    setDemands((prev) => prev.filter((d) => d.id !== id))
  }

  const handleClearAllDemands = () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan seluruh antrean template pengajuan?")) {
      setDemands([])
      setUploadedFilesList([])
      setAuditReport(null)
    }
  }

  // --- GENERATOR MIND MAPPING (37 Ruangan • Prioritas Kelas Teori -> Ruang 1-22 • Lab 23-37 Kosong • Cohort + Day/Time Constraints) ---
  const handleGenerateSchedule = () => {
    if (demands.length === 0) {
      alert("Belum ada data template perkuliahan yang dimasukkan.")
      return
    }

    setIsGenerating(true)

    setTimeout(() => {
      // Preserve existing time_settings if configured
      const existingData = getLatestMindMappingData()
      const baseData = createEmptyMindMappingData(existingData.time_settings || DEFAULT_TIME_SETTINGS)
      const daysSlots = baseData.days_slots

      // 1. Auto-split any combined classes before generation
      const expandedDemands = demands.flatMap(expandDemandClasses)

      const isLabRequirement = (req?: string) => (req || "").toLowerCase().includes("lab")

      // 2. Sort demands:
      //    Phase 1: Kelas Teori (non-lab) FIRST, then Lab courses SECOND
      //    Inside each phase: Restricted lecturer (day or time) -> Highest SKS -> Heaviest lecturer load -> Team Teaching
      const sortedDemands = [...expandedDemands].sort((a, b) => {
        const aIsLab = isLabRequirement(a.roomRequirement)
        const bIsLab = isLabRequirement(b.roomRequirement)
        if (!aIsLab && bIsLab) return -1
        if (aIsLab && !bIsLab) return 1

        const aC1 = normalizeConstraint(lecturerConstraints[a.lecturer1])
        const bC1 = normalizeConstraint(lecturerConstraints[b.lecturer1])
        const aC2 = a.lecturer2 ? normalizeConstraint(lecturerConstraints[a.lecturer2]) : null
        const bC2 = b.lecturer2 ? normalizeConstraint(lecturerConstraints[b.lecturer2]) : null

        const aRestricted = isConstraintRestricted(aC1) || (aC2 ? isConstraintRestricted(aC2) : false)
        const bRestricted = isConstraintRestricted(bC1) || (bC2 ? isConstraintRestricted(bC2) : false)
        if (aRestricted && !bRestricted) return -1
        if (!aRestricted && bRestricted) return 1

        if (b.sks !== a.sks) return b.sks - a.sks

        const aL1Sks = lecturerList.find((l) => l.name === a.lecturer1)?.totalSks || 0
        const bL1Sks = lecturerList.find((l) => l.name === b.lecturer1)?.totalSks || 0
        if (bL1Sks !== aL1Sks) return bL1Sks - aL1Sks

        return (b.lecturer2 ? 1 : 0) - (a.lecturer2 ? 1 : 0)
      })

      const roomOccupancy = new Set<string>()
      const lecturerOccupancy = new Set<string>()
      const cohortOccupancy = new Set<string>()

      const mappedCourses: MappedCourse[] = []
      const parkedCourses: MappedCourse[] = []
      const academicSchedulesOut: any[] = []
      const auditDetails: string[] = []

      // Helper: get valid contiguous non-break Pos blocks on a specific day within [allowedStartMin, allowedEndMin]
      const getCandidateBlocksForDay = (day: string, sksSpan: number, minStart: number, maxEnd: number): SlotDef[][] => {
        const slots = daysSlots[day] || []
        const blocks: SlotDef[][] = []
        for (let i = 0; i <= slots.length - sksSpan; i++) {
          const slice = slots.slice(i, i + sksSpan)
          if (slice.some((s) => s.is_break || s.pos === null)) continue
          const blockStart = timeToMinutes(slice[0].start)
          const blockEnd = timeToMinutes(slice[slice.length - 1].end)
          if (blockStart >= minStart && blockEnd <= maxEnd) {
            blocks.push(slice)
          }
        }
        return blocks
      }

      // Rooms 1-22 ONLY (Gedung B 1-18 & Gedung E 19-22). Rooms 23-37 (Smart Class & Lab) intentionally left empty for manual DnD!
      const candidateRooms = CLASSROOM_CODES_1_22

      sortedDemands.forEach((demand, idx) => {
        const sksSpan = Math.min(Math.max(demand.sks, 1), 6)
        const courseId = `MM-${String(idx + 1).padStart(4, "0")}`
        const cohortKey = getCohortKey(demand.prodi, demand.semester, demand.className)

        const c1 = normalizeConstraint(lecturerConstraints[demand.lecturer1])
        const c2 = demand.lecturer2 ? normalizeConstraint(lecturerConstraints[demand.lecturer2]) : null

        // Intersection of allowed days & allowed time ranges for Pengampu 1 & Pengampu 2
        const allowedDays = c2
          ? c1.allowedDays.filter((d) => c2.allowedDays.includes(d))
          : c1.allowedDays
        const minStart = c2
          ? Math.max(timeToMinutes(c1.startTime), timeToMinutes(c2.startTime))
          : timeToMinutes(c1.startTime)
        const maxEnd = c2
          ? Math.min(timeToMinutes(c1.endTime), timeToMinutes(c2.endTime))
          : timeToMinutes(c1.endTime)

        let placed = false

        if (allowedDays.length > 0 && minStart < maxEnd) {
          for (const day of allowedDays) {
            if (placed) break
            const validBlocks = getCandidateBlocksForDay(day, sksSpan, minStart, maxEnd)

            for (const block of validBlocks) {
              if (placed) break

              // Check Lecturer 1, Lecturer 2, and Student Cohort (Prodi + Semester + Kelas)
              let hasConflict = false
              for (const slot of block) {
                const pos = slot.pos!
                if (lecturerOccupancy.has(`${day}|${pos}|${demand.lecturer1.trim().toLowerCase()}`)) {
                  hasConflict = true
                  break
                }
                if (demand.lecturer2 && lecturerOccupancy.has(`${day}|${pos}|${demand.lecturer2.trim().toLowerCase()}`)) {
                  hasConflict = true
                  break
                }
                if (cohortOccupancy.has(`${day}|${pos}|${cohortKey}`)) {
                  hasConflict = true
                  break
                }
              }
              if (hasConflict) continue

              // Find an available room in 1-22 (Gedung B & Gedung E)
              for (const roomCode of candidateRooms) {
                let roomBusy = false
                for (const slot of block) {
                  if (roomOccupancy.has(`${day}|${slot.pos}|${roomCode}`)) {
                    roomBusy = true
                    break
                  }
                }

                if (!roomBusy) {
                  for (const slot of block) {
                    const pos = slot.pos!
                    roomOccupancy.add(`${day}|${pos}|${roomCode}`)
                    lecturerOccupancy.add(`${day}|${pos}|${demand.lecturer1.trim().toLowerCase()}`)
                    if (demand.lecturer2) {
                      lecturerOccupancy.add(`${day}|${pos}|${demand.lecturer2.trim().toLowerCase()}`)
                    }
                    cohortOccupancy.add(`${day}|${pos}|${cohortKey}`)
                  }

                  const firstSlot = block[0]
                  const lastSlot = block[block.length - 1]
                  const startDot = firstSlot.start.replace(":", ".")
                  const endDot = lastSlot.end.replace(":", ".")
                  const rDef = getRoomDef(roomCode)

                  const mapped: MappedCourse = {
                    id: courseId,
                    day,
                    start_pos: firstSlot.pos!,
                    end_pos: lastSlot.pos!,
                    start_row: firstSlot.pos! + 5,
                    end_row: lastSlot.pos! + 5,
                    start_time: startDot,
                    end_time: endDot,
                    time_display: `${startDot} - ${endDot}`,
                    building: rDef ? rDef.buildingName : "Ruang Kelas Gedung B",
                    room: roomCode,
                    course_code: demand.courseCode,
                    class_name: demand.className,
                    display_label: `${demand.courseCode} - ${demand.className}`,
                    course_name: demand.courseName,
                    prodi: demand.prodi,
                    sks: String(demand.sks),
                    semester: demand.semester,
                    lecturer_1: demand.lecturer1,
                    lecturer_2: demand.lecturer2 || "",
                    room_requirement: demand.roomRequirement || "Kelas Teori",
                  }

                  mappedCourses.push(mapped)

                  academicSchedulesOut.push({
                    id: `JDW-${courseId}`,
                    program: demand.prodi,
                    course: demand.courseName,
                    className: `${demand.prodi} ${demand.className}`,
                    lecturer: demand.lecturer2 ? `${demand.lecturer1} & ${demand.lecturer2}` : demand.lecturer1,
                    day: WORK_DAYS_5.indexOf(day) + 1,
                    dayName: day,
                    startTime: firstSlot.start,
                    endTime: lastSlot.end,
                    roomCode,
                  })

                  placed = true
                  break
                }
              }
            }
          }
        }

        if (!placed) {
          // Overflow / no valid slot in rooms 1-22 -> automatically placed in parked_courses!
          const parkedItem: MappedCourse = {
            id: courseId,
            day: allowedDays[0] || "Senin",
            start_pos: 1,
            end_pos: sksSpan,
            start_row: 6,
            end_row: 5 + sksSpan,
            start_time: "",
            end_time: "",
            time_display: `${demand.sks} SKS`,
            building: "Parkir Sementara",
            room: "-",
            course_code: demand.courseCode,
            class_name: demand.className,
            display_label: `${demand.courseCode} - ${demand.className}`,
            course_name: demand.courseName,
            prodi: demand.prodi,
            sks: String(demand.sks),
            semester: demand.semester,
            lecturer_1: demand.lecturer1,
            lecturer_2: demand.lecturer2 || "",
            room_requirement: demand.roomRequirement || "Kelas Teori",
            park_reason:
              allowedDays.length === 0 || minStart >= maxEnd
                ? "Irisan hari/jam Pengampu 1 & 2 kosong"
                : "Slot Ruang 1–22 penuh / bentrok — siap di-drag ke Lab 23–37",
          }
          parkedCourses.push(parkedItem)
          auditDetails.push(
            `${demand.courseCode} (${demand.courseName} - ${demand.className}) masuk Parkir Sementara (${parkedItem.park_reason}).`
          )
        }
      })

      const now = new Date()
      const formattedTimestamp = `${now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}, ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`

      const matrixCells = rebuildMatrixCells(mappedCourses, daysSlots)

      const updatedMindMappingData: MindMappingData = {
        ...baseData,
        metadata: {
          ...baseData.metadata,
          version: `v2.1.${Math.floor(Math.random() * 80 + 20)}-integrated`,
          generated_at: formattedTimestamp,
          total_courses: mappedCourses.length,
          approval_status:
            parkedCourses.length === 0
              ? "Disetujui Otomatis oleh Admin Akademik (0 Konflik)"
              : `${mappedCourses.length} Terjadwal, ${parkedCourses.length} di Parkir Sementara`,
        },
        courses: mappedCourses,
        parked_courses: parkedCourses,
        matrix_cells: matrixCells,
      }

      localStorage.setItem("rpl-mind-mapping-data", JSON.stringify(updatedMindMappingData))
      if (academicSchedulesOut.length > 0) {
        localStorage.setItem("rpl-academic-schedules", JSON.stringify(academicSchedulesOut))
      }

      if (onSchedulesUpdated) {
        onSchedulesUpdated()
      }

      const totalSksMapped = mappedCourses.reduce((acc, c) => acc + (parseInt(c.sks, 10) || 0), 0)

      setAuditReport({
        success: parkedCourses.length === 0,
        totalMapped: mappedCourses.length,
        totalParked: parkedCourses.length,
        totalSks: totalSksMapped,
        lecturerConflicts: 0,
        classConflicts: 0,
        roomConflicts: 0,
        timestamp: formattedTimestamp,
        details: auditDetails,
      })

      setIsGenerating(false)
      setActiveTab("matrix")
    }, 500)
  }

  const visibleDemands = useMemo(() => {
    return demands.filter((item) => {
      const matchProdi = selectedProdiFilter === "Semua" || item.prodi === selectedProdiFilter
      const q = searchQuery.toLowerCase().trim()
      const matchQuery =
        !q ||
        item.courseCode.toLowerCase().includes(q) ||
        item.courseName.toLowerCase().includes(q) ||
        item.lecturer1.toLowerCase().includes(q) ||
        (item.lecturer2 && item.lecturer2.toLowerCase().includes(q)) ||
        item.className.toLowerCase().includes(q)
      return matchProdi && matchQuery
    })
  }, [demands, selectedProdiFilter, searchQuery])

  const stats = useMemo(() => {
    const totalSks = demands.reduce((acc, d) => acc + d.sks, 0)
    const prodis = Array.from(new Set(demands.map((d) => d.prodi)))
    const teamTeachingCount = demands.filter((d) => Boolean(d.lecturer2 && d.lecturer2.trim())).length
    const restrictedLecturerCount = lecturerList.filter((l) => l.isRestricted).length

    return {
      totalCourses: demands.length,
      totalSks,
      prodisCount: prodis.length,
      lecturersCount: lecturerList.length,
      teamTeachingCount,
      restrictedLecturerCount,
    }
  }, [demands, lecturerList])

  const formatShortDays = (days: string[]) => {
    if (days.length >= WORK_DAYS_5.length) return "Semua Hari (Sen–Jum)"
    return days.join(", ")
  }

  return (
    <div style={{ marginTop: 12 }}>
      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", gap: 10, borderBottom: "2px solid #e2e8f0", paddingBottom: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className={`btn ${activeTab === "template" ? "btn-primary" : "btn-outline"}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13, padding: "8px 14px" }}
            onClick={() => setActiveTab("template")}
          >
            📥 1. Template &amp; Penggabungan ({stats.totalCourses} MK)
          </button>
          <button
            type="button"
            className={`btn ${activeTab === "dosen" ? "btn-primary" : "btn-outline"}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13, padding: "8px 14px" }}
            onClick={() => setActiveTab("dosen")}
          >
            ⚡ 2. Ketersediaan &amp; Hari Khusus Dosen ({stats.restrictedLecturerCount} Khusus)
          </button>
          <button
            type="button"
            className={`btn ${activeTab === "matrix" ? "btn-primary" : "btn-outline"}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13, padding: "8px 14px" }}
            onClick={() => setActiveTab("matrix")}
          >
            🗺️ 3. Generator &amp; Mind Mapping Terintegrasi
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {go && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, fontWeight: 600, padding: "7px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}
              onClick={() => go("admin-mind-mapping")}
            >
              🗺️ Buka Matriks Interaktif (37 Ruang)
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: TEMPLATE & PENGGABUNGAN DATA KAPRODI */}
      {activeTab === "template" && (
        <div>
          <section className="panel" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)", border: "1px solid #bfdbfe", padding: "18px 20px", borderRadius: 12, marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div style={{ maxWidth: 750 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#2563eb", textTransform: "uppercase" }}>
                  SISTEM INTEGRASI PENJADWALAN KAMPUS TERPUSAT (37 RUANGAN)
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e3a8a", marginTop: 4, marginBottom: 6 }}>
                  Penggabungan Berkas Template Kaprodi Seluruh Program Studi
                </h2>
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: 0 }}>
                  Generator mengutamakan <strong>Kelas Teori</strong> mengisi Ruang Kelas 1–22 (Gedung B &amp; E), dilanjutkan MK Lab ke sisa slot 1–22. Ruang <strong>Smart Class &amp; Lab 23–37 dikosongkan</strong> untuk Drag &amp; Drop manual. Kelas gabungan (misal <code>3A &amp; B</code>) otomatis dipecah menjadi baris terpisah.
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13 }}
                  onClick={downloadKaprodiTemplate}
                >
                  📥 Unduh Template Kaprodi (.XLSX)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}
                  onClick={handleLoadSampleBundle}
                >
                  📦 Muat Contoh 5 Kaprodi
                </button>
                <label className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", margin: 0 }}>
                  📂 Unggah Berkas Kaprodi (.XLSX / .CSV)
                  <input
                    type="file"
                    multiple
                    accept=".xlsx,.csv,.txt"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            {uploadedFilesList.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed #cbd5e1", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>Berkas Terintegrasi:</span>
                {uploadedFilesList.map((fn, idx) => (
                  <span
                    key={idx}
                    style={{ background: "#dbeafe", color: "#1e40af", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6, border: "1px solid #93c5fd" }}
                  >
                    📄 {fn}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Metrics Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 18 }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Mata Kuliah</span>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{stats.totalCourses} MK</div>
              <small style={{ color: "#2563eb", fontSize: 11 }}>Dari {stats.prodisCount} Program Studi</small>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Beban SKS</span>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{stats.totalSks} SKS</div>
              <small style={{ color: "#64748b", fontSize: 11 }}>Prioritas Teori &rarr; Ruang 1–22</small>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Dosen Pengampu</span>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{stats.lecturersCount} Dosen</div>
              <small style={{ color: stats.restrictedLecturerCount > 0 ? "#d97706" : "#16a34a", fontSize: 11, fontWeight: 600 }}>
                {stats.restrictedLecturerCount} Punya Jadwal Khusus
              </small>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Team Teaching</span>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{stats.teamTeachingCount} MK</div>
              <small style={{ color: "#7c3aed", fontSize: 11 }}>2 Dosen Bebas Bentrok</small>
            </div>
          </div>

          {/* Demands Table */}
          <section className="panel" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Daftar Pengajuan Kebutuhan Perkuliahan Terpadu
                </h3>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                  Kelas gabungan otomatis terpecah per kelas. Anti-bentrok memvalidasi Prodi + Semester + Kelas.
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {["Semua", "RPL", "PGSD", "PGPAUD", "PMM", "TEKKOM"].map((prodi) => (
                    <button
                      key={prodi}
                      type="button"
                      className={`btn btn-sm ${selectedProdiFilter === prodi ? "btn-primary" : "btn-outline"}`}
                      style={{ fontSize: 11, padding: "5px 10px" }}
                      onClick={() => setSelectedProdiFilter(prodi)}
                    >
                      {prodi}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Cari MK, dosen, kelas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: 12, padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: 6, minWidth: 170 }}
                />

                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: 12, padding: "6px 12px" }}
                  onClick={() => setShowAddCourseModal(true)}
                >
                  + Tambah MK Manual
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  style={{ fontSize: 12, padding: "6px 10px" }}
                  onClick={handleClearAllDemands}
                >
                  Kosongkan
                </button>
              </div>
            </div>

            <div className="table-wrap" style={{ maxHeight: 420, overflowY: "auto" }}>
              <table style={{ width: "100%", fontSize: 12 }}>
                <thead style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 2 }}>
                  <tr>
                    <th style={{ width: 65 }}>Prodi</th>
                    <th style={{ width: 80 }}>Kode MK</th>
                    <th>Nama Mata Kuliah</th>
                    <th style={{ width: 55, textAlign: "center" }}>SKS</th>
                    <th style={{ width: 70, textAlign: "center" }}>Kelas</th>
                    <th>Dosen Pengampu 1</th>
                    <th>Dosen Pengampu 2</th>
                    <th>Kebutuhan Ruang</th>
                    <th>Jadwal Khusus Dosen</th>
                    <th style={{ width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {visibleDemands.map((d) => {
                    const c1 = normalizeConstraint(lecturerConstraints[d.lecturer1])
                    const restricted = isConstraintRestricted(c1)

                    return (
                      <tr key={d.id}>
                        <td>
                          <span
                            style={{
                              background:
                                d.prodi === "RPL" ? "#dbeafe" :
                                d.prodi === "PGSD" ? "#dcfce7" :
                                d.prodi === "PGPAUD" ? "#fef3c7" :
                                d.prodi === "PMM" ? "#f3e8ff" : "#ffe4e6",
                              color:
                                d.prodi === "RPL" ? "#1e40af" :
                                d.prodi === "PGSD" ? "#15803d" :
                                d.prodi === "PGPAUD" ? "#b45309" :
                                d.prodi === "PMM" ? "#6b21a8" : "#be123c",
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontWeight: 700,
                              fontSize: 10,
                            }}
                          >
                            {d.prodi}
                          </span>
                        </td>
                        <td><strong>{d.courseCode}</strong></td>
                        <td>
                          <div><strong>{d.courseName}</strong></div>
                          <small style={{ color: "#64748b" }}>Sem. {d.semester} &bull; {d.sourceFile || "Template"}</small>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ fontWeight: 800, color: d.sks >= 4 ? "#b91c1c" : d.sks === 3 ? "#1e40af" : "#0f172a" }}>
                            {d.sks} SKS
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}><strong>{d.className}</strong></td>
                        <td><div style={{ fontWeight: 600, color: "#0f172a" }}>{d.lecturer1}</div></td>
                        <td>
                          {d.lecturer2 ? (
                            <span style={{ color: "#7c3aed", fontWeight: 600 }}>{d.lecturer2}</span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: 11, color: (d.roomRequirement || "").toLowerCase().includes("lab") ? "#2563eb" : "#475569", fontWeight: 600 }}>
                            {d.roomRequirement || "Kelas Teori"}
                          </span>
                        </td>
                        <td>
                          {restricted ? (
                            <span style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                              ⚡ {formatShortDays(c1.allowedDays)} ({c1.startTime}–{c1.endTime})
                            </span>
                          ) : (
                            <span style={{ color: "#16a34a", fontSize: 11 }}>✓ Fleksibel</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleRemoveDemand(d.id)}
                            style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "bold", fontSize: 14 }}
                            title="Hapus baris ini"
                          >
                            &times;
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                Menampilkan <strong>{visibleDemands.length}</strong> dari <strong>{demands.length}</strong> mata kuliah.
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab("dosen")}>
                  Lanjut ke Atur Ketersediaan Dosen &rarr;
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGenerateSchedule}
                  disabled={isGenerating || demands.length === 0}
                  style={{ fontWeight: 700 }}
                >
                  {isGenerating ? "⚡ Memetakan Matriks..." : "⚡ Langsung Generate Mind Mapping"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: KETERSEDIAAN & HARI/JAM KHUSUS DOSEN (COMPACT CARDS + POP-UP MODAL) */}
      {activeTab === "dosen" && (
        <div>
          <section className="panel" style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", border: "1px solid #fde68a", padding: "16px 20px", borderRadius: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ maxWidth: 740 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#b45309", textTransform: "uppercase" }}>
                  PENGATURAN HARI &amp; JAM MENGAJAR DOSEN
                </span>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#78350f", marginTop: 4, marginBottom: 4 }}>
                  Ketersediaan &amp; Jadwal Khusus Dosen (Pengampu 1 &amp; 2)
                </h2>
                <p style={{ fontSize: 12.5, color: "#92400e", margin: 0 }}>
                  Klik <strong>⚙️ Atur Hari &amp; Jam Mengajar</strong> pada kartu dosen untuk menetapkan hari dan rentang jam khusus. Generator wajib mematuhi batasan hari dan jam kedua pengampu.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerateSchedule}
                disabled={isGenerating || demands.length === 0}
                style={{ fontWeight: 700 }}
              >
                {isGenerating ? "⚡ Memetakan..." : "⚡ Generate Mind Mapping"}
              </button>
            </div>
          </section>

          {/* Search & Filter Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                type="button"
                className={`btn btn-sm ${lecturerFilter === "all" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setLecturerFilter("all")}
              >
                Semua Dosen ({lecturerList.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${lecturerFilter === "restricted" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setLecturerFilter("restricted")}
              >
                ⚡ Punya Jadwal Khusus ({lecturerList.filter((l) => l.isRestricted).length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${lecturerFilter === "flexible" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setLecturerFilter("flexible")}
              >
                ✓ Bebas Fleksibel ({lecturerList.filter((l) => !l.isRestricted).length})
              </button>
            </div>

            <input
              type="text"
              placeholder="Cari nama dosen atau mata kuliah..."
              value={lecturerSearch}
              onChange={(e) => setLecturerSearch(e.target.value)}
              style={{ fontSize: 12.5, padding: "7px 12px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 240 }}
            />
          </div>

          {/* Compact Lecturer Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
            {filteredLecturers.map((lecturer) => (
              <div
                key={lecturer.name}
                style={{
                  background: "#fff",
                  border: lecturer.isRestricted ? "2px solid #f59e0b" : "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 10,
                  boxShadow: lecturer.isRestricted ? "0 3px 10px rgba(245, 158, 11, 0.12)" : "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <strong style={{ fontSize: 13.5, color: "#0f172a", lineHeight: 1.3 }}>{lecturer.name}</strong>
                    <span
                      style={{
                        background: lecturer.isRestricted ? "#fef3c7" : "#dcfce7",
                        color: lecturer.isRestricted ? "#92400e" : "#15803d",
                        border: `1px solid ${lecturer.isRestricted ? "#fde68a" : "#86efac"}`,
                        padding: "2px 7px",
                        borderRadius: 9999,
                        fontSize: 10,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {lecturer.isRestricted ? "⚡ JADWAL KHUSUS" : "✓ FLEKSIBEL"}
                    </span>
                  </div>

                  <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>
                    Beban: <strong style={{ color: "#2563eb" }}>{lecturer.totalSks} SKS</strong> &bull; {lecturer.courseCount} Kelas
                  </div>

                  <div style={{ marginTop: 8, padding: "6px 8px", borderRadius: 6, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 11.5, color: "#334155" }}>
                    <div><strong>Hari:</strong> {formatShortDays(lecturer.allowedDays)}</div>
                    <div><strong>Jam:</strong> {lecturer.startTime} – {lecturer.endTime} WIB</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => openLecturerModal(lecturer)}
                  style={{ width: "100%", fontWeight: 700, fontSize: 12, padding: "7px 10px", justifyContent: "center" }}
                >
                  ⚙️ Atur Hari &amp; Jam Mengajar
                </button>
              </div>
            ))}
          </div>

          {filteredLecturers.length === 0 && (
            <div style={{ textAlign: "center", padding: 30, color: "#64748b", fontSize: 13 }}>
              Tidak ada dosen yang cocok dengan pencarian/filter.
            </div>
          )}

          {/* Action Footer */}
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveTab("template")}>
              &larr; Kembali ke Data Template
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerateSchedule}
              disabled={isGenerating}
              style={{ fontWeight: 700, padding: "10px 20px" }}
            >
              {isGenerating ? "⚡ Memetakan Matriks..." : "⚡ Generate Mind Mapping Bebas Bentrok"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: GENERATOR & HASIL MIND MAPPING TERINTEGRASI */}
      {activeTab === "matrix" && (
        <div>
          {auditReport && (
            <section
              className="panel"
              style={{
                background: auditReport.success ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" : "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                border: `1px solid ${auditReport.success ? "#86efac" : "#fde68a"}`,
                padding: "18px 20px",
                borderRadius: 12,
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: auditReport.success ? "#22c55e" : "#f59e0b",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 20,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {auditReport.success ? "✓" : "!"}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: auditReport.success ? "#14532d" : "#78350f", margin: 0 }}>
                      {auditReport.success
                        ? "Mind Mapping Berhasil Digenerate (0 Konflik)!"
                        : `${auditReport.totalMapped} MK Terjadwal & ${auditReport.totalParked} MK Masuk Parkir Sementara`}
                    </h2>
                    <p style={{ fontSize: 13, color: auditReport.success ? "#166534" : "#92400e", marginTop: 4, margin: 0 }}>
                      Memetakan <strong>{auditReport.totalMapped} mata kuliah</strong> ({auditReport.totalSks} SKS) ke Ruang Kelas 1–22 (Gedung B &amp; E). Smart Class &amp; Lab 23–37 siap diisi manual lewat Drag &amp; Drop.
                    </p>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
                      Waktu Pemetaan: <strong>{auditReport.timestamp}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {go && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => go("admin-mind-mapping")}
                      style={{ fontWeight: 700 }}
                    >
                      🗺️ Buka Matriks &amp; Drag-Drop
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => exportMindMappingCsv(getLatestMindMappingData())}
                  >
                    📊 Unduh CSV (Excel)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      exportMindMappingImage(getLatestMindMappingData(), {
                        format: "png",
                        selectedBuilding: "all",
                        selectedDay: "all",
                      })
                    }
                  >
                    🖼️ Unduh PNG (HD)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      exportMindMappingImage(getLatestMindMappingData(), {
                        format: "jpeg",
                        selectedBuilding: "all",
                        selectedDay: "all",
                      })
                    }
                  >
                    📸 Unduh JPG (HD)
                  </button>
                </div>
              </div>

              {auditReport.details.length > 0 && (
                <div style={{ marginTop: 12, padding: 10, background: "#fff", borderRadius: 8, border: "1px solid #fde68a", fontSize: 11.5, color: "#78350f" }}>
                  <strong>Catatan Parkir Sementara ({auditReport.details.length}):</strong>
                  <ul style={{ margin: "4px 0 0 18px" }}>
                    {auditReport.details.slice(0, 8).map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {!auditReport && (
            <div style={{ textAlign: "center", padding: "36px 20px", background: "#f8fafc", borderRadius: 12, border: "2px dashed #cbd5e1", marginBottom: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
                Siap Generate Mind Mapping (Template 37 Ruangan • 2023/2024)
              </h3>
              <p style={{ color: "#64748b", fontSize: 13, maxWidth: 600, margin: "6px auto 16px" }}>
                Terdapat <strong>{demands.length} mata kuliah</strong> siap dipetakan ke Ruang Kelas 1–22 (Gedung B &amp; E) dengan prioritas Kelas Teori, validasi anti-bentrok Semester+Kelas, dan kepatuhan hari &amp; jam khusus dosen.
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGenerateSchedule}
                  disabled={isGenerating || demands.length === 0}
                  style={{ fontSize: 14, fontWeight: 700, padding: "10px 22px" }}
                >
                  {isGenerating ? "⚡ Sedang Memproses..." : "⚡ Mulai Generate Mind Mapping"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => exportMindMappingCsv(getLatestMindMappingData())}>
                  📊 Unduh CSV (Excel)
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => exportMindMappingImage(getLatestMindMappingData(), { format: "png", selectedBuilding: "all", selectedDay: "all" })}
                >
                  🖼️ Unduh PNG (HD)
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => exportMindMappingImage(getLatestMindMappingData(), { format: "jpeg", selectedBuilding: "all", selectedDay: "all" })}
                >
                  📸 Unduh JPG (HD)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* POP-UP MODAL: ATUR HARI & JAM MENGAJAR DOSEN */}
      {editingLecturer && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.72)", zIndex: 9999, display: "grid", placeItems: "center", padding: 16 }}
          onClick={() => setEditingLecturer(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", padding: 22, boxShadow: "0 20px 45px rgba(0,0,0,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  ⚙️ Atur Hari &amp; Jam Mengajar
                </h3>
                <div style={{ fontSize: 12.5, color: "#2563eb", fontWeight: 700, marginTop: 2 }}>
                  {editingLecturer.name} ({editingLecturer.totalSks} SKS • {editingLecturer.courseCount} Kelas)
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingLecturer(null)}
                style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}
              >
                &times;
              </button>
            </div>

            {/* Section 1: Allowed Days */}
            <div style={{ marginBottom: 16, padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
                1. Hari Mengajar Yang Diizinkan (Senin–Jumat)
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {WORK_DAYS_5.map((day) => {
                  const selected = modalDraft.allowedDays.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDraftDay(day)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: selected ? "1px solid #2563eb" : "1px solid #cbd5e1",
                        background: selected ? "#2563eb" : "#fff",
                        color: selected ? "#fff" : "#475569",
                      }}
                    >
                      {selected ? `✓ ${day}` : day}
                    </button>
                  )
                })}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Preset Cepat:</span>
                <button type="button" className="btn btn-sm btn-outline" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => setModalDraft((p) => ({ ...p, allowedDays: [...WORK_DAYS_5] }))}>
                  Semua Hari
                </button>
                <button type="button" className="btn btn-sm btn-outline" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => setModalDraft((p) => ({ ...p, allowedDays: ["Senin", "Rabu"] }))}>
                  Senin &amp; Rabu
                </button>
                <button type="button" className="btn btn-sm btn-outline" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => setModalDraft((p) => ({ ...p, allowedDays: ["Selasa", "Kamis"] }))}>
                  Selasa &amp; Kamis
                </button>
                <button type="button" className="btn btn-sm btn-outline" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => setModalDraft((p) => ({ ...p, allowedDays: ["Jumat"] }))}>
                  Jumat Saja
                </button>
              </div>
            </div>

            {/* Section 2: Allowed Time / Session */}
            <div style={{ marginBottom: 16, padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
                2. Jam / Sesi Mengajar Yang Diizinkan
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => setModalDraft((p) => ({ ...p, startTime: "07:00", endTime: "18:00" }))}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: modalDraft.startTime === "07:00" && modalDraft.endTime === "18:00" ? "1px solid #2563eb" : "1px solid #cbd5e1",
                    background: modalDraft.startTime === "07:00" && modalDraft.endTime === "18:00" ? "#dbeafe" : "#fff",
                    color: "#0f172a",
                  }}
                >
                  ☀️ Semua Jam (07:00–18:00)
                </button>
                <button
                  type="button"
                  onClick={() => setModalDraft((p) => ({ ...p, startTime: "07:00", endTime: "12:00" }))}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: modalDraft.startTime === "07:00" && modalDraft.endTime === "12:00" ? "1px solid #d97706" : "1px solid #cbd5e1",
                    background: modalDraft.startTime === "07:00" && modalDraft.endTime === "12:00" ? "#fef3c7" : "#fff",
                    color: "#0f172a",
                  }}
                >
                  🌅 Pagi Saja (07:00–12:00)
                </button>
                <button
                  type="button"
                  onClick={() => setModalDraft((p) => ({ ...p, startTime: "13:00", endTime: "18:00" }))}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: modalDraft.startTime === "13:00" && modalDraft.endTime === "18:00" ? "1px solid #7c3aed" : "1px solid #cbd5e1",
                    background: modalDraft.startTime === "13:00" && modalDraft.endTime === "18:00" ? "#f3e8ff" : "#fff",
                    color: "#0f172a",
                  }}
                >
                  🌇 Siang/Sore (13:00–18:00)
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Mulai Jam</label>
                  <input
                    type="time"
                    value={modalDraft.startTime}
                    onChange={(e) => setModalDraft((p) => ({ ...p, startTime: e.target.value }))}
                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Sampai Jam</label>
                  <input
                    type="time"
                    value={modalDraft.endTime}
                    onChange={(e) => setModalDraft((p) => ({ ...p, endTime: e.target.value }))}
                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: List of Courses Taught */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                Mata Kuliah &amp; Kelas Yang Diampu ({editingLecturer.courses.length})
              </div>
              <div style={{ maxHeight: 140, overflowY: "auto", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 11.5, color: "#334155" }}>
                <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.6 }}>
                  {editingLecturer.courses.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="btn btn-outline" onClick={resetLecturerToFlexible} style={{ fontSize: 12 }}>
                ↺ Reset ke Fleksibel
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditingLecturer(null)} style={{ fontSize: 12 }}>
                  Batal
                </button>
                <button type="button" className="btn btn-primary" onClick={saveLecturerModal} style={{ fontWeight: 700, fontSize: 12.5 }}>
                  ✓ Selesai &amp; Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH MATA KULIAH MANUAL */}
      {showAddCourseModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", zIndex: 9999, display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 540, padding: 22, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>Tambah Kebutuhan Mata Kuliah</h3>
              <button
                type="button"
                onClick={() => setShowAddCourseModal(false)}
                style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>Program Studi</label>
                <select
                  value={newCourseDraft.prodi}
                  onChange={(e) => setNewCourseDraft({ ...newCourseDraft, prodi: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                >
                  <option value="RPL">RPL (Rekayasa Perangkat Lunak)</option>
                  <option value="PGSD">PGSD</option>
                  <option value="PGPAUD">PGPAUD</option>
                  <option value="PMM">PMM (Pendidikan Multimedia)</option>
                  <option value="TEKKOM">TEKKOM (Teknik Komputer)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>Kode MK</label>
                <input
                  type="text"
                  placeholder="Contoh: RL203"
                  value={newCourseDraft.courseCode}
                  onChange={(e) => setNewCourseDraft({ ...newCourseDraft, courseCode: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>Nama Mata Kuliah</label>
                <input
                  type="text"
                  placeholder="Contoh: Arsitektur Perangkat Lunak"
                  value={newCourseDraft.courseName}
                  onChange={(e) => setNewCourseDraft({ ...newCourseDraft, courseName: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>Bobot SKS</label>
                <select
                  value={newCourseDraft.sks}
                  onChange={(e) => setNewCourseDraft({ ...newCourseDraft, sks: parseInt(e.target.value, 10) })}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                >
                  <option value={2}>2 SKS</option>
                  <option value={3}>3 SKS</option>
                  <option value={4}>4 SKS</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>Semester &amp; Kelas (auto-pisah jika gabung)</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="text"
                    placeholder="Sem"
                    value={newCourseDraft.semester}
                    onChange={(e) => setNewCourseDraft({ ...newCourseDraft, semester: e.target.value })}
                    style={{ width: "35%", padding: "7px 8px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  />
                  <input
                    type="text"
                    placeholder="3A atau 3A & B"
                    value={newCourseDraft.className}
                    onChange={(e) => setNewCourseDraft({ ...newCourseDraft, className: e.target.value })}
                    style={{ width: "65%", padding: "7px 8px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>Dosen Pengampu 1</label>
                <input
                  type="text"
                  placeholder="Nama Lengkap Dosen 1"
                  value={newCourseDraft.lecturer1}
                  onChange={(e) => setNewCourseDraft({ ...newCourseDraft, lecturer1: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>Dosen Pengampu 2 (Opsional)</label>
                <input
                  type="text"
                  placeholder="Nama Dosen 2 jika Team Teaching"
                  value={newCourseDraft.lecturer2}
                  onChange={(e) => setNewCourseDraft({ ...newCourseDraft, lecturer2: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>Kebutuhan Ruang</label>
                <select
                  value={newCourseDraft.roomRequirement}
                  onChange={(e) => setNewCourseDraft({ ...newCourseDraft, roomRequirement: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                >
                  <option value="Kelas Teori">Kelas Teori (Prioritas Ruang 1–22 Gedung B &amp; E)</option>
                  <option value="Lab Komputer">Lab Komputer (Sisa Ruang 1–22 / Drag manual ke Lab 23–37)</option>
                  <option value="Lab Khusus">Lab Khusus (Sisa Ruang 1–22 / Drag manual ke Lab 23–37)</option>
                  <option value="Bebas">Bebas</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowAddCourseModal(false)}>
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddCourseDemand}
                disabled={!newCourseDraft.courseCode || !newCourseDraft.courseName || !newCourseDraft.lecturer1}
              >
                Simpan ke Antrean
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
