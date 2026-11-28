<?php

namespace App\Modules\Dosen\Models;

use Illuminate\Database\Eloquent\Model;

class KetersediaanDosen extends Model
{
    protected $table = 'ketersediaan_dosen';

    public const DEFAULT_DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];

    public const DEFAULT_START_TIME = '07:00';

    public const DEFAULT_END_TIME = '18:00';

    protected $fillable = [
        'kode_dosen',
        'hari',
        'start_time',
        'end_time',
        'is_custom',
    ];

    protected function casts(): array
    {
        return [
            'hari' => 'array',
            'is_custom' => 'boolean',
        ];
    }
}
