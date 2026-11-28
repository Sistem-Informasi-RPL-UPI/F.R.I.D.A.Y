<?php

namespace App\Modules\Facilities\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $fillable = [
        'code',
        'name',
        'category',
        'description',
        'total_stock',
        'available_stock',
        'condition',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'total_stock' => 'integer',
            'available_stock' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
