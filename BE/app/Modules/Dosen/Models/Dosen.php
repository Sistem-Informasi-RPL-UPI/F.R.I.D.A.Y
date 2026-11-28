<?php

namespace App\Modules\Dosen\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Dosen extends Model
{
    protected $table = 'dosen';

    protected $fillable = [
        'kode',
        'nama',
        'status',
    ];

    public function ketersediaan(): HasOne
    {
        return $this->hasOne(KetersediaanDosen::class, 'kode_dosen', 'kode');
    }
}
