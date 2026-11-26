import { useState, useMemo, useEffect } from "react"
import mindMappingData from "./mindMappingData.json"
import { KaprodiScheduleIntegrator } from "./KaprodiScheduleIntegrator"

type Props = {
  go: (page: string) => void
}

export function AdminMindMapping({ go }: Props) {
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem("rpl-mind-mapping-data")
      return stored ? JSON.parse(stored) : mindMappingData
    } catch {
      return mindMappingData
    }
  })

  // Listen to cross-tab or component updates
  useEffect(() => {
    const reloadData = () => {
      try {
        const stored = localStorage.getItem("rpl-mind-mapping-data")
        if (stored) setData(JSON.parse(stored))
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
    for (const b of data.buildings) {
      if (b.id !== "all" && b.rooms.includes(roomName)) return b.name
    }
    return "Gedung Kampus"
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
          <p style={{ color: "#475569", marginTop: 4, maxWidth: 800 }}>
            Visualisasi pemetaan jadwal perkuliahan seluruh program studi UPI Kampus Cibiru. Mengikuti format sheet <code>MAPPING</code> Excel referensi (Gedung C, D, F, H, I, dan Lab).
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
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                className={`matrix-day-btn ${selectedDay === "all" ? "active" : ""}`}
                onClick={() => setSelectedDay("all")}
              >
                Senin–Jumat
              </button>
              {["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].map((day) => (
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
              <span className="matrix-legend-dot" style={{ background: "#334155" }} /> Istirahat / Break
            </span>
          </div>
        </div>

        {/* Scrollable Matrix Table */}
        <div className="matrix-scroll-wrapper">
          <table className="mind-mapping-table">
            <thead>
              {/* Row 1: Buildings Header */}
              <tr>
                <th className="col-sticky-1" rowSpan={2} style={{ width: 70 }}>
                  HARI
                </th>
                <th className="col-sticky-2" rowSpan={2} style={{ width: 95 }}>
                  JAM
                </th>
                {buildingGroups.map((bg, idx) => (
                  <th key={idx} colSpan={bg.count}>
                    {bg.name.toUpperCase()}
                  </th>
                ))}
              </tr>
              {/* Row 2: Room Codes Header */}
              <tr>
                {activeRooms.map((room: string) => (
                  <th key={room}>{room}</th>
                ))}
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
                    <tr key={`${day}-${slot.time}`} className={rowClass}>
                      {/* Column 1: Hari (Spans all slots of this day) */}
                      {slotIdx === 0 && (
                        <td className="col-sticky-1 col-day" rowSpan={slots.length}>
                          {day.toUpperCase()}
                        </td>
                      )}

                      {/* Column 2: Jam */}
                      <td className="col-sticky-2 col-time">{slot.time}</td>

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

                          if (!courseId) {
                            return <td key={room} />
                          }

                          const course = data.courses.find((c: any) => c.id === courseId)
                          if (!course) {
                            return <td key={room} />
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

                          return (
                            <td key={room} rowSpan={spanCount}>
                              <div
                                className={`matrix-course-cell ${cardTheme}`}
                                style={{
                                  opacity: isMatch ? 1 : 0.2,
                                  filter: isMatch ? "none" : "grayscale(1)",
                                }}
                                onClick={() => setSelectedCourse(course)}
                                title={`${course.course_name} (${course.lecturer_1})`}
                              >
                                <div className="matrix-course-label">{course.display_label}</div>
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
