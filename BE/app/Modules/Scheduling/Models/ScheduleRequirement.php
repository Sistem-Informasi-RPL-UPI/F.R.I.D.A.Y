<?php

namespace App\Modules\Scheduling\Models;

use App\Modules\Academic\Models\AcademicPeriod;
use App\Modules\Academic\Models\Course;
use App\Modules\Academic\Models\Lecturer;
use App\Modules\Academic\Models\StudentClass;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduleRequirement extends Model
{
    protected $fillable = [
        'academic_period_id',
        'course_id',
        'lecturer_id',
        'student_class_id',
        'preferred_room_type',
        'required_capacity',
        'sessions_per_week',
        'duration_slots',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'required_capacity' => 'integer',
            'sessions_per_week' => 'integer',
            'duration_slots' => 'integer',
        ];
    }

    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lecturer(): BelongsTo
    {
        return $this->belongsTo(Lecturer::class);
    }

    public function studentClass(): BelongsTo
    {
        return $this->belongsTo(StudentClass::class);
    }
}
