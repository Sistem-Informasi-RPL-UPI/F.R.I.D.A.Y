<?php

namespace App\Modules\Facilities\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Room extends Model
{
    protected $fillable = [
        'building_id',
        'code',
        'short_code',
        'name',
        'floor',
        'room_number',
        'capacity',
        'room_type',
        'facilities',
        'is_bookable',
        'is_schedulable',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'floor' => 'integer',
            'room_number' => 'integer',
            'capacity' => 'integer',
            'facilities' => 'array',
            'is_bookable' => 'boolean',
            'is_schedulable' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }
}
