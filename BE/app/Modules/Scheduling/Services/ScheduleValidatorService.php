<?php

namespace App\Modules\Scheduling\Services;

use App\Modules\Scheduling\Models\ScheduleRun;

class ScheduleValidatorService
{
    /**
     * Evaluate Hard Constraints (blocking) and Soft Constraints (quality score)
     * for a given schedule run and persist the validation metrics.
     *
     * @return array{hard_conflicts: int, soft_score: float, details: array<int, array<string, mixed>>}
     */
    public function validate(ScheduleRun $run): array
    {
        $entries = $run->entries()
            ->with(['requirement.course', 'requirement.lecturer', 'requirement.studentClass', 'room', 'timeSlot'])
            ->get();

        $hardConflicts = 0;
        $softMatches = 0;
        $softChecks = 0;
        $details = [];

        $roomSlots = [];
        $lecturerSlots = [];
        $classSlots = [];
        $lecturerDailySks = [];

        foreach ($entries as $entry) {
            $flags = [];
            $req = $entry->requirement;
            $room = $entry->room;
            $slot = $entry->timeSlot;
            $day = $entry->day_of_week;

            if ($room->capacity < $req->required_capacity) {
                $flags[] = 'ROOM_CAPACITY_EXCEEDED';
            }
            if ($req->course->requires_lab && $room->room_type !== 'lab') {
                $flags[] = 'ROOM_TYPE_MISMATCH';
            }

            $startOrder = $slot->slot_order;
            $endOrder = $startOrder + max(1, $entry->duration_slots) - 1;

            for ($order = $startOrder; $order <= $endOrder; $order++) {
                $roomKey = "{$room->id}:{$day}:{$order}";
                $lecKey = "{$req->lecturer_id}:{$day}:{$order}";
                $clsKey = "{$req->student_class_id}:{$day}:{$order}";

                if (isset($roomSlots[$roomKey])) {
                    $flags[] = 'ROOM_CONFLICT';
                }
                if (isset($lecturerSlots[$lecKey])) {
                    $flags[] = 'LECTURER_CONFLICT';
                }
                if (isset($classSlots[$clsKey])) {
                    $flags[] = 'CLASS_CONFLICT';
                }

                $roomSlots[$roomKey] = $entry->id;
                $lecturerSlots[$lecKey] = $entry->id;
                $classSlots[$clsKey] = $entry->id;
            }

            $flags = array_values(array_unique($flags));
            if ($flags !== []) {
                $hardConflicts += count($flags);
                $details[] = [
                    'entry_id' => $entry->id,
                    'course' => $req->course->code,
                    'flags' => $flags,
                ];
            }

            $entry->update(['conflict_flags' => $flags]);

            // Soft Constraint 1: Lecturer preferred days
            $preferredDays = $req->lecturer->preferred_days ?? [];
            if (is_array($preferredDays) && $preferredDays !== []) {
                $softChecks++;
                if (in_array($day, $preferredDays, true)) {
                    $softMatches++;
                }
            }

            // Soft Constraint 2: Lecturer max SKS per day
            $dailyKey = "{$req->lecturer_id}:{$day}";
            $lecturerDailySks[$dailyKey] = ($lecturerDailySks[$dailyKey] ?? 0) + $req->course->sks;
            $softChecks++;
            if ($lecturerDailySks[$dailyKey] <= $req->lecturer->max_sks_per_day) {
                $softMatches++;
            }
        }

        $softScore = $softChecks > 0 ? round(($softMatches / $softChecks) * 100, 2) : 100.0;

        $run->update([
            'status' => $run->status === 'approved' ? 'approved' : 'validated',
            'hard_conflicts_count' => $hardConflicts,
            'soft_score' => $softScore,
            'summary' => [
                'total_entries' => $entries->count(),
                'hard_conflicts' => $hardConflicts,
                'soft_score' => $softScore,
                'conflict_details' => $details,
            ],
        ]);

        return [
            'hard_conflicts' => $hardConflicts,
            'soft_score' => $softScore,
            'details' => $details,
        ];
    }
}
