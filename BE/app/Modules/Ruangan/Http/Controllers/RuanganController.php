<?php

namespace App\Modules\Ruangan\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ruangan\Models\Ruangan;
use Illuminate\Http\JsonResponse;

class RuanganController extends Controller
{
    public function index(): JsonResponse
    {
        Ruangan::ensureSeeded();

        $rooms = Ruangan::query()
            ->orderBy('urutan')
            ->get(['id', 'urutan', 'kode', 'label', 'gedung']);

        return response()->json([
            'data' => $rooms,
        ]);
    }
}
