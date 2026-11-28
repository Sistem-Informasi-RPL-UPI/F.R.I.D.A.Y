<?php

namespace App\Modules\Academic\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lecturer extends Model
{
    protected $fillable = [
        'user_id',
        'study_program_id',
        'nip',
        'name',
        'email',
        'preferred_days',
        'max_sks_per_day',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'preferred_days' => 'array',
            'max_sks_per_day' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function studyProgram(): BelongsTo
    {
        return $this->belongsTo(StudyProgram::class);
    }
}
