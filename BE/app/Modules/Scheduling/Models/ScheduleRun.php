<?php

namespace App\Modules\Scheduling\Models;

use App\Models\User;
use App\Modules\Academic\Models\AcademicPeriod;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScheduleRun extends Model
{
    protected $fillable = [
        'academic_period_id',
        'generated_by',
        'status',
        'hard_conflicts_count',
        'soft_score',
        'summary',
        'approved_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'hard_conflicts_count' => 'integer',
            'soft_score' => 'float',
            'summary' => 'array',
            'approved_at' => 'datetime',
        ];
    }

    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function generator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function entries(): HasMany
    {
        return $this->hasMany(ScheduleEntry::class);
    }
}
