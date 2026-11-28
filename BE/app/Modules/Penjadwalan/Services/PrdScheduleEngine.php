<?php

namespace App\Modules\Penjadwalan\Services;

use App\Modules\Dosen\Models\Dosen;
use App\Modules\Dosen\Models\KetersediaanDosen;
use App\Modules\MataKuliah\Models\JadwalSegmen;
use App\Modules\MataKuliah\Models\MataKuliah;
use App\Modules\Penjadwalan\Models\PengaturanWaktu;
use App\Modules\Ruangan\Models\Ruangan;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PrdScheduleEngine
{
    /**
     * Validates candidate segment(s) for a course against all active courses in the schedule.
     *
     * @param  array<int, array{day: string, room: int, pos: int, len: int}>  $candidateSegments
     * @return array{valid: bool, reason: string|null, requiresSplitConfirm?: bool, splitProposal?: array<int, array{day: string, room: int, pos: int, len: int}>}
     */
    public function validateCoursePlacement(
        MataKuliah $course,
        array $candidateSegments,
        bool $strictConflict = true,
        ?int $ignoreCourseId = null,
        ?PengaturanWaktu $settings = null
    ): array {
        $settings ??= PengaturanWaktu::current();
        $lecturers = Dosen::query()->with('ketersediaan')->get()->keyBy('kode');
        $rooms = Ruangan::query()->get()->keyBy('id');

        if ($candidateSegments === []) {
            return ['valid' => true, 'reason' => null];
        }

        // Check if a single segment crosses the break (Pos 6 -> Pos 7)
        if (count($candidateSegments) === 1) {
            $seg = $candidateSegments[0];
            $pos = (int) $seg['pos'];
            $len = (int) $seg['len'];
            $endPos = $pos + $len - 1;

            if ($pos <= TimeSlotCalculator::MORNING_MAX_POS && $endPos > TimeSlotCalculator::MORNING_MAX_POS) {
                $len1 = TimeSlotCalculator::MORNING_MAX_POS - $pos + 1;
                $len2 = $len - $len1;
                $proposal = [
                    ['day' => mb_strtoupper($seg['day']), 'room' => (int) $seg['room'], 'pos' => $pos, 'len' => $len1],
                    ['day' => mb_strtoupper($seg['day']), 'room' => (int) $seg['room'], 'pos' => TimeSlotCalculator::MORNING_MAX_POS + 1, 'len' => $len2],
                ];

                $splitCheck = $this->validateCoursePlacement($course, $proposal, $strictConflict, $ignoreCourseId, $settings);
                if (! $splitCheck['valid']) {
                    return $splitCheck;
                }

                return [
                    'valid' => false,
                    'requiresSplitConfirm' => true,
                    'splitProposal' => $proposal,
                    'reason' => "Mata kuliah ini ({$len} SKS) akan menabrak jam istirahat. Pecah menjadi {$len1} SKS sebelum istirahat dan {$len2} SKS sesudah istirahat?",
                ];
            }
        }

        // Rule: if 2 segments (split across break), must be on the same day and room, seg 1 ends at Pos 6 and seg 2 starts at Pos 7
        if (count($candidateSegments) === 2) {
            $s1 = $candidateSegments[0];
            $s2 = $candidateSegments[1];
            if (mb_strtoupper($s1['day']) !== mb_strtoupper($s2['day']) || (int) $s1['room'] !== (int) $s2['room']) {
                return [
                    'valid' => false,
                    'reason' => 'Kedua segmen mata kuliah terpecah harus berada pada hari dan ruangan yang sama.',
                ];
            }
            if (((int) $s1['pos'] + (int) $s1['len'] - 1) !== TimeSlotCalculator::MORNING_MAX_POS || (int) $s2['pos'] !== TimeSlotCalculator::MORNING_MAX_POS + 1) {
                return [
                    'valid' => false,
                    'reason' => 'Pemecahan mata kuliah hanya diizinkan tepat mengapit jam istirahat (berakhir di Pos 6 dan lanjut di Pos 7).',
                ];
            }
        }

        // Load all other scheduled segments
        $otherCourses = MataKuliah::query()
            ->with('segments')
            ->where('id', '!=', $course->id)
            ->when($ignoreCourseId !== null, fn ($q) => $q->where('id', '!=', $ignoreCourseId))
            ->get();

        foreach ($candidateSegments as $seg) {
            $day = mb_strtoupper(trim((string) $seg['day']));
            $roomId = (int) $seg['room'];
            $pos = (int) $seg['pos'];
            $len = (int) $seg['len'];
            $endPos = $pos + $len - 1;

            if (! in_array($day, TimeSlotCalculator::DAYS, true)) {
                return ['valid' => false, 'reason' => "Hari {$day} tidak valid."];
            }

            if ($roomId < 1 || $roomId > 37) {
                return ['valid' => false, 'reason' => "Nomor ruangan {$roomId} di luar rentang 1–37."];
            }

            if ($pos < 1 || $len < 1 || $endPos > TimeSlotCalculator::TOTAL_POS) {
                return [
                    'valid' => false,
                    'reason' => "Sisa slot waktu pada sesi siang tidak cukup untuk {$len} SKS (melebihi Pos ".TimeSlotCalculator::TOTAL_POS.').',
                ];
            }

            if ($pos <= TimeSlotCalculator::MORNING_MAX_POS && $endPos > TimeSlotCalculator::MORNING_MAX_POS) {
                return [
                    'valid' => false,
                    'reason' => 'Rentang SKS menabrak jam istirahat tanpa konfirmasi pemecahan segmen.',
                ];
            }

            // Check lecturer availability window (day & time)
            if ($strictConflict) {
                $timeRange = TimeSlotCalculator::getSegmentTimeRange($day, $pos, $len, $settings);
                $segStartMin = TimeSlotCalculator::timeToMinutes($timeRange['startTime']);
                $segEndMin = TimeSlotCalculator::timeToMinutes($timeRange['endTime']);

                foreach ([$course->kode_dosen_1, $course->kode_dosen_2] as $kodeDosen) {
                    if ($kodeDosen === null || $kodeDosen === '') {
                        continue;
                    }
                    $dosen = $lecturers->get($kodeDosen);
                    $k = $dosen?->ketersediaan;
                    $allowedDays = $k?->hari ?? KetersediaanDosen::DEFAULT_DAYS;
                    $allowedStart = TimeSlotCalculator::timeToMinutes($k?->start_time ?? KetersediaanDosen::DEFAULT_START_TIME);
                    $allowedEnd = TimeSlotCalculator::timeToMinutes($k?->end_time ?? KetersediaanDosen::DEFAULT_END_TIME);

                    if (! in_array($day, $allowedDays, true)) {
                        $nama = $dosen?->nama ?? $kodeDosen;

                        return [
                            'valid' => false,
                            'reason' => "Dosen {$kodeDosen} ({$nama}) tidak bersedia mengajar pada hari {$day}.",
                        ];
                    }

                    if ($segStartMin < $allowedStart || $segEndMin > $allowedEnd) {
                        $nama = $dosen?->nama ?? $kodeDosen;
                        $jamDosen = ($k?->start_time ?? '07:00').'–'.($k?->end_time ?? '18:00');

                        return [
                            'valid' => false,
                            'reason' => "Jam slot ({$timeRange['label']}) berada di luar jam ketersediaan Dosen {$kodeDosen} ({$nama}: {$jamDosen}).",
                        ];
                    }
                }
            }

            // Check collisions with other courses
            foreach ($otherCourses as $other) {
                foreach ($other->segments as $otherSeg) {
                    if ($otherSeg->hari !== $day) {
                        continue;
                    }

                    $otherStart = (int) $otherSeg->pos_awal;
                    $otherEnd = $otherStart + (int) $otherSeg->panjang - 1;
                    $overlapsPos = max($pos, $otherStart) <= min($endPos, $otherEnd);

                    if (! $overlapsPos) {
                        continue;
                    }

                    $overlapSlot = max($pos, $otherStart);

                    // 1. Room conflict (always enforced)
                    if ((int) $otherSeg->ruangan_id === $roomId) {
                        $roomKode = $rooms->get($roomId)?->kode ?? "Ruang {$roomId}";

                        return [
                            'valid' => false,
                            'reason' => "Bentrok ruangan {$roomKode} pada hari {$day} Pos {$overlapSlot} dengan MK {$other->kode} ({$other->prodi} {$other->semester}{$other->kelas}).",
                        ];
                    }

                    if (! $strictConflict) {
                        continue;
                    }

                    // 2. Lecturer conflict
                    $myLecturers = array_values(array_filter([$course->kode_dosen_1, $course->kode_dosen_2]));
                    $otherLecturers = array_values(array_filter([$other->kode_dosen_1, $other->kode_dosen_2]));
                    $sharedLecturers = array_values(array_intersect($myLecturers, $otherLecturers));

                    if ($sharedLecturers !== []) {
                        $conflictCode = $sharedLecturers[0];
                        $conflictName = $lecturers->get($conflictCode)?->nama ?? $conflictCode;
                        $otherRoomKode = $rooms->get($otherSeg->ruangan_id)?->kode ?? "Ruang {$otherSeg->ruangan_id}";

                        return [
                            'valid' => false,
                            'reason' => "Bentrok dosen {$conflictCode} ({$conflictName}) pada hari {$day} Pos {$overlapSlot} dengan MK {$other->kode} di {$otherRoomKode}.",
                        ];
                    }

                    // 3. Student Cohort conflict (Prodi|Semester|Kelas)
                    $myCohort = "{$course->prodi}|{$course->semester}|{$course->kelas}";
                    $otherCohort = "{$other->prodi}|{$other->semester}|{$other->kelas}";

                    if ($myCohort === $otherCohort) {
                        $otherRoomKode = $rooms->get($otherSeg->ruangan_id)?->kode ?? "Ruang {$otherSeg->ruangan_id}";

                        return [
                            'valid' => false,
                            'reason' => "Bentrok kelompok mahasiswa ({$course->prodi} Semester {$course->semester} Kelas {$course->kelas}) pada hari {$day} Pos {$overlapSlot} dengan MK {$other->kode} di {$otherRoomKode}.",
                        ];
                    }
                }
            }
        }

        return ['valid' => true, 'reason' => null];
    }

    /**
     * Generates initial conflict-free schedule with soft-constraint load balancing (PRD Section 6.4).
     *
     * @return array<string, mixed>
     */
    public function generate(): array
    {
        Ruangan::ensureSeeded();
        $settings = PengaturanWaktu::current();
        $lecturers = Dosen::query()->with('ketersediaan')->get()->keyBy('kode');

        $allCourses = MataKuliah::query()
            ->where('status_antrean', 'ready')
            ->get();

        // Total SKS per lecturer for FR-G3 priority sorting
        $lecturerTotalSks = [];
        foreach ($allCourses as $mk) {
            if ($mk->kebutuhan_ruang === 'Online' || (int) $mk->sks === 0) {
                continue;
            }
            foreach ([$mk->kode_dosen_1, $mk->kode_dosen_2] as $code) {
                if ($code !== null && $code !== '') {
                    $lecturerTotalSks[$code] = ($lecturerTotalSks[$code] ?? 0) + (int) $mk->sks;
                }
            }
        }

        // Precompute start/end minutes for each day and pos
        $daySlotTimes = [];
        foreach (TimeSlotCalculator::DAYS as $day) {
            foreach (TimeSlotCalculator::buildDaySlots($day, $settings) as $slot) {
                if (! $slot['isBreak'] && $slot['pos'] !== null) {
                    $daySlotTimes[$day][$slot['pos']] = [
                        'start' => TimeSlotCalculator::timeToMinutes($slot['startTime']),
                        'end' => TimeSlotCalculator::timeToMinutes($slot['endTime']),
                    ];
                }
            }
        }

        $onlineCount = 0;
        $zeroSksCount = 0;
        $stage1 = [];
        $stage2 = [];

        foreach ($allCourses as $mk) {
            if ($mk->kebutuhan_ruang === 'Online') {
                $onlineCount++;

                continue;
            }
            if ((int) $mk->sks === 0) {
                $zeroSksCount++;

                continue;
            }

            if ($mk->kebutuhan_ruang === 'Laboratorium Praktikum') {
                $stage2[] = $mk;
            } else {
                $stage1[] = $mk;
            }
        }

        $prioritySorter = function (MataKuliah $a, MataKuliah $b) use ($lecturers, $lecturerTotalSks): int {
            // 1. Dosen jadwal khusus first
            $aCustom = $this->hasCustomSchedule($a, $lecturers) ? 1 : 0;
            $bCustom = $this->hasCustomSchedule($b, $lecturers) ? 1 : 0;
            if ($aCustom !== $bCustom) {
                return $bCustom <=> $aCustom;
            }

            // 2. SKS terbesar
            if ((int) $a->sks !== (int) $b->sks) {
                return (int) $b->sks <=> (int) $a->sks;
            }

            // 3. Total SKS dosen terbanyak
            $aLecSks = ($lecturerTotalSks[$a->kode_dosen_1 ?? ''] ?? 0) + ($lecturerTotalSks[$a->kode_dosen_2 ?? ''] ?? 0);
            $bLecSks = ($lecturerTotalSks[$b->kode_dosen_1 ?? ''] ?? 0) + ($lecturerTotalSks[$b->kode_dosen_2 ?? ''] ?? 0);
            if ($aLecSks !== $bLecSks) {
                return $bLecSks <=> $aLecSks;
            }

            // 4. Team Teaching first
            $aTeam = $a->kode_dosen_2 !== null ? 1 : 0;
            $bTeam = $b->kode_dosen_2 !== null ? 1 : 0;
            if ($aTeam !== $bTeam) {
                return $bTeam <=> $aTeam;
            }

            return $a->id <=> $b->id;
        };

        usort($stage1, $prioritySorter);
        usort($stage2, $prioritySorter);

        // Occupancy trackers in memory for fast generation
        $roomBusy = [];     // [$day][$room][$pos] = true
        $lecturerBusy = []; // [$code][$day][$pos] = true
        $cohortBusy = [];   // [$cohort][$day][$pos] = true

        // Soft constraint trackers (FR-G7, FR-G8, FR-G9)
        $lecturerDailySks = []; // [$code][$day] = int
        $lecturerRoomUses = []; // [$code][$room] = int
        $matrixDailySks = [
            'SENIN' => 0,
            'SELASA' => 0,
            'RABU' => 0,
            'KAMIS' => 0,
            'JUMAT' => 0,
            'SABTU' => 0,
        ];

        $placements = []; // [$mkId => ['day' => ..., 'room' => ..., 'pos' => ..., 'len' => ...]]
        $parkedReasons = [];
        $overflowCount = 0;

        foreach ($allCourses as $mk) {
            if ($mk->kebutuhan_ruang === 'Online') {
                $parkedReasons[$mk->id] = 'Mata kuliah Online/Daring';
            } elseif ((int) $mk->sks === 0) {
                $parkedReasons[$mk->id] = 'Mata kuliah 0 SKS';
            }
        }

        // Candidate start positions that never cross break (Pos 1..6 and Pos 7..12)
        $maxAutoPos = 12;

        foreach (array_merge($stage1, $stage2) as $mk) {
            $sks = (int) $mk->sks;
            $cohort = "{$mk->prodi}|{$mk->semester}|{$mk->kelas}";
            $codes = array_values(array_filter([$mk->kode_dosen_1, $mk->kode_dosen_2]));

            // Allowed days intersection for lecturer 1 & 2
            $allowedDays = $this->getAllowedDaysIntersection($codes, $lecturers);
            $timeWindow = $this->getAllowedTimeIntersection($codes, $lecturers);

            if ($allowedDays === [] || $timeWindow['start'] >= $timeWindow['end']) {
                $parkedReasons[$mk->id] = 'Irisan hari/jam mengajar Dosen 1 dan Dosen 2 kosong.';
                $overflowCount++;

                continue;
            }

            $bestCandidate = null;
            $bestScore = null;

            foreach ($allowedDays as $day) {
                for ($pos = 1; $pos <= $maxAutoPos; $pos++) {
                    $endPos = $pos + $sks - 1;

                    // FR-G4: Never split across break (Pos 1..6 or Pos 7..12)
                    if ($pos <= TimeSlotCalculator::MORNING_MAX_POS && $endPos > TimeSlotCalculator::MORNING_MAX_POS) {
                        continue;
                    }
                    if ($endPos > $maxAutoPos) {
                        continue;
                    }

                    // Check time window against lecturer allowed hours
                    $slotStart = $daySlotTimes[$day][$pos]['start'] ?? 0;
                    $slotEnd = $daySlotTimes[$day][$endPos]['end'] ?? 9999;
                    if ($slotStart < $timeWindow['start'] || $slotEnd > $timeWindow['end']) {
                        continue;
                    }

                    // Check cohort & lecturer availability across [$pos..$endPos]
                    $conflict = false;
                    for ($p = $pos; $p <= $endPos; $p++) {
                        if (! empty($cohortBusy[$cohort][$day][$p])) {
                            $conflict = true;
                            break;
                        }
                        foreach ($codes as $code) {
                            if (! empty($lecturerBusy[$code][$day][$p])) {
                                $conflict = true;
                                break 2;
                            }
                        }
                    }

                    if ($conflict) {
                        continue;
                    }

                    // FR-G2: Rooms 1..22 only (Rooms 23..37 are left empty)
                    for ($room = 1; $room <= 22; $room++) {
                        $roomOccupied = false;
                        for ($p = $pos; $p <= $endPos; $p++) {
                            if (! empty($roomBusy[$day][$room][$p])) {
                                $roomOccupied = true;
                                break;
                            }
                        }

                        if ($roomOccupied) {
                            continue;
                        }

                        // Compute soft-constraint score tuple (lower is better):
                        // 1. FR-G8: Max daily SKS of assigned lecturer(s) on this day BEFORE adding this course
                        $lecDaySks = 0;
                        foreach ($codes as $code) {
                            $lecDaySks = max($lecDaySks, $lecturerDailySks[$code][$day] ?? 0);
                        }

                        // 2. FR-G9: Total SKS of the entire matrix on this day
                        $matDaySks = $matrixDailySks[$day] ?? 0;

                        // 3. FR-G7: How many times assigned lecturer(s) have already used this room (0 is best!)
                        $roomUseCount = 0;
                        foreach ($codes as $code) {
                            $roomUseCount += ($lecturerRoomUses[$code][$room] ?? 0);
                        }

                        // 4. FR-G10: Earliest Pos, then room number
                        $scoreTuple = [$lecDaySks, $matDaySks, $roomUseCount, $pos, $room];

                        if ($bestScore === null || $this->compareTuples($scoreTuple, $bestScore) < 0) {
                            $bestScore = $scoreTuple;
                            $bestCandidate = [
                                'day' => $day,
                                'room' => $room,
                                'pos' => $pos,
                                'len' => $sks,
                            ];
                        }
                    }
                }
            }

            if ($bestCandidate === null) {
                $parkedReasons[$mk->id] = 'Tidak ada slot Ruang 1–22 yang bebas bentrok pada jam ketersediaan dosen.';
                $overflowCount++;

                continue;
            }

            $placements[$mk->id] = $bestCandidate;
            $bDay = $bestCandidate['day'];
            $bRoom = $bestCandidate['room'];
            $bPos = $bestCandidate['pos'];
            $bEnd = $bPos + $sks - 1;

            for ($p = $bPos; $p <= $bEnd; $p++) {
                $roomBusy[$bDay][$bRoom][$p] = true;
                $cohortBusy[$cohort][$bDay][$p] = true;
                foreach ($codes as $code) {
                    $lecturerBusy[$code][$bDay][$p] = true;
                }
            }

            $matrixDailySks[$bDay] = ($matrixDailySks[$bDay] ?? 0) + $sks;
            foreach ($codes as $code) {
                $lecturerDailySks[$code][$bDay] = ($lecturerDailySks[$code][$bDay] ?? 0) + $sks;
                $lecturerRoomUses[$code][$bRoom] = ($lecturerRoomUses[$code][$bRoom] ?? 0) + 1;
            }
        }

        // Persist inside a DB transaction
        DB::transaction(function () use ($allCourses, $placements, $parkedReasons): void {
            JadwalSegmen::query()->delete();

            foreach ($allCourses as $mk) {
                if (isset($placements[$mk->id])) {
                    $pl = $placements[$mk->id];
                    $mk->update(['parked_reason' => null]);
                    JadwalSegmen::query()->create([
                        'mata_kuliah_id' => $mk->id,
                        'segmen_ke' => 1,
                        'hari' => $pl['day'],
                        'ruangan_id' => $pl['room'],
                        'pos_awal' => $pl['pos'],
                        'panjang' => $pl['len'],
                    ]);
                } else {
                    $mk->update([
                        'parked_reason' => $parkedReasons[$mk->id] ?? 'Belum terjadwal',
                    ]);
                }
            }
        });

        // Build audit report (FR-G6 & FR-G11)
        $audit = $this->buildAuditReport(
            count($placements),
            $onlineCount,
            $zeroSksCount,
            $overflowCount,
            $lecturers,
            $lecturerDailySks,
            $lecturerRoomUses,
            $matrixDailySks
        );

        $settings->update(['last_audit' => $audit]);

        return $audit;
    }

    /**
     * @param  Collection<string, Dosen>  $lecturers
     * @param  array<string, array<string, int>>  $lecturerDailySks
     * @param  array<string, array<int, int>>  $lecturerRoomUses
     * @param  array<string, int>  $matrixDailySks
     * @return array<string, mixed>
     */
    private function buildAuditReport(
        int $scheduledCount,
        int $onlineCount,
        int $zeroSksCount,
        int $overflowCount,
        Collection $lecturers,
        array $lecturerDailySks,
        array $lecturerRoomUses,
        array $matrixDailySks
    ): array {
        $lecturerDiffs = [];
        $maxDiffOverall = 0;
        $singleRoomLecturersCount = 0;
        $balancingNotes = [];

        foreach ($lecturerDailySks as $code => $byDay) {
            $dosen = $lecturers->get($code);
            $allowedDays = $dosen?->ketersediaan?->hari ?? KetersediaanDosen::DEFAULT_DAYS;

            $dailyValues = [];
            foreach ($allowedDays as $d) {
                $dailyValues[$d] = (int) ($byDay[$d] ?? 0);
            }

            $maxSks = $dailyValues !== [] ? max($dailyValues) : 0;
            $minSks = $dailyValues !== [] ? min($dailyValues) : 0;
            $diff = $maxSks - $minSks;
            $maxDiffOverall = max($maxDiffOverall, $diff);

            $roomUses = $lecturerRoomUses[$code] ?? [];
            $totalClasses = array_sum($roomUses);
            $distinctRooms = count($roomUses);

            if ($totalClasses >= 2 && $distinctRooms === 1) {
                $singleRoomLecturersCount++;
            }

            $note = null;
            if ($diff > 2) {
                if (count($allowedDays) <= 1) {
                    $note = 'Dosen hanya mengizinkan 1 hari mengajar.';
                } else {
                    $note = 'Dipengaruhi ukuran SKS mata kuliah atau keterbatasan slot bebas bentrok cohort.';
                }
                $balancingNotes[] = [
                    'kodeDosen' => $code,
                    'namaDosen' => $dosen?->nama ?? $code,
                    'selisihSksHarian' => $diff,
                    'alasan' => $note,
                ];
            }

            $lecturerDiffs[] = [
                'kodeDosen' => $code,
                'namaDosen' => $dosen?->nama ?? $code,
                'maxDailySks' => $maxSks,
                'minDailySks' => $minSks,
                'selisihSksHarian' => $diff,
                'totalKelasTerjadwal' => $totalClasses,
                'jumlahRuangBerbeda' => $distinctRooms,
                'catatan' => $note,
            ];
        }

        return [
            'scheduled_count' => $scheduledCount,
            'parked_count' => $onlineCount + $zeroSksCount + $overflowCount,
            'parked_breakdown' => [
                'online' => $onlineCount,
                'zero_sks' => $zeroSksCount,
                'overflow' => $overflowCount,
            ],
            'conflicts_count' => 0,
            'max_daily_sks_diff' => $maxDiffOverall,
            'single_room_lecturers_count' => $singleRoomLecturersCount,
            'matrix_daily_sks' => $matrixDailySks,
            'lecturer_metrics' => $lecturerDiffs,
            'balancing_notes' => $balancingNotes,
            'generated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * @param  Collection<string, Dosen>  $lecturers
     */
    private function hasCustomSchedule(MataKuliah $mk, Collection $lecturers): bool
    {
        foreach ([$mk->kode_dosen_1, $mk->kode_dosen_2] as $code) {
            if ($code !== null && $lecturers->get($code)?->ketersediaan?->is_custom) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<int, string>  $codes
     * @param  Collection<string, Dosen>  $lecturers
     * @return array<int, string>
     */
    private function getAllowedDaysIntersection(array $codes, Collection $lecturers): array
    {
        $days = KetersediaanDosen::DEFAULT_DAYS;
        $first = true;

        foreach ($codes as $code) {
            $k = $lecturers->get($code)?->ketersediaan;
            $lecDays = $k?->hari ?? KetersediaanDosen::DEFAULT_DAYS;
            if ($first) {
                $days = $lecDays;
                $first = false;
            } else {
                $days = array_values(array_intersect($days, $lecDays));
            }
        }

        return $days;
    }

    /**
     * @param  array<int, string>  $codes
     * @param  Collection<string, Dosen>  $lecturers
     * @return array{start: int, end: int}
     */
    private function getAllowedTimeIntersection(array $codes, Collection $lecturers): array
    {
        $start = TimeSlotCalculator::timeToMinutes(KetersediaanDosen::DEFAULT_START_TIME);
        $end = TimeSlotCalculator::timeToMinutes(KetersediaanDosen::DEFAULT_END_TIME);

        foreach ($codes as $code) {
            $k = $lecturers->get($code)?->ketersediaan;
            $s = TimeSlotCalculator::timeToMinutes($k?->start_time ?? KetersediaanDosen::DEFAULT_START_TIME);
            $e = TimeSlotCalculator::timeToMinutes($k?->end_time ?? KetersediaanDosen::DEFAULT_END_TIME);
            $start = max($start, $s);
            $end = min($end, $e);
        }

        return ['start' => $start, 'end' => $end];
    }

    /**
     * @param  array<int, int>  $a
     * @param  array<int, int>  $b
     */
    private function compareTuples(array $a, array $b): int
    {
        $count = min(count($a), count($b));
        for ($i = 0; $i < $count; $i++) {
            if ($a[$i] !== $b[$i]) {
                return $a[$i] <=> $b[$i];
            }
        }

        return 0;
    }
}
