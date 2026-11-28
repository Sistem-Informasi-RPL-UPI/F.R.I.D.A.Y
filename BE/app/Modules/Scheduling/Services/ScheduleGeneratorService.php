<?php

namespace App\Modules\Scheduling\Services;

use App\Modules\Academic\Models\TimeSlot;
use App\Modules\Facilities\Models\Room;
use App\Modules\Scheduling\Models\ScheduleEntry;
use App\Modules\Scheduling\Models\ScheduleRequirement;
use App\Modules\Scheduling\Models\ScheduleRun;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ScheduleGeneratorService
{
    public function __construct(
        private readonly ScheduleValidatorService $validator,
    ) {}

    public function generate(int $academicPeriodId, int $generatedByUserId): ScheduleRun
    {
        $requirements = ScheduleRequirement::query()
            ->with(['course', 'lecturer', 'studentClass'])
            ->where('academic_period_id', $academicPeriodId)
            ->orderByDesc('required_capacity')
            ->get();

        $rooms = Room::query()
            ->where('is_schedulable', true)
            ->where('is_active', true)
            ->orderBy('capacity')
            ->get();

        $slotsByDay = TimeSlot::query()
            ->where('is_active', true)
            ->where('is_break', false)
            ->orderBy('day_of_week')
            ->orderBy('slot_order')
            ->get()
            ->groupBy('day_of_week');

        return DB::transaction(function () use ($academicPeriodId, $generatedByUserId, $requirements, $rooms, $slotsByDay): ScheduleRun {
            $run = ScheduleRun::query()->create([
                'academic_period_id' => $academicPeriodId,
                'generated_by' => $generatedByUserId,
                'status' => 'draft',
            ]);

            $busyRooms = [];
            $busyLecturers = [];
            $busyClasses = [];

            foreach ($requirements as $req) {
                for ($session = 0; $session < $req->sessions_per_week; $session++) {
                    $placed = $this->findPlacement(
                        $req,
                        $rooms,
                        $slotsByDay,
                        $busyRooms,
                        $busyLecturers,
                        $busyClasses,
                    );

                    if ($placed === null) {
                        continue;
                    }

                    [$room, $slot, $day] = $placed;

                    ScheduleEntry::query()->create([
                        'schedule_run_id' => $run->id,
                        'schedule_requirement_id' => $req->id,
                        'room_id' => $room->id,
                        'time_slot_id' => $slot->id,
                        'day_of_week' => $day,
                        'duration_slots' => $req->duration_slots,
                    ]);

                    for ($offset = 0; $offset < $req->duration_slots; $offset++) {
                        $order = $slot->slot_order + $offset;
                        $busyRooms["{$room->id}:{$day}:{$order}"] = true;
                        $busyLecturers["{$req->lecturer_id}:{$day}:{$order}"] = true;
                        $busyClasses["{$req->student_class_id}:{$day}:{$order}"] = true;
                    }
                }
            }

            $this->validator->validate($run);

            return $run->fresh(['academicPeriod', 'entries']);
        });
    }

    /**
     * @param  Collection<int, Room>  $rooms
     * @param  Collection<int, Collection<int, TimeSlot>>  $slotsByDay
     * @param  array<string, bool>  $busyRooms
     * @param  array<string, bool>  $busyLecturers
     * @param  array<string, bool>  $busyClasses
     * @return array{0: Room, 1: TimeSlot, 2: int}|null
     */
    private function findPlacement(
        ScheduleRequirement $req,
        $rooms,
        $slotsByDay,
        array $busyRooms,
        array $busyLecturers,
        array $busyClasses,
    ): ?array {
        $preferredDays = $req->lecturer->preferred_days ?? [];
        $days = $slotsByDay->keys()->sortBy(
            fn (int $day) => in_array($day, is_array($preferredDays) ? $preferredDays : [], true) ? 0 : $day,
        );

        $eligibleRooms = $rooms->filter(function (Room $room) use ($req): bool {
            if ($room->capacity < $req->required_capacity) {
                return false;
            }
            if ($req->course->requires_lab && $room->room_type !== 'lab') {
                return false;
            }

            return true;
        });

        foreach ($days as $day) {
            $daySlots = $slotsByDay->get($day)->values();
            $slotCount = $daySlots->count();

            for ($i = 0; $i <= $slotCount - $req->duration_slots; $i++) {
                $firstSlot = $daySlots[$i];
                $contiguous = true;

                for ($offset = 0; $offset < $req->duration_slots; $offset++) {
                    $order = $firstSlot->slot_order + $offset;
                    if (
                        ($daySlots[$i + $offset]->slot_order ?? -1) !== $order
                        || isset($busyLecturers["{$req->lecturer_id}:{$day}:{$order}"])
                        || isset($busyClasses["{$req->student_class_id}:{$day}:{$order}"])
                    ) {
                        $contiguous = false;
                        break;
                    }
                }

                if (! $contiguous) {
                    continue;
                }

                foreach ($eligibleRooms as $room) {
                    $roomFree = true;
                    for ($offset = 0; $offset < $req->duration_slots; $offset++) {
                        $order = $firstSlot->slot_order + $offset;
                        if (isset($busyRooms["{$room->id}:{$day}:{$order}"])) {
                            $roomFree = false;
                            break;
                        }
                    }

                    if ($roomFree) {
                        return [$room, $firstSlot, (int) $day];
                    }
                }
            }
        }

        return null;
    }
}
