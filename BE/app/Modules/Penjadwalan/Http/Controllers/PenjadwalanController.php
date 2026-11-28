<?php

namespace App\Modules\Penjadwalan\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Dosen\Models\Dosen;
use App\Modules\MataKuliah\Models\JadwalSegmen;
use App\Modules\MataKuliah\Models\MataKuliah;
use App\Modules\Penjadwalan\Models\PengaturanWaktu;
use App\Modules\Penjadwalan\Services\PrdScheduleEngine;
use App\Modules\Penjadwalan\Services\TimeSlotCalculator;
use App\Modules\Ruangan\Models\Ruangan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PenjadwalanController extends Controller
{
    public function __construct(
        private readonly PrdScheduleEngine $engine
    ) {}

    public function showJadwal(): JsonResponse
    {
        return response()->json([
            'data' => $this->buildJadwalState(),
        ]);
    }

    public function generate(): JsonResponse
    {
        $audit = $this->engine->generate();

        return response()->json([
            'data' => [
                'audit' => $audit,
                'jadwal' => $this->buildJadwalState(),
            ],
        ]);
    }

    public function updateCourseSchedule(Request $request, int $id): JsonResponse
    {
        Ruangan::ensureSeeded();
        $course = MataKuliah::query()->with('segments')->find($id);

        if ($course === null) {
            return response()->json([
                'message' => 'Mata kuliah tidak ditemukan.',
                'code' => 'NOT_FOUND',
            ], 404);
        }

        $strictConflict = $request->boolean('strictConflict', true);
        $confirmSplit = $request->boolean('confirmSplit', false);

        // Move back to parking
        if ($request->boolean('parked') || $request->input('segments') === []) {
            DB::transaction(function () use ($course, $request): void {
                JadwalSegmen::query()->where('mata_kuliah_id', $course->id)->delete();
                $course->update([
                    'parked_reason' => (string) $request->input('parkedReason', 'Diparkir manual oleh Admin'),
                ]);
            });

            return response()->json([
                'data' => $this->buildJadwalState(),
            ]);
        }

        $rawSegments = $request->input('segments');
        if (! is_array($rawSegments) || $rawSegments === []) {
            $day = mb_strtoupper(trim((string) $request->input('day', 'SENIN')));
            $room = (int) $request->input('room', 1);
            $pos = (int) $request->input('pos', 1);
            $len = (int) ($request->input('len') ?? max(1, (int) $course->sks));
            $rawSegments = [
                ['day' => $day, 'room' => $room, 'pos' => $pos, 'len' => $len],
            ];
        }

        $validation = $this->engine->validateCoursePlacement($course, $rawSegments, $strictConflict);

        if (! $validation['valid']) {
            if (! empty($validation['requiresSplitConfirm']) && $confirmSplit && ! empty($validation['splitProposal'])) {
                $rawSegments = $validation['splitProposal'];
            } else {
                return response()->json([
                    'message' => $validation['reason'] ?? 'Jadwal tidak valid.',
                    'code' => ! empty($validation['requiresSplitConfirm']) ? 'BREAK_SPLIT_CONFIRMATION_REQUIRED' : 'SCHEDULE_CONFLICT',
                    'requires_split_confirm' => (bool) ($validation['requiresSplitConfirm'] ?? false),
                    'split_proposal' => $validation['splitProposal'] ?? null,
                ], 422);
            }
        }

        DB::transaction(function () use ($course, $rawSegments): void {
            JadwalSegmen::query()->where('mata_kuliah_id', $course->id)->delete();
            $course->update(['parked_reason' => null]);

            foreach (array_values($rawSegments) as $idx => $seg) {
                JadwalSegmen::query()->create([
                    'mata_kuliah_id' => $course->id,
                    'segmen_ke' => $idx + 1,
                    'hari' => mb_strtoupper(trim((string) $seg['day'])),
                    'ruangan_id' => (int) $seg['room'],
                    'pos_awal' => (int) $seg['pos'],
                    'panjang' => (int) $seg['len'],
                ]);
            }
        });

        return response()->json([
            'data' => $this->buildJadwalState(),
        ]);
    }

    public function swap(Request $request): JsonResponse
    {
        Ruangan::ensureSeeded();
        $idA = (int) $request->input('courseIdA', $request->input('course_id_a', 0));
        $idB = (int) $request->input('courseIdB', $request->input('course_id_b', 0));
        $strictConflict = $request->boolean('strictConflict', true);

        if ($idA <= 0 || $idB <= 0 || $idA === $idB) {
            return response()->json([
                'message' => 'Pilih dua mata kuliah berbeda untuk ditukar (swap).',
                'code' => 'VALIDATION_ERROR',
            ], 422);
        }

        $courseA = MataKuliah::query()->with('segments')->find($idA);
        $courseB = MataKuliah::query()->with('segments')->find($idB);

        if ($courseA === null || $courseB === null) {
            return response()->json([
                'message' => 'Mata kuliah yang akan ditukar tidak ditemukan.',
                'code' => 'NOT_FOUND',
            ], 404);
        }

        // FR-S5: Swap dengan MK terpecah tidak diizinkan
        if ($courseA->segments->count() > 1 || $courseB->segments->count() > 1) {
            return response()->json([
                'message' => 'Swap dengan mata kuliah terpecah (di jam istirahat) tidak diizinkan.',
                'code' => 'SPLIT_COURSE_SWAP_FORBIDDEN',
            ], 422);
        }

        if ($courseA->segments->isEmpty() || $courseB->segments->isEmpty()) {
            return response()->json([
                'message' => 'Kedua mata kuliah harus sudah berada di matriks ruangan untuk ditukar.',
                'code' => 'VALIDATION_ERROR',
            ], 422);
        }

        $segA = $courseA->segments->first();
        $segB = $courseB->segments->first();

        $targetForA = [[
            'day' => $segB->hari,
            'room' => (int) $segB->ruangan_id,
            'pos' => (int) $segB->pos_awal,
            'len' => max(1, (int) $courseA->sks),
        ]];

        $targetForB = [[
            'day' => $segA->hari,
            'room' => (int) $segA->ruangan_id,
            'pos' => (int) $segA->pos_awal,
            'len' => max(1, (int) $courseB->sks),
        ]];

        $checkA = $this->engine->validateCoursePlacement($courseA, $targetForA, $strictConflict, $courseB->id);
        if (! $checkA['valid']) {
            return response()->json([
                'message' => 'Swap ditolak untuk MK '.$courseA->kode.': '.($checkA['reason'] ?? 'Konflik jadwal.'),
                'code' => 'SWAP_CONFLICT',
            ], 422);
        }

        $checkB = $this->engine->validateCoursePlacement($courseB, $targetForB, $strictConflict, $courseA->id);
        if (! $checkB['valid']) {
            return response()->json([
                'message' => 'Swap ditolak untuk MK '.$courseB->kode.': '.($checkB['reason'] ?? 'Konflik jadwal.'),
                'code' => 'SWAP_CONFLICT',
            ], 422);
        }

        DB::transaction(function () use ($courseA, $courseB, $targetForA, $targetForB): void {
            JadwalSegmen::query()->whereIn('mata_kuliah_id', [$courseA->id, $courseB->id])->delete();

            JadwalSegmen::query()->create([
                'mata_kuliah_id' => $courseA->id,
                'segmen_ke' => 1,
                'hari' => $targetForA[0]['day'],
                'ruangan_id' => $targetForA[0]['room'],
                'pos_awal' => $targetForA[0]['pos'],
                'panjang' => $targetForA[0]['len'],
            ]);

            JadwalSegmen::query()->create([
                'mata_kuliah_id' => $courseB->id,
                'segmen_ke' => 1,
                'hari' => $targetForB[0]['day'],
                'ruangan_id' => $targetForB[0]['room'],
                'pos_awal' => $targetForB[0]['pos'],
                'panjang' => $targetForB[0]['len'],
            ]);
        });

        return response()->json([
            'data' => $this->buildJadwalState(),
        ]);
    }

    public function showPengaturanWaktu(): JsonResponse
    {
        $s = PengaturanWaktu::current();

        return response()->json([
            'data' => $this->formatPengaturanWaktu($s),
        ]);
    }

    public function updatePengaturanWaktu(Request $request): JsonResponse
    {
        $s = PengaturanWaktu::current();

        $durasiSks = (int) $request->input('durasiSks', $s->durasi_sks);
        if ($durasiSks < 15 || $durasiSks > 120) {
            return response()->json([
                'message' => 'Durasi per SKS harus berada di antara 15 sampai 120 menit.',
                'code' => 'VALIDATION_ERROR',
            ], 422);
        }

        $istirahat = (int) $request->input('istirahat', $s->istirahat);
        if ($istirahat < 15 || $istirahat > 180) {
            return response()->json([
                'message' => 'Durasi istirahat harus berada di antara 15 sampai 180 menit.',
                'code' => 'VALIDATION_ERROR',
            ], 422);
        }

        $s->update([
            'durasi_sks' => $durasiSks,
            'mulai_pagi' => trim((string) $request->input('mulaiPagi', $s->mulai_pagi)),
            'istirahat' => $istirahat,
            'mulai_pagi_jumat' => trim((string) $request->input('mulaiPagiJumat', $s->mulai_pagi_jumat)),
            'mulai_siang_jumat' => trim((string) $request->input('mulaiSiangJumat', $s->mulai_siang_jumat)),
        ]);

        return response()->json([
            'data' => [
                'pengaturanWaktu' => $this->formatPengaturanWaktu($s->fresh()),
                'jadwal' => $this->buildJadwalState(),
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatPengaturanWaktu(PengaturanWaktu $s): array
    {
        $slotsByDay = [];
        foreach (TimeSlotCalculator::DAYS as $day) {
            $slotsByDay[$day] = TimeSlotCalculator::buildDaySlots($day, $s);
        }

        return [
            'durasiSks' => (int) $s->durasi_sks,
            'mulaiPagi' => $s->mulai_pagi,
            'istirahat' => (int) $s->istirahat,
            'mulaiPagiJumat' => $s->mulai_pagi_jumat,
            'mulaiSiangJumat' => $s->mulai_siang_jumat,
            'slotsByDay' => $slotsByDay,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildJadwalState(): array
    {
        Ruangan::ensureSeeded();
        $settings = PengaturanWaktu::current();
        $rooms = Ruangan::query()->orderBy('urutan')->get();
        $roomsById = $rooms->keyBy('id');
        $lecturers = Dosen::query()->with('ketersediaan')->get()->keyBy('kode');

        $courses = MataKuliah::query()
            ->with('segments')
            ->where('status_antrean', 'ready')
            ->orderBy('prodi')
            ->orderBy('semester')
            ->orderBy('kode')
            ->orderBy('kelas')
            ->get();

        $formattedCourses = $courses->map(
            fn (MataKuliah $mk): array => TimeSlotCalculator::formatCourse($mk, $lecturers, $roomsById, $settings)
        )->values();

        $scheduledCourses = $formattedCourses->filter(fn (array $c): bool => count($c['segments']) > 0)->values();
        $parkedCourses = $formattedCourses->filter(fn (array $c): bool => count($c['segments']) === 0)->values();

        $matrixCells = [];
        foreach ($scheduledCourses as $course) {
            foreach ($course['segments'] as $seg) {
                $key = "{$seg['day']}|{$seg['room']}|{$seg['pos']}";
                $matrixCells[$key] = [
                    'courseId' => $course['id'],
                    'segmenKe' => $seg['segmenKe'],
                    'badgeLabel' => $seg['badgeLabel'],
                    'isSplit' => $course['isSplit'],
                    'prodi' => $course['prodi'],
                    'kode' => $course['kode'],
                    'nama' => $course['nama'],
                    'sks' => $course['sks'],
                    'sksDisplay' => $course['sksDisplay'],
                    'semester' => $course['semester'],
                    'kelas' => $course['kelas'],
                    'kodeDosen1' => $course['kodeDosen1'],
                    'kodeDosen2' => $course['kodeDosen2'],
                    'dosen1' => $course['dosen1'],
                    'dosen2' => $course['dosen2'],
                    'day' => $seg['day'],
                    'room' => $seg['room'],
                    'roomKode' => $seg['roomKode'],
                    'pos' => $seg['pos'],
                    'len' => $seg['len'],
                    'timeDisplay' => $seg['timeDisplay'],
                ];
            }
        }

        return [
            'rooms' => $rooms->all(),
            'pengaturanWaktu' => $this->formatPengaturanWaktu($settings),
            'courses' => $formattedCourses->all(),
            'scheduled_courses' => $scheduledCourses->all(),
            'parked_courses' => $parkedCourses->all(),
            'matrix_cells' => $matrixCells,
            'last_audit' => $settings->last_audit,
        ];
    }
}
