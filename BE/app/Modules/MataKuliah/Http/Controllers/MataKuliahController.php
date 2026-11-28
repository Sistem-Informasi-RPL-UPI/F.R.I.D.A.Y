<?php

namespace App\Modules\MataKuliah\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Dosen\Models\Dosen;
use App\Modules\MataKuliah\Models\MataKuliah;
use App\Modules\MataKuliah\Services\CourseNormalizer;
use App\Modules\Penjadwalan\Models\PengaturanWaktu;
use App\Modules\Penjadwalan\Services\TimeSlotCalculator;
use App\Modules\Ruangan\Models\Ruangan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MataKuliahController extends Controller
{
    public function index(): JsonResponse
    {
        Ruangan::ensureSeeded();
        $settings = PengaturanWaktu::current();
        $lecturers = Dosen::query()->with('ketersediaan')->get()->keyBy('kode');
        $rooms = Ruangan::query()->get()->keyBy('id');

        $courses = MataKuliah::query()
            ->with('segments')
            ->orderBy('prodi')
            ->orderBy('semester')
            ->orderBy('kode')
            ->orderBy('kelas')
            ->get();

        $formatted = $courses->map(function (MataKuliah $mk) use ($lecturers, $rooms, $settings): array {
            return TimeSlotCalculator::formatCourse($mk, $lecturers, $rooms, $settings);
        })->values();

        $ready = $formatted->where('statusAntrean', 'ready');
        $pending = $formatted->where('statusAntrean', 'pending_dosen');

        $activeCodes = [];
        foreach ($ready as $item) {
            if (! empty($item['kodeDosen1'])) {
                $activeCodes[$item['kodeDosen1']] = true;
            }
            if (! empty($item['kodeDosen2'])) {
                $activeCodes[$item['kodeDosen2']] = true;
            }
        }

        $customScheduleCount = 0;
        foreach (array_keys($activeCodes) as $code) {
            $lec = $lecturers->get($code);
            if ($lec?->ketersediaan?->is_custom) {
                $customScheduleCount++;
            }
        }

        return response()->json([
            'data' => $formatted,
            'stats' => [
                'totalMk' => $ready->count(),
                'totalSks' => (int) $ready->sum('sks'),
                'dosenPengampuCount' => count($activeCodes),
                'dosenJadwalKhususCount' => $customScheduleCount,
                'teamTeachingCount' => $ready->filter(fn (array $c): bool => ! empty($c['kodeDosen2']))->count(),
                'pendingDosenCount' => $pending->count(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $prodi = CourseNormalizer::normalizeProdi((string) $request->input('prodi', ''));
        $kode = mb_strtoupper(trim((string) $request->input('kode', '')));
        $nama = trim((string) $request->input('nama', ''));
        $sks = CourseNormalizer::normalizeSks($request->input('sks', 2));
        $semester = CourseNormalizer::normalizeDecimal($request->input('semester', '1'));
        $rawKelas = (string) $request->input('kelas', 'A');
        $kodeDosen1 = CourseNormalizer::normalizeKodeDosen((string) $request->input('kodeDosen1', ''));
        $kodeDosen2Raw = trim((string) $request->input('kodeDosen2', ''));
        $kodeDosen2 = $kodeDosen2Raw !== '' ? CourseNormalizer::normalizeKodeDosen($kodeDosen2Raw) : null;
        $kebutuhanRuang = CourseNormalizer::normalizeKebutuhanRuang((string) $request->input('kebutuhanRuang', 'Ruang Kelas Biasa'));

        if ($kode === '' || $nama === '' || $semester === '' || $kodeDosen1 === '') {
            return response()->json([
                'message' => 'Program Studi, Kode MK, Nama MK, Semester, Kelas, dan Dosen 1 wajib diisi.',
                'code' => 'VALIDATION_ERROR',
            ], 422);
        }

        if ($kodeDosen2 !== null && $kodeDosen1 === $kodeDosen2) {
            return response()->json([
                'message' => 'Dosen 1 dan Dosen 2 tidak boleh sama.',
                'code' => 'DUPLICATE_TEAM_LECTURER',
            ], 422);
        }

        if (! Dosen::query()->where('kode', $kodeDosen1)->exists()) {
            return response()->json([
                'message' => "Dosen 1 dengan kode {$kodeDosen1} belum terdaftar di Data Dosen.",
                'code' => 'UNKNOWN_LECTURER',
            ], 422);
        }

        if ($kodeDosen2 !== null && ! Dosen::query()->where('kode', $kodeDosen2)->exists()) {
            return response()->json([
                'message' => "Dosen 2 dengan kode {$kodeDosen2} belum terdaftar di Data Dosen.",
                'code' => 'UNKNOWN_LECTURER',
            ], 422);
        }

        $classes = CourseNormalizer::splitCombinedClasses($rawKelas);
        $created = [];

        foreach ($classes as $kelas) {
            $exists = MataKuliah::query()
                ->where('prodi', $prodi)
                ->where('kode', $kode)
                ->where('semester', $semester)
                ->where('kelas', $kelas)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => "Mata kuliah {$kode} ({$prodi} Semester {$semester} Kelas {$kelas}) sudah ada di antrean.",
                    'code' => 'DUPLICATE_COURSE',
                ], 422);
            }

            $parkedReason = null;
            if ($kebutuhanRuang === 'Online') {
                $parkedReason = 'Mata kuliah Online/Daring';
            } elseif ($sks === 0) {
                $parkedReason = 'Mata kuliah 0 SKS';
            }

            $mk = MataKuliah::query()->create([
                'prodi' => $prodi,
                'kode' => $kode,
                'nama' => $nama,
                'sks' => $sks,
                'semester' => $semester,
                'kelas' => $kelas,
                'kode_dosen_1' => $kodeDosen1,
                'kode_dosen_2' => $kodeDosen2,
                'kebutuhan_ruang' => $kebutuhanRuang,
                'status_antrean' => 'ready',
                'parked_reason' => $parkedReason,
            ]);

            $created[] = $mk;
        }

        $settings = PengaturanWaktu::current();
        $lecturers = Dosen::query()->with('ketersediaan')->get()->keyBy('kode');
        $rooms = Ruangan::query()->get()->keyBy('id');

        return response()->json([
            'data' => array_map(
                fn (MataKuliah $mk): array => TimeSlotCalculator::formatCourse($mk->load('segments'), $lecturers, $rooms, $settings),
                $created
            ),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $mk = MataKuliah::query()->with('segments')->find($id);
        if ($mk === null) {
            return response()->json([
                'message' => 'Mata kuliah tidak ditemukan.',
                'code' => 'NOT_FOUND',
            ], 404);
        }

        $kodeDosen1 = $request->has('kodeDosen1')
            ? CourseNormalizer::normalizeKodeDosen((string) $request->input('kodeDosen1'))
            : $mk->kode_dosen_1;
        $kodeDosen2 = $request->has('kodeDosen2')
            ? (trim((string) $request->input('kodeDosen2')) !== ''
                ? CourseNormalizer::normalizeKodeDosen((string) $request->input('kodeDosen2'))
                : null)
            : $mk->kode_dosen_2;

        if ($kodeDosen1 !== null && $kodeDosen2 !== null && $kodeDosen1 === $kodeDosen2) {
            return response()->json([
                'message' => 'Dosen 1 dan Dosen 2 tidak boleh sama.',
                'code' => 'DUPLICATE_TEAM_LECTURER',
            ], 422);
        }

        if ($kodeDosen1 !== null && $kodeDosen1 !== '' && ! Dosen::query()->where('kode', $kodeDosen1)->exists()) {
            return response()->json([
                'message' => "Dosen 1 dengan kode {$kodeDosen1} belum terdaftar.",
                'code' => 'UNKNOWN_LECTURER',
            ], 422);
        }

        if ($kodeDosen2 !== null && ! Dosen::query()->where('kode', $kodeDosen2)->exists()) {
            return response()->json([
                'message' => "Dosen 2 dengan kode {$kodeDosen2} belum terdaftar.",
                'code' => 'UNKNOWN_LECTURER',
            ], 422);
        }

        $mk->kode_dosen_1 = $kodeDosen1 !== '' ? $kodeDosen1 : null;
        $mk->kode_dosen_2 = $kodeDosen2;

        if ($request->has('nama')) {
            $mk->nama = trim((string) $request->input('nama'));
        }
        if ($request->has('sks')) {
            $mk->sks = CourseNormalizer::normalizeSks($request->input('sks'));
        }
        if ($request->has('kebutuhanRuang')) {
            $mk->kebutuhan_ruang = CourseNormalizer::normalizeKebutuhanRuang((string) $request->input('kebutuhanRuang'));
        }

        $d1Ready = $mk->kode_dosen_1 !== null;
        $d2Ready = $mk->kode_dosen_2 !== null || trim((string) $mk->raw_dosen_2) === '';

        if ($d1Ready && $d2Ready) {
            $mk->status_antrean = 'ready';
            $mk->raw_dosen_1 = null;
            $mk->raw_dosen_2 = null;
        }

        $mk->save();

        $settings = PengaturanWaktu::current();
        $lecturers = Dosen::query()->with('ketersediaan')->get()->keyBy('kode');
        $rooms = Ruangan::query()->get()->keyBy('id');

        return response()->json([
            'data' => TimeSlotCalculator::formatCourse($mk->fresh()->load('segments'), $lecturers, $rooms, $settings),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $mk = MataKuliah::query()->find($id);
        if ($mk === null) {
            return response()->json([
                'message' => 'Mata kuliah tidak ditemukan.',
                'code' => 'NOT_FOUND',
            ], 404);
        }

        $mk->delete();

        return response()->json([
            'data' => ['deleted_id' => $id],
        ]);
    }

    public function clearAll(): JsonResponse
    {
        MataKuliah::query()->delete();

        return response()->json([
            'data' => ['cleared' => true],
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $rows = $request->input('rows', []);
        $sourceFile = trim((string) $request->input('sourceFile', 'Unggahan Kaprodi'));

        if (! is_array($rows)) {
            return response()->json([
                'message' => 'Format data impor mata kuliah tidak valid.',
                'code' => 'VALIDATION_ERROR',
            ], 422);
        }

        $allDosen = Dosen::query()->get();
        $accepted = [];
        $pendingLecturers = [];
        $autoRegisteredLecturers = [];
        $rejected = [];
        $autoRegister = $request->boolean('autoRegisterLecturers', true);

        $resolveOrCreateDosen = function (string $rawText, ?string $explicitKode = null) use (&$allDosen, &$autoRegisteredLecturers, $autoRegister): ?Dosen {
            $cleanKode = CourseNormalizer::normalizeKodeDosen((string) $explicitKode);
            $clean = trim($rawText);
            if ($cleanKode === '-') {
                $cleanKode = '';
            }
            if ($clean === '-') {
                $clean = '';
            }

            if ($cleanKode === '' && $clean === '') {
                return null;
            }

            if ($cleanKode !== '') {
                $byCode = $allDosen->first(fn (Dosen $d): bool => mb_strtoupper($d->kode) === $cleanKode);
                if ($byCode !== null || ! $autoRegister) {
                    return $byCode;
                }

                $newDosen = Dosen::query()->create([
                    'kode' => $cleanKode,
                    'nama' => $clean !== '' ? $clean : $cleanKode,
                    'status' => 'Dosen Tetap',
                ]);
                $allDosen->push($newDosen);
                $autoRegisteredLecturers[] = $newDosen->kode;

                return $newDosen;
            }

            $matched = CourseNormalizer::matchDosen($clean, $allDosen);
            if ($matched !== null || ! $autoRegister) {
                return $matched;
            }

            $kode = '';
            $nama = $clean;
            if (preg_match('/^([A-Z]{1,6}\d{1,5})\s*[-–:]\s*(.+)$/iu', $clean, $m)) {
                $kode = mb_strtoupper($m[1]);
                $nama = trim($m[2]);
            }

            $existingCodes = $allDosen->pluck('kode')->map(fn ($c): string => mb_strtoupper((string) $c))->all();
            if ($kode === '' || in_array($kode, $existingCodes, true)) {
                $seq = count($existingCodes) + 1;
                do {
                    $kode = sprintf('DSN%03d', $seq++);
                } while (in_array($kode, $existingCodes, true));
            }

            $newDosen = Dosen::query()->create([
                'kode' => $kode,
                'nama' => $nama,
                'status' => 'Dosen Tetap',
            ]);

            $allDosen->push($newDosen);
            $autoRegisteredLecturers[] = $newDosen->kode;

            return $newDosen;
        };

        foreach ($rows as $idx => $row) {
            if (! is_array($row)) {
                continue;
            }

            $prodi = CourseNormalizer::normalizeProdi((string) ($row['prodi'] ?? $row['program_studi'] ?? ''));
            $kode = mb_strtoupper(trim((string) ($row['kode'] ?? $row['kode_mata_kuliah'] ?? '')));
            $nama = trim((string) ($row['nama'] ?? $row['nama_mata_kuliah'] ?? ''));
            $sks = CourseNormalizer::normalizeSks($row['sks'] ?? 0);
            $semester = CourseNormalizer::normalizeDecimal($row['semester'] ?? '1');
            $rawKelas = (string) ($row['kelas'] ?? 'A');
            $rawKodeDosen1 = trim((string) ($row['kodeDosen1'] ?? $row['kode_dosen_1'] ?? ''));
            $rawKodeDosen2 = trim((string) ($row['kodeDosen2'] ?? $row['kode_dosen_2'] ?? ''));
            $rawDosen1 = trim((string) ($row['dosen1'] ?? $row['nama_dosen_1'] ?? $row['dosen_1'] ?? $rawKodeDosen1));
            $rawDosen2 = trim((string) ($row['dosen2'] ?? $row['nama_dosen_2'] ?? $row['dosen_2'] ?? $rawKodeDosen2));
            if ($rawDosen2 === '-') {
                $rawDosen2 = '';
            }
            $kebutuhanRuang = CourseNormalizer::normalizeKebutuhanRuang(
                (string) ($row['kebutuhanRuang'] ?? $row['kebutuhan_ruang_kelas'] ?? 'Ruang Kelas Biasa')
            );

            if ($kode === '' || $nama === '') {
                $rejected[] = [
                    'row' => $idx + 1,
                    'kode' => $kode,
                    'nama' => $nama,
                    'reason' => 'Kode Mata Kuliah atau Nama Mata Kuliah kosong.',
                ];

                continue;
            }

            $matchedDosen1 = $resolveOrCreateDosen($rawDosen1 !== '' ? $rawDosen1 : 'Dosen Pengampu', $rawKodeDosen1);
            $matchedDosen2 = ($rawDosen2 !== '' || $rawKodeDosen2 !== '')
                ? $resolveOrCreateDosen($rawDosen2, $rawKodeDosen2)
                : null;
            if ($matchedDosen1 !== null && $matchedDosen2 !== null && $matchedDosen1->kode === $matchedDosen2->kode) {
                $matchedDosen2 = null;
            }

            $d1Missing = $matchedDosen1 === null;
            $d2Missing = $rawDosen2 !== '' && $matchedDosen2 === null;
            $isPending = $d1Missing || $d2Missing;

            $classes = CourseNormalizer::splitCombinedClasses($rawKelas);
            foreach ($classes as $kelas) {
                $duplicate = MataKuliah::query()
                    ->where('prodi', $prodi)
                    ->where('kode', $kode)
                    ->where('semester', $semester)
                    ->where('kelas', $kelas)
                    ->exists();

                if ($duplicate) {
                    $rejected[] = [
                        'row' => $idx + 1,
                        'prodi' => $prodi,
                        'kode' => $kode,
                        'nama' => $nama,
                        'semester' => $semester,
                        'kelas' => $kelas,
                        'reason' => "Duplikat MK ({$prodi} • {$kode} • Sem {$semester} • Kelas {$kelas}).",
                    ];

                    continue;
                }

                $parkedReason = null;
                if ($kebutuhanRuang === 'Online') {
                    $parkedReason = 'Mata kuliah Online/Daring';
                } elseif ($sks === 0) {
                    $parkedReason = 'Mata kuliah 0 SKS';
                }

                $mk = MataKuliah::query()->create([
                    'prodi' => $prodi,
                    'kode' => $kode,
                    'nama' => $nama,
                    'sks' => $sks,
                    'semester' => $semester,
                    'kelas' => $kelas,
                    'kode_dosen_1' => $matchedDosen1?->kode,
                    'kode_dosen_2' => $matchedDosen2?->kode,
                    'raw_dosen_1' => $d1Missing ? ($rawDosen1 !== '' ? $rawDosen1 : 'Dosen 1 kosong') : null,
                    'raw_dosen_2' => $d2Missing ? $rawDosen2 : null,
                    'kebutuhan_ruang' => $kebutuhanRuang,
                    'status_antrean' => $isPending ? 'pending_dosen' : 'ready',
                    'source_file' => (string) ($row['sourceFile'] ?? $sourceFile),
                    'parked_reason' => $parkedReason,
                ]);

                if ($isPending) {
                    $pendingLecturers[] = $mk->id;
                } else {
                    $accepted[] = $mk->id;
                }
            }
        }

        return response()->json([
            'data' => [
                'accepted_count' => count($accepted),
                'auto_registered_lecturer_count' => count($autoRegisteredLecturers),
                'pending_lecturer_count' => count($pendingLecturers),
                'rejected_count' => count($rejected),
                'rejected' => $rejected,
                'dosen_database_empty' => $allDosen->isEmpty(),
            ],
        ]);
    }
}
