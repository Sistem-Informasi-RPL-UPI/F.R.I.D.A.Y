<?php

namespace App\Modules\Academic\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicPeriod extends Model
{
    protected $fillable = ['code', 'name', 'semester', 'academic_year', 'start_date', 'end_date', 'is_active'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }
}
