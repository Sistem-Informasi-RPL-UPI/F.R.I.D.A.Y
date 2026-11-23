<?php

/*
|--------------------------------------------------------------------------
| Direktori Kampus (Peminjaman Ruangan)
|--------------------------------------------------------------------------
|
| Sumber data tunggal untuk gedung dan ruangan per lantai.
| Gedung yang sudah memiliki data asli didefinisikan di `floors` dengan
| kunci "{idGedung}-{lantai}". Sisanya memakai `room_templates` sementara.
|
*/

return [

    'buildings' => [
        ['id' => 'biru', 'name' => 'Gedung Biru', 'letter' => 'A', 'floors' => 5, 'accent' => 'blue', 'description' => 'Laboratorium Multimedia & Perkuliahan Utama'],
        ['id' => 'baru', 'name' => 'Gedung Baru', 'letter' => 'B', 'floors' => 5, 'accent' => 'yellow', 'description' => 'Lab RPL, Lab TEKKOM, Smartclass, Microteaching & Perkuliahan'],
        ['id' => 'abu', 'name' => 'Gedung Abu', 'letter' => 'F', 'floors' => 3, 'accent' => 'gray', 'description' => 'Lab RPL, Lab TEKKOM, Lab Robotika, Aula & Perkuliahan'],
    ],

    /*
     * Data asli ruangan per gedung & lantai.
     */
    'floors' => [
        'abu-1' => [
            'layout' => 'abu-standard',
            'core_label' => 'Toilet & Tangga',
            'rooms' => [
                [
                    'code' => '20.4E.01.004',
                    'name' => 'Ruang Lab Robotika',
                    'capacity' => 30,
                    'facilities' => ['Meja Praktikum', 'Perangkat Robotika', 'AC', 'Wi-Fi'],
                    'mapArea' => 'abu-4',
                    'bookable' => true,
                ],
                [
                    'code' => '20.4E.01.003',
                    'name' => 'Ruang Lab TEKKOM',
                    'capacity' => 32,
                    'facilities' => ['Komputer', 'Proyektor', 'AC', 'Wi-Fi'],
                    'mapArea' => 'abu-3',
                    'bookable' => true,
                ],
                [
                    'code' => '20.4E.01.000',
                    'name' => 'Ruang Aula Pertemuan',
                    'capacity' => 80,
                    'facilities' => ['Proyektor', 'Sound System', 'AC', 'Wi-Fi'],
                    'mapArea' => 'abu-2',
                    'bookable' => true,
                ],
                [
                    'code' => 'CBR 1.420.10.01.079',
                    'name' => 'Ruang Perkuliahan 1-1.4',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'abu-1',
                    'bookable' => true,
                ],
            ],
        ],
        'abu-2' => [
            'layout' => 'abu-floor-2',
            'core_label' => 'Toilet & Tangga',
            'rooms' => [
                [
                    'code' => '20.4E.02.006',
                    'name' => 'Ruang Lab Komputer RPL',
                    'capacity' => 36,
                    'facilities' => ['PC Lab RPL', 'Proyektor', 'AC', 'Wi-Fi'],
                    'mapArea' => 'abu-4',
                    'bookable' => true,
                ],
                [
                    'code' => '20.4E.02.005',
                    'name' => 'Ruang Lab IMAC RPL',
                    'capacity' => 30,
                    'facilities' => ['Apple iMac', 'Proyektor', 'AC', 'Wi-Fi'],
                    'mapArea' => 'abu-3',
                    'bookable' => true,
                ],
                [
                    'code' => '20.4E.02.002',
                    'name' => 'Ruang Teknologi Informasi & Komunikasi',
                    'capacity' => 35,
                    'facilities' => ['Komputer', 'Proyektor', 'AC', 'Wi-Fi'],
                    'mapArea' => 'abu-2',
                    'bookable' => true,
                ],
                [
                    'code' => '20.4E.02.001',
                    'name' => 'Ruang Lab PGSD',
                    'capacity' => 35,
                    'facilities' => ['Proyektor', 'Media Pembelajaran', 'AC', 'Wi-Fi'],
                    'mapArea' => 'abu-1',
                    'bookable' => true,
                ],
                [
                    'code' => '20.4E.02.007',
                    'name' => 'Ruang Gudang',
                    'capacity' => 0,
                    'facilities' => ['Penyimpanan Inventaris'],
                    'mapArea' => 'abu-5',
                    'bookable' => false,
                ],
            ],
        ],
        'abu-3' => [
            'layout' => 'abu-standard',
            'core_label' => 'Tangga',
            'rooms' => [
                [
                    'code' => '20.4E.03.003',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'abu-4',
                    'bookable' => true,
                ],
                [
                    'code' => '20.4E.03.002',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'abu-3',
                    'bookable' => true,
                ],
                [
                    'code' => '20.4E.03.001',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'abu-2',
                    'bookable' => true,
                ],
                [
                    'code' => '20.4E.03.000',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'abu-1',
                    'bookable' => true,
                ],
            ],
        ],

        /*
         * Gedung Baru (Gedung B — 5 Lantai)
         */
        'baru-1' => [
            'layout' => 'baru-standard',
            'core_label' => 'Tangga, Lift & Toilet',
            'bottom_center' => 'Pintu Masuk',
            'rooms' => [
                [
                    'code' => 'B.01.RPL-D',
                    'name' => 'Ruang Dosen Prodi RPL',
                    'capacity' => 0,
                    'facilities' => ['Ruang Kerja Dosen'],
                    'mapArea' => 'baru-t1',
                    'bookable' => false,
                ],
                [
                    'code' => 'B.01.RPL-K',
                    'name' => 'Ruang Ketua Prodi RPL',
                    'capacity' => 0,
                    'facilities' => ['Ruang Pimpinan Prodi'],
                    'mapArea' => 'baru-t2',
                    'bookable' => false,
                ],
                [
                    'code' => 'B.01.DOSEN',
                    'name' => 'Ruang Dosen',
                    'capacity' => 0,
                    'facilities' => ['Ruang Kerja Dosen'],
                    'mapArea' => 'baru-t3',
                    'bookable' => false,
                ],
                [
                    'code' => 'B.01.PMM-D',
                    'name' => 'Ruang Dosen Prodi Pendidikan Multimedia',
                    'capacity' => 0,
                    'facilities' => ['Ruang Kerja Dosen'],
                    'mapArea' => 'baru-b1',
                    'bookable' => false,
                ],
                [
                    'code' => 'B.01.PMM-K',
                    'name' => 'Ruang Ketua Prodi Pendidikan Multimedia',
                    'capacity' => 0,
                    'facilities' => ['Ruang Pimpinan Prodi'],
                    'mapArea' => 'baru-b2',
                    'bookable' => false,
                ],
                [
                    'code' => 'B.01.TEKKOM-K',
                    'name' => 'Ruang Ketua Prodi Teknik Komputer',
                    'capacity' => 0,
                    'facilities' => ['Ruang Pimpinan Prodi'],
                    'mapArea' => 'baru-b4',
                    'bookable' => false,
                ],
                [
                    'code' => 'B.01.TEKKOM-D',
                    'name' => 'Ruang Dosen Prodi Teknik Komputer',
                    'capacity' => 0,
                    'facilities' => ['Ruang Kerja Dosen'],
                    'mapArea' => 'baru-b5',
                    'bookable' => false,
                ],
            ],
        ],
        'baru-2' => [
            'layout' => 'baru-standard',
            'core_label' => 'Tangga, Lift & Toilet',
            'bottom_center' => 'Akses Koridor',
            'rooms' => [
                [
                    'code' => 'B.02.006',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-t1',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.02.005',
                    'name' => 'Ruang Laboratorium (Lab RPL)',
                    'capacity' => 36,
                    'facilities' => ['PC Lab RPL', 'Proyektor', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-t2',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.02.002',
                    'name' => 'Ruang Perkuliahan (Labkom Bahasa)',
                    'capacity' => 40,
                    'facilities' => ['Komputer Bahasa', 'Audio', 'Proyektor', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-t3',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.02.007',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-b1',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.02.009',
                    'name' => 'Ruang Microteaching',
                    'capacity' => 30,
                    'facilities' => ['Kamera Microteaching', 'Proyektor', 'Audio', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-b2',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.02.MPGSD-K',
                    'name' => 'Ruang Ketua Prodi Magister PGSD',
                    'capacity' => 0,
                    'facilities' => ['Ruang Pimpinan Prodi'],
                    'mapArea' => 'baru-b4',
                    'bookable' => false,
                ],
                [
                    'code' => 'B.02.MPGSD-D',
                    'name' => 'Ruang Dosen Prodi Magister PGSD',
                    'capacity' => 0,
                    'facilities' => ['Ruang Kerja Dosen'],
                    'mapArea' => 'baru-b5',
                    'bookable' => false,
                ],
            ],
        ],
        'baru-3' => [
            'layout' => 'baru-standard',
            'core_label' => 'Tangga, Lift & Toilet',
            'bottom_center' => 'Akses Koridor',
            'rooms' => [
                [
                    'code' => 'B.03.006',
                    'name' => 'Ruang Perkuliahan (Labkom Pendidikan)',
                    'capacity' => 36,
                    'facilities' => ['PC Lab Pendidikan', 'Proyektor', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-t1',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.03.005',
                    'name' => 'Ruang Media Digital (Audio Visual)',
                    'capacity' => 32,
                    'facilities' => ['Perangkat Audio Visual', 'Proyektor', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-t2',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.03.002',
                    'name' => 'Ruang Perkuliahan (Smartclass)',
                    'capacity' => 40,
                    'facilities' => ['Smartboard', 'Video Conference', 'Audio', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-t3',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.03.007',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-b1',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.03.009',
                    'name' => 'Laboratorium Microteaching',
                    'capacity' => 30,
                    'facilities' => ['Perangkat Microteaching', 'Proyektor', 'Audio', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-b2',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.03.000',
                    'name' => 'Ruang Laboratorium (Lab TEKKOM)',
                    'capacity' => 32,
                    'facilities' => ['Komputer & Jaringan', 'Proyektor', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-b4',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.03.001',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-b5',
                    'bookable' => true,
                ],
            ],
        ],
        'baru-4' => [
            'layout' => 'baru-floor-4',
            'core_label' => 'Tangga, Lift & Toilet',
            'rooms' => [
                [
                    'code' => 'B.04.006',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-t1',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.04.005',
                    'name' => 'Laboratorium Audio Visual',
                    'capacity' => 32,
                    'facilities' => ['Perangkat Audio Visual', 'Proyektor', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-t2',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.04.002',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-t3',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.04.007',
                    'name' => 'Ruang Perpustakaan',
                    'capacity' => 60,
                    'facilities' => ['Koleksi Buku', 'Area Baca', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-b-wide',
                    'bookable' => false,
                ],
                [
                    'code' => 'B.04.000',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-b4',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.04.001',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-b5',
                    'bookable' => true,
                ],
            ],
        ],
        'baru-5' => [
            'layout' => 'baru-floor-5',
            'core_label' => 'Tangga, Lift & Toilet',
            'rooms' => [
                [
                    'code' => 'B.05.006',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-t1',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.05.005',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-t2',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.05.002',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-t3',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.05.007',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-b1',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.05.008',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-b2',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.05.009',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-b3',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.05.000',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-b4',
                    'bookable' => true,
                ],
                [
                    'code' => 'B.05.001',
                    'name' => 'Ruang Perkuliahan',
                    'capacity' => 40,
                    'facilities' => ['Proyektor', 'Papan Tulis', 'AC', 'Wi-Fi'],
                    'mapArea' => 'baru-b5',
                    'bookable' => true,
                ],
            ],
        ],
    ],

    /*
     * Template ruangan per lantai (placeholder untuk gedung yang belum punya data asli).
     */
    'room_templates' => [
        ['name' => 'Ruang Perkuliahan', 'capacity' => 40, 'facilities' => ['Proyektor', 'AC', 'Wi-Fi']],
        ['name' => 'Laboratorium Komputer', 'capacity' => 30, 'facilities' => ['Proyektor', 'AC', 'Wi-Fi']],
        ['name' => 'Ruang Seminar', 'capacity' => 80, 'facilities' => ['Proyektor', 'Audio', 'AC', 'Wi-Fi']],
        ['name' => 'Laboratorium RPL', 'capacity' => 32, 'facilities' => ['Proyektor', 'AC', 'Wi-Fi']],
        ['name' => 'Ruang Kolaborasi', 'capacity' => 24, 'facilities' => ['Proyektor', 'AC', 'Wi-Fi']],
        ['name' => 'Studio Pembelajaran', 'capacity' => 36, 'facilities' => ['Proyektor', 'AC', 'Wi-Fi']],
    ],

    /*
     * Metadata peta denah kampus (disimpan untuk kompatibilitas API).
     */
    'map' => [
        'view_box' => [1000, 590],
        'road' => ['y' => 508, 'height' => 38, 'label' => 'JALAN UTAMA KAMPUS UPI DI CIBIRU'],
        'entrance' => ['x' => 770, 'label' => 'Pintu Masuk Kampus'],
        'shapes' => [
            ['type' => 'building', 'id' => 'abu', 'label' => 'Gedung Abu', 'points' => [[555, 190], [735, 160], [752, 235], [572, 267]]],
            ['type' => 'building', 'id' => 'baru', 'label' => 'Gedung Baru', 'points' => [[440, 300], [575, 282], [597, 470], [462, 488]]],
            ['type' => 'building', 'id' => 'biru', 'label' => 'Gedung Biru', 'points' => [[705, 305], [800, 295], [818, 470], [723, 482]]],
        ],
    ],

];
