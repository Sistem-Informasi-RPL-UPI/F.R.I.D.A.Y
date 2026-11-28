<?php

namespace App\Modules\Academic\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentClass extends Model
{
    protected $fillable = ['study_program_id', 'name', 'cohort_year', 'student_count'];

    protected function casts(): array
    {
        return [
            'cohort_year' => 'integer',
            'student_count' => 'integer',
        ];
    }

    public function studyProgram(): BelongsTo
    {
        return $this->belongsTo(StudyProgram::class);
    }
}
