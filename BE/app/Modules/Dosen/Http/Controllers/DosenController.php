<?php

namespace App\Modules\Dosen\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Dosen\Models\Dosen;
use App\Modules\Dosen\Models\KetersediaanDosen;
use App\Modules\MataKuliah\Models\MataKuliah;
use App\Modules\MataKuliah\Services\CourseNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DosenController extends Controller
{
    public function index(): JsonResponse
    {
        $lecturers = Dosen::query()->with('ketersediaan')->orderBy('kode')->get();
        $courses = MataKuliah::query()->get();

        $data = $lecturers->map(function (Dosen $dosen) use ($courses): array {
            return $this->formatDosen($dosen, $courses);
        })->values();

        $total = $data->count();
        $tetap = $data->where('status', 'Dosen Tetap')->count();
        $luar = $data->where('status', 'Dosen Luar')->count();
        $belumMengampu = $data->where('jumlahMk', 0)->count();

        return response()->json([
            'data' => $data,
            'stats' => [
                'total' => $total,
                'tetap' => $tetap,
                'luar' => $luar,
                'belumMengampu' => $belumMengampu,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $kode = CourseNormalizer::normalizeKodeDosen((string) $request->input('kode', ''));
        $nama = trim((string) $request->input('nama', ''));
        $status = $this->normalizeStatus((string) $request->input('status', 'Dosen Tetap'));

        if ($kode === '' || $nama === '') {
            return response()->json([
                'message' => 'Kode Dosen dan Nama Dosen wajib diisi.',
                'code' => 'VALIDATION_ERROR',
            ], 422);
        }

        if (Dosen::query()->where('kode', $kode)->exists()) {
            return response()->json([
                'message' => "Kode dosen {$kode} sudah terdaftar. Gunakan kode unik yang lain.",
                'code' => 'DUPLICATE_LECTURER_CODE',
            ], 422);
        }

        $duplicateNameExists = Dosen::query()
            ->whereRaw('LOWER(TRIM(nama)) = ?', [mb_strtolower($nama)])
            ->exists();

        $dosen = Dosen::query()->create([
            'kode' => $kode,
            'nama' => $nama,
            'status' => $status,
        ]);

        CourseNormalizer::resolvePendingCourses();

        $courses = MataKuliah::query()->get();

        return response()->json([
            'data' => $this->formatDosen($dosen->load('ketersediaan'), $courses),
            'warning' => $duplicateNameExists
                ? "Peringatan: Nama dosen \"{$nama}\" sudah pernah terdaftar dengan kode lain."
                : null,
        ], 201);
    }

    public function update(Request $request, string $kode): JsonResponse
    {
        $currentKode = CourseNormalizer::normalizeKodeDosen($kode);
        $dosen = Dosen::query()->where('kode', $currentKode)->first();

        if ($dosen === null) {
            return response()->json([
                'message' => "Dosen dengan kode {$currentKode} tidak ditemukan.",
                'code' => 'NOT_FOUND',
            ], 404);
        }

        $newKode = $request->has('kode')
            ? CourseNormalizer::normalizeKodeDosen((string) $request->input('kode'))
            : $dosen->kode;
        $nama = $request->has('nama')
            ? trim((string) $request->input('nama'))
            : $dosen->nama;
        $status = $request->has('status')
            ? $this->normalizeStatus((string) $request->input('status'))
            : $dosen->status;

        if ($newKode === '' || $nama === '') {
            return response()->json([
                'message' => 'Kode Dosen dan Nama Dosen wajib diisi.',
                'code' => 'VALIDATION_ERROR',
            ], 422);
        }

        if ($newKode !== $dosen->kode && Dosen::query()->where('kode', $newKode)->exists()) {
            return response()->json([
                'message' => "Kode dosen {$newKode} sudah digunakan oleh dosen lain.",
                'code' => 'DUPLICATE_LECTURER_CODE',
            ], 422);
        }

        $duplicateNameExists = Dosen::query()
            ->where('id', '!=', $dosen->id)
            ->whereRaw('LOWER(TRIM(nama)) = ?', [mb_strtolower($nama)])
            ->exists();

        DB::transaction(function () use ($dosen, $currentKode, $newKode, $nama, $status): void {
            $dosen->update([
                'kode' => $newKode,
                'nama' => $nama,
                'status' => $status,
            ]);

            if ($newKode !== $currentKode) {
                MataKuliah::query()->where('kode_dosen_1', $currentKode)->update(['kode_dosen_1' => $newKode]);
                MataKuliah::query()->where('kode_dosen_2', $currentKode)->update(['kode_dosen_2' => $newKode]);
            }
        });

        CourseNormalizer::resolvePendingCourses();
        $courses = MataKuliah::query()->get();

        return response()->json([
            'data' => $this->formatDosen($dosen->fresh()->load('ketersediaan'), $courses),
            'warning' => $duplicateNameExists
                ? "Peringatan: Nama dosen \"{$nama}\" juga dimiliki oleh kode dosen lain."
                : null,
        ]);
    }

    public function destroy(Request $request, string $kode): JsonResponse
    {
        $targetKode = CourseNormalizer::normalizeKodeDosen($kode);
        $dosen = Dosen::query()->where('kode', $targetKode)->first();

        if ($dosen === null) {
            return response()->json([
                'message' => "Dosen dengan kode {$targetKode} tidak ditemukan.",
                'code' => 'NOT_FOUND',
            ], 404);
        }

        $affectedCourses = MataKuliah::query()
            ->where('kode_dosen_1', $targetKode)
            ->orWhere('kode_dosen_2', $targetKode)
            ->get();

        $affectedCount = $affectedCourses->count();
        $force = $request->boolean('force') || $request->boolean('confirm');

        if ($affectedCount > 0 && ! $force) {
            return response()->json([
                'message' => "Dosen {$dosen->nama} ({$dosen->kode}) masih mengampu {$affectedCount} mata kuliah. Konfirmasi untuk menghapus dan mengosongkan dosen pada MK tersebut.",
                'code' => 'LECTURER_HAS_COURSES',
                'affected_courses_count' => $affectedCount,
            ], 409);
        }

        DB::transaction(function () use ($dosen, $targetKode, $affectedCourses): void {
            foreach ($affectedCourses as $mk) {
                if ($mk->kode_dosen_1 === $targetKode) {
                    $mk->kode_dosen_1 = null;
                    $mk->raw_dosen_1 = 'Dosen kosong (dihapus)';
                    $mk->status_antrean = 'pending_dosen';
                }
                if ($mk->kode_dosen_2 === $targetKode) {
                    $mk->kode_dosen_2 = null;
                    $mk->raw_dosen_2 = null;
                }
                $mk->save();
            }

            $dosen->delete();
        });

        return response()->json([
            'data' => [
                'deleted_kode' => $targetKode,
                'affected_courses_count' => $affectedCount,
            ],
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $rows = $request->input('rows', []);
        if (! is_array($rows)) {
            return response()->json([
                'message' => 'Format data impor dosen tidak valid.',
                'code' => 'VALIDATION_ERROR',
            ], 422);
        }

        $imported = [];
        $duplicates = [];
        $rejected = [];

        foreach ($rows as $idx => $row) {
            if (! is_array($row)) {
                continue;
            }

            $kode = CourseNormalizer::normalizeKodeDosen((string) ($row['kode'] ?? $row['kode_dosen'] ?? ''));
            $nama = trim((string) ($row['nama'] ?? $row['nama_dosen'] ?? ''));
            $status = $this->normalizeStatus((string) ($row['status'] ?? $row['status_dosen'] ?? 'Dosen Tetap'));

            if ($kode === '' || $nama === '') {
                $rejected[] = [
                    'row' => $idx + 1,
                    'kode' => $kode,
                    'nama' => $nama,
                    'reason' => 'Kode Dosen atau Nama Dosen kosong.',
                ];

                continue;
            }

            if (Dosen::query()->where('kode', $kode)->exists()) {
                $duplicates[] = [
                    'kode' => $kode,
                    'nama' => $nama,
                    'status' => $status,
                    'reason' => "Kode dosen {$kode} sudah ada (tidak ditimpa).",
                ];

                continue;
            }

            $dosen = Dosen::query()->create([
                'kode' => $kode,
                'nama' => $nama,
                'status' => $status,
            ]);

            $imported[] = [
                'kode' => $dosen->kode,
                'nama' => $dosen->nama,
                'status' => $dosen->status,
            ];
        }

        CourseNormalizer::resolvePendingCourses();

        return response()->json([
            'data' => [
                'imported' => $imported,
                'duplicates' => $duplicates,
                'rejected' => $rejected,
                'imported_count' => count($imported),
                'duplicate_count' => count($duplicates),
            ],
        ]);
    }

    public function showKetersediaan(string $kode): JsonResponse
    {
        $targetKode = CourseNormalizer::normalizeKodeDosen($kode);
        $dosen = Dosen::query()->with('ketersediaan')->where('kode', $targetKode)->first();

        if ($dosen === null) {
            return response()->json([
                'message' => "Dosen dengan kode {$targetKode} tidak ditemukan.",
                'code' => 'NOT_FOUND',
            ], 404);
        }

        $k = $dosen->ketersediaan;

        return response()->json([
            'data' => [
                'kodeDosen' => $dosen->kode,
                'namaDosen' => $dosen->nama,
                'status' => $dosen->status,
                'hari' => $k?->hari ?? KetersediaanDosen::DEFAULT_DAYS,
                'startTime' => $k?->start_time ?? KetersediaanDosen::DEFAULT_START_TIME,
                'endTime' => $k?->end_time ?? KetersediaanDosen::DEFAULT_END_TIME,
                'isCustom' => (bool) ($k?->is_custom ?? false),
            ],
        ]);
    }

    public function updateKetersediaan(Request $request, string $kode): JsonResponse
    {
        $targetKode = CourseNormalizer::normalizeKodeDosen($kode);
        $dosen = Dosen::query()->where('kode', $targetKode)->first();

        if ($dosen === null) {
            return response()->json([
                'message' => "Dosen dengan kode {$targetKode} tidak ditemukan.",
                'code' => 'NOT_FOUND',
            ], 404);
        }

        if ($request->boolean('reset')) {
            KetersediaanDosen::query()->where('kode_dosen', $targetKode)->delete();

            return response()->json([
                'data' => [
                    'kodeDosen' => $dosen->kode,
                    'hari' => KetersediaanDosen::DEFAULT_DAYS,
                    'startTime' => KetersediaanDosen::DEFAULT_START_TIME,
                    'endTime' => KetersediaanDosen::DEFAULT_END_TIME,
                    'isCustom' => false,
                ],
            ]);
        }

        $validDays = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
        $rawHari = $request->input('hari', KetersediaanDosen::DEFAULT_DAYS);
        $hari = is_array($rawHari)
            ? array_values(array_intersect($validDays, array_map(fn ($d): string => mb_strtoupper(trim((string) $d)), $rawHari)))
            : KetersediaanDosen::DEFAULT_DAYS;

        if ($hari === []) {
            return response()->json([
                'message' => 'Pilih minimal satu hari mengajar yang diizinkan.',
                'code' => 'VALIDATION_ERROR',
            ], 422);
        }

        $startTime = trim((string) $request->input('startTime', KetersediaanDosen::DEFAULT_START_TIME));
        $endTime = trim((string) $request->input('endTime', KetersediaanDosen::DEFAULT_END_TIME));

        if ($startTime >= $endTime) {
            return response()->json([
                'message' => 'Jam mulai mengajar harus lebih awal daripada jam selesai.',
                'code' => 'VALIDATION_ERROR',
            ], 422);
        }

        $isDefault = $hari === KetersediaanDosen::DEFAULT_DAYS
            && $startTime === KetersediaanDosen::DEFAULT_START_TIME
            && $endTime === KetersediaanDosen::DEFAULT_END_TIME;

        $ketersediaan = KetersediaanDosen::query()->updateOrCreate(
            ['kode_dosen' => $targetKode],
            [
                'hari' => $hari,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'is_custom' => ! $isDefault,
            ]
        );

        return response()->json([
            'data' => [
                'kodeDosen' => $dosen->kode,
                'hari' => $ketersediaan->hari,
                'startTime' => $ketersediaan->start_time,
                'endTime' => $ketersediaan->end_time,
                'isCustom' => $ketersediaan->is_custom,
            ],
        ]);
    }

    private function normalizeStatus(string $raw): string
    {
        $upper = mb_strtoupper(trim($raw));
        if (str_contains($upper, 'LUAR') || $upper === 'DL') {
            return 'Dosen Luar';
        }

        return 'Dosen Tetap';
    }

    /**
     * @param  Collection<int, MataKuliah>  $courses
     * @return array<string, mixed>
     */
    private function formatDosen(Dosen $dosen, $courses): array
    {
        $myCourses = $courses->filter(function (MataKuliah $mk) use ($dosen): bool {
            return $mk->kode_dosen_1 === $dosen->kode || $mk->kode_dosen_2 === $dosen->kode;
        })->values();

        $k = $dosen->ketersediaan;
        $hari = $k?->hari ?? KetersediaanDosen::DEFAULT_DAYS;
        $startTime = $k?->start_time ?? KetersediaanDosen::DEFAULT_START_TIME;
        $endTime = $k?->end_time ?? KetersediaanDosen::DEFAULT_END_TIME;
        $isCustom = (bool) ($k?->is_custom ?? false);

        return [
            'kode' => $dosen->kode,
            'nama' => $dosen->nama,
            'status' => $dosen->status,
            'jumlahMk' => $myCourses->count(),
            'totalSks' => (int) $myCourses->sum('sks'),
            'mataKuliah' => $myCourses->map(fn (MataKuliah $mk): array => [
                'id' => $mk->id,
                'kode' => $mk->kode,
                'nama' => $mk->nama,
                'prodi' => $mk->prodi,
                'semester' => $mk->semester,
                'kelas' => $mk->kelas,
                'sks' => (int) $mk->sks,
            ])->all(),
            'ketersediaan' => [
                'kodeDosen' => $dosen->kode,
                'hari' => $hari,
                'startTime' => $startTime,
                'endTime' => $endTime,
                'isCustom' => $isCustom,
            ],
        ];
    }
}
