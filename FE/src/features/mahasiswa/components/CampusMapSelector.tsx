import clsx from 'clsx';
import type { KeyboardEvent } from 'react';
import type {
  BookableBuildingId,
  BuildingConfig,
} from '../data/campusBuildings';

export interface CampusMapSelectorProps {
  buildings: readonly BuildingConfig[];
  roomCountByBuilding: Record<BookableBuildingId, number>;
  selectedBuildingId: BookableBuildingId | null;
  hoveredBuildingId: BookableBuildingId | null;
  onHoverBuilding: (id: BookableBuildingId | null) => void;
  onSelectBuilding: (id: BookableBuildingId) => void;
  onQuickProceed?: (id: BookableBuildingId) => void;
}

interface BuildingGeometry {
  cx: number;
  cy: number;
  width: number;
  height: number;
  angle: number;
}

const BUILDING_GEOMETRY: Record<BookableBuildingId, BuildingGeometry> = {
  E: { cx: 458, cy: 130, width: 156, height: 84, angle: -10 },
  B: { cx: 396, cy: 396, width: 148, height: 194, angle: -3 },
  A: { cx: 614, cy: 396, width: 108, height: 192, angle: -3 },
};

export function CampusMapSelector({
  buildings,
  roomCountByBuilding,
  selectedBuildingId,
  hoveredBuildingId,
  onHoverBuilding,
  onSelectBuilding,
  onQuickProceed,
}: CampusMapSelectorProps) {
  function handleBuildingKeyDown(
    event: KeyboardEvent<SVGGElement>,
    buildingId: BookableBuildingId,
  ) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectBuilding(buildingId);
    }
  }

  return (
    <div className="rmb-map-card">
      <div className="rmb-map-card__top">
        <div>
          <span className="rmb-map-card__eyebrow">DENAH INTERAKTIF KAMPUS</span>
          <h3 className="rmb-map-card__title">
            Peta UPI Kampus Cibiru — Pilih Gedung
          </h3>
        </div>
        <span className="rmb-map-card__hint">
          Klik gedung aktif (A, B, atau E) untuk memilih
        </span>
      </div>

      <div className="rmb-map-viewport">
        <svg
          viewBox="0 0 960 600"
          className="rmb-map-svg"
          role="group"
          aria-label="Denah interaktif UPI Kampus Cibiru. Gedung yang dapat dipinjam adalah Gedung A, Gedung B, dan Gedung E."
        >
          <defs>
            <pattern
              id="campus-dot-grid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1.25"
                fill="var(--map-grid)"
                opacity="0.9"
              />
            </pattern>
            <filter
              id="building-shadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow dx="0" dy="6" stdDeviation="5" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* Canvas & Blueprint Grid */}
          <rect
            x="0"
            y="0"
            width="960"
            height="600"
            rx="18"
            fill="var(--map-bg)"
          />
          <rect
            x="16"
            y="16"
            width="928"
            height="568"
            rx="14"
            fill="url(#campus-dot-grid)"
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />

          {/* Header Denah & Kompas Utara (Sisi Kanan Atas) */}
          <g aria-hidden="true">
            <rect
              x="572"
              y="30"
              width="348"
              height="74"
              rx="14"
              fill="var(--color-surface)"
              stroke="var(--color-border)"
              strokeWidth="1.5"
            />
            <text
              x="592"
              y="55"
              className="rmb-map-header-eyebrow"
              textAnchor="start"
            >
              UNIVERSITAS PENDIDIKAN INDONESIA
            </text>
            <text
              x="592"
              y="81"
              className="rmb-map-header-title"
              textAnchor="start"
            >
              DENAH KAMPUS CIBIRU
            </text>

            {/* North Compass */}
            <g transform="translate(886, 67)">
              <circle
                cx="0"
                cy="0"
                r="19"
                fill="var(--color-primary-tint)"
                stroke="var(--color-border-strong)"
                strokeWidth="1.5"
              />
              <polygon
                points="0,-13 -5,1 0,-2 5,1"
                fill="var(--color-primary)"
              />
              <text
                x="0"
                y="13"
                textAnchor="middle"
                className="rmb-map-compass-label"
              >
                U
              </text>
            </g>
          </g>

          {/* Jalan Utama Kampus & Plaza Tengah */}
          <g aria-hidden="true">
            {/* Jalan bawah */}
            <rect
              x="28"
              y="534"
              width="904"
              height="40"
              rx="10"
              fill="var(--map-road)"
              stroke="var(--map-road-stroke)"
              strokeWidth="1.5"
            />
            <line
              x1="44"
              y1="554"
              x2="916"
              y2="554"
              stroke="var(--map-road-stroke)"
              strokeWidth="2"
              strokeDasharray="10 8"
            />

            {/* Jalur masuk vertikal + koridor menuju kompleks atas */}
            <path
              d="M 690 536 L 690 250 Q 690 218 656 210 L 580 192 L 380 232"
              fill="none"
              stroke="var(--map-road)"
              strokeWidth="34"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 690 536 L 690 250 Q 690 218 656 210 L 580 192"
              fill="none"
              stroke="var(--map-road-stroke)"
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />

            {/* Plaza Utama di antara Gedung B dan A */}
            <rect
              x="492"
              y="324"
              width="62"
              height="148"
              rx="12"
              fill="var(--color-surface-muted)"
              stroke="var(--color-border)"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <text
              x="523"
              y="394"
              textAnchor="middle"
              className="rmb-map-watermark"
            >
              Plaza
            </text>
            <text
              x="523"
              y="409"
              textAnchor="middle"
              className="rmb-map-watermark"
            >
              Utama
            </text>
          </g>

          {/* Area Hijau & Kolam Kampus (Sisi Timur) */}
          <g aria-hidden="true">
            <path
              d="M 754 156 L 910 164 Q 922 165 922 178 L 918 334 L 876 410 L 826 516 L 784 516 L 784 440 L 758 320 Z"
              fill="var(--map-park-fill)"
              stroke="var(--map-park-stroke)"
              strokeWidth="2"
            />
            {/* Aksen kanopi pepohonan */}
            <circle
              cx="806"
              cy="208"
              r="20"
              fill="var(--map-court-stroke)"
              opacity="0.28"
            />
            <circle
              cx="870"
              cy="226"
              r="24"
              fill="var(--map-court-stroke)"
              opacity="0.25"
            />
            <circle
              cx="842"
              cy="296"
              r="22"
              fill="var(--map-court-stroke)"
              opacity="0.25"
            />
            <text
              x="838"
              y="256"
              textAnchor="middle"
              className="rmb-map-park-label"
            >
              Area Hijau
            </text>
            <text
              x="838"
              y="272"
              textAnchor="middle"
              className="rmb-map-park-sublabel"
            >
              Taman Kampus
            </text>

            {/* Kolam & Gazebo */}
            <polygon
              points="812,388 866,374 862,456 812,456"
              fill="var(--map-water-fill)"
              stroke="var(--map-water-stroke)"
              strokeWidth="1.75"
            />
            <circle cx="842" cy="416" r="5" fill="var(--color-ink-primary)" />

            {/* Pos Keamanan */}
            <rect
              x="792"
              y="472"
              width="22"
              height="18"
              rx="4"
              fill="var(--color-warning)"
              opacity="0.85"
            />
          </g>

          {/* Penanda Pintu Masuk Kampus */}
          <g aria-hidden="true">
            <line
              x1="690"
              y1="528"
              x2="690"
              y2="476"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <polygon
              points="690,466 684,478 696,478"
              fill="var(--color-primary)"
            />
            <rect
              x="616"
              y="540"
              width="148"
              height="28"
              rx="14"
              fill="var(--color-primary)"
            />
            <text
              x="690"
              y="558"
              textAnchor="middle"
              className="rmb-map-entrance-text"
            >
              Pintu Masuk Kampus
            </text>
          </g>

          {/* Fasilitas Pendukung (Sisi Barat — Non-Peminjaman) */}
          <g aria-hidden="true">
            {/* Asrama Mahasiswi */}
            <rect
              x="40"
              y="42"
              width="126"
              height="80"
              rx="10"
              fill="var(--map-facility-fill)"
              stroke="var(--map-facility-stroke)"
              strokeWidth="1.5"
            />
            <text
              x="103"
              y="78"
              textAnchor="middle"
              className="rmb-map-facility-label"
            >
              Asrama
            </text>
            <text
              x="103"
              y="95"
              textAnchor="middle"
              className="rmb-map-facility-label"
            >
              Mahasiswi
            </text>

            {/* Gedung UKM */}
            <rect
              x="40"
              y="186"
              width="118"
              height="84"
              rx="10"
              fill="var(--map-facility-fill)"
              stroke="var(--map-facility-stroke)"
              strokeWidth="1.5"
            />
            <text
              x="99"
              y="224"
              textAnchor="middle"
              className="rmb-map-facility-label"
            >
              Gedung
            </text>
            <text
              x="99"
              y="241"
              textAnchor="middle"
              className="rmb-map-facility-label"
            >
              UKM
            </text>

            {/* Mesjid As-Sakinah */}
            <g transform="translate(96, 422)">
              <g transform="rotate(34)">
                <rect
                  x="-40"
                  y="-40"
                  width="80"
                  height="80"
                  rx="10"
                  fill="var(--map-facility-fill)"
                  stroke="var(--map-facility-stroke)"
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="-3"
                  textAnchor="middle"
                  className="rmb-map-facility-label"
                >
                  Mesjid
                </text>
                <text
                  x="0"
                  y="12"
                  textAnchor="middle"
                  className="rmb-map-facility-label"
                >
                  As-Sakinah
                </text>
              </g>
            </g>

            {/* Lapangan Olah Raga */}
            <g transform="translate(226, 404)">
              <g transform="rotate(-12)">
                <rect
                  x="-48"
                  y="-52"
                  width="96"
                  height="104"
                  rx="10"
                  fill="var(--map-court-fill)"
                  stroke="var(--map-court-stroke)"
                  strokeWidth="1.75"
                />
                <rect
                  x="-36"
                  y="-40"
                  width="72"
                  height="80"
                  rx="4"
                  fill="none"
                  stroke="var(--color-surface)"
                  strokeWidth="1.5"
                  opacity="0.7"
                />
                <line
                  x1="-36"
                  y1="0"
                  x2="36"
                  y2="0"
                  stroke="var(--color-surface)"
                  strokeWidth="1.5"
                  opacity="0.7"
                />
                <text
                  x="0"
                  y="-4"
                  textAnchor="middle"
                  className="rmb-map-court-label"
                >
                  Lapangan
                </text>
                <text
                  x="0"
                  y="13"
                  textAnchor="middle"
                  className="rmb-map-court-label"
                >
                  Olah Raga
                </text>
              </g>
            </g>
          </g>

          {/* Gedung Non-Peminjaman: D, C, F (Muted & Tidak Dapat Dipilih) */}
          <g aria-hidden="true">
            {/* Gedung D (Bentuk L sesuai denah asli) */}
            <g transform="translate(298, 124)">
              <g transform="rotate(-10)">
                <path
                  d="M -62,-36 L 62,-36 L 62,-4 L 28,-4 L 28,36 L -62,36 Z"
                  fill="var(--map-inactive-fill)"
                  stroke="var(--map-inactive-stroke)"
                  strokeWidth="1.75"
                  strokeDasharray="5 3"
                />
                <text
                  x="-14"
                  y="-2"
                  textAnchor="middle"
                  className="rmb-map-inactive-title"
                >
                  Gedung D
                </text>
                <text
                  x="-14"
                  y="14"
                  textAnchor="middle"
                  className="rmb-map-inactive-sub"
                >
                  Non-peminjaman
                </text>
              </g>
            </g>

            {/* Gedung C */}
            <g transform="translate(318, 212)">
              <g transform="rotate(-10)">
                <rect
                  x="-64"
                  y="-22"
                  width="128"
                  height="44"
                  rx="8"
                  fill="var(--map-inactive-fill)"
                  stroke="var(--map-inactive-stroke)"
                  strokeWidth="1.75"
                  strokeDasharray="5 3"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  className="rmb-map-inactive-title"
                >
                  Gedung C
                </text>
              </g>
            </g>

            {/* Gedung F */}
            <g transform="translate(534, 224)">
              <g transform="rotate(-10)">
                <rect
                  x="-72"
                  y="-22"
                  width="144"
                  height="44"
                  rx="8"
                  fill="var(--map-inactive-fill)"
                  stroke="var(--map-inactive-stroke)"
                  strokeWidth="1.75"
                  strokeDasharray="5 3"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  className="rmb-map-inactive-title"
                >
                  Gedung F
                </text>
              </g>
            </g>
          </g>

          {/* 3 Gedung Aktif yang Dapat Dipinjam: A, B, dan E */}
          {buildings.map((building) => {
            const geom = BUILDING_GEOMETRY[building.id];
            const isSelected = selectedBuildingId === building.id;
            const isHovered = hoveredBuildingId === building.id;
            const roomCount = roomCountByBuilding[building.id];
            const halfW = geom.width / 2;
            const halfH = geom.height / 2;
            const isTall = geom.height > 120;

            return (
              <g
                key={building.id}
                role="button"
                tabIndex={0}
                data-testid={`map-building-${building.id}`}
                aria-label={`Pilih ${building.name} — ${building.floors.length} lantai, ${roomCount} ruangan terdaftar`}
                aria-pressed={isSelected}
                className={clsx(
                  'rmb-map-building',
                  isSelected && 'rmb-map-building--selected',
                  isHovered && !isSelected && 'rmb-map-building--hovered',
                )}
                transform={`translate(${geom.cx}, ${geom.cy})`}
                onClick={() => onSelectBuilding(building.id)}
                onDoubleClick={() => onQuickProceed?.(building.id)}
                onMouseEnter={() => onHoverBuilding(building.id)}
                onMouseLeave={() => onHoverBuilding(null)}
                onFocus={() => onHoverBuilding(building.id)}
                onBlur={() => onHoverBuilding(null)}
                onKeyDown={(e) => handleBuildingKeyDown(e, building.id)}
              >
                <g transform={`rotate(${geom.angle})`}>
                  {/* Cincin sorot aktif */}
                  {isSelected && (
                    <rect
                      x={-halfW - 6}
                      y={-halfH - 6}
                      width={geom.width + 12}
                      height={geom.height + 12}
                      rx="16"
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="3.5"
                    />
                  )}

                  {/* Footprint Gedung */}
                  <rect
                    x={-halfW}
                    y={-halfH}
                    width={geom.width}
                    height={geom.height}
                    rx="12"
                    filter="url(#building-shadow)"
                    className="rmb-map-building__shape"
                  />

                  {/* Badge Huruf Gedung */}
                  <circle
                    cx="0"
                    cy={isTall ? -24 : -19}
                    r={isTall ? 18 : 12}
                    className="rmb-map-building__emblem"
                  />
                  <text
                    x="0"
                    y={isTall ? -18 : -14}
                    textAnchor="middle"
                    fontSize={isTall ? undefined : 13}
                    className="rmb-map-building__letter"
                  >
                    {building.shortLabel}
                  </text>

                  {/* Nama & Info Singkat (Sinkron dengan Kemiringan Gedung) */}
                  <text
                    x="0"
                    y={isTall ? 12 : 9}
                    textAnchor="middle"
                    className="rmb-map-building__name"
                  >
                    {building.name}
                  </text>
                  <text
                    x="0"
                    y={isTall ? 31 : 25}
                    textAnchor="middle"
                    className="rmb-map-building__meta"
                  >
                    {building.floors.length} Lantai • {roomCount} Ruang
                  </text>

                  {/* Indikator Status Aktif di Sudut Atas */}
                  <circle
                    cx={halfW - 14}
                    cy={-halfH + 14}
                    r="5.5"
                    className="rmb-map-building__dot"
                  />
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legenda Peta */}
      <div className="rmb-map-legend" aria-label="Legenda Denah Kampus">
        <div className="rmb-map-legend__item">
          <span
            className="rmb-map-legend__swatch rmb-map-legend__swatch--active"
            aria-hidden="true"
          />
          <span>Gedung Aktif (A, B, E)</span>
        </div>
        <div className="rmb-map-legend__item">
          <span
            className="rmb-map-legend__swatch rmb-map-legend__swatch--selected"
            aria-hidden="true"
          />
          <span>Gedung Terpilih</span>
        </div>
        <div className="rmb-map-legend__item">
          <span
            className="rmb-map-legend__swatch rmb-map-legend__swatch--inactive"
            aria-hidden="true"
          />
          <span>Non-Peminjaman (C, D, F &amp; Fasilitas)</span>
        </div>
        <div className="rmb-map-legend__item">
          <span
            className="rmb-map-legend__swatch rmb-map-legend__swatch--park"
            aria-hidden="true"
          />
          <span>Area Hijau &amp; Lapangan</span>
        </div>
      </div>
    </div>
  );
}
