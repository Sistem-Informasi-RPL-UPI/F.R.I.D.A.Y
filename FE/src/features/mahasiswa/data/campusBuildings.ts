import type { DayName, Ruangan } from '../../../shared/jadwal';

/**
 * Konfigurasi master gedung, lantai, denah lantai, dan pemetaan ruangan peminjaman
 * untuk UPI Kampus Cibiru.
 *
 * Catatan pemeliharaan:
 * Data lantai, denah lantai, dan daftar ruangan terpusat di file ini agar
 * penambahan/penyesuaian lantai maupun ruangan per gedung dapat dilakukan di
 * satu tempat tanpa mengubah komponen UI.
 */

export type BookableBuildingId = 'A' | 'B' | 'E';

export type RoomCategory =
  'Ruang Kelas' | 'Laboratorium' | 'Studio & Media' | 'Aula & Rapat';

export interface FloorConfig {
  floorNumber: number;
  label: string;
  subtitle: string;
  areaTag: string;
}

export interface BuildingConfig {
  id: BookableBuildingId;
  code: string;
  shortLabel: string;
  name: string;
  tagline: string;
  zoneLabel: string;
  description: string;
  floors: readonly FloorConfig[];
  highlights: readonly string[];
}

export interface BookableRoom {
  id: string;
  code: string;
  shortCode?: string;
  roomNumber?: number;
  name: string;
  buildingId: BookableBuildingId;
  floor: number;
  category: RoomCategory;
  capacity: number;
  facilities: readonly string[];
  jadwalRoomId?: number;
}

export interface FloorPlanUtilitySlot {
  id: string;
  roomNumber?: number;
  label: string;
  code?: string;
  position: 'wing-left-bottom';
  note: string;
}

export interface SingleWingFloorPlanLayout {
  kind: 'single-wing';
  buildingId: BookableBuildingId;
  floorNumber: number;
  hasToilet: boolean;
  hasStairs: boolean;
  /** Diurutkan dari kiri ke kanan pada sayap kiri (mis. slot 4, slot 3) */
  leftWingRoomCodes: readonly string[];
  /** Diurutkan dari kiri ke kanan pada sayap kanan (mis. slot 2, slot 1) */
  rightWingRoomCodes: readonly string[];
  /** Ruangan utilitas non-peminjaman opsional (mis. Ruang Gudang pada Lt. 2) */
  utilityRoom?: FloorPlanUtilitySlot;
}

export type CourtyardSlot =
  | {
      kind: 'room';
      roomCode: string;
      flex: number;
      hasFoldingWallLeft?: boolean;
      hasFoldingWallRight?: boolean;
    }
  | {
      kind: 'non-bookable';
      id: string;
      roomNumber?: number;
      label: string;
      code?: string;
      note: string;
      flex: number;
    }
  | {
      kind: 'entrance';
      roomNumber?: number;
      label: string;
      flex: number;
    }
  | {
      kind: 'corridor';
      label?: string;
      flex: number;
    };

export interface CourtyardFloorPlanLayout {
  kind: 'courtyard';
  buildingId: BookableBuildingId;
  floorNumber: number;
  centerLabel: string;
  centerSublabel?: string;
  /** 2 slot baris atas kiri (kiri -> tengah-kiri) */
  topLeftSlots: readonly CourtyardSlot[];
  /** 1 slot lebar baris atas kanan */
  topRightSlot: CourtyardSlot;
  /** Slot baris bawah dari kiri ke kanan */
  bottomSlots: readonly CourtyardSlot[];
}

export type FloorPlanLayout =
  SingleWingFloorPlanLayout | CourtyardFloorPlanLayout;

export interface RoomBookingRecord {
  id: string;
  roomCode: string;
  roomName: string;
  buildingId: BookableBuildingId;
  floor: number;
  date: string;
  startTime: string;
  endTime: string;
  attendeeCount: number;
  purpose: string;
  organizer: string;
  status: 'Menunggu Persetujuan';
  submittedAt: string;
}

export const BOOKABLE_BUILDINGS: readonly BuildingConfig[] = [
  {
    id: 'A',
    code: 'GD-A',
    shortLabel: 'A',
    name: 'Gedung A',
    tagline: 'Administrasi, Media & Studio Kreatif',
    zoneLabel: 'Sisi Timur • Dekat Pintu Masuk Kampus',
    description:
      'Gedung utama di sisi timur dekat gerbang masuk kampus dengan fasilitas laboratorium multimedia, studio foto, studio audio, dan ruang inovasi digital.',
    highlights: ['Lab Multimedia', 'Studio Foto & Audio', '3 Lantai'],
    floors: [
      {
        floorNumber: 1,
        label: 'Lantai 1',
        subtitle: 'Lobby & Administrasi',
        areaTag: 'Zona Layanan & Resepsionis',
      },
      {
        floorNumber: 2,
        label: 'Lantai 2',
        subtitle: 'Ruang Akademik & Pertemuan',
        areaTag: 'Zona Akademik',
      },
      {
        floorNumber: 3,
        label: 'Lantai 3',
        subtitle: 'Laboratorium Multimedia, Audio & Studio Foto',
        areaTag: 'Zona Lab & Studio Media',
      },
    ],
  },
  {
    id: 'B',
    code: 'GD-B',
    shortLabel: 'B',
    name: 'Gedung B',
    tagline: 'Pusat Perkuliahan, Laboratorium & Smartclass Kampus',
    zoneLabel: 'Sisi Selatan • Sebelah Lapangan Olahraga',
    description:
      'Gedung perkuliahan utama 5 lantai dengan 25 ruang aktif meliputi ruang perkuliahan, Labkom Bahasa & Pendidikan, Lab RPL, Lab TEKKOM, Smartclass, Lab Audio Visual, serta Microteaching.',
    highlights: ['25 Ruang Aktif', 'Smartclass & Lab', '5 Lantai'],
    floors: [
      {
        floorNumber: 1,
        label: 'Lantai 1',
        subtitle: 'Ruang Dosen & Ketua Prodi (Non-Peminjaman)',
        areaTag: 'Perkantoran & Pintu Masuk',
      },
      {
        floorNumber: 2,
        label: 'Lantai 2',
        subtitle: 'Perkuliahan, Labkom Bahasa, Lab RPL & Microteaching',
        areaTag: '5 Ruang Aktif • 2 Ruang Prodi',
      },
      {
        floorNumber: 3,
        label: 'Lantai 3',
        subtitle: 'Smartclass, Lab TEKKOM, Labkom Pendidikan & Audio Visual',
        areaTag: '7 Ruang Aktif • Lift, Toilet & Tangga',
      },
      {
        floorNumber: 4,
        label: 'Lantai 4',
        subtitle: 'Ruang Perkuliahan, Lab Audio Visual & Perpustakaan',
        areaTag: '5 Ruang Aktif • Perpustakaan',
      },
      {
        floorNumber: 5,
        label: 'Lantai 5',
        subtitle: 'Ruang Perkuliahan Utama Lantai 5',
        areaTag: '8 Ruang Perkuliahan • Partisi Lipat',
      },
    ],
  },
  {
    id: 'E',
    code: 'GD-E',
    shortLabel: 'E',
    name: 'Gedung E',
    tagline: 'Laboratorium RPL, TEKKOM, Robotika, PGSD, Aula & Ruang Kuliah',
    zoneLabel: 'Sisi Utara • Kompleks Akademik Atas',
    description:
      'Gedung akademik di sisi utara dengan 3 lantai yang menaungi Aula Pertemuan, Lab Robotika, Lab TEKKOM, Lab Komputer & IMAC RPL, Lab PGSD, Ruang TIK, dan ruang perkuliahan.',
    highlights: [
      '12 Ruang Aktif',
      'Lab RPL, IMAC & Robotika',
      'Aula Pertemuan',
      '3 Lantai',
    ],
    floors: [
      {
        floorNumber: 1,
        label: 'Lantai 1',
        subtitle:
          'Lab Robotika, Lab TEKKOM, Aula Pertemuan & Ruang Perkuliahan',
        areaTag: '4 Ruang • Toilet & Tangga',
      },
      {
        floorNumber: 2,
        label: 'Lantai 2',
        subtitle: 'Lab Komputer RPL, Lab IMAC RPL, Ruang TIK & Lab PGSD',
        areaTag: '4 Ruang • Gudang, Toilet & Tangga',
      },
      {
        floorNumber: 3,
        label: 'Lantai 3',
        subtitle: 'Ruang Perkuliahan Gedung E',
        areaTag: '4 Ruang • Akses Tangga',
      },
    ],
  },
] as const;

const CUSTOM_BUILDING_ROOMS: Partial<
  Record<BookableBuildingId, readonly BookableRoom[]>
> = {
  B: [
    // Lantai 1: seluruhnya ruang perkantoran dosen & ketua prodi (non-peminjaman di denah)

    // Lantai 2 (5 ruang aktif; Ruang Kaprodi & Dosen Magister PGSD berstatus non-peminjaman)
    {
      id: 'room-b2-b-02-002',
      code: 'B.02.002',
      shortCode: 'B2.002',
      roomNumber: 3,
      name: 'Ruang Perkuliahan (Labkom Bahasa)',
      buildingId: 'B',
      floor: 2,
      category: 'Laboratorium',
      capacity: 36,
      facilities: ['PC Praktikum Bahasa', 'Headset & Audio', 'Proyektor', 'AC'],
      jadwalRoomId: 1,
    },
    {
      id: 'room-b2-b-02-005',
      code: 'B.02.005',
      roomNumber: 4,
      name: 'Ruang Laboratorium (Lab RPL)',
      buildingId: 'B',
      floor: 2,
      category: 'Laboratorium',
      capacity: 36,
      facilities: [
        'PC Praktikum RPL',
        'Proyektor',
        'AC',
        'Jaringan LAN & Wi-Fi',
      ],
    },
    {
      id: 'room-b2-b-02-006',
      code: 'B.02.006',
      shortCode: 'B2.006',
      roomNumber: 5,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 2,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 2,
    },
    {
      id: 'room-b2-b-02-007',
      code: 'B.02.007',
      shortCode: 'B2.007',
      roomNumber: 6,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 2,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 3,
    },
    {
      id: 'room-b2-b-02-009',
      code: 'B.02.009',
      roomNumber: 7,
      name: 'Ruang Microteaching',
      buildingId: 'B',
      floor: 2,
      category: 'Studio & Media',
      capacity: 30,
      facilities: [
        'Perangkat Microteaching',
        'Kamera Observasi',
        'Proyektor',
        'AC',
      ],
    },

    // Lantai 3 (7 ruang aktif)
    {
      id: 'room-b3-b-03-000',
      code: 'B.03.000',
      roomNumber: 1,
      name: 'Ruang Laboratorium (Lab TEKKOM)',
      buildingId: 'B',
      floor: 3,
      category: 'Laboratorium',
      capacity: 32,
      facilities: [
        'Meja Praktikum Hardware',
        'Perangkat Jaringan',
        'Proyektor',
        'AC',
      ],
    },
    {
      id: 'room-b3-b-03-001',
      code: 'B.03.001',
      shortCode: 'B3.001',
      roomNumber: 2,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 3,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 4,
    },
    {
      id: 'room-b3-b-03-002',
      code: 'B.03.002',
      shortCode: 'B3.002',
      roomNumber: 3,
      name: 'Ruang Perkuliahan (Smartclass)',
      buildingId: 'B',
      floor: 3,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: [
        'Smartboard Interaktif',
        'Kursi Kuliah',
        'Proyektor',
        'AC',
        'Wi-Fi Kampus',
      ],
      jadwalRoomId: 5,
    },
    {
      id: 'room-b3-b-03-005',
      code: 'B.03.005',
      roomNumber: 4,
      name: 'Ruang Media Digital (Audio Visual)',
      buildingId: 'B',
      floor: 3,
      category: 'Studio & Media',
      capacity: 30,
      facilities: [
        'Perangkat Audio Visual',
        'Peredam Akustik',
        'Proyektor',
        'AC',
      ],
    },
    {
      id: 'room-b3-b-03-006',
      code: 'B.03.006',
      shortCode: 'B3.006',
      roomNumber: 5,
      name: 'Ruang Perkuliahan (Labkom Pendidikan)',
      buildingId: 'B',
      floor: 3,
      category: 'Laboratorium',
      capacity: 36,
      facilities: ['PC Praktikum', 'Proyektor', 'AC', 'Jaringan LAN & Wi-Fi'],
      jadwalRoomId: 6,
    },
    {
      id: 'room-b3-b-03-007',
      code: 'B.03.007',
      shortCode: 'B3.007',
      roomNumber: 6,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 3,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 7,
    },
    {
      id: 'room-b3-b-03-009',
      code: 'B.03.009',
      roomNumber: 7,
      name: 'Laboratorium Microteaching',
      buildingId: 'B',
      floor: 3,
      category: 'Studio & Media',
      capacity: 30,
      facilities: [
        'Perangkat Microteaching',
        'Kamera Observasi',
        'Proyektor',
        'AC',
      ],
    },

    // Lantai 4 (5 ruang aktif; Ruang Perpustakaan B.04.007 berstatus non-peminjaman di denah)
    {
      id: 'room-b4-b-04-000',
      code: 'B.04.000',
      roomNumber: 1,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 4,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
    },
    {
      id: 'room-b4-b-04-001',
      code: 'B.04.001',
      shortCode: 'B4.001',
      roomNumber: 2,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 4,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 8,
    },
    {
      id: 'room-b4-b-04-002',
      code: 'B.04.002',
      shortCode: 'B4.002',
      roomNumber: 3,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 4,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 9,
    },
    {
      id: 'room-b4-b-04-005',
      code: 'B.04.005',
      roomNumber: 4,
      name: 'Laboratorium Audio Visual',
      buildingId: 'B',
      floor: 4,
      category: 'Studio & Media',
      capacity: 30,
      facilities: [
        'Perangkat Audio Visual',
        'Peredam Akustik',
        'Proyektor',
        'AC',
      ],
    },
    {
      id: 'room-b4-b-04-006',
      code: 'B.04.006',
      shortCode: 'B4.006',
      roomNumber: 5,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 4,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 10,
    },

    // Lantai 5 (8 ruang perkuliahan aktif)
    {
      id: 'room-b5-b-05-000',
      code: 'B.05.000',
      shortCode: 'B5.000',
      roomNumber: 1,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 5,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 11,
    },
    {
      id: 'room-b5-b-05-001',
      code: 'B.05.001',
      shortCode: 'B5.001',
      roomNumber: 2,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 5,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 12,
    },
    {
      id: 'room-b5-b-05-002',
      code: 'B.05.002',
      shortCode: 'B5.002',
      roomNumber: 3,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 5,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 13,
    },
    {
      id: 'room-b5-b-05-005',
      code: 'B.05.005',
      shortCode: 'B5.005',
      roomNumber: 4,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 5,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 14,
    },
    {
      id: 'room-b5-b-05-006',
      code: 'B.05.006',
      shortCode: 'B5.006',
      roomNumber: 5,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 5,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 15,
    },
    {
      id: 'room-b5-b-05-007',
      code: 'B.05.007',
      shortCode: 'B5.007',
      roomNumber: 6,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 5,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 16,
    },
    {
      id: 'room-b5-b-05-008',
      code: 'B.05.008',
      shortCode: 'B5.008',
      roomNumber: 7,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 5,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 17,
    },
    {
      id: 'room-b5-b-05-009',
      code: 'B.05.009',
      shortCode: 'B5.009',
      roomNumber: 8,
      name: 'Ruang Perkuliahan',
      buildingId: 'B',
      floor: 5,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: [
        'Kursi Kuliah',
        'Proyektor',
        'Whiteboard',
        'AC',
        'Partisi Lipat',
      ],
      jadwalRoomId: 18,
    },
  ],
  E: [
    // Lantai 1 (4 ruang aktif)
    {
      id: 'room-e1-cbr-1-420-10-01-079',
      code: 'CBR 1.420.10.01.079',
      roomNumber: 1,
      name: 'Ruang Perkuliahan 1-1.4',
      buildingId: 'E',
      floor: 1,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
    },
    {
      id: 'room-e1-20-4e-01-000',
      code: '20.4E.01.000',
      roomNumber: 2,
      name: 'Ruang Aula Pertemuan',
      buildingId: 'E',
      floor: 1,
      category: 'Aula & Rapat',
      capacity: 80,
      facilities: [
        'Sound System',
        'Proyektor',
        'Kursi Aula',
        'AC',
        'Wi-Fi Kampus',
      ],
    },
    {
      id: 'room-e1-20-4e-01-003',
      code: '20.4E.01.003',
      roomNumber: 3,
      name: 'Ruang Lab TEKKOM',
      buildingId: 'E',
      floor: 1,
      category: 'Laboratorium',
      capacity: 32,
      facilities: [
        'Meja Praktikum Hardware',
        'Perangkat Jaringan',
        'Proyektor',
        'AC',
      ],
    },
    {
      id: 'room-e1-20-4e-01-004',
      code: '20.4E.01.004',
      shortCode: 'E1.004',
      roomNumber: 4,
      name: 'Ruang Lab Robotika',
      buildingId: 'E',
      floor: 1,
      category: 'Laboratorium',
      capacity: 32,
      facilities: [
        'Meja Praktikum Robotika',
        'Kit Mikrokontroler',
        'Proyektor',
        'AC',
      ],
      jadwalRoomId: 27,
    },

    // Lantai 2 (4 ruang aktif; Ruang Gudang 20.4E.02.007 berstatus non-peminjaman di denah)
    {
      id: 'room-e2-20-4e-02-001',
      code: '20.4E.02.001',
      shortCode: 'E2.001',
      roomNumber: 1,
      name: 'Ruang Lab PGSD',
      buildingId: 'E',
      floor: 2,
      category: 'Laboratorium',
      capacity: 36,
      facilities: ['PC Praktikum', 'Proyektor', 'AC', 'Jaringan LAN & Wi-Fi'],
      jadwalRoomId: 25,
    },
    {
      id: 'room-e2-20-4e-02-002',
      code: '20.4E.02.002',
      roomNumber: 2,
      name: 'Ruang Teknologi Informasi & Komunikasi',
      buildingId: 'E',
      floor: 2,
      category: 'Laboratorium',
      capacity: 36,
      facilities: ['Perangkat TIK', 'Proyektor', 'AC', 'Jaringan LAN & Wi-Fi'],
    },
    {
      id: 'room-e2-20-4e-02-005',
      code: '20.4E.02.005',
      shortCode: 'E2.005',
      roomNumber: 3,
      name: 'Ruang Lab IMAC RPL',
      buildingId: 'E',
      floor: 2,
      category: 'Laboratorium',
      capacity: 30,
      facilities: ['Unit iMac', 'Proyektor', 'AC', 'Jaringan LAN & Wi-Fi'],
      jadwalRoomId: 24,
    },
    {
      id: 'room-e2-20-4e-02-006',
      code: '20.4E.02.006',
      roomNumber: 4,
      name: 'Ruang Lab Komputer RPL',
      buildingId: 'E',
      floor: 2,
      category: 'Laboratorium',
      capacity: 36,
      facilities: [
        'PC Praktikum RPL',
        'Proyektor',
        'AC',
        'Jaringan LAN & Wi-Fi',
      ],
    },

    // Lantai 3 (4 ruang perkuliahan)
    {
      id: 'room-e3-20-4e-03-000',
      code: '20.4E.03.000',
      shortCode: 'E3.000',
      roomNumber: 1,
      name: 'Ruang Perkuliahan',
      buildingId: 'E',
      floor: 3,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 19,
    },
    {
      id: 'room-e3-20-4e-03-001',
      code: '20.4E.03.001',
      shortCode: 'E3.001',
      roomNumber: 2,
      name: 'Ruang Perkuliahan',
      buildingId: 'E',
      floor: 3,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 20,
    },
    {
      id: 'room-e3-20-4e-03-002',
      code: '20.4E.03.002',
      shortCode: 'E3.002',
      roomNumber: 3,
      name: 'Ruang Perkuliahan',
      buildingId: 'E',
      floor: 3,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 21,
    },
    {
      id: 'room-e3-20-4e-03-003',
      code: '20.4E.03.003',
      shortCode: 'E3.003',
      roomNumber: 4,
      name: 'Ruang Perkuliahan',
      buildingId: 'E',
      floor: 3,
      category: 'Ruang Kelas',
      capacity: 40,
      facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
      jadwalRoomId: 22,
    },
  ],
};

export const FLOOR_PLANS: readonly FloorPlanLayout[] = [
  // Gedung B — Denah 5 Lantai (Courtyard 2-Row Layout)
  {
    kind: 'courtyard',
    buildingId: 'B',
    floorNumber: 1,
    centerLabel: 'AREA TENGAH / SELASAR',
    centerSublabel: 'LANTAI 1',
    topLeftSlots: [
      {
        kind: 'non-bookable',
        id: 'b-l1-dosen-rpl',
        roomNumber: 6,
        label: 'Ruang Dosen Prodi RPL',
        note: 'Non-peminjaman',
        flex: 1,
      },
      {
        kind: 'non-bookable',
        id: 'b-l1-kaprodi-rpl',
        roomNumber: 5,
        label: 'Ruang Ketua Prodi RPL',
        note: 'Non-peminjaman',
        flex: 1,
      },
    ],
    topRightSlot: {
      kind: 'non-bookable',
      id: 'b-l1-dosen-umum',
      roomNumber: 4,
      label: 'Ruang Dosen',
      note: 'Non-peminjaman',
      flex: 1,
    },
    bottomSlots: [
      {
        kind: 'non-bookable',
        id: 'b-l1-dosen-pmm',
        roomNumber: 7,
        label: 'Ruang Dosen Prodi Pendidikan Multimedia',
        note: 'Non-peminjaman',
        flex: 1,
      },
      {
        kind: 'non-bookable',
        id: 'b-l1-kaprodi-pmm',
        roomNumber: 8,
        label: 'Ruang Ketua Prodi Pendidikan Multimedia',
        note: 'Non-peminjaman',
        flex: 1,
      },
      {
        kind: 'entrance',
        roomNumber: 1,
        label: 'Pintu Masuk',
        flex: 0.9,
      },
      {
        kind: 'non-bookable',
        id: 'b-l1-kaprodi-tekkom',
        roomNumber: 2,
        label: 'Ruang Ketua Prodi Teknik Komputer',
        note: 'Non-peminjaman',
        flex: 1,
      },
      {
        kind: 'non-bookable',
        id: 'b-l1-dosen-tekkom',
        roomNumber: 3,
        label: 'Ruang Dosen Prodi Teknik Komputer',
        note: 'Non-peminjaman',
        flex: 1,
      },
    ],
  },
  {
    kind: 'courtyard',
    buildingId: 'B',
    floorNumber: 2,
    centerLabel: 'AREA TENGAH',
    topLeftSlots: [
      { kind: 'room', roomCode: 'B.02.006', flex: 1 },
      { kind: 'room', roomCode: 'B.02.005', flex: 1 },
    ],
    topRightSlot: { kind: 'room', roomCode: 'B.02.002', flex: 1 },
    bottomSlots: [
      { kind: 'room', roomCode: 'B.02.007', flex: 1 },
      { kind: 'room', roomCode: 'B.02.009', flex: 1 },
      { kind: 'corridor', label: 'Akses', flex: 0.45 },
      {
        kind: 'non-bookable',
        id: 'b-l2-kaprodi-mpgsd',
        roomNumber: 1,
        label: 'Ruang Ketua Prodi Magister PGSD',
        note: 'Non-peminjaman',
        flex: 1.05,
      },
      {
        kind: 'non-bookable',
        id: 'b-l2-dosen-mpgsd',
        roomNumber: 2,
        label: 'Ruang Dosen Prodi Magister PGSD',
        note: 'Non-peminjaman',
        flex: 1.05,
      },
    ],
  },
  {
    kind: 'courtyard',
    buildingId: 'B',
    floorNumber: 3,
    centerLabel: 'AREA TENGAH',
    topLeftSlots: [
      { kind: 'room', roomCode: 'B.03.006', flex: 1 },
      { kind: 'room', roomCode: 'B.03.005', flex: 1 },
    ],
    topRightSlot: { kind: 'room', roomCode: 'B.03.002', flex: 1 },
    bottomSlots: [
      { kind: 'room', roomCode: 'B.03.007', flex: 1 },
      { kind: 'room', roomCode: 'B.03.009', flex: 1 },
      { kind: 'corridor', label: 'Akses', flex: 0.45 },
      { kind: 'room', roomCode: 'B.03.000', flex: 1.05 },
      { kind: 'room', roomCode: 'B.03.001', flex: 1.05 },
    ],
  },
  {
    kind: 'courtyard',
    buildingId: 'B',
    floorNumber: 4,
    centerLabel: 'AREA TENGAH',
    topLeftSlots: [
      { kind: 'room', roomCode: 'B.04.006', flex: 1 },
      { kind: 'room', roomCode: 'B.04.005', flex: 1 },
    ],
    topRightSlot: { kind: 'room', roomCode: 'B.04.002', flex: 1 },
    bottomSlots: [
      {
        kind: 'non-bookable',
        id: 'b-l4-perpustakaan',
        roomNumber: 6,
        label: 'Ruang Perpustakaan',
        code: 'B.04.007',
        note: 'Non-peminjaman',
        flex: 2.55,
      },
      { kind: 'room', roomCode: 'B.04.000', flex: 1 },
      { kind: 'room', roomCode: 'B.04.001', flex: 1 },
    ],
  },
  {
    kind: 'courtyard',
    buildingId: 'B',
    floorNumber: 5,
    centerLabel: 'AREA TENGAH',
    topLeftSlots: [
      { kind: 'room', roomCode: 'B.05.006', flex: 1 },
      { kind: 'room', roomCode: 'B.05.005', flex: 1 },
    ],
    topRightSlot: { kind: 'room', roomCode: 'B.05.002', flex: 1 },
    bottomSlots: [
      { kind: 'room', roomCode: 'B.05.007', flex: 1 },
      { kind: 'room', roomCode: 'B.05.008', flex: 1 },
      {
        kind: 'room',
        roomCode: 'B.05.009',
        flex: 1,
        hasFoldingWallLeft: true,
        hasFoldingWallRight: true,
      },
      { kind: 'room', roomCode: 'B.05.000', flex: 1 },
      { kind: 'room', roomCode: 'B.05.001', flex: 1 },
    ],
  },

  // Gedung E — Denah 3 Lantai (Single-Wing Layout)
  {
    kind: 'single-wing',
    buildingId: 'E',
    floorNumber: 1,
    hasToilet: true,
    hasStairs: true,
    leftWingRoomCodes: ['20.4E.01.004', '20.4E.01.003'],
    rightWingRoomCodes: ['20.4E.01.000', 'CBR 1.420.10.01.079'],
  },
  {
    kind: 'single-wing',
    buildingId: 'E',
    floorNumber: 2,
    hasToilet: true,
    hasStairs: true,
    leftWingRoomCodes: ['20.4E.02.006', '20.4E.02.005'],
    rightWingRoomCodes: ['20.4E.02.002', '20.4E.02.001'],
    utilityRoom: {
      id: 'e-l2-gudang',
      roomNumber: 5,
      label: 'Ruang Gudang',
      code: '20.4E.02.007',
      position: 'wing-left-bottom',
      note: 'Non-peminjaman',
    },
  },
  {
    kind: 'single-wing',
    buildingId: 'E',
    floorNumber: 3,
    hasToilet: false,
    hasStairs: true,
    leftWingRoomCodes: ['20.4E.03.003', '20.4E.03.002'],
    rightWingRoomCodes: ['20.4E.03.001', '20.4E.03.000'],
  },
] as const;

export function getFloorPlan(
  buildingId: BookableBuildingId,
  floorNumber: number,
): FloorPlanLayout | null {
  return (
    FLOOR_PLANS.find(
      (plan) =>
        plan.buildingId === buildingId && plan.floorNumber === floorNumber,
    ) ?? null
  );
}

export function getDefaultFloorForBuilding(
  building: BuildingConfig,
  buildingRooms: readonly BookableRoom[],
): number {
  const firstActiveFloor = building.floors.find((f) =>
    buildingRooms.some((r) => r.floor === f.floorNumber),
  );
  return firstActiveFloor?.floorNumber ?? building.floors[0]?.floorNumber ?? 1;
}

const ROOM_CODE_PATTERN = /^([ABE])(\d+)\./i;

function classifyRoom(label: string): {
  category: RoomCategory;
  capacity: number;
  facilities: readonly string[];
  displayName: string;
} {
  const upper = label.trim().toUpperCase();

  if (
    upper.includes('STUDIO FOTO') ||
    upper.includes('AUDIO') ||
    upper.includes('INOVASI TEKNOLOGI')
  ) {
    return {
      category: 'Studio & Media',
      capacity: 28,
      facilities: [
        'Perangkat Produksi Media',
        'Peredam Akustik',
        'AC',
        'Wi-Fi',
      ],
      displayName: label.trim(),
    };
  }

  if (upper.includes('LABKOM')) {
    return {
      category: 'Laboratorium',
      capacity: 36,
      facilities: ['PC Praktikum', 'Proyektor', 'AC', 'Jaringan LAN & Wi-Fi'],
      displayName: label.trim(),
    };
  }

  if (upper.includes('LAB')) {
    return {
      category: 'Laboratorium',
      capacity: 32,
      facilities: ['Meja Praktikum', 'Proyektor', 'AC', 'Wi-Fi Kampus'],
      displayName: label.trim(),
    };
  }

  if (upper.includes('AULA') || upper.includes('RAPAT')) {
    return {
      category: 'Aula & Rapat',
      capacity: 60,
      facilities: ['Sound System', 'Proyektor', 'AC', 'Wi-Fi Kampus'],
      displayName: label.trim(),
    };
  }

  return {
    category: 'Ruang Kelas',
    capacity: 40,
    facilities: ['Kursi Kuliah', 'Proyektor', 'Whiteboard', 'AC'],
    displayName: label.trim(),
  };
}

/**
 * Membangun daftar ruangan yang dapat dipinjam secara ketat hanya untuk
 * Gedung A, Gedung B, dan Gedung E.
 * Gedung yang sudah memiliki konfigurasi resmi pada CUSTOM_BUILDING_ROOMS
 * (Gedung B dan Gedung E) menggunakan daftar resmi tersebut dan tetap
 * menautkan jadwal ke `jadwalRooms` melalui `shortCode`.
 */
export function buildBookableRooms(
  jadwalRooms: readonly Ruangan[],
): BookableRoom[] {
  const parsed: BookableRoom[] = [];
  const jadwalByCode = new Map<string, number>();

  for (const r of jadwalRooms) {
    jadwalByCode.set(r.kode.trim().toUpperCase(), r.urutan);
  }

  for (const buildingId of ['A', 'B', 'E'] as const) {
    const customList = CUSTOM_BUILDING_ROOMS[buildingId];
    if (!customList) continue;

    for (const item of customList) {
      const matchedOrder = item.shortCode
        ? jadwalByCode.get(item.shortCode.trim().toUpperCase())
        : undefined;
      parsed.push({
        ...item,
        jadwalRoomId: matchedOrder ?? item.jadwalRoomId,
      });
    }
  }

  for (const room of jadwalRooms) {
    const match = ROOM_CODE_PATTERN.exec(room.kode.trim());
    if (!match) {
      continue;
    }

    const buildingId = match[1]?.toUpperCase() as
      BookableBuildingId | undefined;
    const floor = Number(match[2]);

    if (
      !buildingId ||
      (buildingId !== 'A' && buildingId !== 'B' && buildingId !== 'E') ||
      !Number.isFinite(floor) ||
      floor < 1
    ) {
      continue;
    }

    if (CUSTOM_BUILDING_ROOMS[buildingId]) {
      continue;
    }

    const meta = classifyRoom(room.label);
    const formattedName =
      meta.displayName === 'Ruang Kelas'
        ? `Ruang Kelas ${room.kode.trim()}`
        : meta.displayName;

    parsed.push({
      id: `room-${room.kode.trim().toLowerCase()}`,
      code: room.kode.trim(),
      name: formattedName,
      buildingId,
      floor,
      category: meta.category,
      capacity: meta.capacity,
      facilities: meta.facilities,
      jadwalRoomId: room.urutan,
    });
  }

  return parsed.sort((a, b) => {
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

const WEEKDAY_MAP: Record<number, DayName | null> = {
  0: null,
  1: 'SENIN',
  2: 'SELASA',
  3: 'RABU',
  4: 'KAMIS',
  5: 'JUMAT',
  6: 'SABTU',
};

export function getDayNameFromDate(isoDate: string): DayName | null {
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return null;
  }
  const [year, month, day] = parts;
  if (!year || !month || !day) {
    return null;
  }
  const dateObj = new Date(year, month - 1, day);
  return WEEKDAY_MAP[dateObj.getDay()] ?? null;
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = String(now.getFullYear());
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
