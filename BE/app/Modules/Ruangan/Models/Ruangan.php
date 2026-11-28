<?php

namespace App\Modules\Ruangan\Models;

use Illuminate\Database\Eloquent\Model;

class Ruangan extends Model
{
    protected $table = 'ruangan';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'urutan',
        'kode',
        'label',
        'gedung',
    ];

    /**
     * Exact 37 rooms from PRD Lampiran A and MAP JADWAL GANJIL 2023-2024_kosong.xlsx.
     *
     * @return array<int, array{id: int, urutan: int, kode: string, label: string, gedung: string}>
     */
    public static function defaultRooms(): array
    {
        $gedungB = [
            'B2.002', 'B2.006', 'B2.007', 'B3.001', 'B3.002', 'B3.006',
            'B3.007', 'B4.001', 'B4.002', 'B4.006', 'B5.000', 'B5.001',
            'B5.002', 'B5.005', 'B5.006', 'B5.007', 'B5.008', 'B5.009',
        ];

        $gedungE = [
            'E3.000', 'E3.001', 'E3.002', 'E3.003',
        ];

        $smartClassAndLab = [
            ['kode' => 'F1.001', 'label' => 'SMART CLASS'],
            ['kode' => 'E2.005', 'label' => 'LABKOM RPL'],
            ['kode' => 'E2.001', 'label' => 'LABKOM PGSD'],
            ['kode' => 'A3.006', 'label' => 'LABKOM MULTIMEDIA'],
            ['kode' => 'E1.004', 'label' => 'LAB ROBOTIKA'],
            ['kode' => 'F1.003', 'label' => 'LAB IPA'],
            ['kode' => 'D1.001', 'label' => 'LAB. IPS'],
            ['kode' => 'D1.002', 'label' => 'Ruang Kajian PGPAUD'],
            ['kode' => 'D1.003', 'label' => 'LAB. PGPAUD'],
            ['kode' => 'D1.004', 'label' => 'LAB. BAHASA'],
            ['kode' => 'D1.005', 'label' => 'LAB. Matematika'],
            ['kode' => 'D1.006', 'label' => 'R. Kuliah Lab. Matematika'],
            ['kode' => 'A3.012', 'label' => 'LAB. Inovasi Teknologi dan Media Digital'],
            ['kode' => 'A3.011', 'label' => 'LAB. Studio Foto'],
            ['kode' => 'A3.010', 'label' => 'LAB. AUDIO'],
        ];

        $rows = [];
        $no = 1;

        foreach ($gedungB as $kode) {
            $rows[] = [
                'id' => $no,
                'urutan' => $no,
                'kode' => $kode,
                'label' => 'Ruang Kelas',
                'gedung' => 'Gedung B',
            ];
            $no++;
        }

        foreach ($gedungE as $kode) {
            $rows[] = [
                'id' => $no,
                'urutan' => $no,
                'kode' => $kode,
                'label' => 'Ruang Kelas',
                'gedung' => 'Gedung E',
            ];
            $no++;
        }

        foreach ($smartClassAndLab as $lab) {
            $rows[] = [
                'id' => $no,
                'urutan' => $no,
                'kode' => $lab['kode'],
                'label' => $lab['label'],
                'gedung' => 'Smart Class & Lab',
            ];
            $no++;
        }

        return $rows;
    }

    public static function ensureSeeded(): void
    {
        if (static::query()->count() >= 37) {
            return;
        }

        foreach (static::defaultRooms() as $room) {
            static::query()->updateOrCreate(['id' => $room['id']], $room);
        }
    }
}
