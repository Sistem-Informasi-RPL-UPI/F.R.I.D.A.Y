import { useState, useMemo, useEffect } from "react"
import mindMappingData from "./mindMappingData.json"
import { KaprodiScheduleIntegrator } from "./KaprodiScheduleIntegrator"

type Props = {
  go: (page: string) => void
}

// Helper: Split combined class names (e.g. "3A & B", "3A, 3B") into individual classes ["3A", "3B"]
function splitCombinedClassString(semester: string, rawClassName: string): string[] {
  const raw = String(rawClassName || "").trim()
  if (!raw || !/[&/+,]|\bdan\b/i.test(raw)) return [raw || "A"]
  const parts = raw
    .split(/\s*(?:&|\/|\+|,|\bdan\b)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length <= 1) return [raw]
  const firstMatch = parts[0].match(/^(\d+)\s*(.+)$/)
  const semPrefix = String(semester || "").trim() || (firstMatch ? firstMatch[1] : "")
  return parts.map((part) => {
    const clean = part.toUpperCase()
    return semPrefix && !/^\d/.test(clean) ? `${semPrefix}${clean}` : clean
  })
}

// Sanitize mind mapping data so any legacy combined class (like "3A & B") is automatically split:
// the first class stays in its slot (e.g. "3A"), and the second class (e.g. "3B") is separated into Tempat Simpan Sementara (parked_courses)
function sanitizeCombinedClassesInData(rawData: any) {
  if (!rawData || !Array.isArray(rawData.courses)) return rawData
  const hasCombined = rawData.courses.some((c: any) =>
    /[&/+,]|\bdan\b/i.test(String(c.class_name || ""))
  )
  if (!hasCombined) return rawData

  const newCourses: any[] = []
  const newParked: any[] = [...(rawData.parked_courses || [])]
  const parkedIds = new Set(newParked.map((p: any) => p.id))

  rawData.courses.forEach((course: any) => {
    const splitCls = splitCombinedClassString(course.semester, course.class_name)
    if (splitCls.length <= 1) {
      newCourses.push(course)
      return
    }
    splitCls.forEach((clsName, idx) => {
      if (idx === 0) {
        const firstCourse = {
          ...course,
          class_name: clsName,
          display_label: `${course.course_code} - ${clsName}`,
        }
        newCourses.push(firstCourse)
        if (parkedIds.has(course.id)) {
          const pIdx = newParked.findIndex((p: any) => p.id === course.id)
          if (pIdx >= 0) {
            newParked[pIdx] = {
              ...newParked[pIdx],
              class_name: clsName,
              display_label: `${course.course_code} - ${clsName}`,
            }
          }
        }
      } else {
        const splitId = `${course.id}-CLS-${clsName}`
        const spanCount = Math.max(1, (course.end_row ?? 0) - (course.start_row ?? 0) + 1)
        const extraCourse = {
          ...course,
          id: splitId,
          class_name: clsName,
          display_label: `${course.course_code} - ${clsName}`,
        }
        newCourses.push(extraCourse)
        if (!parkedIds.has(splitId)) {
          newParked.push({
            ...extraCourse,
            original_day: course.day,
            original_room: course.room,
            original_time_display: course.time_display,
            original_start_idx: 0,
            span_count: spanCount,
          })
          parkedIds.add(splitId)
        }
      }
    })
  })

  const cleaned = {
    ...rawData,
    courses: newCourses,
    parked_courses: newParked,
    metadata: {
      ...rawData.metadata,
      total_courses: newCourses.length,
    },
  }
  try {
    localStorage.setItem("rpl-mind-mapping-data", JSON.stringify(cleaned))
  } catch {}
  return cleaned
}

export function AdminMindMapping({ go }: Props) {
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem("rpl-mind-mapping-data")
      if (stored) {
        const parsed = JSON.parse(stored)
        // Auto-upgrade if stored data is still on the old 30-room (C1/D1) template instead of the new 37-room (B2.002) template
        if (parsed?.rooms?.includes("B2.002") && parsed?.room_details?.length === 37) {
          return sanitizeCombinedClassesInData(parsed)
        }
        localStorage.removeItem("rpl-mind-mapping-data")
      }
      return sanitizeCombinedClassesInData(mindMappingData)
    } catch {
      return sanitizeCombinedClassesInData(mindMappingData)
    }
  })

  // Listen to cross-tab or component updates
  useEffect(() => {
    const reloadData = () => {
      try {
        const stored = localStorage.getItem("rpl-mind-mapping-data")
        if (stored) setData(sanitizeCombinedClassesInData(JSON.parse(stored)))
      } catch {}
    }
    window.addEventListener("storage", reloadData)
    return () => window.removeEventListener("storage", reloadData)
  }, [])

  const [viewTab, setViewTab] = useState<"matrix" | "integrator">("matrix")
  const [selectedBuilding, setSelectedBuilding] = useState("all")
  const [selectedDay, setSelectedDay] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [showGenModal, setShowGenModal] = useState(false)
  const [isApproved, setIsApproved] = useState(true)
  const [hasConflicts, setHasConflicts] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [genTimestamp, setGenTimestamp] = useState("23 November 2026, 19:50 WIB")
  const [version, setVersion] = useState("v1.2.0-approved")
  const [tvFullscreen, setTvFullscreen] = useState(false)

  // Drag & Drop states
  const [draggedCourseId, setDraggedCourseId] = useState<string | null>(null)
  const [isOverHoldingArea, setIsOverHoldingArea] = useState(false)
  const [dropTargetCell, setDropTargetCell] = useState<{
    day: string
    slotIdx: number
    room: string
    valid: boolean
    mode: "move" | "swap" | "swap-parked" | "invalid"
    reason?: string
  } | null>(null)
  const [strictConflictCheck, setStrictConflictCheck] = useState(true)
  const [undoStack, setUndoStack] = useState<any[]>([])
  const [dndFeedback, setDndFeedback] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null)

  // List of courses currently parked in the temporary holding area
  const parkedCourses: any[] = useMemo(() => {
    return data.parked_courses || []
  }, [data])

  // Time Settings state (SKS duration, Mon-Thu start & break, Friday start & Sholat Jumat break)
  const [showTimeSettingsModal, setShowTimeSettingsModal] = useState(false)
  const [timeSettings, setTimeSettings] = useState<{
    sksMinutes: number
    monThuStartTime: string
    monThuBreakMinutes: number
    friStartTime: string
    friBreakMode: "duration" | "fixed_afternoon"
    friBreakMinutes: number
    friAfternoonStartTime: string
  }>(() => {
    const saved = data?.metadata?.time_settings
    return (
      saved || {
        sksMinutes: 50,
        monThuStartTime: "07:00",
        monThuBreakMinutes: 60,
        friStartTime: "07:00",
        friBreakMode: "fixed_afternoon",
        friBreakMinutes: 110,
        friAfternoonStartTime: "13:00",
      }
    )
  })

  // Helper: Parse "HH:MM" or "HH.MM" into total minutes from midnight
  const parseTimeToMinutes = (timeStr: string): number => {
    const clean = (timeStr || "07:00").replace(".", ":")
    const [h, m] = clean.split(":").map((n) => parseInt(n, 10) || 0)
    return h * 60 + m
  }

  // Helper: Format total minutes from midnight to "HH.MM"
  const formatMinutesToDot = (totalMinutes: number): string => {
    const normalized = ((totalMinutes % 1440) + 1440) % 1440
    const h = Math.floor(normalized / 60)
    const m = normalized % 60
    return `${String(h).padStart(2, "0")}.${String(m).padStart(2, "0")}`
  }

  // Helper: Compute preview/new slots array for a given day based on settings
  const buildDaySlotsForSettings = (
    day: string,
    templateSlots: any[],
    cfg: typeof timeSettings
  ) => {
    const isFriday = day.toLowerCase() === "jumat"
    let cursor = parseTimeToMinutes(isFriday ? cfg.friStartTime : cfg.monThuStartTime)
    const sks = Math.max(15, Math.min(120, Number(cfg.sksMinutes) || 50))

    // Count consecutive break rows (Friday has break1 & break2 in default template)
    const breakIndices = templateSlots
      .map((s, idx) => (s.is_break ? idx : -1))
      .filter((idx) => idx !== -1)

    let breakProcessed = false
    return templateSlots.map((slot, idx) => {
      if (!slot.is_break) {
        const startStr = formatMinutesToDot(cursor)
        const endStr = formatMinutesToDot(cursor + sks)
        cursor += sks
        return {
          ...slot,
          time: `${startStr} - ${endStr}`,
        }
      } else {
        // Break slot
        if (!isFriday) {
          const breakDur = Math.max(15, Number(cfg.monThuBreakMinutes) || 60)
          const startStr = formatMinutesToDot(cursor)
          const endStr = formatMinutesToDot(cursor + breakDur)
          cursor += breakDur
          return {
            ...slot,
            time: `${startStr} - ${endStr}`,
          }
        } else {
          // Friday break (can be 1 or 2 break rows in template)
          const totalBreakRows = breakIndices.length || 1
          const firstBreakIdx = breakIndices[0] ?? idx
          if (!breakProcessed) {
            breakProcessed = true
          }
          let targetAfternoonMin = cursor + (Number(cfg.friBreakMinutes) || 110)
          if (cfg.friBreakMode === "fixed_afternoon") {
            const fixedMin = parseTimeToMinutes(cfg.friAfternoonStartTime || "13:00")
            if (fixedMin > cursor) {
              targetAfternoonMin = fixedMin
            }
          }
          // Distribute across break rows if there are multiple (e.g. break1 & break2)
          const remainingBreakRows = totalBreakRows - (idx - firstBreakIdx)
          const step = Math.max(15, Math.round((targetAfternoonMin - cursor) / Math.max(1, remainingBreakRows)))
          const nextCursor = idx === breakIndices[breakIndices.length - 1] ? targetAfternoonMin : cursor + step
          const startStr = formatMinutesToDot(cursor)
          const endStr = formatMinutesToDot(nextCursor)
          cursor = nextCursor
          return {
            ...slot,
            time: `${startStr} - ${endStr}`,
          }
        }
      }
    })
  }

  // Live preview of Mon-Thu and Friday times for the settings modal
  const timePreview = useMemo(() => {
    const monTemplate = data.days_slots["Senin"] || []
    const friTemplate = data.days_slots["Jumat"] || []
    const monSlots = buildDaySlotsForSettings("Senin", monTemplate, timeSettings)
    const friSlots = buildDaySlotsForSettings("Jumat", friTemplate, timeSettings)
    const monBreak = monSlots.find((s) => s.is_break)
    const friBreaks = friSlots.filter((s) => s.is_break)
    const friBreakText =
      friBreaks.length > 0
        ? `${friBreaks[0].time.split(" - ")[0]} - ${friBreaks[friBreaks.length - 1].time.split(" - ")[1]}`
        : "11.10 - 13.00"
    return {
      monFirst: monSlots[0]?.time || "-",
      monBreak: monBreak?.time || "-",
      monLast: monSlots[monSlots.length - 1]?.time || "-",
      friFirst: friSlots[0]?.time || "-",
      friBreak: friBreakText,
      friLast: friSlots[friSlots.length - 1]?.time || "-",
      monSlots,
      friSlots,
    }
  }, [data.days_slots, timeSettings])

  // Apply Time Settings and recalculate all matrix cells & course times
  const handleApplyTimeSettings = () => {
    const sks = Math.max(15, Math.min(120, Number(timeSettings.sksMinutes) || 50))
    const normalizedSettings = { ...timeSettings, sksMinutes: sks }

    // 1. Capture current slot position (startSlotIdx, spanCount, isParked) of every course before changing slot time labels
    const coursePositions = new Map<
      string,
      { startSlotIdx: number; spanCount: number; isParked: boolean }
    >()
    data.courses.forEach((course: any) => {
      coursePositions.set(course.id, getCourseSlotPosition(course, data))
    })

    // 2. Build new days_slots for all days
    const newDaysSlots: Record<string, any[]> = {}
    Object.keys(data.days_slots).forEach((day) => {
      newDaysSlots[day] = buildDaySlotsForSettings(
        day,
        data.days_slots[day as keyof typeof data.days_slots] || [],
        normalizedSettings
      )
    })

    // 3. Rebuild matrix_cells and update course time_display / start_time / end_time
    const newMatrixCells: Record<string, string> = {}
    const updatedCourses = data.courses.map((course: any) => {
      const pos = coursePositions.get(course.id)
      const daySlots = newDaysSlots[course.day] || []
      if (!pos || pos.startSlotIdx < 0 || pos.startSlotIdx >= daySlots.length) {
        return course
      }
      const spanSlots = daySlots.slice(pos.startSlotIdx, pos.startSlotIdx + pos.spanCount)
      if (spanSlots.length === 0) return course

      const newStart = spanSlots[0].time.split(" - ")[0]
      const newEnd = spanSlots[spanSlots.length - 1].time.split(" - ")[1]

      if (!pos.isParked) {
        spanSlots.forEach((s: any) => {
          if (!s.is_break) {
            newMatrixCells[`${course.day}|${s.time}|${course.room}`] = course.id
          }
        })
      }

      return {
        ...course,
        start_time: newStart,
        end_time: newEnd,
        time_display: `${newStart} - ${newEnd}`,
      }
    })

    // Update parked courses time display as well
    const updatedParked = (data.parked_courses || []).map((p: any) => {
      const daySlots = newDaysSlots[p.day] || []
      const idx = p.original_start_idx ?? 0
      const span = p.span_count || Math.max(1, (p.end_row ?? 0) - (p.start_row ?? 0) + 1)
      const spanSlots = daySlots.slice(idx, idx + span)
      if (spanSlots.length === 0) return p
      const newStart = spanSlots[0].time.split(" - ")[0]
      const newEnd = spanSlots[spanSlots.length - 1].time.split(" - ")[1]
      return {
        ...p,
        start_time: newStart,
        end_time: newEnd,
        time_display: `${newStart} - ${newEnd}`,
        original_time_display: `${newStart} - ${newEnd}`,
      }
    })

    // Save undo state
    setUndoStack((prev) => [...prev.slice(-19), data])

    const updatedData = {
      ...data,
      metadata: {
        ...data.metadata,
        time_settings: normalizedSettings,
      },
      days_slots: newDaysSlots,
      courses: updatedCourses,
      matrix_cells: newMatrixCells,
      parked_courses: updatedParked,
    }

    setTimeSettings(normalizedSettings)
    setData(updatedData)
    localStorage.setItem("rpl-mind-mapping-data", JSON.stringify(updatedData))
    setShowTimeSettingsModal(false)
    setDndFeedback({
      type: "success",
      message: `⏱️ Pengaturan Waktu berhasil diterapkan: 1 SKS = ${sks} menit • Senin–Kamis mulai ${normalizedSettings.monThuStartTime.replace(":", ".")} • Jumat mulai ${normalizedSettings.friStartTime.replace(":", ".")} (Sholat Jumat ${timePreview.friBreak}).`,
    })
  }

  // Trigger Generate Mind Mapping
  const handleGenerate = () => {
    if (!isApproved || hasConflicts) {
      setShowGenModal(true)
      return
    }
    setIsGenerating(true)
    setTimeout(() => {
      const now = new Date()
      const formattedDate = `${now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}, ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`
      setGenTimestamp(formattedDate)
      setVersion(`v1.2.${Math.floor(Math.random() * 90 + 10)}-approved`)
      setIsGenerating(false)
      setShowGenModal(true)
      // Auto-trigger download of self-contained HTML
      downloadOfflineHtml()
    }, 700)
  }

  // Trigger download of standalone offline HTML file
  const downloadOfflineHtml = () => {
    const link = document.createElement("a")
    link.href = "/mind-mapping-upi-cibiru.html"
    link.download = `MIND_MAPPING_JADWAL_UPI_CIBIRU_${data.metadata.academic_year.replace("/", "-")}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Trigger download of Excel CSV format
  const downloadExcelCsv = () => {
    const link = document.createElement("a")
    link.href = "/downloads/MAPPING_JADWAL_UPI_CIBIRU_2022-2023.csv"
    link.download = `MAPPING_JADWAL_UPI_CIBIRU_${data.metadata.academic_year.replace("/", "-")}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Toggle TV Fullscreen
  const toggleTvMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setTvFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setTvFullscreen(false)
    }
  }

  // Get active rooms list based on building tab
  const activeRooms = useMemo(() => {
    const b = data.buildings.find((item: any) => item.id === selectedBuilding)
    return b ? b.rooms : data.rooms
  }, [data, selectedBuilding])

  // Helper to determine prodi card style
  const getProdiCardClass = (prodi: string) => {
    const p = (prodi || "").toLowerCase()
    if (p.includes("pgsd")) return "card-pgsd"
    if (p.includes("pgpaud")) return "card-pgpaud"
    if (p.includes("rpl")) return "card-rpl"
    if (p.includes("multi") || p.includes("pmm")) return "card-pmm"
    if (p.includes("tekom") || p.includes("komputer")) return "card-tekom"
    return "card-umum"
  }

  // Helper to get building name for room
  const getRoomBuilding = (roomName: string) => {
    const detail = (data.room_details || []).find((r: any) => r.code === roomName)
    if (detail) return detail.building
    for (const b of data.buildings) {
      if (b.id !== "all" && b.rooms.includes(roomName)) return b.name
    }
    return "Gedung Kampus"
  }

  // Helper to get room metadata (number 1..37 and label like "Ruang Kelas", "LABKOM RPL", etc.)
  const getRoomMeta = (roomCode: string, fallbackIdx: number) => {
    const detail = (data.room_details || []).find((r: any) => r.code === roomCode)
    if (detail) {
      return {
        number: detail.number,
        code: detail.code,
        label: detail.label,
        isClassroom: detail.is_classroom,
      }
    }
    const globalIdx = (data.rooms || []).indexOf(roomCode)
    return {
      number: globalIdx >= 0 ? globalIdx + 1 : fallbackIdx + 1,
      code: roomCode,
      label: globalIdx >= 0 && globalIdx < 22 ? "Ruang Kelas" : roomCode,
      isClassroom: globalIdx >= 0 && globalIdx < 22,
    }
  }

  // Group active rooms by building for top header row
  const buildingGroups = useMemo(() => {
    const groups: Array<{ name: string; count: number }> = []
    let current: { name: string; count: number } | null = null
    activeRooms.forEach((room: string) => {
      const bName = getRoomBuilding(room)
      if (!current || current.name !== bName) {
        current = { name: bName, count: 1 }
        groups.push(current)
      } else {
        current.count++
      }
    })
    return groups
  }, [activeRooms, data])

  const daysToRender = selectedDay === "all" ? data.metadata.days : [selectedDay]

  // Helper: Find start slot index and span count of a course on its day
  const getCourseSlotPosition = (course: any, currentData = data) => {
    const isParked = (currentData.parked_courses || []).some((p: any) => p.id === course.id)
    const daySlots: any[] = currentData.days_slots[course.day as keyof typeof currentData.days_slots] || []
    const spanCount = Math.max(1, (course.end_row ?? 0) - (course.start_row ?? 0) + 1)
    if (isParked) {
      return { startSlotIdx: -1, spanCount, isParked: true }
    }
    let startSlotIdx = daySlots.findIndex(
      (s: any) => !s.is_break && currentData.matrix_cells[`${course.day}|${s.time}|${course.room}`] === course.id
    )
    if (startSlotIdx === -1) {
      startSlotIdx = daySlots.findIndex((s: any) => !s.is_break && s.time.startsWith(course.start_time))
    }
    return { startSlotIdx, spanCount, isParked: false }
  }

  // Helper: Check if placing `course` at (targetDay, targetStartIdx, targetRoom) has conflicts
  const evaluateDropPlacement = (
    courseId: string,
    targetDay: string,
    targetSlotIdx: number,
    targetRoom: string
  ): {
    valid: boolean
    mode: "move" | "swap" | "swap-parked" | "invalid"
    swapWithCourse?: any
    draggedStartIdx?: number
    targetStartIdx?: number
    reason?: string
  } => {
    const course =
      data.courses.find((c: any) => c.id === courseId) ||
      (data.parked_courses || []).find((c: any) => c.id === courseId)
    if (!course) return { valid: false, mode: "invalid", reason: "Data mata kuliah tidak ditemukan." }

    const { startSlotIdx: draggedStartIdx, spanCount: draggedSpan, isParked } = getCourseSlotPosition(course)
    const targetDaySlots: any[] = data.days_slots[targetDay as keyof typeof data.days_slots] || []
    const clickedSlot = targetDaySlots[targetSlotIdx]
    if (!clickedSlot || clickedSlot.is_break) {
      return { valid: false, mode: "invalid", reason: "Tidak dapat menaruh jadwal pada jam istirahat." }
    }

    // Check if the target cell is occupied by another course
    const targetCellKey = `${targetDay}|${clickedSlot.time}|${targetRoom}`
    const occupyingCourseId = data.matrix_cells[targetCellKey as keyof typeof data.matrix_cells]

    if (!isParked && occupyingCourseId === course.id && targetDay === course.day && targetRoom === course.room && targetSlotIdx === draggedStartIdx) {
      return { valid: false, mode: "invalid", reason: "Posisi jadwal sama dengan posisi semula." }
    }

    // CASE 1: Dropping directly onto another course -> SWAP (or SWAP-PARKED if dragged from holding area)
    if (occupyingCourseId && occupyingCourseId !== course.id) {
      const targetCourse = data.courses.find((c: any) => c.id === occupyingCourseId)
      if (!targetCourse) return { valid: false, mode: "invalid", reason: "Jadwal tujuan tidak valid." }

      const { startSlotIdx: targetStartIdx, spanCount: targetSpan } = getCourseSlotPosition(targetCourse)
      if (targetStartIdx < 0) {
        return { valid: false, mode: "invalid", reason: "Slot tujuan tidak ditemukan." }
      }

      // Verify draggedCourse fits at targetStartIdx in (targetDay, targetRoom)
      if (targetStartIdx + draggedSpan > targetDaySlots.length) {
        return { valid: false, mode: "invalid", reason: `Durasi ${draggedSpan} slot melebihi batas jam hari ${targetDay}.` }
      }
      for (let i = 0; i < draggedSpan; i++) {
        const s = targetDaySlots[targetStartIdx + i]
        if (!s || s.is_break) {
          return { valid: false, mode: "invalid", reason: "Tukar jadwal gagal karena menabrak jam istirahat." }
        }
        const occ = data.matrix_cells[`${targetDay}|${s.time}|${targetRoom}`]
        if (occ && occ !== targetCourse.id && occ !== course.id) {
          return { valid: false, mode: "invalid", reason: "Slot tujuan bertabrakan dengan mata kuliah ketiga." }
        }
      }

      // If dragged from Holding Area onto an occupied matrix cell -> replace & send targetCourse to Holding Area
      if (isParked) {
        if (strictConflictCheck) {
          const conflict1 = checkLecturerOrClassConflict(
            course,
            targetDay,
            targetDaySlots.slice(targetStartIdx, targetStartIdx + draggedSpan),
            [course.id, targetCourse.id]
          )
          if (conflict1) return { valid: false, mode: "invalid", reason: conflict1 }
        }
        return {
          valid: true,
          mode: "swap-parked",
          swapWithCourse: targetCourse,
          targetStartIdx,
        }
      }

      const sourceDaySlots: any[] = data.days_slots[course.day as keyof typeof data.days_slots] || []
      if (draggedStartIdx < 0) {
        return { valid: false, mode: "invalid", reason: "Slot asal tidak ditemukan." }
      }

      // Verify targetCourse fits at draggedStartIdx in (course.day, course.room)
      if (draggedStartIdx + targetSpan > sourceDaySlots.length) {
        return { valid: false, mode: "invalid", reason: `Durasi ${targetSpan} slot melebihi batas jam hari ${course.day}.` }
      }
      for (let i = 0; i < targetSpan; i++) {
        const s = sourceDaySlots[draggedStartIdx + i]
        if (!s || s.is_break) {
          return { valid: false, mode: "invalid", reason: "Tukar jadwal gagal karena menabrak jam istirahat di slot asal." }
        }
        const occ = data.matrix_cells[`${course.day}|${s.time}|${course.room}`]
        if (occ && occ !== course.id && occ !== targetCourse.id) {
          return { valid: false, mode: "invalid", reason: "Slot asal bertabrakan dengan mata kuliah ketiga." }
        }
      }

      // Optional strict lecturer/class conflict check on swap
      if (strictConflictCheck) {
        const conflict1 = checkLecturerOrClassConflict(
          course,
          targetDay,
          targetDaySlots.slice(targetStartIdx, targetStartIdx + draggedSpan),
          [course.id, targetCourse.id]
        )
        if (conflict1) return { valid: false, mode: "invalid", reason: conflict1 }

        const conflict2 = checkLecturerOrClassConflict(
          targetCourse,
          course.day,
          sourceDaySlots.slice(draggedStartIdx, draggedStartIdx + targetSpan),
          [course.id, targetCourse.id]
        )
        if (conflict2) return { valid: false, mode: "invalid", reason: conflict2 }
      }

      return {
        valid: true,
        mode: "swap",
        swapWithCourse: targetCourse,
        draggedStartIdx,
        targetStartIdx,
      }
    }

    // CASE 2: Moving to an empty cell (or shifting within the same column)
    if (targetSlotIdx + draggedSpan > targetDaySlots.length) {
      return { valid: false, mode: "invalid", reason: `Durasi ${draggedSpan} slot melebihi jam terakhir hari ${targetDay}.` }
    }

    for (let i = 0; i < draggedSpan; i++) {
      const s = targetDaySlots[targetSlotIdx + i]
      if (!s || s.is_break) {
        return { valid: false, mode: "invalid", reason: "Tidak dapat melintasi baris jam istirahat." }
      }
      const occ = data.matrix_cells[`${targetDay}|${s.time}|${targetRoom}`]
      if (occ && occ !== course.id) {
        const blockingCourse = data.courses.find((c: any) => c.id === occ)
        return {
          valid: false,
          mode: "invalid",
          reason: `Slot ${s.time} di ruang ${targetRoom} sudah terisi oleh ${blockingCourse?.display_label || occ}. (Drag tepat ke kartu mata kuliah jika ingin menukar posisi)`,
        }
      }
    }

    if (strictConflictCheck) {
      const conflict = checkLecturerOrClassConflict(
        course,
        targetDay,
        targetDaySlots.slice(targetSlotIdx, targetSlotIdx + draggedSpan),
        [course.id]
      )
      if (conflict) return { valid: false, mode: "invalid", reason: conflict }
    }

    return {
      valid: true,
      mode: "move",
      draggedStartIdx,
      targetStartIdx: targetSlotIdx,
    }
  }

  // Helper: Normalize student cohort (Prodi + Semester + Kelas, e.g. PGSD + Sem 3 + Kelas B => PGSD 3B)
  const getStudentCohort = (course: any) => {
    const prodi = String(course.prodi || "").trim()
    const prodiUpper = prodi.toUpperCase()
    const rawSem = String(course.semester || "").trim()
    const rawCls = String(course.class_name || "").trim().toUpperCase()

    // Extract semester number if embedded in class_name (e.g., "3B" -> sem "3", subClass "B")
    const match = rawCls.match(/^(\d+)\s*(.+)$/)
    const semester = rawSem || (match ? match[1] : "")
    const subClass = match && (!rawSem || match[1] === rawSem) ? match[2].trim() : rawCls
    const combinedClass = semester && !rawCls.startsWith(semester) ? `${semester}${subClass}` : rawCls

    return {
      key: `${prodiUpper}|SEM-${semester}|CLS-${combinedClass}`,
      semester,
      subClass,
      combinedClass,
      label: `${prodi} ${combinedClass}${semester ? ` (Semester ${semester})` : ""}`,
    }
  }

  // Helper: Check if lecturer or student class cohort has another course at the target day & slots
  const checkLecturerOrClassConflict = (
    course: any,
    targetDay: string,
    targetSlots: any[],
    ignoreCourseIds: string[]
  ): string | null => {
    const targetTimes = new Set(targetSlots.map((s: any) => s.time))
    const lecturers = [course.lecturer_1, course.lecturer_2].filter((l) => l && l.trim() && l !== "-")
    const courseCohort = getStudentCohort(course)

    for (const room of data.rooms) {
      for (const time of targetTimes) {
        const occId = data.matrix_cells[`${targetDay}|${time}|${room}`]
        if (!occId || ignoreCourseIds.includes(occId)) continue
        const other = data.courses.find((c: any) => c.id === occId)
        if (!other) continue

        // Lecturer conflict
        for (const lect of lecturers) {
          if (other.lecturer_1 === lect || other.lecturer_2 === lect) {
            return `Bentrok Dosen: ${lect} sedang mengajar ${other.display_label} di ruang ${other.room} (${targetDay}, ${time}).`
          }
        }

        // Student class + semester cohort conflict (e.g. PGSD 3B cannot clash with PGSD 3B, while PGSD 1B vs PGSD 3B is allowed)
        const otherCohort = getStudentCohort(other)
        if (
          course.prodi &&
          course.class_name &&
          courseCohort.key === otherCohort.key
        ) {
          return `Bentrok Kelas & Semester: Kelas ${courseCohort.label} sudah ada kuliah ${other.display_label} di ruang ${other.room} (${targetDay}, ${time}).`
        }
      }
    }
    return null
  }

  // Drop a course into the temporary Holding / Parking Area
  const handleDropToHoldingArea = () => {
    setIsOverHoldingArea(false)
    setDropTargetCell(null)
    if (!draggedCourseId) return

    const alreadyParked = parkedCourses.some((p: any) => p.id === draggedCourseId)
    if (alreadyParked) {
      setDraggedCourseId(null)
      return
    }

    const draggedCourse = data.courses.find((c: any) => c.id === draggedCourseId)
    setDraggedCourseId(null)
    if (!draggedCourse) return

    const { startSlotIdx, spanCount } = getCourseSlotPosition(draggedCourse)

    // Save undo snapshot
    setUndoStack((prev) => [...prev.slice(-19), data])

    // Remove its cells from matrix_cells so its matrix slot becomes empty
    const newMatrixCells: Record<string, string> = { ...data.matrix_cells }
    Object.keys(newMatrixCells).forEach((k) => {
      if (newMatrixCells[k] === draggedCourse.id) {
        delete newMatrixCells[k]
      }
    })

    const parkedItem = {
      ...draggedCourse,
      original_day: draggedCourse.day,
      original_room: draggedCourse.room,
      original_time_display: draggedCourse.time_display,
      original_start_idx: startSlotIdx,
      span_count: spanCount,
    }

    const updatedData = {
      ...data,
      matrix_cells: newMatrixCells,
      parked_courses: [...parkedCourses, parkedItem],
    }

    setData(updatedData)
    localStorage.setItem("rpl-mind-mapping-data", JSON.stringify(updatedData))
    setDndFeedback({
      type: "info",
      message: `📥 Jadwal ${draggedCourse.display_label} (${draggedCourse.course_name}) disimpan sementara di Tempat Penampungan. Slot ${draggedCourse.room} (${draggedCourse.day}, ${draggedCourse.time_display}) kini kosong!`,
    })
  }

  // Return a parked course back to its original slot if available
  const handleRestoreParkedCourse = (parkedItem: any) => {
    const targetDay = parkedItem.original_day || parkedItem.day
    const targetRoom = parkedItem.original_room || parkedItem.room
    const daySlots: any[] = data.days_slots[targetDay as keyof typeof data.days_slots] || []
    let startIdx = parkedItem.original_start_idx
    if (startIdx === undefined || startIdx < 0) {
      startIdx = daySlots.findIndex((s: any) => !s.is_break && s.time.startsWith(parkedItem.start_time))
    }
    if (startIdx < 0) {
      setDndFeedback({
        type: "error",
        message: `Slot asal untuk ${parkedItem.display_label} tidak ditemukan. Silakan drag manual ke tabel matriks.`,
      })
      return
    }

    const evalRes = evaluateDropPlacement(parkedItem.id, targetDay, startIdx, targetRoom)
    if (!evalRes.valid || evalRes.mode !== "move") {
      setDndFeedback({
        type: "error",
        message: `Tidak dapat mengembalikan ke slot asal (${targetRoom}, ${targetDay}): ${evalRes.reason || "Slot asal sudah terisi jadwal lain. Silakan tarik ke slot kosong lain."}`,
      })
      return
    }

    // Perform move back
    const spanCount = parkedItem.span_count || Math.max(1, (parkedItem.end_row ?? 0) - (parkedItem.start_row ?? 0) + 1)
    const newSlots = daySlots.slice(startIdx, startIdx + spanCount)
    const newMatrixCells: Record<string, string> = { ...data.matrix_cells }
    newSlots.forEach((s: any) => {
      newMatrixCells[`${targetDay}|${s.time}|${targetRoom}`] = parkedItem.id
    })

    setUndoStack((prev) => [...prev.slice(-19), data])
    const updatedData = {
      ...data,
      matrix_cells: newMatrixCells,
      parked_courses: parkedCourses.filter((p: any) => p.id !== parkedItem.id),
    }
    setData(updatedData)
    localStorage.setItem("rpl-mind-mapping-data", JSON.stringify(updatedData))
    setDndFeedback({
      type: "success",
      message: `↩ Jadwal ${parkedItem.display_label} dikembalikan ke slot asalnya di Ruang ${targetRoom} (${targetDay}, ${parkedItem.time_display}).`,
    })
  }

  // Perform the move or swap on drop
  const handleCellDrop = (targetDay: string, targetSlotIdx: number, targetRoom: string) => {
    if (!draggedCourseId) return
    const result = evaluateDropPlacement(draggedCourseId, targetDay, targetSlotIdx, targetRoom)
    const currentDraggedId = draggedCourseId
    setDraggedCourseId(null)
    setDropTargetCell(null)
    setIsOverHoldingArea(false)

    if (!result.valid) {
      setDndFeedback({
        type: "error",
        message: result.reason || "Tidak dapat memindahkan jadwal ke slot tersebut.",
      })
      return
    }

    const draggedCourse =
      data.courses.find((c: any) => c.id === currentDraggedId) ||
      parkedCourses.find((c: any) => c.id === currentDraggedId)
    if (!draggedCourse) return

    // Save current state to undo stack
    setUndoStack((prev) => [...prev.slice(-19), data])

    const newMatrixCells: Record<string, string> = { ...data.matrix_cells }
    const removeCourseCells = (cId: string) => {
      Object.keys(newMatrixCells).forEach((k) => {
        if (newMatrixCells[k] === cId) {
          delete newMatrixCells[k]
        }
      })
    }

    if (result.mode === "move" && result.targetStartIdx !== undefined) {
      const { spanCount } = getCourseSlotPosition(draggedCourse)
      const targetDaySlots: any[] = data.days_slots[targetDay as keyof typeof data.days_slots] || []
      const newSlots = targetDaySlots.slice(result.targetStartIdx, result.targetStartIdx + spanCount)

      removeCourseCells(draggedCourse.id)
      newSlots.forEach((s: any) => {
        newMatrixCells[`${targetDay}|${s.time}|${targetRoom}`] = draggedCourse.id
      })

      const startTime = newSlots[0].time.split(" - ")[0]
      const endTime = newSlots[newSlots.length - 1].time.split(" - ")[1]
      const newBuilding = getRoomBuilding(targetRoom)

      const updatedCourses = data.courses.map((c: any) =>
        c.id === draggedCourse.id
          ? {
              ...c,
              day: targetDay,
              room: targetRoom,
              building: newBuilding,
              start_row: result.targetStartIdx! + 6,
              end_row: result.targetStartIdx! + 6 + spanCount - 1,
              start_time: startTime,
              end_time: endTime,
              time_display: `${startTime} - ${endTime}`,
            }
          : c
      )

      const updatedParked = parkedCourses.filter((p: any) => p.id !== draggedCourse.id)

      const updatedData = {
        ...data,
        courses: updatedCourses,
        matrix_cells: newMatrixCells,
        parked_courses: updatedParked,
      }
      setData(updatedData)
      localStorage.setItem("rpl-mind-mapping-data", JSON.stringify(updatedData))
      setDndFeedback({
        type: "success",
        message: `✓ Jadwal ${draggedCourse.display_label} (${draggedCourse.course_name}) berhasil ditempatkan di Ruang ${targetRoom} • ${targetDay}, ${startTime} - ${endTime}.`,
      })
    } else if (
      result.mode === "swap-parked" &&
      result.swapWithCourse &&
      result.targetStartIdx !== undefined
    ) {
      const targetCourse = result.swapWithCourse
      const { spanCount: draggedSpan } = getCourseSlotPosition(draggedCourse)
      const { startSlotIdx: targetOrigIdx, spanCount: targetSpan } = getCourseSlotPosition(targetCourse)
      const targetDaySlots: any[] = data.days_slots[targetDay as keyof typeof data.days_slots] || []
      const newDraggedSlots = targetDaySlots.slice(result.targetStartIdx, result.targetStartIdx + draggedSpan)

      removeCourseCells(targetCourse.id)
      removeCourseCells(draggedCourse.id)

      newDraggedSlots.forEach((s: any) => {
        newMatrixCells[`${targetDay}|${s.time}|${targetRoom}`] = draggedCourse.id
      })

      const dStart = newDraggedSlots[0].time.split(" - ")[0]
      const dEnd = newDraggedSlots[newDraggedSlots.length - 1].time.split(" - ")[1]

      const updatedCourses = data.courses.map((c: any) =>
        c.id === draggedCourse.id
          ? {
              ...c,
              day: targetDay,
              room: targetRoom,
              building: getRoomBuilding(targetRoom),
              start_row: result.targetStartIdx! + 6,
              end_row: result.targetStartIdx! + 6 + draggedSpan - 1,
              start_time: dStart,
              end_time: dEnd,
              time_display: `${dStart} - ${dEnd}`,
            }
          : c
      )

      const newlyParkedTarget = {
        ...targetCourse,
        original_day: targetCourse.day,
        original_room: targetCourse.room,
        original_time_display: targetCourse.time_display,
        original_start_idx: targetOrigIdx,
        span_count: targetSpan,
      }

      const updatedParked = [
        ...parkedCourses.filter((p: any) => p.id !== draggedCourse.id),
        newlyParkedTarget,
      ]

      const updatedData = {
        ...data,
        courses: updatedCourses,
        matrix_cells: newMatrixCells,
        parked_courses: updatedParked,
      }
      setData(updatedData)
      localStorage.setItem("rpl-mind-mapping-data", JSON.stringify(updatedData))
      setDndFeedback({
        type: "success",
        message: `⇄ Jadwal ${draggedCourse.display_label} dimasukkan ke Ruang ${targetRoom} (${targetDay}, ${dStart}–${dEnd}), dan ${targetCourse.display_label} dipindahkan ke Tempat Simpan Sementara.`,
      })
    } else if (
      result.mode === "swap" &&
      result.swapWithCourse &&
      result.draggedStartIdx !== undefined &&
      result.targetStartIdx !== undefined
    ) {
      const targetCourse = result.swapWithCourse
      const { spanCount: draggedSpan } = getCourseSlotPosition(draggedCourse)
      const { spanCount: targetSpan } = getCourseSlotPosition(targetCourse)

      const sourceDay = draggedCourse.day
      const sourceRoom = draggedCourse.room
      const sourceDaySlots: any[] = data.days_slots[sourceDay as keyof typeof data.days_slots] || []
      const targetDaySlots: any[] = data.days_slots[targetDay as keyof typeof data.days_slots] || []

      const newDraggedSlots = targetDaySlots.slice(result.targetStartIdx, result.targetStartIdx + draggedSpan)
      const newTargetSlots = sourceDaySlots.slice(result.draggedStartIdx, result.draggedStartIdx + targetSpan)

      removeCourseCells(draggedCourse.id)
      removeCourseCells(targetCourse.id)

      newDraggedSlots.forEach((s: any) => {
        newMatrixCells[`${targetDay}|${s.time}|${targetRoom}`] = draggedCourse.id
      })
      newTargetSlots.forEach((s: any) => {
        newMatrixCells[`${sourceDay}|${s.time}|${sourceRoom}`] = targetCourse.id
      })

      const dStart = newDraggedSlots[0].time.split(" - ")[0]
      const dEnd = newDraggedSlots[newDraggedSlots.length - 1].time.split(" - ")[1]
      const tStart = newTargetSlots[0].time.split(" - ")[0]
      const tEnd = newTargetSlots[newTargetSlots.length - 1].time.split(" - ")[1]

      const updatedCourses = data.courses.map((c: any) => {
        if (c.id === draggedCourse.id) {
          return {
            ...c,
            day: targetDay,
            room: targetRoom,
            building: getRoomBuilding(targetRoom),
            start_row: result.targetStartIdx! + 6,
            end_row: result.targetStartIdx! + 6 + draggedSpan - 1,
            start_time: dStart,
            end_time: dEnd,
            time_display: `${dStart} - ${dEnd}`,
          }
        }
        if (c.id === targetCourse.id) {
          return {
            ...c,
            day: sourceDay,
            room: sourceRoom,
            building: getRoomBuilding(sourceRoom),
            start_row: result.draggedStartIdx! + 6,
            end_row: result.draggedStartIdx! + 6 + targetSpan - 1,
            start_time: tStart,
            end_time: tEnd,
            time_display: `${tStart} - ${tEnd}`,
          }
        }
        return c
      })

      const updatedData = {
        ...data,
        courses: updatedCourses,
        matrix_cells: newMatrixCells,
      }
      setData(updatedData)
      localStorage.setItem("rpl-mind-mapping-data", JSON.stringify(updatedData))
      setDndFeedback({
        type: "success",
        message: `⇄ Berhasil menukar posisi jadwal: ${draggedCourse.display_label} (ke ${targetRoom}, ${targetDay} ${dStart}–${dEnd}) ↔ ${targetCourse.display_label} (ke ${sourceRoom}, ${sourceDay} ${tStart}–${tEnd}).`,
      })
    }
  }

  const handleUndo = () => {
    if (undoStack.length === 0) return
    const previous = undoStack[undoStack.length - 1]
    setUndoStack((prev) => prev.slice(0, -1))
    setData(previous)
    localStorage.setItem("rpl-mind-mapping-data", JSON.stringify(previous))
    setDndFeedback({
      type: "info",
      message: "↩ Perubahan jadwal terakhir telah dibatalkan (Undo).",
    })
  }

  const handleResetMatrix = () => {
    setUndoStack((prev) => [...prev.slice(-19), data])
    setData(mindMappingData)
    localStorage.removeItem("rpl-mind-mapping-data")
    setDndFeedback({
      type: "info",
      message: "↺ Matriks jadwal telah dikembalikan ke data awal.",
    })
  }

  return (
    <div className="page">
      {/* Top Tab Bar: Matriks vs Integrator */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <button
          type="button"
          className={`btn ${viewTab === "matrix" ? "btn-primary" : "btn-outline"}`}
          onClick={() => {
            try {
              const stored = localStorage.getItem("rpl-mind-mapping-data")
              if (stored) setData(JSON.parse(stored))
            } catch {}
            setViewTab("matrix")
          }}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}
        >
          📊 Matriks Visual Mind Mapping
        </button>
        <button
          type="button"
          className={`btn ${viewTab === "integrator" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setViewTab("integrator")}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}
        >
          ⚡ Integrator Template Kaprodi &amp; Aturan Prioritas
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => go("admin-schedule")}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: "auto", color: "#475569" }}
        >
          ← Kembali ke Jadwal &amp; Ketersediaan
        </button>
      </div>

      {viewTab === "integrator" ? (
        <KaprodiScheduleIntegrator
          go={go}
          onSchedulesUpdated={() => {
            try {
              const stored = localStorage.getItem("rpl-mind-mapping-data")
              if (stored) setData(JSON.parse(stored))
            } catch {}
          }}
        />
      ) : (
        <>
          {/* Page Introduction */}
          <div className="page-intro" style={{ marginBottom: 16 }}>
        <div>
          <span className="eyebrow">VISUALISASI MATRIKS JADWAL TERPADU KAMPUS</span>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
            Mind Mapping Jadwal Perkuliahan
          </h1>
          <p style={{ color: "#475569", marginTop: 4, maxWidth: 850 }}>
            Visualisasi pemetaan jadwal perkuliahan seluruh program studi UPI Kampus Cibiru sesuai template terbaru{" "}
            <code>MAP JADWAL GANJIL 2023-2024</code> (37 Ruangan: Ruang Kelas 1–22 Gedung B &amp; E, serta Smart Class &amp; Laboratorium 23–37).
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, padding: "8px 16px" }}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Menyusun Matriks..." : "⚡ Generate Mind Mapping"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 700,
              borderColor: "#3b82f6",
              color: "#1d4ed8",
              background: "#eff6ff",
            }}
            onClick={() => setShowTimeSettingsModal(true)}
            title="Atur durasi menit per SKS, jam mulai Senin-Kamis, dan jam khusus Jumat (Sholat Jumat)"
          >
            ⏱️ Setting Waktu ({timeSettings.sksMinutes}m/SKS)
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={downloadOfflineHtml}
            title="Unduh file HTML mandiri untuk disimpan ke flashdisk dan dibuka di TV"
          >
            💾 Unduh HTML Offline (Flashdisk)
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={toggleTvMode}
          >
            ⛶ Mode TV Fullscreen
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={downloadExcelCsv}
          >
            📊 Unduh Excel (CSV)
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={() => window.print()}
          >
            🖨️ Cetak PDF
          </button>
        </div>
      </div>

      {/* 5-Step Prerequisites & Approval Card */}
      <section className="mind-mapping-banner">
        <div className="panel-head" style={{ padding: "16px 20px 8px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  background: isApproved && !hasConflicts ? "#dcfce7" : "#fee2e2",
                  color: isApproved && !hasConflicts ? "#15803d" : "#b91c1c",
                  border: `1px solid ${isApproved && !hasConflicts ? "#86efac" : "#fca5a5"}`,
                  padding: "3px 10px",
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {isApproved && !hasConflicts ? "✓ SIAP DIGENERATE & DISETUJUI ADMIN" : "⚠ JADWAL BELUM DAPAT DIGENERATE"}
              </span>
              <span style={{ fontSize: 11, color: "#64748b" }}>
                Versi: <strong>{version}</strong> &bull; Generate Terakhir: <strong>{genTimestamp}</strong>
              </span>
            </div>
            <h2 style={{ fontSize: 16, marginTop: 6, color: "#0f172a" }}>
              Alur Validasi &amp; Persyaratan Mind Mapping
            </h2>
          </div>

          {/* Safety testing controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#64748b" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isApproved}
                onChange={(e) => setIsApproved(e.target.checked)}
              />
              <span>Persetujuan Admin</span>
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={hasConflicts}
                onChange={(e) => setHasConflicts(e.target.checked)}
              />
              <span>Simulasi Konflik Hard Constraint</span>
            </label>
          </div>
        </div>

        {/* 5-Step Process Display */}
        <div className="mind-mapping-validation-grid">
          <div className="validation-item">
            <span className="step-num">01</span>
            <div>
              <strong>Kebutuhan 5 Prodi</strong>
              <small>RPL, PGSD, PGPAUD, PMM, TEKOM</small>
            </div>
            <span className="step-status ok">✓</span>
          </div>

          <div className="validation-item">
            <span className="step-num">02</span>
            <div>
              <strong>Validasi Data</strong>
              <small>Beban SKS &amp; Kurikulum Lolos</small>
            </div>
            <span className="step-status ok">✓</span>
          </div>

          <div className="validation-item">
            <span className="step-num">03</span>
            <div>
              <strong>Generate Jadwal</strong>
              <small>434 Sesi Matriks Siap</small>
            </div>
            <span className="step-status ok">✓</span>
          </div>

          <div className="validation-item">
            <span className="step-num">04</span>
            <div>
              <strong>Hard Constraints</strong>
              <small>{hasConflicts ? "Terdeteksi 1 Bentrok Ruang" : "0 Pelanggaran Ruang/Dosen"}</small>
            </div>
            <span className={`step-status ${hasConflicts ? "err" : "ok"}`}>
              {hasConflicts ? "✕" : "✓"}
            </span>
          </div>

          <div className="validation-item">
            <span className="step-num">05</span>
            <div>
              <strong>Approval Admin</strong>
              <small>{isApproved ? "Disetujui Admin Akademik" : "Menunggu Tanda Tangan"}</small>
            </div>
            <span className={`step-status ${isApproved ? "ok" : "err"}`}>
              {isApproved ? "✓" : "✕"}
            </span>
          </div>
        </div>
      </section>

      {/* Matrix Table Panel */}
      <section className="matrix-panel">
        {/* Navigation & Building Tabs */}
        <div className="matrix-filter-bar">
          <div className="matrix-tabs-group">
            {data.buildings.map((b: any) => (
              <button
                key={b.id}
                type="button"
                className={`matrix-tab-btn ${selectedBuilding === b.id ? "active" : ""}`}
                onClick={() => setSelectedBuilding(b.id)}
              >
                {b.name} ({b.rooms.length} Ruang)
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <button
                type="button"
                className={`matrix-day-btn ${selectedDay === "all" ? "active" : ""}`}
                onClick={() => setSelectedDay("all")}
              >
                Senin–Sabtu
              </button>
              {(data.metadata.days || ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]).map((day: string) => (
                <button
                  key={day}
                  type="button"
                  className={`matrix-day-btn ${selectedDay === day ? "active" : ""}`}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="matrix-search">
              <input
                type="text"
                placeholder="Cari MK, kelas, dosen, ruang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Prodi Legend Bar & Drag-and-Drop Controls */}
        <div className="matrix-legend" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Legenda Program Studi:
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="matrix-legend-item" style={{ color: "#22c55e" }}>
                <span className="matrix-legend-dot" style={{ background: "#dcfce7" }} /> PGSD
              </span>
              <span className="matrix-legend-item" style={{ color: "#f59e0b" }}>
                <span className="matrix-legend-dot" style={{ background: "#fef3c7" }} /> PGPAUD
              </span>
              <span className="matrix-legend-item" style={{ color: "#3b82f6" }}>
                <span className="matrix-legend-dot" style={{ background: "#dbeafe" }} /> RPL
              </span>
              <span className="matrix-legend-item" style={{ color: "#a855f7" }}>
                <span className="matrix-legend-dot" style={{ background: "#f3e8ff" }} /> P. Multimedia
              </span>
              <span className="matrix-legend-item" style={{ color: "#f43f5e" }}>
                <span className="matrix-legend-dot" style={{ background: "#ffe4e6" }} /> Teknik Komputer
              </span>
              <span className="matrix-legend-item" style={{ color: "#6366f1" }}>
                <span className="matrix-legend-dot" style={{ background: "#e0e7ff" }} /> MKDU / Lintas Prodi
              </span>
              <span className="matrix-legend-item" style={{ color: "#eab308" }}>
                <span className="matrix-legend-dot" style={{ background: "#334155" }} /> Istirahat / Break
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ color: "#38bdf8", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
              ✋ Mode Drag &amp; Drop Aktif (Tarik kartu ke slot kosong atau kartu lain untuk tukar)
            </span>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                color: "#cbd5e1",
                fontSize: 11,
                cursor: "pointer",
                background: "#1e293b",
                padding: "3px 8px",
                borderRadius: 6,
                border: "1px solid #334155",
              }}
              title="Cegah otomatis jika dosen atau kelas yang sama bentrok di ruangan lain"
            >
              <input
                type="checkbox"
                checked={strictConflictCheck}
                onChange={(e) => setStrictConflictCheck(e.target.checked)}
              />
              <span>Validasi Anti-Bentrok Dosen/Kelas</span>
            </label>
            <button
              type="button"
              onClick={() => setShowTimeSettingsModal(true)}
              style={{
                background: "#1e3a8a",
                color: "#93c5fd",
                border: "1px solid #3b82f6",
                borderRadius: 6,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
              title="Atur durasi menit per SKS, jam mulai Senin-Kamis, dan jam khusus Jumat"
            >
              ⏱️ Setting Waktu ({timeSettings.sksMinutes}m/SKS)
            </button>
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              style={{
                background: undoStack.length > 0 ? "#1e293b" : "#0f172a",
                color: undoStack.length > 0 ? "#38bdf8" : "#475569",
                border: "1px solid #334155",
                borderRadius: 6,
                padding: "3px 9px",
                fontSize: 11,
                fontWeight: 700,
                cursor: undoStack.length > 0 ? "pointer" : "not-allowed",
              }}
            >
              ↩ Undo ({undoStack.length})
            </button>
            <button
              type="button"
              onClick={handleResetMatrix}
              style={{
                background: "#1e293b",
                color: "#f87171",
                border: "1px solid #334155",
                borderRadius: 6,
                padding: "3px 9px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ↺ Reset Awal
            </button>
          </div>
        </div>

        {/* Drag & Drop Feedback Banner */}
        {(dndFeedback || dropTargetCell) && (
          <div
            style={{
              padding: "8px 20px",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              background: dropTargetCell
                ? dropTargetCell.valid
                  ? dropTargetCell.mode === "swap" || dropTargetCell.mode === "swap-parked"
                    ? "#1e3a8a"
                    : "#064e3b"
                  : "#7f1d1d"
                : dndFeedback?.type === "error"
                ? "#7f1d1d"
                : dndFeedback?.type === "info"
                ? "#1e293b"
                : "#064e3b",
              color: "#f8fafc",
              borderBottom: "1px solid #334155",
            }}
          >
            <span>
              {dropTargetCell
                ? dropTargetCell.valid
                  ? dropTargetCell.mode === "swap-parked"
                    ? `⇄ Lepaskan untuk MENEMPATKAN jadwal ini di Ruang ${dropTargetCell.room} (${dropTargetCell.day}) dan memindahkan jadwal lama ke Tempat Simpan Sementara`
                    : dropTargetCell.mode === "swap"
                    ? `⇄ Lepaskan untuk MENUKAR posisi jadwal di Ruang ${dropTargetCell.room} (${dropTargetCell.day})`
                    : `✓ Lepaskan untuk MEMINDAHKAN jadwal ke Ruang ${dropTargetCell.room} (${dropTargetCell.day})`
                  : `⚠ Tidak bisa ditaruh di sini: ${dropTargetCell.reason}`
                : dndFeedback?.message}
            </span>
            {dndFeedback && !dropTargetCell && (
              <button
                type="button"
                onClick={() => setDndFeedback(null)}
                style={{ background: "transparent", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: 15 }}
              >
                &times;
              </button>
            )}
          </div>
        )}

        {/* TEMPAT SIMPAN SEMENTARA (HOLDING / STAGING AREA) */}
        <div
          className={`matrix-holding-zone ${isOverHoldingArea ? "holding-drag-over" : ""}`}
          onDragOver={(e) => {
            if (!draggedCourseId) return
            e.preventDefault()
            e.dataTransfer.dropEffect = "move"
            if (!isOverHoldingArea) setIsOverHoldingArea(true)
            if (dropTargetCell) setDropTargetCell(null)
          }}
          onDragLeave={() => setIsOverHoldingArea(false)}
          onDrop={(e) => {
            e.preventDefault()
            handleDropToHoldingArea()
          }}
        >
          <div className="matrix-holding-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="holding-badge">
                📥 TEMPAT SIMPAN SEMENTARA (PARKIR JADWAL)
              </span>
              <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                Tarik (*drag*) jadwal dari tabel ke kotak kosong di bawah ini untuk mengosongkan slot ruangan sementara, lalu tarik kembali ke ruangan/jam tujuan kapan saja.
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: parkedCourses.length > 0 ? "#fbbf24" : "#64748b" }}>
              {parkedCourses.length} Jadwal Ditampung Sementara
            </span>
          </div>

          <div className="matrix-holding-slots">
            {/* Render Parked Courses */}
            {parkedCourses.map((course: any) => {
              const cardTheme = getProdiCardClass(course.prodi)
              const isBeingDragged = draggedCourseId === course.id
              const spanCount = course.span_count || Math.max(1, (course.end_row ?? 0) - (course.start_row ?? 0) + 1)

              return (
                <div
                  key={course.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedCourseId(course.id)
                    setDndFeedback(null)
                    e.dataTransfer.setData("text/plain", course.id)
                    e.dataTransfer.effectAllowed = "move"
                  }}
                  onDragEnd={() => {
                    setDraggedCourseId(null)
                    setDropTargetCell(null)
                    setIsOverHoldingArea(false)
                  }}
                  className={`holding-parked-card ${cardTheme} ${isBeingDragged ? "is-dragging" : ""}`}
                  onClick={() => setSelectedCourse(course)}
                  title="Tarik kembali ke tabel matriks untuk menempatkan jadwal ini, atau klik untuk detail"
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                    <strong style={{ fontSize: 12 }}>{course.display_label}</strong>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          padding: "1px 5px",
                          borderRadius: 4,
                          background: course.course_category === "Praktikum" ? "#7c2d12" : "#0f172a",
                          color: course.course_category === "Praktikum" ? "#fed7aa" : "#bae6fd",
                        }}
                      >
                        {course.course_category || "Teori"}
                      </span>
                      <span className="holding-sks-pill">{spanCount} Slot ({course.sks} SKS) ⠿</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {course.course_name}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {course.lecturer_1}
                  </div>
                  <div className="holding-card-footer">
                    <span>Asal: {course.original_room || course.room} • {course.original_day || course.day}</span>
                    <button
                      type="button"
                      className="holding-restore-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestoreParkedCourse(course)
                      }}
                      title="Kembalikan ke slot ruangan asal"
                    >
                      ↩ Kembalikan
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Always render empty placeholder slots so user clearly sees empty boxes to drop into */}
            {Array.from({ length: Math.max(2, 5 - parkedCourses.length) }).map((_, idx) => (
              <div key={`empty-slot-${idx}`} className="holding-empty-slot">
                <span className="holding-empty-icon">+</span>
                <div>
                  <strong>Slot Parkir Sementara #{parkedCourses.length + idx + 1}</strong>
                  <small>Tarik &amp; lepas kartu jadwal ke sini</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Matrix Table */}
        <div className="matrix-scroll-wrapper">
          <table className="mind-mapping-table">
            <thead>
              {/* Row 1: Room Category / Lab Name Header (Row 7 in Excel MAPPING) */}
              <tr>
                <th className="col-sticky-1" rowSpan={3} style={{ width: 70 }}>
                  HARI
                </th>
                <th className="col-sticky-2" rowSpan={3} style={{ width: 95 }}>
                  JAM
                </th>
                <th className="col-sticky-3" rowSpan={3} style={{ width: 38 }}>
                  Pos
                </th>
                {activeRooms.map((room: string, idx: number) => {
                  const meta = getRoomMeta(room, idx)
                  return (
                    <th
                      key={`label-${room}`}
                      style={{
                        background: meta.isClassroom ? "#1e293b" : "#172554",
                        color: meta.isClassroom ? "#cbd5e1" : "#93c5fd",
                        fontSize: 10,
                        padding: "5px 6px",
                        lineHeight: 1.25,
                      }}
                    >
                      {meta.label}
                    </th>
                  )
                })}
              </tr>
              {/* Row 2: Room Codes Header (Row 8 in Excel MAPPING: B2.002 .. A3.010) */}
              <tr>
                {activeRooms.map((room: string, idx: number) => {
                  const meta = getRoomMeta(room, idx)
                  return (
                    <th
                      key={`code-${room}`}
                      style={{
                        background: meta.isClassroom ? "#0f172a" : "#0c1938",
                        color: meta.isClassroom ? "#38bdf8" : "#fbbf24",
                      }}
                    >
                      {room}
                    </th>
                  )
                })}
              </tr>
              {/* Row 3: Room Sequence Number 1..37 (Row 9 in Excel MAPPING) */}
              <tr>
                {activeRooms.map((room: string, idx: number) => {
                  const meta = getRoomMeta(room, idx)
                  return (
                    <th
                      key={`num-${room}`}
                      style={{
                        background: "#090e1a",
                        color: meta.isClassroom ? "#94a3b8" : "#f59e0b",
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: "3px 6px",
                        borderBottom: "2px solid #475569",
                        borderRight: "1px solid #334155",
                        textAlign: "center",
                      }}
                    >
                      {meta.number}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {daysToRender.map((day: string, dayIndex: number) => {
                const slots = data.days_slots[day as keyof typeof data.days_slots] || []
                const spannedCells: Record<string, number> = {}

                return slots.map((slot: any, slotIdx: number) => {
                  const isFirstSlotOfDay = slotIdx === 0
                  const isBreak = slot.is_break
                  const rowClass = `${isFirstSlotOfDay && dayIndex > 0 ? "day-divider" : ""} ${isBreak ? "row-break" : ""}`

                  return (
                    <tr key={`${day}-${slot.time}-${slotIdx}`} className={rowClass}>
                      {/* Column 1: Hari (Spans all slots of this day) */}
                      {slotIdx === 0 && (
                        <td className="col-sticky-1 col-day" rowSpan={slots.length}>
                          {day === "Jumat" ? "JUM'AT" : day.toUpperCase()}
                        </td>
                      )}

                      {/* Column 2: Jam */}
                      <td className="col-sticky-2 col-time">{slot.time}</td>

                      {/* Column 3: Pos (1..14, empty on break) */}
                      <td className="col-sticky-3 col-pos">{isBreak ? "" : slot.slot}</td>

                      {/* Break row spans all rooms */}
                      {isBreak ? (
                        <td colSpan={activeRooms.length}>
                          <strong>{slot.label || "ISTIRAHAT / BREAK"}</strong>
                        </td>
                      ) : (
                        activeRooms.map((room: string) => {
                          if (spannedCells[room] && spannedCells[room] > 0) {
                            spannedCells[room]--
                            return null
                          }

                          const cellKey = `${day}|${slot.time}|${room}`
                          const courseId = data.matrix_cells[cellKey as keyof typeof data.matrix_cells]
                          const isDropHover =
                            dropTargetCell &&
                            dropTargetCell.day === day &&
                            dropTargetCell.slotIdx === slotIdx &&
                            dropTargetCell.room === room

                          const handleDragOverCell = (e: React.DragEvent) => {
                            if (!draggedCourseId) return
                            e.preventDefault()
                            e.dataTransfer.dropEffect = "move"
                            if (
                              !dropTargetCell ||
                              dropTargetCell.day !== day ||
                              dropTargetCell.slotIdx !== slotIdx ||
                              dropTargetCell.room !== room
                            ) {
                              const evalRes = evaluateDropPlacement(draggedCourseId, day, slotIdx, room)
                              setDropTargetCell({
                                day,
                                slotIdx,
                                room,
                                valid: evalRes.valid,
                                mode: evalRes.mode,
                                reason: evalRes.reason,
                              })
                            }
                          }

                          if (!courseId) {
                            return (
                              <td
                                key={room}
                                className={`matrix-empty-cell ${
                                  isDropHover
                                    ? dropTargetCell?.valid
                                      ? "drop-target-valid"
                                      : "drop-target-invalid"
                                    : ""
                                }`}
                                onDragOver={handleDragOverCell}
                                onDrop={(e) => {
                                  e.preventDefault()
                                  handleCellDrop(day, slotIdx, room)
                                }}
                              />
                            )
                          }

                          const course = data.courses.find((c: any) => c.id === courseId)
                          if (!course) {
                            return (
                              <td
                                key={room}
                                onDragOver={handleDragOverCell}
                                onDrop={(e) => {
                                  e.preventDefault()
                                  handleCellDrop(day, slotIdx, room)
                                }}
                              />
                            )
                          }

                          // Search filter matching
                          let isMatch = true
                          if (searchQuery.trim()) {
                            const haystack = `${course.course_code} ${course.class_name} ${course.course_name} ${course.lecturer_1} ${course.lecturer_2} ${course.prodi} ${course.room}`.toLowerCase()
                            isMatch = haystack.includes(searchQuery.trim().toLowerCase())
                          }

                          const spanCount = course.end_row - course.start_row + 1
                          if (spanCount > 1) {
                            spannedCells[room] = spanCount - 1
                          }

                          const cardTheme = getProdiCardClass(course.prodi)
                          const isBeingDragged = draggedCourseId === course.id

                          return (
                            <td
                              key={room}
                              rowSpan={spanCount}
                              className={
                                isDropHover
                                  ? dropTargetCell?.valid
                                    ? "drop-target-swap"
                                    : "drop-target-invalid"
                                  : ""
                              }
                              onDragOver={handleDragOverCell}
                              onDrop={(e) => {
                                e.preventDefault()
                                handleCellDrop(day, slotIdx, room)
                              }}
                            >
                              <div
                                draggable
                                onDragStart={(e) => {
                                  setDraggedCourseId(course.id)
                                  setDndFeedback(null)
                                  e.dataTransfer.setData("text/plain", course.id)
                                  e.dataTransfer.effectAllowed = "move"
                                }}
                                onDragEnd={() => {
                                  setDraggedCourseId(null)
                                  setDropTargetCell(null)
                                }}
                                className={`matrix-course-cell ${cardTheme} ${isBeingDragged ? "is-dragging" : ""}`}
                                style={{
                                  opacity: isBeingDragged ? 0.45 : isMatch ? 1 : 0.2,
                                  filter: isMatch ? "none" : "grayscale(1)",
                                }}
                                onClick={() => setSelectedCourse(course)}
                                title={`${course.course_name} (${course.lecturer_1}) — Tarik (Drag) untuk pindah ruangan/jam, klik untuk detail`}
                              >
                                <div className="matrix-course-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                                  <span>{course.display_label}</span>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                                    {course.course_category && (
                                      <span
                                        style={{
                                          fontSize: 8.5,
                                          fontWeight: 800,
                                          padding: "0px 4px",
                                          borderRadius: 3,
                                          background: course.course_category === "Praktikum" ? "rgba(124,45,18,0.85)" : "rgba(15,23,42,0.2)",
                                          color: course.course_category === "Praktikum" ? "#ffedd5" : "inherit",
                                        }}
                                      >
                                        {course.course_category === "Praktikum" ? "PRAK" : "TEORI"}
                                      </span>
                                    )}
                                    <span className="drag-grip" aria-hidden="true">⠿</span>
                                  </span>
                                </div>
                                <div className="matrix-course-lecturer">{course.lecturer_1}</div>
                              </div>
                            </td>
                          )
                        })
                      )}
                    </tr>
                  )
                })
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Setting Waktu Perkuliahan */}
      {showTimeSettingsModal && (
        <div className="course-detail-backdrop" onClick={() => setShowTimeSettingsModal(false)}>
          <div
            className="course-detail-card"
            style={{ maxWidth: 680 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="course-detail-head">
              <div>
                <h3>⏱️ Pengaturan Waktu &amp; Durasi SKS Mind Mapping</h3>
                <span style={{ fontSize: 11.5, color: "#94a3b8", display: "block", marginTop: 2 }}>
                  Atur durasi menit per 1 SKS serta pemisahan jam mulai Senin–Kamis dengan hari Jumat (Sholat Jumat).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTimeSettingsModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: 20, cursor: "pointer" }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, maxHeight: "80vh", overflowY: "auto" }}>
              {/* 1. Durasi Per SKS */}
              <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  <div>
                    <strong style={{ fontSize: 13.5, color: "#38bdf8", display: "block" }}>
                      1. Durasi Waktu per 1 SKS (Menit)
                    </strong>
                    <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                      Menentukan lama tiap 1 baris slot SKS pada matriks jadwal.
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[
                      { label: "50m (Normal)", val: 50 },
                      { label: "45m", val: 45 },
                      { label: "40m (Ramadhan)", val: 40 },
                      { label: "60m", val: 60 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setTimeSettings((prev) => ({ ...prev, sksMinutes: preset.val }))}
                        style={{
                          padding: "4px 9px",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 6,
                          cursor: "pointer",
                          border: timeSettings.sksMinutes === preset.val ? "1px solid #38bdf8" : "1px solid #334155",
                          background: timeSettings.sksMinutes === preset.val ? "#1e3a8a" : "#1e293b",
                          color: timeSettings.sksMinutes === preset.val ? "#fff" : "#cbd5e1",
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="number"
                      min={15}
                      max={120}
                      value={timeSettings.sksMinutes}
                      onChange={(e) =>
                        setTimeSettings((prev) => ({
                          ...prev,
                          sksMinutes: parseInt(e.target.value, 10) || 50,
                        }))
                      }
                      style={{
                        width: 85,
                        padding: "7px 10px",
                        borderRadius: 6,
                        border: "1px solid #475569",
                        background: "#1e293b",
                        color: "#f8fafc",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#cbd5e1" }}>Menit / SKS</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 11.5, color: "#94a3b8" }}>
                    <span style={{ background: "#1e293b", padding: "4px 10px", borderRadius: 6, border: "1px solid #334155" }}>
                      2 SKS = <strong style={{ color: "#f8fafc" }}>{timeSettings.sksMinutes * 2} Menit</strong>
                    </span>
                    <span style={{ background: "#1e293b", padding: "4px 10px", borderRadius: 6, border: "1px solid #334155" }}>
                      3 SKS = <strong style={{ color: "#f8fafc" }}>{timeSettings.sksMinutes * 3} Menit</strong>
                    </span>
                    <span style={{ background: "#1e293b", padding: "4px 10px", borderRadius: 6, border: "1px solid #334155" }}>
                      4 SKS = <strong style={{ color: "#f8fafc" }}>{timeSettings.sksMinutes * 4} Menit</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Pengaturan Hari Senin - Kamis vs Jumat */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Kolom Kiri: Senin - Kamis */}
                <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <span style={{ background: "#1e3a8a", color: "#93c5fd", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4 }}>
                      SENIN – KAMIS
                    </span>
                    <strong style={{ fontSize: 13.5, color: "#f8fafc", display: "block", marginTop: 6 }}>
                      2. Jadwal Hari Senin – Kamis
                    </strong>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      6 slot pagi sebelum istirahat siang, lalu lanjut sesi siang–sore.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>
                      Jam Mulai Kuliah Pagi (Senin–Kamis)
                    </label>
                    <input
                      type="time"
                      value={timeSettings.monThuStartTime}
                      onChange={(e) =>
                        setTimeSettings((prev) => ({ ...prev, monThuStartTime: e.target.value || "07:00" }))
                      }
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 6,
                        border: "1px solid #475569",
                        background: "#1e293b",
                        color: "#f8fafc",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>
                      Durasi Istirahat Siang (Menit)
                    </label>
                    <input
                      type="number"
                      min={15}
                      max={180}
                      value={timeSettings.monThuBreakMinutes}
                      onChange={(e) =>
                        setTimeSettings((prev) => ({
                          ...prev,
                          monThuBreakMinutes: parseInt(e.target.value, 10) || 60,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 6,
                        border: "1px solid #475569",
                        background: "#1e293b",
                        color: "#f8fafc",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  <div style={{ background: "#1e293b", borderRadius: 8, padding: 10, fontSize: 11, color: "#cbd5e1", lineHeight: 1.6, marginTop: "auto" }}>
                    <div style={{ fontWeight: 700, color: "#38bdf8", marginBottom: 2 }}>Preview Jam Senin–Kamis:</div>
                    <div>&bull; Slot 1 Pagi: <strong>{timePreview.monFirst}</strong></div>
                    <div>&bull; Istirahat Siang: <strong style={{ color: "#fbbf24" }}>{timePreview.monBreak}</strong></div>
                    <div>&bull; Slot Terakhir: <strong>{timePreview.monLast}</strong></div>
                  </div>
                </div>

                {/* Kolom Kanan: Khusus Hari Jumat */}
                <div style={{ background: "#0f172a", border: "1px solid #10b981", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <span style={{ background: "#064e3b", color: "#6ee7b7", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4 }}>
                      KHUSUS HARI JUMAT (SHOLAT JUMAT)
                    </span>
                    <strong style={{ fontSize: 13.5, color: "#f8fafc", display: "block", marginTop: 6 }}>
                      3. Jadwal Khusus Hari Jumat
                    </strong>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      5 slot pagi sebelum jeda Sholat Jumat, terpisah dari Senin–Kamis.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>
                      Jam Mulai Kuliah Pagi (Jumat)
                    </label>
                    <input
                      type="time"
                      value={timeSettings.friStartTime}
                      onChange={(e) =>
                        setTimeSettings((prev) => ({ ...prev, friStartTime: e.target.value || "07:00" }))
                      }
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 6,
                        border: "1px solid #475569",
                        background: "#1e293b",
                        color: "#f8fafc",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>
                      Pengaturan Selesai Sholat Jumat / Mulai Siang
                    </label>
                    <select
                      value={timeSettings.friBreakMode}
                      onChange={(e) =>
                        setTimeSettings((prev) => ({
                          ...prev,
                          friBreakMode: e.target.value as "duration" | "fixed_afternoon",
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 6,
                        border: "1px solid #475569",
                        background: "#1e293b",
                        color: "#f8fafc",
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      <option value="fixed_afternoon">Mulai Kuliah Siang di Jam Tetap (Misal 13:00)</option>
                      <option value="duration">Berdasarkan Durasi Menit Jeda Sholat Jumat</option>
                    </select>

                    {timeSettings.friBreakMode === "fixed_afternoon" ? (
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>
                          Jam Mulai Sesi Siang (Setelah Sholat Jumat)
                        </label>
                        <input
                          type="time"
                          value={timeSettings.friAfternoonStartTime}
                          onChange={(e) =>
                            setTimeSettings((prev) => ({
                              ...prev,
                              friAfternoonStartTime: e.target.value || "13:00",
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1px solid #475569",
                            background: "#1e293b",
                            color: "#f8fafc",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        />
                      </div>
                    ) : (
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>
                          Durasi Jeda Sholat Jumat &amp; Istirahat (Menit)
                        </label>
                        <input
                          type="number"
                          min={30}
                          max={240}
                          value={timeSettings.friBreakMinutes}
                          onChange={(e) =>
                            setTimeSettings((prev) => ({
                              ...prev,
                              friBreakMinutes: parseInt(e.target.value, 10) || 110,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1px solid #475569",
                            background: "#1e293b",
                            color: "#f8fafc",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ background: "#064e3b", borderRadius: 8, padding: 10, fontSize: 11, color: "#ecfdf5", lineHeight: 1.6, marginTop: "auto" }}>
                    <div style={{ fontWeight: 700, color: "#6ee7b7", marginBottom: 2 }}>Preview Jam Hari Jumat:</div>
                    <div>&bull; Slot 1 Pagi: <strong>{timePreview.friFirst}</strong></div>
                    <div>&bull; Jeda Sholat Jumat: <strong style={{ color: "#fde047" }}>{timePreview.friBreak}</strong></div>
                    <div>&bull; Slot Terakhir: <strong>{timePreview.friLast}</strong></div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, paddingTop: 6, borderTop: "1px solid #334155" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setTimeSettings({
                      sksMinutes: 50,
                      monThuStartTime: "07:00",
                      monThuBreakMinutes: 60,
                      friStartTime: "07:00",
                      friBreakMode: "fixed_afternoon",
                      friBreakMinutes: 110,
                      friAfternoonStartTime: "13:00",
                    })
                  }
                >
                  ↺ Reset Default (50m / 07:00)
                </button>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowTimeSettingsModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleApplyTimeSettings}
                    style={{ fontWeight: 700 }}
                  >
                    ✓ Terapkan ke Matriks Mind Mapping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedCourse && (
        <div className="course-detail-backdrop" onClick={() => setSelectedCourse(null)}>
          <div className="course-detail-card" onClick={(e) => e.stopPropagation()}>
            <div className="course-detail-head">
              <h3>Detail Perkuliahan: {selectedCourse.display_label}</h3>
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: 20, cursor: "pointer" }}
              >
                &times;
              </button>
            </div>
            <div className="course-detail-body">
              <div className="detail-box full">
                <div className="lbl">Nama Mata Kuliah</div>
                <div className="val" style={{ color: "#38bdf8", fontWeight: 700 }}>
                  {selectedCourse.course_name} ({selectedCourse.course_code})
                </div>
              </div>
              <div className="detail-box">
                <div className="lbl">Kode &amp; Kelas</div>
                <div className="val">{selectedCourse.course_code} - Kelas {selectedCourse.class_name}</div>
              </div>
              <div className="detail-box">
                <div className="lbl">Program Studi</div>
                <div className="val">{selectedCourse.prodi}</div>
              </div>
              <div className="detail-box">
                <div className="lbl">Semester / SKS</div>
                <div className="val">Semester {selectedCourse.semester} &bull; {selectedCourse.sks} SKS</div>
              </div>
              <div className="detail-box">
                <div className="lbl">Gedung &amp; Ruangan</div>
                <div className="val">{selectedCourse.building} &bull; Ruang {selectedCourse.room}</div>
              </div>
              <div className="detail-box full">
                <div className="lbl">Hari &amp; Jam Pelaksanaan</div>
                <div className="val">{selectedCourse.day}, {selectedCourse.time_display} WIB</div>
              </div>
              <div className="detail-box full">
                <div className="lbl">Dosen Pengampu Utama (1)</div>
                <div className="val">{selectedCourse.lecturer_1 || "-"}</div>
              </div>
              {selectedCourse.lecturer_2 && (
                <div className="detail-box full">
                  <div className="lbl">Dosen Pengampu Pendamping (2)</div>
                  <div className="val">{selectedCourse.lecturer_2}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generate Status Modal */}
      {showGenModal && (
        <div className="course-detail-backdrop" onClick={() => setShowGenModal(false)}>
          <div className="course-detail-card" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            <div className="course-detail-head">
              <h3>
                {isApproved && !hasConflicts
                  ? "✓ Berhasil Generate Mind Mapping"
                  : "⚠ Peringatan Generate Mind Mapping"}
              </h3>
              <button
                type="button"
                onClick={() => setShowGenModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: 20, cursor: "pointer" }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: 20 }}>
              {isApproved && !hasConflicts ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "grid", placeItems: "center", fontSize: 22, fontWeight: 800 }}>
                      ✓
                    </div>
                    <div>
                      <strong style={{ fontSize: 16, color: "#f8fafc", display: "block" }}>
                        File Mind Mapping Berhasil Dibuat!
                      </strong>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>
                        Versi: <strong>{version}</strong> &bull; Waktu: {genTimestamp}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5, marginBottom: 16 }}>
                    Sistem telah memetakan <strong>{data.metadata.total_courses} sesi perkuliahan</strong> ke dalam{" "}
                    <strong>{data.metadata.total_rooms} ruangan</strong> di <strong>{data.metadata.total_buildings} gedung</strong>.
                    File HTML Mandiri <strong>(Self-Contained Offline)</strong> telah diunduh secara otomatis dan siap disalin ke flashdisk untuk dipasang pada komputer/TV tanpa internet.
                  </p>

                  <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "12px 16px", marginBottom: 18, fontSize: 12, color: "#94a3b8" }}>
                    <div style={{ fontWeight: 700, color: "#38bdf8", marginBottom: 6 }}>Instruksi Penggunaan TV:</div>
                    <ol style={{ paddingLeft: 18, margin: 0, lineHeight: 1.6 }}>
                      <li>Salin file <code>MIND_MAPPING_JADWAL_UPI_CIBIRU_2022-2023.html</code> ke flashdisk.</li>
                      <li>Colok flashdisk ke PC/TV yang berada di gedung perkuliahan.</li>
                      <li>Buka file langsung di browser (Chrome/Edge/Firefox) melalui protokol <code>file://</code>.</li>
                      <li>Tekan <strong>F11</strong> atau tombol <strong>Fullscreen TV</strong> untuk mode tayang 16:9.</li>
                    </ol>
                  </div>

                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-secondary" onClick={downloadOfflineHtml}>
                      Unduh Ulang HTML
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => setShowGenModal(false)}>
                      Selesai &amp; Lihat Matriks
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fee2e2", color: "#ef4444", display: "grid", placeItems: "center", fontSize: 22, fontWeight: 800 }}>
                      ✕
                    </div>
                    <div>
                      <strong style={{ fontSize: 16, color: "#f8fafc", display: "block" }}>
                        Generate Mind Mapping Ditolak
                      </strong>
                      <span style={{ fontSize: 12, color: "#f87171" }}>
                        Prasyarat validasi akademik belum terpenuhi
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5, marginBottom: 16 }}>
                    Fitur Mind Mapping hanya dapat digenerate setelah seluruh proses selesai tanpa pelanggaran:
                  </p>

                  <ul style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "12px 24px", marginBottom: 18, fontSize: 12, color: "#e2e8f0", lineHeight: 1.8 }}>
                    {!isApproved && (
                      <li style={{ color: "#f87171" }}>
                        <strong>Approval Admin:</strong> Jadwal belum disetujui secara final oleh Admin Akademik.
                      </li>
                    )}
                    {hasConflicts && (
                      <li style={{ color: "#f87171" }}>
                        <strong>Hard Constraints:</strong> Masih terdapat jadwal bentrok atau konflik ruangan/dosen.
                      </li>
                    )}
                  </ul>

                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-outline" onClick={() => setShowGenModal(false)}>
                      Tutup
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
