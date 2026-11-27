import { useState, useMemo, useEffect } from "react"
import mindMappingDataJson from "./mindMappingData.json"
import { KaprodiScheduleIntegrator } from "./KaprodiScheduleIntegrator"
import {
  DAYS_6,
  DEFAULT_TIME_SETTINGS,
  MappedCourse,
  MindMappingData,
  RoomDef,
  SlotDef,
  TimeSettings,
  exportMindMappingCsv,
  exportMindMappingImage,
  generateDynamicOfflineHtml,
  getCohortKey,
  getProdiPalette,
  getRoomDef,
  normalizeLoadedMindMappingData,
  rebuildMatrixCells,
  recalculateMindMappingTimes,
  syncCourseTimesWithSlots,
} from "./mindMappingUtils"

type Props = {
  go: (page: string) => void
}

type DragPayload = {
  courseId: string
  source: "matrix" | "parking"
}

type FeedbackState = {
  type: "success" | "error" | "info"
  message: string
} | null

export function AdminMindMapping({ go }: Props) {
  const [data, setData] = useState<MindMappingData>(() => {
    try {
      const stored = localStorage.getItem("rpl-mind-mapping-data")
      return normalizeLoadedMindMappingData(stored ? JSON.parse(stored) : mindMappingDataJson)
    } catch {
      return normalizeLoadedMindMappingData(mindMappingDataJson)
    }
  })

  // Listen to cross-tab or component updates
  useEffect(() => {
    const reloadData = () => {
      try {
        const stored = localStorage.getItem("rpl-mind-mapping-data")
        if (stored) {
          setData(normalizeLoadedMindMappingData(JSON.parse(stored)))
        }
      } catch {}
    }
    window.addEventListener("storage", reloadData)
    return () => window.removeEventListener("storage", reloadData)
  }, [])

  const [viewTab, setViewTab] = useState<"matrix" | "integrator">("matrix")
  const [selectedBuilding, setSelectedBuilding] = useState("all")
  const [selectedDay, setSelectedDay] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<MappedCourse | null>(null)
  const [showGenModal, setShowGenModal] = useState(false)
  const [isApproved, setIsApproved] = useState(true)
  const [hasConflicts, setHasConflicts] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [tvFullscreen, setTvFullscreen] = useState(false)

  // Drag & Drop + Parking + Undo + Strict Validation states
  const [undoStack, setUndoStack] = useState<MindMappingData[]>([])
  const [strictConflict, setStrictConflict] = useState(true)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [dragging, setDragging] = useState<DragPayload | null>(null)
  const [dragOverState, setDragOverState] = useState<{
    day: string
    room: string
    positions: number[]
    status: "valid" | "invalid"
    reason?: string
  } | null>(null)
  const [isParkingDragOver, setIsParkingDragOver] = useState(false)

  // Time Settings Modal state
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [timeDraft, setTimeDraft] = useState<TimeSettings>(data.time_settings || DEFAULT_TIME_SETTINGS)

  const commitData = (next: MindMappingData, pushUndo = true) => {
    if (pushUndo) {
      setUndoStack((prev) => [...prev.slice(-19), data])
    }
    const updated: MindMappingData = {
      ...next,
      metadata: {
        ...next.metadata,
        total_courses: next.courses.length,
        total_rooms: 37,
        total_buildings: 3,
      },
    }
    setData(updated)
    try {
      localStorage.setItem("rpl-mind-mapping-data", JSON.stringify(updated))
    } catch {}
  }

  const handleUndo = () => {
    if (undoStack.length === 0) return
    const previous = undoStack[undoStack.length - 1]
    setUndoStack((prev) => prev.slice(0, -1))
    setData(previous)
    try {
      localStorage.setItem("rpl-mind-mapping-data", JSON.stringify(previous))
    } catch {}
    setFeedback({ type: "info", message: "Perubahan terakhir berhasil dibatalkan (Undo)." })
  }

  // Auto-dismiss error toast after 5 seconds
  useEffect(() => {
    if (feedback?.type === "error") {
      const timer = setTimeout(() => {
        setFeedback((curr) => (curr?.type === "error" ? null : curr))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  // Keyboard shortcut Ctrl+Z / Cmd+Z for Undo
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
        if (undoStack.length > 0) {
          e.preventDefault()
          handleUndo()
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [undoStack])

  // Trigger Dynamic Download of Self-Contained Offline HTML
  const downloadOfflineHtml = () => {
    const html = generateDynamicOfflineHtml(data)
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `MIND_MAPPING_JADWAL_UPI_CIBIRU_${(data.metadata.academic_year || "2023-2024").replace("/", "-")}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Trigger Generate Mind Mapping Offline Package
  const handleGenerate = () => {
    if (!isApproved || hasConflicts) {
      setShowGenModal(true)
      return
    }
    setIsGenerating(true)
    setTimeout(() => {
      const now = new Date()
      const formattedDate = `${now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}, ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`
      const nextData: MindMappingData = {
        ...data,
        metadata: {
          ...data.metadata,
          generated_at: formattedDate,
          version: `v2.1.${Math.floor(Math.random() * 90 + 10)}-approved`,
        },
      }
      commitData(nextData, false)
      setIsGenerating(false)
      setShowGenModal(true)
      const html = generateDynamicOfflineHtml(nextData)
      const blob = new Blob([html], { type: "text/html;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `MIND_MAPPING_JADWAL_UPI_CIBIRU_${(nextData.metadata.academic_year || "2023-2024").replace("/", "-")}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 450)
  }

  const toggleTvMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setTvFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setTvFullscreen(false)
    }
  }

  // Validate whether a course fits at (day, startPos, room) against remaining courses
  const validatePlacement = (
    course: MappedCourse,
    targetDay: string,
    targetStartPos: number,
    targetRoom: string,
    otherCourses: MappedCourse[],
    checkStrict: boolean
  ): { ok: boolean; endPos: number; reason?: string } => {
    const sksSpan = Math.max(1, parseInt(String(course.sks || "2"), 10) || 2)
    const slots = data.days_slots[targetDay] || []
    const startIdx = slots.findIndex((s) => !s.is_break && s.pos === targetStartPos)
    if (startIdx === -1) {
      return { ok: false, endPos: targetStartPos, reason: "Slot waktu tidak valid." }
    }

    // Ensure contiguous non-break slots for the full SKS span
    const requiredPositions: number[] = []
    for (let i = 0; i < sksSpan; i++) {
      const s = slots[startIdx + i]
      if (!s || s.is_break || s.pos === null) {
        return {
          ok: false,
          endPos: targetStartPos,
          reason: `Slot ${targetDay} Pos ${targetStartPos} tidak cukup untuk ${sksSpan} SKS berurutan (terpotong jam istirahat atau akhir hari).`,
        }
      }
      requiredPositions.push(s.pos)
    }
    const endPos = requiredPositions[requiredPositions.length - 1]

    // Check room occupancy
    for (const other of otherCourses) {
      if (other.day !== targetDay) continue
      const overlaps = !(endPos < other.start_pos || targetStartPos > other.end_pos)
      if (!overlaps) continue

      if (other.room === targetRoom) {
        return {
          ok: false,
          endPos,
          reason: `Ruang ${targetRoom} pada ${targetDay} Pos ${targetStartPos}–${endPos} sudah dipakai oleh ${other.display_label}.`,
        }
      }

      if (checkStrict) {
        // Lecturer conflict check (Pengampu 1 & 2)
        const courseLecturers = [course.lecturer_1, course.lecturer_2].filter(Boolean).map((l) => l.trim().toLowerCase())
        const otherLecturers = [other.lecturer_1, other.lecturer_2].filter(Boolean).map((l) => l.trim().toLowerCase())
        const clashLec = courseLecturers.find((l) => otherLecturers.includes(l))
        if (clashLec) {
          return {
            ok: false,
            endPos,
            reason: `Bentrok Dosen: ${course.lecturer_1 || clashLec} sudah mengajar ${other.display_label} di ruang ${other.room} (${targetDay}).`,
          }
        }

        // Student Cohort conflict check (Prodi + Semester + Kelas)
        const cohortA = getCohortKey(course.prodi, course.semester, course.class_name)
        const cohortB = getCohortKey(other.prodi, other.semester, other.class_name)
        if (cohortA === cohortB) {
          return {
            ok: false,
            endPos,
            reason: `Bentrok Kelas/Semester: ${course.prodi} Sem.${course.semester} Kelas ${course.class_name} sudah ada kuliah ${other.display_label} di ruang ${other.room}.`,
          }
        }
      }
    }

    return { ok: true, endPos }
  }

  // Evaluate live drop validity for green/red timeline outline
  const evaluateEmptyCellHover = (targetDay: string, targetPos: number, targetRoom: string) => {
    if (!dragging) return
    const sourceList = dragging.source === "matrix" ? data.courses : data.parked_courses
    const course = sourceList.find((c) => c.id === dragging.courseId)
    if (!course) return

    const sksSpan = Math.max(1, parseInt(String(course.sks || "2"), 10) || 2)
    const otherCourses = data.courses.filter((c) => c.id !== course.id)
    const check = validatePlacement(course, targetDay, targetPos, targetRoom, otherCourses, strictConflict)

    const positions: number[] = []
    for (let i = 0; i < sksSpan; i++) {
      positions.push(targetPos + i)
    }

    setDragOverState({
      day: targetDay,
      room: targetRoom,
      positions,
      status: check.ok ? "valid" : "invalid",
      reason: check.reason,
    })
  }

  const evaluateCourseSwapHover = (targetCourse: MappedCourse) => {
    if (!dragging) return
    if (dragging.courseId === targetCourse.id) {
      setDragOverState(null)
      return
    }
    const sourceList = dragging.source === "matrix" ? data.courses : data.parked_courses
    const draggedCourse = sourceList.find((c) => c.id === dragging.courseId)
    if (!draggedCourse) return

    const positions: number[] = []
    for (let p = targetCourse.start_pos; p <= targetCourse.end_pos; p++) {
      positions.push(p)
    }

    if (dragging.source === "parking") {
      const remaining = data.courses.filter((c) => c.id !== targetCourse.id)
      const check = validatePlacement(draggedCourse, targetCourse.day, targetCourse.start_pos, targetCourse.room, remaining, strictConflict)
      setDragOverState({
        day: targetCourse.day,
        room: targetCourse.room,
        positions,
        status: check.ok ? "valid" : "invalid",
        reason: check.reason,
      })
      return
    }

    const remaining = data.courses.filter((c) => c.id !== draggedCourse.id && c.id !== targetCourse.id)
    const checkA = validatePlacement(draggedCourse, targetCourse.day, targetCourse.start_pos, targetCourse.room, remaining, strictConflict)
    if (!checkA.ok) {
      setDragOverState({
        day: targetCourse.day,
        room: targetCourse.room,
        positions,
        status: "invalid",
        reason: checkA.reason,
      })
      return
    }
    const rDefTarget = getRoomDef(targetCourse.room)
    const movedA: MappedCourse = {
      ...draggedCourse,
      day: targetCourse.day,
      room: targetCourse.room,
      building: rDefTarget ? rDefTarget.buildingName : targetCourse.building,
      start_pos: targetCourse.start_pos,
      end_pos: checkA.endPos,
    }
    const checkB = validatePlacement(targetCourse, draggedCourse.day, draggedCourse.start_pos, draggedCourse.room, [...remaining, movedA], strictConflict)
    setDragOverState({
      day: targetCourse.day,
      room: targetCourse.room,
      positions,
      status: checkB.ok ? "valid" : "invalid",
      reason: checkB.reason,
    })
  }

  // Handle Drop onto an empty matrix slot
  const handleDropOnEmptyCell = (targetDay: string, targetPos: number, targetRoom: string) => {
    setDragOverState(null)
    if (!dragging) return

    const sourceList = dragging.source === "matrix" ? data.courses : data.parked_courses
    const course = sourceList.find((c) => c.id === dragging.courseId)
    setDragging(null)
    if (!course) return

    const otherCourses = data.courses.filter((c) => c.id !== course.id)
    const check = validatePlacement(course, targetDay, targetPos, targetRoom, otherCourses, strictConflict)
    if (!check.ok) {
      setFeedback({ type: "error", message: check.reason || "Gagal memindahkan jadwal." })
      return
    }

    const rDef = getRoomDef(targetRoom)
    const movedCourse = syncCourseTimesWithSlots(
      {
        ...course,
        day: targetDay,
        room: targetRoom,
        building: rDef ? rDef.buildingName : course.building,
        start_pos: targetPos,
        end_pos: check.endPos,
        start_row: targetPos + 5,
        end_row: check.endPos + 5,
        park_reason: undefined,
      },
      data.days_slots
    )

    const nextCourses = [...otherCourses, movedCourse]
    const nextParked = data.parked_courses.filter((c) => c.id !== course.id)
    const nextMatrix = rebuildMatrixCells(nextCourses, data.days_slots)

    commitData({
      ...data,
      courses: nextCourses,
      parked_courses: nextParked,
      matrix_cells: nextMatrix,
    })

    setFeedback({
      type: "success",
      message: `${movedCourse.display_label} berhasil dipindahkan ke ${targetRoom} (${targetDay}, ${movedCourse.time_display}).`,
    })
  }

  // Handle Drop directly onto another course card (SWAP)
  const handleDropOnCourseCard = (targetCourse: MappedCourse) => {
    setDragOverState(null)
    if (!dragging) return
    if (dragging.courseId === targetCourse.id) {
      setDragging(null)
      return
    }

    const sourceList = dragging.source === "matrix" ? data.courses : data.parked_courses
    const draggedCourse = sourceList.find((c) => c.id === dragging.courseId)
    const dragSource = dragging.source
    setDragging(null)
    if (!draggedCourse) return

    if (dragSource === "parking") {
      // Swap parked course into targetCourse's slot, and move targetCourse to parking
      const remaining = data.courses.filter((c) => c.id !== targetCourse.id)
      const check = validatePlacement(draggedCourse, targetCourse.day, targetCourse.start_pos, targetCourse.room, remaining, strictConflict)
      if (!check.ok) {
        setFeedback({ type: "error", message: `Gagal menukar dari parkir: ${check.reason}` })
        return
      }
      const rDef = getRoomDef(targetCourse.room)
      const placedDragged = syncCourseTimesWithSlots(
        {
          ...draggedCourse,
          day: targetCourse.day,
          room: targetCourse.room,
          building: rDef ? rDef.buildingName : targetCourse.building,
          start_pos: targetCourse.start_pos,
          end_pos: check.endPos,
          start_row: targetCourse.start_pos + 5,
          end_row: check.endPos + 5,
          park_reason: undefined,
        },
        data.days_slots
      )
      const parkedTarget: MappedCourse = {
        ...targetCourse,
        prev_day: targetCourse.day,
        prev_room: targetCourse.room,
        prev_start_pos: targetCourse.start_pos,
        prev_end_pos: targetCourse.end_pos,
        park_reason: `Ditukar dengan ${draggedCourse.display_label}`,
      }
      const nextCourses = [...remaining, placedDragged]
      const nextParked = [...data.parked_courses.filter((c) => c.id !== draggedCourse.id), parkedTarget]
      commitData({
        ...data,
        courses: nextCourses,
        parked_courses: nextParked,
        matrix_cells: rebuildMatrixCells(nextCourses, data.days_slots),
      })
      setFeedback({
        type: "success",
        message: `${placedDragged.display_label} ditempatkan di ${targetCourse.room} dan ${targetCourse.display_label} dipindahkan ke Parkir Sementara.`,
      })
      return
    }

    // Matrix-to-Matrix SWAP
    const remaining = data.courses.filter((c) => c.id !== draggedCourse.id && c.id !== targetCourse.id)
    const checkA = validatePlacement(draggedCourse, targetCourse.day, targetCourse.start_pos, targetCourse.room, remaining, strictConflict)
    if (!checkA.ok) {
      setFeedback({ type: "error", message: `Gagal tukar posisi (${draggedCourse.display_label}): ${checkA.reason}` })
      return
    }

    const rDefTarget = getRoomDef(targetCourse.room)
    const movedA = syncCourseTimesWithSlots(
      {
        ...draggedCourse,
        day: targetCourse.day,
        room: targetCourse.room,
        building: rDefTarget ? rDefTarget.buildingName : targetCourse.building,
        start_pos: targetCourse.start_pos,
        end_pos: checkA.endPos,
        start_row: targetCourse.start_pos + 5,
        end_row: checkA.endPos + 5,
      },
      data.days_slots
    )

    const checkB = validatePlacement(targetCourse, draggedCourse.day, draggedCourse.start_pos, draggedCourse.room, [...remaining, movedA], strictConflict)
    if (!checkB.ok) {
      setFeedback({ type: "error", message: `Gagal tukar posisi (${targetCourse.display_label}): ${checkB.reason}` })
      return
    }

    const rDefSource = getRoomDef(draggedCourse.room)
    const movedB = syncCourseTimesWithSlots(
      {
        ...targetCourse,
        day: draggedCourse.day,
        room: draggedCourse.room,
        building: rDefSource ? rDefSource.buildingName : draggedCourse.building,
        start_pos: draggedCourse.start_pos,
        end_pos: checkB.endPos,
        start_row: draggedCourse.start_pos + 5,
        end_row: checkB.endPos + 5,
      },
      data.days_slots
    )

    const nextCourses = [...remaining, movedA, movedB]
    commitData({
      ...data,
      courses: nextCourses,
      matrix_cells: rebuildMatrixCells(nextCourses, data.days_slots),
    })

    setFeedback({
      type: "success",
      message: `Berhasil tukar posisi: ${movedA.display_label} ↔ ${movedB.display_label}.`,
    })
  }

  // Handle Drop onto Parking Area
  const handleDropOnParking = () => {
    setIsParkingDragOver(false)
    if (!dragging || dragging.source !== "matrix") {
      setDragging(null)
      return
    }
    const course = data.courses.find((c) => c.id === dragging.courseId)
    setDragging(null)
    if (!course) return

    const parkedItem: MappedCourse = {
      ...course,
      prev_day: course.day,
      prev_room: course.room,
      prev_start_pos: course.start_pos,
      prev_end_pos: course.end_pos,
      park_reason: `Diparkir dari ${course.room} (${course.day})`,
    }

    const nextCourses = data.courses.filter((c) => c.id !== course.id)
    const nextParked = [...data.parked_courses, parkedItem]
    commitData({
      ...data,
      courses: nextCourses,
      parked_courses: nextParked,
      matrix_cells: rebuildMatrixCells(nextCourses, data.days_slots),
    })
    setFeedback({
      type: "info",
      message: `${course.display_label} disimpan ke Parkir Sementara. Slot ${course.room} (${course.day}) kini kosong.`,
    })
  }

  // Return parked course to its previous position (or first valid slot)
  const handleRestoreParkedCourse = (parked: MappedCourse) => {
    // 1. Try previous position first
    if (parked.prev_day && parked.prev_room && parked.prev_start_pos) {
      const check = validatePlacement(parked, parked.prev_day, parked.prev_start_pos, parked.prev_room, data.courses, strictConflict)
      if (check.ok) {
        const rDef = getRoomDef(parked.prev_room)
        const restored = syncCourseTimesWithSlots(
          {
            ...parked,
            day: parked.prev_day,
            room: parked.prev_room,
            building: rDef ? rDef.buildingName : parked.building,
            start_pos: parked.prev_start_pos,
            end_pos: check.endPos,
            start_row: parked.prev_start_pos + 5,
            end_row: check.endPos + 5,
            park_reason: undefined,
          },
          data.days_slots
        )
        const nextCourses = [...data.courses, restored]
        const nextParked = data.parked_courses.filter((c) => c.id !== parked.id)
        commitData({
          ...data,
          courses: nextCourses,
          parked_courses: nextParked,
          matrix_cells: rebuildMatrixCells(nextCourses, data.days_slots),
        })
        setFeedback({
          type: "success",
          message: `${restored.display_label} berhasil dikembalikan ke posisi semula (${restored.room}, ${restored.day} ${restored.time_display}).`,
        })
        return
      }
    }

    // 2. Fallback: find first available conflict-free slot across rooms 1-22 then 23-37
    for (const day of DAYS_6) {
      const slots = data.days_slots[day] || []
      for (const slot of slots) {
        if (slot.is_break || slot.pos === null) continue
        for (const roomCode of data.rooms) {
          const check = validatePlacement(parked, day, slot.pos, roomCode, data.courses, strictConflict)
          if (check.ok) {
            const rDef = getRoomDef(roomCode)
            const restored = syncCourseTimesWithSlots(
              {
                ...parked,
                day,
                room: roomCode,
                building: rDef ? rDef.buildingName : parked.building,
                start_pos: slot.pos,
                end_pos: check.endPos,
                start_row: slot.pos + 5,
                end_row: check.endPos + 5,
                park_reason: undefined,
              },
              data.days_slots
            )
            const nextCourses = [...data.courses, restored]
            const nextParked = data.parked_courses.filter((c) => c.id !== parked.id)
            commitData({
              ...data,
              courses: nextCourses,
              parked_courses: nextParked,
              matrix_cells: rebuildMatrixCells(nextCourses, data.days_slots),
            })
            setFeedback({
              type: "success",
              message: `${restored.display_label} ditempatkan ke slot kosong terdekat: ${roomCode} (${day}, ${restored.time_display}).`,
            })
            return
          }
        }
      }
    }

    setFeedback({
      type: "error",
      message: `Tidak ditemukan slot otomatis bebas bentrok untuk ${parked.display_label}. Silakan drag manual ke ruangan tujuan.`,
    })
  }

  // Apply Time Settings Modal
  const handleApplyTimeSettings = () => {
    const recalculated = recalculateMindMappingTimes(data, timeDraft)
    commitData(recalculated)
    setShowTimeModal(false)
    setFeedback({
      type: "success",
      message: `Setting waktu diterapkan (1 SKS = ${recalculated.time_settings.sksMinutes}m • Senin–Kamis mulai ${recalculated.time_settings.regStart} • Jumat siang mulai ${recalculated.time_settings.friAfternoonStart}). Seluruh slot & jam MK diperbarui sinkron.`,
    })
  }

  // Active Room Definitions based on building tab
  const activeRooms: RoomDef[] = useMemo(() => {
    const b = data.buildings.find((item) => item.id === selectedBuilding) || data.buildings[0]
    const codes = b ? b.rooms : data.rooms
    return codes.map((code) => getRoomDef(code)).filter((r): r is RoomDef => Boolean(r))
  }, [data, selectedBuilding])

  const daysToRender = selectedDay === "all" ? (data.metadata.days || DAYS_6) : [selectedDay]
  const totalParkingSlots = Math.max(6, (data.parked_courses?.length || 0) + 2)

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
              if (stored) setData(normalizeLoadedMindMappingData(JSON.parse(stored)))
            } catch {}
            setViewTab("matrix")
          }}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}
        >
          📊 Matriks Visual Mind Mapping (37 Ruang)
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
              if (stored) setData(normalizeLoadedMindMappingData(JSON.parse(stored)))
            } catch {}
          }}
        />
      ) : (
        <>
          {/* Page Introduction */}
          <div className="page-intro" style={{ marginBottom: 14 }}>
            <div>
              <span className="eyebrow">MAP JADWAL GANJIL 2023-2024 • 37 RUANGAN (GEDUNG B, GEDUNG E, SMART CLASS &amp; LAB)</span>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                Mind Mapping Jadwal Perkuliahan
              </h1>
              <p style={{ color: "#475569", marginTop: 4, maxWidth: 820 }}>
                Matriks pemetaan 37 ruangan UPI Kampus Cibiru (Senin–Sabtu). Mendukung <strong>Drag &amp; Drop</strong>, <strong>Parkir Jadwal</strong>, <strong>Setting Waktu</strong>, serta ekspor <strong>CSV Excel, PNG HD, JPG HD, &amp; HTML Offline Dinamis</strong>.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, padding: "8px 14px" }}
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? "Menyusun..." : "⚡ Generate & Unduh HTML"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => {
                  setTimeDraft(data.time_settings || DEFAULT_TIME_SETTINGS)
                  setShowTimeModal(true)
                }}
              >
                ⏱️ Setting Waktu ({data.time_settings?.sksMinutes || 50}m/SKS)
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => exportMindMappingCsv(data)}
              >
                📊 Unduh CSV (Excel)
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => exportMindMappingImage(data, { format: "png", selectedBuilding, selectedDay })}
              >
                🖼️ Unduh PNG (HD)
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => exportMindMappingImage(data, { format: "jpeg", selectedBuilding, selectedDay })}
              >
                📸 Unduh JPG (HD)
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={toggleTvMode}
              >
                {tvFullscreen ? "✕ Keluar TV" : "⛶ Mode TV"}
              </button>
            </div>
          </div>

          {/* Interactive DnD Controls & Feedback Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 12 }}>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700 }}
              >
                ↩ Undo ({undoStack.length})
              </button>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 600, color: "#0f172a" }}>
                <input
                  type="checkbox"
                  checked={strictConflict}
                  onChange={(e) => setStrictConflict(e.target.checked)}
                />
                <span>🛡️ Validasi Konflik Ketat (Dosen &amp; Semester+Kelas)</span>
              </label>
              <span style={{ color: "#64748b" }}>
                Terjadwal: <strong style={{ color: "#0f172a" }}>{data.courses.length} MK</strong> &bull; Parkir: <strong style={{ color: "#d97706" }}>{data.parked_courses?.length || 0} MK</strong>
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11.5, color: "#475569" }}>
              {dragOverState?.status === "valid" ? (
                <span
                  style={{
                    fontWeight: 700,
                    color: "#15803d",
                    background: "#dcfce7",
                    border: "1px solid #86efac",
                    padding: "3px 10px",
                    borderRadius: 6,
                  }}
                >
                  ✓ Bisa di-drop di {dragOverState.room} ({dragOverState.day} Pos {dragOverState.positions[0]})
                </span>
              ) : (
                <span>💡 Drag kartu ke timeline: outline <strong style={{ color: "#16a34a" }}>hijau</strong> = bisa di-drop, <strong style={{ color: "#dc2626" }}>merah</strong> = tidak bisa di-drop. (<code>Ctrl+Z</code> untuk Undo)</span>
              )}
            </div>
          </div>

          {feedback && feedback.type !== "error" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 8,
                marginBottom: 12,
                fontSize: 12.5,
                fontWeight: 600,
                background: feedback.type === "success" ? "#dcfce7" : "#dbeafe",
                color: feedback.type === "success" ? "#166534" : "#1e40af",
                border: `1px solid ${feedback.type === "success" ? "#86efac" : "#93c5fd"}`,
              }}
            >
              <span>
                {feedback.type === "success" ? "✓ " : "ℹ️ "}
                {feedback.message}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {undoStack.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUndo}
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      border: "1px solid currentColor",
                      borderRadius: 6,
                      padding: "3px 9px",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 11.5,
                      color: "inherit",
                    }}
                  >
                    ↩ Undo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", fontWeight: 800, color: "inherit", fontSize: 15 }}
                >
                  &times;
                </button>
              </div>
            </div>
          )}

          {/* Area Tempat Simpan Sementara (Parkir Jadwal) */}
          <section
            className={`parking-dock ${isParkingDragOver ? "drag-over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsParkingDragOver(true)
            }}
            onDragLeave={() => setIsParkingDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              handleDropOnParking()
            }}
          >
            <div className="parking-dock-head">
              <div>
                <strong style={{ fontSize: 13.5, color: "#0f172a" }}>
                  📥 Tempat Simpan Sementara (Parkir Jadwal)
                </strong>
                <span style={{ fontSize: 11.5, color: "#475569", marginLeft: 8 }}>
                  Taruh kartu jadwal di sini untuk mengosongkan slot ruangan, lalu drag kembali ke ruang tujuan (termasuk Lab 23–37) atau klik <strong>↩ Kembalikan</strong>.
                </span>
              </div>
              <span
                style={{
                  background: (data.parked_courses?.length || 0) > 0 ? "#fef3c7" : "#e2e8f0",
                  color: (data.parked_courses?.length || 0) > 0 ? "#92400e" : "#475569",
                  padding: "3px 10px",
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {data.parked_courses?.length || 0} Jadwal Diparkir
              </span>
            </div>

            <div className="parking-slots-grid">
              {(data.parked_courses || []).map((course) => {
                const pal = getProdiPalette(course.prodi)
                return (
                  <div
                    key={course.id}
                    draggable
                    onDragStart={() => setDragging({ courseId: course.id, source: "parking" })}
                    onDragEnd={() => {
                      setDragging(null)
                      setDragOverState(null)
                    }}
                    className={`parking-card ${pal.cssClass}`}
                    title={`${course.course_name} (${course.sks} SKS) - Drag ke slot matriks untuk menempatkan`}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                      <strong style={{ fontSize: 11.5 }}>
                        {course.course_code} • {course.class_name} ({course.sks} SKS)
                      </strong>
                      <span style={{ fontSize: 9.5, fontWeight: 700, opacity: 0.8 }}>{course.prodi}</span>
                    </div>
                    <div style={{ fontSize: 10.5, fontWeight: 600, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {course.course_name}
                    </div>
                    <div style={{ fontSize: 9.5, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {course.lecturer_1}
                    </div>
                    {course.park_reason && (
                      <div style={{ fontSize: 9, opacity: 0.75, marginTop: 2, fontStyle: "italic" }}>
                        {course.park_reason}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleRestoreParkedCourse(course)}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 7px",
                          borderRadius: 4,
                          border: "1px solid rgba(0,0,0,0.2)",
                          background: "rgba(255,255,255,0.85)",
                          color: "#0f172a",
                          cursor: "pointer",
                        }}
                      >
                        ↩ Kembalikan
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCourse(course)}
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "3px 7px",
                          borderRadius: 4,
                          border: "1px solid rgba(0,0,0,0.15)",
                          background: "transparent",
                          color: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* Empty Visible Drop Slots */}
              {Array.from({ length: Math.max(0, totalParkingSlots - (data.parked_courses?.length || 0)) }).map((_, idx) => (
                <div key={`empty-park-${idx}`} className="parking-empty-slot">
                  <span>+ Slot Parkir Kosong</span>
                  <small>Drop kartu MK di sini</small>
                </div>
              ))}
            </div>
          </section>

          {/* Matrix Table Panel */}
          <section className="matrix-panel">
            {/* Building Tabs & Day Filters */}
            <div className="matrix-filter-bar">
              <div className="matrix-tabs-group">
                {data.buildings.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className={`matrix-tab-btn ${selectedBuilding === b.id ? "active" : ""}`}
                    onClick={() => setSelectedBuilding(b.id)}
                  >
                    {b.name} ({b.rooms.length})
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
                  {DAYS_6.map((day) => (
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

            {/* Prodi Legend Bar */}
            <div className="matrix-legend">
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
                  <span className="matrix-legend-dot" style={{ background: "#334155" }} /> Istirahat / Sholat Jumat
                </span>
              </div>
            </div>

            {/* Scrollable Matrix Table (3 Header Rows + HARI, JAM, Pos) */}
            <div className="matrix-scroll-wrapper">
              <table className="mind-mapping-table">
                <thead>
                  {/* Row 1: Label/Nama Ruang/Lab */}
                  <tr>
                    <th className="col-sticky-1" rowSpan={3} style={{ width: 68 }}>
                      HARI
                    </th>
                    <th className="col-sticky-2" rowSpan={3} style={{ width: 100 }}>
                      JAM
                    </th>
                    <th className="col-sticky-3" rowSpan={3} style={{ width: 38 }}>
                      Pos
                    </th>
                    {activeRooms.map((room) => (
                      <th
                        key={`lbl-${room.code}`}
                        style={{
                          background: room.isLab ? "#312e81" : room.buildingId === "gedung-e" ? "#1e3a5f" : "#1e293b",
                          fontSize: 10.5,
                          minWidth: 122,
                        }}
                      >
                        {room.label}
                      </th>
                    ))}
                  </tr>
                  {/* Row 2: Kode Ruang */}
                  <tr>
                    {activeRooms.map((room) => (
                      <th key={`code-${room.code}`}>{room.code}</th>
                    ))}
                  </tr>
                  {/* Row 3: Nomor Urut 1-37 */}
                  <tr className="header-row-num">
                    {activeRooms.map((room) => (
                      <th key={`no-${room.code}`}>{room.no}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {daysToRender.map((day: string, dayIndex: number) => {
                    const slots: SlotDef[] = data.days_slots[day] || []
                    const spannedCells: Record<string, number> = {}

                    return slots.map((slot: SlotDef, slotIdx: number) => {
                      const isFirstSlotOfDay = slotIdx === 0
                      const isBreak = slot.is_break
                      const rowClass = `${isFirstSlotOfDay && dayIndex > 0 ? "day-divider" : ""} ${isBreak ? "row-break" : ""}`

                      return (
                        <tr key={`${day}-${slot.slot}-${slot.time}`} className={rowClass}>
                          {slotIdx === 0 && (
                            <td className="col-sticky-1 col-day" rowSpan={slots.length}>
                              {day.toUpperCase()}
                            </td>
                          )}

                          <td className="col-sticky-2 col-time">{slot.time}</td>
                          <td className="col-sticky-3 col-pos">{isBreak ? "" : slot.pos}</td>

                          {isBreak ? (
                            <td colSpan={activeRooms.length}>
                              <strong>{slot.label || "ISTIRAHAT / BREAK"}</strong>
                            </td>
                          ) : (
                            activeRooms.map((room) => {
                              if (spannedCells[room.code] && spannedCells[room.code] > 0) {
                                spannedCells[room.code]--
                                return null
                              }

                              const cellKey = `${day}|${slot.time}|${room.code}`
                              const courseId = data.matrix_cells[cellKey]
                              const isCellHovered =
                                dragOverState !== null &&
                                dragOverState.day === day &&
                                dragOverState.room === room.code &&
                                slot.pos !== null &&
                                dragOverState.positions.includes(slot.pos)
                              const hoverClass = isCellHovered
                                ? dragOverState.status === "valid"
                                  ? "is-drag-valid"
                                  : "is-drag-invalid"
                                : ""

                              if (!courseId) {
                                return (
                                  <td
                                    key={room.code}
                                    className={`matrix-drop-cell ${hoverClass}`}
                                    onDragOver={(e) => {
                                      e.preventDefault()
                                      if (slot.pos !== null) {
                                        if (
                                          !dragOverState ||
                                          dragOverState.day !== day ||
                                          dragOverState.room !== room.code ||
                                          dragOverState.positions[0] !== slot.pos
                                        ) {
                                          evaluateEmptyCellHover(day, slot.pos, room.code)
                                        }
                                        e.dataTransfer.dropEffect =
                                          dragOverState?.status === "invalid" ? "none" : "move"
                                      }
                                    }}
                                    onDragLeave={() => {
                                      if (
                                        dragOverState &&
                                        dragOverState.day === day &&
                                        dragOverState.room === room.code &&
                                        dragOverState.positions[0] === slot.pos
                                      ) {
                                        setDragOverState(null)
                                      }
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault()
                                      if (slot.pos !== null) {
                                        handleDropOnEmptyCell(day, slot.pos, room.code)
                                      }
                                    }}
                                  />
                                )
                              }

                              const course = data.courses.find((c) => c.id === courseId)
                              if (!course) {
                                return <td key={room.code} />
                              }

                              let isMatch = true
                              if (searchQuery.trim()) {
                                const haystack = `${course.course_code} ${course.class_name} ${course.course_name} ${course.lecturer_1} ${course.lecturer_2} ${course.prodi} ${course.room}`.toLowerCase()
                                isMatch = haystack.includes(searchQuery.trim().toLowerCase())
                              }

                              const spanCount = Math.max(1, course.end_pos - course.start_pos + 1)
                              if (spanCount > 1) {
                                spannedCells[room.code] = spanCount - 1
                              }

                              const pal = getProdiPalette(course.prodi)

                              return (
                                <td
                                  key={room.code}
                                  rowSpan={spanCount}
                                  className={hoverClass}
                                  onDragOver={(e) => {
                                    e.preventDefault()
                                    if (
                                      !dragOverState ||
                                      dragOverState.day !== course.day ||
                                      dragOverState.room !== course.room ||
                                      dragOverState.positions[0] !== course.start_pos
                                    ) {
                                      evaluateCourseSwapHover(course)
                                    }
                                    e.dataTransfer.dropEffect =
                                      dragOverState?.status === "invalid" ? "none" : "move"
                                  }}
                                  onDragLeave={() => {
                                    if (
                                      dragOverState &&
                                      dragOverState.day === course.day &&
                                      dragOverState.room === course.room &&
                                      dragOverState.positions[0] === course.start_pos
                                    ) {
                                      setDragOverState(null)
                                    }
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault()
                                    handleDropOnCourseCard(course)
                                  }}
                                >
                                  <div
                                    draggable
                                    onDragStart={() => setDragging({ courseId: course.id, source: "matrix" })}
                                    onDragEnd={() => {
                                      setDragging(null)
                                      setDragOverState(null)
                                    }}
                                    className={`matrix-course-cell ${pal.cssClass}`}
                                    style={{
                                      opacity: isMatch ? 1 : 0.2,
                                      filter: isMatch ? "none" : "grayscale(1)",
                                    }}
                                    onClick={() => setSelectedCourse(course)}
                                    title={`${course.course_name} (${course.sks} SKS) • ${course.lecturer_1} — Drag untuk pindah/tukar`}
                                  >
                                    <div className="matrix-course-label">
                                      {course.course_code} - {course.class_name} ({course.sks})
                                    </div>
                                    <div style={{ fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      {course.course_name}
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

          {/* Modal: Setting Waktu */}
          {showTimeModal && (
            <div className="course-detail-backdrop" onClick={() => setShowTimeModal(false)}>
              <div className="course-detail-card" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
                <div className="course-detail-head">
                  <h3>⏱️ Setting Waktu Perkuliahan</h3>
                  <button
                    type="button"
                    onClick={() => setShowTimeModal(false)}
                    style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: 20, cursor: "pointer" }}
                  >
                    &times;
                  </button>
                </div>
                <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, fontSize: 13 }}>
                  {/* 1 SKS Duration */}
                  <div className="detail-box">
                    <div className="lbl">Durasi per 1 SKS (Menit, rentang 15–120)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                      <input
                        type="number"
                        min={15}
                        max={120}
                        value={timeDraft.sksMinutes}
                        onChange={(e) => setTimeDraft({ ...timeDraft, sksMinutes: Number(e.target.value) })}
                        style={{ width: 90, padding: "6px 10px", borderRadius: 6, border: "1px solid #475569", background: "#1e293b", color: "#fff", fontWeight: 700 }}
                      />
                      <div style={{ display: "flex", gap: 6 }}>
                        {[50, 45, 40, 60].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setTimeDraft({ ...timeDraft, sksMinutes: m })}
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              border: timeDraft.sksMinutes === m ? "1px solid #38bdf8" : "1px solid #475569",
                              background: timeDraft.sksMinutes === m ? "#2563eb" : "#1e293b",
                              color: "#fff",
                            }}
                          >
                            {m}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Senin - Kamis (& Sabtu) */}
                  <div className="detail-box">
                    <div className="lbl" style={{ color: "#38bdf8" }}>Pengaturan Hari Senin–Kamis (&amp; Sabtu)</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "#cbd5e1", marginBottom: 4 }}>Jam Mulai Kuliah Pagi</label>
                        <input
                          type="time"
                          value={timeDraft.regStart}
                          onChange={(e) => setTimeDraft({ ...timeDraft, regStart: e.target.value })}
                          style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #475569", background: "#1e293b", color: "#fff" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "#cbd5e1", marginBottom: 4 }}>Durasi Istirahat Siang (Menit)</label>
                        <input
                          type="number"
                          min={0}
                          max={180}
                          value={timeDraft.regBreakMinutes}
                          onChange={(e) => setTimeDraft({ ...timeDraft, regBreakMinutes: Number(e.target.value) })}
                          style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #475569", background: "#1e293b", color: "#fff" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Khusus Hari Jumat */}
                  <div className="detail-box">
                    <div className="lbl" style={{ color: "#fbbf24" }}>Pengaturan Khusus Hari Jumat (Sholat Jumat)</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "#cbd5e1", marginBottom: 4 }}>Jam Mulai Pagi Jumat</label>
                        <input
                          type="time"
                          value={timeDraft.friStart}
                          onChange={(e) => setTimeDraft({ ...timeDraft, friStart: e.target.value })}
                          style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #475569", background: "#1e293b", color: "#fff" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "#cbd5e1", marginBottom: 4 }}>Jam Mulai Siang (Usai Sholat Jumat)</label>
                        <input
                          type="time"
                          value={timeDraft.friAfternoonStart}
                          onChange={(e) => setTimeDraft({ ...timeDraft, friAfternoonStart: e.target.value })}
                          style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #475569", background: "#1e293b", color: "#fff" }}
                        />
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 11.5, color: "#94a3b8", margin: 0 }}>
                    Saat diterapkan, seluruh label jam slot, <code>matrix_cells</code>, dan <code>time_display</code> semua mata kuliah (termasuk yang sedang diparkir) otomatis terhitung ulang secara sinkron.
                  </p>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button type="button" className="btn btn-outline" onClick={() => setShowTimeModal(false)}>
                      Batal
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleApplyTimeSettings}>
                      ✓ Terapkan &amp; Hitung Ulang
                    </button>
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
                    <div className="val">{selectedCourse.day}, {selectedCourse.time_display} WIB (Pos {selectedCourse.start_pos}–{selectedCourse.end_pos})</div>
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
              <div className="course-detail-card" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
                <div className="course-detail-head">
                  <h3>{isApproved && !hasConflicts ? "✓ File Mind Mapping Offline Siap" : "⚠ Peringatan Generate"}</h3>
                  <button
                    type="button"
                    onClick={() => setShowGenModal(false)}
                    style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: 20, cursor: "pointer" }}
                  >
                    &times;
                  </button>
                </div>
                <div style={{ padding: 20 }}>
                  <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5, marginBottom: 16 }}>
                    File HTML Offline dinamis (37 Ruangan • 2023/2024) telah diunduh membawa kondisi jadwal terbaru Anda ({data.courses.length} MK terjadwal, 1 SKS = {data.time_settings.sksMinutes} menit).
                  </p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-secondary" onClick={downloadOfflineHtml}>
                      Unduh Ulang HTML
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => setShowGenModal(false)}>
                      Selesai
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Floating Bottom-Right Alert when schedule cannot be dropped */}
          {(dragOverState?.status === "invalid" || feedback?.type === "error") && (
            <div
              role="alert"
              style={{
                position: "fixed",
                bottom: 22,
                right: 22,
                zIndex: 9999,
                maxWidth: 420,
                background: "#991b1b",
                color: "#fef2f2",
                border: "2px solid #ef4444",
                borderRadius: 12,
                padding: "12px 16px",
                boxShadow: "0 12px 32px rgba(153, 27, 27, 0.45)",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                pointerEvents: dragOverState?.status === "invalid" ? "none" : "auto",
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1.2, flexShrink: 0 }}>⚠️</span>
              <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.45 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 2, color: "#ffffff" }}>
                  Jadwal Tidak Bisa Di-Drop
                </div>
                <div>
                  {dragOverState?.status === "invalid"
                    ? dragOverState.reason || "Slot waktu tidak valid atau terjadi bentrok."
                    : feedback?.message}
                </div>
              </div>
              {dragOverState?.status !== "invalid" && (
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fecaca",
                    fontSize: 18,
                    fontWeight: 800,
                    cursor: "pointer",
                    lineHeight: 1,
                    padding: 0,
                  }}
                  aria-label="Tutup peringatan"
                >
                  &times;
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
