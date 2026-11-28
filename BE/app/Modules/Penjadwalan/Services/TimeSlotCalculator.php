<?php

namespace App\Modules\Penjadwalan\Services;

use App\Modules\Dosen\Models\Dosen;
use App\Modules\MataKuliah\Models\JadwalSegmen;
use App\Modules\MataKuliah\Models\MataKuliah;
use App\Modules\Penjadwalan\Models\PengaturanWaktu;
use App\Modules\Ruangan\Models\Ruangan;
use Illuminate\Support\Collection;

class TimeSlotCalculator
{
    public const DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];

    public const MORNING_MAX_POS = 6;

    public const TOTAL_POS = 11;

    public static function timeToMinutes(string $hhmm): int
    {
        $clean = str_replace('.', ':', trim($hhmm));
        $parts = explode(':', $clean);
        $h = (int) ($parts[0] ?? 7);
        $m = (int) ($parts[1] ?? 0);

        return ($h * 60) + $m;
    }

    public static function minutesToTime(int $minutes): string
    {
        $h = (int) floor($minutes / 60);
        $m = $minutes % 60;

        return sprintf('%02d:%02d', $h, $m);
    }

    /**
     * Builds all slot rows (Pos 1..6, Break row, Pos 7..14) for a given day.
     *
     * @return array<int, array{pos: int|null, isBreak: bool, startTime: string, endTime: string, label: string, session: string}>
     */
    public static function buildDaySlots(string $day, PengaturanWaktu $settings): array
    {
        $dayUpper = mb_strtoupper(trim($day));
        $durasi = max(15, min(120, (int) $settings->durasi_sks));
        $isFriday = $dayUpper === 'JUMAT';

        $morningStart = self::timeToMinutes($isFriday ? $settings->mulai_pagi_jumat : $settings->mulai_pagi);
        $slots = [];

        $cursor = $morningStart;
        for ($pos = 1; $pos <= self::MORNING_MAX_POS; $pos++) {
            $start = self::minutesToTime($cursor);
            $end = self::minutesToTime($cursor + $durasi);
            $slots[] = [
                'pos' => $pos,
                'isBreak' => false,
                'startTime' => $start,
                'endTime' => $end,
                'label' => "{$start} - {$end}",
                'session' => 'pagi',
            ];
            $cursor += $durasi;
        }

        if ($isFriday) {
            $afternoonStart = max($cursor, self::timeToMinutes($settings->mulai_siang_jumat));
        } else {
            $afternoonStart = $cursor + max(15, (int) $settings->istirahat);
        }

        $breakStart = self::minutesToTime($cursor);
        $breakEnd = self::minutesToTime($afternoonStart);
        $slots[] = [
            'pos' => null,
            'isBreak' => true,
            'startTime' => $breakStart,
            'endTime' => $breakEnd,
            'label' => "{$breakStart} - {$breakEnd}",
            'session' => 'istirahat',
        ];

        $cursor = $afternoonStart;
        $maxDayEndMinutes = 17 * 60; // 17:00 sharp
        for ($pos = self::MORNING_MAX_POS + 1; $pos <= self::TOTAL_POS; $pos++) {
            $start = self::minutesToTime($cursor);
            $rawNext = $cursor + $durasi;
            $cappedNext = ($pos === self::TOTAL_POS && $cursor < $maxDayEndMinutes && $rawNext > $maxDayEndMinutes)
                ? $maxDayEndMinutes
                : $rawNext;
            $end = self::minutesToTime($cappedNext);
            $slots[] = [
                'pos' => $pos,
                'isBreak' => false,
                'startTime' => $start,
                'endTime' => $end,
                'label' => "{$start} - {$end}",
                'session' => 'siang',
            ];
            $cursor = $cappedNext;
        }

        return $slots;
    }

    /**
     * @return array{startTime: string, endTime: string, label: string}
     */
    public static function getSegmentTimeRange(string $day, int $posAwal, int $panjang, PengaturanWaktu $settings): array
    {
        $daySlots = collect(self::buildDaySlots($day, $settings))
            ->where('isBreak', false)
            ->keyBy('pos');

        $first = $daySlots->get($posAwal);
        $lastPos = $posAwal + max(1, $panjang) - 1;
        $last = $daySlots->get($lastPos) ?? $first;

        $start = $first['startTime'] ?? '07:00';
        $end = $last['endTime'] ?? '08:40';

        return [
            'startTime' => $start,
            'endTime' => $end,
            'label' => "{$start} - {$end}",
        ];
    }

    /**
     * @param  Collection<string, Dosen>  $lecturers
     * @param  Collection<int, Ruangan>  $rooms
     * @return array<string, mixed>
     */
    public static function formatCourse(
        MataKuliah $mk,
        Collection $lecturers,
        Collection $rooms,
        PengaturanWaktu $settings
    ): array {
        $segs = $mk->segments->sortBy('segmen_ke')->values();
        $isSplit = $segs->count() > 1;
        $totalSegs = $segs->count();

        $formattedSegments = $segs->map(function (JadwalSegmen $seg, int $idx) use ($rooms, $settings, $isSplit, $totalSegs): array {
            $timeRange = self::getSegmentTimeRange($seg->hari, $seg->pos_awal, $seg->panjang, $settings);
            $room = $rooms->get($seg->ruangan_id);

            return [
                'id' => $seg->id,
                'segmenKe' => $idx + 1,
                'badgeLabel' => $isSplit ? sprintf('(%d/%d)', $idx + 1, $totalSegs) : null,
                'day' => $seg->hari,
                'room' => $seg->ruangan_id,
                'roomKode' => $room?->kode ?? "R-{$seg->ruangan_id}",
                'roomLabel' => $room?->label ?? 'Ruang Kelas',
                'gedung' => $room?->gedung ?? 'Gedung B',
                'pos' => $seg->pos_awal,
                'len' => $seg->panjang,
                'startTime' => $timeRange['startTime'],
                'endTime' => $timeRange['endTime'],
                'timeDisplay' => $timeRange['label'],
            ];
        })->all();

        $d1 = $mk->kode_dosen_1 ? $lecturers->get($mk->kode_dosen_1) : null;
        $d2 = $mk->kode_dosen_2 ? $lecturers->get($mk->kode_dosen_2) : null;

        if ($mk->status_antrean === 'pending_dosen') {
            $status = 'Dosen Belum Terdaftar';
        } elseif ($mk->kebutuhan_ruang === 'Online') {
            $status = 'Online';
        } elseif ($isSplit) {
            $status = 'Terpisah';
        } elseif (count($formattedSegments) === 1) {
            $status = 'Terjadwal';
        } else {
            $status = 'Diparkir';
        }

        $sksDisplay = (string) $mk->sks;
        if ($isSplit) {
            $parts = array_map(fn (array $s): int => (int) $s['len'], $formattedSegments);
            $sksDisplay = sprintf('%d (%s)', $mk->sks, implode('+', $parts));
        }

        $timeDisplay = '-';
        $hariDisplay = '-';
        $ruangDisplay = '-';

        if ($formattedSegments !== []) {
            $hariDisplay = $formattedSegments[0]['day'];
            $ruangDisplay = $formattedSegments[0]['roomKode'];
            $timeDisplay = implode(' & ', array_map(
                fn (array $s): string => $isSplit ? "{$s['timeDisplay']} {$s['badgeLabel']}" : $s['timeDisplay'],
                $formattedSegments
            ));
        } elseif ($mk->kebutuhan_ruang === 'Online') {
            $ruangDisplay = 'Online';
            $timeDisplay = 'Daring / Online';
        }

        return [
            'id' => $mk->id,
            'prodi' => $mk->prodi,
            'kode' => $mk->kode,
            'nama' => $mk->nama,
            'sks' => (int) $mk->sks,
            'sksDisplay' => $sksDisplay,
            'semester' => $mk->semester,
            'kelas' => $mk->kelas,
            'cohort' => "{$mk->prodi}|{$mk->semester}|{$mk->kelas}",
            'kodeDosen1' => $mk->kode_dosen_1,
            'kodeDosen2' => $mk->kode_dosen_2,
            'rawDosen1' => $mk->raw_dosen_1,
            'rawDosen2' => $mk->raw_dosen_2,
            'dosen1' => $d1 ? [
                'kode' => $d1->kode,
                'nama' => $d1->nama,
                'status' => $d1->status,
                'display' => "{$d1->kode} {$d1->nama}",
            ] : null,
            'dosen2' => $d2 ? [
                'kode' => $d2->kode,
                'nama' => $d2->nama,
                'status' => $d2->status,
                'display' => "{$d2->kode} {$d2->nama}",
            ] : null,
            'kebutuhanRuang' => $mk->kebutuhan_ruang,
            'statusAntrean' => $mk->status_antrean,
            'status' => $status,
            'isSplit' => $isSplit,
            'segments' => $formattedSegments,
            'hariDisplay' => $hariDisplay,
            'timeDisplay' => $timeDisplay,
            'ruangDisplay' => $ruangDisplay,
            'parkedReason' => $mk->parked_reason,
            'sourceFile' => $mk->source_file,
        ];
    }
}
