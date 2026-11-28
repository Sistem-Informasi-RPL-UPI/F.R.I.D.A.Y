import { apiRequest, ensureCsrfCookie } from '../../../shared/api/client';
import type { Ruangan } from '../../../shared/jadwal';
import type {
  BookableBuildingId,
  BookableRoom,
  RoomBookingRecord,
  RoomBookingStatus,
  RoomCategory,
} from '../data/campusBuildings';

export interface ApiBuilding {
  id: number;
  code: string;
  name: string;
  floor_count: number;
  description: string | null;
  is_active: boolean;
}

export interface ApiRoom {
  id: number;
  building_id: number;
  code: string;
  short_code: string | null;
  name: string;
  floor: number;
  room_number: number | null;
  capacity: number;
  room_type: string;
  facilities: string[] | null;
  is_bookable: boolean;
  is_schedulable: boolean;
  is_active: boolean;
  building?: ApiBuilding;
}

export interface ApiRoomLoan {
  id: number;
  room_id: number;
  purpose: string;
  start_at: string;
  end_at: string;
  attendee_count: number;
  status: string;
  notes: string | null;
  created_at?: string;
  room?: ApiRoom;
}

export interface SubmitRoomLoanInput {
  roomId: number;
  date: string;
  startTime: string;
  endTime: string;
  attendeeCount: number;
  organizer: string;
  purpose: string;
}

export function shouldUseBackendApi(): boolean {
  return Boolean(import.meta.env.VITE_API_ORIGIN);
}

function mapBuildingCodeToId(
  buildingCode: string | undefined,
  roomCode: string,
): BookableBuildingId | null {
  const normalized = (buildingCode ?? '').trim().toUpperCase();
  if (normalized === 'GD-A' || normalized === 'A') return 'A';
  if (normalized === 'GD-B' || normalized === 'B') return 'B';
  if (normalized === 'GD-E' || normalized === 'E') return 'E';

  const upperRoom = roomCode.trim().toUpperCase();
  if (upperRoom.startsWith('A')) return 'A';
  if (upperRoom.startsWith('B')) return 'B';
  if (upperRoom.includes('E.') || upperRoom.startsWith('CBR')) return 'E';

  return null;
}

function mapRoomTypeToCategory(roomType: string): RoomCategory {
  switch (roomType.trim().toLowerCase()) {
    case 'lab':
      return 'Laboratorium';
    case 'aula':
    case 'rapat':
      return 'Aula & Rapat';
    case 'studio':
      return 'Studio & Media';
    case 'kelas':
    default:
      return 'Ruang Kelas';
  }
}

function mapLoanStatus(status: string): RoomBookingStatus {
  switch (status.trim().toLowerCase()) {
    case 'approved':
      return 'Disetujui';
    case 'rejected':
      return 'Ditolak';
    case 'cancelled':
      return 'Dibatalkan';
    case 'pending':
    default:
      return 'Menunggu Persetujuan';
  }
}

function extractTimeParts(isoOrSqlDateTime: string): {
  date: string;
  time: string;
} {
  const normalized = isoOrSqlDateTime.trim().replace('T', ' ');
  const [datePart = '', timePart = ''] = normalized.split(' ');
  return {
    date: datePart.slice(0, 10),
    time: timePart.slice(0, 5),
  };
}

function mapApiLoanToRecord(loan: ApiRoomLoan): RoomBookingRecord | null {
  const room = loan.room;
  if (!room) return null;

  const buildingId = mapBuildingCodeToId(room.building?.code, room.code);
  if (!buildingId) return null;

  const start = extractTimeParts(loan.start_at);
  const end = extractTimeParts(loan.end_at);
  const organizer = loan.notes?.startsWith('Penanggung jawab: ')
    ? loan.notes.replace('Penanggung jawab: ', '')
    : (loan.notes ?? 'Mahasiswa');

  return {
    id: `BE-${loan.id}`,
    roomCode: room.code,
    roomName: room.name,
    buildingId,
    floor: room.floor,
    date: start.date,
    startTime: start.time,
    endTime: end.time,
    attendeeCount: loan.attendee_count,
    purpose: loan.purpose,
    organizer,
    status: mapLoanStatus(loan.status),
    submittedAt: loan.created_at
      ? extractTimeParts(loan.created_at).time
      : start.time,
  };
}

export async function fetchBookableRoomsFromApi(
  jadwalRooms: readonly Ruangan[],
): Promise<BookableRoom[]> {
  const response = await apiRequest<{ data: ApiRoom[] }>(
    '/api/v1/facilities/rooms?bookable_only=1',
  );

  const jadwalByCode = new Map<string, number>();
  for (const r of jadwalRooms) {
    jadwalByCode.set(r.kode.trim().toUpperCase(), r.urutan);
  }

  const mapped: BookableRoom[] = [];
  for (const item of response.data) {
    const buildingId = mapBuildingCodeToId(item.building?.code, item.code);
    if (!buildingId) continue;

    const lookupCode = (item.short_code ?? item.code).trim().toUpperCase();
    const jadwalRoomId = jadwalByCode.get(lookupCode);

    mapped.push({
      id: `api-room-${item.id}`,
      backendRoomId: item.id,
      code: item.code,
      shortCode: item.short_code ?? undefined,
      roomNumber: item.room_number ?? undefined,
      name: item.name,
      buildingId,
      floor: item.floor,
      category: mapRoomTypeToCategory(item.room_type),
      capacity: item.capacity,
      facilities: item.facilities ?? [],
      jadwalRoomId,
    });
  }

  return mapped.sort((a, b) => {
    if (a.buildingId !== b.buildingId) {
      return a.buildingId.localeCompare(b.buildingId);
    }
    if (a.floor !== b.floor) {
      return a.floor - b.floor;
    }
    if (a.roomNumber !== undefined && b.roomNumber !== undefined) {
      return a.roomNumber - b.roomNumber;
    }
    return a.code.localeCompare(b.code);
  });
}

export async function fetchRoomLoansFromApi(): Promise<RoomBookingRecord[]> {
  const response = await apiRequest<{ data: ApiRoomLoan[] }>(
    '/api/v1/loans/rooms',
  );
  return response.data
    .map(mapApiLoanToRecord)
    .filter((item): item is RoomBookingRecord => item !== null);
}

export async function submitRoomLoanToApi(
  input: SubmitRoomLoanInput,
): Promise<RoomBookingRecord> {
  await ensureCsrfCookie();

  const response = await apiRequest<{ data: ApiRoomLoan }>(
    '/api/v1/loans/rooms',
    {
      method: 'POST',
      body: JSON.stringify({
        room_id: input.roomId,
        purpose: input.purpose,
        start_at: `${input.date} ${input.startTime}:00`,
        end_at: `${input.date} ${input.endTime}:00`,
        attendee_count: input.attendeeCount,
        notes: `Penanggung jawab: ${input.organizer}`,
      }),
    },
  );

  const mapped = mapApiLoanToRecord(response.data);
  if (!mapped) {
    throw new Error('Data peminjaman ruangan dari server tidak lengkap.');
  }
  return mapped;
}
