<?php

namespace App\Modules\Penjadwalan\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanWaktu extends Model
{
    protected $table = 'pengaturan_waktu';

    protected $fillable = [
        'durasi_sks',
        'mulai_pagi',
        'istirahat',
        'mulai_pagi_jumat',
        'mulai_siang_jumat',
        'last_audit',
    ];

    protected function casts(): array
    {
        return [
            'durasi_sks' => 'integer',
            'istirahat' => 'integer',
            'last_audit' => 'array',
        ];
    }

    public static function current(): self
    {
        $row = static::query()->first();
        if ($row !== null) {
            return $row;
        }

        return static::query()->create([
            'durasi_sks' => 50,
            'mulai_pagi' => '07:00',
            'istirahat' => 60,
            'mulai_pagi_jumat' => '07:00',
            'mulai_siang_jumat' => '13:00',
        ]);
    }
}
