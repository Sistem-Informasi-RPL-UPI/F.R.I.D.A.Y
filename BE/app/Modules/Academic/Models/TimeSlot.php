<?php

namespace App\Modules\Academic\Models;

use Illuminate\Database\Eloquent\Model;

class TimeSlot extends Model
{
    protected $fillable = ['day_of_week', 'slot_order', 'start_time', 'end_time', 'label', 'is_break', 'is_active'];

    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
            'slot_order' => 'integer',
            'is_break' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
