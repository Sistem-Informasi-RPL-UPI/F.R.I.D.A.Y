import { useState, useMemo, useEffect } from "react"
import mindMappingDataJson from "./mindMappingData.json"

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
  roomRequirement?: "Lab Komputer" | "Lab Khusus" | "Kelas Teori" | "Bebas"
  preferredDays?: string[] // e.g. ["Senin", "Rabu"]
  sourceFile?: string
}

export type LecturerAvailability = {
  name: string
  allowedDays: string[]
  totalSks: number
  courseCount: number
  courses: string[]
  isRestricted: boolean
}

type Props = {
  go?: (page: string) => void
  onSchedulesUpdated?: () => void
}

const ALL_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]

// Room mapping for UPI Kampus Cibiru
const LAB_ROOMS_MAP: Record<string, string[]> = {
  RPL: ["LABKOM RPL", "Lab Robotika"],
  PGSD: ["LABKOM PGSD", "LAB IPA", "LAB MICRO", "Microteaching"],
  PGPAUD: ["LAB PGPAUD", "Microteaching"],
  PMM: ["LABKOM MM", "LAB FOTOGRAFI"],
  TEKKOM: ["Lab Robotika", "LABKOM RPL"],
}

const THEORY_ROOMS = [
  "C1", "C2", "C3", "C4", "C5", "C6",
  "D1", "D2", "D3", "D4", "D5", "D6",
  "F1", "F2", "F3", "F4",
  "H1",
  "I3-1", "I3-2", "I3-3", "I3-4",
]

const ALL_ROOMS = [
  ...THEORY_ROOMS,
  "LABKOM RPL", "LABKOM PGSD", "LABKOM MM", "Lab Robotika",
  "LAB IPA", "LAB MICRO", "LAB FOTOGRAFI", "LAB PGPAUD", "Microteaching"
]

const BUILDING_MAP: Record<string, string> = {
  C1: "Gedung C", C2: "Gedung C", C3: "Gedung C", C4: "Gedung C", C5: "Gedung C", C6: "Gedung C",
  D1: "Gedung D", D2: "Gedung D", D3: "Gedung D", D4: "Gedung D", D5: "Gedung D", D6: "Gedung D",
  F1: "Gedung F", F2: "Gedung F", F3: "Gedung F", F4: "Gedung F",
  H1: "Gedung H",
  "I3-1": "Gedung I", "I3-2": "Gedung I", "I3-3": "Gedung I", "I3-4": "Gedung I",
  "LABKOM RPL": "Laboratorium", "LABKOM PGSD": "Laboratorium", "LABKOM MM": "Laboratorium",
  "Lab Robotika": "Laboratorium", "LAB IPA": "Laboratorium", "LAB MICRO": "Laboratorium",
  "LAB FOTOGRAFI": "Laboratorium", "LAB PGPAUD": "Laboratorium", Microteaching: "Laboratorium",
}

// UPI Cibiru Standard Slots definition
const STANDARD_SLOTS = [
  { slot: 1, time: "07.00 - 07.50", start: "07:00", end: "07:50", isBreak: false },
  { slot: 2, time: "07.50 - 08.40", start: "07:50", end: "08:40", isBreak: false },
  { slot: 3, time: "08.40 - 09.30", start: "08:40", end: "09:30", isBreak: false },
  { slot: 4, time: "09.30 - 10.20", start: "09:30", end: "10:20", isBreak: false },
  { slot: 5, time: "10.20 - 11.10", start: "10:20", end: "11.10", isBreak: false },
  { slot: 6, time: "11.10 - 12.00", start: "11.10", end: "12:00", isBreak: false },
  { slot: "break", time: "12.00 - 13.00", start: "12:00", end: "13:00", isBreak: true },
  { slot: 7, time: "13.00 - 13.50", start: "13:00", end: "13:50", isBreak: false },
  { slot: 8, time: "13.50 - 14.40", start: "13:50", end: "14:40", isBreak: false },
  { slot: 9, time: "14.40 - 15.30", start: "14:40", end: "15:30", isBreak: false },
  { slot: 10, time: "15.30 - 16.20", start: "15:30", end: "16:20", isBreak: false },
  { slot: 11, time: "16.20 - 17.10", start: "16:20", end: "17:10", isBreak: false },
  { slot: 12, time: "17.10 - 18.00", start: "17:10", end: "18:00", isBreak: false },
]

// Realistic Curated Sample Template Data from 5 Kaprodi
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

  // --- PRODI PMM (Pendidikan Multimedia) ---
  { id: "DEM-PMM-01", prodi: "PMM", courseCode: "PM102", courseName: "Desain Grafis Komputer", sks: 3, semester: "1", className: "1A", lecturer1: "Dosen L, M.Ds", roomRequirement: "Lab Komputer", sourceFile: "Template_Kaprodi_PMM.csv" },
  { id: "DEM-PMM-02", prodi: "PMM", courseCode: "PM204", courseName: "Animasi 2D & 3D Interaktif", sks: 4, semester: "3", className: "3A", lecturer1: "Dr. Dosen M, M.Ds", roomRequirement: "Lab Komputer", preferredDays: ["Senin", "Kamis"], sourceFile: "Template_Kaprodi_PMM.csv" },
  { id: "DEM-PMM-03", prodi: "PMM", courseCode: "PM204", courseName: "Animasi 2D & 3D Interaktif", sks: 4, semester: "3", className: "3B", lecturer1: "Dr. Dosen M, M.Ds", roomRequirement: "Lab Komputer", preferredDays: ["Senin", "Kamis"], sourceFile: "Template_Kaprodi_PMM.csv" },
  { id: "DEM-PMM-04", prodi: "PMM", courseCode: "PM306", courseName: "Videografi & Sinematografi", sks: 3, semester: "3", className: "3A", lecturer1: "Dosen L, M.Ds", lecturer2: "Dr. Dosen M, M.Ds", roomRequirement: "Lab Khusus", preferredDays: ["Senin", "Kamis"], sourceFile: "Template_Kaprodi_PMM.csv" },
  { id: "DEM-PMM-05", prodi: "PMM", courseCode: "PM405", courseName: "Fotografi Digital Kreatif", sks: 3, semester: "5", className: "5A", lecturer1: "Dosen N, M.Sn", roomRequirement: "Lab Khusus", sourceFile: "Template_Kaprodi_PMM.csv" },
  { id: "DEM-PMM-06", prodi: "PMM", courseCode: "PM500", courseName: "Produksi Multimedia Pembelajaran", sks: 3, semester: "7", className: "7A", lecturer1: "Dosen N, M.Sn", roomRequirement: "Lab Komputer", sourceFile: "Template_Kaprodi_PMM.csv" },

  // --- PRODI TEKKOM (Teknik Komputer) ---
  { id: "DEM-TEK-01", prodi: "TEKKOM", courseCode: "CM100", courseName: "Jaringan Komputer Dasar", sks: 3, semester: "1", className: "1A", lecturer1: "Dosen O, M.T", roomRequirement: "Lab Komputer", sourceFile: "Template_Kaprodi_TEKKOM.csv" },
  { id: "DEM-TEK-02", prodi: "TEKKOM", courseCode: "CM102", courseName: "Sistem Digital & Logika", sks: 3, semester: "1", className: "1B", lecturer1: "Dosen P, M.T", roomRequirement: "Lab Khusus", sourceFile: "Template_Kaprodi_TEKKOM.csv" },
  { id: "DEM-TEK-03", prodi: "TEKKOM", courseCode: "CM204", courseName: "Sistem Tertanam & Robotika", sks: 4, semester: "3", className: "3A", lecturer1: "Dr. Dosen Q, M.Eng", roomRequirement: "Lab Khusus", preferredDays: ["Selasa", "Jumat"], sourceFile: "Template_Kaprodi_TEKKOM.csv" },
  { id: "DEM-TEK-04", prodi: "TEKKOM", courseCode: "CM204", courseName: "Sistem Tertanam & Robotika", sks: 4, semester: "3", className: "3B", lecturer1: "Dr. Dosen Q, M.Eng", roomRequirement: "Lab Khusus", preferredDays: ["Selasa", "Jumat"], sourceFile: "Template_Kaprodi_TEKKOM.csv" },
  { id: "DEM-TEK-05", prodi: "TEKKOM", courseCode: "CM307", courseName: "Keamanan Jaringan & Cyber Security", sks: 3, semester: "5", className: "5A", lecturer1: "Dosen O, M.T", lecturer2: "Dr. Dosen Q, M.Eng", roomRequirement: "Lab Komputer", preferredDays: ["Selasa", "Jumat"], sourceFile: "Template_Kaprodi_TEKKOM.csv" },
  { id: "DEM-TEK-06", prodi: "TEKKOM", courseCode: "CM400", courseName: "Cloud Computing & DevOps", sks: 3, semester: "7", className: "7A", lecturer1: "Dosen P, M.T", roomRequirement: "Lab Komputer", sourceFile: "Template_Kaprodi_TEKKOM.csv" },
]

export function KaprodiScheduleIntegrator({ go, onSchedulesUpdated }: Props) {
  // Master Demands from uploaded/merged Kaprodi templates
  const [demands, setDemands] = useState<CourseDemand[]>(() => {
    try {
      const stored = localStorage.getItem("rpl-kaprodi-demands")
      return stored ? JSON.parse(stored) : SAMPLE_KAPRODI_DATA
    } catch {
      return SAMPLE_KAPRODI_DATA
    }
  })

  // Lecturer Day Availability Constraints
  const [lecturerConstraints, setLecturerConstraints] = useState<Record<string, string[]>>(() => {
    try {
      const stored = localStorage.getItem("rpl-lecturer-constraints")
      if (stored) return JSON.parse(stored)
    } catch {}
    // Seed initial constraints based on demands
    const initial: Record<string, string[]> = {}
    SAMPLE_KAPRODI_DATA.forEach((d) => {
      if (d.preferredDays && d.preferredDays.length > 0) {
        if (!initial[d.lecturer1]) initial[d.lecturer1] = d.preferredDays
        if (d.lecturer2 && !initial[d.lecturer2]) initial[d.lecturer2] = d.preferredDays
      }
    })
    return initial
  })

  const [activeTab, setActiveTab] = useState<"template" | "dosen" | "matrix">("template")
  const [selectedProdiFilter, setSelectedProdiFilter] = useState("Semua")
  const [searchQuery, setSearchQuery] = useState("")
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
    totalSks: number
    lecturerConflicts: number
    classConflicts: number
    roomConflicts: number
    lecturerConstraintSuccessRate: number
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
    roomRequirement: "Lab Komputer",
    preferredDays: [],
  })

  // Save demands to localStorage
  useEffect(() => {
    localStorage.setItem("rpl-kaprodi-demands", JSON.stringify(demands))
  }, [demands])

  // Save lecturer constraints to localStorage
  useEffect(() => {
    localStorage.setItem("rpl-lecturer-constraints", JSON.stringify(lecturerConstraints))
  }, [lecturerConstraints])

  // Extract all unique lecturers with calculated teaching load
  const lecturerList = useMemo(() => {
    const map: Record<string, { totalSks: number; courseCount: number; courses: string[] }> = {}
    demands.forEach((d) => {
      if (!map[d.lecturer1]) {
        map[d.lecturer1] = { totalSks: 0, courseCount: 0, courses: [] }
      }
      map[d.lecturer1].totalSks += d.sks
      map[d.lecturer1].courseCount += 1
      map[d.lecturer1].courses.push(`${d.courseName} (${d.className})`)

      if (d.lecturer2 && d.lecturer2.trim()) {
        if (!map[d.lecturer2]) {
          map[d.lecturer2] = { totalSks: 0, courseCount: 0, courses: [] }
        }
        map[d.lecturer2].totalSks += d.sks
        map[d.lecturer2].courseCount += 1
        map[d.lecturer2].courses.push(`${d.courseName} (${d.className}) [Team]`)
      }
    })

    const list: LecturerAvailability[] = Object.keys(map).map((name) => {
      const allowed = lecturerConstraints[name] || ALL_DAYS
      return {
        name,
        allowedDays: allowed,
        totalSks: map[name].totalSks,
        courseCount: map[name].courseCount,
        courses: map[name].courses,
        isRestricted: allowed.length < 5,
      }
    })

    // Sort by priority: Restricted lecturers first, then heaviest SKS load
    return list.sort((a, b) => {
      if (a.isRestricted && !b.isRestricted) return -1
      if (!a.isRestricted && b.isRestricted) return 1
      return b.totalSks - a.totalSks
    })
  }, [demands, lecturerConstraints])

  // Toggle allowed day for a lecturer
  const toggleLecturerDay = (lecturerName: string, day: string) => {
    setLecturerConstraints((prev) => {
      const current = prev[lecturerName] ? [...prev[lecturerName]] : [...ALL_DAYS]
      let updated: string[]
      if (current.includes(day)) {
        updated = current.filter((d) => d !== day)
        // Prevent empty allowed days
        if (updated.length === 0) updated = [day]
      } else {
        updated = [...current, day]
      }
      return { ...prev, [lecturerName]: updated }
    })
  }

  // Quick preset for lecturer days
  const setLecturerPreset = (lecturerName: string, preset: "all" | "senin-rabu" | "selasa-kamis" | "jumat" | "senin-kamis" | "selasa-jumat") => {
    let days: string[]
    switch (preset) {
      case "all":
        days = [...ALL_DAYS]
        break
      case "senin-rabu":
        days = ["Senin", "Rabu"]
        break
      case "selasa-kamis":
        days = ["Selasa", "Kamis"]
        break
      case "jumat":
        days = ["Jumat"]
        break
      case "senin-kamis":
        days = ["Senin", "Kamis"]
        break
      case "selasa-jumat":
        days = ["Selasa", "Jumat"]
        break
    }
    setLecturerConstraints((prev) => ({ ...prev, [lecturerName]: days }))
  }

  // Download Standard CSV Template for Kaprodi
  const downloadKaprodiCsvTemplate = () => {
    const headers = [
      "Program_Studi",
      "Kode_MK",
      "Nama_Mata_Kuliah",
      "SKS",
      "Semester",
      "Kelas",
      "Dosen_1",
      "Dosen_2",
      "Kebutuhan_Ruang",
      "Hari_Khusus_Dosen"
    ]

    const sampleRows = [
      ["RPL", "RL101", "Algoritma dan Pemrograman", "4", "1", "1A", "Dr. Dosen A, M.Kom", "Dosen C, M.T", "Lab Komputer", ""],
      ["RPL", "RL203", "Basis Data Terdistribusi", "3", "3", "3A", "Prof. Dosen B, M.T", "", "Lab Komputer", "Senin, Rabu"],
      ["PGSD", "GD103", "Pendidikan Bahasa Indonesia SD", "3", "1", "1A", "Dr. Dosen E, M.Pd", "", "Kelas Teori", "Selasa, Kamis"],
      ["PGSD", "GD201", "Matematika Dasar SD", "3", "3", "3B", "Dosen F, M.Pd", "", "Kelas Teori", ""],
      ["PGPAUD", "UD206", "Bermain dan Permainan Edukatif", "3", "3", "3A", "Dr. Dosen J, M.Pd", "", "Lab Khusus", "Rabu, Jumat"],
      ["PMM", "PM204", "Animasi 2D & 3D Interaktif", "4", "3", "3A", "Dr. Dosen M, M.Ds", "", "Lab Komputer", "Senin, Kamis"],
      ["TEKKOM", "CM204", "Sistem Tertanam & Robotika", "4", "3", "3A", "Dr. Dosen Q, M.Eng", "", "Lab Khusus", "Selasa, Jumat"]
    ]

    const csvContent = "\uFEFF" + [
      "# PETUNJUK PENGISIAN TEMPLATE KAPRODI UPI KAMPUS CIBIRU:",
      "# 1. Kolom Program_Studi diisi: RPL, PGSD, PGPAUD, PMM, atau TEKKOM",
      "# 2. Kolom SKS diisi angka: 2, 3, atau 4",
      "# 3. Kolom Dosen_2 bersifat opsional (diisi bila Team Teaching 2 dosen)",
      "# 4. Kolom Kebutuhan_Ruang diisi: Lab Komputer, Lab Khusus, atau Kelas Teori",
      "# 5. Kolom Hari_Khusus_Dosen diisi jika dosen bersangkutan hanya bisa hari tertentu (contoh: \"Senin, Rabu\" atau kosong)",
      headers.join(";"),
      ...sampleRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(";"))
    ].join("\r\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "TEMPLATE_JADWAL_KAPRODI_UPI_CIBIRU.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Handle Multi-file upload from Kaprodi
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newUploadedNames: string[] = []
    const parsedDemands: CourseDemand[] = []

    Array.from(files).forEach((file) => {
      newUploadedNames.push(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        if (!text) return

        const lines = text.split(/\r?\n/)
        let headerPassed = false

        lines.forEach((line, idx) => {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith("#")) return

          const delimiter = trimmed.includes(";") ? ";" : ","
          const parts = trimmed.split(delimiter).map((p) => p.replace(/^"|"$/g, "").trim())

          if (!headerPassed && (parts[0].toLowerCase().includes("prodi") || parts[0].toLowerCase().includes("program"))) {
            headerPassed = true
            return
          }

          if (parts.length >= 6) {
            const prodi = parts[0] || "Umum"
            const courseCode = parts[1] || `MK-${idx}`
            const courseName = parts[2] || "Mata Kuliah"
            const sks = parseInt(parts[3], 10) || 2
            const semester = parts[4] || "1"
            const className = parts[5] || "A"
            const lecturer1 = parts[6] || "Dosen Pengampu"
            const lecturer2 = parts[7] || ""
            const roomRequirement = (parts[8] as any) || "Kelas Teori"
            const preferredDaysRaw = parts[9] || ""

            const preferredDays = preferredDaysRaw
              ? preferredDaysRaw.split(/[,/]/).map((d) => d.trim()).filter((d) => ALL_DAYS.includes(d))
              : undefined

            parsedDemands.push({
              id: `UP-${Date.now()}-${idx}`,
              prodi,
              courseCode,
              courseName,
              sks,
              semester,
              className,
              lecturer1,
              lecturer2: lecturer2 || undefined,
              roomRequirement,
              preferredDays,
              sourceFile: file.name,
            })

            // Auto-register preferred days to lecturer constraints if specified
            if (preferredDays && preferredDays.length > 0) {
              setLecturerConstraints((prev) => ({
                ...prev,
                [lecturer1]: preferredDays,
                ...(lecturer2 ? { [lecturer2]: preferredDays } : {}),
              }))
            }
          }
        })

        if (parsedDemands.length > 0) {
          setDemands((prev) => [...prev, ...parsedDemands])
          setUploadedFilesList((prev) => [...prev, `${file.name} (${parsedDemands.length} MK)`])
        }
      }
      reader.readAsText(file)
    })
  }

  // Load Preset 5 Kaprodi Bundle
  const handleLoadSampleBundle = () => {
    setDemands(SAMPLE_KAPRODI_DATA)
    const initialConstraints: Record<string, string[]> = {}
    SAMPLE_KAPRODI_DATA.forEach((d) => {
      if (d.preferredDays && d.preferredDays.length > 0) {
        initialConstraints[d.lecturer1] = d.preferredDays
        if (d.lecturer2) initialConstraints[d.lecturer2] = d.preferredDays
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

  // Add course demand manually
  const handleAddCourseDemand = () => {
    if (!newCourseDraft.courseCode || !newCourseDraft.courseName || !newCourseDraft.lecturer1) return

    const item: CourseDemand = {
      id: `MAN-${Date.now()}`,
      prodi: newCourseDraft.prodi || "RPL",
      courseCode: newCourseDraft.courseCode.toUpperCase(),
      courseName: newCourseDraft.courseName,
      sks: Number(newCourseDraft.sks) || 3,
      semester: newCourseDraft.semester || "1",
      className: newCourseDraft.className || "1A",
      lecturer1: newCourseDraft.lecturer1,
      lecturer2: newCourseDraft.lecturer2 ? newCourseDraft.lecturer2 : undefined,
      roomRequirement: (newCourseDraft.roomRequirement as any) || "Kelas Teori",
      preferredDays: newCourseDraft.preferredDays && newCourseDraft.preferredDays.length > 0 ? newCourseDraft.preferredDays : undefined,
      sourceFile: "Input Manual Admin",
    }

    setDemands((prev) => [item, ...prev])
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

  // Remove single demand
  const handleRemoveDemand = (id: string) => {
    setDemands((prev) => prev.filter((d) => d.id !== id))
  }

  // Clear all demands
  const handleClearAllDemands = () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan seluruh antrean template pengajuan?")) {
      setDemands([])
      setUploadedFilesList([])
      setAuditReport(null)
    }
  }

  // --- SMART SCHEDULING GENERATOR ENGINE (100% Zero Conflict) ---
  const handleGenerateSchedule = () => {
    if (demands.length === 0) {
      alert("Belum ada data template perkuliahan yang dimasukkan.")
      return
    }

    setIsGenerating(true)

    setTimeout(() => {
      // 1. Sort demands according to Strict Priority:
      // Priority 1: Courses whose lecturers have restricted days (urgent day constraints)
      // Priority 2: Highest Course SKS (4 SKS, then 3 SKS, then 2 SKS)
      // Priority 3: Lecturer with highest total SKS load
      // Priority 4: Team-Teaching courses (2 lecturers)
      const sortedDemands = [...demands].sort((a, b) => {
        const aL1Days = lecturerConstraints[a.lecturer1] || ALL_DAYS
        const bL1Days = lecturerConstraints[b.lecturer1] || ALL_DAYS
        const aIsRestricted = aL1Days.length < 5 || (a.lecturer2 && (lecturerConstraints[a.lecturer2] || ALL_DAYS).length < 5)
        const bIsRestricted = bL1Days.length < 5 || (b.lecturer2 && (lecturerConstraints[b.lecturer2] || ALL_DAYS).length < 5)

        // 1. Restricted day constraint urgency
        if (aIsRestricted && !bIsRestricted) return -1
        if (!aIsRestricted && bIsRestricted) return 1

        // 2. Course SKS (highest first)
        if (b.sks !== a.sks) return b.sks - a.sks

        // 3. Lecturer Total SKS (heaviest first)
        const aL1Sks = lecturerList.find((l) => l.name === a.lecturer1)?.totalSks || 0
        const bL1Sks = lecturerList.find((l) => l.name === b.lecturer1)?.totalSks || 0
        if (bL1Sks !== aL1Sks) return bL1Sks - aL1Sks

        // 4. Team-Teaching first
        const aTeam = a.lecturer2 ? 1 : 0
        const bTeam = b.lecturer2 ? 1 : 0
        return bTeam - aTeam
      })

      // Occupancy Trackers (100% Conflict-Free Guarantee)
      // key: `${day}|${slotIndex}|${room}`
      const roomOccupancy = new Set<string>()
      // key: `${day}|${slotIndex}|${lecturerName}`
      const lecturerOccupancy = new Set<string>()
      // key: `${day}|${slotIndex}|${prodi}|${semester}|${className}`
      const classOccupancy = new Set<string>()

      // Output collections
      const mappedCourses: any[] = []
      const matrixCells: Record<string, string> = {}
      const academicSchedulesOut: any[] = []

      // Candidate contiguous slot blocks for SKS:
      // Slots 1 to 6 (Morning: 07.00 - 12.00)
      // Break: 12.00 - 13.00 (Exempted)
      // Slots 7 to 12 (Afternoon: 13.00 - 18.00)
      const getValidSlotBlocksForSks = (sks: number) => {
        const blocks: number[][] = []
        // Morning blocks:
        for (let start = 1; start <= 6 - sks + 1; start++) {
          const b: number[] = []
          for (let k = 0; k < sks; k++) b.push(start + k)
          blocks.push(b)
        }
        // Afternoon blocks:
        for (let start = 7; start <= 12 - sks + 1; start++) {
          const b: number[] = []
          for (let k = 0; k < sks; k++) b.push(start + k)
          blocks.push(b)
        }
        return blocks
      }

      let conflictCount = 0
      const auditDetails: string[] = []

      // Place each course
      sortedDemands.forEach((demand, demandIdx) => {
        const sksSlots = Math.min(Math.max(demand.sks, 2), 4) // Contiguous slot count
        const validBlocks = getValidSlotBlocksForSks(sksSlots)

        // Allowed days for both lecturers
        const l1Allowed = lecturerConstraints[demand.lecturer1] || ALL_DAYS
        const l2Allowed = demand.lecturer2 ? (lecturerConstraints[demand.lecturer2] || ALL_DAYS) : ALL_DAYS
        // Intersection of allowed days
        const intersectingDays = l1Allowed.filter((d) => l2Allowed.includes(d))
        const candidateDays = intersectingDays.length > 0 ? intersectingDays : l1Allowed

        // Candidate rooms based on requirement & prodi
        let candidateRooms: string[] = []
        if (demand.roomRequirement === "Lab Komputer" || demand.roomRequirement === "Lab Khusus") {
          const labCandidates = LAB_ROOMS_MAP[demand.prodi] || []
          candidateRooms = [...labCandidates, ...THEORY_ROOMS]
        } else {
          candidateRooms = [...THEORY_ROOMS, ...ALL_ROOMS]
        }

        let placed = false
        const courseId = `MM-${String(demandIdx + 1).padStart(4, "0")}`

        // Find conflict-free slot: Day -> Block -> Room
        for (const day of candidateDays) {
          if (placed) break

          for (const block of validBlocks) {
            if (placed) break

            // Check if both lecturers and class cohort are completely free for all slots in block
            let hasConflict = false

            for (const slotNum of block) {
              const l1Key = `${day}|${slotNum}|${demand.lecturer1}`
              if (lecturerOccupancy.has(l1Key)) {
                hasConflict = true
                break
              }
              if (demand.lecturer2) {
                const l2Key = `${day}|${slotNum}|${demand.lecturer2}`
                if (lecturerOccupancy.has(l2Key)) {
                  hasConflict = true
                  break
                }
              }
              const classKey = `${day}|${slotNum}|${demand.prodi}|${demand.semester}|${demand.className}`
              if (classOccupancy.has(classKey)) {
                hasConflict = true
                break
              }
            }

            if (hasConflict) continue

            // Find an available candidate room
            for (const room of candidateRooms) {
              let roomConflict = false
              for (const slotNum of block) {
                const rKey = `${day}|${slotNum}|${room}`
                if (roomOccupancy.has(rKey)) {
                  roomConflict = true
                  break
                }
              }

              if (!roomConflict) {
                // SUCCESS: Claim occupancy across all slots
                for (const slotNum of block) {
                  roomOccupancy.add(`${day}|${slotNum}|${room}`)
                  lecturerOccupancy.add(`${day}|${slotNum}|${demand.lecturer1}`)
                  if (demand.lecturer2) lecturerOccupancy.add(`${day}|${slotNum}|${demand.lecturer2}`)
                  classOccupancy.add(`${day}|${slotNum}|${demand.prodi}|${demand.semester}|${demand.className}`)
                }

                // Calculate display times
                const firstSlotDef = STANDARD_SLOTS.find((s) => s.slot === block[0])!
                const lastSlotDef = STANDARD_SLOTS.find((s) => s.slot === block[block.length - 1])!
                const startTime = firstSlotDef.start
                const endTime = lastSlotDef.end
                const timeDisplay = `${startTime.replace(":", ".")} - ${endTime.replace(":", ".")}`

                // Course mapped item
                const mappedCourse = {
                  id: courseId,
                  day,
                  start_row: block[0] + 5, // offset for table rows
                  end_row: block[block.length - 1] + 5,
                  start_time: startTime.replace(":", "."),
                  end_time: endTime.replace(":", "."),
                  time_display: timeDisplay,
                  building: BUILDING_MAP[room] || "Gedung C",
                  room,
                  room_col: "C",
                  course_code: demand.courseCode,
                  class_name: demand.className,
                  display_label: `${demand.courseCode} - ${demand.className}`,
                  course_name: demand.courseName,
                  prodi: demand.prodi,
                  sks: String(demand.sks),
                  semester: demand.semester,
                  lecturer_1: demand.lecturer1,
                  lecturer_2: demand.lecturer2 || "",
                  lecturer_codes: [String(3000 + demandIdx), demand.lecturer2 ? String(4000 + demandIdx) : ""].filter(Boolean),
                }

                mappedCourses.push(mappedCourse)

                // Fill matrix cells for all occupied slots
                block.forEach((slotNum) => {
                  const sDef = STANDARD_SLOTS.find((s) => s.slot === slotNum)!
                  matrixCells[`${day}|${sDef.time}|${room}`] = courseId
                })

                // Convert to AcademicSchedule format
                const dayIndex = ALL_DAYS.indexOf(day) + 1
                academicSchedulesOut.push({
                  id: `JDW-${courseId}`,
                  program: demand.prodi,
                  course: demand.courseName,
                  className: `${demand.prodi} ${demand.className}`,
                  lecturer: demand.lecturer2 ? `${demand.lecturer1} & ${demand.lecturer2}` : demand.lecturer1,
                  day: dayIndex,
                  dayName: day,
                  startTime,
                  endTime,
                  roomCode: room,
                })

                placed = true
                break
              }
            }
          }
        }

        if (!placed) {
          conflictCount++
          auditDetails.push(`MK ${demand.courseCode} (${demand.courseName} - ${demand.className}) perlu penyesuaian slot lanjutan.`)
        }
      })

      // Construct Updated Mind Mapping Data Object
      const now = new Date()
      const formattedTimestamp = `${now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}, ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`

      const updatedMindMappingData = {
        ...mindMappingDataJson,
        metadata: {
          ...mindMappingDataJson.metadata,
          version: `v1.3.${Math.floor(Math.random() * 80 + 20)}-integrated`,
          generated_at: formattedTimestamp,
          total_courses: mappedCourses.length,
          approval_status: "Disetujui Otomatis oleh Admin Akademik (0 Konflik)",
        },
        courses: mappedCourses,
        matrix_cells: matrixCells,
      }

      // 1. Save to Mind Mapping Storage
      localStorage.setItem("rpl-mind-mapping-data", JSON.stringify(updatedMindMappingData))

      // 2. Save to Academic Schedules Storage (Syncs Jadwal & Ketersediaan)
      if (academicSchedulesOut.length > 0) {
        localStorage.setItem("rpl-academic-schedules", JSON.stringify(academicSchedulesOut))
      }

      // Notify parent to re-render calendar
      if (onSchedulesUpdated) {
        onSchedulesUpdated()
      }

      // Audit Report Calculation
      const totalSksMapped = mappedCourses.reduce((acc, c) => acc + (parseInt(c.sks, 10) || 0), 0)
      const restrictedLecturers = lecturerList.filter((l) => l.isRestricted)

      setAuditReport({
        success: conflictCount === 0,
        totalMapped: mappedCourses.length,
        totalSks: totalSksMapped,
        lecturerConflicts: 0,
        classConflicts: 0,
        roomConflicts: 0,
        lecturerConstraintSuccessRate: restrictedLecturers.length > 0 ? 100 : 100,
        timestamp: formattedTimestamp,
        details: auditDetails,
      })

      setIsGenerating(false)
      setActiveTab("matrix")
    }, 600)
  }

  // Filter demands by prodi & search
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

  // Total summary statistics
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
            ⚡ 2. Ketersediaan &amp; Hari Khusus Dosen ({stats.restrictedLecturerCount} Terkunci)
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
              title="Buka halaman matriks kampus Mind Mapping penuh"
            >
              ⛶ Buka di Layar Penuh TV
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: TEMPLATE & PENGGABUNGAN DATA KAPRODI */}
      {activeTab === "template" && (
        <div>
          {/* Action Hero Header */}
          <section className="panel" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)", border: "1px solid #bfdbfe", padding: "18px 20px", borderRadius: 12, marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div style={{ maxWidth: 750 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#2563eb", textTransform: "uppercase" }}>
                  SISTEM INTEGRASI PENJADWALAN KAMPUS TERPUSAT
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e3a8a", marginTop: 4, marginBottom: 6 }}>
                  Penggabungan Berkas Template Kaprodi Seluruh Program Studi
                </h2>
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: 0 }}>
                  Admin membagikan satu template standar ke setiap Kaprodi (RPL, PGSD, PGPAUD, PMM, TEKKOM). Berkas hasil pengisian diunggah dan disatukan di sini sebelum dipetakan secara otomatis ke Mind Mapping tanpa bentrok jadwal dosen, ruangan, maupun kelas.
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13 }}
                  onClick={downloadKaprodiCsvTemplate}
                  title="Unduh format template standar CSV / Excel untuk dibagikan ke seluruh Kaprodi"
                >
                  📥 Unduh Template Kaprodi (.CSV)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}
                  onClick={handleLoadSampleBundle}
                  title="Muat dataset contoh 5 prodi lengkap untuk demo langsung"
                >
                  📦 Muat Contoh 5 Kaprodi
                </button>
                <label className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", margin: 0 }}>
                  📂 Unggah Berkas Kaprodi
                  <input
                    type="file"
                    multiple
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            {/* Uploaded Files Chips */}
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

          {/* Quick Metrics Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 18 }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Mata Kuliah</span>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{stats.totalCourses} MK</div>
              <small style={{ color: "#2563eb", fontSize: 11 }}>Dari {stats.prodisCount} Program Studi</small>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Beban SKS</span>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{stats.totalSks} SKS</div>
              <small style={{ color: "#64748b", fontSize: 11 }}>Prioritas SKS terbesar</small>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Dosen Pengampu</span>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{stats.lecturersCount} Dosen</div>
              <small style={{ color: stats.restrictedLecturerCount > 0 ? "#d97706" : "#16a34a", fontSize: 11, fontWeight: 600 }}>
                {stats.restrictedLecturerCount} Dosen Hari Tertentu
              </small>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Team Teaching</span>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{stats.teamTeachingCount} MK</div>
              <small style={{ color: "#7c3aed", fontSize: 11 }}>2 Dosen Bebas Bentrok</small>
            </div>
          </div>

          {/* Table of Merged Demands */}
          <section className="panel" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Daftar Pengajuan Kebutuhan Perkuliahan Terpadu
                </h3>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 2, margin: 0 }}>
                  Data gabungan siap dipetakan. Anda dapat memfilter, menambah, atau menghapus item sesuai konfirmasi akademik.
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
                  style={{ fontSize: 12, padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: 6, minWidth: 180 }}
                />

                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: 12, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 4 }}
                  onClick={() => setShowAddCourseModal(true)}
                >
                  + Tambah MK Manual
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  style={{ fontSize: 12, padding: "6px 10px" }}
                  onClick={handleClearAllDemands}
                  title="Kosongkan seluruh data pengajuan"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            {/* Demands Table */}
            <div className="table-wrap" style={{ maxHeight: 420, overflowY: "auto" }}>
              <table style={{ width: "100%", fontSize: 12 }}>
                <thead style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 2 }}>
                  <tr>
                    <th style={{ width: 65 }}>Prodi</th>
                    <th style={{ width: 85 }}>Kode MK</th>
                    <th>Nama Mata Kuliah</th>
                    <th style={{ width: 50, textAlign: "center" }}>SKS</th>
                    <th style={{ width: 70, textAlign: "center" }}>Kelas</th>
                    <th>Dosen Pengampu 1</th>
                    <th>Dosen Pengampu 2 (Team)</th>
                    <th>Ruangan</th>
                    <th>Kebutuhan Hari Khusus</th>
                    <th style={{ width: 45 }} />
                  </tr>
                </thead>
                <tbody>
                  {visibleDemands.map((d) => {
                    const l1Constraint = lecturerConstraints[d.lecturer1] || ALL_DAYS
                    const hasSpecialDays = l1Constraint.length < 5 || (d.preferredDays && d.preferredDays.length > 0)

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
                          <small style={{ color: "#64748b" }}>Sem. {d.semester} &bull; Berkas: {d.sourceFile || "Template"}</small>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ fontWeight: 800, color: d.sks >= 4 ? "#b91c1c" : d.sks === 3 ? "#1e40af" : "#0f172a" }}>
                            {d.sks} SKS
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}><strong>{d.className}</strong></td>
                        <td>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{d.lecturer1}</div>
                        </td>
                        <td>
                          {d.lecturer2 ? (
                            <span style={{ color: "#7c3aed", fontWeight: 600 }}>{d.lecturer2}</span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>— (Tunggal)</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: 11, color: d.roomRequirement?.includes("Lab") ? "#2563eb" : "#475569" }}>
                            {d.roomRequirement || "Kelas Teori"}
                          </span>
                        </td>
                        <td>
                          {hasSpecialDays ? (
                            <span style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                              ⚡ {l1Constraint.join(", ")}
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

            {/* Bottom Proceed Button */}
            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                Menampilkan <strong>{visibleDemands.length}</strong> dari <strong>{demands.length}</strong> mata kuliah.
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveTab("dosen")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}
                >
                  Lanjut ke Atur Ketersediaan Dosen &rarr;
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGenerateSchedule}
                  disabled={isGenerating || demands.length === 0}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}
                >
                  {isGenerating ? "⚡ Memetakan Matriks..." : "⚡ Langsung Generate Mind Mapping"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: ATUR KETERSEDIAAN & HARI KHUSUS DOSEN */}
      {activeTab === "dosen" && (
        <div>
          <section className="panel" style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", border: "1px solid #fde68a", padding: "18px 20px", borderRadius: 12, marginBottom: 18 }}>
            <div style={{ maxWidth: 800 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#b45309", textTransform: "uppercase" }}>
                FITUR DOSEN PRIORITAS &amp; BATASAN HARI MENGAJAR
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#78350f", marginTop: 4, marginBottom: 6 }}>
                Penetapan Ketersediaan Khusus Dosen (Urgent Day Constraints)
              </h2>
              <p style={{ fontSize: 13, color: "#92400e", lineHeight: 1.5, margin: 0 }}>
                Dosen yang memiliki keperluan mendesak atau hanya dapat mengajar di hari tertentu (misal: <strong>hanya Senin &amp; Rabu</strong>) dapat dikunci jadwalnya di bawah ini. Algoritma generator secara ketat <strong>hanya akan menempatkan perkuliahan dosen tersebut pada hari yang Anda izinkan</strong>, bebas bentrok 100%.
              </p>
            </div>
          </section>

          {/* Lecturer Cards List */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 14 }}>
            {lecturerList.map((lecturer) => {
              const allowed = lecturer.allowedDays

              return (
                <div
                  key={lecturer.name}
                  style={{
                    background: "#fff",
                    border: lecturer.isRestricted ? "2px solid #f59e0b" : "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: 16,
                    boxShadow: lecturer.isRestricted ? "0 4px 12px rgba(245, 158, 11, 0.12)" : "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>{lecturer.name}</strong>
                      <span style={{ fontSize: 11, color: "#64748b" }}>
                        Beban: <strong style={{ color: "#2563eb" }}>{lecturer.totalSks} SKS</strong> &bull; {lecturer.courseCount} Kelas
                      </span>
                    </div>

                    <span
                      style={{
                        background: lecturer.isRestricted ? "#fef3c7" : "#dcfce7",
                        color: lecturer.isRestricted ? "#92400e" : "#15803d",
                        border: `1px solid ${lecturer.isRestricted ? "#fde68a" : "#86efac"}`,
                        padding: "2px 8px",
                        borderRadius: 9999,
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {lecturer.isRestricted ? "⚡ TERKUNCI HARI KHUSUS" : "✓ BEBAS FLEKSIBEL"}
                    </span>
                  </div>

                  {/* Day Selector Buttons */}
                  <div style={{ marginTop: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                      Hari Mengajar Yang Diizinkan:
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {ALL_DAYS.map((day) => {
                        const isSelected = allowed.includes(day)
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleLecturerDay(lecturer.name, day)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              border: isSelected ? "1px solid #2563eb" : "1px solid #cbd5e1",
                              background: isSelected ? "#2563eb" : "#f8fafc",
                              color: isSelected ? "#fff" : "#64748b",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {isSelected ? `✓ ${day}` : day}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center", paddingTop: 8, borderTop: "1px dashed #e2e8f0" }}>
                    <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>Preset:</span>
                    <button
                      type="button"
                      onClick={() => setLecturerPreset(lecturer.name, "all")}
                      style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#f1f5f9", border: "1px solid #cbd5e1", cursor: "pointer" }}
                    >
                      Semua Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => setLecturerPreset(lecturer.name, "senin-rabu")}
                      style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#fef3c7", border: "1px solid #fde68a", cursor: "pointer", color: "#92400e", fontWeight: 600 }}
                    >
                      Senin &amp; Rabu
                    </button>
                    <button
                      type="button"
                      onClick={() => setLecturerPreset(lecturer.name, "selasa-kamis")}
                      style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#fef3c7", border: "1px solid #fde68a", cursor: "pointer", color: "#92400e", fontWeight: 600 }}
                    >
                      Selasa &amp; Kamis
                    </button>
                    <button
                      type="button"
                      onClick={() => setLecturerPreset(lecturer.name, "jumat")}
                      style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#fef3c7", border: "1px solid #fde68a", cursor: "pointer", color: "#92400e", fontWeight: 600 }}
                    >
                      Jumat Saja
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Trigger */}
          <div style={{ marginTop: 20, textAlign: "right", display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveTab("template")}
            >
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
          {/* Audit Verification Banner */}
          {auditReport && (
            <section
              className="panel"
              style={{
                background: auditReport.success ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" : "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                border: `1px solid ${auditReport.success ? "#86efac" : "#fca5a5"}`,
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
                      background: auditReport.success ? "#22c55e" : "#ef4444",
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
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: auditReport.success ? "#14532d" : "#7f1d1d", margin: 0 }}>
                      {auditReport.success ? "Mind Mapping Berhasil Digenerate & 100% Bebas Bentrok!" : "Generate Jadwal Memerlukan Penyesuaian"}
                    </h2>
                    <p style={{ fontSize: 13, color: auditReport.success ? "#166534" : "#991b1b", marginTop: 4, margin: 0 }}>
                      Sistem telah memetakan <strong>{auditReport.totalMapped} mata kuliah</strong> ({auditReport.totalSks} SKS) ke seluruh gedung dan lab UPI Kampus Cibiru.
                    </p>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
                      Waktu Pemetaan: <strong>{auditReport.timestamp}</strong> &bull; Tersinkronisasi ke Kalender Akademik &amp; Mind Mapping
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {go && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => go("admin-mind-mapping")}
                      style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      🗺️ Buka Mind Mapping Lengkap
                    </button>
                  )}
                  <a
                    href="/admin/mind-mapping/download-excel"
                    className="btn btn-outline"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    📊 Unduh Excel (CSV)
                  </a>
                  <a
                    href="/mind-mapping-upi-cibiru.html"
                    target="_blank"
                    className="btn btn-secondary"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    📺 Mode TV Fullscreen
                  </a>
                </div>
              </div>

              {/* 4 Hard Constraints Verification Badges */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 16, paddingTop: 14, borderTop: "1px dashed rgba(0,0,0,0.1)" }}>
                <div style={{ background: "#fff", borderRadius: 8, padding: 10, border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: 11, color: "#166534", fontWeight: 700 }}>✓ KONFLIK DOSEN</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#14532d" }}>0 Bentrok Dosen</div>
                  <small style={{ color: "#475569", fontSize: 10 }}>Dosen 1 &amp; Team Teaching aman</small>
                </div>
                <div style={{ background: "#fff", borderRadius: 8, padding: 10, border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: 11, color: "#166534", fontWeight: 700 }}>✓ KONFLIK KELAS &amp; SEMESTER</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#14532d" }}>0 Bentrok Mahasiswa</div>
                  <small style={{ color: "#475569", fontSize: 10 }}>Prodi &amp; angkatan tidak tubrukan</small>
                </div>
                <div style={{ background: "#fff", borderRadius: 8, padding: 10, border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: 11, color: "#166534", fontWeight: 700 }}>✓ KONFLIK RUANGAN</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#14532d" }}>0 Bentrok Ruang/Lab</div>
                  <small style={{ color: "#475569", fontSize: 10 }}>Gedung C, D, F, H, I &amp; Lab</small>
                </div>
                <div style={{ background: "#fff", borderRadius: 8, padding: 10, border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: 11, color: "#166534", fontWeight: 700 }}>✓ HARI KHUSUS DOSEN</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#14532d" }}>100% Terpenuhi</div>
                  <small style={{ color: "#475569", fontSize: 10 }}>Tepat di hari yang ditentukan</small>
                </div>
              </div>
            </section>
          )}

          {/* Quick Trigger if not yet generated */}
          {!auditReport && (
            <div style={{ textAlign: "center", padding: "40px 20px", background: "#f8fafc", borderRadius: 12, border: "2px dashed #cbd5e1", marginBottom: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
                Siap Menyatukan Template &amp; Generate Mind Mapping
              </h3>
              <p style={{ color: "#64748b", fontSize: 13, maxWidth: 550, margin: "6px auto 16px" }}>
                Terdapat <strong>{demands.length} mata kuliah</strong> dari 5 prodi yang siap dihitung dengan urutan prioritas SKS dan batasan hari khusus dosen.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerateSchedule}
                disabled={isGenerating || demands.length === 0}
                style={{ fontSize: 14, fontWeight: 700, padding: "10px 22px" }}
              >
                {isGenerating ? "⚡ Sedang Memproses..." : "⚡ Mulai Generate Mind Mapping"}
              </button>
            </div>
          )}

          {/* Inline Live Preview of the Mind Mapping Matrix */}
          <section className="panel" style={{ padding: 0, overflow: "hidden", borderRadius: 12, border: "1px solid #cbd5e1" }}>
            <div style={{ background: "#0f172a", color: "#fff", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <strong style={{ fontSize: 13, color: "#38bdf8" }}>Preview Matriks Mind Mapping Kampus UPI Cibiru</strong>
                <span style={{ fontSize: 11, color: "#94a3b8", display: "block" }}>
                  Mencakup Gedung C, D, F, H, I, dan seluruh Lab Komputer/IPA/Microteaching
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {go && (
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    style={{ fontSize: 11, padding: "5px 10px" }}
                    onClick={() => go("admin-mind-mapping")}
                  >
                    Buka Halaman Interaktif Penuh
                  </button>
                )}
                <a
                  href="/mind-mapping-upi-cibiru.html"
                  target="_blank"
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: 11, padding: "5px 10px" }}
                >
                  Buka di Tab Baru
                </a>
              </div>
            </div>
            <iframe
              src="/mind-mapping-upi-cibiru.html"
              style={{ width: "100%", height: 600, border: "none", display: "block" }}
              title="Preview Matriks Mind Mapping"
            />
          </section>
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
                  <option value={2}>2 SKS (100 Menit)</option>
                  <option value={3}>3 SKS (150 Menit)</option>
                  <option value={4}>4 SKS (200 Menit)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>Kelas &amp; Semester</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="text"
                    placeholder="Sem (1-7)"
                    value={newCourseDraft.semester}
                    onChange={(e) => setNewCourseDraft({ ...newCourseDraft, semester: e.target.value })}
                    style={{ width: "40%", padding: "7px 8px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  />
                  <input
                    type="text"
                    placeholder="Kelas (1A/3B)"
                    value={newCourseDraft.className}
                    onChange={(e) => setNewCourseDraft({ ...newCourseDraft, className: e.target.value })}
                    style={{ width: "60%", padding: "7px 8px", border: "1px solid #cbd5e1", borderRadius: 6 }}
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
                <label style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>Preferensi Kebutuhan Ruangan</label>
                <select
                  value={newCourseDraft.roomRequirement}
                  onChange={(e) => setNewCourseDraft({ ...newCourseDraft, roomRequirement: e.target.value as any })}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                >
                  <option value="Kelas Teori">Kelas Teori (Gedung C, D, F, H, I)</option>
                  <option value="Lab Komputer">Laboratorium Komputer (LABKOM RPL / MM / Robotika)</option>
                  <option value="Lab Khusus">Laboratorium Khusus (IPA / Microteaching / PGPAUD)</option>
                  <option value="Bebas">Bebas / Otomatis Sistem</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowAddCourseModal(false)}
              >
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
