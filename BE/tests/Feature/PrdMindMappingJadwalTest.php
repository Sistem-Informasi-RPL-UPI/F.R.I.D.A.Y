<?php

use App\Modules\Dosen\Models\Dosen;
use Illuminate\Foundation\Testing\DatabaseTransactions;

uses(DatabaseTransactions::class);

it('returns 37 reference rooms matching PRD Lampiran A', function (): void {
    $response = $this->getJson('/api/v1/ruangan')->assertOk();

    $rooms = $response->json('data');
    expect($rooms)->toHaveCount(37);
    expect($rooms[0]['kode'])->toBe('B2.002');
    expect($rooms[0]['gedung'])->toBe('Gedung B');
    expect($rooms[18]['kode'])->toBe('E3.000');
    expect($rooms[18]['gedung'])->toBe('Gedung E');
    expect($rooms[22]['kode'])->toBe('F1.001');
    expect($rooms[22]['label'])->toBe('SMART CLASS');
    expect($rooms[36]['kode'])->toBe('A3.010');
});

it('manages dosen CRUD, duplicate code rejection, duplicate name warning, and delete confirmation', function (): void {
    // Create lecturer
    $this->postJson('/api/v1/dosen', [
        'kode' => ' dsn101 ',
        'nama' => 'Dr. Siti Aminah',
        'status' => 'Dosen Tetap',
    ])
        ->assertCreated()
        ->assertJsonPath('data.kode', 'DSN101')
        ->assertJsonPath('warning', null);

    // Reject duplicate code
    $this->postJson('/api/v1/dosen', [
        'kode' => 'dsn101',
        'nama' => 'Dosen Lain',
        'status' => 'Dosen Luar',
    ])
        ->assertStatus(422)
        ->assertJsonPath('code', 'DUPLICATE_LECTURER_CODE');

    // Warn on duplicate name with different code
    $this->postJson('/api/v1/dosen', [
        'kode' => 'DSN102',
        'nama' => 'Dr. Siti Aminah',
        'status' => 'Dosen Luar',
    ])
        ->assertCreated()
        ->assertJsonPath('data.kode', 'DSN102')
        ->assertJson(fn ($json) => $json->whereType('warning', 'string')->etc());

    // Add a course taught by DSN101
    $this->postJson('/api/v1/mata-kuliah', [
        'prodi' => 'RPL',
        'kode' => 'RL501',
        'nama' => 'Arsitektur Perangkat Lunak',
        'sks' => 3,
        'semester' => '5.0',
        'kelas' => '5A',
        'kodeDosen1' => 'DSN101',
        'kebutuhanRuang' => 'Ruang Kelas Biasa',
    ])->assertCreated();

    // Deleting DSN101 without force returns 409 confirmation requirement
    $this->deleteJson('/api/v1/dosen/DSN101')
        ->assertStatus(409)
        ->assertJsonPath('code', 'LECTURER_HAS_COURSES')
        ->assertJsonPath('affected_courses_count', 1);

    // Deleting DSN101 with force=1 succeeds and clears lecturer on the affected course
    $this->deleteJson('/api/v1/dosen/DSN101?force=1')
        ->assertOk()
        ->assertJsonPath('data.affected_courses_count', 1);
});

it('imports courses with combined classes, zero SKS fallback, and holds unregistered lecturers until mapped', function (): void {
    Dosen::query()->create([
        'kode' => 'DSN201',
        'nama' => 'Prof. Hendra Kusuma',
        'status' => 'Dosen Tetap',
    ]);

    $importRes = $this->postJson('/api/v1/mata-kuliah/impor', [
        'sourceFile' => 'Template_Kaprodi.xlsx',
        'rows' => [
            [
                'prodi' => 'PGSD',
                'kode' => 'GD101',
                'nama' => 'Konsep Dasar SD',
                'sks' => 3,
                'semester' => '3.0',
                'kelas' => '3A & B',
                'dosen1' => 'Prof. Hendra Kusuma',
                'dosen2' => '-',
                'kebutuhanRuang' => 'Ruang Kelas Biasa',
            ],
            [
                'prodi' => 'RPL',
                'kode' => 'RL999',
                'nama' => 'Kapita Selekta',
                'sks' => '[Data Belum Tersedia]',
                'semester' => '7.0',
                'kelas' => '7A',
                'dosen1' => 'DSN201',
                'dosen2' => '',
                'kebutuhanRuang' => 'Ruang Kelas Biasa',
            ],
            [
                'prodi' => 'PMM',
                'kode' => 'MM202',
                'nama' => 'Animasi Interaktif',
                'sks' => 3,
                'semester' => '3',
                'kelas' => '3A',
                'dosen1' => 'Dosen Belum Ada',
                'dosen2' => '',
                'kebutuhanRuang' => 'Laboratorium Praktikum',
            ],
        ],
    ])->assertOk();

    // 3A & B splits into 2 accepted courses + RL999 (1 accepted with 0 SKS) = 3 accepted, 1 pending lecturer
    expect($importRes->json('data.accepted_count'))->toBe(3);
    expect($importRes->json('data.pending_lecturer_count'))->toBe(1);

    $list = $this->getJson('/api/v1/mata-kuliah')->assertOk()->json('data');
    $rl999 = collect($list)->firstWhere('kode', 'RL999');
    expect($rl999['sks'])->toBe(0);
    expect($rl999['semester'])->toBe('7');
    expect($rl999['status'])->toBe('Diparkir');

    $mm202 = collect($list)->firstWhere('kode', 'MM202');
    expect($mm202['statusAntrean'])->toBe('pending_dosen');

    // Map pending lecturer to DSN201 so it enters the ready queue
    $this->putJson("/api/v1/mata-kuliah/{$mm202['id']}", [
        'kodeDosen1' => 'DSN201',
    ])
        ->assertOk()
        ->assertJsonPath('data.statusAntrean', 'ready');
});

it('generates conflict-free schedule, enforces hard constraints, splits across break on confirmation, and recalculates time settings', function (): void {
    Dosen::query()->create(['kode' => 'DSN301', 'nama' => 'Dr. Raka', 'status' => 'Dosen Tetap']);
    Dosen::query()->create(['kode' => 'DSN302', 'nama' => 'Dr. Maya', 'status' => 'Dosen Luar']);

    // Custom availability for DSN302: only SELASA 07:00-12:00
    $this->putJson('/api/v1/dosen/DSN302/ketersediaan', [
        'hari' => ['SELASA'],
        'startTime' => '07:00',
        'endTime' => '12:00',
    ])->assertOk();

    $mk1Id = $this->postJson('/api/v1/mata-kuliah', [
        'prodi' => 'RPL',
        'kode' => 'RL101',
        'nama' => 'Algoritma Pemrograman',
        'sks' => 5,
        'semester' => '1',
        'kelas' => '1A',
        'kodeDosen1' => 'DSN301',
        'kebutuhanRuang' => 'Ruang Kelas Biasa',
    ])->assertCreated()->json('data.0.id');

    $mk2Id = $this->postJson('/api/v1/mata-kuliah', [
        'prodi' => 'RPL',
        'kode' => 'RL102',
        'nama' => 'Basis Data',
        'sks' => 3,
        'semester' => '1',
        'kelas' => '1A',
        'kodeDosen1' => 'DSN302',
        'kebutuhanRuang' => 'Laboratorium Praktikum',
    ])->assertCreated()->json('data.0.id');

    // Generate schedule
    $gen = $this->postJson('/api/v1/jadwal/generate')
        ->assertOk()
        ->assertJsonPath('data.audit.conflicts_count', 0)
        ->assertJsonPath('data.audit.scheduled_count', 2);

    // Criterion 2: Dropping 5 SKS course at Pos 4 requires break split confirmation (3 SKS Pos 4-6 + 2 SKS Pos 7-8)
    $this->putJson("/api/v1/mata-kuliah/{$mk1Id}/jadwal", [
        'segments' => [
            ['day' => 'SENIN', 'room' => 1, 'pos' => 4, 'len' => 5],
        ],
    ])
        ->assertStatus(422)
        ->assertJsonPath('code', 'BREAK_SPLIT_CONFIRMATION_REQUIRED')
        ->assertJsonPath('requires_split_confirm', true);

    // Confirm break split
    $splitRes = $this->putJson("/api/v1/mata-kuliah/{$mk1Id}/jadwal", [
        'segments' => [
            ['day' => 'SENIN', 'room' => 1, 'pos' => 4, 'len' => 5],
        ],
        'confirmSplit' => true,
    ])->assertOk();

    $coursesAfterSplit = collect($splitRes->json('data.courses'));
    $mk1After = $coursesAfterSplit->firstWhere('id', $mk1Id);
    expect($mk1After['sks'])->toBe(5);
    expect($mk1After['sksDisplay'])->toBe('5 (3+2)');
    expect($mk1After['segments'])->toHaveCount(2);
    expect($mk1After['segments'][0]['pos'])->toBe(4);
    expect($mk1After['segments'][0]['len'])->toBe(3);
    expect($mk1After['segments'][1]['pos'])->toBe(7);
    expect($mk1After['segments'][1]['len'])->toBe(2);

    // FR-S5: Swap with a split course is forbidden
    $this->postJson('/api/v1/jadwal/swap', [
        'courseIdA' => $mk1Id,
        'courseIdB' => $mk2Id,
    ])
        ->assertStatus(422)
        ->assertJsonPath('code', 'SPLIT_COURSE_SWAP_FORBIDDEN');

    // Hard constraint check: DSN302 cannot be placed on SENIN (only allows SELASA)
    $this->putJson("/api/v1/mata-kuliah/{$mk2Id}/jadwal", [
        'segments' => [
            ['day' => 'SENIN', 'room' => 5, 'pos' => 1, 'len' => 3],
        ],
    ])
        ->assertStatus(422)
        ->assertJsonPath('code', 'SCHEDULE_CONFLICT');

    // Criterion 7: Changing SKS duration in Setting Waktu recalculates all slot labels & timeDisplay
    $timeUpdate = $this->putJson('/api/v1/pengaturan-waktu', [
        'durasiSks' => 40,
        'mulaiPagi' => '07:00',
        'istirahat' => 60,
        'mulaiPagiJumat' => '07:00',
        'mulaiSiangJumat' => '13:00',
    ])->assertOk();

    expect($timeUpdate->json('data.pengaturanWaktu.durasiSks'))->toBe(40);
    expect($timeUpdate->json('data.pengaturanWaktu.slotsByDay.SENIN.0.label'))->toBe('07:00 - 07:40');
});
