import clsx from 'clsx';
import type { KeyboardEvent } from 'react';
import { Button } from '../../../shared/ui';
import type {
  BookableRoom,
  BuildingConfig,
  CourtyardSlot,
  FloorPlanLayout,
} from '../data/campusBuildings';

export interface FloorPlanViewerProps {
  building: BuildingConfig;
  floorNumber: number;
  layout: FloorPlanLayout;
  rooms: readonly BookableRoom[];
  occupiedRoomIds: ReadonlySet<number>;
  selectedRoomId: string | null;
  hoveredRoomId: string | null;
  onHoverRoom: (roomId: string | null) => void;
  onSelectRoom: (room: BookableRoom) => void;
  onOpenBooking: (room: BookableRoom) => void;
}

type DoorEdge = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

function wrapRoomLabel(text: string, maxChars = 17): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.slice(0, 3);
}

function getDoorPath(
  x: number,
  y: number,
  width: number,
  height: number,
  doorEdge: DoorEdge,
  doorSize = 22,
): string {
  switch (doorEdge) {
    case 'bottom-left':
      return `M ${x + doorSize} ${y + height} L ${x + doorSize} ${y + height - doorSize} A ${doorSize} ${doorSize} 0 0 0 ${x} ${y + height}`;
    case 'top-right':
      return `M ${x + width - doorSize} ${y} L ${x + width - doorSize} ${y + doorSize} A ${doorSize} ${doorSize} 0 0 0 ${x + width} ${y}`;
    case 'top-left':
      return `M ${x + doorSize} ${y} L ${x + doorSize} ${y + doorSize} A ${doorSize} ${doorSize} 0 0 1 ${x} ${y}`;
    case 'bottom-right':
    default:
      return `M ${x + width - doorSize} ${y + height} L ${x + width - doorSize} ${y + height - doorSize} A ${doorSize} ${doorSize} 0 0 1 ${x + width} ${y + height}`;
  }
}

function getFoldingWallPoints(
  edgeX: number,
  y: number,
  height: number,
): string {
  const top = y + 18;
  const bottom = y + height - 18;
  const step = 12;
  const points: string[] = [];
  let toggle = false;
  for (let cy = top; cy <= bottom; cy += step) {
    const dx = toggle ? 4 : -4;
    points.push(`${edgeX + dx},${cy}`);
    toggle = !toggle;
  }
  return points.join(' ');
}

interface RoomSlotProps {
  room: BookableRoom;
  x: number;
  y: number;
  width: number;
  height: number;
  doorEdge?: DoorEdge;
  hasFoldingWallLeft?: boolean;
  hasFoldingWallRight?: boolean;
  isSelected: boolean;
  isHovered: boolean;
  isOccupied: boolean;
  onHoverRoom: (roomId: string | null) => void;
  onSelectRoom: (room: BookableRoom) => void;
  onOpenBooking: (room: BookableRoom) => void;
}

function FloorPlanRoomSlot({
  room,
  x,
  y,
  width,
  height,
  doorEdge = 'bottom-right',
  hasFoldingWallLeft = false,
  hasFoldingWallRight = false,
  isSelected,
  isHovered,
  isOccupied,
  onHoverRoom,
  onSelectRoom,
  onOpenBooking,
}: RoomSlotProps) {
  const maxChars = Math.max(12, Math.floor((width - 24) / 8.2));
  const lines = wrapRoomLabel(room.name, maxChars);
  const centerX = x + width / 2;
  const compact = height <= 165;
  const lineStep = lines.length === 3 ? 15 : 17;
  const baseTitleY = compact ? y + 68 : y + 76;
  const startY =
    lines.length === 1
      ? baseTitleY + 10
      : lines.length === 2
        ? baseTitleY
        : baseTitleY - 8;

  function handleKeyDown(event: KeyboardEvent<SVGGElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectRoom(room);
    }
  }

  return (
    <g
      role="button"
      tabIndex={0}
      data-testid={`floorplan-room-${room.code}`}
      aria-label={`Pilih ${room.name} (${room.code})`}
      aria-pressed={isSelected}
      className={clsx(
        'rmb-floorplan-room',
        isSelected && 'rmb-floorplan-room--selected',
        isHovered && !isSelected && 'rmb-floorplan-room--hovered',
      )}
      onClick={() => onSelectRoom(room)}
      onDoubleClick={() => onOpenBooking(room)}
      onMouseEnter={() => onHoverRoom(room.id)}
      onMouseLeave={() => onHoverRoom(null)}
      onFocus={() => onHoverRoom(room.id)}
      onBlur={() => onHoverRoom(null)}
      onKeyDown={handleKeyDown}
    >
      {isSelected && (
        <rect
          x={x - 4}
          y={y - 4}
          width={width + 8}
          height={height + 8}
          rx="12"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
        />
      )}

      {/* Kotak ruangan */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="8"
        className="rmb-floorplan-room__box"
      />

      {/* Indikator partisi lipat bila tersedia */}
      {hasFoldingWallLeft && (
        <polyline
          points={getFoldingWallPoints(x, y, height)}
          fill="none"
          className="rmb-floorplan-folding-wall"
        />
      )}
      {hasFoldingWallRight && (
        <polyline
          points={getFoldingWallPoints(x + width, y, height)}
          fill="none"
          className="rmb-floorplan-folding-wall"
        />
      )}

      {/* Garis ayunan pintu */}
      <path
        d={getDoorPath(x, y, width, height, doorEdge)}
        fill="none"
        className="rmb-floorplan-room__door"
      />

      {/* Badge nomor urut ruang */}
      {room.roomNumber !== undefined && (
        <>
          <circle
            cx={x + 21}
            cy={y + 21}
            r="11"
            className="rmb-floorplan-room__num-bg"
          />
          <text
            x={x + 21}
            y={y + 25}
            textAnchor="middle"
            className="rmb-floorplan-room__num-text"
          >
            {room.roomNumber}
          </text>
        </>
      )}

      {/* Indikator status ketersediaan jadwal */}
      <circle
        cx={x + width - 17}
        cy={y + 19}
        r="5"
        className={clsx(
          'rmb-floorplan-room__status',
          isOccupied && 'rmb-floorplan-room__status--occupied',
        )}
      />

      {/* Nama Ruangan */}
      <text
        x={centerX}
        y={startY}
        textAnchor="middle"
        fontSize={width < 180 ? 11.5 : undefined}
        className="rmb-floorplan-room__title"
      >
        {lines.map((line, index) => (
          <tspan
            key={`${room.id}-line-${index}`}
            x={centerX}
            dy={index === 0 ? 0 : lineStep}
          >
            {line}
          </tspan>
        ))}
      </text>

      {/* Kode Resmi Ruangan */}
      <rect
        x={x + 14}
        y={y + height - 42}
        width={width - 28}
        height="24"
        rx="6"
        className="rmb-floorplan-room__code-bg"
      />
      <text
        x={centerX}
        y={y + height - 26}
        textAnchor="middle"
        className="rmb-floorplan-room__code-text"
      >
        {room.code}
      </text>
    </g>
  );
}

interface NonBookableSlotProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  roomNumber?: number;
  label: string;
  code?: string;
  note: string;
  doorEdge?: DoorEdge;
}

function CourtyardNonBookableSlot({
  id,
  x,
  y,
  width,
  height,
  roomNumber,
  label,
  code,
  note,
  doorEdge = 'bottom-right',
}: NonBookableSlotProps) {
  const maxChars = Math.max(12, Math.floor((width - 26) / 7.8));
  const lines = wrapRoomLabel(label, maxChars);
  const centerX = x + width / 2;
  const lineStep = 15;
  const baseTitleY = code ? y + 58 : y + 66;
  const startY =
    lines.length === 1
      ? baseTitleY + 8
      : lines.length === 2
        ? baseTitleY
        : baseTitleY - 6;
  const badgeWidth = Math.min(122, width - 24);

  return (
    <g aria-hidden="true">
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="8"
        className="rmb-floorplan-utility__box"
      />
      <path
        d={getDoorPath(x, y, width, height, doorEdge, 20)}
        fill="none"
        className="rmb-floorplan-utility__door"
      />
      {roomNumber !== undefined && (
        <>
          <circle
            cx={x + 21}
            cy={y + 21}
            r="11"
            className="rmb-floorplan-utility__num-bg"
          />
          <text
            x={x + 21}
            y={y + 25}
            textAnchor="middle"
            className="rmb-floorplan-utility__num-text"
          >
            {roomNumber}
          </text>
        </>
      )}
      <text
        x={centerX}
        y={startY}
        textAnchor="middle"
        fontSize={width < 185 ? 11.5 : undefined}
        className="rmb-floorplan-utility__title"
      >
        {lines.map((line, index) => (
          <tspan
            key={`${id}-line-${index}`}
            x={centerX}
            dy={index === 0 ? 0 : lineStep}
          >
            {line}
          </tspan>
        ))}
      </text>
      {code && (
        <text
          x={centerX}
          y={y + height - 48}
          textAnchor="middle"
          className="rmb-floorplan-utility__code"
        >
          {code}
        </text>
      )}
      <rect
        x={centerX - badgeWidth / 2}
        y={y + height - 34}
        width={badgeWidth}
        height="20"
        rx="10"
        className="rmb-floorplan-utility__tag-bg"
      />
      <text
        x={centerX}
        y={y + height - 20}
        textAnchor="middle"
        className="rmb-floorplan-utility__tag-text"
      >
        {note}
      </text>
    </g>
  );
}

export function FloorPlanViewer({
  building,
  floorNumber,
  layout,
  rooms,
  occupiedRoomIds,
  selectedRoomId,
  hoveredRoomId,
  onHoverRoom,
  onSelectRoom,
  onOpenBooking,
}: FloorPlanViewerProps) {
  const roomByCode = new Map(rooms.map((r) => [r.code, r]));
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) ?? null;

  const isCourtyard = layout.kind === 'courtyard';
  const hasUtilityOrNonBookable =
    layout.kind === 'single-wing'
      ? Boolean(layout.utilityRoom)
      : [
          ...layout.topLeftSlots,
          layout.topRightSlot,
          ...layout.bottomSlots,
        ].some((slot) => slot.kind === 'non-bookable');

  const svgHeight = isCourtyard ? 546 : layout.utilityRoom ? 406 : 244;

  function renderCourtyardSlot(
    slot: CourtyardSlot,
    key: string,
    x: number,
    y: number,
    width: number,
    height: number,
    doorEdge: DoorEdge,
  ) {
    if (slot.kind === 'room') {
      const room = roomByCode.get(slot.roomCode);
      if (!room) return null;
      return (
        <FloorPlanRoomSlot
          key={room.id}
          room={room}
          x={x}
          y={y}
          width={width}
          height={height}
          doorEdge={doorEdge}
          hasFoldingWallLeft={slot.hasFoldingWallLeft}
          hasFoldingWallRight={slot.hasFoldingWallRight}
          isSelected={selectedRoomId === room.id}
          isHovered={hoveredRoomId === room.id}
          isOccupied={
            room.jadwalRoomId !== undefined &&
            occupiedRoomIds.has(room.jadwalRoomId)
          }
          onHoverRoom={onHoverRoom}
          onSelectRoom={onSelectRoom}
          onOpenBooking={onOpenBooking}
        />
      );
    }

    if (slot.kind === 'non-bookable') {
      return (
        <CourtyardNonBookableSlot
          key={key}
          id={slot.id}
          x={x}
          y={y}
          width={width}
          height={height}
          roomNumber={slot.roomNumber}
          label={slot.label}
          code={slot.code}
          note={slot.note}
          doorEdge={doorEdge}
        />
      );
    }

    if (slot.kind === 'entrance') {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      return (
        <g key={key} aria-hidden="true">
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            rx="8"
            className="rmb-floorplan-entrance__box"
          />
          {slot.roomNumber !== undefined && (
            <>
              <circle
                cx={centerX}
                cy={y + 34}
                r="13"
                className="rmb-floorplan-entrance__num-bg"
              />
              <text
                x={centerX}
                y={y + 38}
                textAnchor="middle"
                className="rmb-floorplan-entrance__num-text"
              >
                {slot.roomNumber}
              </text>
            </>
          )}
          <rect
            x={x + 14}
            y={centerY - 6}
            width={width - 28}
            height="28"
            rx="6"
            className="rmb-floorplan-entrance__pill"
          />
          <text
            x={centerX}
            y={centerY + 12}
            textAnchor="middle"
            className="rmb-floorplan-entrance__label"
          >
            {slot.label.toUpperCase()}
          </text>
          <path
            d={`M ${centerX} ${y + height - 18} L ${centerX} ${y + height - 42} M ${centerX - 7} ${y + height - 35} L ${centerX} ${y + height - 42} L ${centerX + 7} ${y + height - 35}`}
            fill="none"
            className="rmb-floorplan-entrance__arrow"
          />
        </g>
      );
    }

    return (
      <g key={key} aria-hidden="true">
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx="8"
          className="rmb-floorplan-corridor__box"
        />
        {slot.label && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 4}
            textAnchor="middle"
            className="rmb-floorplan-corridor__label"
          >
            {slot.label}
          </text>
        )}
      </g>
    );
  }

  return (
    <section
      className="rmb-floorplan-card"
      aria-label={`Denah interaktif ${building.name} Lantai ${floorNumber}`}
    >
      <div className="rmb-floorplan-card__top">
        <div>
          <span className="rmb-floorplan-card__eyebrow">
            DENAH LANTAI INTERAKTIF
          </span>
          <h4 className="rmb-floorplan-card__title">
            Denah {building.name} — Lantai {floorNumber}
          </h4>
        </div>
        <span className="rmb-floorplan-card__hint">
          {rooms.length > 0
            ? 'Klik ruangan pada denah untuk menyorot, klik ganda untuk langsung mengajukan'
            : 'Denah orientasi lantai (seluruh ruangan non-peminjaman)'}
        </span>
      </div>

      <div className="rmb-floorplan-viewport">
        <svg
          viewBox={`0 0 960 ${svgHeight}`}
          className="rmb-floorplan-svg"
          role="group"
          aria-label={`Tata letak ruangan ${building.name} Lantai ${floorNumber}`}
        >
          <defs>
            <pattern
              id={`floorplan-grid-${building.id}-${floorNumber}`}
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1"
                fill="var(--map-grid)"
                opacity="0.9"
              />
            </pattern>
          </defs>

          {/* Kanvas denah */}
          <rect
            x="0"
            y="0"
            width="960"
            height={svgHeight}
            rx="14"
            fill="var(--map-bg)"
          />
          <rect
            x="14"
            y="14"
            width="932"
            height={svgHeight - 28}
            rx="10"
            fill={`url(#floorplan-grid-${building.id}-${floorNumber})`}
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />

          {layout.kind === 'single-wing' && (
            <>
              {/* Sayap Kiri */}
              {layout.leftWingRoomCodes.map((code, index) => {
                const room = roomByCode.get(code);
                if (!room) return null;
                const leftPositions = [32, 224];
                return (
                  <FloorPlanRoomSlot
                    key={room.id}
                    room={room}
                    x={leftPositions[index] ?? 32}
                    y={34}
                    width={188}
                    height={176}
                    isSelected={selectedRoomId === room.id}
                    isHovered={hoveredRoomId === room.id}
                    isOccupied={
                      room.jadwalRoomId !== undefined &&
                      occupiedRoomIds.has(room.jadwalRoomId)
                    }
                    onHoverRoom={onHoverRoom}
                    onSelectRoom={onSelectRoom}
                    onOpenBooking={onOpenBooking}
                  />
                );
              })}

              {/* Zona Tengah: Toilet & Tangga */}
              <g aria-hidden="true">
                <rect
                  x="418"
                  y="34"
                  width="124"
                  height="176"
                  rx="8"
                  className="rmb-floorplan-core__box"
                />

                {layout.hasToilet && (
                  <g>
                    <rect
                      x="434"
                      y="48"
                      width="92"
                      height="26"
                      rx="6"
                      className="rmb-floorplan-core__badge"
                    />
                    <text
                      x="480"
                      y="65"
                      textAnchor="middle"
                      className="rmb-floorplan-core__label"
                    >
                      TOILET
                    </text>
                  </g>
                )}

                {layout.hasStairs && (
                  <g>
                    {[0, 1, 2, 3, 4, 5].map((stepIdx) => {
                      const baseY = layout.hasToilet ? 90 : 66;
                      return (
                        <line
                          key={stepIdx}
                          x1="436"
                          y1={baseY + stepIdx * 12}
                          x2="524"
                          y2={baseY + stepIdx * 12}
                          className="rmb-floorplan-core__stair"
                        />
                      );
                    })}
                    <rect
                      x="434"
                      y={layout.hasToilet ? 166 : 148}
                      width="92"
                      height="26"
                      rx="6"
                      className="rmb-floorplan-core__badge"
                    />
                    <text
                      x="480"
                      y={layout.hasToilet ? 183 : 165}
                      textAnchor="middle"
                      className="rmb-floorplan-core__label"
                    >
                      TANGGA
                    </text>
                  </g>
                )}
              </g>

              {/* Sayap Kanan */}
              {layout.rightWingRoomCodes.map((code, index) => {
                const room = roomByCode.get(code);
                if (!room) return null;
                const rightPositions = [548, 740];
                return (
                  <FloorPlanRoomSlot
                    key={room.id}
                    room={room}
                    x={rightPositions[index] ?? 548}
                    y={34}
                    width={188}
                    height={176}
                    isSelected={selectedRoomId === room.id}
                    isHovered={hoveredRoomId === room.id}
                    isOccupied={
                      room.jadwalRoomId !== undefined &&
                      occupiedRoomIds.has(room.jadwalRoomId)
                    }
                    onHoverRoom={onHoverRoom}
                    onSelectRoom={onSelectRoom}
                    onOpenBooking={onOpenBooking}
                  />
                );
              })}

              {/* Ruangan Utilitas Non-Peminjaman (contoh: Ruang Gudang Lantai 2) */}
              {layout.utilityRoom && (
                <CourtyardNonBookableSlot
                  id={layout.utilityRoom.id}
                  x={32}
                  y={224}
                  width={188}
                  height={148}
                  roomNumber={layout.utilityRoom.roomNumber}
                  label={layout.utilityRoom.label}
                  code={layout.utilityRoom.code}
                  note={layout.utilityRoom.note}
                />
              )}
            </>
          )}

          {layout.kind === 'courtyard' && (
            <>
              {/* Baris Atas: 2 Slot Kiri */}
              {layout.topLeftSlots.map((slot, idx) =>
                renderCourtyardSlot(
                  slot,
                  `top-left-${idx}`,
                  idx === 0 ? 28 : 216,
                  28,
                  182,
                  160,
                  idx === 0 ? 'bottom-right' : 'bottom-left',
                ),
              )}

              {/* Zona Tengah-Atas: Tangga + Lift */}
              <g aria-hidden="true">
                <rect
                  x="404"
                  y="28"
                  width="148"
                  height="160"
                  rx="8"
                  className="rmb-floorplan-core__box"
                />
                {[0, 1, 2, 3, 4, 5].map((stepIdx) => (
                  <line
                    key={`top-stair-${stepIdx}`}
                    x1="420"
                    y1={40 + stepIdx * 10}
                    x2="536"
                    y2={40 + stepIdx * 10}
                    className="rmb-floorplan-core__stair"
                  />
                ))}
                <rect
                  x="432"
                  y="98"
                  width="92"
                  height="22"
                  rx="5"
                  className="rmb-floorplan-core__badge"
                />
                <text
                  x="478"
                  y="113"
                  textAnchor="middle"
                  className="rmb-floorplan-core__label"
                >
                  TANGGA
                </text>
                <rect
                  x="442"
                  y="126"
                  width="72"
                  height="48"
                  rx="6"
                  className="rmb-floorplan-core__badge"
                />
                <text
                  x="478"
                  y="154"
                  textAnchor="middle"
                  className="rmb-floorplan-core__label"
                >
                  LIFT
                </text>
              </g>

              {/* Zona Tengah-Atas: Toilet */}
              <g aria-hidden="true">
                <rect
                  x="558"
                  y="28"
                  width="94"
                  height="160"
                  rx="8"
                  className="rmb-floorplan-core__box"
                />
                <rect
                  x="568"
                  y="38"
                  width="74"
                  height="22"
                  rx="5"
                  className="rmb-floorplan-core__badge"
                />
                <text
                  x="605"
                  y="53"
                  textAnchor="middle"
                  className="rmb-floorplan-core__label"
                >
                  TOILET
                </text>
                {[0, 1, 2, 3].map((stallIdx) => (
                  <rect
                    key={`toilet-stall-${stallIdx}`}
                    x="598"
                    y={70 + stallIdx * 24}
                    width="42"
                    height="18"
                    rx="3"
                    className="rmb-floorplan-core__stall"
                  />
                ))}
              </g>

              {/* Baris Atas: 1 Slot Lebar Kanan */}
              {renderCourtyardSlot(
                layout.topRightSlot,
                'top-right',
                658,
                28,
                274,
                160,
                'bottom-right',
              )}

              {/* Zona Tengah / Selasar + Lift & Tangga Kiri-Kanan */}
              <g aria-hidden="true">
                {/* Lift & Tangga Sayap Kiri */}
                <rect
                  x="62"
                  y="208"
                  width="132"
                  height="108"
                  rx="8"
                  className="rmb-floorplan-core__box"
                />
                <rect
                  x="84"
                  y="218"
                  width="88"
                  height="32"
                  rx="5"
                  className="rmb-floorplan-core__badge"
                />
                <text
                  x="128"
                  y="238"
                  textAnchor="middle"
                  className="rmb-floorplan-core__label"
                >
                  LIFT
                </text>
                {[0, 1, 2, 3].map((idx) => (
                  <line
                    key={`left-stair-${idx}`}
                    x1="84"
                    y1={258 + idx * 7}
                    x2="172"
                    y2={258 + idx * 7}
                    className="rmb-floorplan-core__stair"
                  />
                ))}
                <rect
                  x="84"
                  y="286"
                  width="88"
                  height="22"
                  rx="5"
                  className="rmb-floorplan-core__badge"
                />
                <text
                  x="128"
                  y="301"
                  textAnchor="middle"
                  className="rmb-floorplan-core__label"
                >
                  TANGGA
                </text>

                {/* Atrium Tengah / Selasar */}
                <rect
                  x="248"
                  y="208"
                  width="464"
                  height="108"
                  rx="10"
                  className="rmb-floorplan-atrium__box"
                />
                <text
                  x="480"
                  y={layout.centerSublabel ? 254 : 267}
                  textAnchor="middle"
                  className="rmb-floorplan-atrium__label"
                >
                  {layout.centerLabel}
                </text>
                {layout.centerSublabel && (
                  <text
                    x="480"
                    y="276"
                    textAnchor="middle"
                    className="rmb-floorplan-atrium__sub"
                  >
                    {layout.centerSublabel}
                  </text>
                )}

                {/* Lift & Tangga Sayap Kanan */}
                <rect
                  x="766"
                  y="208"
                  width="132"
                  height="108"
                  rx="8"
                  className="rmb-floorplan-core__box"
                />
                <rect
                  x="788"
                  y="218"
                  width="88"
                  height="32"
                  rx="5"
                  className="rmb-floorplan-core__badge"
                />
                <text
                  x="832"
                  y="238"
                  textAnchor="middle"
                  className="rmb-floorplan-core__label"
                >
                  LIFT
                </text>
                {[0, 1, 2, 3].map((idx) => (
                  <line
                    key={`right-stair-${idx}`}
                    x1="788"
                    y1={258 + idx * 7}
                    x2="876"
                    y2={258 + idx * 7}
                    className="rmb-floorplan-core__stair"
                  />
                ))}
                <rect
                  x="788"
                  y="286"
                  width="88"
                  height="22"
                  rx="5"
                  className="rmb-floorplan-core__badge"
                />
                <text
                  x="832"
                  y="301"
                  textAnchor="middle"
                  className="rmb-floorplan-core__label"
                >
                  TANGGA
                </text>
              </g>

              {/* Baris Bawah: Slot Dinamis Sesuai Proporsi */}
              {(() => {
                const gap = 6;
                const totalFlex = layout.bottomSlots.reduce(
                  (sum, slot) => sum + slot.flex,
                  0,
                );
                const usableWidth = 904 - gap * (layout.bottomSlots.length - 1);
                let cursorX = 28;

                return layout.bottomSlots.map((slot, idx) => {
                  const slotWidth = (slot.flex / totalFlex) * usableWidth;
                  const slotX = cursorX;
                  cursorX += slotWidth + gap;

                  return renderCourtyardSlot(
                    slot,
                    `bottom-${idx}`,
                    slotX,
                    336,
                    slotWidth,
                    180,
                    'top-right',
                  );
                });
              })()}
            </>
          )}
        </svg>
      </div>

      {/* Legenda & Quick Booking Bar */}
      <div className="rmb-floorplan-footer">
        <div className="rmb-floorplan-legend">
          {rooms.length > 0 && (
            <>
              <span className="rmb-map-legend__item">
                <span
                  className="rmb-floorplan-dot rmb-floorplan-dot--clear"
                  aria-hidden="true"
                />
                <span>Bebas Jadwal Kuliah</span>
              </span>
              <span className="rmb-map-legend__item">
                <span
                  className="rmb-floorplan-dot rmb-floorplan-dot--occupied"
                  aria-hidden="true"
                />
                <span>Ada Jadwal Kuliah</span>
              </span>
              <span className="rmb-map-legend__item">
                <span
                  className="rmb-map-legend__swatch rmb-map-legend__swatch--selected"
                  aria-hidden="true"
                />
                <span>Ruang Terpilih</span>
              </span>
            </>
          )}
          {hasUtilityOrNonBookable && (
            <span className="rmb-map-legend__item">
              <span
                className="rmb-map-legend__swatch rmb-map-legend__swatch--inactive"
                aria-hidden="true"
              />
              <span>Utilitas / Non-Peminjaman</span>
            </span>
          )}
        </div>

        {selectedRoom && (
          <div className="rmb-floorplan-selected-bar">
            <span className="rmb-floorplan-selected-bar__text">
              Terpilih: <strong>{selectedRoom.name}</strong> (
              <code>{selectedRoom.code}</code>)
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenBooking(selectedRoom)}
            >
              Ajukan Peminjaman
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
