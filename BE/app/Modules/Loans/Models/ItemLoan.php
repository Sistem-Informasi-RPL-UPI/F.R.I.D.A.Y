<?php

namespace App\Modules\Loans\Models;

use App\Models\User;
use App\Modules\Facilities\Models\Item;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemLoan extends Model
{
    protected $fillable = [
        'user_id',
        'item_id',
        'quantity',
        'purpose',
        'borrowed_at',
        'due_at',
        'returned_at',
        'status',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'borrowed_at' => 'datetime',
            'due_at' => 'datetime',
            'returned_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
