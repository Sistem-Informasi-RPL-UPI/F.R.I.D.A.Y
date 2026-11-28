import clsx from 'clsx';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  DoorOpen,
  Layers,
  Search,
  SearchX,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useJadwalStore } from '../../../shared/jadwal';
import { Badge, Button, Input } from '../../../shared/ui';
import {
  getDayNameFromDate,
  getFloorPlan,
  type BookableRoom,
  type BuildingConfig,
  type RoomCategory,
} from '../data/campusBuildings';
import { FloorPlanViewer } from './FloorPlanViewer';

export interface RoomResultsStepProps {
  building: BuildingConfig;
  floorNumber: number;
  allBuildingRooms: readonly BookableRoom[];
  selectedDate: string;
  onChangeDate: (isoDate: string) => void;
  onSelectFloor: (floorNumber: number) => void;
  onBackToBuildings: () => void;
  onOpenBooking: (room: BookableRoom) => void;
}

interface RoomScheduleEntry {
  timeDisplay: string;
  courseName: string;
  prodi: string;
  kelas: string;
}

const CATEGORY_FILTERS: readonly ('Semua' | RoomCategory)[] = [
  'Semua',
  'Ruang Kelas',
  'Laboratorium',
  'Aula & Rapat',
  'Studio & Media',
];

export function RoomResultsStep({
  building,
  floorNumber,
  allBuildingRooms,
  selectedDate,
  onChangeDate,
  onSelectFloor,
  onBackToBuildings,
  onOpenBooking,
}: RoomResultsStepProps) {
  const { scheduledCourses } = useJadwalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | RoomCategory>(
    'Semua',
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  const floorMeta = building.floors.find((f) => f.floorNumber === floorNumber);
  const floorPlan = useMemo(
    () => getFloorPlan(building.id, floorNumber),
    [building.id, floorNumber],
  );
  const floorRooms = useMemo(
    () => allBuildingRooms.filter((r) => r.floor === floorNumber),
    [allBuildingRooms, floorNumber],
  );

  const activeSelectedRoomId = useMemo(
    () =>
      floorRooms.some((room) => room.id === selectedRoomId)
        ? selectedRoomId
        : null,
    [floorRooms, selectedRoomId],
  );

  const firstFloorWithRooms = useMemo(
    () =>
      building.floors.find((f) =>
        allBuildingRooms.some((r) => r.floor === f.floorNumber),
      ) ?? null,
    [building.floors, allBuildingRooms],
  );

  const selectedDay = useMemo(
    () => getDayNameFromDate(selectedDate),
    [selectedDate],
  );

  const scheduleByRoomOrder = useMemo(() => {
    const map = new Map<number, RoomScheduleEntry[]>();
    if (!selectedDay) return map;

    for (const course of scheduledCourses) {
      for (const seg of course.segments) {
        if (seg.day !== selectedDay) continue;
        const list = map.get(seg.room) ?? [];
        list.push({
          timeDisplay: seg.timeDisplay,
          courseName: course.nama,
          prodi: course.prodi,
          kelas: course.kelas,
        });
        map.set(seg.room, list);
      }
    }

    for (const [, list] of map) {
      list.sort((a, b) => a.timeDisplay.localeCompare(b.timeDisplay));
    }

    return map;
  }, [scheduledCourses, selectedDay]);

  const occupiedRoomIds = useMemo(
    () => new Set(scheduleByRoomOrder.keys()),
    [scheduleByRoomOrder],
  );

  const filteredRooms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return floorRooms.filter((room) => {
      if (categoryFilter !== 'Semua' && room.category !== categoryFilter) {
        return false;
      }
      if (!query) return true;
      return (
        room.code.toLowerCase().includes(query) ||
        (room.shortCode?.toLowerCase().includes(query) ?? false) ||
        room.name.toLowerCase().includes(query) ||
        room.category.toLowerCase().includes(query)
      );
    });
  }, [floorRooms, searchQuery, categoryFilter]);

  function handleResetFilters() {
    setSearchQuery('');
    setCategoryFilter('Semua');
  }

  function handleFloorSwitch(nextFloor: number) {
    setSelectedRoomId(null);
    setHoveredRoomId(null);
    onSelectFloor(nextFloor);
  }

  function handleSelectRoomFromPlan(room: BookableRoom) {
    setSelectedRoomId(room.id);
  }

  return (
    <div className="rmb-step-panel">
      {/* Banner Konteks Gedung + Lantai */}
      <div className="rmb-results-context">
        <div className="rmb-results-context__info">
          <div className="rmb-selected-banner__badges">
            <Badge tone="primary">{building.name}</Badge>
            <Badge tone="secondary">Lantai {floorNumber}</Badge>
            {floorMeta && <Badge tone="success">{floorMeta.subtitle}</Badge>}
          </div>
          <h3 className="rmb-results-context__title">
            Daftar Ruangan — {building.name}, Lantai {floorNumber}
          </h3>
          <p className="rmb-results-context__desc">
            {floorRooms.length > 0
              ? `Menampilkan ${floorRooms.length} ruangan aktif pada lantai ini. Pilih lantai lain di bawah tanpa perlu berganti halaman.`
              : `Lantai ini berfokus pada area orientasi dan fasilitas non-peminjaman. Pilih lantai lain di bawah untuk melihat ruang yang dapat dipinjam.`}
          </p>
        </div>

        <div className="rmb-results-context__actions">
          <Button variant="outline" size="sm" onClick={onBackToBuildings}>
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Ganti Gedung</span>
          </Button>
        </div>
      </div>

      {/* Navigasi Lantai Terpadu (Pindah Lantai Langsung di Tempat) */}
      <div
        className="rmb-floor-switcher"
        role="group"
        aria-label={`Pilih lantai di ${building.name}`}
      >
        <div className="rmb-floor-switcher__top">
          <span className="rmb-floor-switcher__label">
            Pilih Lantai {building.name}:
          </span>
          {floorMeta && (
            <span className="rmb-floor-switcher__active-meta">
              {floorMeta.areaTag}
            </span>
          )}
        </div>

        <div className="rmb-floor-switcher__pills">
          {building.floors.map((f) => {
            const count = allBuildingRooms.filter(
              (r) => r.floor === f.floorNumber,
            ).length;
            const hasFloorPlan = Boolean(
              getFloorPlan(building.id, f.floorNumber),
            );
            const isActive = f.floorNumber === floorNumber;

            return (
              <button
                key={f.floorNumber}
                type="button"
                data-testid={`floor-tab-${f.floorNumber}`}
                aria-pressed={isActive}
                title={f.subtitle}
                className={clsx(
                  'rmb-floor-tab',
                  isActive && 'rmb-floor-tab--active',
                )}
                onClick={() => handleFloorSwitch(f.floorNumber)}
              >
                <span>Lantai {f.floorNumber}</span>
                <span className="rmb-floor-tab__badge">
                  {count > 0
                    ? `${count} Ruang`
                    : hasFloorPlan
                      ? 'Non-Peminjaman'
                      : 'Kosong'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar (ditampilkan jika lantai memiliki ruangan peminjaman) */}
      {floorRooms.length > 0 && (
        <div className="rmb-results-toolbar">
          <div className="rmb-search-wrap">
            <Search
              size={16}
              className="rmb-search-wrap__icon"
              aria-hidden="true"
            />
            <Input
              aria-label="Cari ruangan"
              placeholder="Cari kode atau nama ruangan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rmb-search-input"
            />
          </div>

          <div
            className="rmb-category-pills"
            role="group"
            aria-label="Filter kategori ruangan"
          >
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={categoryFilter === cat}
                className={clsx(
                  'rmb-pill-btn',
                  categoryFilter === cat && 'rmb-pill-btn--active',
                )}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="rmb-date-filter">
            <label className="rmb-date-filter__label" htmlFor="rmb-check-date">
              <Calendar size={15} aria-hidden="true" />
              <span>Jadwal:</span>
            </label>
            <Input
              id="rmb-check-date"
              type="date"
              value={selectedDate}
              onChange={(e) => onChangeDate(e.target.value)}
              className="rmb-date-input"
            />
            <Badge tone={selectedDay ? 'secondary' : 'success'}>
              {selectedDay ?? 'MINGGU (LIBUR)'}
            </Badge>
          </div>
        </div>
      )}

      {/* Denah Lantai Interaktif (ditampilkan untuk lantai yang punya denah, termasuk orientasi non-peminjaman) */}
      {floorPlan && (
        <FloorPlanViewer
          building={building}
          floorNumber={floorNumber}
          layout={floorPlan}
          rooms={floorRooms}
          occupiedRoomIds={occupiedRoomIds}
          selectedRoomId={activeSelectedRoomId}
          hoveredRoomId={hoveredRoomId}
          onHoverRoom={setHoveredRoomId}
          onSelectRoom={handleSelectRoomFromPlan}
          onOpenBooking={onOpenBooking}
        />
      )}

      {/* Hasil Ruangan / Empty States */}
      {floorRooms.length === 0 ? (
        <div className="rmb-empty-state" data-testid="empty-floor-state">
          <div className="rmb-empty-state__icon" aria-hidden="true">
            <DoorOpen size={28} strokeWidth={1.8} />
          </div>
          <h4 className="rmb-empty-state__title">
            {floorPlan
              ? `Lantai ${floorNumber} ${building.name} tidak memiliki ruang peminjaman`
              : `Data ruangan untuk ${building.name} — Lantai ${floorNumber} belum dikonfigurasi`}
          </h4>
          <p className="rmb-empty-state__desc">
            {floorPlan
              ? `Seluruh ruangan pada ${floorMeta?.subtitle ?? `Lantai ${floorNumber}`} berstatus perkantoran atau fasilitas non-peminjaman seperti terlihat pada denah di atas.`
              : `Saat ini belum ada ruang peminjaman yang terdaftar di ${floorMeta?.subtitle ?? `Lantai ${floorNumber}`}. Silakan pilih lantai lain pada ${building.name} yang sudah memiliki daftar ruangan.`}
          </p>
          <div className="rmb-empty-state__actions">
            {firstFloorWithRooms && (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  handleFloorSwitch(firstFloorWithRooms.floorNumber)
                }
              >
                Lihat Lantai {firstFloorWithRooms.floorNumber} (
                {
                  allBuildingRooms.filter(
                    (r) => r.floor === firstFloorWithRooms.floorNumber,
                  ).length
                }{' '}
                Ruangan)
              </Button>
            )}
          </div>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="rmb-empty-state" data-testid="empty-filter-state">
          <div className="rmb-empty-state__icon" aria-hidden="true">
            <SearchX size={28} strokeWidth={1.8} />
          </div>
          <h4 className="rmb-empty-state__title">
            Tidak ada ruangan yang cocok dengan filter
          </h4>
          <p className="rmb-empty-state__desc">
            Ubah kata kunci pencarian atau pilih kategori &ldquo;Semua&rdquo;
            untuk menampilkan seluruh ruangan di Lantai {floorNumber}.
          </p>
          <div className="rmb-empty-state__actions">
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Reset Filter
            </Button>
          </div>
        </div>
      ) : (
        <div className="rmb-room-grid">
          {filteredRooms.map((room) => {
            const schedules =
              room.jadwalRoomId !== undefined
                ? (scheduleByRoomOrder.get(room.jadwalRoomId) ?? [])
                : [];
            const hasSchedules = schedules.length > 0;
            const isHighlighted =
              activeSelectedRoomId === room.id || hoveredRoomId === room.id;

            return (
              <article
                key={room.id}
                data-testid={`room-card-${room.code}`}
                className={clsx(
                  'rmb-room-card',
                  isHighlighted && 'rmb-room-card--highlighted',
                )}
                onMouseEnter={() => setHoveredRoomId(room.id)}
                onMouseLeave={() => setHoveredRoomId(null)}
              >
                <div className="rmb-room-card__top">
                  <div className="rmb-room-card__code-group">
                    {room.roomNumber !== undefined && (
                      <span className="rmb-room-num-pill">
                        No. {room.roomNumber}
                      </span>
                    )}
                    <span className="rmb-room-code">{room.code}</span>
                    {room.shortCode && (
                      <span className="rmb-room-short-code">
                        {room.shortCode}
                      </span>
                    )}
                  </div>
                  <Badge tone={hasSchedules ? 'accent' : 'success'}>
                    {hasSchedules
                      ? `${schedules.length} Jadwal Kuliah`
                      : 'Tersedia Seharian'}
                  </Badge>
                </div>

                <div className="rmb-room-card__title-row">
                  <h4 className="rmb-room-card__name">{room.name}</h4>
                  <Badge tone="secondary">{room.category}</Badge>
                </div>

                <div className="rmb-room-card__meta">
                  <span>
                    <Users size={15} aria-hidden="true" />
                    <span>Kapasitas {room.capacity} orang</span>
                  </span>
                  <span>
                    <Layers size={15} aria-hidden="true" />
                    <span>Lantai {room.floor}</span>
                  </span>
                </div>

                <div className="rmb-room-card__facilities">
                  {room.facilities.map((facility) => (
                    <span key={facility} className="rmb-facility-chip">
                      {facility}
                    </span>
                  ))}
                </div>

                <div className="rmb-room-card__schedule-box">
                  {hasSchedules ? (
                    <>
                      <div className="rmb-room-card__schedule-head">
                        <Clock size={14} aria-hidden="true" />
                        <span>Terpakai kuliah ({selectedDay}):</span>
                      </div>
                      <ul className="rmb-room-card__schedule-list">
                        {schedules.slice(0, 2).map((item, idx) => (
                          <li key={`${item.timeDisplay}-${idx}`}>
                            <span className="rmb-mono-time">
                              {item.timeDisplay}
                            </span>
                            <span>
                              {item.courseName} ({item.prodi} {item.kelas})
                            </span>
                          </li>
                        ))}
                        {schedules.length > 2 && (
                          <li className="rmb-room-card__schedule-more">
                            +{schedules.length - 2} jadwal kuliah lainnya
                          </li>
                        )}
                      </ul>
                    </>
                  ) : (
                    <div className="rmb-room-card__schedule-clear">
                      <CheckCircle2 size={15} aria-hidden="true" />
                      <span>
                        Bebas jadwal kuliah reguler pada{' '}
                        {selectedDay ?? 'hari ini'}.
                      </span>
                    </div>
                  )}
                </div>

                <div className="rmb-room-card__footer">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onOpenBooking(room)}
                  >
                    Ajukan Peminjaman
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
