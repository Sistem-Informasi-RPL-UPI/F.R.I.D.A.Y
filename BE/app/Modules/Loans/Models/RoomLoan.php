<?php

namespace App\Modules\Loans\Models;

use App\Models\User;
use App\Modules\Facilities\Models\Room;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomLoan extends Model
{
    protected $fillable = [
        'user_id',
        'room_id',
        'purpose',
        'start_at',
        'end_at',
        'attendee_count',
        'status',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'attendee_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
