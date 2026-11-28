<?php

namespace App\Modules\Scheduling\Models;

use App\Modules\Academic\Models\TimeSlot;
use App\Modules\Facilities\Models\Room;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduleEntry extends Model
{
    protected $fillable = [
        'schedule_run_id',
        'schedule_requirement_id',
        'room_id',
        'time_slot_id',
        'day_of_week',
        'duration_slots',
        'is_locked',
        'conflict_flags',
    ];

    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
            'duration_slots' => 'integer',
            'is_locked' => 'boolean',
            'conflict_flags' => 'array',
        ];
    }

    public function scheduleRun(): BelongsTo
    {
        return $this->belongsTo(ScheduleRun::class);
    }

    public function requirement(): BelongsTo
    {
        return $this->belongsTo(ScheduleRequirement::class, 'schedule_requirement_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function timeSlot(): BelongsTo
    {
        return $this->belongsTo(TimeSlot::class);
    }
}
