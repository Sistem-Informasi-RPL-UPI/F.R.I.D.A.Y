<?php

namespace App\Modules\Scheduling\Services;

use App\Modules\Academic\Models\StudyProgram;
use App\Modules\Academic\Models\TimeSlot;
use App\Modules\Facilities\Models\Building;
use App\Modules\Facilities\Models\Room;
use App\Modules\Scheduling\Models\ScheduleRun;

class MindMappingService
{
    private const DAY_NAMES = [
        1 => 'Senin',
        2 => 'Selasa',
        3 => 'Rabu',
        4 => 'Kamis',
        5 => 'Jumat',
        6 => 'Sabtu',
    ];

    /**
     * Build campus-wide and per-building MAPPING matrix from an approved ScheduleRun.
     *
     * @return array<string, mixed>
     */
    public function buildMatrix(ScheduleRun $run, ?int $buildingId = null): array
    {
        $buildingsQuery = Building::query()->where('is_active', true)->orderBy('code');
        if ($buildingId !== null) {
            $buildingsQuery->whereKey($buildingId);
        }
        $buildings = $buildingsQuery->get();

        $roomsQuery = Room::query()
            ->with('building')
            ->where('is_schedulable', true)
            ->where('is_active', true)
            ->orderBy('building_id')
            ->orderBy('code');

        if ($buildingId !== null) {
            $roomsQuery->where('building_id', $buildingId);
        }
        $rooms = $roomsQuery->get();

        $slots = TimeSlot::query()
            ->where('is_active', true)
            ->orderBy('day_of_week')
            ->orderBy('slot_order')
            ->get();

        $entries = $run->entries()
            ->with([
                'requirement.course.studyProgram',
                'requirement.lecturer',
                'requirement.studentClass',
                'room.building',
                'timeSlot',
            ])
            ->when($buildingId !== null, function ($query) use ($buildingId): void {
                $query->whereHas('room', fn ($roomQuery) => $roomQuery->where('building_id', $buildingId));
            })
            ->get();

        $cells = [];
        foreach ($entries as $entry) {
            $req = $entry->requirement;
            $course = $req->course;
            $prodi = $course->studyProgram;

            for ($offset = 0; $offset < $entry->duration_slots; $offset++) {
                $slotOrder = $entry->timeSlot->slot_order + $offset;
                $key = "{$entry->day_of_week}:{$slotOrder}:{$entry->room_id}";
                $cells[$key] = [
                    'entry_id' => $entry->id,
                    'room_id' => $entry->room_id,
                    'building_id' => $entry->room->building_id,
                    'day_of_week' => $entry->day_of_week,
                    'slot_order' => $slotOrder,
                    'course_code' => $course->code,
                    'course_name' => $course->name,
                    'sks' => $course->sks,
                    'lecturer_name' => $req->lecturer->name,
                    'class_name' => $req->studentClass->name,
                    'study_program_code' => $prodi->code,
                    'study_program_name' => $prodi->name,
                    'color_hex' => $prodi->color_hex,
                    'is_continuation' => $offset > 0,
                ];
            }
        }

        $days = collect(self::DAY_NAMES)->map(fn (string $name, int $day) => [
            'day_of_week' => $day,
            'name' => $name,
        ])->values()->all();

        return [
            'schedule_run' => [
                'id' => $run->id,
                'status' => $run->status,
                'approved_at' => $run->approved_at?->toIso8601String(),
                'academic_period' => $run->academicPeriod?->name,
            ],
            'buildings' => $buildings->map(fn (Building $b) => [
                'id' => $b->id,
                'code' => $b->code,
                'name' => $b->name,
            ])->values()->all(),
            'rooms' => $rooms->map(fn (Room $r) => [
                'id' => $r->id,
                'building_id' => $r->building_id,
                'building_code' => $r->building->code,
                'code' => $r->code,
                'name' => $r->name,
                'capacity' => $r->capacity,
                'room_type' => $r->room_type,
            ])->values()->all(),
            'days' => $days,
            'time_slots' => $slots->map(fn (TimeSlot $s) => [
                'id' => $s->id,
                'day_of_week' => $s->day_of_week,
                'slot_order' => $s->slot_order,
                'label' => $s->label,
                'is_break' => $s->is_break,
            ])->values()->all(),
            'legend' => StudyProgram::query()->orderBy('code')->get(['id', 'code', 'name', 'color_hex'])->toArray(),
            'cells' => $cells,
        ];
    }
}
