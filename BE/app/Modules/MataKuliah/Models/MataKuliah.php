<?php

namespace App\Modules\MataKuliah\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MataKuliah extends Model
{
    protected $table = 'mata_kuliah';

    protected $fillable = [
        'prodi',
        'kode',
        'nama',
        'sks',
        'semester',
        'kelas',
        'kode_dosen_1',
        'kode_dosen_2',
        'raw_dosen_1',
        'raw_dosen_2',
        'kebutuhan_ruang',
        'status_antrean',
        'source_file',
        'parked_reason',
    ];

    protected function casts(): array
    {
        return [
            'sks' => 'integer',
        ];
    }

    public function segments(): HasMany
    {
        return $this->hasMany(JadwalSegmen::class, 'mata_kuliah_id')->orderBy('segmen_ke');
    }
}
