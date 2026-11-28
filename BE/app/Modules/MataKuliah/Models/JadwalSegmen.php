<?php

namespace App\Modules\MataKuliah\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JadwalSegmen extends Model
{
    protected $table = 'jadwal_segmen';

    protected $fillable = [
        'mata_kuliah_id',
        'segmen_ke',
        'hari',
        'ruangan_id',
        'pos_awal',
        'panjang',
    ];

    protected function casts(): array
    {
        return [
            'mata_kuliah_id' => 'integer',
            'segmen_ke' => 'integer',
            'ruangan_id' => 'integer',
            'pos_awal' => 'integer',
            'panjang' => 'integer',
        ];
    }

    public function mataKuliah(): BelongsTo
    {
        return $this->belongsTo(MataKuliah::class, 'mata_kuliah_id');
    }
}
