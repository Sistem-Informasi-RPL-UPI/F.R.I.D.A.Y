<?php

namespace App\Modules\MataKuliah\Services;

use App\Modules\Dosen\Models\Dosen;
use App\Modules\MataKuliah\Models\MataKuliah;
use Illuminate\Support\Collection;

class CourseNormalizer
{
    public static function normalizeKodeDosen(string $raw): string
    {
        return mb_strtoupper(trim($raw));
    }

    public static function normalizeDecimal(mixed $raw): string
    {
        $str = trim((string) $raw);
        if ($str === '') {
            return '';
        }

        if (preg_match('/^(\d+)\.0+$/', $str, $m)) {
            return $m[1];
        }

        return $str;
    }

    /**
     * FR-M5: SKS 0 sampai 6. Nilai 0, 0.0, kosong, atau teks non-angka dihitung 0 SKS (tanpa default 2).
     */
    public static function normalizeSks(mixed $raw): int
    {
        if ($raw === null) {
            return 0;
        }

        $str = trim((string) $raw);
        if ($str === '' || ! is_numeric($str)) {
            return 0;
        }

        $val = (int) round((float) $str);

        return max(0, min(6, $val));
    }

    public static function normalizeProdi(string $raw): string
    {
        $clean = trim($raw);
        $upper = mb_strtoupper($clean);

        if (in_array($upper, ['TEKKOM', 'TEKOM', 'TEKNIK KOMPUTER'], true)) {
            return 'Teknik Komputer';
        }

        if (in_array($upper, ['PMM', 'PENDIDIKAN MULTIMEDIA'], true)) {
            return 'PMM';
        }

        if ($upper === 'PGSD') {
            return 'PGSD';
        }

        if ($upper === 'PGPAUD') {
            return 'PGPAUD';
        }

        if ($upper === 'RPL' || $upper === 'REKAYASA PERANGKAT LUNAK') {
            return 'RPL';
        }

        if ($upper === 'MKDU') {
            return 'MKDU';
        }

        return $clean !== '' ? $clean : 'RPL';
    }

    public static function normalizeKebutuhanRuang(string $raw): string
    {
        $upper = mb_strtoupper(trim($raw));

        if (str_contains($upper, 'ONLINE') || str_contains($upper, 'DARING')) {
            return 'Online';
        }

        if (str_contains($upper, 'LAB') || str_contains($upper, 'PRAKTIKUM')) {
            return 'Laboratorium Praktikum';
        }

        return 'Ruang Kelas Biasa';
    }

    /**
     * FR-M7: Kelas gabungan (3A & B, 3A, 3B, 3A / 3B, A dan B, 1A + 1B) dipecah menjadi baris terpisah.
     *
     * @return array<int, string>
     */
    public static function splitCombinedClasses(string $rawKelas): array
    {
        $clean = self::normalizeDecimal($rawKelas);
        if ($clean === '') {
            return ['A'];
        }

        $parts = preg_split('/\s*(?:&|,|\/|\+|\bdan\b)\s*/iu', $clean) ?: [$clean];
        $parts = array_values(array_filter(array_map('trim', $parts), fn (string $p): bool => $p !== ''));

        if (count($parts) <= 1) {
            return [mb_strtoupper($clean)];
        }

        $prefix = '';
        if (preg_match('/^(\d+)[A-Za-z]+$/', $parts[0], $m)) {
            $prefix = $m[1];
        }

        $result = [];
        foreach ($parts as $part) {
            $token = mb_strtoupper(self::normalizeDecimal($part));
            if ($prefix !== '' && preg_match('/^[A-Z]+$/', $token)) {
                $token = $prefix.$token;
            }
            if ($token !== '' && ! in_array($token, $result, true)) {
                $result[] = $token;
            }
        }

        return $result !== [] ? $result : [mb_strtoupper($clean)];
    }

    /**
     * FR-M8: Isi sel Dosen 1 dan Dosen 2 (kode atau nama) dicocokkan ke data dosen:
     * kode lebih dulu, lalu nama (tanpa beda huruf besar/kecil dan spasi).
     *
     * @param  Collection<int, Dosen>  $allDosen
     */
    public static function matchDosen(?string $raw, Collection $allDosen): ?Dosen
    {
        $value = trim((string) $raw);
        if ($value === '' || $value === '-') {
            return null;
        }

        $upperCode = mb_strtoupper($value);
        foreach ($allDosen as $dosen) {
            if (mb_strtoupper(trim($dosen->kode)) === $upperCode) {
                return $dosen;
            }
        }

        $normTarget = self::compactText($value);
        foreach ($allDosen as $dosen) {
            if (self::compactText($dosen->nama) === $normTarget) {
                return $dosen;
            }
        }

        return null;
    }

    public static function compactText(string $text): string
    {
        return mb_strtolower((string) preg_replace('/\s+/u', '', trim($text)));
    }

    /**
     * Re-evaluates courses with status_antrean = 'pending_dosen' after a lecturer is added or imported.
     */
    public static function resolvePendingCourses(): void
    {
        $allDosen = Dosen::query()->get();
        if ($allDosen->isEmpty()) {
            return;
        }

        $pending = MataKuliah::query()->where('status_antrean', 'pending_dosen')->get();
        foreach ($pending as $mk) {
            $d1Valid = true;
            if ($mk->kode_dosen_1 === null && trim((string) $mk->raw_dosen_1) !== '') {
                $matched1 = self::matchDosen($mk->raw_dosen_1, $allDosen);
                if ($matched1 !== null) {
                    $mk->kode_dosen_1 = $matched1->kode;
                } else {
                    $d1Valid = false;
                }
            } elseif ($mk->kode_dosen_1 === null) {
                $d1Valid = false;
            }

            $d2Valid = true;
            if ($mk->kode_dosen_2 === null && trim((string) $mk->raw_dosen_2) !== '') {
                $matched2 = self::matchDosen($mk->raw_dosen_2, $allDosen);
                if ($matched2 !== null) {
                    $mk->kode_dosen_2 = $matched2->kode;
                } else {
                    $d2Valid = false;
                }
            }

            if ($d1Valid && $d2Valid) {
                $mk->status_antrean = 'ready';
            }

            $mk->save();
        }
    }
}
