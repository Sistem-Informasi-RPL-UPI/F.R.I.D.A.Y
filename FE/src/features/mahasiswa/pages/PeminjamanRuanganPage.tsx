import clsx from 'clsx';
import {
  ArrowRight,
  Building2,
  Check,
  Info,
  Layers,
  MapPin,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { useJadwalStore } from '../../../shared/jadwal';
import { Badge, Button } from '../../../shared/ui';
import {
  fetchBookableRoomsFromApi,
  fetchRoomLoansFromApi,
  shouldUseBackendApi,
} from '../api/roomBookingApi';
import { CampusMapSelector } from '../components/CampusMapSelector';
import { RoomBookingModal } from '../components/RoomBookingModal';
import { RoomResultsStep } from '../components/RoomResultsStep';
import {
  BOOKABLE_BUILDINGS,
  buildBookableRooms,
  getDefaultFloorForBuilding,
  getTodayIsoDate,
  type BookableBuildingId,
  type BookableRoom,
  type RoomBookingRecord,
} from '../data/campusBuildings';
import '../styles/peminjamanRuangan.css';

type BookingStep = 1 | 2;

export function PeminjamanRuanganPage() {
  const { rooms: jadwalRooms } = useJadwalStore();

  const [step, setStep] = useState<BookingStep>(1);
  const [selectedBuildingId, setSelectedBuildingId] =
    useState<BookableBuildingId | null>(null);
  const [hoveredBuildingId, setHoveredBuildingId] =
    useState<BookableBuildingId | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    getTodayIsoDate(),
  );
  const [bookingRoom, setBookingRoom] = useState<BookableRoom | null>(null);
  const [apiRooms, setApiRooms] = useState<BookableRoom[] | null>(null);
  const [submittedBookings, setSubmittedBookings] = useState<
    RoomBookingRecord[]
  >([]);

  const fallbackBookableRooms = useMemo(
    () => buildBookableRooms(jadwalRooms),
    [jadwalRooms],
  );

  useEffect(() => {
    if (!shouldUseBackendApi()) {
      return;
    }

    let active = true;
    Promise.allSettled([
      fetchBookableRoomsFromApi(jadwalRooms),
      fetchRoomLoansFromApi(),
    ]).then(([roomsResult, loansResult]) => {
      if (!active) return;

      if (roomsResult.status === 'fulfilled' && roomsResult.value.length > 0) {
        setApiRooms(roomsResult.value);
      }
      if (loansResult.status === 'fulfilled') {
        setSubmittedBookings(loansResult.value);
      }
    });

    return () => {
      active = false;
    };
  }, [jadwalRooms]);

  const allBookableRooms = apiRooms ?? fallbackBookableRooms;

  const roomCountByBuilding = useMemo<Record<BookableBuildingId, number>>(
    () => ({
      A: allBookableRooms.filter((r) => r.buildingId === 'A').length,
      B: allBookableRooms.filter((r) => r.buildingId === 'B').length,
      E: allBookableRooms.filter((r) => r.buildingId === 'E').length,
    }),
    [allBookableRooms],
  );

  const selectedBuilding = useMemo(
    () => BOOKABLE_BUILDINGS.find((b) => b.id === selectedBuildingId) ?? null,
    [selectedBuildingId],
  );

  const selectedBuildingRooms = useMemo(
    () =>
      selectedBuildingId
        ? allBookableRooms.filter((r) => r.buildingId === selectedBuildingId)
        : [],
    [allBookableRooms, selectedBuildingId],
  );

  function handleSelectBuilding(buildingId: BookableBuildingId) {
    if (buildingId !== selectedBuildingId) {
      setSelectedFloor(null);
    }
    setSelectedBuildingId(buildingId);
  }

  function handleEnterBuilding(
    overrideId?: BookableBuildingId,
    floorOverride?: number,
  ) {
    const targetId = overrideId ?? selectedBuildingId;
    if (!targetId) return;

    const building = BOOKABLE_BUILDINGS.find((b) => b.id === targetId);
    if (!building) return;

    const buildingRooms = allBookableRooms.filter(
      (r) => r.buildingId === targetId,
    );
    const nextFloor =
      floorOverride ??
      (targetId === selectedBuildingId && selectedFloor !== null
        ? selectedFloor
        : getDefaultFloorForBuilding(building, buildingRooms));

    setSelectedBuildingId(targetId);
    setSelectedFloor(nextFloor);
    setStep(2);
  }

  function handleStepClick(targetStep: BookingStep) {
    if (targetStep === 1) {
      setStep(1);
      return;
    }
    if (targetStep === 2 && selectedBuildingId) {
      if (selectedFloor === null) {
        handleEnterBuilding(selectedBuildingId);
      } else {
        setStep(2);
      }
    }
  }

  function handleSubmitBooking(record: RoomBookingRecord) {
    setSubmittedBookings((prev) => [record, ...prev]);
  }

  return (
    <div className="rmb-page">
      {/* Page Header */}
      <header className="rmb-page-header">
        <div>
          <span className="rmb-page-header__eyebrow">
            LAYANAN FASILITAS KAMPUS CIBIRU
          </span>
          <h2 className="rmb-page-header__title">Peminjaman Ruangan</h2>
          <p className="rmb-page-header__desc">
            Pilih gedung aktif pada denah kampus (Gedung A, B, atau E), lalu
            pilih lantai, lihat denah ruangan, dan ajukan peminjaman langsung.
          </p>
        </div>

        <div className="rmb-page-header__meta">
          <Badge tone="primary">3 Gedung Aktif (A, B, E)</Badge>
          {submittedBookings.length > 0 && (
            <Badge tone="success">
              {submittedBookings.length} Pengajuan Terkirim
            </Badge>
          )}
        </div>
      </header>

      {/* 2-Step Interactive Stepper */}
      <nav className="rmb-stepper" aria-label="Tahapan alur peminjaman ruangan">
        <div className="rmb-stepper__item">
          <button
            type="button"
            className={clsx(
              'rmb-stepper__btn',
              step === 1 && 'rmb-stepper__btn--active',
              step > 1 && 'rmb-stepper__btn--completed',
            )}
            aria-current={step === 1 ? 'step' : undefined}
            onClick={() => handleStepClick(1)}
          >
            <span className="rmb-stepper__num">
              {step > 1 ? <Check size={16} aria-hidden="true" /> : '1'}
            </span>
            <span className="rmb-stepper__text">
              <span className="rmb-stepper__label">Pilih Gedung</span>
              <span className="rmb-stepper__sub">
                {selectedBuilding
                  ? `${selectedBuilding.name} terpilih`
                  : 'Gedung A, B, atau E'}
              </span>
            </span>
          </button>
        </div>

        <div className="rmb-stepper__item">
          <button
            type="button"
            disabled={!selectedBuilding}
            className={clsx(
              'rmb-stepper__btn',
              step === 2 && 'rmb-stepper__btn--active',
              !selectedBuilding && 'rmb-stepper__btn--disabled',
            )}
            aria-current={step === 2 ? 'step' : undefined}
            onClick={() => handleStepClick(2)}
          >
            <span className="rmb-stepper__num">2</span>
            <span className="rmb-stepper__text">
              <span className="rmb-stepper__label">Lantai &amp; Ruangan</span>
              <span className="rmb-stepper__sub">
                {selectedBuilding && selectedFloor !== null
                  ? `${selectedBuilding.name} • Lantai ${selectedFloor}`
                  : 'Denah lantai & daftar ruangan'}
              </span>
            </span>
          </button>
        </div>
      </nav>

      {/* Step Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        {step === 1 && (
          <div className="rmb-step1-grid">
            <CampusMapSelector
              buildings={BOOKABLE_BUILDINGS}
              roomCountByBuilding={roomCountByBuilding}
              selectedBuildingId={selectedBuildingId}
              hoveredBuildingId={hoveredBuildingId}
              onHoverBuilding={setHoveredBuildingId}
              onSelectBuilding={handleSelectBuilding}
              onQuickProceed={(id) => handleEnterBuilding(id)}
            />

            <aside
              className="rmb-building-panel"
              aria-label="Pilihan gedung yang dapat dipinjam"
            >
              <div className="rmb-building-panel__header">
                <h3 className="rmb-building-panel__title">
                  Gedung Tersedia untuk Peminjaman
                </h3>
                <p className="rmb-building-panel__subtitle">
                  Klik gedung untuk memilih, lalu langsung buka atau pilih cepat
                  lantai tanpa ganti halaman tambahan.
                </p>
              </div>

              <div className="rmb-building-list">
                {BOOKABLE_BUILDINGS.map((building) => {
                  const isSelected = selectedBuildingId === building.id;
                  const isHovered = hoveredBuildingId === building.id;
                  const roomCount = roomCountByBuilding[building.id];
                  const buildingRooms = allBookableRooms.filter(
                    (r) => r.buildingId === building.id,
                  );

                  return (
                    <div
                      key={building.id}
                      className={clsx(
                        'rmb-building-card-wrap',
                        isSelected && 'rmb-building-card-wrap--selected',
                        isHovered &&
                          !isSelected &&
                          'rmb-building-card-wrap--hovered',
                      )}
                      onMouseEnter={() => setHoveredBuildingId(building.id)}
                      onMouseLeave={() => setHoveredBuildingId(null)}
                    >
                      <button
                        type="button"
                        data-testid={`building-card-${building.id}`}
                        aria-pressed={isSelected}
                        className="rmb-building-card"
                        onFocus={() => setHoveredBuildingId(building.id)}
                        onBlur={() => setHoveredBuildingId(null)}
                        onClick={() => handleSelectBuilding(building.id)}
                      >
                        <div className="rmb-building-card__top">
                          <span className="rmb-building-emblem">
                            {building.shortLabel}
                          </span>
                          <div className="rmb-building-card__heading">
                            <span className="rmb-building-card__name">
                              {building.name}
                            </span>
                            <span className="rmb-building-card__zone">
                              <MapPin
                                size={12}
                                style={{
                                  display: 'inline',
                                  verticalAlign: '-1px',
                                  marginRight: '4px',
                                }}
                                aria-hidden="true"
                              />
                              {building.zoneLabel}
                            </span>
                          </div>
                          <Badge tone={isSelected ? 'primary' : 'secondary'}>
                            {isSelected ? 'Terpilih' : building.code}
                          </Badge>
                        </div>

                        <p className="rmb-building-card__tagline">
                          {building.tagline}
                        </p>

                        <div className="rmb-building-card__chips">
                          {building.highlights.map((item) => (
                            <span key={item} className="rmb-facility-chip">
                              {item}
                            </span>
                          ))}
                        </div>

                        <div className="rmb-building-card__stats">
                          <span>
                            <Layers
                              size={13}
                              style={{
                                display: 'inline',
                                verticalAlign: '-2px',
                                marginRight: '4px',
                              }}
                              aria-hidden="true"
                            />
                            {building.floors.length} Lantai
                          </span>
                          <span>
                            <Building2
                              size={13}
                              style={{
                                display: 'inline',
                                verticalAlign: '-2px',
                                marginRight: '4px',
                              }}
                              aria-hidden="true"
                            />
                            {roomCount} Ruangan Terdaftar
                          </span>
                        </div>
                      </button>

                      {isSelected && (
                        <div className="rmb-building-card__floors">
                          <span className="rmb-building-card__floors-label">
                            Langsung ke lantai:
                          </span>
                          <div className="rmb-building-card__floors-list">
                            {building.floors.map((floor) => {
                              const floorRoomCount = buildingRooms.filter(
                                (r) => r.floor === floor.floorNumber,
                              ).length;

                              return (
                                <button
                                  key={floor.floorNumber}
                                  type="button"
                                  data-testid={`quick-floor-${building.id}-${floor.floorNumber}`}
                                  title={floor.subtitle}
                                  className={clsx(
                                    'rmb-floor-shortcut',
                                    floorRoomCount === 0 &&
                                      'rmb-floor-shortcut--muted',
                                  )}
                                  onClick={() =>
                                    handleEnterBuilding(
                                      building.id,
                                      floor.floorNumber,
                                    )
                                  }
                                >
                                  <span>Lt. {floor.floorNumber}</span>
                                  <span className="rmb-floor-shortcut__count">
                                    {floorRoomCount}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="rmb-building-panel__footer">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!selectedBuilding}
                  onClick={() => handleEnterBuilding()}
                >
                  <span>
                    {selectedBuilding
                      ? `Lihat Ruangan (${selectedBuilding.name})`
                      : 'Pilih Gedung Terlebih Dahulu'}
                  </span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>

                <p className="rmb-building-panel__note">
                  <Info
                    size={13}
                    style={{
                      display: 'inline',
                      verticalAlign: '-2px',
                      marginRight: '4px',
                    }}
                    aria-hidden="true"
                  />
                  Gedung C, D, F serta fasilitas kampus lainnya ditampilkan pada
                  denah sebagai orientasi lokasi dan belum dibuka untuk
                  peminjaman mandiri.
                </p>
              </div>
            </aside>
          </div>
        )}

        {step === 2 && selectedBuilding && selectedFloor !== null && (
          <RoomResultsStep
            building={selectedBuilding}
            floorNumber={selectedFloor}
            allBuildingRooms={selectedBuildingRooms}
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
            onSelectFloor={setSelectedFloor}
            onBackToBuildings={() => setStep(1)}
            onOpenBooking={setBookingRoom}
          />
        )}
      </motion.div>

      {/* Ringkasan Pengajuan pada Sesi Ini */}
      {submittedBookings.length > 0 && (
        <section
          className="rmb-session-bookings"
          aria-label="Pengajuan peminjaman ruangan pada sesi ini"
        >
          <div className="rmb-session-bookings__header">
            <h4>Pengajuan Peminjaman Sesi Ini</h4>
            <Badge tone="accent">{submittedBookings.length} Pengajuan</Badge>
          </div>
          <div className="rmb-session-bookings__list">
            {submittedBookings.map((booking) => (
              <div key={booking.id} className="rmb-session-bookings__item">
                <div className="rmb-session-bookings__main">
                  <strong>
                    {booking.roomCode} — {booking.roomName}
                  </strong>
                  <span className="rmb-session-bookings__meta">
                    Gedung {booking.buildingId} Lt. {booking.floor} •{' '}
                    {booking.date} ({booking.startTime}–{booking.endTime}) •{' '}
                    {booking.attendeeCount} peserta • {booking.purpose}
                  </span>
                </div>
                <Badge tone="accent">{booking.status}</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal Pengajuan Peminjaman */}
      <RoomBookingModal
        room={bookingRoom}
        defaultDate={selectedDate}
        onClose={() => setBookingRoom(null)}
        onSubmitBooking={handleSubmitBooking}
      />
    </div>
  );
}
