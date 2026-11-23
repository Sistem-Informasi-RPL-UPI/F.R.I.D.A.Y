import { useEffect, useState, type ReactNode } from "react"
import { AdminMindMapping } from "./AdminMindMapping"
import { KaprodiScheduleIntegrator } from "./KaprodiScheduleIntegrator"

type IconName = "grid" | "file" | "box" | "history" | "bell" | "settings" | "search" | "arrow" | "clock" | "check" | "calendar" | "users" | "chart" | "plus" | "download" | "filter" | "menu" | "x" | "chevron" | "logout" | "eye" | "upload"

type Status = "Menunggu" | "Sedang Ditinjau" | "Disetujui" | "Ditolak" | "Selesai" | "Berhasil"

type LetterRequest = {
  id: string
  name: string
  student: string
  company: string
  startDate: string
  endDate: string
  purpose: string
  submittedAt: string
  status: Status
}

type LoanRequest = {
  id: string
  resource: string
  resourceType: "Ruangan" | "Barang"
  student: string
  date: string
  endDate?: string
  startTime: string
  endTime: string
  quantity?: number
  purpose: string
  location: string
  status: Status
  requestType?: "Organisasi" | "Perkuliahan"
  scheduleMode?: "Satu kali" | "Jadwal tetap"
  program?: string
  course?: string
  className?: string
  lecturer?: string
  originalScheduleId?: string
  originalRoom?: string
  originalDate?: string
  originalStartTime?: string
  originalEndTime?: string
}

type AcademicSchedule = {
  id: string
  program: string
  course: string
  className: string
  lecturer: string
  day: number
  dayName: string
  startTime: string
  endTime: string
  roomCode: string
}

const academicSchedules: AcademicSchedule[] = [
  { id: "JDW001", program: "RPL", course: "Pemrograman Web", className: "RPL 3A", lecturer: "Dosen A", day: 2, dayName: "Selasa", startTime: "08:00", endTime: "10:00", roomCode: "B.01.001" },
  { id: "JDW002", program: "RPL", course: "Basis Data", className: "RPL 3A", lecturer: "Dosen B", day: 3, dayName: "Rabu", startTime: "08:00", endTime: "10:00", roomCode: "B.02.002" },
  { id: "JDW003", program: "RPL", course: "Rekayasa Kebutuhan", className: "RPL 2B", lecturer: "Dosen C", day: 1, dayName: "Senin", startTime: "13:00", endTime: "16:00", roomCode: "A.01.003" },
  { id: "JDW004", program: "RPL", course: "Interaksi Manusia Komputer", className: "RPL 3B", lecturer: "Dosen D", day: 4, dayName: "Kamis", startTime: "10:00", endTime: "12:00", roomCode: "N.01.005" },
  { id: "JDW005", program: "PGSD", course: "Media Pembelajaran", className: "PGSD 2A", lecturer: "Dosen E", day: 2, dayName: "Selasa", startTime: "10:00", endTime: "12:00", roomCode: "B.01.001" },
  { id: "JDW006", program: "PGSD", course: "Pendidikan Matematika", className: "PGSD 3B", lecturer: "Dosen F", day: 1, dayName: "Senin", startTime: "08:00", endTime: "10:00", roomCode: "B.02.003" },
  { id: "JDW007", program: "PGSD", course: "Literasi Dasar", className: "PGSD 1A", lecturer: "Dosen G", day: 4, dayName: "Kamis", startTime: "13:00", endTime: "15:00", roomCode: "A.02.001" },
  { id: "JDW008", program: "PGPAUD", course: "Perkembangan Anak", className: "PGPAUD 2A", lecturer: "Dosen H", day: 2, dayName: "Selasa", startTime: "08:00", endTime: "10:00", roomCode: "N.02.002" },
  { id: "JDW009", program: "PGPAUD", course: "Bermain dan Permainan", className: "PGPAUD 3A", lecturer: "Dosen I", day: 3, dayName: "Rabu", startTime: "10:00", endTime: "12:00", roomCode: "A.01.004" },
  { id: "JDW010", program: "PGPAUD", course: "Seni Anak Usia Dini", className: "PGPAUD 1B", lecturer: "Dosen J", day: 5, dayName: "Jumat", startTime: "13:00", endTime: "15:00", roomCode: "N.01.006" },
  { id: "JDW011", program: "PMM", course: "Produksi Media Digital", className: "PMM 2A", lecturer: "Dosen K", day: 1, dayName: "Senin", startTime: "10:00", endTime: "13:00", roomCode: "B.03.006" },
  { id: "JDW012", program: "PMM", course: "Desain Grafis", className: "PMM 1A", lecturer: "Dosen L", day: 3, dayName: "Rabu", startTime: "13:00", endTime: "16:00", roomCode: "B.03.002" },
  { id: "JDW013", program: "PMM", course: "Sinematografi", className: "PMM 3B", lecturer: "Dosen M", day: 4, dayName: "Kamis", startTime: "08:00", endTime: "11:00", roomCode: "N.03.005" },
  { id: "JDW014", program: "TEKKOM", course: "Jaringan Komputer", className: "TEKKOM 2A", lecturer: "Dosen N", day: 2, dayName: "Selasa", startTime: "13:00", endTime: "16:00", roomCode: "B.04.002" },
  { id: "JDW015", program: "TEKKOM", course: "Sistem Digital", className: "TEKKOM 1B", lecturer: "Dosen O", day: 3, dayName: "Rabu", startTime: "08:00", endTime: "11:00", roomCode: "A.03.004" },
  { id: "JDW016", program: "TEKKOM", course: "Komunikasi Data", className: "TEKKOM 3A", lecturer: "Dosen P", day: 5, dayName: "Jumat", startTime: "10:00", endTime: "13:00", roomCode: "B.05.001" },
]

function getAcademicSchedules() {
  return loadStored<AcademicSchedule[]>("rpl-academic-schedules", academicSchedules)
}

type AppNotification = {
  id: string
  title: string
  text: string
  time: string
  read: boolean
  kind: "letter" | "loan" | "info"
}

const initialLetters: LetterRequest[] = [
  { id: "RPL/SRT/2025/0148", name: "Surat Pengantar Magang", student: "Alya Rahmadani", company: "PT Teknologi Nusantara", startDate: "2025-07-01", endDate: "2025-09-30", purpose: "Keperluan magang mandiri", submittedAt: "2025-06-12", status: "Sedang Ditinjau" },
  { id: "RPL/SRT/2025/0121", name: "Surat Keterangan Mahasiswa", student: "Alya Rahmadani", company: "Beasiswa Prestasi", startDate: "2025-05-28", endDate: "2025-05-30", purpose: "Persyaratan beasiswa", submittedAt: "2025-05-28", status: "Selesai" },
]

const initialLoans: LoanRequest[] = [
  { id: "RPL/PJM/2025/0092", resource: "Laboratorium Multimedia", resourceType: "Ruangan", student: "Alya Rahmadani", date: "2025-06-18", startTime: "10:00", endTime: "12:00", purpose: "Produksi video tugas akhir", location: "Gedung RPL, Lantai 2", status: "Disetujui" },
  { id: "RPL/PJM/2025/0087", resource: "Kamera Sony Alpha A6400", resourceType: "Barang", student: "Alya Rahmadani", date: "2025-06-20", endDate: "2025-06-22", startTime: "08:00", endTime: "15:00", quantity: 1, purpose: "Dokumentasi proyek", location: "Laboratorium Multimedia", status: "Menunggu" },
  { id: "RPL/PJM/2025/0093", resource: "Laboratorium RPL (B.01.004)", resourceType: "Ruangan", student: "Alya Rahmadani", date: "2025-06-25", startTime: "13:00", endTime: "15:00", purpose: "Penyesuaian satu pertemuan karena kegiatan institusi.", location: "Gedung Biru, Lantai 1", status: "Berhasil", requestType: "Perkuliahan", scheduleMode: "Satu kali", program: "RPL", course: "Basis Data", className: "RPL 3A", lecturer: "Dosen B", originalScheduleId: "JDW002", originalRoom: "B.02.002", originalDate: "2025-06-25", originalStartTime: "08:00", originalEndTime: "10:00" },
  { id: "RPL/PJM/2025/0094", resource: "Ruang Seminar (B.02.003)", resourceType: "Ruangan", student: "Nadia Putri", date: "2025-07-01", startTime: "10:00", endTime: "12:00", purpose: "Perubahan jadwal reguler Media Pembelajaran.", location: "Gedung Biru, Lantai 2", status: "Menunggu", requestType: "Perkuliahan", scheduleMode: "Jadwal tetap", program: "PGSD", course: "Media Pembelajaran", className: "PGSD 2A", lecturer: "Dosen E", originalScheduleId: "JDW005", originalRoom: "B.01.001", originalDate: "2025-07-01", originalStartTime: "10:00", originalEndTime: "12:00" },
  { id: "RPL/PJM/2025/0095", resource: "Studio Pembelajaran (N.03.006)", resourceType: "Ruangan", student: "Raka Pratama", date: "2025-06-27", startTime: "13:00", endTime: "16:00", purpose: "Workshop produksi film pendek mahasiswa.", location: "Gedung Baru, Lantai 3", status: "Disetujui", requestType: "Organisasi", scheduleMode: "Satu kali", program: "PMM", course: "Komunitas Sinema Kampus" },
  { id: "RPL/PJM/2025/0096", resource: "Ruang Kolaborasi (A.02.005)", resourceType: "Ruangan", student: "Bagas Saputra", date: "2025-07-05", startTime: "09:00", endTime: "12:00", purpose: "Pelatihan instalasi jaringan untuk anggota baru.", location: "Gedung Abu, Lantai 2", status: "Menunggu", requestType: "Organisasi", scheduleMode: "Satu kali", program: "TEKKOM", course: "Himpunan Mahasiswa TEKKOM" },
  { id: "RPL/PJM/2025/0097", resource: "Ruang Perkuliahan (N.02.001)", resourceType: "Ruangan", student: "Salsa Aulia", date: "2025-06-26", startTime: "08:00", endTime: "10:00", purpose: "Pemindahan pertemuan Perkembangan Anak.", location: "Gedung Baru, Lantai 2", status: "Berhasil", requestType: "Perkuliahan", scheduleMode: "Satu kali", program: "PGPAUD", course: "Perkembangan Anak", className: "PGPAUD 2A", lecturer: "Dosen H", originalScheduleId: "JDW008", originalRoom: "N.02.002", originalDate: "2025-06-24", originalStartTime: "08:00", originalEndTime: "10:00" },
]

const initialNotifications: AppNotification[] = [
  { id: "n1", title: "Peminjaman ruangan disetujui", text: "Permohonan Laboratorium Multimedia pada 18 Juni 2025 telah disetujui.", time: "12 menit lalu", read: false, kind: "loan" },
  { id: "n2", title: "Pengajuan surat sedang ditinjau", text: "Surat Pengantar Magang sedang diperiksa oleh admin layanan.", time: "2 jam lalu", read: false, kind: "letter" },
  { id: "n3", title: "Penyesuaian jam layanan", text: "Layanan administrasi hari Jumat tersedia hingga pukul 15.00 WIB.", time: "Kemarin", read: true, kind: "info" },
]

function formatDate(value: string) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`))
}

function statusTone(status: Status): "warning" | "success" | "danger" | "info" | "neutral" {
  if (status === "Ditolak") return "danger"
  if (status === "Disetujui" || status === "Selesai" || status === "Berhasil") return "success"
  if (status === "Menunggu") return "warning"
  if (status === "Sedang Ditinjau") return "info"
  return "neutral"
}

function loadStored<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) as T : fallback
  } catch {
    return fallback
  }
}

const paths: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </>
  ),
  box: (
    <>
      <path d="m21 8-9-5-9 5 9 5 9-5Z" />
      <path d="m3 8 9 5 9-5M3 8v8l9 5 9-5V8M12 13v8" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
    </>
  ),
  filter: <path d="M4 5h16l-6 7v5l-4 2v-7Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 15v5h16v-5" />
    </>
  ),
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  type = "button",
  disabled = false,
}: {
  children: ReactNode
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  icon?: IconName
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
}) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
    </button>
  )
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: "warning" | "success" | "danger" | "info" | "neutral"
}) {
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" />
      {children}
    </span>
  )
}

function Field({
  label,
  placeholder,
  value,
  required,
  error,
  type = "text",
  onChange,
  min,
}: {
  label: string
  placeholder?: string
  value?: string
  required?: boolean
  error?: string
  type?: string
  onChange?: (value: string) => void
  min?: string
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <b> *</b>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={onChange ? value : undefined}
        defaultValue={onChange ? undefined : value}
        min={min}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      />
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

function SelectField({
  label,
  value,
  options = [],
  onChange,
  required = false,
}: {
  label: string
  value?: string
  options?: string[]
  onChange?: (value: string) => void
  required?: boolean
}) {
  return (
    <label className="field">
      <span>{label}{required && <b> *</b>}</span>
      <select value={onChange ? value : undefined} defaultValue={onChange ? undefined : value} onChange={onChange ? (event) => onChange(event.target.value) : undefined}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}

const studentNav = [
  { id: "dashboard", label: "Dashboard", icon: "grid" as IconName },
  { id: "letters", label: "Layanan Pengajuan Surat", icon: "file" as IconName },
  {
    id: "resources",
    label: "Peminjaman Barang & Ruangan",
    icon: "box" as IconName,
  },
  {
    id: "letter-history",
    label: "Riwayat Pengajuan",
    icon: "history" as IconName,
  },
  {
    id: "loan-history",
    label: "Riwayat Peminjaman",
    icon: "calendar" as IconName,
  },
  { id: "notifications", label: "Notifikasi", icon: "bell" as IconName },
  { id: "settings", label: "Pengaturan akun", icon: "settings" as IconName },
]

const adminNav = [
  { id: "admin", label: "Dashboard Admin", icon: "grid" as IconName },
  {
    id: "admin-letters",
    label: "Data Pengajuan Surat",
    icon: "file" as IconName,
  },
  { id: "admin-loans", label: "Data Peminjaman", icon: "calendar" as IconName },
  {
    id: "admin-resources",
    label: "Manajemen Barang & Ruangan",
    icon: "box" as IconName,
  },
  {
    id: "admin-schedule",
    label: "Jadwal dan Ketersediaan",
    icon: "clock" as IconName,
  },
  {
    id: "admin-mind-mapping",
    label: "Mind Mapping Jadwal",
    icon: "grid" as IconName,
  },
  { id: "components", label: "Komponen UI", icon: "chart" as IconName },
]

function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <span>R</span>
      </div>
      <div>
        <strong>Sistem Informasi</strong>
        <span>Rekayasa Perangkat Lunak</span>
      </div>
    </div>
  )
}

function Sidebar({
  page,
  setPage,
  role,
  mobile,
  close,
}: {
  page: string
  setPage: (p: string) => void
  role: "student" | "admin"
  mobile: boolean
  close: () => void
}) {
  const nav = role === "student" ? studentNav : adminNav
  return (
    <aside className={`sidebar ${mobile ? "sidebar-open" : ""}`}>
      <div className="sidebar-head">
        <Logo />
        <button
          className="icon-btn mobile-only"
          onClick={close}
          aria-label="Tutup menu"
        >
          <Icon name="x" />
        </button>
      </div>
      <span className="nav-label">MENU UTAMA</span>
      <nav>
        {nav.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => {
              setPage(item.id)
              close()
            }}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.id === "notifications" && <i>3</i>}
          </button>
        ))}
      </nav>
      <div className="sidebar-help">
        <div className="help-icon">?</div>
        <strong>Butuh bantuan?</strong>
        <span>Hubungi pusat layanan akademik.</span>
        <Button variant="outline">Pusat Bantuan</Button>
      </div>
      <button className="logout">
        <Icon name="logout" />
        <span>Keluar</span>
      </button>
    </aside>
  )
}

function Header({
  title,
  role,
  setRole,
  openMenu,
}: {
  title: string
  role: "student" | "admin"
  setRole: (r: "student" | "admin") => void
  openMenu: () => void
}) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <button
          className="icon-btn mobile-only"
          onClick={openMenu}
          aria-label="Buka menu"
        >
          <Icon name="menu" />
        </button>
        <div>
          <span>Sistem Informasi RPL</span>
          <strong>{title}</strong>
        </div>
      </div>
      <div className="header-actions">
        <button
          className="role-switch"
          onClick={() => setRole(role === "student" ? "admin" : "student")}
        >
          {role === "student" ? "Mode Mahasiswa" : "Mode Admin"}
          <Icon name="chevron" size={15} />
        </button>
        <button className="icon-btn notification" aria-label="Notifikasi">
          <Icon name="bell" />
          <i />
        </button>
        <div className="profile">
          <div className="avatar">AR</div>
          <div>
            <strong>
              {role === "student" ? "Alya Rahmadani" : "Dimas Pratama"}
            </strong>
            <span>
              {role === "student" ? "Mahasiswa · 2201024" : "Admin Layanan"}
            </span>
          </div>
          <Icon name="chevron" size={16} />
        </div>
      </div>
    </header>
  )
}

function StatCard({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: IconName
  label: string
  value: string
  note: string
  tone: string
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon name={icon} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  )
}

const activities = [
  [
    "12 Jun 2025",
    "Surat Pengantar Magang",
    "RPL/SRT/2025/0148",
    "Sedang Ditinjau",
    "info",
  ],
  [
    "10 Jun 2025",
    "Peminjaman Lab Multimedia",
    "RPL/PJM/2025/0092",
    "Disetujui",
    "success",
  ],
  [
    "28 Mei 2025",
    "Surat Keterangan Mahasiswa",
    "RPL/SRT/2025/0121",
    "Selesai",
    "neutral",
  ],
]

function ActivityTable({
  admin = false,
  rows = activities,
}: {
  admin?: boolean
  rows?: string[][]
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {admin && <th>Mahasiswa</th>}
            <th>Tanggal</th>
            <th>Aktivitas</th>
            <th>Nomor Referensi</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r[2]}>
              {admin && (
                <td>
                  <strong>
                    {["Nadia Putri", "Rizky Maulana", "Fajar Aditya"][i]}
                  </strong>
                </td>
              )}
              <td>{r[0]}</td>
              <td>
                <strong>{r[1]}</strong>
              </td>
              <td className="mono">{r[2]}</td>
              <td>
                  <Badge tone={r[4] as "warning" | "success" | "danger" | "info" | "neutral"}>
                  {r[3]}
                </Badge>
              </td>
              <td>
                <button className="row-action" aria-label="Lihat detail">
                  <Icon name="chevron" size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Dashboard({
  go,
  letters,
  loans,
}: {
  go: (p: string) => void
  letters: LetterRequest[]
  loans: LoanRequest[]
}) {
  const recentRows = [
    ...letters.map((item) => [formatDate(item.submittedAt), item.name, item.id, item.status, statusTone(item.status)]),
    ...loans.map((item) => [formatDate(item.date), item.resource, item.id, item.status, statusTone(item.status)]),
  ].slice(0, 4)
  return (
    <div className="page">
      <section className="welcome">
        <div>
          <span className="eyebrow">RABU, 18 JUNI 2025</span>
          <h1>Halo, Alya Rahmadani</h1>
          <p>
            Pantau layanan administrasi dan peminjaman laboratoriummu dalam satu
            tempat.
          </p>
        </div>
        <div className="welcome-art">
          <span />
          <span />
          <Icon name="file" size={38} />
        </div>
      </section>
      <section className="stats">
        <StatCard
          icon="file"
          label="Pengajuan Surat Aktif"
          value={String(letters.filter((item) => !["Selesai", "Ditolak"].includes(item.status)).length)}
          note="Tersinkron dengan admin"
          tone="blue"
        />
        <StatCard
          icon="check"
          label="Surat Selesai"
          value={String(letters.filter((item) => ["Selesai", "Disetujui"].includes(item.status)).length)}
          note="Semester ini"
          tone="green"
        />
        <StatCard
          icon="box"
          label="Peminjaman Aktif"
          value={String(loans.filter((item) => item.status === "Disetujui").length)}
          note="Jadwal terkonfirmasi"
          tone="sky"
        />
        <StatCard
          icon="clock"
          label="Menunggu Persetujuan"
          value={String([...letters, ...loans].filter((item) => item.status === "Menunggu").length)}
          note="Perlu ditinjau admin"
          tone="yellow"
        />
      </section>
      <section className="quick-actions">
        <div>
          <span className="eyebrow">AKSES CEPAT</span>
          <h2>Apa yang ingin kamu lakukan?</h2>
          <p>Mulai pengajuan baru dengan memilih layanan di samping.</p>
        </div>
        <button
          className="action-card primary-action"
          onClick={() => go("letters")}
        >
          <span className="action-icon">
            <Icon name="file" />
          </span>
          <span>
            <strong>Ajukan Surat</strong>
            <small>Buat pengajuan surat akademik baru</small>
          </span>
          <Icon name="arrow" />
        </button>
        <button className="action-card" onClick={() => go("resources")}>
          <span className="action-icon">
            <Icon name="box" />
          </span>
          <span>
            <strong>Pinjam Barang / Ruangan</strong>
            <small>Cek jadwal dan ketersediaan lab</small>
          </span>
          <Icon name="arrow" />
        </button>
      </section>
      <div className="content-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Aktivitas Terbaru</h2>
              <p>Perkembangan layanan terakhirmu</p>
            </div>
            <Button variant="ghost" onClick={() => go("letter-history")}>
              Lihat semua <Icon name="arrow" size={16} />
            </Button>
          </div>
          <ActivityTable rows={recentRows} />
        </section>
        <aside className="panel info-panel">
          <div className="panel-head">
            <div>
              <h2>Informasi</h2>
              <p>Pengumuman untukmu</p>
            </div>
            <span className="soft-icon">
              <Icon name="bell" />
            </span>
          </div>
          <div className="announcement">
            <span className="announcement-date">17 JUN</span>
            <div>
              <strong>Penyesuaian jam layanan</strong>
              <p>
                Layanan administrasi hari Jumat tersedia hingga pukul 15.00 WIB.
              </p>
              <button>Baca selengkapnya</button>
            </div>
          </div>
          <div className="announcement">
            <span className="announcement-date blue-date">14 JUN</span>
            <div>
              <strong>Pengembalian alat laboratorium</strong>
              <p>
                Pastikan barang dikembalikan sesuai jadwal dan dalam kondisi
                baik.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

const letterTypes = [
  [
    "Surat Keterangan Mahasiswa",
    "Dokumen yang menerangkan status aktif sebagai mahasiswa.",
    "KTM aktif, bukti registrasi",
  ],
  [
    "Surat Pengantar Magang",
    "Surat pengantar resmi untuk keperluan magang atau kerja praktik.",
    "Proposal magang, data perusahaan",
  ],
  [
    "Surat Dispensasi",
    "Permohonan dispensasi untuk kegiatan akademik tertentu.",
    "Bukti kegiatan, surat undangan",
  ],
]

function PageIntro({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow?: string
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className="page-intro">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </div>
  )
}

function Toolbar({
  placeholder = "Cari berdasarkan nama atau nomor referensi...",
}: {
  placeholder?: string
}) {
  return (
    <div className="toolbar">
      <label className="search">
        <Icon name="search" />
        <input placeholder={placeholder} />
      </label>
      <Button variant="outline" icon="filter">
        Filter
      </Button>
    </div>
  )
}

function Letters({ go }: { go: (p: string) => void }) {
  return (
    <div className="page">
      <PageIntro
        eyebrow="LAYANAN AKADEMIK"
        title="Layanan Pengajuan Surat"
        text="Pilih jenis surat yang kamu butuhkan dan lengkapi persyaratannya secara daring."
      />
      <Toolbar placeholder="Cari jenis surat..." />
      <div className="letter-grid">
        {letterTypes.map((l, i) => (
          <article className="letter-card" key={l[0]}>
            <div className={`letter-symbol symbol-${i}`}>
              <Icon name="file" size={26} />
            </div>
            <div className="letter-content">
              <span className="label">LAYANAN SURAT</span>
              <h2>{l[0]}</h2>
              <p>{l[1]}</p>
              <div className="requirement">
                <Icon name="check" size={16} />
                <span>
                  <strong>Dokumen persyaratan</strong>
                  {l[2]}
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={() => go("letter-form")}>
              Ajukan Surat <Icon name="arrow" size={16} />
            </Button>
          </article>
        ))}
      </div>
      <div className="note">
        <span className="soft-icon">
          <Icon name="bell" />
        </span>
        <div>
          <strong>Perlu diketahui</strong>
          <p>
            Jenis layanan dan persyaratan dapat berubah sesuai kebijakan
            institusi. Pastikan dokumen yang diunggah terbaca jelas.
          </p>
        </div>
      </div>
    </div>
  )
}

function Steps({ current = 1 }: { current?: number }) {
  return (
    <div className="steps">
      {["Data Pengajuan", "Dokumen", "Konfirmasi"].map((s, i) => (
        <div
          className={`${i + 1 <= current ? "done" : ""} ${
            i + 1 === current ? "current" : ""
          }`}
          key={s}
        >
          <span>
            {i + 1 < current ? <Icon name="check" size={15} /> : i + 1}
          </span>
          <strong>{s}</strong>
          {i < 2 && <i />}
        </div>
      ))}
    </div>
  )
}

function LetterForm({
  go,
  onSubmit,
}: {
  go: (p: string) => void
  onSubmit: (request: Omit<LetterRequest, "id" | "submittedAt" | "status">) => void
}) {
  const [company, setCompany] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const canSubmit = company.trim() && startDate && endDate && endDate >= startDate
  return (
    <div className="page narrow">
      <button className="back" onClick={() => go("letters")}>
        Layanan Pengajuan Surat <Icon name="chevron" size={15} /> Formulir
        Pengajuan
      </button>
      <PageIntro
        title="Formulir Pengajuan Surat"
        text="Surat Pengantar Magang · Lengkapi informasi dan dokumen di bawah ini."
      />
      <Steps />
      <section className="form-panel">
        <div className="section-head">
          <span>01</span>
          <div>
            <h2>Informasi Mahasiswa</h2>
            <p>Data berikut disesuaikan dengan akun akademikmu.</p>
          </div>
        </div>
        <div className="form-grid">
          <Field label="Nama Lengkap" value="Alya Rahmadani" required />
          <Field label="Nomor Induk Mahasiswa" value="2201024" required />
          <Field label="Program Studi" value="Rekayasa Perangkat Lunak" />
          <Field label="Email Mahasiswa" value="alya.rahmadani@kampus.ac.id" />
        </div>
      </section>
      <section className="form-panel">
        <div className="section-head">
          <span>02</span>
          <div>
            <h2>Detail Pengajuan</h2>
            <p>Berikan informasi yang sesuai dengan kebutuhan surat.</p>
          </div>
        </div>
        <div className="form-grid">
          <Field
            label="Nama Perusahaan / Instansi"
            placeholder="Contoh: PT Teknologi Nusantara"
            value={company}
            onChange={setCompany}
            required
          />
          <Field
            label="Alamat Perusahaan / Instansi"
            placeholder="Masukkan alamat lengkap"
            required
          />
          <Field
            label="Tanggal Mulai Magang"
            type="date"
            value={startDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={setStartDate}
            required
          />
          <Field
            label="Tanggal Selesai Magang"
            type="date"
            value={endDate}
            min={startDate || new Date().toISOString().split("T")[0]}
            onChange={setEndDate}
            error={startDate && endDate && endDate < startDate ? "Tanggal selesai harus setelah tanggal mulai." : undefined}
            required
          />
          <SelectField
            label="Tujuan Pengajuan"
            value="Keperluan magang mandiri"
            options={[
              "Keperluan magang mandiri",
              "Program MBKM",
              "Kerja praktik",
            ]}
          />
          <label className="field full">
            <span>Catatan tambahan</span>
            <textarea
              placeholder="Tambahkan informasi lain yang perlu diketahui admin..."
              rows={4}
            />
          </label>
        </div>
      </section>
      <section className="form-panel">
        <div className="section-head">
          <span>03</span>
          <div>
            <h2>Dokumen Persyaratan</h2>
            <p>Format PDF/JPG/PNG, ukuran maksimal 5 MB per berkas.</p>
          </div>
        </div>
        <div className="checklist">
          <span>
            <Icon name="check" size={16} /> Proposal magang
          </span>
          <span>
            <Icon name="check" size={16} /> Bukti penerimaan atau informasi
            perusahaan
          </span>
        </div>
        <label className="upload">
          <input type="file" />
          <span className="upload-icon">
            <Icon name="upload" />
          </span>
          <strong>
            Seret berkas ke sini atau <u>pilih dari perangkat</u>
          </strong>
          <small>Pastikan dokumen jelas dan tidak dilindungi kata sandi</small>
        </label>
      </section>
      <div className="form-footer">
        <Button variant="ghost" onClick={() => go("letters")}>
          Batal
        </Button>
        <div>
          <Button variant="outline">Simpan Draft</Button>
          <Button
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                name: "Surat Pengantar Magang",
                student: "Alya Rahmadani",
                company,
                startDate,
                endDate,
                purpose: "Keperluan magang mandiri",
              })
            }
          >
            Kirim Pengajuan <Icon name="arrow" size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}

function LetterDetail({ go }: { go: (p: string) => void }) {
  return (
    <div className="page narrow">
      <button className="back" onClick={() => go("letter-history")}>
        Riwayat Pengajuan <Icon name="chevron" size={15} /> Detail
      </button>
      <div className="detail-hero">
        <div>
          <span className="eyebrow">RPL/SRT/2025/0148</span>
          <h1>Surat Pengantar Magang</h1>
          <p>Diajukan pada 12 Juni 2025, 09.42 WIB</p>
        </div>
        <Badge tone="info">Sedang Ditinjau</Badge>
      </div>
      <section className="panel timeline-panel">
        <h2>Perkembangan pengajuan</h2>
        <div className="timeline">
          {[
            ["Diajukan", "12 Jun, 09.42"],
            ["Sedang Ditinjau", "13 Jun, 10.15"],
            ["Disetujui", "Menunggu"],
            ["Selesai", "Menunggu"],
          ].map((t, i) => (
            <div className={i < 2 ? "active" : ""} key={t[0]}>
              <span>{i < 1 ? <Icon name="check" size={15} /> : i + 1}</span>
              <strong>{t[0]}</strong>
              <small>{t[1]}</small>
              {i < 3 && <i />}
            </div>
          ))}
        </div>
      </section>
      <div className="detail-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Informasi Pengajuan</h2>
              <p>Data yang kamu kirimkan</p>
            </div>
          </div>
          <dl className="data-list">
            <div>
              <dt>Nama mahasiswa</dt>
              <dd>Alya Rahmadani</dd>
            </div>
            <div>
              <dt>Nomor induk</dt>
              <dd>2201024</dd>
            </div>
            <div>
              <dt>Instansi tujuan</dt>
              <dd>PT Teknologi Nusantara</dd>
            </div>
            <div>
              <dt>Periode magang</dt>
              <dd>1 Juli – 30 September 2025</dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Dokumen</h2>
              <p>2 dokumen terlampir</p>
            </div>
          </div>
          <div className="document">
            <span>
              <Icon name="file" />
            </span>
            <div>
              <strong>Proposal_Magang_Alya.pdf</strong>
              <small>PDF · 1.8 MB</small>
            </div>
            <button>
              <Icon name="eye" />
            </button>
          </div>
          <div className="document">
            <span>
              <Icon name="file" />
            </span>
            <div>
              <strong>Bukti_Penerimaan.pdf</strong>
              <small>PDF · 620 KB</small>
            </div>
            <button>
              <Icon name="eye" />
            </button>
          </div>
        </section>
      </div>
      <div className="note blue-note">
        <span className="soft-icon">
          <Icon name="clock" />
        </span>
        <div>
          <strong>Pengajuan sedang diperiksa</strong>
          <p>
            Admin sedang memeriksa kelengkapan dokumen. Kamu akan menerima
            notifikasi ketika status berubah.
          </p>
        </div>
      </div>
    </div>
  )
}

const resources = [
  [
    "Kamera Sony Alpha A6400",
    "Peralatan Multimedia",
    "Lab Multimedia",
    "3 dari 5 unit",
    "Tersedia",
    "success",
  ],
  [
    "Kit Internet of Things",
    "Peralatan Praktikum",
    "Lab IoT",
    "0 dari 8 unit",
    "Tidak tersedia",
    "danger",
  ],
]

type CampusRoom = {
  code: string
  name: string
  building: string
  floor: number
  capacity: number
  facilities: string[]
  mapArea: string
}

const campusBuildings = [
  { id: "biru", name: "Gedung Biru", short: "B", floors: 5, accent: "blue" },
  { id: "abu", name: "Gedung Abu", short: "A", floors: 4, accent: "gray" },
  { id: "baru", name: "Gedung Baru", short: "N", floors: 3, accent: "yellow" },
]

const roomNames = [
  "Ruang Perkuliahan",
  "Laboratorium Komputer",
  "Ruang Seminar",
  "Laboratorium RPL",
  "Ruang Kolaborasi",
  "Studio Pembelajaran",
]

function roomsFor(buildingId: string, floor: number): CampusRoom[] {
  const building = campusBuildings.find((item) => item.id === buildingId) ?? campusBuildings[0]
  return roomNames.map((name, index) => ({
    code: `${building.short}.${String(floor).padStart(2, "0")}.${String(index + 1).padStart(3, "0")}`,
    name,
    building: building.name,
    floor,
    capacity: [40, 30, 80, 32, 24, 36][index],
    facilities: index === 2
      ? ["Proyektor", "Audio", "AC", "Wi-Fi"]
      : ["Proyektor", "AC", "Wi-Fi"],
    mapArea: `area-${index + 1}`,
  }))
}

function roomSchedule(room: CampusRoom, date: string) {
  if (!date) return []
  const day = new Date(`${date}T00:00:00`).getDay()
  const requests = loadStored<LoanRequest[]>("rpl-loans", initialLoans)
  const successfulMoves = requests.filter((item) => item.requestType === "Perkuliahan" && ["Berhasil", "Disetujui"].includes(item.status))
  const events: Array<{ start: string; end: string; label: string }> = []

  getAcademicSchedules().forEach((schedule) => {
    const releasedTemporarily = successfulMoves.some((move) => move.scheduleMode === "Satu kali" && move.originalScheduleId === schedule.id && move.originalDate === date)
    const replacedPermanently = successfulMoves.some((move) => move.scheduleMode === "Jadwal tetap" && move.originalScheduleId === schedule.id && move.status === "Disetujui" && move.date <= date)
    if (schedule.roomCode === room.code && schedule.day === day && !releasedTemporarily && !replacedPermanently) {
      events.push({ start: schedule.startTime, end: schedule.endTime, label: `${schedule.program} · ${schedule.course} · ${schedule.className}` })
    }
  })
  requests.forEach((request) => {
    const roomMatches = request.resource.includes(`(${room.code})`)
    const oneTimeActive = request.date === date
    const recurringActive = request.scheduleMode === "Jadwal tetap" && request.status === "Disetujui" && new Date(`${request.date}T00:00:00`).getDay() === day && request.date <= date
    const blocksRoom = request.requestType === "Perkuliahan"
      ? ["Berhasil", "Disetujui"].includes(request.status)
      : request.status === "Disetujui"
    if (roomMatches && blocksRoom && (oneTimeActive || recurringActive)) {
      events.push({ start: request.startTime, end: request.endTime, label: request.requestType === "Organisasi" ? "Kegiatan organisasi" : `${request.course} · ${request.className}` })
    }
  })
  events.sort((a, b) => a.start.localeCompare(b.start))
  const result: string[][] = []
  let cursor = "07:00"
  events.forEach((event) => {
    if (event.start > cursor) result.push([`${cursor.replace(":", ".")}–${event.start.replace(":", ".")}`, "Tersedia", "Bisa dipinjam"])
    result.push([`${event.start.replace(":", ".")}–${event.end.replace(":", ".")}`, "Terpakai", event.label])
    if (event.end > cursor) cursor = event.end
  })
  if (cursor < "17:00") result.push([`${cursor.replace(":", ".")}–17.00`, "Tersedia", "Bisa dipinjam"])
  return result
}

function roomWeeklySchedule(room: CampusRoom, day: number) {
  const requests = loadStored<LoanRequest[]>("rpl-loans", initialLoans)
  const events: Array<{ start: string; end: string; label: string }> = []
  getAcademicSchedules()
    .filter((schedule) => schedule.roomCode === room.code && schedule.day === day)
    .forEach((schedule) => events.push({ start: schedule.startTime, end: schedule.endTime, label: `${schedule.program} · ${schedule.course} · ${schedule.className}` }))
  requests
    .filter((request) =>
      request.resource.includes(`(${room.code})`) &&
      request.scheduleMode === "Jadwal tetap" &&
      request.status === "Disetujui" &&
      new Date(`${request.date}T00:00:00`).getDay() === day,
    )
    .forEach((request) => events.push({ start: request.startTime, end: request.endTime, label: request.requestType === "Organisasi" ? "Kegiatan organisasi" : `${request.course} · ${request.className}` }))
  events.sort((a, b) => a.start.localeCompare(b.start))
  const result: string[][] = []
  let cursor = "07:00"
  events.forEach((event) => {
    if (event.start > cursor) result.push([`${cursor.replace(":", ".")}–${event.start.replace(":", ".")}`, "Tersedia", "Bisa dipinjam"])
    result.push([`${event.start.replace(":", ".")}–${event.end.replace(":", ".")}`, "Terpakai", event.label])
    if (event.end > cursor) cursor = event.end
  })
  if (cursor < "17:00") result.push([`${cursor.replace(":", ".")}–17.00`, "Tersedia", "Bisa dipinjam"])
  return result
}

function timesOverlap(startA: string, endA: string, startB: string, endB: string) {
  return startA < endB && endA > startB
}

function RoomExplorer({ go }: { go: (page: string) => void }) {
  const [buildingId, setBuildingId] = useState("biru")
  const [floor, setFloor] = useState(1)
  const [selectedDay, setSelectedDay] = useState(1)
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const building = campusBuildings.find((item) => item.id === buildingId) ?? campusBuildings[0]
  const rooms = roomsFor(buildingId, floor)
  const [selectedCode, setSelectedCode] = useState(rooms[0].code)
  const selectedRoom = rooms.find((room) => room.code === selectedCode) ?? rooms[0]
  const schedule = roomWeeklySchedule(selectedRoom, selectedDay)

  const selectBuilding = (id: string) => {
    setBuildingId(id)
    setFloor(1)
    setSelectedCode(roomsFor(id, 1)[0].code)
  }
  const selectFloor = (nextFloor: number) => {
    setFloor(nextFloor)
    setSelectedCode(roomsFor(buildingId, nextFloor)[0].code)
  }
  const continueWithRoom = () => {
    localStorage.setItem("rpl-selected-room", JSON.stringify(selectedRoom))
    localStorage.setItem("rpl-selected-room-day", String(selectedDay))
    go("loan-form")
  }

  return (
    <div className="room-explorer">
      <div className="room-progress">
        <span className="active"><b>1</b>Pilih hari</span><i />
        <span className="active"><b>2</b>Pilih gedung</span><i />
        <span className="active"><b>3</b>Pilih lantai & ruangan</span><i />
        <span><b>4</b>Ajukan peminjaman</span>
      </div>

      <section className="date-planning">
        <span className="planning-icon"><Icon name="calendar" /></span>
        <div><span className="eyebrow">LANGKAH PERTAMA</span><h2>Tentukan hari penggunaan</h2><p>Denah menampilkan pola jadwal mingguan yang berlaku tetap pada hari pilihan.</p></div>
        <div className="weekday-picker">
          {[1, 2, 3, 4, 5, 6, 0].map((day) => <button className={selectedDay === day ? "active" : ""} onClick={() => setSelectedDay(day)} key={day}>{dayNames[day]}</button>)}
        </div>
      </section>

      <section className="building-picker">
        <div className="section-title">
          <div><span className="eyebrow">DIREKTORI RUANG KAMPUS</span><h2>Pilih gedung</h2></div>
          <p>Tiga gedung tersedia untuk ditelusuri melalui denah interaktif.</p>
        </div>
        <div className="building-grid">
          {campusBuildings.map((item) => (
            <button
              className={`building-card ${item.accent} ${buildingId === item.id ? "active" : ""}`}
              onClick={() => selectBuilding(item.id)}
              key={item.id}
            >
              <span className="building-mark">{item.short}</span>
              <span><strong>{item.name}</strong><small>{item.floors} lantai · ruang dapat dipesan</small></span>
              {buildingId === item.id ? <Icon name="check" /> : <Icon name="chevron" />}
            </button>
          ))}
        </div>
      </section>

      <div className="directory-toolbar">
        <div className="floor-tabs">
          {Array.from({ length: building.floors }, (_, index) => index + 1).map((item) => (
            <button className={floor === item ? "active" : ""} onClick={() => selectFloor(item)} key={item}>
              Lantai {item}
            </button>
          ))}
        </div>
        <span className="selected-date-label"><Icon name="calendar" size={15} />Jadwal rutin hari {dayNames[selectedDay]}</span>
      </div>

      <div className="floor-directory">
        <section className="floor-plan-card">
          <div className="floor-plan-head">
            <div><span className="eyebrow">DENAH INTERAKTIF</span><h2>{building.name} · Lantai {floor}</h2><p>Klik ruangan pada denah untuk melihat detail dan jadwalnya.</p></div>
            <div className="map-legend"><span><i className="legend-room" />Ruangan</span><span><i className="legend-selected" />Dipilih</span></div>
          </div>
          <div className="floor-map">
            {rooms.map((room) => (
              <button
                className={`map-room ${room.mapArea} ${selectedRoom.code === room.code ? "selected" : ""}`}
                onClick={() => setSelectedCode(room.code)}
                key={room.code}
              >
                <span>{room.name}</span><strong>{room.code}</strong><small>{room.capacity} orang</small>
              </button>
            ))}
            <div className="map-corridor"><span>Koridor & area sirkulasi</span><i /><span>Tangga</span></div>
          </div>
          <div className="room-list-inline">
            <span>{rooms.length} ruangan di lantai ini</span>
            {rooms.map((room) => <button className={selectedRoom.code === room.code ? "active" : ""} onClick={() => setSelectedCode(room.code)} key={room.code}>{room.code}</button>)}
          </div>
        </section>

        <aside className="room-detail-panel">
          <div className="selected-room-head">
            <span className="eyebrow">RUANG TERPILIH</span>
            <Badge tone="success">Ada jadwal tersedia</Badge>
          </div>
          <h2>{selectedRoom.name}</h2>
          <strong className="room-code">{selectedRoom.code}</strong>
          <p className="room-location"><Icon name="grid" size={15} />{selectedRoom.building} · Lantai {selectedRoom.floor}</p>
          <div className="room-facts">
            <span><small>Kapasitas</small><strong>{selectedRoom.capacity} orang</strong></span>
            <span><small>Fasilitas</small><strong>{selectedRoom.facilities.join(" · ")}</strong></span>
          </div>
          <div className="schedule-head"><div><h3>Jadwal penggunaan</h3><p>Setiap hari {dayNames[selectedDay]}</p></div><span>Pola mingguan</span></div>
          <div className="schedule-list">
            {schedule.map(([time, status, description]) => (
              <div className={status === "Tersedia" ? "free" : "used"} key={time}>
                <strong>{time}</strong><span><b>{status}</b><small>{description}</small></span>
              </div>
            ))}
          </div>
          <Button onClick={continueWithRoom}>Pilih ruangan ini <Icon name="arrow" size={16} /></Button>
          <small className="availability-note">Ketersediaan diperiksa kembali saat pengajuan dikirim.</small>
        </aside>
      </div>
    </div>
  )
}

function Resources({ go }: { go: (p: string) => void }) {
  const [tab, setTab] = useState("Barang")
  return (
    <div className="page">
      <PageIntro
        eyebrow="LABORATORIUM RPL"
        title="Peminjaman Barang & Ruangan"
        text="Temukan barang atau ruangan laboratorium, lalu cek ketersediaannya sebelum mengajukan."
        action={
          <Button icon="history" variant="outline" onClick={() => go("loan-history")}>
            Riwayat Peminjaman
          </Button>
        }
      />
      <div className="resource-tools">
        <div className="segmented">
          <button
            className={tab === "Barang" ? "active" : ""}
            onClick={() => setTab("Barang")}
          >
            <Icon name="box" />
            Barang
          </button>
          <button
            className={tab === "Ruangan" ? "active" : ""}
            onClick={() => setTab("Ruangan")}
          >
            <Icon name="grid" />
            Ruangan
          </button>
        </div>
        {tab === "Barang" && <Toolbar placeholder="Cari barang..." />}
      </div>
      {tab === "Ruangan" ? <RoomExplorer go={go} /> : <>
        <div className="filter-row">
          <Button variant="outline" icon="filter">Semua kategori</Button>
          <Button variant="outline" icon="calendar">18 Juni 2025</Button>
          <Button variant="outline">Semua ketersediaan</Button>
        </div>
        <div className="resource-grid">
          {resources.filter((r) => r[1] !== "Ruangan")
          .map((r, i) => (
            <article className="resource-card" key={r[0]}>
              <div className={`resource-image resource-${i}`}>
                <span className="resource-placeholder">
                  <Icon name={r[1] === "Ruangan" ? "grid" : "box"} size={40} />
                </span>
                <Badge tone={r[5] as "success" | "warning" | "danger"}>
                  {r[4]}
                </Badge>
              </div>
              <div className="resource-body">
                <span className="label">{r[1].toUpperCase()}</span>
                <h2>{r[0]}</h2>
                <p>
                  <Icon name="settings" size={16} />
                  {r[2]}
                </p>
                <div className="availability">
                  <span>
                    {r[1] === "Ruangan" ? "Kapasitas" : "Ketersediaan"}
                  </span>
                  <strong>{r[3]}</strong>
                </div>
                <Button
                  variant="outline"
                  onClick={() => go("equipment-detail")}
                >
                  Lihat Detail <Icon name="arrow" size={16} />
                </Button>
              </div>
            </article>
          ))}
        </div>
      </>}
    </div>
  )
}

function EquipmentDetail({ go }: { go: (page: string) => void }) {
  const [quantity, setQuantity] = useState(1)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const validPeriod = Boolean(startDate && endDate && endDate >= startDate)
  return (
    <div className="page narrow">
      <button className="back" onClick={() => go("resources")}>
        Peminjaman <Icon name="chevron" size={15} /> Detail Barang
      </button>
      <div className="resource-detail-head equipment-head">
        <div className="large-placeholder equipment-placeholder">
          <Icon name="box" size={54} />
          <span>Sony Alpha A6400</span>
        </div>
        <div>
          <Badge tone="success">3 unit tersedia</Badge>
          <span className="eyebrow">PERALATAN MULTIMEDIA</span>
          <h1>Kamera Sony Alpha A6400</h1>
          <p>
            Kamera mirrorless untuk produksi foto dan video kegiatan akademik.
            Setiap unit dilengkapi lensa kit, baterai, charger, dan tas kamera.
          </p>
          <div className="equipment-stock">
            <div><span>Stok total</span><strong>5 unit</strong></div>
            <div><span>Sedang dipinjam</span><strong>2 unit</strong></div>
            <div><span>Dapat dipinjam</span><strong>3 unit</strong></div>
          </div>
        </div>
      </div>
      <div className="detail-grid booking-grid">
        <section className="panel">
          <div className="panel-head">
            <div><h2>Cek ketersediaan barang</h2><p>Pilih periode dan jumlah unit yang dibutuhkan.</p></div>
          </div>
          <div className="form-grid">
            <Field label="Tanggal Pengambilan" type="date" value={startDate} min={new Date().toISOString().split("T")[0]} onChange={setStartDate} required />
            <Field label="Tanggal Pengembalian" type="date" value={endDate} min={startDate || new Date().toISOString().split("T")[0]} onChange={setEndDate} error={startDate && endDate && endDate < startDate ? "Tanggal pengembalian tidak valid." : undefined} required />
          </div>
          <div className="quantity-picker">
            <div><strong>Jumlah unit</strong><span>Maksimal 3 unit per peminjaman</span></div>
            <div>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity === 1}>−</button>
              <strong>{quantity}</strong>
              <button onClick={() => setQuantity(Math.min(3, quantity + 1))} disabled={quantity === 3}>+</button>
            </div>
          </div>
          <div className={`available-check inline ${validPeriod ? "" : "schedule-warning"}`}>
            <Icon name={validPeriod ? "check" : "calendar"} />
            <span>
              <strong>{validPeriod ? `${quantity} unit dapat diajukan` : "Lengkapi periode peminjaman"}</strong>
              {validPeriod ? `Stok tersedia untuk ${formatDate(startDate)} sampai ${formatDate(endDate)}.` : "Ketersediaan akan diperiksa berdasarkan tanggal yang dipilih."}
            </span>
          </div>
        </section>
        <aside className="panel equipment-terms">
          <h2>Yang akan kamu terima</h2>
          {["Kamera Sony A6400","Lensa kit 16–50 mm","2 baterai & charger","Tas kamera & strap"].map((item) => <span key={item}><Icon name="check" size={16}/>{item}</span>)}
          <div className="equipment-warning"><Icon name="bell"/><p>Peminjam wajib memeriksa kondisi barang bersama laboran saat pengambilan dan pengembalian.</p></div>
          <Button disabled={!validPeriod} onClick={() => go("equipment-loan-form")}>Lanjutkan Peminjaman <Icon name="arrow" size={16}/></Button>
        </aside>
      </div>
      <section className="panel facilities">
        <h2>Spesifikasi utama</h2>
        <div><span><Icon name="check"/>Sensor APS-C 24.2 MP</span><span><Icon name="check"/>Video 4K</span><span><Icon name="check"/>Lensa E-mount</span><span><Icon name="check"/>Kondisi baik</span></div>
      </section>
    </div>
  )
}

function LoanForm({
  go,
  onSubmit,
}: {
  go: (p: string) => void
  onSubmit: (request: Omit<LoanRequest, "id" | "status">) => void
}) {
  const room = loadStored<CampusRoom>("rpl-selected-room", roomsFor("biru", 1)[0])
  const [requestType, setRequestType] = useState<"Perkuliahan" | "Organisasi">("Perkuliahan")
  const [scheduleMode, setScheduleMode] = useState<"Satu kali" | "Jadwal tetap">("Satu kali")
  const availableAcademicSchedules = getAcademicSchedules()
  const [scheduleId, setScheduleId] = useState(availableAcademicSchedules[0].id)
  const [originalDate, setOriginalDate] = useState("")
  const [date, setDate] = useState("")
  const selectedRoomDay = Number(localStorage.getItem("rpl-selected-room-day") ?? "1")
  const selectedRoomDayName = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][selectedRoomDay]
  const [startTime, setStartTime] = useState("10:00")
  const [endTime, setEndTime] = useState("12:00")
  const [organization, setOrganization] = useState("")
  const [purpose, setPurpose] = useState("")
  const [proofUploaded, setProofUploaded] = useState(false)
  const eligibleSchedules = availableAcademicSchedules.filter((item) => item.program === "RPL")
  const selectedSchedule = eligibleSchedules.find((item) => item.id === scheduleId) ?? eligibleSchedules[0]
  const originalDayMatches = Boolean(originalDate) && new Date(`${originalDate}T00:00:00`).getDay() === selectedSchedule.day
  const sourceValid = requestType === "Organisasi" || (Boolean(scheduleId && originalDate) && originalDayMatches)
  const targetDay = date ? new Date(`${date}T00:00:00`).getDay() : -1
  const targetDayMatches = Boolean(date) && targetDay === selectedRoomDay
  const roomConflict = date && endTime > startTime && roomSchedule(room, date).some(([range, status]) => {
    if (status !== "Terpakai") return false
    const [eventStart, eventEnd] = range.split(".").join(":").split("–")
    return timesOverlap(startTime, endTime, eventStart, eventEnd)
  })
  const academicConflict = requestType === "Perkuliahan" && availableAcademicSchedules.some((item) =>
    item.id !== selectedSchedule.id &&
    item.day === targetDay &&
    (item.className === selectedSchedule.className || item.lecturer === selectedSchedule.lecturer) &&
    timesOverlap(startTime, endTime, item.startTime, item.endTime),
  )
  const validSchedule = Boolean(date && targetDayMatches && startTime && endTime && endTime > startTime && !roomConflict && !academicConflict)
  const duration = validSchedule
    ? (Number(endTime.split(":")[0]) * 60 + Number(endTime.split(":")[1]) - Number(startTime.split(":")[0]) * 60 - Number(startTime.split(":")[1])) / 60
    : 0
  const isAutomatic = requestType === "Perkuliahan" && scheduleMode === "Satu kali"
  const permanentProofValid = !(requestType === "Perkuliahan" && scheduleMode === "Jadwal tetap") || proofUploaded
  const formValid = sourceValid && validSchedule && purpose.trim() && permanentProofValid && (requestType === "Perkuliahan" || organization.trim())

  return (
    <div className="page narrow">
      <button className="back" onClick={() => go("resources")}>
        Peminjaman Ruangan <Icon name="chevron" size={15} /> Formulir Pengajuan
      </button>
      <PageIntro
        eyebrow="PENGGUNAAN RUANGAN"
        title="Ajukan Ruangan"
        text="Pilih kebutuhan perkuliahan atau organisasi. Sistem menerapkan alur persetujuan yang berbeda secara otomatis."
      />
      <div className="selected-resource">
        <span className="resource-thumb"><Icon name="grid" /></span>
        <div><span className="label">RUANGAN PENGGANTI</span><strong>{room.name} · {room.code}</strong><small>{room.building} · Lantai {room.floor}</small></div>
        <button onClick={() => go("resources")}>Ubah</button>
      </div>

      <section className="form-panel">
        <div className="section-head"><span>01</span><div><h2>Jenis kebutuhan</h2><p>Tentukan konteks penggunaan dan apakah hanya satu pertemuan atau menjadi jadwal tetap.</p></div></div>
        <div className="request-type-grid">
          <button className={requestType === "Perkuliahan" ? "active" : ""} onClick={() => setRequestType("Perkuliahan")}><Icon name="users" /><span><strong>Perkuliahan</strong><small>Memindahkan jadwal kelas yang sudah terdaftar.</small></span></button>
          <button className={requestType === "Organisasi" ? "active" : ""} onClick={() => setRequestType("Organisasi")}><Icon name="calendar" /><span><strong>Kegiatan organisasi</strong><small>Rapat, seminar, pelatihan, atau kepanitiaan.</small></span></button>
        </div>
        <div className="schedule-mode">
          <button className={scheduleMode === "Satu kali" ? "active" : ""} onClick={() => setScheduleMode("Satu kali")}><strong>Satu kali</strong><small>Hanya untuk tanggal yang dipilih</small></button>
          <button className={scheduleMode === "Jadwal tetap" ? "active" : ""} onClick={() => setScheduleMode("Jadwal tetap")}><strong>Jadwal tetap</strong><small>Berulang dan mengubah jadwal reguler</small></button>
        </div>
        <div className={`approval-rule ${isAutomatic ? "automatic" : "admin-required"}`}>
          <Icon name={isAutomatic ? "check" : "clock"} />
          <span><strong>{isAutomatic ? "Validasi otomatis — tanpa persetujuan admin" : "Memerlukan persetujuan admin"}</strong><small>{isAutomatic ? "Jika lolos validasi, pertemuan langsung dipindahkan dan slot lama dilepas pada tanggal tersebut." : requestType === "Organisasi" ? "Semua kegiatan organisasi wajib ditinjau admin." : "Perubahan jadwal reguler harus ditinjau admin akademik."}</small></span>
        </div>
      </section>

      {requestType === "Perkuliahan" ? <section className="form-panel">
        <div className="section-head"><span>02</span><div><h2>Validasi jadwal asal</h2><p>Jadwal asal wajib dipilih dari database akademik, tidak dapat dimasukkan secara bebas.</p></div></div>
        <div className="form-grid">
          <label className="field full"><span>Jadwal kelas yang diikuti <b>*</b></span><select value={scheduleId} onChange={(event) => { setScheduleId(event.target.value); setOriginalDate("") }}>{eligibleSchedules.map((item) => <option value={item.id} key={item.id}>{item.id} · {item.program} · {item.course} · {item.className} · {item.dayName} {item.startTime}–{item.endTime}</option>)}</select><small className="field-hint">Daftar berasal dari keanggotaan kelas akun mahasiswa, bukan seluruh jadwal kampus.</small></label>
          <Field label="Tanggal pertemuan yang dipindahkan" type="date" value={originalDate} onChange={setOriginalDate} error={originalDate && !originalDayMatches ? `Tanggal harus jatuh pada hari ${selectedSchedule.dayName}.` : undefined} required />
          <div className="source-schedule-card"><span><small>Program studi</small><strong>{selectedSchedule.program}</strong></span><span><small>Ruangan asal</small><strong>{selectedSchedule.roomCode}</strong></span><span><small>PJ/Dosen</small><strong>{selectedSchedule.lecturer}</strong></span><span><small>Waktu asal</small><strong>{selectedSchedule.dayName}, {selectedSchedule.startTime}–{selectedSchedule.endTime}</strong></span></div>
        </div>
        <div className={`available-check inline ${sourceValid ? "" : "schedule-warning"}`}><Icon name={sourceValid ? "check" : "clock"}/><span><strong>{sourceValid ? "Jadwal asal terverifikasi" : "Jadwal asal belum valid"}</strong>{sourceValid ? `${selectedSchedule.course} terdaftar untuk ${selectedSchedule.className}.` : "Pilih tanggal yang sesuai dengan hari jadwal reguler."}</span></div>
        {scheduleMode === "Jadwal tetap" && <div className="permanent-proof">
          <span className="soft-icon"><Icon name="file" /></span>
          <div><strong>Perubahan tetap harus memiliki dasar akademik</strong><p>Unggah persetujuan PJ mata kuliah/koordinator kelas dan persetujuan program studi. Jika jadwal belum pernah ada, gunakan proses penetapan jadwal baru melalui admin akademik—bukan pemindahan jadwal.</p></div>
          <label><input type="file" onChange={(event) => setProofUploaded(Boolean(event.target.files?.length))} /><Icon name={proofUploaded ? "check" : "upload"} size={16}/>{proofUploaded ? "Bukti terunggah" : "Unggah bukti"}</label>
        </div>}
      </section> : <section className="form-panel">
        <div className="section-head"><span>02</span><div><h2>Informasi organisasi</h2><p>Semua pengajuan organisasi, satu kali maupun tetap, akan masuk ke admin.</p></div></div>
        <div className="form-grid"><Field label="Nama organisasi" value={organization} onChange={setOrganization} placeholder="Contoh: Himpunan Mahasiswa RPL" required /><Field label="Nama kegiatan" value={purpose} onChange={setPurpose} placeholder="Contoh: Seminar Teknologi" required /></div>
        <label className="upload compact-upload"><input type="file"/><span className="upload-icon"><Icon name="upload" /></span><strong>Unggah surat permohonan dan dokumen pendukung</strong><small>PDF, maksimal 5 MB</small></label>
      </section>}

      <section className="form-panel">
        <div className="section-head"><span>03</span><div><h2>{requestType === "Perkuliahan" ? "Jadwal pengganti" : "Jadwal kegiatan"}</h2><p>Jam tidak dibatasi satu jam. Isi waktu mulai dan selesai sesuai durasi kegiatan atau jumlah SKS.</p></div></div>
        <div className="form-grid">
          <Field label={scheduleMode === "Satu kali" ? `Tanggal penggunaan (${selectedRoomDayName})` : `Tanggal mulai berlaku (${selectedRoomDayName})`} type="date" value={date} onChange={setDate} error={date && !targetDayMatches ? `Tanggal harus jatuh pada hari ${selectedRoomDayName} sesuai pilihan denah.` : undefined} required />
          <Field label="Waktu mulai" type="time" value={startTime} onChange={setStartTime} required />
          <Field label="Waktu selesai" type="time" value={endTime} onChange={setEndTime} error={endTime <= startTime ? "Waktu selesai harus setelah waktu mulai." : undefined} required />
          <Field label="Durasi" value={duration > 0 ? `${duration} jam` : "—"} />
        </div>
        {requestType === "Perkuliahan" && <label className="field full"><span>Alasan pemindahan <b>*</b></span><textarea rows={3} value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Jelaskan alasan pemindahan jadwal..." /></label>}
        <div className={`available-check inline ${validSchedule ? "" : "schedule-warning"}`}><Icon name={validSchedule ? "check" : "clock"}/><span><strong>{validSchedule ? `Rentang ${startTime}–${endTime} tersedia` : !targetDayMatches && date ? `Tanggal bukan hari ${selectedRoomDayName}` : roomConflict ? "Bentrok dengan penggunaan ruangan" : academicConflict ? "Bentrok dengan jadwal kelas atau dosen" : "Lengkapi rentang waktu"}</strong>{validSchedule ? `Durasi ${duration} jam lolos pemeriksaan ruangan, kelas, dan dosen.` : roomConflict || academicConflict || (!targetDayMatches && Boolean(date)) ? "Pilih tanggal, ruangan, atau rentang waktu lain." : "Durasi bebas, tetapi waktu selesai harus setelah waktu mulai."}</span></div>
      </section>

      <div className="form-footer">
        <Button variant="outline" onClick={() => go("resources")}>Kembali</Button>
        <Button disabled={!formValid} onClick={() => onSubmit({
          resource: `${room.name} (${room.code})`, resourceType: "Ruangan", student: "Alya Rahmadani", date, startTime, endTime,
          purpose, location: `${room.building}, Lantai ${room.floor}`, requestType, scheduleMode,
          program: requestType === "Perkuliahan" ? selectedSchedule.program : undefined,
          course: requestType === "Perkuliahan" ? selectedSchedule.course : organization,
          className: requestType === "Perkuliahan" ? selectedSchedule.className : undefined,
          lecturer: requestType === "Perkuliahan" ? selectedSchedule.lecturer : undefined,
          originalScheduleId: requestType === "Perkuliahan" ? selectedSchedule.id : undefined,
          originalRoom: requestType === "Perkuliahan" ? selectedSchedule.roomCode : undefined,
          originalDate: requestType === "Perkuliahan" ? originalDate : undefined,
          originalStartTime: requestType === "Perkuliahan" ? selectedSchedule.startTime : undefined,
          originalEndTime: requestType === "Perkuliahan" ? selectedSchedule.endTime : undefined,
        })}>{isAutomatic ? "Pindahkan Pertemuan" : "Kirim untuk Persetujuan"}<Icon name="arrow" size={16}/></Button>
      </div>
    </div>
  )
}

function EquipmentLoanForm({
  go,
  onSubmit,
}: {
  go: (page: string) => void
  onSubmit: (request: Omit<LoanRequest, "id" | "status">) => void
}) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [pickupTime, setPickupTime] = useState("09:00")
  const [returnTime, setReturnTime] = useState("15:00")
  const [quantity, setQuantity] = useState(1)
  const [purpose, setPurpose] = useState("")
  const [agreed, setAgreed] = useState(false)
  const validPeriod = Boolean(startDate && endDate && endDate >= startDate)
  const canSubmit = validPeriod && quantity > 0 && quantity <= 3 && purpose.trim() && agreed
  return (
    <div className="page narrow">
      <button className="back" onClick={() => go("equipment-detail")}>
        Detail Barang <Icon name="chevron" size={15} /> Formulir Peminjaman
      </button>
      <PageIntro
        eyebrow="PEMINJAMAN PERALATAN"
        title="Formulir Peminjaman Barang"
        text="Tentukan periode penggunaan, jumlah unit, dan penanggung jawab barang."
      />
      <div className="selected-resource equipment-selected">
        <span className="resource-thumb"><Icon name="box"/></span>
        <div><span className="label">BARANG TERPILIH</span><strong>Kamera Sony Alpha A6400</strong><small>Laboratorium Multimedia · 3 unit tersedia</small></div>
        <button onClick={() => go("resources")}>Ganti barang</button>
      </div>
      <section className="form-panel">
        <div className="section-head"><span>01</span><div><h2>Periode Peminjaman</h2><p>Tanggal pengembalian tidak boleh lebih awal dari tanggal pengambilan.</p></div></div>
        <div className="form-grid">
          <Field label="Tanggal Pengambilan" type="date" value={startDate} min={new Date().toISOString().split("T")[0]} onChange={setStartDate} required />
          <Field label="Tanggal Pengembalian" type="date" value={endDate} min={startDate || new Date().toISOString().split("T")[0]} onChange={setEndDate} error={startDate && endDate && endDate < startDate ? "Tanggal pengembalian harus setelah tanggal pengambilan." : undefined} required />
          <Field label="Waktu Pengambilan" type="time" value={pickupTime} onChange={setPickupTime} required />
          <Field label="Batas Waktu Pengembalian" type="time" value={returnTime} onChange={setReturnTime} required />
        </div>
        <div className="inventory-choice">
          <div><span className="preference-icon"><Icon name="box"/></span><span><strong>Jumlah barang</strong><small>Tersedia 3 dari 5 unit</small></span></div>
          <div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><strong>{quantity} unit</strong><button onClick={() => setQuantity(Math.min(3, quantity + 1))}>+</button></div>
        </div>
      </section>
      <section className="form-panel">
        <div className="section-head"><span>02</span><div><h2>Tujuan dan Penanggung Jawab</h2><p>Jelaskan penggunaan barang agar admin dapat melakukan verifikasi.</p></div></div>
        <div className="form-grid">
          <Field label="Nama Penanggung Jawab" value="Alya Rahmadani" required />
          <Field label="Nomor Induk Mahasiswa" value="2201024" required />
          <label className="field full"><span>Tujuan Peminjaman <b>*</b></span><textarea rows={4} value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Contoh: Dokumentasi kegiatan seminar program studi..."/></label>
        </div>
      </section>
      <section className="form-panel equipment-agreement">
        <div className="section-head"><span>03</span><div><h2>Pemeriksaan dan Tanggung Jawab</h2><p>Barang akan diperiksa bersama laboran ketika diambil.</p></div></div>
        <div className="equipment-checks"><span><Icon name="check"/>Kartu mahasiswa aktif wajib dibawa</span><span><Icon name="check"/>Barang dikembalikan lengkap dan tepat waktu</span><span><Icon name="check"/>Kerusakan atau kehilangan wajib dilaporkan</span></div>
        <label className="consent agreement-consent"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)}/><span>Saya menyetujui ketentuan peminjaman dan bertanggung jawab atas barang selama periode penggunaan.</span></label>
      </section>
      <div className="form-footer">
        <Button variant="outline" onClick={() => go("equipment-detail")}>Kembali</Button>
        <Button
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              resource: "Kamera Sony Alpha A6400",
              resourceType: "Barang",
              student: "Alya Rahmadani",
              date: startDate,
              endDate,
              startTime: pickupTime,
              endTime: returnTime,
              quantity,
              purpose,
              location: "Laboratorium Multimedia",
            })
          }
        >
          Kirim Permohonan Barang <Icon name="arrow" size={16}/>
        </Button>
      </div>
    </div>
  )
}

function HistoryPage({
  type,
  go,
  letters,
  loans,
}: {
  type: "letter" | "loan"
  go: (p: string) => void
  letters: LetterRequest[]
  loans: LoanRequest[]
}) {
  const isLoan = type === "loan"
  const title = isLoan ? "Riwayat Peminjaman" : "Riwayat Pengajuan Surat"
  const letterRows = letters.map((item) => ({
    name: item.name,
    ref: item.id,
    date: formatDate(item.submittedAt),
    update: item.status === "Menunggu" ? "Baru saja" : formatDate(item.submittedAt),
    status: item.status,
    tone: statusTone(item.status),
  }))
  const loanRows = loans.map((item) => ({
    name: item.resource,
    type: item.resourceType === "Barang" ? `Barang · ${item.quantity ?? 1} unit` : "Ruangan",
    ref: item.id,
    schedule:
      item.resourceType === "Barang"
        ? `${formatDate(item.date)} – ${formatDate(item.endDate ?? item.date)}`
        : `${formatDate(item.date)} · ${item.startTime}–${item.endTime}`,
    location: item.location,
    status: item.status,
    tone: statusTone(item.status),
  }))
  return (
    <div className="page">
      <PageIntro
        eyebrow={isLoan ? "AKTIVITAS LABORATORIUM" : "DOKUMEN AKADEMIK"}
        title={title}
        text={
          isLoan
            ? "Pantau status dan jadwal seluruh permohonan peminjamanmu."
            : "Lihat perkembangan seluruh pengajuan surat akademikmu."
        }
        action={
          <Button
            icon={isLoan ? "box" : "file"}
            onClick={() => go(isLoan ? "resources" : "letters")}
          >
            {isLoan ? "Ajukan Peminjaman" : "Ajukan Surat"}
          </Button>
        }
      />
      <section className={`history-overview ${isLoan ? "loan" : "letter"}`}>
        <div className="history-overview-copy">
          <span className="history-overview-icon">
            <Icon name={isLoan ? "calendar" : "file"} size={26} />
          </span>
          <div>
            <span className="eyebrow">
              {isLoan ? "PEMINJAMAN SEMESTER INI" : "PENGAJUAN SEMESTER INI"}
            </span>
            <strong>{isLoan ? `${loans.length} peminjaman` : `${letters.length} pengajuan surat`}</strong>
            <small>
              {isLoan
                ? "6 permohonan telah selesai digunakan"
                : "9 dokumen telah selesai diproses"}
            </small>
          </div>
        </div>
        <div className="history-mini-stats">
          <span>
            <strong>{(isLoan ? loans : letters).filter((item) => item.status === "Menunggu").length}</strong>Menunggu
          </span>
          <span>
            <strong>{(isLoan ? loans : letters).filter((item) => ["Sedang Ditinjau","Disetujui"].includes(item.status)).length}</strong>Aktif
          </span>
          <span>
            <strong>{(isLoan ? loans : letters).filter((item) => item.status === "Selesai").length}</strong>Selesai
          </span>
        </div>
        <i className="history-orb orb-one" />
        <i className="history-orb orb-two" />
      </section>
      <div className="tabs">
        {["Semua", "Menunggu", "Disetujui", "Ditolak", "Selesai"].map(
          (t, i) => (
            <button className={i === 0 ? "active" : ""} key={t}>
              {t}
              <span>{i === 0 ? (isLoan ? loans.length : letters.length) : (isLoan ? loans : letters).filter((item) => item.status === t || (t === "Disetujui" && item.status === "Sedang Ditinjau")).length}</span>
            </button>
          ),
        )}
      </div>
      <Toolbar
        placeholder={
          isLoan
            ? "Cari nama resource atau nomor peminjaman..."
            : "Cari jenis surat atau nomor pengajuan..."
        }
      />
      <section className="panel history-table-panel">
        <div className="table-wrap">
          {isLoan ? (
            <table>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Jadwal</th>
                  <th>Lokasi</th>
                  <th>Nomor Referensi</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {loanRows.map((row) => (
                  <tr key={row.ref}>
                    <td>
                      <div className="history-resource">
                        <span className="history-row-icon loan">
                          <Icon name={row.type === "Ruangan" ? "grid" : "box"} />
                        </span>
                        <span>
                          <strong>{row.name}</strong>
                          <small>{row.type}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong>{row.schedule}</strong>
                    </td>
                    <td>{row.location}</td>
                    <td className="mono">{row.ref}</td>
                    <td>
                      <Badge tone={row.tone}>{row.status}</Badge>
                    </td>
                    <td>
                      <Button variant="ghost" onClick={() => {
                        localStorage.setItem("rpl-selected-loan-id", row.ref)
                        go("loan-detail")
                      }}>Detail</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Jenis Surat</th>
                  <th>Tanggal Pengajuan</th>
                  <th>Pembaruan Terakhir</th>
                  <th>Nomor Referensi</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {letterRows.map((row) => (
                  <tr key={row.ref}>
                    <td>
                      <div className="history-resource">
                        <span className="history-row-icon">
                          <Icon name="file" />
                        </span>
                        <span>
                          <strong>{row.name}</strong>
                          <small>Dokumen akademik</small>
                        </span>
                      </div>
                    </td>
                    <td>{row.date}</td>
                    <td>{row.update}</td>
                    <td className="mono">{row.ref}</td>
                    <td>
                      <Badge tone={row.tone}>{row.status}</Badge>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        onClick={() => go("letter-detail")}
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="pagination">
          <span>
            Menampilkan 1–{isLoan ? loans.length : letters.length} dari {isLoan ? `${loans.length} peminjaman` : `${letters.length} pengajuan`}
          </span>
          <div>
            <Button variant="outline">Sebelumnya</Button>
            <Button variant="outline">Berikutnya</Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function LoanDetail({ go, loans }: { go: (page: string) => void; loans: LoanRequest[] }) {
  const selectedId = localStorage.getItem("rpl-selected-loan-id")
  const loan = loans.find((item) => item.id === selectedId) ?? loans[0]
  if (!loan) return <div className="page"><section className="panel empty-state"><h2>Data peminjaman tidak ditemukan</h2><Button onClick={() => go("loan-history")}>Kembali</Button></section></div>
  const isRoom = loan.resourceType === "Ruangan"
  return (
    <div className="page narrow">
      <button className="back" onClick={() => go("loan-history")}>Riwayat Peminjaman <Icon name="chevron" size={15}/> Detail</button>
      <section className="loan-detail-hero">
        <span className={`loan-detail-icon ${isRoom ? "room" : "equipment"}`}><Icon name={isRoom ? "grid" : "box"} size={30}/></span>
        <div><span className="eyebrow">{loan.id}</span><h1>{loan.resource}</h1><p>Diajukan oleh {loan.student} · {loan.location}</p></div>
        <Badge tone={statusTone(loan.status)}>{loan.status}</Badge>
      </section>
      <section className="panel loan-status-track">
        {[
          ["1","Pengajuan dibuat","Data dan jadwal dikirim"],
          ["2",loan.status === "Berhasil" ? "Validasi otomatis" : "Pemeriksaan admin",loan.status === "Berhasil" ? "Tidak memerlukan persetujuan" : "Kelengkapan dan jadwal diperiksa"],
          ["3",loan.status === "Ditolak" ? "Ditolak" : loan.status === "Menunggu" ? "Menunggu keputusan" : "Jadwal dikonfirmasi",loan.status === "Ditolak" ? "Slot tidak diblokir" : "Ketersediaan diperbarui"],
        ].map((step, index) => <div className={index === 0 || loan.status !== "Menunggu" ? "done" : ""} key={step[0]}><span>{index === 0 || loan.status !== "Menunggu" ? <Icon name="check" size={14}/> : step[0]}</span><div><strong>{step[1]}</strong><small>{step[2]}</small></div>{index < 2 && <i/>}</div>)}
      </section>
      {loan.requestType === "Perkuliahan" && loan.originalScheduleId && <section className="panel detail-schedule-change">
        <div className="panel-head"><div><h2>Perubahan jadwal perkuliahan</h2><p>{loan.program} · {loan.course} · {loan.className} · {loan.lecturer}</p></div><Badge tone={loan.scheduleMode === "Satu kali" ? "info" : "warning"}>{loan.scheduleMode}</Badge></div>
        <div className="detail-swap">
          <div><span>JADWAL ASAL</span><strong>{formatDate(loan.originalDate ?? "")}</strong><p>{loan.originalStartTime}–{loan.originalEndTime}</p><small>{loan.originalRoom}</small></div>
          <span className="swap-arrow"><Icon name="arrow" size={22}/></span>
          <div className="new"><span>JADWAL PENGGANTI</span><strong>{formatDate(loan.date)}</strong><p>{loan.startTime}–{loan.endTime}</p><small>{loan.resource}</small></div>
        </div>
        {loan.scheduleMode === "Satu kali" && <div className="exception-note"><Icon name="calendar"/><span><strong>Pengecualian satu pertemuan</strong>Jadwal reguler tidak berubah. Slot asal hanya dilepas pada tanggal di atas.</span></div>}
      </section>}
      <div className="detail-grid">
        <section className="panel">
          <h2>Informasi peminjaman</h2>
          <dl className="data-list">
            <div><dt>Jenis resource</dt><dd>{loan.resourceType}</dd></div>
            <div><dt>Keperluan</dt><dd>{loan.requestType || "Peminjaman barang"}</dd></div>
            <div><dt>Pola penggunaan</dt><dd>{loan.scheduleMode || "Satu kali"}</dd></div>
            <div><dt>Jadwal</dt><dd>{formatDate(loan.date)} · {loan.startTime}–{loan.endTime}</dd></div>
            {loan.endDate && <div><dt>Sampai tanggal</dt><dd>{formatDate(loan.endDate)}</dd></div>}
            {loan.quantity && <div><dt>Jumlah</dt><dd>{loan.quantity} unit</dd></div>}
            <div><dt>Lokasi</dt><dd>{loan.location}</dd></div>
          </dl>
        </section>
        <section className="panel loan-purpose-detail">
          <h2>Tujuan dan catatan</h2>
          <p>{loan.purpose}</p>
          <div className="detail-admin-note"><Icon name={loan.status === "Ditolak" ? "x" : "check"}/><span><strong>{loan.status === "Menunggu" ? "Menunggu pemeriksaan" : loan.status === "Ditolak" ? "Pengajuan tidak disetujui" : "Jadwal telah tercatat"}</strong>{loan.status === "Menunggu" ? "Admin akan memeriksa dokumen dan kemungkinan bentrok." : loan.status === "Ditolak" ? "Hubungi admin untuk melihat alasan penolakan." : "Perubahan sudah tercermin pada ketersediaan ruangan."}</span></div>
        </section>
      </div>
      <div className="form-footer"><Button variant="outline" onClick={() => go("loan-history")}>Kembali ke Riwayat</Button><Button icon="download" variant="outline">Unduh Bukti Pengajuan</Button></div>
    </div>
  )
}

function AdminDashboard({ go, loans }: { go: (p: string) => void; loans: LoanRequest[] }) {
  return (
    <div className="page">
      <PageIntro
        eyebrow="RABU, 18 JUNI 2025"
        title="Selamat pagi, Dimas"
        text="Berikut ringkasan layanan administrasi yang memerlukan perhatianmu."
        action={
          <Button onClick={() => go("admin-letters")}>
            Tinjau pengajuan <Icon name="arrow" size={16} />
          </Button>
        }
      />
      <section className="stats">
        <StatCard
          icon="clock"
          label="Menunggu Ditinjau"
          value="14"
          note="+4 sejak kemarin"
          tone="yellow"
        />
        <StatCard
          icon="file"
          label="Diproses Hari Ini"
          value="8"
          note="Dari 22 pengajuan"
          tone="blue"
        />
        <StatCard
          icon="check"
          label="Selesai Bulan Ini"
          value="126"
          note="+12% dari Mei"
          tone="green"
        />
        <StatCard
          icon="chart"
          label="Rata-rata Proses"
          value="1.8h"
          note="Lebih cepat 14 menit"
          tone="sky"
        />
      </section>
      <div className="admin-priority">
        <div>
          <span className="eyebrow">PRIORITAS HARI INI</span>
          <h2>4 pengajuan menunggu lebih dari 24 jam</h2>
          <p>
            Periksa pengajuan tertua terlebih dahulu untuk menjaga waktu
            layanan.
          </p>
        </div>
        <Button variant="secondary" onClick={() => go("admin-letters")}>
          Lihat Prioritas <Icon name="arrow" size={16} />
        </Button>
      </div>
      <section className="panel dashboard-schedule">
        <div className="panel-head">
          <div><h2>Jadwal Ruangan Hari Ini</h2><p>Gabungan kuliah reguler dan penggunaan ruangan yang telah disetujui</p></div>
          <Button variant="ghost" onClick={() => go("admin-schedule")}>Buka kalender <Icon name="arrow" size={15}/></Button>
        </div>
        <div className="dashboard-schedule-grid">
          {getAcademicSchedules().slice(0, 3).map((schedule) => <article key={schedule.id}><span>{schedule.startTime}–{schedule.endTime}</span><div><strong>{schedule.course}</strong><small>{schedule.program} · {schedule.className} · {schedule.roomCode} · {schedule.lecturer}</small></div><Badge tone="info">Reguler</Badge></article>)}
          {loans.filter((loan) => loan.resourceType === "Ruangan" && ["Disetujui", "Berhasil"].includes(loan.status)).slice(0, 1).map((loan) => <article key={loan.id}><span>{loan.startTime}–{loan.endTime}</span><div><strong>{loan.course || loan.purpose}</strong><small>{loan.resource} · {formatDate(loan.date)}</small></div><Badge tone="success">{loan.scheduleMode || "Peminjaman"}</Badge></article>)}
        </div>
      </section>
      <section className="panel mind-mapping-banner">
        <div className="panel-head">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>
                ✓ SIAP DIGENERATE &amp; DISETUJUI ADMIN
              </span>
              <span style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>
                Format Sheet MAPPING Excel
              </span>
            </div>
            <h2 style={{ marginTop: 4 }}>Mind Mapping Jadwal Perkuliahan Kampus</h2>
            <p>Visualisasi pemetaan jadwal perkuliahan seluruh prodi &amp; ruangan UPI Kampus Cibiru yang telah disetujui Admin.</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Button variant="primary" icon="download" onClick={() => go("admin-mind-mapping")}>
              Generate Mind Mapping
            </Button>
            <Button variant="ghost" onClick={() => go("admin-mind-mapping")}>
              Buka Matriks <Icon name="arrow" size={15} />
            </Button>
          </div>
        </div>
        <div className="mind-mapping-validation-grid">
          <div className="validation-item">
            <span className="step-num">01</span>
            <div><strong>Kebutuhan 5 Prodi</strong><small>5/5 Prodi Terkirim</small></div>
            <span className="step-status ok">✓</span>
          </div>
          <div className="validation-item">
            <span className="step-num">02</span>
            <div><strong>Validasi Data</strong><small>Beban SKS &amp; Dosen Lolos</small></div>
            <span className="step-status ok">✓</span>
          </div>
          <div className="validation-item">
            <span className="step-num">03</span>
            <div><strong>Generate Jadwal</strong><small>434 Sesi Matriks Siap</small></div>
            <span className="step-status ok">✓</span>
          </div>
          <div className="validation-item">
            <span className="step-num">04</span>
            <div><strong>Hard Constraints</strong><small>0 Pelanggaran Ruang/Waktu</small></div>
            <span className="step-status ok">✓</span>
          </div>
          <div className="validation-item">
            <span className="step-num">05</span>
            <div><strong>Approval Admin</strong><small>Disetujui Final</small></div>
            <span className="step-status ok">✓</span>
          </div>
        </div>
      </section>
      <div className="content-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Menunggu Peninjauan</h2>
              <p>Pengajuan terbaru yang perlu diperiksa</p>
            </div>
            <Button variant="ghost" onClick={() => go("admin-letters")}>
              Lihat semua
            </Button>
          </div>
          <ActivityTable admin />
        </section>
        <aside className="panel">
          <div className="panel-head">
            <div>
              <h2>Komposisi Status</h2>
              <p>Pengajuan bulan Juni</p>
            </div>
          </div>
          <div className="donut">
            <div>
              <strong>148</strong>
              <span>Total</span>
            </div>
          </div>
          <div className="legend">
            <span>
              <i className="l-blue" />
              Selesai <b>68%</b>
            </span>
            <span>
              <i className="l-yellow" />
              Diproses <b>22%</b>
            </span>
            <span>
              <i className="l-sky" />
              Menunggu <b>10%</b>
            </span>
          </div>
        </aside>
      </div>
    </div>
  )
}

function AdminLetters({
  letters,
  onStatus,
}: {
  letters: LetterRequest[]
  onStatus: (id: string, status: Status) => void
}) {
  const [selectedId, setSelectedId] = useState(letters[0]?.id ?? "")
  const selected = letters.find((item) => item.id === selectedId) ?? letters[0]
  return (
    <div className="page">
      <PageIntro
        title="Data Pengajuan Surat"
        text="Tinjau informasi dan kelengkapan dokumen sebelum memberi keputusan."
      />
      <div className="tabs">
        <button className="active">
          Semua <span>{letters.length}</span>
        </button>
        <button>
          Menunggu <span>{letters.filter((item) => item.status === "Menunggu").length}</span>
        </button>
        <button>Disetujui</button>
        <button>Ditolak</button>
      </div>
      <Toolbar />
      <div className="review-layout">
        <section className="panel request-list">
          {letters.map((request) => (
            <button
              className={selected?.id === request.id ? "active" : ""}
              onClick={() => setSelectedId(request.id)}
              key={request.id}
            >
              <div className="avatar small">
                {request.student
                  .split(" ")
                  .map((x) => x[0])
                  .join("")}
              </div>
              <div>
                <strong>{request.student}</strong>
                <span>{request.name}</span>
                <small>{request.id} · {formatDate(request.submittedAt)}</small>
              </div>
              <Badge tone={statusTone(request.status)}>{request.status}</Badge>
              <Icon name="chevron" />
            </button>
          ))}
        </section>
        {selected ? <section className="panel review-detail">
          <div className="review-head">
            <div>
              <span className="eyebrow">{selected.id}</span>
              <h2>{selected.name}</h2>
              <p>Diajukan {formatDate(selected.submittedAt)}</p>
            </div>
            <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
          </div>
          <div className="student-card">
            <div className="avatar">{selected.student.split(" ").map((part) => part[0]).join("")}</div>
            <div>
              <strong>{selected.student}</strong>
              <span>2201024 · Rekayasa Perangkat Lunak</span>
            </div>
          </div>
          <h3>Informasi pengajuan</h3>
          <dl className="data-list compact">
            <div>
              <dt>Instansi tujuan</dt>
              <dd>{selected.company}</dd>
            </div>
            <div>
              <dt>Periode</dt>
              <dd>{formatDate(selected.startDate)} – {formatDate(selected.endDate)}</dd>
            </div>
          </dl>
          <h3>Kelengkapan dokumen</h3>
          <label className="doc-check">
            <input type="checkbox" defaultChecked />
            <span>
              <strong>Proposal magang</strong>Proposal_Magang_Nadia.pdf · 1.2 MB
            </span>
            <Icon name="eye" />
          </label>
          <label className="doc-check">
            <input type="checkbox" defaultChecked />
            <span>
              <strong>Bukti penerimaan</strong>Letter_of_Acceptance.pdf · 840 KB
            </span>
            <Icon name="eye" />
          </label>
          <div className="review-actions">
            <Button variant="danger" onClick={() => onStatus(selected.id, "Ditolak")}>Tolak</Button>
            <Button icon="clock" variant="outline" onClick={() => onStatus(selected.id, "Sedang Ditinjau")}>Tinjau</Button>
            <Button icon="check" onClick={() => onStatus(selected.id, "Disetujui")}>Setujui Pengajuan</Button>
          </div>
        </section> : <section className="panel empty-state"><h2>Belum ada pengajuan</h2></section>}
      </div>
    </div>
  )
}

function AdminResources({
  page,
  loans,
  onStatus,
  go,
}: {
  page: string
  loans: LoanRequest[]
  onStatus: (id: string, status: Status) => void
  go?: (page: string) => void
}) {
  const isLoans = page === "admin-loans"
  const isSchedule = page === "admin-schedule"
  const [scheduleViewMode, setScheduleViewMode] = useState<"integrator" | "calendar">("integrator")
  const [programFilter, setProgramFilter] = useState("Semua prodi")
  const [managedSchedules, setManagedSchedules] = useState<AcademicSchedule[]>(getAcademicSchedules)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleDraft, setScheduleDraft] = useState({ program: "RPL", course: "", className: "", lecturer: "", dayName: "Senin", startTime: "08:00", endTime: "10:00", roomCode: "" })
  useEffect(() => localStorage.setItem("rpl-academic-schedules", JSON.stringify(managedSchedules)), [managedSchedules])
  const programs = ["Semua prodi", ...Array.from(new Set(managedSchedules.map((item) => item.program)))]
  const visibleSchedules = programFilter === "Semua prodi" ? managedSchedules : managedSchedules.filter((item) => item.program === programFilter)
  const draftConflict = managedSchedules.find((item) =>
    item.dayName === scheduleDraft.dayName &&
    timesOverlap(scheduleDraft.startTime, scheduleDraft.endTime, item.startTime, item.endTime) &&
    (item.roomCode.toUpperCase() === scheduleDraft.roomCode.toUpperCase() || item.className.toLowerCase() === scheduleDraft.className.toLowerCase() || item.lecturer.toLowerCase() === scheduleDraft.lecturer.toLowerCase()),
  )
  const addSchedule = () => {
    if (!scheduleDraft.course.trim() || !scheduleDraft.className.trim() || !scheduleDraft.lecturer.trim() || !scheduleDraft.roomCode.trim() || scheduleDraft.endTime <= scheduleDraft.startTime || draftConflict) return
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
    setManagedSchedules((current) => [...current, {
      ...scheduleDraft,
      id: `JDW${String(current.length + 1).padStart(3, "0")}`,
      day: dayNames.indexOf(scheduleDraft.dayName),
      roomCode: scheduleDraft.roomCode.toUpperCase(),
    }])
    setScheduleDraft((current) => ({ ...current, course: "", className: "", lecturer: "", roomCode: "" }))
    setShowScheduleForm(false)
  }
  if (isSchedule) {
    const scheduleChanges = loans.filter((loan) => loan.resourceType === "Ruangan" && loan.requestType === "Perkuliahan")
    const roomBookings = loans.filter((loan) => loan.resourceType === "Ruangan" && loan.requestType === "Organisasi" && ["Disetujui", "Menunggu"].includes(loan.status))
    return (
      <div className="page">
        <PageIntro
          eyebrow="KALENDER RUANG & INTEGRATOR TERPUSAT"
          title="Jadwal & Ketersediaan"
          text="Integrasikan template perkuliahan tiap kaprodi, kelola prioritas SKS & hari khusus dosen, generate Mind Mapping, serta pantau kalender ketersediaan ruangan."
          action={
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {go && (
                <Button variant="secondary" icon="grid" onClick={() => go("admin-mind-mapping")}>
                  Matriks Mind Mapping
                </Button>
              )}
              {scheduleViewMode === "calendar" && (
                <Button icon={showScheduleForm ? "x" : "plus"} onClick={() => setShowScheduleForm((current) => !current)}>
                  {showScheduleForm ? "Tutup Formulir" : "Tambah Jadwal Manual"}
                </Button>
              )}
            </div>
          }
        />

        {/* View Mode Switcher Tabs */}
        <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            className={`btn ${scheduleViewMode === "integrator" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setScheduleViewMode("integrator")}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }}
          >
            <Icon name="grid" size={16} /> 1. Integrasi Template Kaprodi &amp; Generator Mind Mapping
          </button>
          <button
            type="button"
            className={`btn ${scheduleViewMode === "calendar" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setScheduleViewMode("calendar")}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }}
          >
            <Icon name="calendar" size={16} /> 2. Kalender Jadwal Reguler &amp; Peminjaman
          </button>
          {go && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => go("admin-mind-mapping")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: "auto", color: "#2563eb", fontWeight: 600 }}
            >
              Buka Matriks Visual Mind Mapping <Icon name="arrow" size={15} />
            </button>
          )}
        </div>

        {scheduleViewMode === "integrator" ? (
          <KaprodiScheduleIntegrator
            go={go}
            onSchedulesUpdated={() => setManagedSchedules(getAcademicSchedules())}
          />
        ) : (
          <>
            {showScheduleForm && <section className="form-panel schedule-create-panel">
              <div className="section-head"><span><Icon name="calendar" size={16}/></span><div><h2>Tambah jadwal perkuliahan</h2><p>Jadwal yang disimpan langsung menjadi sumber validasi dan ketersediaan ruangan.</p></div></div>
              <div className="form-grid">
                <SelectField label="Program studi" value={scheduleDraft.program} options={["RPL","PGSD","PGPAUD","PMM","TEKKOM"]} onChange={(program) => setScheduleDraft((current) => ({ ...current, program }))} required />
                <Field label="Mata kuliah" value={scheduleDraft.course} onChange={(course) => setScheduleDraft((current) => ({ ...current, course }))} required />
                <Field label="Kelas" value={scheduleDraft.className} onChange={(className) => setScheduleDraft((current) => ({ ...current, className }))} placeholder="Contoh: RPL 2A" required />
                <Field label="PJ/Dosen pengampu" value={scheduleDraft.lecturer} onChange={(lecturer) => setScheduleDraft((current) => ({ ...current, lecturer }))} required />
                <SelectField label="Hari" value={scheduleDraft.dayName} options={["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"]} onChange={(dayName) => setScheduleDraft((current) => ({ ...current, dayName }))} required />
                <Field label="Kode ruangan" value={scheduleDraft.roomCode} onChange={(roomCode) => setScheduleDraft((current) => ({ ...current, roomCode }))} placeholder="Contoh: B.01.001" required />
                <Field label="Waktu mulai" type="time" value={scheduleDraft.startTime} onChange={(startTime) => setScheduleDraft((current) => ({ ...current, startTime }))} required />
                <Field label="Waktu selesai" type="time" value={scheduleDraft.endTime} onChange={(endTime) => setScheduleDraft((current) => ({ ...current, endTime }))} error={scheduleDraft.endTime <= scheduleDraft.startTime ? "Waktu selesai harus setelah waktu mulai." : undefined} required />
              </div>
              <div className={`available-check inline ${draftConflict ? "schedule-warning" : ""}`}><Icon name={draftConflict ? "clock" : "check"}/><span><strong>{draftConflict ? "Jadwal bentrok" : "Siap disimpan"}</strong>{draftConflict ? `Bentrok dengan ${draftConflict.course} (${draftConflict.program}) di ${draftConflict.roomCode}, kelas, atau dosen yang sama.` : "Sistem akan memeriksa ruangan, kelas, dan dosen sebelum menyimpan."}</span></div>
              <div className="schedule-form-actions"><Button variant="outline" onClick={() => setShowScheduleForm(false)}>Batal</Button><Button icon="check" disabled={Boolean(draftConflict)} onClick={addSchedule}>Simpan Jadwal</Button></div>
            </section>}
            <div className="schedule-admin-stats">
              <StatCard icon="calendar" tone="blue" label="Jadwal reguler" value={String(visibleSchedules.length)} note={programFilter === "Semua prodi" ? "Seluruh program studi" : `Program studi ${programFilter}`} />
              <StatCard icon="arrow" tone="sky" label="Pemindahan kelas" value={String(scheduleChanges.length)} note="Sementara & permanen" />
              <StatCard icon="clock" tone="yellow" label="Menunggu persetujuan" value={String(loans.filter((loan) => loan.status === "Menunggu" && loan.resourceType === "Ruangan").length)} note="Perlu keputusan admin" />
            </div>
            <div className="program-filter">
              <span>Filter program studi</span>
              <div>{programs.map((program) => <button className={programFilter === program ? "active" : ""} onClick={() => setProgramFilter(program)} key={program}>{program}</button>)}</div>
            </div>
            <section className="panel admin-calendar-panel">
              <div className="panel-head"><div><h2>Jadwal perkuliahan reguler</h2><p>Sumber utama validasi jadwal asal mahasiswa</p></div><Badge tone="info">Database akademik</Badge></div>
              <div className="admin-week-grid">
                {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day) => (
                  <div className="admin-day" key={day}>
                    <div className="admin-day-head"><strong>{day}</strong><span>{visibleSchedules.filter((item) => item.dayName === day).length} kelas</span></div>
                    {visibleSchedules.filter((item) => item.dayName === day).map((item) => (
                      <article key={item.id}><span>{item.startTime}–{item.endTime}</span><b>{item.program}</b><strong>{item.course}</strong><small>{item.className} · {item.roomCode}</small><small>{item.lecturer}</small></article>
                    ))}
                    {!visibleSchedules.some((item) => item.dayName === day) && <p className="empty-day">Belum ada jadwal</p>}
                  </div>
                ))}
              </div>
            </section>
            <div className="content-grid">
              <section className="panel">
                <div className="panel-head"><div><h2>Perubahan jadwal kelas</h2><p>Slot asal dan slot pengganti tercatat berpasangan</p></div></div>
                <div className="schedule-change-list">
                  {scheduleChanges.length ? scheduleChanges.map((change) => (
                    <article key={change.id}>
                      <div><Badge tone={statusTone(change.status)}>{change.status}</Badge><strong>{change.course} · {change.className}</strong><small>{change.program} · {change.scheduleMode} · {change.id}</small></div>
                      <div className="schedule-swap"><span><small>{change.scheduleMode === "Satu kali" ? "Slot asal dilepas hanya tanggal ini" : "Jadwal reguler lama"}</small><b>{formatDate(change.originalDate ?? "")}<br />{change.originalStartTime}–{change.originalEndTime} · {change.originalRoom}</b></span><Icon name="arrow" /><span><small>{change.scheduleMode === "Satu kali" ? "Pengecualian/pertemuan pengganti" : "Jadwal reguler baru"}</small><b>{formatDate(change.date)}<br />{change.startTime}–{change.endTime} · {change.resource.match(/\((.*?)\)/)?.[1]}</b></span></div>
                    </article>
                  )) : <div className="empty-mini">Belum ada pemindahan jadwal.</div>}
                </div>
              </section>
              <section className="panel">
                <div className="panel-head"><div><h2>Peminjaman organisasi</h2><p>Slot hanya diblokir setelah disetujui</p></div></div>
                <div className="schedule-change-list compact">
                  {roomBookings.length ? roomBookings.map((booking) => <article key={booking.id}><div><Badge tone={statusTone(booking.status)}>{booking.status}</Badge><strong>{booking.course || booking.purpose}</strong><small>{booking.resource}</small></div><span className="booking-time">{formatDate(booking.date)}<br/><b>{booking.startTime}–{booking.endTime}</b></span></article>) : <div className="empty-mini">Belum ada peminjaman organisasi.</div>}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    )
  }
  return (
    <div className="page">
      <PageIntro
        title={
          isLoans
            ? "Data Peminjaman"
            : page === "admin-schedule"
              ? "Jadwal & Ketersediaan"
              : "Manajemen Barang & Ruangan"
        }
        text={
          isLoans
            ? "Validasi jadwal dan proses permohonan peminjaman mahasiswa."
            : "Kelola data, status, dan ketersediaan seluruh fasilitas laboratorium."
        }
        action={!isLoans && <Button icon="plus">Tambah Resource</Button>}
      />
      <Toolbar />
      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{isLoans ? "Peminjam" : "Nama Resource"}</th>
                <th>{isLoans ? "Resource" : "Kategori"}</th>
                <th>{isLoans ? "Jadwal" : "Lokasi"}</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {isLoans ? loans.map((loan) => (
                <tr key={loan.id}>
                  <td><strong>{loan.student}</strong><small className="cell-sub">{loan.id}</small></td>
                  <td><strong>{loan.resource}</strong><small className="cell-sub">{loan.resourceType}{loan.quantity ? ` · ${loan.quantity} unit` : ""}</small></td>
                  <td>{loan.resourceType === "Barang" ? `${formatDate(loan.date)} – ${formatDate(loan.endDate ?? loan.date)}` : `${formatDate(loan.date)} · ${loan.startTime}–${loan.endTime}`}</td>
                  <td><Badge tone={statusTone(loan.status)}>{loan.status}</Badge></td>
                  <td>
                    {loan.status === "Menunggu" ? <div className="admin-inline-actions">
                      <Button variant="danger" onClick={() => onStatus(loan.id, "Ditolak")}>Tolak</Button>
                      <Button icon="check" onClick={() => onStatus(loan.id, "Disetujui")}>Setujui</Button>
                    </div> : <small className="cell-sub">Tidak memerlukan tindakan</small>}
                  </td>
                </tr>
              )) : resources.slice(0, 3).map((r) => (
                <tr key={r[0]}>
                  <td>
                    <strong>{r[0]}</strong>
                    <small className="cell-sub">{r[1]}</small>
                  </td>
                  <td>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td>
                    <Badge tone={r[5] === "warning" ? "warning" : "success"}>
                      {r[4]}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="outline">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function ComponentsPage() {
  return (
    <div className="page">
      <PageIntro
        title="Komponen UI"
        text="Fondasi antarmuka Sistem Informasi RPL untuk pengalaman yang konsisten."
      />
      <section className="component-section">
        <h2>Warna & Tipografi</h2>
        <div className="swatches">
          <div className="swatch primary">
            <span />
            <strong>Vibrant Blue</strong>
            <small>#1800C8</small>
          </div>
          <div className="swatch dreamy">
            <span />
            <strong>Dreamy</strong>
            <small>#8CCFF1</small>
          </div>
          <div className="swatch warmy">
            <span />
            <strong>Warmy</strong>
            <small>#FFD166</small>
          </div>
          <div className="swatch alice">
            <span />
            <strong>Alice</strong>
            <small>#F3F7FF</small>
          </div>
        </div>
      </section>
      <section className="component-section">
        <h2>Tombol</h2>
        <div className="component-row">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Text Button</Button>
          <Button variant="danger">Destructive</Button>
        </div>
      </section>
      <section className="component-section">
        <h2>Status badges</h2>
        <div className="component-row">
          <Badge tone="info">Sedang Ditinjau</Badge>
          <Badge tone="warning">Menunggu</Badge>
          <Badge tone="success">Disetujui</Badge>
          <Badge tone="danger">Ditolak</Badge>
          <Badge>Selesai</Badge>
        </div>
      </section>
      <section className="component-section">
        <h2>Form controls</h2>
        <div className="form-grid">
          <Field label="Nama lengkap" placeholder="Masukkan nama" />
          <SelectField
            label="Jenis layanan"
            value="Pilih layanan"
            options={["Pilih layanan", "Surat akademik", "Peminjaman"]}
          />
          <Field
            label="Email"
            value="nama@kampus.ac.id"
            error="Gunakan email institusi yang valid"
          />
        </div>
      </section>
    </div>
  )
}

function NotificationsPage({
  notifications,
  onReadAll,
}: {
  notifications: AppNotification[]
  onReadAll: () => void
}) {
  const [active, setActive] = useState("Semua")
  const visibleNotifications = notifications.filter((item) => {
    if (active === "Belum dibaca") return !item.read
    if (active === "Pengajuan Surat") return item.kind === "letter"
    if (active === "Peminjaman") return item.kind === "loan"
    if (active === "Informasi") return item.kind === "info"
    return true
  })
  const unreadCount = notifications.filter((item) => !item.read).length
  return (
    <div className="page">
      <PageIntro
        eyebrow="PUSAT AKTIVITAS"
        title="Notifikasi"
        text="Ikuti setiap perkembangan layanan akademik dan peminjamanmu."
        action={<Button variant="outline" icon="check" onClick={onReadAll}>Tandai semua dibaca</Button>}
      />
      <section className="notification-banner">
        <div>
          <span className="notification-hero-icon"><Icon name="bell" size={28}/></span>
          <div>
            <span className="eyebrow">RINGKASAN HARI INI</span>
            <h2>{unreadCount} informasi baru untukmu</h2>
            <p>Perubahan dari mahasiswa dan admin langsung tercatat di halaman ini.</p>
          </div>
        </div>
        <span className="notification-date"><strong>18</strong>JUN 2025</span>
        <i/><i/>
      </section>
      <div className="notification-layout">
        <aside className="notification-filter">
          <span className="nav-label">FILTER NOTIFIKASI</span>
          {["Semua", "Belum dibaca", "Pengajuan Surat", "Peminjaman", "Informasi"].map((item, i) => (
            <button className={active === item ? "active" : ""} onClick={() => setActive(item)} key={item}>
              <Icon name={["bell","eye","file","box","settings"][i] as IconName}/>
              <span>{item}</span>
              {i < 2 && <b>{i === 0 ? notifications.length : unreadCount}</b>}
            </button>
          ))}
        </aside>
        <section className="notification-list">
          <div className="notification-list-head"><div><h2>Terbaru</h2><p>Notifikasi dari 30 hari terakhir</p></div><Button variant="ghost">Atur notifikasi</Button></div>
          {visibleNotifications.map((item) => (
            <article className={`notification-item ${!item.read ? "unread" : ""}`} key={item.id}>
              <span className={`notification-item-icon ${item.kind === "letter" ? "primary" : item.kind === "loan" ? "success" : "sky"}`}><Icon name={item.kind === "letter" ? "file" : item.kind === "loan" ? "box" : "bell"}/></span>
              <div><strong>{item.title}</strong><p>{item.text}</p><small>{item.time}</small></div>
              {!item.read && <i/>}
              <button aria-label="Buka notifikasi"><Icon name="chevron" size={18}/></button>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

function SettingsPage() {
  const [section, setSection] = useState("Profil")
  return (
    <div className="page">
      <PageIntro eyebrow="PERSONALISASI AKUN" title="Pengaturan Akun" text="Kelola informasi profil, keamanan, dan preferensi layananmu." />
      <section className="profile-banner">
        <div className="profile-decoration one"/><div className="profile-decoration two"/>
        <div className="profile-avatar">AR<span><Icon name="plus" size={14}/></span></div>
        <div><span className="eyebrow">MAHASISWA AKTIF</span><h2>Alya Rahmadani</h2><p>2201024 · Rekayasa Perangkat Lunak</p></div>
        <Badge tone="success">Akun Terverifikasi</Badge>
      </section>
      <div className="settings-layout">
        <aside className="settings-nav">
          {[
            ["Profil","users"],
            ["Keamanan","settings"],
            ["Notifikasi","bell"],
            ["Preferensi","grid"],
          ].map(([item, icon]) => (
            <button className={section === item ? "active" : ""} onClick={() => setSection(item)} key={item}>
              <span><Icon name={icon as IconName}/></span><div><strong>{item}</strong><small>{item === "Profil" ? "Data diri dan kontak" : item === "Keamanan" ? "Password dan akses" : item === "Notifikasi" ? "Email dan pengingat" : "Bahasa dan tampilan"}</small></div><Icon name="chevron" size={17}/>
            </button>
          ))}
          <div className="settings-help"><Icon name="bell"/><strong>Data tidak sesuai?</strong><p>Hubungi admin akademik untuk perubahan data utama.</p></div>
        </aside>
        <section className="settings-content">
          {section === "Profil" ? (
            <>
              <div className="settings-head"><div><h2>Informasi Pribadi</h2><p>Data utama tersinkronisasi dengan sistem akademik.</p></div><Badge tone="info">Terakhir diperbarui 12 Jun</Badge></div>
              <div className="form-grid">
                <Field label="Nama lengkap" value="Alya Rahmadani"/>
                <Field label="Nomor induk mahasiswa" value="2201024"/>
                <Field label="Program studi" value="Rekayasa Perangkat Lunak"/>
                <Field label="Angkatan" value="2022"/>
              </div>
              <div className="settings-divider"/>
              <div className="settings-head"><div><h2>Informasi Kontak</h2><p>Digunakan untuk pembaruan layanan penting.</p></div></div>
              <div className="form-grid"><Field label="Email institusi" value="alya.rahmadani@kampus.ac.id"/><Field label="Nomor telepon" value="+62 812 3456 7890"/></div>
              <div className="settings-actions"><Button variant="outline">Batalkan</Button><Button>Simpan Perubahan</Button></div>
            </>
          ) : (
            <>
              <div className="settings-head"><div><h2>{section}</h2><p>Atur preferensi {section.toLowerCase()} sesuai kebutuhanmu.</p></div></div>
              <div className="preference-list">
                {section === "Keamanan" ? (
                  <><div><span className="preference-icon"><Icon name="settings"/></span><span><strong>Ubah kata sandi</strong><small>Terakhir diubah 3 bulan lalu</small></span><Button variant="outline">Ubah</Button></div><div><span className="preference-icon"><Icon name="check"/></span><span><strong>Verifikasi dua langkah</strong><small>Tambahkan keamanan ekstra untuk akunmu</small></span><label className="switch"><input type="checkbox"/><i/></label></div></>
                ) : (
                  <>{["Pembaruan status pengajuan","Pengingat jadwal peminjaman","Informasi dan pengumuman kampus"].map((item,i)=><div key={item}><span className="preference-icon"><Icon name={i===1?"calendar":"bell"}/></span><span><strong>{item}</strong><small>Dikirim melalui email dan notifikasi aplikasi</small></span><label className="switch"><input type="checkbox" defaultChecked={i<2}/><i/></label></div>)}</>
                )}
              </div>
              <div className="settings-actions"><Button>Simpan Preferensi</Button></div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <main className="login-page">
      <section className="login-brand">
        <Logo />
        <div className="login-message">
          <span className="eyebrow">LAYANAN KAMPUS TERINTEGRASI</span>
          <h1>Administrasi akademik, dibuat lebih sederhana.</h1>
          <p>
            Ajukan surat, pinjam fasilitas laboratorium, dan pantau setiap
            proses secara transparan.
          </p>
          <div className="login-features">
            <span>
              <Icon name="check" />
              Proses transparan
            </span>
            <span>
              <Icon name="check" />
              Satu portal layanan
            </span>
          </div>
        </div>
        <div className="login-shape shape-one" />
        <div className="login-shape shape-two" />
      </section>
      <section className="login-form-wrap">
        <div className="login-mobile-logo">
          <Logo />
        </div>
        <form
          className="login-card"
          onSubmit={(e) => {
            e.preventDefault()
            onLogin()
          }}
        >
          <span className="eyebrow">SISTEM INFORMASI RPL</span>
          <h2>Selamat Datang</h2>
          <p>Masuk untuk mengakses layanan administrasi mahasiswa.</p>
          <Field
            label="Email atau username"
            value="alya.rahmadani@kampus.ac.id"
            required
          />
          <div className="password-field">
            <Field label="Password" value="password" type="password" required />
            <button type="button" aria-label="Tampilkan kata sandi">
              <Icon name="eye" />
            </button>
          </div>
          <div className="login-options">
            <label>
              <input type="checkbox" defaultChecked />
              Ingat saya
            </label>
            <button type="button">Lupa password?</button>
          </div>
          <Button type="submit">
            Masuk <Icon name="arrow" size={17} />
          </Button>
          <small>
            Gunakan akun akademik yang telah terdaftar. Hubungi admin bila
            mengalami kendala.
          </small>
        </form>
        <span className="copyright">
          © 2025 Program Studi Rekayasa Perangkat Lunak
        </span>
      </section>
    </main>
  )
}

const titles: Record<string, string> = {
  dashboard: "Dashboard",
  letters: "Layanan Pengajuan Surat",
  "letter-form": "Formulir Pengajuan",
  "letter-detail": "Detail Pengajuan",
  resources: "Peminjaman Barang & Ruangan",
  "equipment-detail": "Detail Barang",
  "loan-form": "Formulir Peminjaman",
  "equipment-loan-form": "Peminjaman Barang",
  "letter-history": "Riwayat Pengajuan",
  "loan-history": "Riwayat Peminjaman",
  "loan-detail": "Detail Peminjaman",
  notifications: "Notifikasi",
  settings: "Pengaturan Akun",
  admin: "Dashboard Admin",
  "admin-letters": "Data Pengajuan Surat",
  "admin-loans": "Data Peminjaman",
  "admin-resources": "Manajemen Resource",
  "admin-schedule": "Jadwal & Ketersediaan",
  "admin-mind-mapping": "Mind Mapping Jadwal Perkuliahan",
  components: "Komponen UI",
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(true)
  const [role, setRoleState] = useState<"student" | "admin">("student")
  const [page, setPage] = useState("dashboard")
  const [mobile, setMobile] = useState(false)
  const [letters, setLetters] = useState<LetterRequest[]>(() => loadStored("rpl-letters", initialLetters))
  const [loans, setLoans] = useState<LoanRequest[]>(() => {
    const stored = loadStored<LoanRequest[]>("rpl-loans", [])
    return [...stored, ...initialLoans.filter((seed) => !stored.some((item) => item.id === seed.id))]
  })
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadStored("rpl-notifications", initialNotifications))

  useEffect(() => localStorage.setItem("rpl-letters", JSON.stringify(letters)), [letters])
  useEffect(() => localStorage.setItem("rpl-loans", JSON.stringify(loans)), [loans])
  useEffect(() => localStorage.setItem("rpl-notifications", JSON.stringify(notifications)), [notifications])

  const addNotification = (notification: Omit<AppNotification, "id" | "time" | "read">) => {
    setNotifications((current) => [{ ...notification, id: `n-${Date.now()}`, time: "Baru saja", read: false }, ...current])
  }
  const submitLetter = (request: Omit<LetterRequest, "id" | "submittedAt" | "status">) => {
    const item: LetterRequest = {
      ...request,
      id: `RPL/SRT/${new Date().getFullYear()}/${String(letters.length + 149).padStart(4, "0")}`,
      submittedAt: new Date().toISOString().split("T")[0],
      status: "Menunggu",
    }
    setLetters((current) => [item, ...current])
    addNotification({ title: "Pengajuan surat berhasil dikirim", text: `${item.name} telah masuk ke antrean admin dengan nomor ${item.id}.`, kind: "letter" })
    setPage("letter-history")
  }
  const submitLoan = (request: Omit<LoanRequest, "id" | "status">) => {
    const automaticMove = request.requestType === "Perkuliahan" && request.scheduleMode === "Satu kali"
    const item: LoanRequest = {
      ...request,
      id: `RPL/PJM/${new Date().getFullYear()}/${String(loans.length + 93).padStart(4, "0")}`,
      status: automaticMove ? "Berhasil" : "Menunggu",
    }
    setLoans((current) => [item, ...current])
    addNotification({
      title: automaticMove ? "Pertemuan berhasil dipindahkan" : "Permohonan peminjaman berhasil dikirim",
      text: automaticMove
        ? `${item.course} dipindahkan ke ${item.resource} pada ${formatDate(item.date)}. Slot asal ${item.originalRoom} dilepas khusus ${formatDate(item.originalDate ?? "")}.`
        : `${item.resource} pada ${formatDate(item.date)} sedang menunggu persetujuan admin.`,
      kind: "loan",
    })
    setPage("loan-history")
  }
  const updateLetterStatus = (id: string, status: Status) => {
    const request = letters.find((item) => item.id === id)
    setLetters((current) => current.map((item) => item.id === id ? { ...item, status } : item))
    if (request) addNotification({ title: `Pengajuan surat ${status.toLowerCase()}`, text: `${request.name} dengan nomor ${id} kini berstatus ${status}.`, kind: "letter" })
  }
  const updateLoanStatus = (id: string, status: Status) => {
    const request = loans.find((item) => item.id === id)
    setLoans((current) => current.map((item) => item.id === id ? { ...item, status } : item))
    if (request) addNotification({ title: `Peminjaman ${status.toLowerCase()}`, text: `${request.resource} pada ${formatDate(request.date)} kini berstatus ${status}.`, kind: "loan" })
  }
  const setRole = (r: "student" | "admin") => {
    setRoleState(r)
    setPage(r === "student" ? "dashboard" : "admin")
  }
  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />
  let content: ReactNode
  if (page === "dashboard") content = <Dashboard go={setPage} letters={letters} loans={loans} />
  else if (page === "letters") content = <Letters go={setPage} />
  else if (page === "letter-form") content = <LetterForm go={setPage} onSubmit={submitLetter} />
  else if (page === "letter-detail") content = <LetterDetail go={setPage} />
  else if (page === "resources") content = <Resources go={setPage} />
  else if (page === "equipment-detail") content = <EquipmentDetail go={setPage} />
  else if (page === "loan-form") content = <LoanForm go={setPage} onSubmit={submitLoan} />
  else if (page === "equipment-loan-form") content = <EquipmentLoanForm go={setPage} onSubmit={submitLoan} />
  else if (page === "letter-history")
    content = <HistoryPage type="letter" go={setPage} letters={letters} loans={loans} />
  else if (page === "loan-history")
    content = <HistoryPage type="loan" go={setPage} letters={letters} loans={loans} />
  else if (page === "loan-detail") content = <LoanDetail go={setPage} loans={loans} />
  else if (page === "admin") content = <AdminDashboard go={setPage} loans={loans} />
  else if (page === "admin-letters") content = <AdminLetters letters={letters} onStatus={updateLetterStatus} />
  else if (["admin-loans", "admin-resources", "admin-schedule"].includes(page))
    content = <AdminResources page={page} loans={loans} onStatus={updateLoanStatus} go={setPage} />
  else if (page === "admin-mind-mapping")
    content = <AdminMindMapping go={setPage} />
  else if (page === "components") content = <ComponentsPage />
  else if (page === "notifications") content = <NotificationsPage notifications={notifications} onReadAll={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))} />
  else content = <SettingsPage />
  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        role={role}
        mobile={mobile}
        close={() => setMobile(false)}
      />
      {mobile && (
        <button
          className="scrim"
          onClick={() => setMobile(false)}
          aria-label="Tutup menu"
        />
      )}
      <div className="app-main">
        <Header
          title={titles[page]}
          role={role}
          setRole={setRole}
          openMenu={() => setMobile(true)}
        />
        <main>{content}</main>
      </div>
      <button
        className="login-preview"
        onClick={() => setLoggedIn(false)}
        title="Lihat halaman login"
      >
        <Icon name="logout" size={18} />
      </button>
    </div>
  )
}
