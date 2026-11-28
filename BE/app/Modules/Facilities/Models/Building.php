<?php

namespace App\Modules\Facilities\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Building extends Model
{
    protected $fillable = ['code', 'name', 'floor_count', 'description', 'is_active'];

    protected function casts(): array
    {
        return [
            'floor_count' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }
}
