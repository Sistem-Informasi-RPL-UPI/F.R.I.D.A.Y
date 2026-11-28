<?php

namespace App\Modules\Academic\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Course extends Model
{
    protected $fillable = ['study_program_id', 'code', 'name', 'sks', 'semester_level', 'requires_lab'];

    protected function casts(): array
    {
        return [
            'sks' => 'integer',
            'semester_level' => 'integer',
            'requires_lab' => 'boolean',
        ];
    }

    public function studyProgram(): BelongsTo
    {
        return $this->belongsTo(StudyProgram::class);
    }
}
